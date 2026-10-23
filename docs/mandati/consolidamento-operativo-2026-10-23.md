# OMNI101 — MANDATO DI CONSOLIDAMENTO, COMPLETAMENTO E POTENZIAMENTO OPERATIVO

**Data:** 23 ottobre 2026  
**Natura:** continuazione esecutiva del progetto esistente, non nuovo progetto  
**Destinatari:** Claude Code, Codex, Hermes/Orca e altri agenti autorizzati  
**Obiettivo:** rendere OMNI101 una piattaforma AI-native realmente utilizzabile per acquisire clienti, vendere, produrre, collaborare, consegnare e scalare.

## 0. Regola fondamentale

Non ricominciare da zero.

Non sostituire indiscriminatamente architetture, componenti, sistemi o workflow già esistenti.

Non interpretare questo mandato come richiesta di produrre soltanto analisi, documentazione o prototipi.

**Devi esaminare lo stato effettivo del progetto, recuperare le istruzioni precedenti, individuare ciò che manca e implementare progressivamente le funzionalità necessarie, verificandole nell'applicazione reale.**

Il founder vuole una piattaforma avanzata e funzionante, non un elenco di promesse.

Ogni nuova funzionalità deve essere:
- coerente con il prodotto esistente;
- collegata ai dati e ai processi reali;
- utilizzabile dagli utenti autorizzati;
- sicura, osservabile e testabile;
- progettata per il riutilizzo;
- integrabile con agenti AI;
- predisposta alla crescita internazionale;
- distinguibile chiaramente tra implementata, configurata, collegata, verificata e disponibile in produzione.

## 1. Punto di partenza verificato dal precedente handoff

Il precedente contesto riporta:

- Repository locale: `~/omni101/01-Projects/active/omni101-app`
- Documenti iniziali: `docs/README.md`, `docs/STATO.md`
- Runtime attuale: `apps/web`, React Router SSR, Cloudflare Worker, D1 e Workflows.
- `src/` e `worker/` appartengono al precedente sistema Astro.
- `ceo-os` deve rimanere intatto e fuori scope.
- Commit indicato: `f53fe2c7b8870f08eec7b3d2226a0aab403c8244`
- Run indicata: `39950784094`
- Migrazione `0010` indicata come applicata.
- Revenue già dotato di campagne, collegamenti CRM, eventi manuali attribuiti e idempotenti, qualificazione spiegabile e agenda.
- Email, social e Ads: `NOT_CONNECTED`.
- Owner e passkey esistenti da preservare.
- Memoria: 8 originali, 15 gruppi requisito/task e 3 reference; 26 elementi totali.
- Fonti originali in `docs/mandati/sources.json`.
- Il triage attuale **non copre ancora ogni clausola** dei mandati.
- Context loader: `node scripts/project-context.mjs growth`, con ulteriori moduli pertinenti.
- Registro contesto: `docs/operativo/agent-context.json`.
- Caveman e Ponytail già presenti e utilizzati come skill.
- Nessun proxy/harness/framework aggiuntivo da presumere installato.
- Ripresa e rollback: `docs/operativo/ripresa.md`.
- Memoria classificata `TEAM_INTERNAL`; niente documenti cliente finché non esistono ACL affidabili.
- R2 non ancora disponibile; aspetti legali, DPA, retention e conformità GDPR ancora incompleti.
- Nessun account locale fittizio da inventare.
- Non usare `refresh-deploy-auth.py`.
- Non leggere directory di stato riservate né stampare segreti.
- Non eseguire installazioni, build o Playwright sul Mac se permane il vincolo di spazio disco.
- Release dal ramo previsto soltanto dopo verifica completa e autorizzazione effettiva.

**Tutti questi punti sono informazioni di handoff, non fatti da assumere eternamente veri. Verifica lo stato corrente prima di agire.**

## 2. Acquisizione immediata e recupero integrale dei mandati

Prima di modificare il codice:

1. Leggi la documentazione canonica e lo stato del progetto.
2. Recupera i mandati originali già archiviati, compresi quelli lunghi.
3. Leggi il mandato Revenue integrale, senza affidarti soltanto al riassunto.
4. Recupera le istruzioni su prodotto pubblico, dashboard, design, sicurezza, agenti, CLI, marketing, CRM, portale clienti, orchestrazione, preventivi e produzione.
5. Registra questo nuovo mandato nel sistema canonico esistente.
6. Mantieni origine, data, versione, hash, stato, collegamenti e riferimenti alle implementazioni.
7. Individua clausole non ancora classificate e requisiti non ancora soddisfatti.

Non duplicare registri se quelli esistenti possono essere estesi.

Non trasformare automaticamente ogni idea in un task esecutivo: classifica tra requisito vincolante, proposta, riferimento, decisione, dipendenza e richiesta di approfondimento.

Crea una matrice interrogabile:

**Mandato → clausola → requisito → stato reale → componente → task → test → commit/PR → release.**

Le clausole non implementate devono rimanere visibili, non sparire dai riepiloghi.

Ogni chat o agente che riceve un nuovo mandato deve poterlo registrare subito, senza dipendere dalla lunghezza del contesto della conversazione.

Prevedi deduplicazione, versionamento, recupero dopo errore e controllo degli accessi.

## 3. Audit di completamento, non audit infinito

Esamina soltanto ciò che serve per decidere e intervenire:

- navigazione e schermate realmente disponibili;
- componenti frontend;
- API e servizi;
- schema e migrazioni D1;
- workflow e job;
- permessi;
- provider configurati;
- test;
- feature flag;
- osservabilità;
- deploy;
- funzionalità visibili ma non collegate;
- eventuali componenti realizzati da Codex e poi sostituiti o modificati da Claude.

Non rifare analisi già documentate se ancora attendibili.

Per ogni modulo usa stati precisi:

`MISSING`, `PARTIAL`, `IMPLEMENTED`, `CONFIGURED`, `CONNECTED`, `TESTED`, `LIVE`, `BLOCKED`.

Non dichiarare operativo un modulo soltanto perché esiste la sua schermata.

Produci un inventario sintetico dei gap e passa all'implementazione per dipendenze.

## 4. CRM completo e realmente operativo

Verifica e completa:

- Lead, contatti, aziende e opportunità.
- Pipeline **Kanban con drag-and-drop persistente**.
- Vista tabella, lista, dettaglio, calendario e timeline.
- Pipeline configurabili e fasi personalizzabili.
- Owner, assegnazioni, priorità e SLA.
- Attività, chiamate, riunioni, note e allegati.
- Cronologia completa di ogni relazione commerciale.
- Importazione e deduplicazione.
- Ricerca e filtri salvabili.
- Lead scoring spiegabile.
- Segmentazione e tag.
- Lead source e attribuzione.
- Valore atteso, probabilità e forecast.
- Motivi di perdita.
- Automazioni al cambio di stato.
- Promemoria e follow-up.
- Conversione lead → cliente → progetto.
- Collegamenti reali con campagne, preventivi, contratti e fatture.

Ogni spostamento nel Kanban deve aggiornare dati, attività, automazioni autorizzate e audit log.

Nessuna vista statica.

## 5. Marketing Hub: email, landing, funnel e conversione

Realizza un sistema commerciale completo e modulare.

### Email marketing

Comprende:

- liste, contatti, segmenti dinamici;
- gestione consensi e provenienza;
- preferenze di comunicazione;
- iscrizione, conferma dove richiesta e disiscrizione;
- suppression list;
- gestione bounce e complaint;
- separazione marketing/transazionale;
- editor email visuale;
- template responsive e riutilizzabili;
- personalizzazione;
- campagne singole e ricorrenti;
- sequenze drip;
- nurture e lifecycle;
- trigger da CRM, form, appuntamenti e offerte;
- A/B test;
- scheduling;
- report su invii, recapito, click e conversioni;
- attribuzione collegata al CRM;
- deliverability e configurazione SPF/DKIM/DMARC;
- limiti di invio, reputazione e controlli antiabuso.

**Realizza subito tutta la parte utilizzabile senza inviare email reali:** editor, dati, campagne in bozza, segmenti, workflow, preview, test controllati e integrazione predisposta.

L'invio reale richiede provider configurato, dominio autenticato, conformità, consenso appropriato e approvazione operativa.

Non inventare metriche.

### Landing page builder

Prevedi:

- template professionali per differenti settori;
- editor visuale a blocchi;
- design tokens;
- responsive;
- form;
- CTA;
- sezioni riutilizzabili;
- SEO;
- analytics;
- varianti;
- anteprima;
- versioni e rollback;
- domini e pubblicazione controllata;
- connessione diretta con CRM e funnel.

### Funnel builder

Crea un sistema visuale che colleghi:

**Sorgente traffico → Landing → Form → Lead → Segmentazione → Email → Appuntamento → Offerta → Contratto → Pagamento → Onboarding.**

Supporta ramificazioni, condizioni, trigger, conversioni, drop-off e misurazione.

Ogni nodo deve avere una funzione reale e uno stato visibile.

### Conversion rate optimization

Aggiungi esperimenti, varianti, obiettivi, eventi, analisi delle conversioni, heatmap solo tramite integrazioni appropriate e privacy-aware, insight e raccomandazioni AI verificabili.

## 6. Social Media Studio e advertising

Costruisci:

- calendario editoriale;
- gestione canali;
- bozze;
- editor contenuti;
- media library;
- formati per piattaforma;
- adattamento creativo;
- approvazioni;
- pianificazione;
- campagne;
- varianti A/B;
- riutilizzo dei contenuti;
- workflow di produzione;
- performance e reporting;
- collegamento ai lead e al fatturato.

Prevedi connettori per piattaforme pertinenti come Meta, Instagram, LinkedIn, Google, TikTok e YouTube, rispettando API, permessi e condizioni d'uso.

Senza account o token autorizzati, le funzionalità devono rimanere in stato `NOT_CONNECTED` o `READY_TO_CONNECT`, con flussi di configurazione chiari.

**Non pubblicare post, non acquistare advertising e non spendere denaro senza autorizzazione.**

## 7. Preventivi, offerte e automazione economica

Questo modulo è prioritario.

Il founder non deve ricalcolare manualmente ogni progetto.

Costruisci un **motore di pricing e preventivazione** configurabile, con formule, versionamento e spiegabilità.

Considera:

- catalogo servizi;
- pacchetti;
- deliverable;
- scope;
- complessità;
- ore stimate per ruolo;
- tariffari interni;
- costi fissi e variabili;
- costi di API e modelli AI;
- infrastruttura;
- software terzi;
- commissioni;
- rischio e contingency;
- margine target;
- sconti autorizzati;
- setup iniziale;
- costi ricorrenti;
- manutenzione;
- supporto;
- SLA;
- revisioni;
- licenze;
- valuta;
- imposte applicabili;
- condizioni di pagamento.

Una possibile base di calcolo, da adattare alle regole economiche realmente approvate, è:

`Costo diretto = lavoro + AI/API + infrastruttura + terze parti + produzione`

`Costo corretto = costo diretto + overhead attribuito + contingency`

`Prezzo obiettivo = costo corretto / (1 - margine lordo target)`

Non confondere markup e margine.

Distingui costi una tantum, mensili, annuali e a consumo.

Non inventare tariffe, aliquote fiscali, margini o prezzi definitivi: recupera le regole approvate; quando mancano, rendile configurabili e richiedi conferma.

Il sistema deve poter generare:

1. stima preliminare;
2. preventivo dettagliato;
3. proposta commerciale professionale;
4. varianti e opzioni;
5. approvazione interna;
6. invio autorizzato;
7. accettazione;
8. contratto o ordine;
9. fatturazione/pagamento tramite provider idoneo;
10. creazione automatica del progetto e dei task.

Conserva lo snapshot dei calcoli utilizzati per ogni versione dell'offerta.

## 8. Dashboard: modernizzazione reale

Valuta le schermate attuali nel browser, non soltanto nel codice.

Verifica:

- leggibilità;
- gerarchia visiva;
- spaziature;
- tipografia;
- densità informativa;
- navigazione;
- filtri;
- ricerca;
- stati vuoti;
- loading;
- errori;
- feedback;
- tabelle;
- Kanban;
- calendari;
- grafici;
- drawer;
- modali;
- scorciatoie;
- comandi rapidi;
- responsive;
- accessibilità;
- tema chiaro e scuro.

Ispirazione qualitativa: Linear, Notion, Raycast, n8n e prodotti SaaS di livello elevato.

Non copiare identità o interfacce protette.

La dashboard deve essere veloce, funzionale e professionale: niente 3D decorativo che rallenti il lavoro.

Popola le sezioni con dati reali esistenti; usa esempi esplicitamente contrassegnati soltanto negli ambienti demo.

Ogni pulsante visibile deve funzionare oppure dichiarare chiaramente la propria indisponibilità.

## 9. Agency OS completo

Completa e collega progressivamente:

- CRM e sales;
- marketing;
- progetti;
- task e dipendenze;
- Kanban;
- timeline;
- calendario;
- inbox;
- clienti;
- preventivi;
- contratti;
- fatture;
- costi e margini;
- reporting;
- file e asset;
- Media Studio;
- agenti AI;
- Mission Control;
- workflow builder;
- approvazioni;
- supporto e ticket;
- customer success;
- rinnovi;
- manutenzione;
- portale clienti;
- amministrazione;
- impostazioni;
- ruoli e permessi;
- audit;
- integrazioni.

Tutte le sezioni devono condividere identità, dati e flussi senza duplicazioni incoerenti.

## 10. Client portal, ruoli e sicurezza

Prevedi almeno le capacità per:

- co-owner con parità di autorità definita;
- amministratori;
- collaboratori;
- operatori commerciali;
- operatori marketing;
- project manager;
- clienti;
- membri del team cliente;
- clienti in sola lettura;
- partner e reseller;
- agenti AI con privilegi circoscritti.

I ruoli effettivi devono essere configurabili e basati su permessi, non soltanto su nomi fissi.

Implementa o verifica:

- isolamento per tenant e progetto;
- autorizzazione server-side;
- MFA/passkey;
- inviti sicuri;
- scadenza e revoca sessioni;
- accesso ai file;
- audit log;
- protezione dei segreti;
- rate limiting;
- validazione input;
- difese CSRF/XSS/SSRF;
- gestione prompt injection;
- confini dei tool AI;
- approvazioni per azioni sensibili;
- backup e ripristino;
- retention e cancellazione;
- controlli sulle integrazioni;
- OWASP ASVS e rischi specifici LLM.

**Non esporre dati interni ai clienti. Non abilitare memoria cliente finché non esiste segregazione verificata.**

Non dichiarare conformità GDPR o certificazioni non effettivamente dimostrate.

## 11. Catalogo di soluzioni riutilizzabili

OMNI101 non deve ricostruire ogni progetto cliente da zero.

Crea progressivamente una libreria di:

- starter kit;
- template;
- componenti;
- pattern UI;
- design system;
- landing;
- funnel;
- automazioni;
- workflow;
- agenti;
- prompt e tool;
- integrazioni;
- schemi dati;
- formule;
- test;
- checklist;
- pipeline di deploy;
- sistemi di monitoraggio;
- configurazioni settoriali.

La libreria deve essere modulare, versionata, parametrica e utilizzabile da agenti AI.

L'obiettivo è partire da un brief e generare rapidamente una soluzione di qualità elevata, mantenendo personalizzazione e QA umano.

## 12. SEO, GEO, accessibilità e crescita organica

Verifica sia il sito pubblico OMNI101 sia le landing create dalla piattaforma.

Copri:

- struttura semantica;
- metadata;
- sitemap;
- robots;
- canonical;
- redirect;
- dati strutturati;
- internal linking;
- Core Web Vitals;
- rendering e indicizzabilità;
- accessibilità;
- contenuti originali;
- pagine servizi;
- casi studio autentici;
- FAQ utili;
- contenuti multilingua;
- hreflang dove applicabile;
- analisi query e conversioni;
- monitoraggio tecnico;
- GEO/AEO orientato a chiarezza, autorevolezza e citabilità.

Non promettere posizionamenti garantiti nei motori di ricerca o nelle risposte AI.

## 13. Referral, affiliazione, reseller e white-label

Prevedi un'architettura estendibile per:

- partner;
- referral link;
- codici attribuzione;
- lead referral;
- commissioni;
- stato conversione;
- antifrode;
- approvazioni;
- rendicontazione;
- pagamenti commissioni;
- reseller;
- cataloghi dedicati;
- listini personalizzati;
- branding cliente;
- portali partner.

Implementa per priorità commerciale e senza introdurre subito complessità non necessaria.

## 14. Orchestrazione di Claude, Codex, Hermes e CLI

Verifica le istruzioni Orca effettivamente disponibili.

Caveman e Ponytail sono già presenti: riutilizzali.

Non installare un secondo orchestratore senza necessità dimostrata.

Determina:

- quali CLI sono realmente disponibili;
- come vengono invocate;
- quali modelli ed effort supportano;
- come scegliere il modello in base al lavoro;
- come delegare sottotask;
- come isolare workspace e modifiche;
- come gestire permessi;
- come monitorare costi e token;
- come recuperare sessioni;
- come condividere contesto;
- come evitare agenti che modificano contemporaneamente gli stessi file;
- come presentare risultati e prove.

Se esiste un control plane condiviso, usa quello come fonte canonica.

Crea o aggiorna una skill riutilizzabile per richiamare l'orchestrazione dalle nuove chat e dalle chat esistenti, rispettando le capacità reali di ogni ambiente.

Non dichiarare che ChatGPT o una specifica chat possa controllare Orca o le CLI se il collegamento non è effettivamente disponibile.

Non usare il progetto OMNI101 OS v2 come destinazione implicita delle modifiche alla web app.

## 15. Open source, GitHub e REA

Prima di sviluppare componenti complessi, cerca soluzioni riutilizzabili.

Valuta repository e progetti per:

- maturità;
- manutenzione;
- sicurezza;
- licenza;
- compatibilità Cloudflare;
- peso infrastrutturale;
- qualità API;
- supporto multi-tenant;
- facilità d'uso da parte degli agenti;
- possibilità di adattamento;
- costi operativi;
- test e documentazione.

Considera, quando pertinenti, categorie e candidati quali:

- CRM: Twenty, EspoCRM;
- email: Listmonk, Mautic, Dittofeed, React Email, MJML;
- landing/editor: Puck, GrapesJS, Payload;
- workflow: n8n, Activepieces, Windmill, Trigger.dev;
- social: Postiz;
- analytics: Umami, PostHog;
- esperimenti: GrowthBook;
- form: Formbricks;
- supporto: Chatwoot;
- autorizzazioni: Casbin, OpenFGA.

Questi sono **candidati da verificare, non scelte già approvate**.

REA può essere utilizzato per analizzare interazioni e riferimenti, nel rispetto di licenze, proprietà intellettuale, termini e sicurezza.

Preferisci integrare o adattare un componente affidabile quando è migliore che ricostruirlo.

Non installare grandi applicazioni self-hosted presumendo che possano girare nativamente su Cloudflare Workers.

## 16. Automazioni AI realmente utili

Costruisci workflow verificabili per:

- acquisizione lead;
- arricchimento consentito;
- qualificazione;
- suggerimento servizi;
- preparazione di offerte;
- creazione di landing;
- preparazione email;
- generazione di contenuti social;
- pianificazione campagne;
- stima dei costi;
- creazione progetto;
- scomposizione task;
- QA;
- reportistica;
- assistenza;
- individuazione opportunità di upsell;
- rinnovi.

Le azioni ad alto impatto richiedono autorizzazioni appropriate.

Gli agenti devono mostrare stato, input, output, costi, log, errori, retry e richieste di approvazione.

Non spacciare simulazioni per esecuzioni reali.

## 17. Modalità di esecuzione

Lavora per **vertical slice complete**, non per decine di schermate scollegate.

Sequenza preferita:

**Slice A — Memoria e gap**
- Registrazione mandato.
- Recupero clausole precedenti.
- Matrice copertura.
- Gap prioritari.

**Slice B — CRM e pipeline**
- Kanban persistente.
- Opportunità.
- Attività.
- Collegamento Revenue.
- Test.

**Slice C — Preventivi**
- Regole economiche.
- Calcoli.
- Versioni.
- Proposta.
- Approvazioni.
- Conversione in progetto.

**Slice D — Marketing**
- Contatti e consensi.
- Landing.
- Form.
- Funnel.
- Email builder.
- Sequenze.
- Attribution.
- Integrazioni pronte alla configurazione.

**Slice E — Social e crescita**
- Calendario.
- Creatività.
- Approvazioni.
- Scheduling tramite connettori autorizzati.
- Analytics.

**Slice F — Portale, sicurezza e completamento**
- Accessi.
- Permessi.
- Client portal.
- Audit.
- Test end-to-end.

La sequenza può essere adattata se l'audit dimostra dipendenze diverse.

Non bloccare tutte le implementazioni in attesa di servizi esterni o credenziali: completa ciò che può funzionare in sicurezza e rendi esplicito ciò che necessita di configurazione.

## 18. Verifica e criteri di accettazione

Ogni slice deve dimostrare:

1. percorso utente completo;
2. persistenza dei dati;
3. controlli autorizzativi;
4. error handling;
5. test automatici pertinenti;
6. prova browser quando disponibile;
7. compatibilità con le funzionalità esistenti;
8. accessibilità e responsive;
9. assenza di regressioni;
10. tracciabilità verso il mandato;
11. stato reale documentato;
12. procedura di rollback per modifiche rischiose.

Esempio obbligatorio di prova integrata:

Un visitatore compila una landing → nasce un lead nel CRM → viene attribuita la sorgente → appare nella pipeline Kanban → viene qualificato → si genera una proposta calcolata → il socio la approva → si avvia il percorso di accettazione → viene creato il progetto → il cliente vede soltanto i propri dati.

Per email e social, la prova deve fermarsi al confine autorizzato quando provider o permessi non sono disponibili.

## 19. Limiti operativi

- Non cancellare dati.
- Non sovrascrivere segreti.
- Non introdurre spese senza autorizzazione.
- Non inviare comunicazioni massive senza consenso e approvazione.
- Non pubblicare contenuti non approvati.
- Non eseguire migrazioni distruttive senza backup e piano di rollback.
- Non alterare `ceo-os`.
- Non creare account fittizi in ambienti reali.
- Non compromettere owner, passkey o sicurezza esistente.
- Non dichiarare test o verifiche non realmente eseguiti.
- Non utilizzare scorciatoie che creino debito di sicurezza.

## 20. Risultato richiesto

Non limitarti a rispondere con un piano.

**Procedi all'implementazione nel progetto corretto, secondo le capacità e le autorizzazioni effettivamente disponibili.**

Ad ogni checkpoint comunica soltanto:

- cosa è stato completato e verificato;
- cosa è stato migliorato rispetto all'esistente;
- cosa resta incompleto;
- cosa è bloccato da credenziali, decisioni o servizi esterni;
- quali prove supportano il risultato;
- quale slice viene affrontata successivamente.

Riduci i token inutili usando il contesto mirato e gli strumenti già disponibili, senza sacrificare completezza o qualità.

**Obiettivo finale: OMNI101 deve diventare il sistema operativo commerciale e produttivo dell'agenzia, capace di vendere i propri servizi e di realizzare in modo rapido, sicuro e avanzato le soluzioni dei clienti.**