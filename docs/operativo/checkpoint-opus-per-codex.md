# Checkpoint coordinatore — registro operativo

Aggiornato: 2026-10-23 22:45. Coordinatore e publisher: Opus. Il coordinatore app precedente è fermo per quota di sessione: quando rientra riprende da questo file. Mandato in corso: "Master Mandate Reconciliation & Autonomous Execution", originale privato (sha256 7954d17a…, puntatore MemPalace `art_20261023T202925_ecb9930ef28e`).

## Stato

- LIVE `5808a6ef1f9eafe8deabadbde63b81317ed5aeeb`, run `40007650626` verde. Health: database true, storage false.
- STAGING `6c5aa50`: contiene il lavoro non pubblicato del coordinatore precedente (dashboard copertura requisiti, controlli Mission Control, builder, fix mobile assistente di Grok) più le prime modifiche R1. Due run rosse corrette: typecheck `RequirementCoverage.tsx`, script `reconcile-requirements.mjs` assente dal publisher, test anonimo 503/401. Run in corso.
- Nessuna release finché staging non è verde e R1 non ha consegnato l'esito.

## Matrice requisiti (fonte unica)

- `docs/operativo/requirement-coverage.json`: engine (8392 blocchi sorgente, 84 gap, copertura semantica non ancora stabilita).
- `docs/operativo/mandate-reconciliation-findings.json`: 51 finding a livello clausola (10 high).
- `docs/operativo/requirement-evidence.json`: 48 gruppi con stato di implementazione e stato operativo separati.
- `docs/operativo/mandate-backlog.json`: backlog che arriva in app; in riallineamento (R3).

## Worker attivi (registro `/tmp/omni101-deleghe/registro.jsonl`)

| Task | CLI / modello | Finding | File | Esito |
|---|---|---|---|---|
| R1 intake Express + attribuzione | Sonnet medium, nel repo (classe A) | REC-014, REC-017 | start.tsx, api.ts, 0014, tests/lead-attribution, e2e intake-express | `/tmp/omni101-deleghe/r1-intake-attribution/esito.md` |
| R2 editor workflow | Grok | REC-008 | WorkflowBuilder.tsx, e2e workflow-builder, moduli/workflow.md | copia filtrata |
| R3 backlog riallineato | OpenCode glm free | REC-003/004/006/015-021/025/032/037 | mandate-backlog.json | copia filtrata |
| R4 catena commerciale E2E | OpenCode deepseek free | REC-005 | tests/commercial-chain.test.ts | copia filtrata |
| R5 stati primitive UI | Cursor grok-4.5-high | REC-026 | ProductUI.tsx, admin.css (append), brand.md | copia filtrata |

Pool xAI: Grok + Cursor = 2, al massimo. Da qui non si lancia altro sul pool finché uno dei due non chiude.

## Prossimi blocchi (in ordine)

1. Staging verde, poi integrare R1–R5, staging, release.
2. Gruppi nuovi dal backlog R3: finance-operations, workflow-builder-editor, playground-labs, client-factory, customer-feedback.
3. Ruoli granulari (REC-018) e protezioni per le operazioni critiche dell'Owner (REC-030): classe A, a Sonnet.
4. Soglie di performance (REC-029) e scenari A–G come acceptance separate (REC-011).

## Decisioni che spettano al founder

- R2/storage: autorizzare R2 (piano e tetto di costo) oppure un'alternativa (REC-007). Gli asset binari restano bloccati fino alla decisione.
- Copy canonica della home: negli originali ci sono tre varianti (REC-024).
- Dati legali: titolare, DPA e retention per le pagine legali (REC-023).
- Ancora aperte da prima: repo pubblico, deroga con un solo Owner, testata dei preventivi ricorrenti, P.IVA/telefono, `always-approve` di Grok.

## Regole di questo turno

- Con un worker classe A nel repo: niente push finché non esiste il suo esito (lezione 23/10 22:40).
- Classe A (api.ts, auth, publisher, DB) solo a Sonnet/Opus; Cursor e Grok sul resto; i gratuiti solo su copie filtrate.
- Rollback: Worker precedente `6ec03776-8508-424b-88ed-69fdb09f3330` / live `5808a6e`. Migrazioni solo additive.
