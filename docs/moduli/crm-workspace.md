# CRM e workspace

## Scopo

Tenere contatti, aziende, lead, trattative e clienti, e la shell in cui i soci lavorano: panoramica, inbox, calendario, palette comandi, kanban dove la risorsa ha uno status.

## File

- `apps/web/app/routes/admin.tsx` — nav e CRUD generico. Sezioni: Workspace, Delivery, Intelligence, Studio.
- `apps/web/app/styles/admin.css`
- `apps/web/app/components/workspace/{KanbanBoard,CommandPalette,LeadConversion}.tsx`
- `apps/web/app/components/AuthGate.tsx`
- Schema risorse: `apps/web/app/server/schema.ts`
- CRUD: `records()` in `apps/web/app/server/api.ts`

Voci Workspace in `admin.tsx`: Panoramica `/admin`, Inbox, Lead, Contatti, Aziende, Trattative, Clienti.

## API

- `GET /api/session`
- `GET /api/dashboard` — conteggi. Le chiavi sono `newLeads`, `pipelineValueCents`, `activeProjects`, `pendingApprovals`, `blockedTasks`, `runningAgents`, `revenueCents`, `aiCostCents`.
- `GET/POST/PATCH /api/records/:risorsa` e `GET /api/records/:risorsa/:id`
- `GET /api/schema/:risorsa` — i campi tornano solo se il ruolo è in `write`.
- `GET /api/team`, `POST /api/team/:id/revoke` (revoca: solo chi `canManage`, cioè OWNER; motivo richiesto dalla UI, almeno 5 caratteri).
- Riferimenti nei form: `client_id`, `project_id`, `contact_id`, `company_id`, `lead_id` da `/api/records/...`; `owner_id` e `assignee_id` da `/api/team`.

Status lead: `NEW`, `AI_TRIAGE`, `QUALIFICATION`, `DISCOVERY`, `PROPOSAL_DRAFT`, `PROPOSAL_SENT`, `NEGOTIATION`, `WON`, `LOST`, `ON_HOLD`. Le trattative partono da `QUALIFICATION` e non hanno `NEW`.

## Dati

Tabelle `contacts`, `companies`, `leads`, `deals`, `clients`, `interactions`, `notes`, `activities`, `notifications`. Vedi `docs/dati.md`.

## Test

`tests/integration.test.ts` (`persistent business operations`, intake atomico). `tests/security.test.ts`. `tests/e2e/workspace.spec.ts` primo test: la board persiste, un errore torna indietro, la ricerca trova i record. Mobile di quello spec skippato nello storico ESITO-01. `tests/e2e/owners.spec.ts`: due Owner con passkey, un progetto salvato.

## Stato

Parziale, 2026-10-22. Il CRUD e il kanban ci sono. Non ci sono, nel file `admin.tsx` letto oggi: Gantt, timeline del contatto, filtri salvati, commenti, menzioni, presenza. Sono SPEC-13, in coda dopo SPEC-06. Inbox e calendario sono risorse (`notifications`, `activities`), non una casella di posta esterna.

`settings`, `automations` e `pipeline` in `load()` non chiamano `/api/records`: azzerano l'elenco. Pipeline e automazioni hanno pannelli propri (moduli progetti e workflow).

## Decisioni

Kanban: lo stato si PATCH-a e, se la risposta fallisce, la UI rimette lo status precedente (`moveRecord` in `admin.tsx`). Ricerca comandi: `CommandPalette.tsx` legge `/api/records/:risorsa` quando si apre.

## Trappole

- Una risorsa nuova va aggiunta in `resources` e nella nav. Senza la prima, l'API risponde 404. Senza la seconda, non si raggiunge.
- `write: []` non è un buco: è un divieto. Approvazioni e deliverable hanno i loro endpoint.
- Il CLIENT che apre `/admin` viene mandato a `/portal`. Non costruire schermate cliente dentro admin.
- `MOSTRA_PREZZI` del sito Astro non c'entra con i centesimi del CRM.

## Chi lo possiede ora

SPEC-06 ha la shell workspace. SPEC-13 (CRM tabella, timeline, filtri, drawer, collaborazione) è dopo SPEC-06, non risultava avviata alle 15:40 del 22/10.
