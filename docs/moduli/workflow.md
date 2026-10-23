# Workflow

## Scopo

Definire un grafo, validarlo, eseguirlo sul lead vero con Cloudflare Workflows, fermarsi dove serve una persona.

Il playground `/explore/workflow` non è questo modulo. È una simulazione pubblica.

## File

- `apps/web/app/server/workflow-runtime.ts`
- `apps/web/app/components/workspace/WorkflowBuilder.tsx`
- Classe `AgencyWorkflow` in `apps/web/workers/app.ts`
- `packages/db/migrations/0003_workflows.sql`
- Nav admin: voce `automations` (il `load` non lista i record; il builder chiama le API da solo)

## API

Ruoli: OWNER, ADMIN, PROJECT_MANAGER. Le scritture controllano `Origin`.

- `GET/POST /api/workflows` — elenco (max 100) e salvataggio. Il GET include `starterGraph` e `nodeKinds`.
- `POST /api/workflow-runs` — crea una run. `dryRun: true` valida e non esegue. Senza dry run il definition deve essere `ACTIVE`.
- `GET /api/workflow-runs` e `GET /api/workflow-runs/:id`
- `POST /api/workflow-runs/:id/resume` — stati ripristinabili: `AWAITING_APPROVAL`, `FAILED`, `QUEUED`, `DISPATCH_FAILED`. Se è in attesa, serve un'approvazione `APPROVED` con id `runId:nodo`.
- `POST /api/workflow-runs/:id/cancel` — in `mission.ts`.
- `POST /api/lead-to-project` e `POST /api/workflows/convert-lead` — stessa funzione `approveToProject`.

`nodeKinds`: `TRIGGER`, `AI_INTAKE`, `CONDITION`, `TRANSFORM`, `CREATE_TASK`, `CREATE_PROPOSAL`, `SEND_NOTIFICATION`, `HUMAN_APPROVAL`, `END`.

Vincoli di `validateGraph`: da 2 a 30 nodi, 1–60 archi, id `[a-zA-Z0-9_-]{1,64}`, un solo `TRIGGER`, almeno un `END`, niente cicli, ogni nodo raggiungibile dal trigger. Il salvataggio incrementa `version`. Una versione stantia risponde 409.

Idempotenza run: `UNIQUE(organization_id, idempotency_key)`.

`localInline` è vero solo se `AGENCY_WORKFLOW` manca e l'hostname di `PUBLIC_ORIGIN` è `localhost` o `127.0.0.1`: in quel caso parte `executeWorkflowRun`. Senza binding e senza quel caso la risposta è 503 «Runtime workflow non configurato.» e la riga resta `QUEUED`. Se il binding c'è e `create` fallisce senza un'istanza già viva, lo stato diventa `DISPATCH_FAILED` con errore «Avvio cloud non riuscito. Usa Riprova nel workflow.» e l'HTTP è 503 «Workflow salvato ma non avviato. Puoi riprovare dal dettaglio.»

## Dati

`workflow_definitions.steps` tiene il JSON del grafo. `workflow_versions` una riga per versione. `workflow_runs` copia il grafo al momento del lancio. `workflow_run_steps` uno step per nodo (`UNIQUE(run_id, node_id)`). Le tabelle `workflow_executions` e `workflow_events` sono il modello precedente a lista di step: la risorsa `automations` le legge ancora.

Grafo di partenza: trigger «Brief acquisito» → `AI_INTAKE` → `CREATE_PROPOSAL` → `HUMAN_APPROVAL` → `END`.

## Test

`tests/workflow.test.ts`: validazione, esecuzione persistita, conversione dopo approvazione, resume. `tests/approval-concurrency.test.ts`: una sola decisione vince. `tests/e2e/workspace.spec.ts`: builder versionato sul D1 di test. `tests/e2e/workflow-builder.spec.ts`: bozza nuova, valida/avvia sulla versione salvata, conflitto 409 e blocco dei controlli, con API mock. Il canary `tests/cloud-smoke.mjs` percorre il grafo sullo staging quando il job CI ci arriva.

## Stato

Parziale, 2026-10-22. Nove nodi, grafo aciclico, dry run, attesa umana, retry di dispatch. 2026-10-23: il builder distingue bozza nuova e versione salvata, blocca valida/avvia se la tela non coincide col salvataggio, e su 409 non sostituisce la bozza da solo. Il mandato chiede 18 nodi, branch/merge già in parte coperti da `CONDITION`, più loop, delay, error, subflow, email e HTTP esterni. Quegli ultimi il README di root li dichiara non disponibili, non simulati. SPEC-14 non era partita alle 15:40.

## Decisioni

Niente ciclo: il messaggio è «Cicli non supportati: usare un grafo aciclico.» L'email e lo schedule non si fingono con un nodo che non chiama nulla. `SEND_NOTIFICATION` scrive una notifica interna, non un SMTP.

## Trappole

- Senza `AGENCY_WORKFLOW` e con `PUBLIC_ORIGIN` non locale la run resta `QUEUED` e l'HTTP è 503 «Runtime workflow non configurato.». `DISPATCH_FAILED` arriva se il binding c'è e l'avvio cloud fallisce. Il resume è `POST /api/workflow-runs/:id/resume`, non un secondo insert.
- Due salvataggi concorrenti: il secondo prende 409. Il builder tiene nome, grafo e stato attivo locali. «Carica ultima versione» chiede conferma e solo allora sostituisce la bozza. Non ricarica da solo. «Nuovo workflow» e un altro salvato, se la bozza è sporca, chiedono conferma prima di scartarla. «Valida senza eseguire» parte solo se la tela coincide con la versione salvata. «Avvia esecuzione reale» in più richiede `selected.status===ACTIVE`. Durante la richiesta i controlli restano disabilitati.
- Convertire il lead due volte: `lead_project_links` restituisce il progetto già creato (`alreadyCreated`).
- Non collegare il demo pubblico a queste API.

## Chi lo possiede ora

Il runtime è nel tree. La correzione del 23 ottobre sul builder (bozza nuova, valida/avvia sulla versione salvata, 409 con conferma) è nel working tree e non fa parte della release corrente. SPEC-14 (18 nodi, loop, subflow, handoff) resta il seguito.

## Bozze iniziali — 2026-10-22 sera

Preparazione Owner dal Centro operativo: tre template persistenti DRAFT (discovery, creatività, consegna), ciascuno trigger manuale su lead verificato → approvazione umana → attività → fine. Grafo validato con lo stesso `validateGraph`, versione 1 registrata. Nessuna attivazione, pianificazione cron o invio esterno. Sono basi da modificare nel builder, non flussi completi di business. Ripetere conserva le definizioni già modificate. Verifica nuova CI ancora necessaria.
