#!/usr/bin/env python3
"""Smoke di produzione dopo release. Solo GET, solo stdlib.

Uso: python3 prod-smoke.py [--base https://omni101.app] [--sha SHA]
Esce con 1 se almeno un controllo e' FAIL. WARN non blocca.
"""
import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from urllib.parse import urljoin, urlparse

UA = "omni101-prod-smoke/1.0"
TIMEOUT = 20
MAX_BODY = 5_000_000
SITEMAP_LIMIT = 60

# Pagine pubbliche da controllare (route pubbliche di routes.ts, onda 1).
PAGES = [
    "/", "/en", "/en/offers/ai-landing", "/en/offers/local-desk", "/offerte",
    "/work", "/en/work", "/studio", "/start-project", "/solutions", "/privacy",
]
# Pagine non ancora rilasciate: 404 = WARN, non FAIL.
PENDING = {"/en", "/en/offers/ai-landing", "/en/offers/local-desk",
           "/offerte", "/en/work", "/en/studio"}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """Non seguire i redirect: un 302/308 e' un risultato da vedere."""

    def redirect_request(self, *args, **kwargs):
        return None


OPENER = urllib.request.build_opener(NoRedirect)
RESULTS = []
HTML = {}  # path -> html per i controlli incrociati


def get(url):
    """GET. Ritorna (status|None, headers, body bytes, secondi)."""
    req = urllib.request.Request(url, method="GET",
                                 headers={"User-Agent": UA, "Accept": "*/*"})
    t0 = time.monotonic()
    try:
        with OPENER.open(req, timeout=TIMEOUT) as r:
            body = r.read(MAX_BODY)
            return r.status, dict(r.headers), body, time.monotonic() - t0
    except urllib.error.HTTPError as e:
        body = e.read(MAX_BODY) if e.fp else b""
        return e.code, dict(e.headers or {}), body, time.monotonic() - t0
    except Exception as e:  # rete, DNS, timeout
        return None, {}, repr(e).encode(), time.monotonic() - t0


def add(check, target, level, detail="", secs=None):
    RESULTS.append({
        "check": check, "target": target, "level": level, "detail": detail,
        "ms": None if secs is None else round(secs * 1000),
    })


def hreflangs(html, base):
    """Mappa lingua -> URL assoluto dai <link rel=alternate hreflang>."""
    out = {}
    for tag in re.findall(r"<link\b[^>]*>", html, re.I):
        attrs = dict((k.lower(), v) for k, v in re.findall(r'(\w[\w-]*)="([^"]*)"', tag))
        if attrs.get("rel", "").lower() == "alternate" and "hreflang" in attrs:
            out[attrs["hreflang"].lower()] = urljoin(base + "/", attrs.get("href", ""))
    return out


def same_path(url, want):
    p = urlparse(url).path.rstrip("/") or "/"
    return p == want


def check_health(base, sha):
    st, _, body, secs = get(base + "/api/health")
    if st != 200:
        return add("health", "/api/health", "FAIL", f"HTTP {st}", secs)
    try:
        j = json.loads(body)
    except ValueError:
        return add("health", "/api/health", "FAIL", "JSON non valido", secs)
    if j.get("status") != "ok" or j.get("database") is not True:
        return add("health", "/api/health", "FAIL",
                   f"status={j.get('status')} database={j.get('database')}", secs)
    rev = j.get("revision")
    if sha:
        if rev == sha:
            add("health", "/api/health", "PASS", f"revision={rev} = atteso", secs)
        else:
            add("health", "/api/health", "FAIL", f"revision={rev} != atteso {sha}", secs)
    else:
        add("health", "/api/health", "PASS",
            f"revision={rev} (nessun --sha, non confrontata)", secs)
    if j.get("emailLinks") is False:  # absent on builds that predate the field: no warning there
        add("health", "/api/health", "WARN",
            "EMAIL_LINK_SECRET non impostato: il link di disiscrizione risponde 503", secs)


def check_page(base, path):
    st, _, body, secs = get(base + path)
    if st is None:
        return add("page", path, "WARN" if path in PENDING else "FAIL",
                   f"rete: {body[:120].decode('utf-8', 'replace')}", secs)
    if st != 200:
        if st == 404 and path in PENDING:
            return add("page", path, "WARN", "404: non ancora rilasciata", secs)
        return add("page", path, "FAIL", f"HTTP {st}", secs)
    add("page", path, "PASS", "HTTP 200", secs)
    html = body.decode("utf-8", "replace")
    HTML[path] = html

    if path.startswith("/en"):
        m = re.search(r'<html[^>]*\blang="([^"]+)"', html, re.I)
        lang = m.group(1) if m else ""
        if not lang.lower().startswith("en"):
            add("html-lang", path, "FAIL", f"lang='{lang}', atteso en")

    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.S | re.I)
    if not m or "OMNI101" not in m.group(1):
        add("title", path, "FAIL", "title senza OMNI101")

    blocks = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',
                        html, re.S | re.I)
    if not blocks:
        add("json-ld", path, "FAIL", "JSON-LD assente")
    else:
        bad = []
        for b in blocks:
            try:
                json.loads(b)
            except ValueError as e:
                bad.append(str(e)[:80])
        if bad:
            add("json-ld", path, "FAIL", "parse: " + "; ".join(bad))
        else:
            add("json-ld", path, "PASS", f"{len(blocks)} blocchi")

    for bad_word in ("localhost", "preview.omni101.app"):
        if bad_word in html:
            add("leak", path, "FAIL", f"'{bad_word}' nell'HTML")


def check_hreflang(base):
    if "/" not in HTML:
        return add("hreflang", "/ <-> /en", "FAIL", "home non raggiungibile")
    if "/en" not in HTML:
        return add("hreflang", "/ <-> /en", "WARN",
                   "/en non rilasciata: reciprocita' non verificabile")
    en_ref = hreflangs(HTML["/"], base).get("en")
    if not en_ref or not same_path(en_ref, "/en"):
        return add("hreflang", "/ -> /en", "FAIL", f"en={en_ref}")
    back = hreflangs(HTML["/en"], base)
    it_ref = back.get("it") or back.get("x-default")
    if it_ref and same_path(it_ref, "/"):
        add("hreflang", "/ <-> /en", "PASS", "reciproci")
    else:
        add("hreflang", "/en -> /", "FAIL", f"it={it_ref}")


def check_robots(base):
    st, _, body, secs = get(base + "/robots.txt")
    if st != 200:
        return add("robots", "/robots.txt", "FAIL", f"HTTP {st}", secs)
    text = body.decode("utf-8", "replace")
    if not re.search(r"^Sitemap:\s*\S+", text, re.M | re.I):
        return add("robots", "/robots.txt", "FAIL", "manca Sitemap", secs)
    if re.search(r"^Disallow:\s*/\s*$", text, re.M):
        return add("robots", "/robots.txt", "FAIL", "Disallow: / (blocca tutto)", secs)
    add("robots", "/robots.txt", "PASS", "con Sitemap", secs)


def check_sitemap(base):
    st, _, body, secs = get(base + "/sitemap.xml")
    if st != 200:
        return add("sitemap", "/sitemap.xml", "FAIL", f"HTTP {st}", secs)
    try:
        root = ET.fromstring(body)
    except ET.ParseError as e:
        return add("sitemap", "/sitemap.xml", "FAIL", f"XML: {e}", secs)
    locs = [e.text.strip() for e in root.iter() if e.tag.split("}")[-1] == "loc" and e.text]
    if not locs:
        return add("sitemap", "/sitemap.xml", "FAIL", "nessun <loc>", secs)
    add("sitemap", "/sitemap.xml", "PASS", f"{len(locs)} URL", secs)
    host = urlparse(base).netloc
    for u in locs[:SITEMAP_LIMIT]:
        if urlparse(u).netloc != host:
            add("sitemap-url", u, "FAIL", f"host non atteso ({urlparse(u).netloc})")
            continue
        st2, _, _, s2 = get(u)
        if st2 == 200:
            add("sitemap-url", u, "PASS", "HTTP 200", s2)
        else:
            add("sitemap-url", u, "FAIL", f"HTTP {st2}", s2)
    if len(locs) > SITEMAP_LIMIT:
        add("sitemap", "/sitemap.xml", "WARN",
            f"{len(locs) - SITEMAP_LIMIT} URL oltre il limite di {SITEMAP_LIMIT} non controllate")


def check_llms(base):
    st, _, _, secs = get(base + "/llms.txt")
    if st == 200:
        add("llms", "/llms.txt", "PASS", "HTTP 200", secs)
    else:
        add("llms", "/llms.txt", "WARN", f"HTTP {st}", secs)


def main():
    ap = argparse.ArgumentParser(description="Smoke di produzione (solo GET).")
    ap.add_argument("--base", default="https://omni101.app")
    ap.add_argument("--sha", default=None, help="revision attesa da /api/health")
    args = ap.parse_args()
    base = args.base.rstrip("/")
    if "preview.omni101.app" in base:
        print("rifiutato: host di preview non ammesso", file=sys.stderr)
        return 2

    check_health(base, args.sha)
    for p in PAGES:
        check_page(base, p)
    check_hreflang(base)
    check_robots(base)
    check_sitemap(base)
    check_llms(base)

    counts = {"PASS": 0, "WARN": 0, "FAIL": 0}
    for r in RESULTS:
        counts[r["level"]] += 1

    print(f"{'LIVELLO':<6} {'CONTROLLO':<14} {'TARGET':<42} {'MS':>6}  DETTAGLIO")
    for r in RESULTS:
        ms = "" if r["ms"] is None else str(r["ms"])
        print(f"{r['level']:<6} {r['check']:<14} {r['target'][:42]:<42} {ms:>6}  {r['detail']}")
    print()
    summary = {"base": base, "sha_atteso": args.sha, "counts": counts,
               "esito": "FAIL" if counts["FAIL"] else "OK", "results": RESULTS}
    print(json.dumps(summary, ensure_ascii=False, indent=1))
    return 1 if counts["FAIL"] else 0


if __name__ == "__main__":
    sys.exit(main())
