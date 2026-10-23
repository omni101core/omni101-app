# Assistente

## Scopo

OMNI ASSIST guida nel sito e, nel workspace, legge i record del ruolo. Non è un riquadro che esegue azioni da solo. Il lead nasce solo dopo conferma, consenso e Turnstile, e il server rivalida tutto.

## File

- `apps/web/app/server/assistant.ts`
- `apps/web/app/components/assist/OmniAssist.tsx`
- `apps/web/app/components/assist/assist.css`
- Intake che l'assistente può solo innescare: `apps/web/app/server/api.ts` `intake`, `apps/web/app/server/intake-workflow.ts`

## API

- `GET/POST/DELETE /api/assistant` e `GET /api/assistant/conversations`.
- Modo `public` o `internal`. Il pubblico identifica il visitatore con il cookie `__Host-omni_assist` (7 giorni, HttpOnly, Secure, SameSite=Strict). L'interno usa l'utente autenticato.
- Output validato: testo, al più 5 card, 8 voci di checklist, 5 azioni. Schema diverso se il modo è interno e se il ruolo può creare task.
- Tool nominati in `assistantToolRegistry`: navigazione su una allowlist, brief, `submit_lead` verso `/api/intake`, lettura workspace, proposta di task. La creazione del task in UI passa da `POST /api/records/tasks` dopo conferma (`OmniAssist.tsx`), non da un effetto del modello.
- Destinazioni pubbliche: le quattro famiglie, commerce, workflow, creative, vision, work, insights, start-project. Elenco in `publicDestinations`.
- Destinazioni interne: `/admin` e le sottopagine lead, projects, tasks, proposals, approvals, agents, agent-runs, settings.

Chiamata modello: NVIDIA, `response_format` json_schema, timeout 25 s, `max_tokens` 1400. Senza chiave il percorso non completa. `usage.costCents` nella risposta dell'assistente è `0` nel codice, qualunque sia il listino.

## Dati

`assistant_conversations`, `assistant_messages` (`0004_assistant.sql`). Si tengono 30 messaggi. Scadenza: setting `assistant_retention_days`, altrimenti 7 (pubblico) e 30 (interno). Il contesto interno per proposals è limitato ai ruoli OWNER, ADMIN, PROJECT_MANAGER, SALES, FINANCE. Il budget agente in lettura è solo OWNER, ADMIN, FINANCE. Liste da 12 righe.

## Test

`tests/assistant.test.ts` (confini dei tool, persistenza, privacy). `tests/assistant-lead.test.ts` (`submit_lead` passa da `/api/intake`). `public.spec.ts` ultimo test: il brief arriva su `/start-project` e il POST intake intercettato non parte da solo. `tests/e2e/assist-mobile.spec.ts`: su viewport stretto il trigger non interseca i comandi cinema visibili, nemmeno col focus da tastiera o con movimento ridotto, e lo screenshot finisce in `test-results`.

## Stato

Parziale, 2026-10-22. L'assistente interno con UI generativa ampia è SPEC-15, dopo SPEC-06. Oggi ci sono lettura di record, navigazione e task confermato. Non c'è un agente che clicca il workspace al posto della persona. 2026-10-23: su viewport fino a 700px il trigger pubblico è più compatto. Se in pagina c'è l'esperienza cinema e il movimento è consentito, sale sopra la barra dei capitoli; con movimento ridotto quella barra non è in pagina e il trigger resta basso. Il nome accessibile resta «OMNI ASSIST».

## Decisioni

Il messaggio del cliente è dato non fidato: il prompt di intake lo dice esplicitamente (`intake-workflow.ts`). Niente budget, scadenze o promesse dedotte dal modello. La proposta preliminare è un JSON con scope, esclusioni, assunzioni, tempi, piano.

## Trappole

- Aggiungere una route all'allowlist senza metterla in `publicDestinations` o `internalDestinations` la fa scartare da `validateAssistantOutput`.
- Scrivere un lead dalla chat, senza `/api/intake`, salta Turnstile e consenso.
- Il cookie assistente non è la sessione. Non usarlo per autorizzare un CRUD.
- Cronologia pubblica e interna sono isolate per `owner_hash` e `mode`.
- Non abbassare di nuovo `.omni-assist-launch` sotto i 700px quando in pagina c'è `.cinema-experience`: la barra capitoli occupa il fondo dello stage e il trigger la copre. La posizione alta vale solo con `prefers-reduced-motion: no-preference`. Il foglio è `apps/web/app/components/assist/assist.css`, dell'assistente, non un foglio condiviso del sito.

## Chi lo possiede ora

SPEC-06 per l'assistente pubblico che crea il lead. SPEC-15 per il copilot interno, non iniziata nella mappa del 22/10 alle 15:40.

## Collegamento al riallineamento — 2026-10-22 sera

Catalogo navigabile esteso a voce, Avatar Studio e Software Lab, con limiti espliciti. Assistente interno e palette comandi includono campagne, growth plan, produzioni creative e abbonamenti. Contesto sempre da query fisse con organization_id; costi abbonamenti soltanto OWNER/ADMIN/FINANCE. Nessuna nuova azione automatica di pubblicazione o spesa.

### Memoria operativa — 23 ottobre, codice da verificare

Contesto interno esteso a knowledge_records (12 estratti limitati, ID/fonte/stato/versione e collegamenti); solo su richieste relative a mandati/reference/decisioni/memoria. Nessuna esposizione al pubblico. Prompt richiede citazioni e distinzione tra catturato/pianificato/implementato/verificato. Route autorizzate estese a Knowledge e Growth. Test provider mock controlla separazione pubblico/interno; nessuna nuova scrittura autonoma.
