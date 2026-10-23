# Checkpoint Opus per il rientro del coordinatore precedente

Aggiornato: 2026-10-23 16:05. Coordinatore: Opus (term_e5a19495). Publisher unico: Opus. Mandato complessivo: PARTIAL.

## LIVE / TESTED / PARTIAL

- **LIVE**: produzione `01805108595ba1bc21866bcc84825fae829792ff`, run 39962720977 verify+production verdi. Health `https://omni101.app/api/health` → revision esatta, database true, storage false (verificato 16:00).
- **TESTED in CI**: preventivatore (0011), review con motivo, portale isolato, import 11 originali.
- **PARTIAL**: 5 gruppi del backlog `IMPLEMENTED` su 22 (memory, seo, growth-privacy, adaptive-execution, revenue-foundation); 17 `PLANNED`. Pricing: catalogo, PDF, accettazione cliente, fatturazione mancanti.
- **Locale**: ancora f53 (127.0.0.1:4176). Da aggiornare dall'artefatto della run 39962720977, senza build sul Mac. Non fatto.

## Backlog dentro omni101.app

- Il seeder `scripts/seed-reviewed-context.mjs` fa solo `INSERT OR IGNORE`: dopo il primo import stati e descrizioni non si aggiornano. In produzione il backlog è fermo (es. pricing ancora TODO, tutti priority HIGH). Prova: codice del seeder, righe `insert('tasks',…)`.
- Fix in corso: S3 (sotto). Finché S3 non passa la CI, l'app non riflette lo stato reale.

## Operazioni attive

| Task | Owner / terminale | Modello / effort | File in ownership | Esito atteso |
|---|---|---|---|---|
| S1 pricing-hardening (6 punti review: autoapprovazione, testata 0 ricorrenti, overflow tasse, UPDATE condizionato, requestId per org, test portale) | Sonnet `term_85d9a3f6` | Sonnet 5.5, xhigh di sessione | `apps/web/app/server/api.ts`, `pricing.ts`, `routes/portal.tsx`, test pricing/approval/integration/security, `cloud-smoke.mjs`, `docs/moduli/preventivatore.md` | `/tmp/omni101-opus-20261023/S1-esito.md` |
| S3 backlog-sync (sync conservativo, priorità, gruppi atomici review) | Sonnet `term_868a2f70` | claude-sonnet-5-5 / medium | `scripts/seed-reviewed-context.mjs`, `docs/operativo/mandate-backlog.json`, `tests/seed-reviewed-context.test.ts`, `docs/moduli/knowledge-intelligence.md` | `/tmp/omni101-opus-20261023/S3-esito.md` |
| W2 test calculatePricing | OpenCode `term_6918a01e` | opencode/glm-5.3-flash-free, effort n/s | solo copia `/tmp/omni101-deleghe/W2-pricing-tests/in` | `/tmp/omni101-deleghe/W2-pricing-tests/esito.md` |

Contratti: `/tmp/omni101-opus-20261023/S1-pricing-hardening.md`, `S3-backlog-sync.md`, `/tmp/omni101-deleghe/W2-pricing-tests/spec.md`. Gate e pseudonimizzatore: `/tmp/omni101-opus-20261023/bin/` (copie locali, nessuna installazione globale).

Chiusi/non da ripetere: OpenCode registro (term_75adebd3) NOT_DONE per 504; Kilo scan scartato (falsi positivi); Grok review pricing ok ma lanciato always-approve e ha letto `api.ts` (classe A): non ripetere.

## Prossima azione (comando)

1. Leggere gli esiti S1/S3/W2, diff file per file; W2 riportato nel repo solo dopo S1 (stesso `pricing.ts`).
2. `python3 scripts/cloud-verify.py --check` → poi `python3 scripts/cloud-verify.py` (rebuild-commercial = staging) → run verde → `python3 scripts/cloud-verify.py --release`. Health a SHA esatto.
3. Dopo la release: aggiornare il locale dall'artefatto (S2, Sonnet), poi CONTEXT/STATO/ripresa.

## Rollback

Codice precedente `01805108` (o f53). Migrazioni additive: non cancellare tabelle per tornare indietro.

## Blocchi

- Docs-only senza CI: non possibile con il publisher attuale (ogni push = verify+deploy).
- Orca: `--worktree path:/tmp/...` → `selector_not_found`; usare `orca terminal create` + `cd`.
- Grok via `xai-oauth`: condizioni sui dati NOT_VERIFIED, solo dati pubblici.
