# Checkpoint coordinatore (staffetta Grok)

Aggiornato: 2026-10-23 17:20. Coordinatore: Grok (staffetta da Opus). Mandato complessivo: PARTIAL. Lock: `/tmp/omni101-deleghe/staffetta.lock`.

## Produzione
- LIVE `01805108` (run 39962720977), health OK. Nessuna release nuova riuscita oggi, finché la run di questa staffetta non è verde.
- Repo locale avanti rispetto al live: S1, S3, S4, S4k (card trascinabile: corpo `div`, «Apri» piccolo), `GET /api/calendar`, listino 0012 + UI catalogo con `role` da admin. Non ancora pubblicati.
- Blocco precedente (drag, run 39973963479) integrato da S4k. Prossimo comando: `cloud-verify.py` staging, poi `omni-delega ci`, poi `--release` solo se verde.

## Lavori (registro `/tmp/omni101-deleghe/registro.jsonl`)
| Task | Esecutore | Stato | Azione dopo |
|---|---|---|---|
| S4k drag kanban | Cursor | INTEGRATO (KanbanBoard.tsx, admin.css) | nella run staging |
| W-calendario | OpenCode | INTEGRATO + riga `api.ts` | nella run staging |
| P1a/P1b listino | OpenCode | INTEGRATO (0012, pricing.ts, PricingCatalog, role in admin) | esito P1a ancora il vecchio NOT_DONE: il codice in copia è quello integrato |
| UX1–UX5 | OpenCode glm/deepseek | lanciati, file disgiunti | integra solo con esito e diff |
| UX6 workspace | Cursor grok-4.5-high | lanciato su admin.tsx+admin.css | non sovrascrivere il drag né `role` |
| UX-portale | Cursor | già nel repo (nessun diff residuo) | chiuso |
| U1 audit | Grok | FATTO, slice lanciate | — |
| W-email | Goose | FATTO, non copiato in docs | salvare in `docs/operativo/` |
| T8/T9 | OpenCode | T8 ancora vivo a 17:15; T9 processo morto senza esito | non reinstallare senza esito |
| Publisher | — | non lanciato | dopo gate verdi |

## Decisioni aperte del founder
1. Repo pubblico (mandati visibili): voluto?
2. Deroga separazione compiti con un solo Owner?
3. Testata preventivi solo ricorrenti.
4. P.IVA/telefono per aziende e lead.
5. Grok ha `permission_mode = "always-approve"` nella config globale: confermare.

## Strumenti
`~/.omni101/bin/omni-delega/omni-delega.py`: quote, lancia (opencode run / kilocode run --pure / `cursor agent` / `grok`), ci, integra, consumi. Lezioni: `~/omni101/00-Control-Plane/istruzioni/lezioni/lezione-2026-10-23-deleghe-cli.md`.

## Rollback
Codice `01805108`; migrazioni additive, non cancellare tabelle.
