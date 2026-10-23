# OMNI101 — stato corrente

Aggiornato: 23 ottobre 2026. Questa è la matrice corrente; lo storico precedente è preservato in `docs/operativo/stato-storico-prima-matrice-2026-10-23.md`. Non dedurre il live dal working tree.

## Revisioni e ambienti

- **Produzione e staging**: `3fa90a5d323cd8273da6e1553b3816f97a35552d`, run **39889662855** interamente verde (verify + production). Health del dominio conferma revisione, database true, storage false.
- **Prove**: 102 test server e 103 browser superati, 11 skip espliciti; canary cloud completo, hash dei sei originali v1, collegamenti requisiti/task, clienti esclusi dalla memoria, marketing disattivato. Screenshot privati staging con account sintetici poi revocati; nessun account QA in produzione.
- **Importazione produzione**: job CI conferma 6 mandati originali + 12 requisiti con task + 3 reference, insert-or-ignore, zero esecuzioni. Gli elementi implementati restano IN REVIEW/IMPLEMENTED fino a revisione umana, quelli futuri TODO/PLANNED.
- **Locale**: porta 4176, medesimo build verificato 3fa90a5; server in `/tmp/omni101-preview-3fa90a5`, processo Wrangler 22813, D1 persistente separato. Migrazioni 0008/0009 applicate, 21 elementi di memoria e 12 nuovi task, zero utenti creati. Hash locali dei sei originali v1 verificati.
- **Rilascio precedente recuperabile**: dbfb3be57967a2e280dee0a5d0f1549a34f4a442, run 39887173011. Migrazioni aggiuntive compatibili; non cancellare tabelle o dati per fare rollback del Worker.

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
| Growth e creatività | Registri campagne, piani, brief, storyboard, varianti e abbonamenti | Nessun account Ads/email/social collegato; niente invii, pubblicazioni o addebiti |
| SEO / SEM / GEO | Meta/canonical, JSON-LD, sitemap completa e robots verificati | Meta/canonical/JSON-LD/sitemap completa/noindex staging e UTM builder pubblicati e verificati; niente ranking/citazioni garantiti |
| Privacy tecnica | Passkey, RBAC, audit e protezioni server | 0008 applicata: blocchi marketing, evidenze idempotenti e registro diritti Owner/Admin verificati. Titolare/DPA/retention/procedure non verificati; nessuna certificazione GDPR |
| Knowledge & Intelligence | Prima vertical slice online e verificata | 0009 applicata: cattura, ricerca filtrata, versioni attribuite, conflitti, fonte/task, recupero v1, restore e export verificati. Solo TEAM_INTERNAL; niente documenti privati clienti |
| Persistenza dei mandati | Documentazione nel repo | Sei originali preservati con hash; import CI preparato per 6 mandati + 12 requisiti/task + 3 reference. Importazione CI riuscita in entrambi gli ambienti |
| Copilot e memoria | Assistente NVIDIA esistente con limiti e zero pricing autorizzato | Lettura interna di 12 estratti attribuiti pubblicata e testata, mai nella chat pubblica. Nessun embedding o nuova piattaforma |
| Brand Studio, intake adattivo, team UX | Funzioni di base esistenti | Draft/preview/version/publish brand, autosave/resume intake, ricerca/stati inviti ancora da completare |
| Social, Ads, calendario e asset | Registri parziali | Pipeline complete, scheduler, adapter autorizzati, metriche da fonti vere e storage restano backlog |
| Coding condiviso | Repo/CI/release e preview reali | Branch protetti, review obbligatorie, adapter multiprovider e contesti agent-ready completi da verificare/implementare |
| OpenHands / Cloudflare Sandbox | Nessuna integrazione attiva | Reference proposte dal founder; costi, permessi, rete, licenze da valutare prima di attivare |
| Storage e nuovi servizi | R2 assente, storage false | Nessun nuovo servizio a pagamento autorizzato o attivato; produzione indipendente dal Mac |

## Prossimo passaggio verificabile

Rivedere i 12 requisiti con i soci e scomporre il resto dei mandati in criteri verificabili, mantenendo fonti e storia. Completare ACL per progetto e importazione guidata prima di acquisire materiali privati dei clienti; poi calendario/social/brand/collaborazione coding secondo il backlog. La memoria iniziale è operativa, il mandato complessivo non è completato. Identità legale, DPA, retention e fornitori restano da verificare, nessuna certificazione GDPR dichiarata.

Fonti: `docs/mandati/sources.json`, `docs/operativo/mandate-backlog.json`. File e contratti nei moduli; handoff dettagliato in `docs/operativo/ripresa.md`. `src/` e `worker/` restano il sito Astro precedente e non fanno parte del deploy. ceo-os non è stato toccato.

## Continuazione Adaptive Engineering / Revenue — candidata verificata

Run 39948348249 (e5aab0f0ecbda920aa4a29a7e263da27235bebd0) verde completa. Nuovo Revenue workspace, link CRM, eventi manuali idempotenti, score di completezza spiegabile e agenda derivata; 0010 e import degli 8 originali riusciti in staging. Routing contestuale e relativi riferimenti verificati dalla CI. Produzione resta 3fa90a5 fino al rilascio successivo. Nessun email/social/Ads connesso e nessuna installazione di nuovi framework. Fonti complete preservate; triage di 15 requisiti iniziale, non copertura integrale di ogni clausola.
