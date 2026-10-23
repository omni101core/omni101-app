# OMNI101 — stato corrente

Aggiornato: 23 ottobre 2026. Questa è la matrice corrente; lo storico precedente è preservato in `docs/operativo/stato-storico-prima-matrice-2026-10-23.md`. Non dedurre il live dal working tree.

## Revisioni e ambienti

- **Produzione**: `dbfb3be57967a2e280dee0a5d0f1549a34f4a442`, run **39887173011** verde (verify + production). Health del dominio conferma revisione, database true, storage false. Nessun account/invito ricreato.
- **Base verificata del rilascio**: tree `441fc300644e03083cdc49395ff657f76c73f6d3`, run 39886325515 interamente verde, 93 test server + 102 browser, 10 skip.
- **Nuova verifica intermedia**: run 39888256155, SHA ab8c685e73b22144b85c10508667aca8c4df2d62. Leggere esito finale. Nuovo import contesto e lettura memoria del copilot sono successivi a questa revisione.
- **Locale**: porta 4176, artefatto 25ecd29929eb34d49b1e851b867b5bae20244010; D1 persistente separato. Da aggiornare soltanto con un artefatto verificato, senza install/build sul Mac.

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
| SEO / SEM / GEO | Robot/sitemap di base nella revisione di produzione sopra | Nuovi meta/canonical/JSON-LD/sitemap completa/noindex staging e UTM builder in verifica; niente ranking/citazioni garantiti |
| Privacy tecnica | Passkey, RBAC, audit e protezioni server | 0008: blocchi marketing, evidenze idempotenti e registro diritti Owner/Admin in verifica. Titolare/DPA/retention/procedure non verificati; nessuna certificazione GDPR |
| Knowledge & Intelligence | Non ancora presente nella revisione di produzione sopra | 0009: cattura, ricerca filtrata, versioni attribuite, conflitti, fonte/task, restore e export in verifica. Solo TEAM_INTERNAL; niente documenti privati clienti |
| Persistenza dei mandati | Documentazione nel repo | Tre originali preservati con hash; import CI preparato per 3 mandati + 12 requisiti/task + 3 reference. Applicazione D1 da confermare |
| Copilot e memoria | Assistente NVIDIA esistente con limiti e zero pricing autorizzato | Lettura interna di 12 estratti attribuiti preparata, mai nella chat pubblica. Nessun embedding o nuova piattaforma |
| Brand Studio, intake adattivo, team UX | Funzioni di base esistenti | Draft/preview/version/publish brand, autosave/resume intake, ricerca/stati inviti ancora da completare |
| Social, Ads, calendario e asset | Registri parziali | Pipeline complete, scheduler, adapter autorizzati, metriche da fonti vere e storage restano backlog |
| Coding condiviso | Repo/CI/release e preview reali | Branch protetti, review obbligatorie, adapter multiprovider e contesti agent-ready completi da verificare/implementare |
| OpenHands / Cloudflare Sandbox | Nessuna integrazione attiva | Reference proposte dal founder; costi, permessi, rete, licenze da valutare prima di attivare |
| Storage e nuovi servizi | R2 assente, storage false | Nessun nuovo servizio a pagamento autorizzato o attivato; produzione indipendente dal Mac |

## Prossimo passaggio verificabile

Finire la CI dell’intera nuova vertical slice, controllare UI autenticata e canary live, poi pubblicare solo la revisione verde. Confermare conteggi dell’import in staging e produzione; aggiornare qui SHA/run e stato effettivo. Non dichiarare completato l’intero mandato.

Fonti: `docs/mandati/sources.json`, `docs/operativo/mandate-backlog.json`. File e contratti nei moduli; handoff dettagliato in `docs/operativo/ripresa.md`. `src/` e `worker/` restano il sito Astro precedente e non fanno parte del deploy. ceo-os non si tocca.
