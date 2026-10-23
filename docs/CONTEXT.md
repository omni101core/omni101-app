# OMNI101 — contesto

23 ott 2026. App nel repo `omni101-app`. Runtime `apps/web` (React Router SSR, Worker, D1, Workflows). `src/` e `worker/` sono il sito Astro precedente. `MOSTRA_PREZZI` in `src/data/prezzi.ts` resta `false` e non governa `apps/web`.

Coordinatore: Grok. Nessun altro coordinatore modifica file finché il founder non lo richiama. Ingresso: `docs/operativo/checkpoint-opus-per-codex.md`. Stato verificato lì. Fonti: `docs/mandati/sources.json`. Backlog: `docs/operativo/mandate-backlog.json`.

Vincoli: niente commit git locale, niente `main`/DNS/Pages/ceo-os, niente lo script che rigenera il token CI, niente lettura dello stato locale dell'app. Publish solo `python3 scripts/cloud-verify.py` (`--check`, poi senza flag per staging, `--release` per produzione). CI con `omni-delega.py ci`. Sotto il 15% disco: niente npm, build o Playwright sul Mac. Classe A (auth, `api.ts`, publisher, scritture DB) non va ai modelli gratuiti. Repo pubblico: niente listino reale in `apps/`, `packages/`, `docs/`, `tests/`.
