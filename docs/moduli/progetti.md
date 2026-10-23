# Progetti e consegna

## Scopo

Portare un lavoro da pianificazione a QA, consegna e manutenzione, con un cliente vero sull'altra porta.

## File

- `apps/web/app/server/pipeline.ts`
- `apps/web/app/components/workspace/ProjectPipeline.tsx`
- Voce nav `pipeline`, `projects`, `tasks`, `deliverables`, `issues` in `routes/admin.tsx`
- Migrazione `packages/db/migrations/0005_pipeline.sql`

## API

Tutte autenticate. Il portale richiede ruolo CLIENT con `clientId`.

- `POST /api/tasks/:id/request-qa`
- `POST /api/qa/:id/outcome`
- `GET /api/projects/:id/pipeline` — stadi `PLANNING`, `EXECUTION`, `QA`, `DELIVERY`, `MAINTENANCE`
- `POST /api/projects/:id/deliverables`
- `POST /api/deliverables/:id/deliver`
- `POST /api/portal/deliverables/:id/decision`
- `POST /api/portal/tickets`
- CRUD `projects`, `tasks`, `issues` via `/api/records/...`

Status progetto: `PLANNING`, `ACTIVE`, `REVIEW`, `COMPLETED`, `ON_HOLD`. Status task: `TODO`, `IN_PROGRESS`, `REVIEW`, `BLOCKED`, `DONE`. Priorità task obbligatoria: `LOW`, `NORMAL`, `HIGH`, `URGENT`.

Regole in `records()`: un task QA non si chiude con una PATCH di status; un task `DONE` vuole una descrizione; la consegna visibile al cliente dipende da `deliver`.

## Dati

`projects`, `tasks` (colonne `kind`, `qa_for`), `task_dependencies`, `task_assignments`, `milestones`, `deliverables` (`delivered_at`, `approved_by`, `approved_at`, `client_note`), `issues` (`client_id`, `created_by`, `priority`), `qa_reviews`, `pipeline_events`, `releases`.

`ProjectPipeline.tsx` legge progetti e clienti, avvia un task con PATCH `IN_PROGRESS`, e chiede il QA con `request-qa`. Se il progetto non ha `client_id`, il pannello dice che la consegna richiede un cliente.

## Test

`tests/agency-pipeline.test.ts`: QA, gate di consegna, portale. `tests/e2e/workspace.spec.ts`: «delivery pipeline runs from QA rejection to client approval and maintenance ticket». `tests/e2e/owners.spec.ts` secondo test: un cliente vede solo il proprio progetto.

## Stato

Parziale, 2026-10-22. Il giro QA → consegna → ticket c'è nel server e in uno spec e2e. Manca il Gantt e un albero file. `releases` è tabella, non una schermata trovata nella nav. ESITO-01, sulla CI rossa di mezzogiorno, segnava ancora il giro chiuso come non provato su quello SHA: lo spec c'è nel working tree di sera, la CI di questo tree non risulta lanciata da questa documentazione.

## Decisioni

La pipeline è un solo flusso con stadi espliciti, non quattro app. L'evento sta in `pipeline_events`. La notifica interna usa `notifications` (`notify` in `pipeline.ts`), non un provider email.

## Trappole

- Consegnare senza `client_id` non ha un destinatario nel portale. La UI lo dice; il server va lasciato così.
- Due QA `PENDING` sullo stesso task le blocca l'indice unico `uq_qa_pending`.
- Dipendenze: `task_dependencies` vieta un task che dipende da sé. Nessuna UI di Gantt le disegna.

## Chi lo possiede ora

SPEC-13 per Gantt, file e deliverable avanzati, dopo SPEC-06. Il server di pipeline è già nel tree condiviso: chi lo tocca aggiorna questo file.

## Pianificazione operativa — 2026-10-22 notte

Nuovo `/admin/planning`, API `/api/projects/:id/planning`, sottorisorse POST `dependencies` e `comments`. Tasks con inizio e stima minuti, milestone esistenti esposte nel CRUD. Ordinamento topologico/percorso critico e margine delle attività, senza AI e senza fingere un calendario delle persone. Dipendenze vincolate a stesso progetto/organizzazione, cicli e avvii prematuri bloccati anche da trigger SQLite. Versione condivisa del piano con claim atomico per modifiche concorrenti. Vincoli rimossi disattivati, non cancellati. Commenti attribuiti all'utente autenticato e idempotenti per requestId. Test `planning-algorithms`, `agency-pipeline` nuovi casi. Migrazione additiva 0007, verifica CI ancora da eseguire.

Identificativi URL: planning, pipeline e CRUD decodificano il segmento ID (errore 400 per encoding non valido). Necessario per ID stabili del backlog che contengono `:`; verifiche aggiunte al test di preparazione, incluse lettura piano/pipeline e modifica progetto con ID codificato.
