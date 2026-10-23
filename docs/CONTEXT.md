# OMNI101 — contesto breve

Aggiornato: 2026-10-23.

Questo file resta l'ingresso storico. Lo stato per area è in `docs/STATO.md`. L'indice per una AI nuova è `docs/README.md`. Le regole sono in `AGENTS.md`.

L'app viva è `apps/web`: React Router 7 in SSR su un Worker Cloudflare, D1, due Workflow. Repo locale `~/omni101/01-Projects/active/omni101-app`, branch `reinvenzione-2026-10`. Durante la ripresa del 22/10 non si fanno commit locali.

`src/` e `worker/` sono il sito Astro precedente. `scripts/cloud-verify.py` non li pubblica. `docs/SEO-CHECK-free.md` descrive quel build, non il Worker.

ceo-os non si tocca. Produzione `https://omni101.app` si aggiorna solo dal branch `release-commercial`, dopo CI verde e ok del founder. Staging: `https://preview.omni101.app`.

Disco Data sotto il 15% libero: niente `npm install`, build o Playwright sul Mac. La verifica è il job in `.github/workflows/verify.yml`, e solo per chi ha il permesso nella propria spec.

Non leggere `~/.omni101/state/omni101-app/`. Non stampare token. Non eseguire `scripts/refresh-deploy-auth.py`.

Il mandato completo resta `docs/MASTER-CONTRACT.md` (non si modifica da SPEC-23). La nota dell'upgrade di stamattina resta `docs/UPGRADE-EXECUTION.md`.

Ripresa corrente e dati locali/staging: ultime sezioni di `docs/operativo/ripresa.md`. Inventario funzionale e criteri di chiusura: `docs/operativo/dashboard-checklist.md`. Il backlog è stato popolato sul D1 locale e staging, non dedurlo per produzione.

Mandati del 23/10 preservati in docs/mandati/ con hash. Vertical slice locali SEO/marketing/privacy (0008) e Knowledge (0009) in verifica; non confondere working tree e live. Dettagli nei rispettivi moduli.

Inventario allegati ora esteso a sei originali ancora accessibili. Catalogo verificato localmente con sola SQLite in memoria: 21 record/versioni e 12 task, senza duplicati. Import cloud da confermare nella CI.
