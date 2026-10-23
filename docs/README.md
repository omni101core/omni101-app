# OMNI101 — indice per chi ci mette mano

Aggiornato: 2026-10-23, sul working tree locale `~/omni101/01-Projects/active/omni101-app`, branch `reinvenzione-2026-10`, non committato.

OMNI101 qui è la piattaforma commerciale di [omni101.app](https://omni101.app): sito pubblico per acquisire clienti e workspace privato per gestire l'agenzia. Non è OMNI101 OS, non è ceo-os, non è il Control Plane. Il runtime vivo è `apps/web`: React 19, React Router 7 in SSR, un Worker Cloudflare, D1, due Workflow. `src/` e `worker/` sono il sito Astro precedente e non entrano nella pubblicazione descritta in `scripts/cloud-verify.py`.

## Cinque minuti, in quest'ordine

1. `AGENTS.md` — divieti e verifica. Poi questo indice.
2. `docs/STATO.md` — fatto, parziale, mancante, con data.
3. `docs/architettura.md` — cartelle, Worker, flussi.
4. Il modulo che stai per toccare, in `docs/moduli/`.
5. `docs/decisioni.md` e, se pubblichi, `docs/operativo/rilascio.md`.

## Mappa

| Documento | A cosa serve |
|---|---|
| `docs/STATO.md` | Stato per area. Sostituisce le sezioni di stato che stavano in `docs/CONTEXT.md`. |
| `docs/architettura.md` | Stack, cartelle, binding, flussi. |
| `docs/dati.md` | Tabelle D1 e migrazioni; `0006` registri studio, `0007` pianificazione (stato applicazione in STATO). |
| `docs/sicurezza.md` | Passkey, ruoli, header, rate limit, dove stanno i segreti. |
| `docs/brand.md` | Palette, font, voce. La regia motion è un documento a parte. |
| `docs/decisioni.md` | Registro datato. |
| `docs/operativo/rilascio.md` | CI, staging, produzione, rollback, token. |
| `docs/operativo/ripresa.md` | Come riprende una AI o il collaboratore: passaggio corrente, prove, blocchi e backlog. |
| `docs/operativo/dashboard-checklist.md` | Inventario operativo, lacune e criteri di chiusura del workspace. |
| `docs/operativo/qa.md` | Script di misura e soglie del 22/10. |
| `docs/moduli/*.md` | Un file per area: scopo, file, API, dati, test, stato, decisioni, trappole, proprietario. |

## Moduli

| Area | File |
|---|---|
| Sito pubblico | `docs/moduli/pubblico.md` |
| Regia motion | `docs/moduli/regia-motion.md` |
| Playground, Vision, voce | `docs/moduli/playground.md` |
| OMNI ASSIST | `docs/moduli/assistente.md` |
| CRM e workspace | `docs/moduli/crm-workspace.md` |
| Progetti e consegna | `docs/moduli/progetti.md` |
| Workflow | `docs/moduli/workflow.md` |
| Agenti e Mission Control | `docs/moduli/agenti-mission-control.md` |
| Portale cliente | `docs/moduli/portale-cliente.md` |
| Finanza | `docs/moduli/finanza.md` |
| Contenuti e media | `docs/moduli/contenuti-media.md` |
| Analytics e SEO | `docs/moduli/analytics-seo.md` |

## Documenti che restano e non si riscrivono da qui

- `docs/MASTER-CONTRACT.md` — mandato del 22/10. Non si modifica in questo lavoro.
- `docs/UPGRADE-EXECUTION.md` — nota dell'upgrade integrato di stamattina, commit `fcdbb73`, CI `39772792713`.
- `docs/SEO-CHECK-free.md` — controllo del 2026-10-02 sul build Astro in `dist/`. Non descrive `apps/web`.
- `docs/CONTEXT.md` — ingresso breve. Lo stato sta in `STATO.md`.

## Regola di questo albero

Chi cambia un'area aggiorna nello stesso lavoro il suo `docs/moduli/<area>.md` e, se la scelta non è ovvia, una riga in `docs/decisioni.md`. Un lavoro senza quel aggiornamento non è finito.

`scripts/cloud-verify.py` pubblica `apps/web`, `packages`, `.github/workflows`, `tests`, `docs/` (i file sopra 1 MB restano fuori) lo script `scripts/cloud-verify.py` e i file di root `package.json`, `vitest.config.ts`, `playwright.config.ts`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`. Prima di ogni push scansiona tutti i file di testo cercando segreti (chiavi, token, IBAN, URL con credenziali): se ne trova uno si ferma e stampa file, riga e regola, mai il valore. `--check` esegue solo la scansione, senza pubblicare. `src/` e `worker/` restano fuori.

## Mandati integrativi del 23 ottobre

Originali e provenienza: `docs/mandati/sources.json`. Product Excellence, integrazione qualità e Persistent Intelligence sono aggiunte al mandato storico, senza sovrascriverlo. Memoria prodotto: `docs/moduli/knowledge-intelligence.md`; acquisizione/privacy: `docs/moduli/analytics-seo.md`. Stato di pubblicazione sempre distinto da codice locale.

Revenue: docs/moduli/revenue.md. Contesto per dominio: `node scripts/project-context.mjs growth` (knowledge/frontend/security/release). Registro unico docs/operativo/agent-context.json, nessun framework o proxy nuovo. Gli ultimi due mandati sono preservati in originale nel manifest: ora 8 allegati.
