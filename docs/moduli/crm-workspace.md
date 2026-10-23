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
- `PATCH /api/records/:risorsa/:id` accetta `expectedUpdatedAt` (ms, opzionale). Se non coincide con `updated_at` corrente: 409 `{error:"Record modificato da un altro socio. Ricarica.", current:<record>}`, nessuna scrittura e nessun audit. Se coincide, la risposta contiene anche il nuovo `updated_at`. Senza il campo il comportamento non cambia.
- `POST /api/records/contacts`: 409 `{error:"Possibile duplicato", duplicateId, resource:"contacts"}` se nella stessa organizzazione esiste un contatto con la stessa email (trim + minuscolo) o lo stesso telefono (solo cifre, almeno 6). Nessuna fusione. Aziende e lead non hanno email, telefono o partita IVA nello schema: nessun controllo finché non esiste una colonna (migrazione additiva da decidere).
- `GET /api/records/contacts/:id/timeline` e `/api/records/companies/:id/timeline`: `{items:[{type,id,title,status,at}]}` per `at` decrescente, massimo 100, solo la stessa organizzazione. Tipi emessi: `interaction`, `lead`, `deal` (dai contatti, per l'azienda dai suoi contatti) e `note` (note con `resource_type` uguale alla risorsa). `activity` non viene emesso: `activities` non ha legame con contatti o aziende. 403 per ruoli senza lettura, 404 se il record non c'è.
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

## Growth, Creative e Ops — 2026-10-22 sera

Migrazione additiva `0006_studio_operations.sql`: `campaigns`, `growth_plans`, `creative_jobs`, `subscriptions`. Quattro risorse nel CRUD e nella navigazione, schema validato, organizzazione e audit ereditati dal server. Campagne e growth scrivibili dai ruoli sales; produzioni anche DESIGNER; abbonamenti visibili e modificabili solo finance. Campi per obiettivo/pubblico/canale, funnel/email/SEO/misura, storyboard/varianti/diritti, costo e periodicità. Sono registri operativi: non inviano email, non pubblicano, non generano asset e non attivano abbonamenti. Test integrazione su persistenza, isolamento, enum e permessi. Tema workspace scuro predefinito, toggle nell'account e preferenza distinta dal pubblico.

## Centro operativo — 2026-10-22 notte

`OperationsOverview`, `/api/operations`: priorità scadenza/urgenza/data, avanzamento progetti, notifiche non lette e riconoscimento lettura, approvazioni e run problematiche. Calcoli sui record, senza AI. Finanza solo OWNER/ADMIN/FINANCE: incassi, crediti, spese pagate, costo AI separato; differenza parziale per progetto, non utile fiscale. Limiti delle liste dichiarati. Nuove viste `operations`, `planning`, `milestones`, `finance-overview`. Verifica separata su branch remoto `verify-commercial` per evitare il blocco noto delle credenziali deploy: stessi typecheck/test/build/browser, nessuna pubblicazione o migrazione remota.

## Continuità operativa — 2026-10-22 sera

`server/operating-backlog.ts`: preparazione esplicita Owner via `POST /api/setup/operating-backlog`, pulsante nel Centro operativo. ID stabili per organizzazione, insert senza sovrascrittura, batch atomico, audit. Progetto interno OMNI101, 15 task TODO, 3 milestone senza data promessa e 3 workflow DRAFT. Dipendenze iniziali conservate alle ripetizioni, anche se archiviate dopo la prima preparazione. Nessun incarico assegnato a utenti inesistenti: solo suggerimento agente nel brief. Non avvia run o servizi. Test in `agency-pipeline.test.ts`; modifica in attesa di nuova CI. Percorso di ripresa aggiornato in `docs/operativo/ripresa.md`.

Export CSV: celle testuali che iniziano con formule (`=`, `+`, `-`, `@`, anche dopo spazi) prefissate da apostrofo, per impedire esecuzione involontaria nei fogli di calcolo. Le esportazioni restano limitate ai record caricati e autorizzati.

23 ottobre: preparazione eseguita anche sul D1 staging dopo migrazioni, conteggi 15 task/3 milestone/3 workflow DRAFT. Tre task chiusi con prove e audit di verifica, nessuna sovrascrittura di dati cliente. Collaboratore Owner attivo con passkey solo in produzione, verificato via metadati: nessun nuovo invito duplicato. Ambiente staging distinto.

23 ottobre: il trace del test due Owner rilevava il secondo invito fermo con pulsante normale, nessun errore e nessuna verifica in corso: clic possibile sull'HTML SSR prima del collegamento degli eventi. AuthGate ora parte disabilitato con «Preparazione accesso…» e abilita login/registrazione soltanto dopo mount client. Nessun bypass della passkey, nessun retry del login e nessuna modifica alle identità. Il test con due Owner indipendenti rimane obbligatorio.
