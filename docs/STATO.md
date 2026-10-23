# OMNI101 — stato corrente

Aggiornato: 23 ottobre 2026. Questa è la matrice corrente; lo storico precedente è preservato in `docs/operativo/stato-storico-prima-matrice-2026-10-23.md`. Non dedurre il live dal working tree.

## Revisioni e ambienti

- **LIVE ora:** `3101815c9aee44ce6679f0e4fec6e01bda217258`, run `39984184634` verify+production verdi, health allo stesso SHA. Rollback: `01805108595ba1bc21866bcc84825fae829792ff`.
- **Staging verde:** `d64de4b858f5e383dd945b36fca628a7bede23ba`, run `39988347856`. Menu soci, confronto listino, drag mouse tenuto. Release in corso. Dettaglio: `docs/operativo/checkpoint-opus-per-codex.md`.
- **Rollback:** tornare al Worker `01805108`. Migrazioni additive. Non cancellare tabelle. Nessun servizio a pagamento nuovo.

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


## Checkpoint più recente — handoff esecutivo a Claude

23 ottobre: staging eafa5aff312f04123fcfa9df9bd3a0de87df4aee verificato run39960583760 SUCCESS,107server+105browser/13skip, migrazione0011, canary pricing/approvazione/isolamento portale reali. Produzione ancora f53. Screenshot pricing desktop/mobile controllati. Ultimi delta summary/terms/portale e ultimo mandato CLI ancora da rilasciare; locale ripristinato f53. Fonti locali11/gruppi22/reference3; stageimport10/21/3. Review Claude/Grok tramite CLI Orca effettuate, OpenCode gratuito sul solo registry/startup. Fonte di ripresa più recente `docs/operativo/continuazione-claude-2026-10-23.md`; le sezioni precedenti descrivono produzione f53 e restano storico, non sovrascrivere la distinzione.
