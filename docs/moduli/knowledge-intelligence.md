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
