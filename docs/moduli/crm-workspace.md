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

Parziale, 2026-10-23. Il CRUD e il kanban ci sono. Il centro della card è un `div.os-card-body` trascinabile; «Apri» è un button piccolo. Così il drop arriva a `onMove`. Non ci sono, nel file `admin.tsx`: Gantt, commenti, menzioni, presenza. Inbox e calendario operativo restano risorse (`notifications`, `activities`). Vista unica date: `GET /api/calendar` (modulo revenue).

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

## Intake Express e attribuzione osservata

`/start-project` ha due percorsi sullo stesso `POST /api/intake`: racconto completo (messaggio ≥ 20 caratteri) ed Express (nome, email, messaggio ≥ 5, consenso; `express:true`). Turnstile, consenso e rate limit valgono per entrambi. Express è marcato in `leads.classification.intake` e nell'audit `INTAKE_RECEIVED`. Al submit il client manda `attribution` (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, dominio del referrer esterno); il server tiene solo valori ≤ 200 caratteri con caratteri sicuri (altri scartati, il lead passa) e li salva in `leads.attribution` (JSON compatto, migrazione `0014_lead_attribution.sql`, additiva). È attribuzione osservata: dice da dove arriva la richiesta, non cosa l'ha causata. Cattura solo sulla pagina del form: UTM persi se l'utente naviga prima. Test: `tests/lead-attribution.test.ts`, `tests/e2e/intake-express.spec.ts`.

## Ruoli e template — 2026-10-24

`ROLE_TEMPLATES` e `templateScope` in `apps/web/app/server/auth.ts` (REC-018): 18 template (Owner, Admin, Sales, Marketing, PM, Developer, Creative, Finance, Support, Client Owner/Admin/Member, Reviewer, Partner/Reseller, Contractor, Service Account, AI Agent, Workflow Identity) sopra i nove ruoli base. Restringono, non aggiungono; matrice completa in `docs/sicurezza.md`. Nessuna migrazione, `invite` e `api.ts` invariati: il workspace continua a ragionare sul ruolo base. Test `tests/role-templates.test.ts`: AI Agent e Workflow Identity sono strettamente dentro lo scope dell'Owner che li avvia; i template cliente non vedono risorse interne né spese e abbonamenti. Trappola: `CAPABILITIES` copia i `requireRole` esistenti; se ne cambi uno, cambia anche la tabella (il test ne controlla due).

## Command palette

Ctrl+K o ⌘K, o il pulsante «Cerca ovunque» (`Ricerca globale`) nella barra. File: `apps/web/app/components/workspace/CommandPalette.tsx`. Stili in coda a `apps/web/app/styles/admin.css`. Test: `tests/e2e/command-palette.spec.ts`. Nessun endpoint nuovo.

Cerca, in quest'ordine: azioni, pagine admin (nav già passata da `admin.tsx`), poi i record. Pagine e azioni restano tutte. I record sono al massimo 40: il resto si raggiunge stringendo la parola.

| Sezione | Lettura | Apertura |
| --- | --- | --- |
| Pagine | nav del workspace | path della voce, es. `/admin/leads` |
| Lead | `GET /api/records/leads` | `/admin/leads?record=<id>` |
| Progetti | `GET /api/records/projects` | `/admin/projects?record=<id>` |
| Clienti | `GET /api/records/clients` | `/admin/clients?record=<id>` |
| Workflow | `GET /api/workflows` | `/admin/automations?record=<id>` |
| Agenti | `GET /api/agents` (`agents` o `records`) | `/admin/agents?record=<id>` |

Azioni vere, solo navigazione: «Nuovo lead» → Richieste, «Nuovo progetto» → Progetti, «Nuovo cliente» → Clienti, «Nuovo workflow» → Automazioni. La scheda si crea col pulsante Nuovo già sulla pagina (il workflow si salva nel builder). «Nuovo agente» e «Tool MCP» stanno in lista con la scritta «non disponibile»: nella shell non c'è creazione agente né un endpoint MCP. Non partono.

Permessi: li applica l'endpoint. 401 o 403 → quella sezione dice «non autorizzato». Altro fallo (rete o status diverso) → «errore» e «Riprova», senza mescolarlo al divieto.

Stati: «Ricerca in corso…»; «Nessun risultato per …» solo a caricamento finito e lista vuota; errore con Riprova. Tastiera: frecce, Invio, Esc (chiude e rimette il focus dov'era). `<dialog>.showModal()` fa il focus trap. Ruoli: `dialog` + `aria-modal`, combobox sull'input, listbox/option sulle righe. Il bottone della riga ha `tabIndex={-1}` così Tab non entra nei risultati; il clic resta un bottone, come in `tests/e2e/workspace.spec.ts`.

Trappola: `automations` in `load()` di `admin.tsx` azzera `records`. `?record=` su un workflow arriva all'URL ma questa shell non apre il grafo. Lead, progetti, clienti e agenti sì: l'effetto `record` in `admin.tsx` apre il dialog della scheda.

## Centro operativo — UX 24/10

`OperationsOverview.tsx`, stili in coda a `admin.css` (solo `.os-operations`). Nessun endpoint nuovo. Nessun numero previsto: conteggi e importi restano quelli di `GET /api/operations`.

Chi entra vede prima «Da affrontare adesso»: una frase con la prossima azione (prima attività, altrimenti prima approvazione, esecuzione da verificare, notifica, oppure il backlog). Poi la lista. Code, numeri e progetti stanno sotto.

Pulsanti con verbo e oggetto. «Prepara backlog operativo» è invariato (test `workspace.spec.ts`). «Ricarica il centro» ricarica `/api/operations`. Le righe: «Apri attività», «Apri approvazione», «Apri elenco esecuzioni» (l'elenco è `/admin/agent-runs`, non la scheda del run), «Apri pianificazione», «Segna come letta» con il nome. Il backlog resta 15 attività, 3 traguardi, 3 workflow in bozza, nessun agente avviato.

Stati pagina con `Feedback` (`ProductUI`): `loading` al primo carico, `pending` se un aggiornamento arriva con dati già visibili, `empty` se non arriva un payload, `error` con «Riprova» sull'ultima azione fallita (carica, prepara, segna letta). Liste vuote: `empty`. Vista finance senza permesso: `unauthorized`. I conteggi in lista dicono il tetto già noto (20 approvazioni, 30 notifiche), non uno storico.

Sotto i 480px la pagina è a colonna, la tabella va a capo, pulsanti e link del centro sono alti almeno 44px. `overflow-x: clip` sulla section, così a 375px non si allarga la pagina.

## Pipeline — UX 24/10

`KanbanBoard.tsx`. Stili in coda a `admin.css` (solo `.os-pipeline-board` / `.os-kanban`). Nessun endpoint nuovo. Nessun numero previsto: i conteggi sono i record già passati al board. Il nome accessibile della colonna resta il codice stato (`aria-label={status}`), così `tests/e2e/workspace.spec.ts` trova la region `ACTIVE` e `REVIEW`.

Chi entra vede prima «Da fare ora»: la prima scheda della prima fase che ne ha una (ordine di `statuses`, poi stati presenti solo sui record). La frase dice nome e fase, e la mossa: aprire la scheda, poi «Sposta fase» o trascinare. Sola lettura: la stessa scheda si apre, lo spostamento dice «non disponibile». Pipeline vuota: la frase lo dice, senza un pulsante finto.

Pulsanti con verbo e oggetto. «Apri scheda» apre la scheda (in cima porta il nome). «Sposta fase» è l'elenco a tendina, valore ancora il codice. Senza permesso di scrittura il pulsante è «Sposta non disponibile» e non parte. Il trascinamento resta il percorso col puntatore (Playwright `dragTo`).

Stati con `Feedback` (`ProductUI`): `loading` mentre uno spostamento è in corso («Spostamento in corso.»), `empty` se non c'è nessuna scheda («Nessuna scheda in pipeline.»), `error` se `onMove` rifiuta, con «Riprova» sulla stessa mossa. Il testo dell'errore è il messaggio ricevuto, altrimenti «Spostamento non riuscito.». Una fase senza schede ha la riga «Nessuna scheda in questa fase.»: non è un `Feedback`, così non si aggiunge un `role="status"` per ogni colonna vuota. `empty` non ha Riprova: in questo componente non c'è un ricarica.

Conteggi: stesso filtro delle card (`status` vuoto conta come `NEW`), con la parola «scheda/schede». Le etichette italiane coprono solo gli stati lead già scritti sopra in questo file. Gli altri codici (per esempio `ACTIVE`, `REVIEW`) restano il codice, anche nelle opzioni della tendina.

Sotto i 480px le fasi vanno in colonna, `min-width` delle colonne a zero, `overflow-x: clip` sul board. Pulsanti, tendina e «Riprova» alti almeno 44px. A 375px il board non impone lo scroll orizzontale.
