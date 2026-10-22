# OMNI101 — contesto breve

Aggiornato: 2026-10-22.

Questo file resta l'ingresso storico. Lo stato per area è in `docs/STATO.md`. L'indice per una AI nuova è `docs/README.md`. Le regole sono in `AGENTS.md`.

L'app viva è `apps/web`: React Router 7 in SSR su un Worker Cloudflare, D1, due Workflow. Repo locale `~/omni101/01-Projects/active/omni101-app`, branch `reinvenzione-2026-10`. Durante la ripresa del 22/10 non si fanno commit locali.

`src/` e `worker/` sono il sito Astro precedente. `scripts/cloud-verify.py` non li pubblica. `docs/SEO-CHECK-free.md` descrive quel build, non il Worker.

ceo-os non si tocca. Produzione `https://omni101.app` si aggiorna solo dal branch `release-commercial`, dopo CI verde e ok del founder. Staging: `https://preview.omni101.app`.

Disco Data sotto il 15% libero: niente `npm install`, build o Playwright sul Mac. La verifica è il job in `.github/workflows/verify.yml`, e solo per chi ha il permesso nella propria spec.

Non leggere `~/.omni101/state/omni101-app/`. Non stampare token. Non eseguire `scripts/refresh-deploy-auth.py`.

Il mandato completo resta `docs/MASTER-CONTRACT.md` (non si modifica da SPEC-23). La nota dell'upgrade di stamattina resta `docs/UPGRADE-EXECUTION.md`.
