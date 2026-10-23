# OMNI101 — contesto

23 ott 2026. App nel repo `omni101-app`. Runtime `apps/web` (React Router SSR, Worker, D1, Workflows). `src/` e `worker/` sono il sito Astro precedente. `MOSTRA_PREZZI` in `src/data/prezzi.ts` resta `false` e non governa `apps/web`.

Coordinatore: Codex App, richiamato dal founder il 23 ottobre. Grok ha confermato il passaggio e termina la verifica staging già attiva prima del checkpoint; nessun nuovo push concorrente. Ingressi: `docs/operativo/coordinamento-codex-2026-10-23.md` e `docs/operativo/checkpoint-opus-per-codex.md`. Stato verificato nei checkpoint. Fonti: `docs/mandati/sources.json`. Backlog: `docs/operativo/mandate-backlog.json`.

Vincoli: niente commit git locale, niente `main`/DNS/Pages/ceo-os, niente lo script che rigenera il token CI, niente lettura dello stato locale dell'app. Publish solo `python3 scripts/cloud-verify.py` (`--check`, poi senza flag per staging, `--release` per produzione). CI con `omni-delega.py ci`. Sotto il 15% disco: niente npm, build o Playwright sul Mac. Classe A (auth, `api.ts`, publisher, scritture DB) non va ai modelli gratuiti. Repo pubblico: niente listino reale in `apps/`, `packages/`, `docs/`, `tests/`.

Live verificato23ott: c7e70e6/run40005444493 (154server110browser14skip), email/motion pubblicate. Prossimo pacchetto builder workflow separato in revisione, non inferire il live dal working tree.

Ultimo live verificato:5808a6ef1f9eafe8deabadbde63b81317ed5aeeb/run40007650626 SUCCESS154server114browser18skip. Builder workflow punti1–3 online. Nessun worker sorgente attivo; audit mission4–5 e overlay mobile residui.

23 ott 22:30: Codex App fermo per quota sessione; coordinamento e publisher tornano a Opus finché Codex non rientra. Nuovo mandato founder "Master Mandate Reconciliation & Autonomous Execution" conservato privatamente (sha256 7954d17a…, puntatore MemPalace art_20261023T202925_ecb9930ef28e), non copiato nel repo. Matrice: `docs/operativo/requirement-coverage.json` (engine) + `mandate-reconciliation-findings.json` (51 finding clausole) + `requirement-evidence.json` (48 gruppi).

24 ottobre01:10: Opus ha consegnato punto sicuro /tmp/omni101-deleghe/opus-to-codex-20261024.md. Codex App unico coordinatore/publisher, monitor OMNI101 Opus fermati. Working tree include C1calendario non nello snapshot3af1af4; G5CRM solo copia, da rivedere. Nuovi originali ProductExcellence24 eCommerce preservati privatamente; import Knowledge/task sicuro in preparazione. Stato e rilascio da verificare, nessuna sovrascrittura o attivazione economica.
