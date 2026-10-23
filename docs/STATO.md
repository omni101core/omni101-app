# OMNI101 — stato corrente

Aggiornato: 23 ottobre 2026. Questa è la matrice corrente; lo storico precedente è preservato in `docs/operativo/stato-storico-prima-matrice-2026-10-23.md`. Non dedurre il live dal working tree.

## Revisioni e ambienti

- **Produzione/staging/locale**: `f53fe2c7b8870f08eec7b3d2226a0aab403c8244`, run **39950784094** completamente verde. 104 server + 104 browser passati, 12 skip espliciti, canary cloud e health esatto confermati.
- **Dati**: 0010 applicata; import riuscito di 8 originali, 15 requisiti/task e 3 reference (26 elementi). Nessuna esecuzione automatica o campagna sintetica in produzione.
- **QA visiva**: risolto stile legacy che nascondeva la CTA; test contrasto >=4.5 e screenshot desktop/mobile finali controllati. Review indipendente in sola lettura: nessun finding; test rimangono l’evidenza di esecuzione.
- **Locale**: /tmp/omni101-preview-f53fe2c/local.json, processo 33508, solo 127.0.0.1:4176, D1 persistente precedente preservato; backup prima di 0010. 26 elementi, 15 task mandato, zero utenti creati, hash degli 8 originali verificati.
- **Rollback**: codice precedente 3fa90a5 o 76d17bd ignora le nuove tabelle additive. Non cancellare dati/tabelle per tornare al Worker precedente. Nessun nuovo servizio o costo attivato.

## Matrice unica

| Area | Produzione verificata | Lavoro successivo / limite reale |
|---|---|---|
| Pubblico e portfolio | Temi indipendenti, home cinematica, 9 casi inclusi B&B/ristorazione/professionisti con immagini originali | Casi etichettati concept o interni, nessun risultato cliente inventato. Prestazioni mobile da migliorare |
| Playground | 7 esperienze raggiungibili | Voice browser, Avatar storyboard, Software demo; nessuna telefonata/video/pagamento reale |
| Accesso e soci | Identità individuali, passkey, RBAC; collaboratore indicato OWNER ACTIVE con passkey già registrata | Staging ha utenti separati. Non ricreare account o inviti |
| Centro operativo | Priorità deterministiche, notifiche, progetti, approvazioni ed errori | Nessuna previsione di capacità del personale inventata |
| Pianificazione | Milestone, stime/date, CPM, dipendenze protette, commenti idempotenti | Timeline/calendario unificato e ricorrenze ancora da costruire |
| Pipeline e portale | QA, revisione, consegna, approvazione e manutenzione verificati nei canary staging | Nessun dato sintetico o account QA da creare in produzione |
| Workflow e agenti | Grafo/versioni, runtime durevole, approvazione e cancellazione | Loop/subflow/pausa manuale e tutti i provider non disponibili; nessun agente parte dal backlog |
| Finanza | Registri e aggregati solo ruoli autorizzati | Incassi meno spese registrate non sono utile fiscale; niente fatturazione fiscale automatica |
| Revenue & Growth | Campagne con filtri/dettaglio, CRM collegato, eventi manuali idempotenti e agenda originali online | Qualificazione misura completezza, non probabilità di acquisto. Invii/tracking automatici assenti |
| Adaptive Engineering | Router contestuale, entrypoint condivisi e gate CI dei riferimenti operativi | Nessun nuovo framework. Disponibilità skill osservata nel catalogo Codex locale, altri cataloghi/proxy non verificati; nessun guadagno token dichiarato |
| Growth e creatività | Registri campagne, piani, brief, storyboard, varianti e abbonamenti | Nessun account Ads/email/social collegato; niente invii, pubblicazioni o addebiti |
| SEO / SEM / GEO | Meta/canonical, JSON-LD, sitemap completa e robots verificati | Meta/canonical/JSON-LD/sitemap completa/noindex staging e UTM builder pubblicati e verificati; niente ranking/citazioni garantiti |
| Privacy tecnica | Passkey, RBAC, audit e protezioni server | 0008 applicata: blocchi marketing, evidenze idempotenti e registro diritti Owner/Admin verificati. Titolare/DPA/retention/procedure non verificati; nessuna certificazione GDPR |
| Knowledge & Intelligence | Prima vertical slice online e verificata | 0009 applicata: cattura, ricerca filtrata, versioni attribuite, conflitti, fonte/task, recupero v1, restore e export verificati. Solo TEAM_INTERNAL; niente documenti privati clienti |
| Persistenza dei mandati | Documentazione nel repo | Otto originali preservati con hash; import 8 mandati + 15 requisiti/task + 3 reference riuscito. Importazione CI riuscita in entrambi gli ambienti |
| Copilot e memoria | Assistente NVIDIA esistente con limiti e zero pricing autorizzato | Lettura interna di 12 estratti attribuiti pubblicata e testata, mai nella chat pubblica. Nessun embedding o nuova piattaforma |
| Brand Studio, intake adattivo, team UX | Funzioni di base esistenti | Draft/preview/version/publish brand, autosave/resume intake, ricerca/stati inviti ancora da completare |
| Social, Ads, calendario e asset | Registri parziali | Pipeline complete, scheduler, adapter autorizzati, metriche da fonti vere e storage restano backlog |
| Coding condiviso | Repo/CI/release e preview reali | Branch protetti, review obbligatorie, adapter multiprovider e contesti agent-ready completi da verificare/implementare |
| OpenHands / Cloudflare Sandbox | Nessuna integrazione attiva | Reference proposte dal founder; costi, permessi, rete, licenze da valutare prima di attivare |
| Storage e nuovi servizi | R2 assente, storage false | Nessun nuovo servizio a pagamento autorizzato o attivato; produzione indipendente dal Mac |

## Prossimo passaggio verificabile

Rivedere i 15 gruppi requisito con i soci e scomporre il resto dei mandati in criteri verificabili, mantenendo fonti e storia. Completare ACL per progetto e importazione guidata prima di acquisire materiali privati dei clienti; poi calendario/social/brand/collaborazione coding secondo il backlog. La memoria iniziale è operativa, il mandato complessivo non è completato. Identità legale, DPA, retention e fornitori restano da verificare, nessuna certificazione GDPR dichiarata.

Fonti: `docs/mandati/sources.json`, `docs/operativo/mandate-backlog.json`. File e contratti nei moduli; handoff dettagliato in `docs/operativo/ripresa.md`. `src/` e `worker/` restano il sito Astro precedente e non fanno parte del deploy. ceo-os non è stato toccato.

