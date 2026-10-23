# Dati

Schema in `packages/db/migrations/`. D1 applica quella cartella (`migrations_dir` in `wrangler.jsonc`). CI di test: `wrangler d1 migrations apply DB --local --env test`, poi `tests/owner-fixture.sql`. Staging e produzione applicano `--remote` nel job, ciascuna sul proprio database. I due id stanno in `wrangler.jsonc`; non vanno copiati nei messaggi.

Tempi in millisecondi epoch, salvo le date di scadenza scritte come `YYYY-MM-DD`. Gli importi sono centesimi interi.

## Migrazioni

| File | Cosa aggiunge |
|---|---|
| `0001_initial.sql` | Organizzazione, identità, CRM, progetti, finanza, contenuti, agenti, workflow lineari, audit, rate limit, analytics. |
| `0002_passkeys.sql` | `passkeys`, `auth_challenges`. |
| `0003_workflows.sql` | Versioni di grafo, run, step, legame lead→progetto. |
| `0004_assistant.sql` | Conversazioni e messaggi. |
| `0005_pipeline.sql` | Colonne su task, deliverable, issue, agent_runs. Tabelle `qa_reviews` e `pipeline_events`. |

`0005` è solo additiva. `tasks.kind` default `WORK`. Una review QA pending è unica per task (`uq_qa_pending`).

## Tabelle per dominio

Identità: `organizations`, `users`, `memberships`, `roles`, `permissions`, `invitations`, `sessions`, `passkeys`, `auth_challenges`. Il token di invito e il token di sessione si salvano come SHA-256 (`digest` in `auth.ts`). `auth_challenges.kind` è `REGISTER` o `LOGIN`.

CRM: `contacts`, `companies`, `leads`, `deals`, `clients`, `interactions`, `notes`, `activities`, `notifications`.

Progetti: `projects`, `tasks`, `task_dependencies`, `task_assignments`, `milestones`, `deliverables`, `issues`, `releases`, `qa_reviews`, `pipeline_events`. `projects.visibility` default `TEAM`. Il portale filtra `visibility='CLIENT'`.

Finanza: `quotes`, `quote_items`, `contracts`, `invoices`, `payments`, `expenses`. La risorsa HTTP `proposals` legge la tabella `quotes`.

Contenuti: `services`, `portfolio_items`, `content_entries`, `content_revisions`, `media_assets`, `attachments`. Il sito pubblico non legge queste tabelle per le pagine: i testi vivi sono `site-data.ts` e `capabilities.ts`. L'assistente, in modo pubblico, legge al più 6 `content_entries` con status `PUBLISHED`.

Agenti: `agent_definitions`, `agent_runs`, `agent_steps`, `agent_artifacts`, `agent_budgets`, `agent_tools`, `model_providers`. Il registro eseguito è il file `packages/agents/registry.ts` (16 voci), non un seed di `agent_definitions`.

Workflow: `workflow_definitions`, `workflow_executions`, `workflow_events` (modello a step JSON del primo schema); `workflow_versions`, `workflow_runs`, `workflow_run_steps` (grafo XYFlow). `lead_project_links` impedisce una seconda conversione dello stesso lead.

Assistente: `assistant_conversations` (`mode` `public` o `internal`, `owner_hash`), `assistant_messages` (ruolo `user` o `assistant`, al più 30 messaggi tenuti per conversazione).

Piattaforma: `approvals`, `audit_logs`, `settings`, `feature_flags`, `intake_keys`, `rate_limits`, `analytics_events`. La retention dell'assistente è il setting `assistant_retention_days`: se assente o fuori scala, 7 giorni pubblici e 30 interni (`assistant.ts`).

## Risorse HTTP

`resources` in `apps/web/app/server/schema.ts` è il catalogo di `/api/records/:nome` e `/api/schema/:nome`. Chiavi: `contacts`, `companies`, `leads`, `deals`, `clients`, `projects`, `tasks`, `proposals`, `contracts`, `invoices`, `expenses`, `services`, `portfolio`, `content`, `approvals`, `agent-runs`, `automations`, `media`, `calendar`, `inbox`, `issues`, `deliverables`.

Scritture: `sales` (OWNER, ADMIN, PROJECT_MANAGER, SALES) su CRM e preventivi; `managers` sui progetti e sui contenuti; FINANCE su contratti, fatture, spese; DEVELOPER e DESIGNER anche su task e issue. `approvals`, `agent-runs`, `automations`, `media`, `inbox`, `deliverables` hanno `write: []`: non si creano da quel CRUD. Il preventivo non passa a `APPROVED` con una PATCH: risponde 409 e manda al centro approvazioni. Contratto o fattura verso `APPROVED`, `RECORDED` o `PAID` richiedono OWNER o FINANCE. Un task `kind=QA` non si chiude cambiando status. Un task `DONE` senza descrizione risponde 400.

Ogni SELECT di record filtra `organization_id`. Il ruolo CLIENT aggiunge `client_id` e solo sulle risorse con `client: true`.

## Estensioni studio e pianificazione — 2026-10-22 sera

- `0006_studio_operations.sql`: campagne, piani crescita, lavorazioni creative e abbonamenti gestionali. Risorse del workspace, nessun invio esterno o addebito automatico.
- `0007_project_planning.sql`: `tasks.start_date`, `tasks.estimate_minutes`, `task_dependencies.active`, `project_plans` con versione e claim. Trigger per isolamento delle dipendenze, assenza di cicli e stati incompatibili. Rimozione dipendenza = `active=0`.
- `notes` già esistente usata per commenti progetto: ID richiesta idempotente, autore autenticato, organizzazione e progetto verificati. Nessuna nuova tabella commenti duplicata.
- Bootstrap Owner del backlog è un'azione separata dalle migrazioni: ID stabili per organizzazione, nessuna sovrascrittura di edit. Lo snapshot locale non è un seed automatico live e non crea identità.

Applicazione: migrazioni 0001–0007 presenti nel D1 isolato della preview locale. Per staging/produzione leggere STATO; non dedurre l'applicazione dal solo schema nel repository.

## Migrazioni locali successive: 0008 e 0009

0008 introduce suppression marketing con hash per organizzazione, evidenze di consenso attribuite/idempotenti e registro richieste privacy Owner/Admin. 0009 introduce knowledge_records e knowledge_revisions: testo/versioni/provenienza/riferimenti a fonte e task, visibilità team interno. Sono additive; applicazione remota da confermare con run CI. Nessuna tabella media binaria o servizio a pagamento.
