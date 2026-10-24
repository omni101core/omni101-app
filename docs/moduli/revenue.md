# Revenue & Growth

23 ottobre 2026. Online e verificata: f53fe2c, run 39950784094 verde. Riusa CRM, campagne, task, iniziative, milestone, consensi e date già esistenti; nessuna seconda audience o copia del calendario.

## Funzionamento

`/admin/revenue`: campagne con ricerca/stato, creazione bozza e dettaglio; collegamento manuale di lead, attività attribuite e timeline. Qualificazione trasparente con checklist; agenda mensile derivata dalle date originali di campagne, growth plan, task, milestone ed eventi. Modificare la data nel registro originale aggiorna la vista senza sincronizzazioni duplicate.

Il punteggio misura esclusivamente completezza: fase 30, azione 15, responsabile 15, valore indicativo 20, contesto 20. Non misura persone o probabilità di acquisto. Prima le richieste più incomplete. Nessun LLM chiamato.

Migrazione 0010: campaign_links (natural key per idempotenza), revenue_events (UUID idempotente, MANUAL, schema_version 1 e autore). Eventi consentiti: nota, follow-up documentato, qualificazione registrata. Non simulano invii o conversioni. Entrambi i record collegati devono appartenere al tenant corrente.

## Contratti

- GET /api/revenue/overview: ultimi 100 campagne/lead, 500 link e 25 eventi con limiti dichiarati.
- GET /api/revenue/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD: massimo 93 giorni, 200 record per sorgente; date civili originali, non appuntamenti con timezone o scheduler.
- POST /api/revenue/links: campaignId, resourceType LEAD/TASK/GROWTH_PLAN/CREATIVE_JOB, resourceId; UI iniziale per lead.
- POST /api/revenue/events: UUID, campagna/lead, tipo e descrizione; repeat identico 200, collisione 409, audit atomico.
- Ruoli: OWNER/ADMIN/PROJECT_MANAGER/SALES. Clienti e Developer esclusi, tenant verificato lato server.

## Limiti

Email, social e Ads NOT_CONNECTED: nessun READY_FOR_CONNECTION prematuro, invio, pubblicazione, tracking, budget o ROAS inventato. Collegare un lead è un'associazione manuale, non prova di attribuzione del traffico. UI usa componenti nativi/esistenti e Radix; nessuna dipendenza nuova. Nessun dato sintetico di produzione.

Restano builder landing/funnel, composer email, segmenti dinamici, calendario day/week/month avanzato, scheduler, provider, eventi automatici di conversione e programmi partner. Originali nuovi in docs/mandati/sources.json, triage iniziale nel catalogo esistente.

## Verifica

Test integrazione: persistenza link/eventi, replay e collisioni, audit, completezza deterministica, date derivate, isolamento tenant/ruoli e intervalli validi. Browser autenticato: creare campagna, collegare lead, documentare attività, reload e agenda. Review indipendente read-only del nuovo handler/schema/UI: nessun finding azionabile; non sostituisce CI. Attendere una run verde e health revision prima di dichiararlo live.

Verifica visiva canary della prima pubblicazione 76d17bd: lo stile legacy `.os-inline-actions button` rendeva trasparente lo sfondo del bottone primario mantenendo testo scuro. Corretto con contenitore azioni Revenue dedicato e header responsive; aggiunta asserzione browser del contrasto effettivo >=4.5, risalendo al background visibile degli antenati. Non basta che il click sia tecnicamente possibile. Patch CSS in verifica successiva, schema e dati invariati.

Esito finale storico: 39950784094 verde. Health di produzione ancora da confermare sullo SHA della run successiva a questa nota.

2026-10-23, non ancora in produzione: `GET /api/calendar?from&to` (max 92 giorni, 500 righe, CLIENT 403) legge tasks, milestones, projects, activities e revenue_events della sola organizzazione. Nessuna tabella nuova, `end` sempre null, niente ricorrenze. Il calendario revenue esistente (`/api/revenue/calendar`) resta. Migrazione 0012 additiva: versioni di listino importate, solo OWNER/ADMIN in scrittura. Importi di test sintetici, non il listino reale.

## C1 — 24 ottobre 2026, copia delegata (non pubblicato)

Agenda Revenue usa GET `/api/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD&type=tasks&project=ID`: tipo/progetto facoltativi, intervallo massimo 92 giorni di distanza. Unisce task, milestone, progetti, campagne, iniziative, attività, eventi revenue, richieste QA e approvazioni dalle date originali; nessuna tabella o sincronizzazione nuova. Chiave evento: fonte+id. Revisioni/approvazioni espongono la data originale di richiesta (`created_at`), non una scadenza inventata.

Timestamp restituiti come istanti ISO; visualizzazione e filtro giorni in Europe/Rome (default: lo schema organizzazione non contiene un fuso configurabile). Date senza ora invariate. Query sempre tenant-scoped; campagne/iniziative/revenue solo ruoli commerciali; approvazioni solo OWNER/ADMIN, senza costi o motivazioni; QA solo ruoli di consegna. Le altre sorgenti rispettano `resources.read`. Nessuna finanza aggiunta. Massimo 501 candidati per fonte/500 eventi mostrati, troncamento dichiarato; restringere i filtri se parziale.

Test aggiunti in `tests/calendar.test.ts`: dedup fonte+id, mezzanotte Roma da 23:30 UTC, giorno pieno, tipo/progetto, entrambe le organizzazioni, ruolo senza permessi. Test non eseguiti: verifica ammessa solo CI, rete vietata nella delega. Fuori scope: drag&drop, ricorrenze, multi-calendario, conflitti. Il vecchio endpoint `/api/revenue/calendar` resta compatibile, ma la vista usa quello unificato.

24 ottobre — COMMERCE-VISIBLE-24 (locale, non pubblicato): Soluzioni e famiglie presentano modalità una tantum, continuativa/abbonamento e progetto su misura. Tre CTA aprono il brief reale precompilato senza invio o acquisto. Nessun prezzo, checkout o abbonamento attivo inventato; catalogo prezzi approvati, provider e provisioning restano da collegare. Test engagement-modes.spec.ts da eseguire in CI.
