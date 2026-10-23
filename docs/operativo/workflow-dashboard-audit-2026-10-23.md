# Audit workflow dashboard

Sola lettura. Nessuna modifica al sorgente, nessun runtime, nessun provider. Baseline live `3adf682`. Email e motion restano al publisher. Non esiste un file `server/automation*`: la voce Automazioni è `WorkflowBuilder` su `/admin/automations`; il runtime è `apps/web/app/server/workflow-runtime.ts` (intake in `intake-workflow.ts`).

Confronto backlog, non riaperti: `connected-runtime` (canvas, runtime retriable, Approval Center, mission control, costo per run), `orchestration-dashboard`, `dashboard-ux` (palette), `crm-completion` (conversione lead→cliente→progetto), `intake`, `email-foundation`, `revenue-foundation`, `ops-inbox-support`, `analytics-kpi`.

## 1. «Nuovo workflow» salva sopra quello aperto

- File: `apps/web/app/components/workspace/WorkflowBuilder.tsx` riga 10. Il select chiama `load` solo se trova un id; l’opzione `Nuovo workflow` non azzera `selected`.
- Percorso: `/admin/automations` → scegliere un workflow salvato → «Nuovo workflow» → «Salva versione». Il POST riparte con `id` e `version` del workflow precedente.
- Correzione: se il valore è vuoto, `setSelected(null)`, ripristinare nome, `active` e `starterGraph`, senza inviare `id`.
- Backlog: non è l’editor canvas di `connected-runtime`.

## 2. Valida e Avvia guardano lo stato locale, il server la copia salvata

- File: stesso componente, riga 10. `execute` invia solo `definitionId`. «Avvia esecuzione reale» è abilitato con la checkbox `active`, non con `selected.status`.
- Server: `createWorkflowRun` in `workflow-runtime.ts` riga 12 valida `definition.steps` e rifiuta con 409 se lo stato salvato non è `ACTIVE`. Il dry-run risponde prima di quel controllo.
- Percorso: modificare un nodo e premere «Valida senza eseguire» (esito sulla versione già salvata); oppure spuntare «Attivo» senza «Salva versione» e premere «Avvia esecuzione reale» (409).
- Correzione: un bit dirty su tela, nome e checkbox; Valida e Avvia escono subito se dirty. Abilitare Avvia solo se `selected.status==='ACTIVE'`.
- Backlog: non è il runtime retriable di `connected-runtime`. Il dispatch del POST è già in `apps/web/app/server/api.ts` dopo `handleWorkflow`.

## 3. Il 409 di versione non ricarica il workflow aperto

- File: `WorkflowBuilder.tsx` riga 10 (`save` e `reload`) e `saveWorkflow` in `workflow-runtime.ts` riga 11 (`409`, testo che chiede di ricaricare).
- `reload` sostituisce il grafo solo se `selected` è nullo, e il mount lo chiama una volta.
- Percorso: due sessioni su `/admin/automations` dello stesso workflow; la seconda «Salva versione» resta in 409 a ogni nuovo tentativo.
- Correzione: su quel 409, rifare GET `/api/workflows` e `load` dell’id corrente prima di consentire un altro salvataggio.
- Backlog: nessun key descrive il conflitto di versione del builder.

## 4. «Riprendi» è premuto prima della decisione

- File: `WorkflowBuilder.tsx` riga 10 (bottone se `run.status==='AWAITING_APPROVAL'`) e `MissionControl.tsx` riga 67 (`canResume` → POST `.../resume`).
- Server: `resumeWorkflowRun` in `workflow-runtime.ts` riga 18 risponde 409 finché l’approvazione `runId:current_node` non è `APPROVED`. `workflowControls` in `apps/web/app/server/mission.ts` riga 20 accende `canResume` già in attesa.
- Percorso: `/admin/automations` dopo l’avvio, oppure `/admin/agent-runs` su un workflow in attesa → «Riprendi» / «Riprendi dopo approvazione».
- Correzione: non mostrare il bottone finché quella riga non è `APPROVED`. Lasciare il link a `/admin/approvals?record=` più l’id dell’approvazione.
- Backlog: non è l’Approval Center trasversale di `connected-runtime`; il centro in `/admin/approvals` c’è già.

## 5. L’artefatto del workflow apre la lista, non il record

- File: `MissionControl.tsx` riga 67, `to={artifact.route}`. Le route sono costanti senza query in `mission.ts` riga 48 (`/admin/tasks`, `/admin/proposals`, `/admin/approvals`, `/admin/inbox`).
- Percorso: `/admin/agent-runs` → esecuzione workflow con uno step che ha prodotto task, proposta o approvazione → clic sull’artefatto. La schermata admin legge `?record=` (come già fa il centro operativo), quindi il clic non apre il record.
- Correzione: aggiungere `?record=` e l’id già risolto. Nessuna route nuova.
- Backlog: i deep link di `ops-inbox-support` riguardano il centro notifiche, non questo link.

## Fuori da questo elenco

Nessun buco nuovo su palette, costi per run, canvas da costruire, invio email o attivazione provider. `LeadConversion` esiste solo per Owner/Admin e il nome progetto usa `approval.name` (`LeadConversion.tsx` riga 5): resta dentro il residuo già scritto di `crm-completion`, non è una sesta lacuna.

Ownership: Grok implementa solo punti1–3 e nuovo test dedicato; Codex revisiona e pubblica. La release c7e70e6 non contiene queste correzioni. Sul409 preservare sempre locale: caricamento ultima versione soltanto esplicito e con conferma se dirty.
