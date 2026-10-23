# OMNI101 — stato corrente

Aggiornato: 23 ottobre 2026. Questa è la matrice corrente; lo storico precedente è preservato in `docs/operativo/stato-storico-prima-matrice-2026-10-23.md`. Non dedurre il live dal working tree.

## Revisioni e ambienti

- **LIVE verificato:** `3adf68234deef62b9ca234c4245528c342fb82cc`, run `39994191429`, verify e production verdi; health stesso SHA, database operativo. Include UX1–UX5 e import di 48 requisiti/task, 11 originali con hash e 5 reference.
- **Motion verificata senza deploy:** `1c7ecab771589535c9c6ffc463e31e752649a650`, run `39995312269`, 148 test server e 107 browser / 13 skip. Cambio dinamico reduced-motion e lifecycle RAF. Release isolata `0b8fc25bb130628d51812f37e32f91e96259e4a7`, run `39996221347`, fermata: prima ECONNRESET, poi race della prova di inizializzazione desktop. Fix e test aggiornati nel pacchetto successivo, nessuna produzione aggiornata da quel tentativo.
- **Rollback stabile disponibile:** Worker `305cbd87-8736-4dc5-b114-4ad98f57dc8f` (live 3adf682); migrazioni additive, non cancellare tabelle. Nessun nuovo servizio a pagamento.
- **In lavorazione, escluso dalla release motion:** composer email implementato da Grok e revisionato da Codex, con CAS concorrente e protezione input; nuova CI ancora da confermare, nessun invio. Contenuti campagna pilota in bozza e reference aggiuntiva pronti localmente, non ancora importati in produzione.
- **Coordinamento:** Codex App; Grok esecutore. Checkpoint corrente: `docs/operativo/coordinamento-codex-2026-10-23.md`. I checkpoint datati sotto sono storico, non il live corrente.

## Matrice unica

| Area | Produzione verificata | Lavoro successivo / limite reale |
|---|---|---|
| Pubblico e portfolio | Temi indipendenti, home cinematica, 9 casi inclusi B&B/ristorazione/professionisti con immagini originali | Casi etichettati concept o interni, nessun risultato cliente inventato. Prestazioni mobile da migliorare |
| Playground | 7 esperienze raggiungibili | Voice browser, Avatar storyboard, Software demo; nessuna telefonata/video/pagamento reale |
| Accesso e soci | Identità individuali, passkey, RBAC; collaboratore indicato OWNER ACTIVE con passkey già registrata | Staging ha utenti separati. Non ricreare account o inviti |
| Centro operativo | Priorità deterministiche, notifiche, progetti, approvazioni ed errori | Nessuna previsione di capacità del personale inventata |
| Pianificazione | Milestone, stime/date, CPM, dipendenze protette, commenti idempotenti | Agenda/calendario con date originali ora presenti; ricorrenze, conflitti e scheduling avanzato restano da completare |
| Pipeline e portale | QA, revisione, consegna, approvazione e manutenzione verificati nei canary staging | Nessun dato sintetico o account QA da creare in produzione |
| Workflow e agenti | Grafo/versioni, runtime durevole, approvazione e cancellazione | Loop/subflow/pausa manuale e tutti i provider non disponibili; nessun agente parte dal backlog |
| Preventivazione | Calcolo deterministico, snapshot immutabili, versioni, revisione, catalogo0012 e isolamento del portale | Tariffe reali approvate e limiti residui nei moduli pricing; nessuna tariffa inventata o listino riservato nel repo pubblico |
| Finanza | Registri e aggregati solo ruoli autorizzati | Incassi meno spese registrate non sono utile fiscale; niente fatturazione fiscale automatica |
| Revenue & Growth | Campagne con filtri/dettaglio, CRM collegato, eventi manuali idempotenti e agenda originali online | Qualificazione misura completezza, non probabilità di acquisto. Invii/tracking automatici assenti |
| Adaptive Engineering | Router contestuale, entrypoint condivisi e gate CI dei riferimenti operativi | Nessun nuovo framework. Disponibilità skill osservata nel catalogo Codex locale, altri cataloghi/proxy non verificati; nessun guadagno token dichiarato |
| Growth e creatività | Registri campagne, piani, brief, storyboard, varianti e abbonamenti | Nessun account Ads/email/social collegato; niente invii, pubblicazioni o addebiti |
| SEO / SEM / GEO | Meta/canonical, JSON-LD, sitemap completa e robots verificati | Meta/canonical/JSON-LD/sitemap completa/noindex staging e UTM builder pubblicati e verificati; niente ranking/citazioni garantiti |
| Privacy tecnica | Passkey, RBAC, audit e protezioni server | 0008 applicata: blocchi marketing, evidenze idempotenti e registro diritti Owner/Admin verificati. Titolare/DPA/retention/procedure non verificati; nessuna certificazione GDPR |
| Knowledge & Intelligence | Prima vertical slice online e verificata | 0009 applicata: cattura, ricerca filtrata, versioni attribuite, conflitti, fonte/task, recupero v1, restore e export verificati. Solo TEAM_INTERNAL; niente documenti privati clienti |
| Persistenza dei mandati | 11 originali con hash, 48 requisiti/task e 5 reference importati in entrambi gli ambienti | Nuovo mandato conservato privatamente in MemPalace, con puntatore sicuro; non copiare il suo testo nel repo pubblico. Bozza campagna con una reference ulteriore pronta localmente |
| Copilot e memoria | Assistente NVIDIA esistente con limiti e zero pricing autorizzato | Lettura interna di 12 estratti attribuiti pubblicata e testata, mai nella chat pubblica. Nessun embedding o nuova piattaforma |
| Brand Studio, intake adattivo, team UX | Funzioni di base esistenti | Draft/preview/version/publish brand, autosave/resume intake, ricerca/stati inviti ancora da completare |
| Social, Ads, calendario e asset | Registri parziali | Pipeline complete, scheduler, adapter autorizzati, metriche da fonti vere e storage restano backlog |
| Coding condiviso | Repo/CI/release e preview reali | Branch protetti, review obbligatorie, adapter multiprovider e contesti agent-ready completi da verificare/implementare |
| OpenHands / Cloudflare Sandbox | Nessuna integrazione attiva | Reference proposte dal founder; costi, permessi, rete, licenze da valutare prima di attivare |
| Storage e nuovi servizi | R2 assente, storage false | Nessun nuovo servizio a pagamento autorizzato o attivato; produzione indipendente dal Mac |

## Prossimo passaggio verificabile

Confermare release motion al proprio SHA; completare, revisionare e verificare in CI le bozze email persistenti prima del deploy. Importare il pacchetto campagna in bozza. Riallineare i 48 gruppi del backlog a prove del codice, senza ripetere le funzioni già consegnate. ACL progetto, brand, intake adattivo, social e adapter restano ambiti aperti: il mandato complessivo non è completato. Identità legale, DPA, retention e fornitori richiedono verifica specifica, nessuna certificazione GDPR dichiarata.

Fonti: `docs/mandati/sources.json`, `docs/operativo/mandate-backlog.json`. File e contratti nei moduli; handoff dettagliato in `docs/operativo/ripresa.md`. `src/` e `worker/` restano il sito Astro precedente e non fanno parte del deploy. ceo-os non è stato toccato.


## Storico — handoff esecutivo a Claude, precedente al ritorno Codex

23 ottobre: staging eafa5aff312f04123fcfa9df9bd3a0de87df4aee verificato run39960583760 SUCCESS,107server+105browser/13skip, migrazione0011, canary pricing/approvazione/isolamento portale reali. Produzione ancora f53. Screenshot pricing desktop/mobile controllati. Ultimi delta summary/terms/portale e ultimo mandato CLI ancora da rilasciare; locale ripristinato f53. Fonti locali11/gruppi22/reference3; stageimport10/21/3. Review Claude/Grok tramite CLI Orca effettuate, OpenCode gratuito sul solo registry/startup. Fonte di ripresa più recente `docs/operativo/continuazione-claude-2026-10-23.md`; le sezioni precedenti descrivono produzione f53 e restano storico, non sovrascrivere la distinzione.
