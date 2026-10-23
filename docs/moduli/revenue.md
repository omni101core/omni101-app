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

Esito finale: 39950784094 verde, 208 test passati e 12 skip; migrazione/import in entrambi gli ambienti, letture reali di Revenue/calendario, client bloccato e canali disconnessi confermati dal canary. Health di produzione f53fe2c7b8870f08eec7b3d2226a0aab403c8244. Screenshot finali revenue-final-desktop/mobile.png controllati: CTA leggibile in entrambe le viewport.
