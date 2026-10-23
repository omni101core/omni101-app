# Knowledge & Intelligence

23 ottobre 2026. Nuova implementazione locale, non ancora verificata né pubblicata.

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
