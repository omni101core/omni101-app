Sì. E aggiungerei un principio ancora più importante: OMNI101 non deve essere soltanto una dashboard con moduli, agenti e integrazioni. Deve diventare un ecosistema operativo in cui tutte queste capacità collaborano davvero, con un'interfaccia che renda semplici anche le operazioni più complesse.

Per esempio, collegare Gmail, un CRM, un server MCP o un account social non dovrebbe richiedere di conoscere API, token, webhook e JSON. L'utente dovrebbe essere accompagnato da un'interfaccia guidata, con test di connessione, spiegazione dei permessi, anteprima delle azioni disponibili e possibilità di usare subito l'integrazione in un agente o in un'automazione.

Allo stesso modo, un agente non può essere considerato funzionante perché compare come `CONFIGURED` o perché produce una risposta in chat. Deve poter eseguire strumenti autorizzati, modificare dati, attivare workflow, produrre risultati verificabili e chiedere approvazioni quando necessario.

Aggiungerei quindi questo mandato alla chat che sta già lavorando, senza sostituire quello precedente.

# OMNI101 — MANDATO INTEGRATIVO: CONNECTED ECOSYSTEM, MCP, AUTOMATION, AGENT WORKFORCE & INTERACTIVE PRODUCT EXPERIENCE

**Data:** 23 ottobre 2026\
**Tipo:** integrazione vincolante ai mandati OMNI101 precedenti\
**Ambito:** intero ecosistema pubblico, Agency OS, integrazioni, automazioni, agenti, onboarding, formazione, collaborazione e infrastruttura.

## 0. Visione complessiva

OMNI101 deve evolvere in un **AI-native Agency Operating System connesso, modulare, autonomo ma controllabile**, capace di svolgere realmente il lavoro quotidiano di un'agenzia digitale e di orchestrare la produzione di soluzioni per i clienti.

Non voglio un insieme di pagine decorative, demo scollegate, connettori finti o agenti che si limitano a simulare operazioni.

Voglio un ecosistema in cui:

- un utente collega strumenti e account attraverso interfacce guidate;
- le integrazioni espongono capacità riutilizzabili;
- gli agenti scoprono e utilizzano strumenti autorizzati;
- le automazioni coordinano sistemi, dati, persone e AI;
- gli utenti vedono cosa succede, possono intervenire e approvare;
- ogni operazione produce effetti reali, tracciati e verificabili;
- il prodotto insegna progressivamente come utilizzarlo;
- le funzionalità si collegano tra loro in processi completi;
- l'interfaccia rimane semplice anche quando la tecnologia sottostante è complessa.

**Questo mandato integra quelli precedenti. Non annulla priorità, vincoli, decisioni, funzionalità o lavori già realizzati.**

Prima di intervenire, recupera e verifica lo stato corrente del progetto e i mandati canonici.

---

# 1. INTEGRATION HUB — CENTRO INTEGRAZIONI COMPLETO

Realizza o potenzia una sezione dedicata alle integrazioni, progettata come un vero marketplace operativo.

Non basta mostrare loghi di servizi.

Ogni integrazione deve avere:

- nome, categoria, descrizione e casi d'uso;
- stato effettivo;
- capacità disponibili;
- requisiti;
- autorizzazioni richieste;
- account o workspace collegato;
- test di connessione;
- data dell'ultima verifica;
- errori e diagnostica;
- limiti e quote;
- eventi supportati;
- azioni supportate;
- trigger disponibili;
- automazioni e agenti che la utilizzano;
- possibilità di riconfigurare, sospendere e scollegare;
- log delle operazioni;
- istruzioni e tutorial contestuali.

## 1.1 Categorie di integrazione

Prevedi un catalogo estendibile che copra almeno:

**AI e modelli**\
OpenAI, Anthropic, Google, modelli open source e provider compatibili, secondo disponibilità e API ufficiali.

**Coding e sviluppo**\
GitHub, GitLab, Claude Code, Codex, ambienti di sviluppo, cloud sandbox, repository, issue, PR, CI/CD e deploy.

**Produttività**\
Google Workspace, Microsoft 365, Gmail, Outlook, Calendar, Drive, OneDrive, Notion, Slack, Discord e strumenti analoghi.

**CRM e sales**\
HubSpot, Salesforce, Pipedrive, Twenty e altri sistemi pertinenti.

**Email marketing**\
Provider email transazionali e marketing, piattaforme newsletter, liste, campagne, eventi e statistiche.

**Social e advertising**\
Meta, Instagram, Facebook, LinkedIn, Google Ads, TikTok, YouTube e piattaforme supportate ufficialmente.

**Pagamenti e amministrazione**\
Stripe, PayPal, provider di fatturazione, contabilità e sistemi gestionali, con attenzione alle esigenze italiane ed europee.

**Creatività e media**\
Servizi di immagini, video, voce, avatar, trascrizione, montaggio e generazione multimediale.

**Dati e analytics**\
GA4, Search Console, analytics privacy-aware, database, data warehouse, strumenti di BI e reporting.

**Customer service**\
Ticketing, live chat, inbox, telefonia, WhatsApp Business e altri canali autorizzati.

**Automazione**\
n8n, Make, Zapier, webhook, code eventi e sistemi di orchestrazione compatibili.

**Infrastruttura**\
Cloudflare, storage, DNS, domini, hosting, monitoraggio e servizi cloud.

Il catalogo deve essere dinamico ed estendibile, non un insieme di integrazioni hardcoded in decine di componenti.

## 1.2 Connessione guidata

L'utente deve poter scegliere un'integrazione e seguire un wizard chiaro:

1. **Scopri:** cosa permette di fare.
2. **Scegli account/workspace:** dove opererà.
3. **Autorizza:** OAuth o altra procedura ufficiale.
4. **Seleziona permessi:** accesso minimo necessario.
5. **Verifica:** test reale della connessione.
6. **Configura:** opzioni, eventi, risorse e limiti.
7. **Attiva:** disponibilità per moduli, agenti e workflow.
8. **Prova:** esecuzione sicura di un esempio.
9. **Monitora:** stato, utilizzo, errori e revoca.

Per ogni fase prevedi spiegazioni semplici, progress indicator, help contestuale, animazioni funzionali, messaggi comprensibili e possibilità di riprendere una configurazione interrotta.

Nessun token in chiaro nel frontend, nei log o nella memoria degli agenti.

---

# 2. MCP HUB — MODEL CONTEXT PROTOCOL COME CAPACITÀ DI PRIMA CLASSE

OMNI101 deve poter utilizzare MCP come uno dei principali sistemi di interoperabilità tra agenti, strumenti, dati e servizi.

Ma MCP non deve diventare l'unico modo di integrare i sistemi: mantieni anche adapter API, OAuth, webhook, SDK e connettori nativi quando più appropriati.

## 2.1 Registro server MCP

Realizza un registro che consenta di:

- scoprire server MCP;
- registrare server remoti;
- gestire endpoint e autenticazione;
- visualizzare strumenti, risorse e prompt esposti;
- verificare la compatibilità con la specifica MCP corrente;
- testare connessione e capability negotiation;
- classificare server verificati e non verificati;
- assegnare server a workspace, progetti o agenti;
- sospendere o revocare accessi;
- monitorare disponibilità, latenza, errori e utilizzo;
- conservare versioni e modifiche delle capacità.

Usa SDK ufficiali e protocolli supportati, senza inventare convenzioni proprietarie quando non necessarie.

Distingui chiaramente server MCP remoti da processi MCP locali: questi ultimi non possono essere eseguiti automaticamente dentro Cloudflare Workers come normali processi di sistema. Per i trasporti che richiedono processi locali, valuta companion, gateway o ambienti isolati autorizzati.

## 2.2 MCP Tool Explorer

Progetta un'interfaccia avanzata per esplorare gli strumenti disponibili.

Ogni tool deve mostrare:

- nome e descrizione;
- origine;
- input schema;
- output atteso;
- permessi;
- effetti collaterali;
- livello di rischio;
- esempio di utilizzo;
- test controllato;
- cronologia esecuzioni;
- errori;
- agenti e workflow autorizzati a utilizzarlo.

L'utente deve poter provare strumenti in modo guidato, con input strutturati e validazione, senza dover scrivere manualmente JSON.

Le operazioni che modificano dati o sistemi esterni richiedono conferma o policy adeguate.

## 2.3 MCP Client e MCP Server OMNI101

Valuta entrambe le direzioni.

**OMNI101 come client MCP:** gli agenti interni possono utilizzare strumenti forniti da server esterni autorizzati.

**OMNI101 come server MCP:** strumenti selezionati della piattaforma possono essere esposti a client esterni autorizzati, come ambienti di coding o assistenti compatibili.

Esempi di strumenti OMNI101 potenzialmente esponibili:

- cercare lead;
- leggere opportunità autorizzate;
- creare task;
- leggere brief;
- recuperare requisiti;
- consultare stato progetto;
- proporre preventivi;
- ottenere stato workflow;
- creare bozze di contenuto;
- interrogare knowledge base autorizzate.

Non esporre automaticamente dati sensibili o operazioni amministrative.

Ogni strumento deve rispettare identità, scope, RBAC, tenant isolation, audit e policy di approvazione.

## 2.4 Sicurezza MCP

Prevedi:

- autenticazione robusta;
- autorizzazione per risorsa e tool;
- scope granulari;
- allowlist;
- validazione schema;
- controllo delle destinazioni remote;
- protezione da SSRF;
- isolamento dei processi locali;
- timeout e limiti;
- rate limiting;
- approvazioni per azioni sensibili;
- protezione da prompt injection e tool-output injection;
- protezione dei segreti;
- revoca immediata;
- tracciabilità completa;
- valutazione di attendibilità dei server di terze parti.

I server MCP non devono poter ottenere privilegi superiori a quelli concessi all'agente e all'utente che li utilizza.

---

# 3. AUTOMATION STUDIO — WORKFLOW BUILDER VISUALE E REALE

L'Automation Studio deve raggiungere la qualità d'uso dei migliori editor visuali di automazione, mantenendo integrazione nativa con OMNI101.

Riferimenti funzionali: n8n, Make, Zapier, Activepieces e React Flow.

Non replicare inutilmente intere piattaforme: riutilizza componenti e concetti validi quando licenze e architettura lo permettono.

## 3.1 Editor visuale

Prevedi:

- canvas con pan e zoom;
- nodi trascinabili;
- connessioni visive;
- snap-to-grid;
- minimappa;
- raggruppamenti;
- selezione multipla;
- copia/incolla;
- undo/redo;
- ricerca nodi;
- palette categorie;
- configurazione contestuale;
- validazione live;
- visualizzazione input/output;
- esecuzione passo-passo;
- evidenziazione percorso eseguito;
- stati dei nodi;
- debugger;
- versioni;
- draft e publish;
- template;
- duplicazione;
- import/export controllato.

Il risultato deve essere moderno, fluido, accessibile e comprensibile anche a chi non conosce i workflow.

## 3.2 Tipi di nodi

Supporta progressivamente:

- trigger manuale;
- webhook;
- evento applicativo;
- schedulazione;
- email ricevuta;
- nuovo lead;
- aggiornamento opportunità;
- cambio stato progetto;
- pagamento;
- form inviato;
- nodo condizionale;
- switch;
- filtri;
- trasformazione dati;
- chiamata HTTP autorizzata;
- integrazione nativa;
- MCP tool;
- AI model;
- agente AI;
- approvazione umana;
- attesa;
- retry;
- parallelismo;
- iterazione controllata;
- notifica;
- creazione task;
- aggiornamento CRM;
- creazione bozza;
- generazione preventivo;
- chiamata a workflow secondario.

I nodi devono avere contratti di input/output tipizzati e comportamento eseguibile.

## 3.3 Motore di esecuzione

Il canvas è soltanto l'interfaccia.

Dietro deve esistere un runtime affidabile che gestisca:

- esecuzioni persistenti;
- stato durevole;
- idempotenza;
- retry con backoff;
- timeout;
- pause;
- resume;
- cancellation;
- error handling;
- compensazioni dove appropriate;
- versioni immutabili per esecuzione;
- deduplicazione eventi;
- concurrency limits;
- rate limits;
- gestione credenziali;
- log;
- metriche;
- costi;
- cronologia;
- notifiche;
- human-in-the-loop.

Valuta Cloudflare Workflows, Queues, Durable Objects e altri servizi già presenti in base alle esigenze reali.

Non usare un semplice processo frontend o una chiamata HTTP lunga come falso motore di orchestrazione.

## 3.4 Template di automazione

Crea una libreria iniziale di workflow effettivamente utilizzabili:

- lead acquisito → CRM → qualificazione → assegnazione;
- richiesta preventivo → raccolta dati → stima → approvazione;
- opportunità vinta → progetto → task → onboarding;
- nuovo cliente → invito portale → checklist;
- proposta in scadenza → reminder;
- campagna approvata → pianificazione invio;
- nuovo contenuto → revisione → approvazione → pubblicazione autorizzata;
- fattura scaduta → notifica interna;
- ticket urgente → assegnazione → escalation;
- progetto completato → richiesta feedback;
- costo API anomalo → alert;
- deploy completato → QA → report.

Dove manca un'integrazione, il workflow deve mostrare la dipendenza e accompagnare alla configurazione.

Non eseguire invii, pubblicazioni, spese o altre azioni esterne senza le autorizzazioni richieste.

---

# 4. AGENT STUDIO — AGENTI CHE FANNO DAVVERO IL LAVORO

L'attuale sezione Workforce/Mission Control va verificata e potenziata.

Un agente non è soltanto un nome, un avatar, una descrizione e una casella di testo.

Un agente deve essere un'entità operativa con:

- obiettivo;
- ruolo;
- istruzioni;
- modello/provider;
- strumenti;
- integrazioni;
- server MCP;
- knowledge base;
- memoria autorizzata;
- workspace;
- budget;
- limiti;
- policy;
- trigger;
- workflow;
- autorizzazioni;
- supervisore;
- output strutturati;
- artefatti;
- metriche;
- cronologia;
- test;
- versioni.

## 4.1 Agent Builder guidato

Prevedi un'interfaccia visuale che permetta di:

1. scegliere un template di agente;
2. definire il lavoro da svolgere;
3. selezionare capacità e tool;
4. collegare MCP e integrazioni;
5. assegnare knowledge e contesto;
6. scegliere modello e configurazione;
7. definire budget e autonomia;
8. configurare approvazioni;
9. simulare o testare in ambiente sicuro;
10. pubblicare;
11. monitorare;
12. migliorare tramite versioni e valutazioni.

Non obbligare l'utente a conoscere prompt engineering o programmazione.

Offri configurazione semplice e avanzata.

## 4.2 Mission Control reale

Realizza un centro operativo dove osservare:

- agenti disponibili;
- agenti attivi;
- missioni;
- job in corso;
- esecuzioni pianificate;
- task assegnati;
- dipendenze;
- tool call;
- approvazioni in attesa;
- risultati;
- artefatti;
- errori;
- costi;
- token;
- tempi;
- performance;
- storico.

Ogni missione deve poter essere aperta in un dettaglio operativo con timeline degli eventi.

Supporta quando tecnicamente possibile:

- stop;
- pausa;
- resume;
- retry;
- riassegnazione;
- cambio priorità;
- escalation;
- approvazione;
- rifiuto;
- revisione del risultato.

Non promettere pausa o cancellazione istantanea se il provider sottostante non le supporta.

## 4.3 Team di agenti

Prevedi un modello di collaborazione tra agenti specializzati:

- Sales Agent;
- Research Agent;
- Marketing Strategist;
- Content Creator;
- SEO Specialist;
- Creative Director;
- Project Manager;
- Solution Architect;
- Coding Agent;
- QA Agent;
- Security Reviewer;
- Customer Success Agent;
- Finance Assistant.

Sono ruoli e template iniziali, non agenti da dichiarare autonomamente operativi senza runtime e tool.

Un supervisore può scomporre un obiettivo, assegnare sottotask, raccogliere risultati e chiedere approvazione.

Prevedi handoff tipizzati, ownership del task e limiti per evitare loop infiniti tra agenti.

## 4.4 Agenti di coding

Collega, quando effettivamente disponibili, Claude Code, Codex, Hermes e altri strumenti tramite adapter verificati.

Considera:

- workspace esplicito;
- repository;
- branch;
- PR;
- modello;
- effort;
- sandbox;
- permessi;
- stato sessione;
- log;
- risultati;
- test;
- artefatti;
- handoff;
- review;
- approvazione merge;
- deploy controllato.

Riutilizza il control plane Orca e le skill già presenti quando pertinenti.

Non costruire un secondo sistema concorrente senza motivo.

---

# 5. HUMAN APPROVAL CENTER — CONTROLLO UMANO CENTRALIZZATO

Le approvazioni non devono essere sparse in dieci moduli.

Crea un **Approval Center** trasversale che raccolga:

- preventivi;
- contratti;
- campagne;
- email;
- post social;
- spese;
- modifiche infrastrutturali;
- pubblicazioni;
- accessi sensibili;
- tool call rischiose;
- azioni degli agenti;
- merge e deploy;
- cancellazioni;
- pagamenti;
- richieste dei clienti.

Ogni richiesta deve mostrare:

- chi o cosa la richiede;
- motivazione;
- dati coinvolti;
- azione proposta;
- impatto;
- costo stimato;
- rischio;
- anteprima;
- alternative;
- scadenza;
- possibilità di approvare, rifiutare o richiedere modifiche.

Conserva decisione, identità, timestamp e motivazione.

Le approvazioni devono essere effettivamente applicate dal backend, non soltanto simulate nell'interfaccia.

---

# 6. TUTORIAL INTERATTIVI, GUIDED TOURS E PRODUCT EDUCATION

Questo è un requisito di prodotto, non una funzionalità secondaria.

OMNI101 deve insegnare a usare OMNI101 direttamente nell'interfaccia.

## 6.1 Onboarding intelligente

Al primo accesso, accompagna l'utente in un percorso personalizzato in base a ruolo e obiettivo.

Esempi:

**Owner**\
Configurazione agenzia, brand, team, CRM, integrazioni, automazioni e agenti.

**Commerciale**\
Pipeline, lead, offerte, appuntamenti e follow-up.

**Marketing**\
Campagne, landing, email, social, funnel e analytics.

**Project manager**\
Progetti, task, risorse, timeline, approvazioni e clienti.

**Cliente**\
Portale, deliverable, messaggi, approvazioni, documenti e pagamenti.

Non imporre lo stesso tutorial a tutti.

## 6.2 Tour interattivi animati

Implementa tutorial con:

- spotlight sugli elementi;
- tooltip contestuali;
- transizioni fluide;
- frecce e indicatori;
- progressione visiva;
- microanimazioni;
- passaggi guidati;
- esempi pratici;
- esercizi interattivi;
- conferma del completamento;
- skip;
- ripresa;
- riavvio;
- modalità demo;
- adattamento mobile;
- accessibilità;
- reduced motion.

Non usare tour che indicano pulsanti inesistenti o non funzionanti.

Il tutorial deve conoscere lo stato reale dell'applicazione.

## 6.3 Learn by doing

L'utente dovrebbe poter imparare completando un'operazione reale o una simulazione isolata.

Esempi:

- crea la prima opportunità;
- spostala nella pipeline;
- genera una proposta;
- collega un'integrazione;
- crea un workflow;
- configura un agente;
- prova un MCP tool;
- invita un collaboratore;
- prepara una campagna email;
- approva una richiesta.

Distingui chiaramente ambiente demo, bozza e produzione.

## 6.4 Academy e Knowledge Center

Realizza un centro di apprendimento interno con:

- percorsi per ruolo;
- tutorial brevi;
- video o animazioni dove utili;
- documentazione contestuale;
- FAQ;
- ricerca;
- checklist;
- guide passo-passo;
- changelog;
- novità;
- esempi;
- template;
- troubleshooting;
- feedback sulla documentazione.

La documentazione deve essere collegata a funzionalità e versioni effettive.

## 6.5 Assistente contestuale

L'assistente AI interno deve conoscere, entro i permessi autorizzati:

- la sezione corrente;
- l'obiettivo dell'utente;
- lo stato delle integrazioni;
- i workflow disponibili;
- gli errori;
- i tutorial;
- le funzionalità abilitate.

Deve poter spiegare, guidare e, quando autorizzato, eseguire strumenti reali.

Esempio:

«Voglio automatizzare il follow-up dei preventivi».

L'assistente può:

1. identificare il workflow adatto;
2. verificare i dati necessari;
3. verificare l'integrazione email;
4. proporre la sequenza;
5. aprire il builder con la configurazione;
6. guidare il test;
7. richiedere approvazione;
8. attivare il workflow;
9. mostrare dove monitorarlo.

Non deve limitarsi a generare istruzioni testuali se la piattaforma dispone delle capacità operative necessarie.

---

# 7. UNIVERSAL COMMAND BAR E AZIONI CONTESTUALI

Integra una command palette globale, moderna e veloce.

Deve permettere di:

- cercare pagine;
- trovare lead;
- aprire progetti;
- cercare clienti;
- trovare documenti autorizzati;
- avviare workflow;
- creare task;
- preparare preventivi;
- aprire integrazioni;
- cercare tool MCP;
- richiamare agenti;
- consultare tutorial;
- vedere notifiche;
- trovare azioni disponibili.

Aggiungi comandi contestuali in base alla schermata.

Esempio: nella pagina di un'opportunità, l'utente può trovare immediatamente «Genera preventivo», «Pianifica follow-up», «Assegna agente», «Crea progetto» o «Avvia automazione».

Le azioni devono essere collegate al backend e rispettare i permessi.

---

# 8. EVENT BUS E MODELLO DATI CONDIVISO

Per evitare che ogni modulo diventi un'isola, definisci un modello di integrazione coerente.

Entità condivise principali:

- workspace;
- utenti;
- team;
- clienti;
- contatti;
- aziende;
- lead;
- opportunità;
- campagne;
- contenuti;
- proposte;
- contratti;
- progetti;
- task;
- workflow;
- agenti;
- esecuzioni;
- approvazioni;
- integrazioni;
- connessioni;
- credenziali referenziate;
- documenti;
- asset;
- fatture;
- eventi;
- notifiche.

Non duplicare indiscriminatamente i dati tra moduli.

Prevedi eventi di dominio tipizzati, per esempio:

- `lead.created`
- `opportunity.stage_changed`
- `proposal.generated`
- `proposal.approved`
- `project.created`
- `workflow.started`
- `workflow.failed`
- `agent.task_completed`
- `integration.disconnected`
- `approval.requested`
- `campaign.approved`

I nomi sono indicativi: adattali alle convenzioni esistenti.

Gli eventi devono essere persistenti o consegnati con garanzie appropriate, idempotenti dove necessario, versionati e osservabili.

Non assumere che una coda garantisca automaticamente elaborazione exactly-once.

---

# 9. NOTIFICATION & UNIFIED INBOX

Prevedi un centro notifiche realmente collegato al sistema.

Deve raccogliere:

- approvazioni;
- task;
- menzioni;
- attività CRM;
- appuntamenti;
- errori workflow;
- agenti che richiedono intervento;
- integrazioni scadute;
- eventi clienti;
- offerte;
- scadenze;
- fatture;
- deploy;
- anomalie.

Supporta:

- priorità;
- raggruppamento;
- filtri;
- stato letto/non letto;
- assegnazione;
- snooze;
- deep link;
- preferenze;
- notifiche in-app;
- canali esterni autorizzati;
- digest.

Non creare notifiche ridondanti o rumorose.

La unified inbox deve poter evolvere verso comunicazioni cliente, email, chat e ticket tramite provider e permessi adeguati.

---

# 10. DATA, ANALYTICS E BUSINESS INTELLIGENCE

L'Agency OS deve mostrare ciò che sta succedendo davvero.

Collega:

**Marketing → Lead → Opportunità → Preventivo → Vendita → Progetto → Costi → Margine → Rinnovo.**

Metriche utili:

- lead per sorgente;
- conversion rate;
- costo acquisizione;
- valore pipeline;
- win rate;
- tempo medio di vendita;
- preventivi inviati e accettati;
- fatturato;
- ricavi ricorrenti;
- costi AI/API;
- costi infrastruttura;
- margine per progetto;
- utilizzo risorse;
- automazioni eseguite;
- ore operative risparmiate, solo se misurabili;
- error rate;
- performance agenti;
- SLA;
- soddisfazione cliente;
- retention.

Ogni metrica deve avere definizione, fonte e periodo.

Non inventare ROI o risparmi.

Prevedi dashboard per ruolo e drill-down fino ai dati sottostanti.

---

# 11. BRAND STUDIO E DESIGN SYSTEM GLOBALE

Integra la modernizzazione delle interfacce nel sistema modulare già richiesto.

Ogni nuovo componente di Integration Hub, MCP Hub, Automation Studio, Agent Studio e Academy deve utilizzare il design system condiviso.

Prevedi:

- token;
- temi;
- tipografia;
- colori;
- spaziature;
- geometrie;
- componenti;
- icone;
- stati;
- animazioni;
- easing;
- durata transizioni;
- reduced motion;
- responsive;
- accessibilità.

Il prodotto deve avere qualità visiva elevata anche in:

- wizard;
- OAuth callback;
- errori;
- modali;
- drawer;
- editor nodi;
- selettori tool;
- debugger;
- approval dialog;
- configurazione agenti;
- tutorial;
- tabelle;
- Kanban;
- form complessi.

Ispirati a pattern consolidati e librerie professionali, senza assemblare stili incoerenti.

L'interfaccia deve sembrare un unico prodotto progettato intenzionalmente.

---

# 12. MARKETPLACE INTERNO DI CAPACITÀ

Evolvi progressivamente il catalogo in un sistema unificato di elementi riutilizzabili.

Categorie:

- integrazioni;
- MCP server;
- tool;
- agenti;
- workflow;
- template;
- funnel;
- landing;
- campagne;
- prompt;
- skill;
- componenti UI;
- modelli di preventivo;
- pacchetti di servizi;
- automazioni settoriali.

Ogni elemento deve indicare:

- cosa fa;
- prerequisiti;
- costo potenziale;
- permessi;
- compatibilità;
- stato;
- versione;
- dipendenze;
- esempi;
- istruzioni;
- possibilità di installare/configurare;
- test;
- aggiornamento;
- disattivazione.

Non introdurre esecuzione di codice arbitrario o installazioni non fidate senza sandbox, verifica e autorizzazioni adeguate.

---

# 13. OPERATIONS, AFFIDABILITÀ E COST CONTROL

Per un ecosistema di questo tipo serve un vero livello operativo.

Realizza o verifica:

- health check;
- status integrazioni;
- job monitor;
- retry queue;
- dead-letter handling;
- log strutturati;
- tracing;
- alert;
- error tracking;
- audit;
- usage;
- cost accounting;
- budget per workspace;
- budget per agente;
- limiti di chiamata;
- limiti provider;
- circuit breaker;
- fallback;
- incidenti;
- backup;
- rollback;
- gestione migrazioni;
- retention.

Ogni agente, integrazione e workflow deve avere un'identità osservabile e una cronologia consultabile.

Se un workflow fallisce, l'utente deve sapere **dove, perché e come intervenire**.

---

# 14. SCENARI END-TO-END OBBLIGATORI

Non limitarti a testare singoli componenti isolati.

## Scenario A — Lead → vendita → progetto

Un visitatore compila un modulo → il lead entra nel CRM → appare nella pipeline → un'automazione lo qualifica → viene preparata una proposta → il founder approva → il cliente accetta → nasce il progetto → vengono generati task e notifiche.

## Scenario B — Campagna marketing

Un utente crea una campagna → sceglie un segmento → prepara contenuti e creatività → configura email e social → verifica provider e consensi → richiede approvazione → pianifica l'esecuzione → osserva gli eventi reali e l'attribuzione.

## Scenario C — Agente con MCP

Un utente crea un agente → collega un server MCP autorizzato → seleziona un tool → testa il tool → definisce una missione → l'agente esegue una chiamata reale → il sistema registra input/output consentiti, durata, esito e costo → l'utente consulta il risultato.

## Scenario D — Workflow visuale

Un utente trascina nodi nel canvas → configura un trigger CRM → aggiunge una condizione → aggiunge un'azione → testa il workflow → pubblica una versione → provoca l'evento → vede l'esecuzione nel debugger → verifica l'effetto persistito.

## Scenario E — Tutorial interattivo

Un nuovo collaboratore accede → riceve onboarding per ruolo → segue un tour → crea un task o un'opportunità → completa un esercizio → il sistema registra il progresso → può riaprire la guida dalla schermata.

## Scenario F — Agente di coding

Un owner crea una richiesta tecnica → seleziona un coding agent realmente disponibile → definisce repository, workspace e permessi → parte un'esecuzione isolata → vengono prodotti modifiche, test e artefatti → una PR viene sottoposta a review → il merge avviene soltanto secondo policy.

## Scenario G — Integrazione non disponibile

Un utente tenta di usare un provider non collegato → il sistema non finge il successo → mostra il requisito mancante → apre il wizard → conserva la bozza → permette di riprendere dopo la connessione.

---

# 15. CRITERI DI PRODOTTO NON NEGOZIABILI

Per ogni funzione:

1. **È reale?** Esiste una logica eseguibile?
2. **È collegata?** Usa dati e servizi pertinenti?
3. **È utilizzabile?** L'utente comprende come usarla?
4. **È guidata?** Ci sono istruzioni e feedback contestuali?
5. **È sicura?** Rispetta autorizzazioni e isolamento?
6. **È osservabile?** Mostra stato, errori e risultati?
7. **È verificata?** Esistono test e prove?
8. **È recuperabile?** Gestisce errori, retry e rollback?
9. **È coerente?** Usa il design system e le convenzioni esistenti?
10. **È riutilizzabile?** Può essere impiegata da moduli, workflow e agenti?
11. **È economicamente controllata?** Ha limiti e costi misurabili?
12. **È comprensibile?** Non obbliga l'utente a diventare uno sviluppatore?

Se manca uno di questi elementi, indica il gap invece di dichiarare la funzione completa.

---

# 16. PIANO DI INTEGRAZIONE CON IL LAVORO GIÀ IN CORSO

Non interrompere una vertical slice funzionante per aprire contemporaneamente dieci nuovi cantieri.

Procedi così:

**Fase 1 — Consolidamento**

- Recupera tutti i mandati.
- Registra questo addendum.
- Verifica componenti e backend esistenti.
- Identifica ciò che è già riutilizzabile.
- Collega i gap al backlog corrente.

**Fase 2 — Fondamenta condivise**

- Registry integrazioni.
- Modello connessioni.
- Autorizzazioni.
- Eventi.
- Runtime job.
- Logging.
- Approval Center.
- Design system.

**Fase 3 — Prime capacità reali**

- Almeno un'integrazione completa e verificata.
- Almeno un tool MCP funzionante in un ambiente autorizzato.
- Almeno un workflow persistente.
- Almeno un agente che utilizza strumenti reali.
- Almeno un tutorial interattivo end-to-end.

**Fase 4 — Collegamento commerciale**

- CRM Kanban.
- Preventivi.
- Funnel.
- Email marketing in modalità autorizzata.
- Marketing calendar.
- Portale clienti.
- Dashboard e reporting.

**Fase 5 — Ecosistema scalabile**

- Catalogo template.
- Agent team.
- Workflow complessi.
- Orchestrazione coding.
- Marketplace interno.
- Academy.
- Ottimizzazione operativa.

L'ordine può cambiare se il codice reale dimostra dipendenze differenti.

Non considerare una fase conclusa soltanto perché le sue schermate sono visibili.

---

# 17. ISTRUZIONE ESECUTIVA FINALE

Interpreta ogni mandato OMNI101 come parte di un unico progetto di prodotto.

Non aspettare che il founder individui personalmente ogni mancanza di una schermata, di un workflow, di un'automazione o di un'integrazione.

Agisci con competenza congiunta da:

- product architect;
- UX/UI designer;
- frontend engineer;
- backend engineer;
- AI systems architect;
- integration engineer;
- automation engineer;
- security engineer;
- DevOps engineer;
- CRM specialist;
- marketing operations specialist;
- sales operations specialist;
- finance systems designer;
- QA engineer.

Anticipa le esigenze implicite, ma distingui sempre le scelte reversibili da quelle che richiedono autorizzazione.

**Non fermarti alla pianificazione: implementa, collega, verifica, documenta e continua a migliorare il prodotto esistente.**

La misura del successo non è il numero di nuove pagine o di agenti configurati.

È il numero di processi completi che OMNI101 riesce a eseguire in modo affidabile, intuitivo, sicuro e misurabile.

## Come dovrebbe apparire l'ecosistema

OMNI101 — Interfaccia unificata

Dashboard · CRM · Marketing · Progetti · Clienti · Finance · Academy

Integration Hub

Account · API · OAuth

Automation Studio

Trigger · Nodi · Esecuzioni

Agent Studio

Agenti · Tool · Missioni

Capacità condivise

MCP Hub

Event Bus

Approval Center

Knowledge

Observability

Permissions

Runtime e dati reali

Cloudflare · D1 · Workflows · Queues · Storage · Provider esterni

La scelta architetturale decisiva è questa: un'integrazione configurata una volta deve poter essere riutilizzata, con permessi differenti, dal CRM, dal marketing, dai workflow, dagli agenti e dall'assistente interno. Analogamente, un evento commerciale deve poter attivare automazioni e agenti senza duplicare la logica in ogni modulo.

Per la prima implementazione concreta darei precedenza a un percorso completo: CRM Kanban → evento → workflow → agente con tool reale → approvazione → preventivo → aggiornamento CRM, accompagnato da un tutorial interattivo. È una dimostrazione molto più significativa di cinquanta nuove schermate, perché prova che l'intero sistema lavora insieme.

E conserverei un'altra distinzione essenziale: pronto per il collegamento non significa collegato; collegato non significa autorizzato a operare; autorizzato non significa verificato. Questa precisione deve diventare parte integrante dell'interfaccia e dell'architettura di OMNI101.