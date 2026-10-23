# Knowledge & Intelligence

## Riconciliazione requisiti — 24 ottobre 2026

La copertura persistente è `docs/operativo/requirement-coverage.json`, generata con `node scripts/reconcile-requirements.mjs`; `--check` ricalcola e rifiuta output obsoleto/modificato, originali con hash diverso, riferimenti fuori dal repository, file di prova assenti, dipendenze sconosciute e `VERIFIED` senza criteri, implementazione, test, release e motivazione. Nessun accesso di rete o modifica D1 nel generatore. Test regressione in `tests/requirement-coverage.test.ts`, da eseguire in CI; il solo check Node locale non sostituisce quei test.

Input canonici: `docs/mandati/sources.json` (originali pubblici), `agent-context.json.private_sources` (solo puntatori/hash privati), `mandate-backlog.json` (macrogruppi), `requirement-evidence.json` (prove revisionate delle slice) e `mandate-reconciliation-findings.json` (clausole/gap estratti). Il formato reale Opus `findings[]` usa `startLine/endLine`, criterio scalare, `gap/severity/dependencies`: viene normalizzato in requisiti consultabili. Anche i precedenti formati `requirements[]` e `semanticRequirements[]` sono riconosciuti. Formati sconosciuti sono errori, non zero requisiti silenziosi. Gli hash di `reviewedSources` devono coincidere con gli originali; `complete:true` attesta soltanto la lettura dichiarata, mai completezza semantica o funzionale.

La prima rigenerazione del 24/10 contiene 11 fonti pubbliche, 4 private, 8.392 blocchi originali, 51 clausole estratte e 60 macrogruppi. Restano 8.392 blocchi da revisione semantica: collegare una clausola non approva automaticamente i blocchi circostanti. Le prove dei macrogruppi non vengono ereditate dalle clausole; un test su una slice non dimostra tutto il gruppo. I 12 gruppi aggiunti senza prova specifica sono elencati in `summary.missingEvidenceGroups`, non promossi dallo stato del backlog. Conteggi aggiornati sempre nel JSON, non derivati dallo storico sotto.

Per restare sotto il limite publisher di 1 MB, i candidati conservano ID stabile basato su fonte+contenuto+occorrenza, alias fonte e intervallo righe; ereditano `candidateDefaults` (CAPTURED, UNKNOWN, reviewNeeded). I corpi originali non sono duplicati. `sources[].originalId` risolve gli alias pubblici. Le fonti private conservano esclusivamente artifact/hash: non vengono lette né copiate nel repository. Clausole e macrogruppi hanno campi espliciti. Gap: prima vincoli obbligatori CRITICAL/P0, poi gravità dichiarata; solo dimensioni numeriche revisionate producono `confidence*(value+dependency)`. Nessun punteggio inferito automaticamente.

La vista prodotto è in Knowledge (`RequirementCoverage`), tramite GET autenticato `/api/requirement-coverage`: soli ruoli interni, organizzazione autorizzata, pagine da 25 e filtri kind/source/q. L'API espande i default e normalizza alias/path; nessuna autorevisione o avvio agente. Controlli endpoint e browser sono del coordinatore, separati dai test del generatore. Finché la relativa release non è verificata, codice locale e matrice non equivalgono a pubblicazione.

Le sezioni successive preservano lo storico delle vertical slice.


23 ottobre 2026. Prima vertical slice online su omni101.app, revisione 3fa90a5, run 39889662855 interamente verde. Le sezioni seguenti preservano anche le tappe di costruzione; l’esito finale è in fondo.

## Confine e stato reale

Prima vertical slice: cattura di mandato/requisito/idea/decisione/reference/prompt/handoff/rischio/learning, ricerca testuale con filtri, collegamenti a fonte e task dello stesso tenant, versioni con autore, audit, ripristino come nuova bozza, esportazione JSON. La lista mostra al massimo 100 risultati e dichiara eventuali altri risultati; cronologia limitata alle 50 revisioni più recenti nella UI/API, originali conservati nel database.

Visibilità unica `TEAM_INTERNAL`: Owner, Admin, PM, Developer, Designer, Sales, Finance. Clienti esclusi. Non caricare qui documenti privati dei clienti: ACL per progetto e retention granulare non ancora implementati. Nessun allegato binario, nessun embedding, nessuna API o agente esterno collegato. Non sostituisce MemPalace/Funes/omni101-os come memoria degli operatori: è la memoria del prodotto commerciale.

## File e contratti

- `packages/db/migrations/0009_knowledge.sql`: record e snapshot immutabili delle revisioni; migrazione additiva.
- `apps/web/app/server/knowledge.ts`: GET/POST `/api/knowledge`; GET/PATCH `/api/knowledge/:id`.
- `apps/web/app/components/workspace/KnowledgeWorkspace.tsx`: `/admin/knowledge`.
- POST usa UUID e versione 0; PATCH richiede versione corrente e ritorna 409 in conflitto. Batch atomico di aggiornamento, revisione e audit. Ripetizione identica della creazione non duplica record.
- `VERIFIED` richiede criteri e prova; non equivale a verifica automatica o approvazione legale. Le idee restano CAPTURED; nessun task/agente avviato automaticamente.

## Fonti e copertura

Gli ultimi tre allegati sono preservati byte per byte in `docs/mandati/`, con SHA-256 e provenienza in `sources.json`. L'archivio non implica che tutti i requisiti siano implementati né che i testi siano già caricati nel D1. Le chat non effettivamente recuperate restano fonti da importare. Reference OpenHands e Sandbox sono proposte da valutare, non integrazioni attive.

Ancora da fare: importazione guidata Markdown/JSON con anteprima e redazione, caricamento dei mandati in D1, matrice di copertura aggregata completa, relazioni tipizzate e ricerca globale intermodulo, ACL per progetto, retention/export completo oltre 50 versioni, briefing programmati, calendario unificato, social publishing, libreria media. Non inventare API, licenze o costi dei provider. Nessun servizio a pagamento attivato.

## Verifica

Nuovi test integrazione: due Owner e attribuzione; versioni e originali; conflitto concorrente; idempotenza; ricerca; separazione tenant; clienti esclusi; fonte/task esterni respinti; verifica priva di prova respinta. Attendere run verde prima di chiamare questi controlli superati.

## Importazione revisionata e copilot (aggiunta successiva)

`scripts/seed-reviewed-context.mjs` verifica hash e importa in modo additivo tre mandati originali, 12 requisiti con task reali e 3 reference. Fonte del triage: `docs/operativo/mandate-backlog.json`. Attribuzione esplicita `system:founder-mandate-import`, audit con revisione CI; non attribuire l’import a un Owner umano. Record CAPTURED/PLANNED/IMPLEMENTED, mai VERIFIED per sola importazione. Insert-or-ignore preserva modifiche successive. Pipeline CI applica import in staging dopo deploy; produzione solo nel job release. `--dry-run` non muta dati; `--sql` consente revisione e verifica in memoria. Validato su SQLite con doppia applicazione: 18 record, 18 revisioni, 12 task, collegamenti coerenti. Questa prova non equivale all’applicazione remota.

Il copilot interno recupera al massimo 12 estratti di memoria con ID/fonte/stato/criteri/prova quando la richiesta riguarda mandati, reference o handoff; tratta il testo come dati non attendibili e deve citare provenienza e limiti. Il copilot pubblico non legge la memoria. Nessun embedding o agente autonomo nuovo.

### Inventario esteso prima del rilascio

Recuperati anche i tre allegati precedenti ancora accessibili: rebuild originario, specifica continuazione, riallineamento. Ora sources.json preserva **sei originali**, con hash e origine. Le istruzioni storiche restano dati e possono essere superate da quelle successive; non autorizzano esecuzioni automatiche. Import completo verificato in memoria con due applicazioni: **21 record/versioni** (6 mandati, 12 requisiti, 3 reference), **12 task**. Run a2cf057 contiene ancora i primi tre originali; il rilascio successivo deve verificare e importare il catalogo esteso.

Il recupero GET /api/knowledge/:id?version=1 rende l’originale consultabile anche oltre la finestra delle ultime 50 revisioni. UI: Recupera originale v1. Canary usa ID stabili del manifest e hash della prima revisione, così una modifica legittima del titolo/testo corrente non falsifica la prova di conservazione. La query versione è validata e mantiene il tenant. Gli export UI restano limitati alla cronologia recuperata, non sono backup completi del database.

## Esito finale

Run 39889662855 interamente verde: 102 server, 103 browser, 11 skip; staging e produzione pubblicati alla revisione 3fa90a5d323cd8273da6e1553b3816f97a35552d. Import CI in produzione confermato: 6 originali + 12 requisiti/task + 3 reference (21 elementi). Canary staging confronta gli hash degli originali v1, controlla fonti/task, esclude clienti e verifica marketing spento; sessioni QA revocate. UI cattura/salvataggio/ricaricamento/versione e UTM verificata con WebAuthn isolata. Immagini prova nella cartella visualizations della chat. Il triage dei 12 requisiti è iniziale, non una copertura completa di tutte le clausole: aggiornare contenuti storici tramite nuove revisioni attribuite, non sovrascrivendo snapshot o originali.

### Aggiornamento Adaptive / Revenue — 23 ottobre

Otto originali preservati, 15 requisiti/task e tre reference (26 elementi) importati in produzione e staging con CI 39950784094 verde. API/UI supportano originali fino a 60k caratteri; record e snapshot importati in query separate. Prova locale e canary cloud confermano hash degli otto originali, inclusa fonte Revenue da oltre40k, senza duplicati al replay. Script contestuale emette riferimenti per dominio e non modifica record o avvia agenti.

### Sync del backlog importato (23/10)
Lo script ora allinea anche stato, descrizione, priorità ed evidenza delle righe già importate, ma solo se nessuna persona le ha toccate. Criterio: `knowledge_records.updated_by='system:founder-mandate-import'` (ogni PATCH API lo sostituisce con l'utente, `apps/web/app/server/knowledge.ts`); per `tasks`, che non ha `updated_by`, `updated_at=created_at` (PATCH generico e pipeline bumpano sempre `updated_at`; il sync no, così la riga resta dell'importer). Task con dipendenze attive sono saltati. Ogni UPDATE è condizionato a un valore realmente diverso: la seconda run non modifica nulla. Knowledge: `version+1`, riga `knowledge_revisions` e `audit_logs` `MANDATE_CONTEXT_SYNCED`, tutti state-based (nessuna dipendenza da `changes()`). `mandate-backlog.json` accetta `priority` (HIGH/NORMAL/LOW, default HIGH), `evidence` e `origin` (docs/operativo/*.md, per gruppi non nati da un mandato). L'evidenza dei gruppi IMPLEMENTED non contiene più lo SHA, per non cambiare a ogni deploy. `--dry-run` stampa `syncStatements` (tetto massimo); `--sql` mostra gli UPDATE. Test: `tests/seed-reviewed-context.test.ts` (SQLite in memoria). Non applicato in staging/produzione da questo lavoro.
