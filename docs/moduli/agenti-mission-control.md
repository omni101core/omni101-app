# Agenti e Mission Control

## Scopo

Vedere esecuzioni vere: chi ha chiamato, quale modello, quali token, quali artefatti, quale decisione. Avviare un agente solo su un brief, dentro un budget.

## File

- `packages/agents/registry.ts` — 16 agenti, `tools: []`, `scope: authorized-brief-only`, `approvalLevel: HUMAN_REQUIRED`, `maxTokens: 1800`, `timeoutMs: 25000`, `retries: 0`.
- `apps/web/app/server/mission.ts`
- `apps/web/app/server/api.ts` funzioni `runAgent`, elenco agenti, dettaglio run, `decision` sulle approvazioni.
- `apps/web/app/components/workspace/MissionControl.tsx`
- Nav: `agents`, `agent-runs`, `approvals`.

Id nel registro: `receptionist`, `sales-qualifier`, `discovery-analyst`, `solution-architect`, `estimator`, `proposal-writer`, `project-manager`, `ux-designer`, `creative-director`, `frontend-engineer`, `backend-engineer`, `qa-engineer`, `security-reviewer`, `content-specialist`, `marketing-specialist`, `support-specialist`.

## API

- `GET /api/agents` — ogni voce ha status `CONFIGURED` se c'è `AI_API_KEY`, altrimenti `PROVIDER_REQUIRED`. Ruoli interni.
- `POST /api/agent-runs` — OWNER, ADMIN, PROJECT_MANAGER. Body: `agent_id` e `input.brief` 20–10000 caratteri. Rate limit 5 al minuto. Provider ammessi: `nvidia`, `openai`, `google`, con gli endpoint scritti in `runAgent`. 503 se manca chiave, provider o modello, o se i prezzi non sono numeri finiti non negativi. 409 se manca il budget o non copre la riserva.
- `GET /api/agent-runs/:id` — step, artefatti (senza il corpo intero: nome, kind, version, sha256, size), eventi, approvazioni.
- `POST /api/agent-runs/:id/cancel`
- `GET /api/mission-control`
- `GET /api/mission-control/workflow/:id`
- `POST /api/workflow-runs/:id/cancel`
- `POST /api/approvals/:id/decision` — OWNER o ADMIN, `APPROVED` o `REJECTED`, motivo 5–2000 caratteri. Il batch D1 reclama la riga `PENDING` alla versione osservata: una richiesta parallela non scrive né l'audit né il cambio.
- `POST /api/budgets` — solo OWNER. `limitCents` 0–100000.

`missionCapabilities`: `pause: false`, `cancel: true`, `retry: true`, `resume: true`. La pausa non ha una route. Il retry dell'agente è `POST /api/agent-runs/:id/retry` in `api.ts`: solo stati `FAILED` o `CANCELLED`, e 409 se esiste già un tentativo non fallito. Il resume del grafo è `POST /api/workflow-runs/:id/resume` nel modulo workflow. `controlsEnabled` è true solo per OWNER, ADMIN, PROJECT_MANAGER.

Una run agente è considerata stantia dopo `STALE_RUNNING_MS` = 10 minuti.

## Dati

`agent_definitions` (insert or ignore all'avvio, id `orgId:agentId`), `agent_runs` (anche `retry_of`), `agent_steps`, `agent_artifacts` (tetto 900 KiB, `r2_key` non usata finché non c'è il bucket), `agent_budgets`, `approvals`, `audit_logs`. `model_providers` e `agent_tools` sono tabelle del primo schema: il codice di avvio non le legge per scegliere il modello. Il modello è `env.AI_MODEL`.

## Test

`tests/mission-control.test.ts`. `tests/assistant.test.ts` copre anche 403 e 503 di confine. `tests/e2e/workspace.spec.ts`: Mission Control mostra run durevoli e cancella una run in attesa. `tests/approval-concurrency.test.ts`.

## Stato

Parziale, 2026-10-22. Senza segreto AI l'avvio è 503 e l'elenco dice `PROVIDER_REQUIRED`. L'artefatto sta in D1 (`content`), non in R2. Nessun tool è abilitato nel registro. SPEC-06 possiede Mission Control nel mandato; il codice c'è già nel tree.

## Decisioni

Scope solo brief. Nessun tool nel registro, così il modello non ha un'azione da chiamare. Costo: si riserva prima, si chiama dopo. Manca la riga di budget e non parte nulla.

## Trappole

- Aggiungere `openai` o `google` come `AI_PROVIDER` senza prezzi a zero e senza un budget coprente spende o risponde 409. Il default versionato è NVIDIA a prezzo 0.
- `retry: true` nel JSON di capability non è una route. Non documentarla come endpoint finché non c'è il `path.match`.
- Due decisioni sulla stessa approvazione: la seconda prende 409. È il comportamento voluto.
- Non seminare run o artefatti di clienti finti.

## Chi lo possiede ora

SPEC-06 (Mission Control, agenti, portale). Handoff automatici tra agenti: SPEC-14.
