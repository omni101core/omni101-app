# OMNI101 Growth & Revenue OS — Deep Research e mandato esecutivo completo

La conclusione della ricerca è abbastanza netta: **a OMNI101 non serve semplicemente “aggiungere l'email marketing”**. Serve completare il passaggio da Agency OS a **Revenue & Delivery Operating System**.

L'obiettivo corretto è che una richiesta possa entrare in OMNI101 da qualunque canale, essere attribuita, qualificata, trasformata in opportunità, nutrita attraverso funnel e comunicazioni, convertita in progetto, prodotta da umani e agenti, consegnata al cliente, misurata e successivamente trasformata in retention, upsell, referral o nuovo lavoro.

Contemporaneamente, qualsiasi nuovo mandato impartito a Claude, Codex, Hermes o a un collaboratore deve essere **catturato immediatamente come fonte persistente**, prima che il suo contenuto venga disperso nella sessione corrente. Da quella fonte devono poi derivare requisiti, task, decisioni, campagne, reference e implementazioni, senza perdere l'originale.

La ricerca open source mostra inoltre che non è necessario reinventare ogni sottosistema. Esistono progetti maturi per marketing automation, email, visual builder, supporto clienti, analytics, esperimenti, notifiche, social scheduling, affiliate tracking, billing e autorizzazioni. La scelta intelligente, però, è **riutilizzare primitive e motori selettivamente**, mantenendo OMNI101 come esperienza e modello dati unificato invece di assemblare dieci dashboard esterne. citeturn1search0turn1search1turn2search0turn3search1turn3search2turn4search0turn4search3

## La vera architettura commerciale che manca

Penserei OMNI101 come un ciclo continuo, non come un insieme di menu.

**DISCOVER → ATTRACT → CAPTURE → QUALIFY → NURTURE → SELL → DELIVER → RETAIN → EXPAND → REFER → LEARN**

Queste fasi devono condividere contatti, aziende, progetti, asset, campagne, consensi, eventi, costi e conoscenza. In questo modo un lead proveniente da un articolo SEO può essere riconosciuto quando compila un form, entrare in un nurture email, prenotare una call, diventare opportunità, firmare una proposta, trasformarsi in progetto e successivamente ricevere campagne di retention senza essere duplicato in cinque database.

### Il Growth OS che costruirei dentro OMNI101

| Dominio | Cosa deve comprendere realmente |
|---|---|
| **Audience & CRM** | Contatti, aziende, lead, segmenti, lifecycle stage, scoring, activity timeline, source attribution, preferenze e consensi |
| **Landing & Funnel Studio** | Landing builder, funnel multi-step, form adattivi, lead magnet, thank-you page, scheduling, varianti A/B, domini e versioning |
| **Email & Lifecycle** | Newsletter, broadcast, sequenze, trigger, transactional email, nurture, onboarding, retention, reactivation, template, preference center |
| **Social Operations** | Content calendar, ideazione, produzione, revisioni, approvazione, scheduling, pubblicazione, repurposing e analytics |
| **Paid Acquisition** | Meta, Google, TikTok, LinkedIn, campagne, creatività, budget, conversioni, UTM, approvazioni e reporting |
| **SEO & AI Discovery** | Technical SEO, content planning, schema, sitemap, IndexNow, Search Console/Bing, AI-search visibility e content intelligence |
| **CRO & Experiments** | Esperimenti, varianti, feature flags, form performance, funnel drop-off, heat/session evidence quando consentito |
| **Sales Enablement** | Qualificazione, meeting, follow-up, proposal, preventivo, case study, proof, pipeline e sales sequences |
| **Partner Revenue** | Referral, affiliate, reseller, white-label partner, commissioni, payout e attribution |
| **Customer Lifecycle** | Onboarding, health, customer success, support, renewal, upsell, cross-sell, referral e win-back |
| **Intelligence** | Attribution, costi, CAC, conversion rate, funnel metrics, revenue, margin, campaign performance, anomalie e insight |
| **Knowledge & Memory** | Mandati, reference, decisioni, prompt, campagne, risultati, esperimenti, lesson learned e requirement coverage |

La parte fondamentale è che **Campaign** diventi un'entità di primo livello. Una campagna non deve significare soltanto “campagna email”: può collegare obiettivo, cliente, audience, landing, form, annunci, email, social, asset, budget, esperimenti, automazioni e KPI.

Allo stesso modo **Funnel** deve essere un oggetto reale, con versioni e stato, non una serie di pagine nominate manualmente:

`Traffic source → Landing → CTA/Form → Qualification → Nurture → Booking/Offer → Opportunity → Sale`

Da qui OMNI101 può calcolare dove le persone abbandonano il percorso e collegare il dato all'attività commerciale.

### Il form non deve più essere un “form”

Questa è una conseguenza diretta delle richieste che mi hai fatto nelle ultime settimane.

Il sistema di acquisizione dovrebbe supportare:

**Freeform Intake**, dove l'utente racconta ciò che vuole; **Guided Intake**, dove il percorso si adatta alle risposte; **Conversational Intake**, dove OMNI Assist costruisce progressivamente il brief; e **Express Intake**, ad esempio nome/email + messaggio, quando la conversione veloce è più importante della qualificazione immediata.

Tutte e quattro le esperienze devono convergere nello stesso modello di `Lead / Request / Brief`, con autosave, progressive disclosure, allegati, attribution, consenso, anti-spam, validazione, partial completion e follow-up. L'AI è utile nell'interpretazione del testo libero, ma mostrare il campo successivo in base a una risposta deve normalmente rimanere logica deterministica: è meno costoso e più affidabile.

### Email marketing davvero pronto all'uso

Non limiterei il modulo a `Campaign → Subject → HTML → Send`.

Deve comprendere almeno:

| Area | Funzioni |
|---|---|
| **Composer** | editor visuale + source/editor avanzato, responsive preview, componenti di brand, dark-mode email, personalization |
| **Audience** | liste, segmenti dinamici, tag, lifecycle, filtri, esclusioni, suppression |
| **Journey** | trigger, delay, condition, branch, send, wait-for-event, update CRM, assign sales, webhook |
| **Deliverability** | SPF/DKIM/DMARC onboarding, bounce, complaint, suppression, sender verification, domain health |
| **Lifecycle** | welcome, nurture, quote follow-up, onboarding, retention, upsell, renewal, reactivation |
| **Transactional** | account, invite, password/passkey, project, approval, invoice/status notifications |
| **Testing** | test send, preview data, link validation, unsubscribe validation, experiment variants |
| **Analytics** | delivered, bounced, clicked, conversion events, revenue/event attribution, channel comparison |
| **Compliance** | consent record, lawful-basis metadata, unsubscribe, preference center, audit, retention |

Google richiede ai bulk sender di Gmail autenticazione appropriata, incluso SPF e DKIM e requisiti DMARC; Yahoo richiede anch'esso SPF, DKIM e DMARC per i bulk sender. Google mette inoltre a disposizione Postmaster Tools per monitorare reputazione e consegna. Questi aspetti devono quindi essere parte dell'onboarding di un nuovo cliente, non una configurazione nascosta da ricordarsi manualmente. citeturn5search0turn5search1turn5search4turn5search24

C'è anche una questione italiana urgentissima: il Garante ha fissato al **29 ottobre 2026** l'adeguamento alle proprie indicazioni sui pixel e altri sistemi di tracking nelle email; il tracciamento richiede in generale un'adeguata base giuridica e, nei casi indicati dal Garante, consenso preventivo specifico, con eccezioni limitate. Dato che oggi è 23 ottobre 2026, OMNI101 dovrebbe progettare da subito un sistema in cui open tracking e analoghi meccanismi non vengano semplicemente attivati globalmente senza policy e consenso configurabili. citeturn7search0turn7search1turn7search2

Il GDPR attribuisce inoltre all'interessato il diritto di opporsi in qualsiasi momento al trattamento per marketing diretto; dopo l'opposizione, i dati non devono più essere trattati per quella finalità. Questo rende necessaria una suppression/preference architecture condivisa tra email e altri canali, non semplici flag locali alle campagne. citeturn6search0turn6search2turn6search3

## Open source: cosa userei davvero e cosa prenderei solo come reference

La ricerca ha trovato molte componenti già disponibili. La scelta migliore non è installarle tutte.

### Email, lifecycle e template

**Mautic** rimane una piattaforma open-source molto completa per marketing automation e campagne; è preziosa soprattutto come reference di dominio e, in casi specifici, come motore esterno. citeturn1search0

**listmonk** è molto più focalizzato su newsletter e mailing list self-hosted e può essere interessante come motore di invio/campagne leggere. Va però trattato come qualsiasi software internet-facing: il progetto ha avuto anche advisory di sicurezza su funzionalità di templating, ulteriore conferma che “open source” non significa “incorporabile senza threat review”. citeturn1search1turn1search13

**Plunk** combina transactional email, campagne e automazioni in una piattaforma open source, mentre **Dittofeed** affronta customer journeys e comunicazioni omnicanale. Sono entrambi buoni candidati da studiare prima di ricostruire motori equivalenti. citeturn1search3turn1search2

Per il rendering delle email, **React Email** è una reference particolarmente adatta a un prodotto React/TypeScript: fornisce componenti per costruire email responsive occupandosi delle incompatibilità tra client. **Maizzle** è un'altra soluzione matura per produrre HTML email tramite componenti e pipeline di build. citeturn12search0turn12search2

**Decisione consigliata:** OMNI101 mantiene **il proprio modello di campagne, audience, consensi, workflow e analytics**, mentre il rendering e/o la consegna vengono astratti dietro adapter. Questo impedisce di vincolare CRM e Agency OS a un unico provider email.

### Landing page e funnel builder

Qui c'è una scoperta particolarmente adatta a OMNI101: **Puck** è un visual editor open-source per React pensato per essere incorporato in un'applicazione mantenendo il controllo dei propri componenti e dei propri dati. È esattamente il pattern che sceglierei per un Landing Studio OMNI101: l'utente non riceve un editor HTML arbitrario, ma trascina componenti approvati dal design system dell'agenzia. citeturn2search0

**GrapesJS** è più generale e nasce come framework per costruire editor di template HTML, siti, newsletter e altre esperienze visuali; lo considererei quando serve un grado di libertà maggiore, soprattutto per template meno rigidamente component-based. citeturn2search1

**Webstudio** dimostra invece quanto possa diventare avanzato un ambiente visuale open source con controllo dei dati e dell'infrastruttura. Per OMNI101 lo tratterei soprattutto come reference architetturale, non come dipendenza obbligatoria. citeturn2search2

La mia scelta sarebbe:

**Design System → Component Registry → Page Builder → Funnel Builder**

Un blocco `Hero` non deve avere CSS arbitrario. Deve avere props validate come variante, media, headline, CTA, layout, motion preset e theme. L'AI può comporre una landing scegliendo componenti e configurazioni autorizzate, ma non deve generare JavaScript incontrollato che viene pubblicato direttamente.

Questo è anche il modo corretto di ottenere ciò che chiedi quando dici che “per qualsiasi cliente deve essere già tutto pronto”: non migliaia di template rigidi, ma **primitive premium + blueprint verticali + generazione guidata**.

### Automation, CRM e customer support

**n8n** rimane un riferimento molto forte per workflow visuali e integrazioni; il repository corrente descrive un sistema di workflow automation con un ampio catalogo di integrazioni e capacità AI. Il progetto fornisce anche uno starter ufficiale per costruire nodi custom. citeturn3search2turn3search22

**Activepieces** merita particolare attenzione per OMNI101 perché è TypeScript, orientato alle integrazioni e sta esplicitamente collegando i propri “pieces” all'uso come strumenti per agenti/MCP. Questo si sposa bene con l'idea che una stessa capability debba essere usabile dall'utente, da un workflow e da un agente AI. citeturn3search3

**Twenty** è una reference interessante per CRM moderno personalizzabile, mentre **Chatwoot** fornisce una base open source consolidata per customer support omnicanale. citeturn3search0turn3search1

**Decisione consigliata:** non trasformare OMNI101 in un frontend sopra n8n. Conservare il workflow runtime interno per processi centrali e policy-sensitive, ma permettere adapter verso n8n/Activepieces per il “long tail” di integrazioni. Questo riduce enormemente il lavoro senza cedere il cuore del prodotto a un sistema esterno.

### Social, analytics, CRO e customer intelligence

**Postiz** e **Mixpost** sono due progetti open-source rilevanti per scheduling e social media management. Mixpost dispone anche di strumenti CLI pensati per creare, revisionare e pianificare contenuti, un pattern particolarmente interessante per agenti AI. citeturn17search0turn17search1turn17search16

**PostHog** oggi concentra product analytics, session replay, feature flags, esperimenti, error tracking e altre capacità di osservabilità; può quindi ridurre il numero di sistemi separati necessari per CRO e prodotto. citeturn4search3

**GrowthBook** è una reference open source focalizzata su feature flag ed experimentation, mentre **Formbricks** aggiunge survey e raccolta strutturata di feedback. **Novu** fornisce un'infrastruttura multicanale per notifiche e workflow di comunicazione. citeturn10search0turn10search1turn10search3

Questo suggerisce un pattern potente:

**evento → segmento → azione → comunicazione → conversione → misura**

Lo stesso evento `ProposalViewed` può aggiornare il CRM, modificare lo score, notificare il commerciale e, dopo un tempo configurato, attivare un follow-up. Non serve un LLM per questa catena; serve un buon event model.

### Affiliate, partner, billing e reselling

**Dub** è particolarmente pertinente perché combina link attribution, conversion tracking e programmi affiliate. È una buona reference per non reinventare attribution e referral tracking da zero. citeturn4search0

Per modelli di marketplace/reseller con trasferimenti di denaro, **Stripe Connect** supporta account collegati, application fees e payout; **Stripe Billing** gestisce invece subscription e pricing ricorrente/usage-based. citeturn13search4turn13search20turn13search21

Se in futuro OMNI101 diventerà più simile a una piattaforma SaaS con metering complesso, **Lago** è un progetto open source specifico per usage metering, subscription billing e revenue operations, mentre **Kill Bill** copre un dominio di subscription billing molto esteso. Non li introdurrei ora senza un bisogno reale. citeturn13search2turn13search3

### La matrice pratica

| Area | Prima scelta | Strategia |
|---|---|---|
| Email rendering | React Email | **Adopt/Integrate** |
| Email delivery | Provider adapter | **Build abstraction** |
| Marketing automation | OMNI + studio Mautic/Plunk/Dittofeed | **Hybrid** |
| Landing builder | Puck | **Strong candidate** |
| HTML/template editor | GrapesJS | **On demand** |
| Workflow core | OMNI | **Keep/build** |
| Connector ecosystem | n8n / Activepieces | **Integrate** |
| CRM | OMNI + Twenty patterns | **Keep/build** |
| Support | Chatwoot patterns/integration | **Integrate selectively** |
| Social scheduling | OMNI + Postiz/Mixpost | **Hybrid** |
| Product/growth analytics | PostHog | **Strong candidate** |
| Experiments | PostHog / GrowthBook | **Choose, do not duplicate** |
| Surveys/feedback | Formbricks | **Integrate/adapt** |
| Notifications | Novu or existing system | **Evaluate** |
| Affiliate/referral | Dub | **Integrate/adapt** |
| Billing | Stripe | **Provider** |
| Complex metering | Lago | **Later if needed** |
| Auth/RBAC | Existing auth + Better Auth/OpenFGA patterns | **Do not replace blindly** |

Questa matrice non è un ordine di installazione. È esattamente il contrario: **prima verificare ciò che OMNI101 ha già, poi riutilizzare solo ciò che riduce realmente sviluppo, rischio o manutenzione**.

## Sicurezza, accessi e modelli commerciali che devono essere progettati adesso

Qui non farei compromessi, perché il sistema che stai immaginando conterrà CRM, dati clienti, campagne, API key, asset, budget pubblicitari, strumenti AI e forse codice dei clienti.

OWASP ASVS fornisce una base verificabile per requisiti di sicurezza applicativa; OWASP mantiene inoltre una Top 10 specifica per API, mentre l'edizione 2026 della guida OWASP per applicazioni LLM/GenAI affronta rischi propri dei sistemi agentici. Il NIST AI Risk Management Framework e il relativo profilo GenAI offrono un altro riferimento utile per governare i rischi dell'AI. citeturn9search12turn9search22turn9search2turn9search13turn9search3

### Il modello dei ruoli non deve essere soltanto `admin/user`

Progetterei almeno questi archetipi, mantenendo permessi granulari sotto il ruolo:

| Categoria | Ruoli di riferimento |
|---|---|
| OMNI101 | Owner, Admin |
| Team | Sales, Marketing, Project Manager, Developer, Designer/Creative, Finance, Support |
| Cliente | Client Owner, Client Admin, Client Member, Reviewer |
| Partner | Partner Admin, Reseller, Affiliate/Referral |
| Automazione | Service Account, Workflow Identity, AI Agent |
| Esterni | Contractor, Guest, Auditor |

Il concetto più importante è che **un agente AI non deve ereditare automaticamente i privilegi dell'Owner che lo avvia**. Deve avere un'identità o un execution scope separato: ad esempio un agente di marketing può leggere una campagna e preparare copy, ma non deve poter modificare RBAC o esportare l'intero CRM.

Per sistemi con autorizzazioni più sofisticate, **OpenFGA** implementa un modello di fine-grained/relation-based authorization adatto a relazioni come “utente X può revisionare il progetto Y perché appartiene al team Z”. **Better Auth** fornisce invece un framework TypeScript con plugin per organizzazioni, ruoli e 2FA. Non suggerisco di sostituire l'auth esistente senza ragione: sono reference o candidati se l'attuale sistema non supporta i requisiti. citeturn4search9turn4search6turn4search2

Va inoltre mantenuta una disciplina di aggiornamento: nel 2026 Better Auth ha pubblicato advisory relativi a flussi organizzativi/inviti, un buon esempio del perché auth e onboarding non debbano mai essere considerati “una volta fatti, finiti”. citeturn4search29

### Client isolation

Ogni dato operativo deve essere associabile alla corretta organizzazione/tenant e ogni autorizzazione va validata lato server **sull'oggetto richiesto**, non semplicemente sulla route.

Il client portal deve quindi poter esporre:

progetti, milestone, deliverable, revisioni, documenti, messaggi, campagne, report, approvazioni e fatture **soltanto del cliente interessato**.

Le API devono essere testate contro rischi di Broken Object Level Authorization, che OWASP identifica tra i principali rischi delle API. citeturn9search2

### Distinguerei quattro programmi partner

Non chiamerei tutto “affiliate”.

**Referral**: qualcuno segnala il cliente e riceve una ricompensa.

**Affiliate**: attribution tramite link/codice e commissioni secondo regole.

**Reseller**: il partner rivende un'offerta OMNI101 con pricing e margine propri o concordati.

**White-label / Agency Partner**: il partner può gestire clienti, portale, branding, report e servizi sotto una relazione commerciale dedicata.

Queste modalità richiedono modelli diversi di accesso, commissione, responsabilità e customer ownership. OMNI101 dovrebbe supportarli come policy configurabili, non mescolarli in una singola tabella `affiliates`.

### Sicurezza AI

Per tutti i tool agentici introdurrei:

`tool allowlist → resource scope → budget → time limit → approval policy → execution → audit → artifact`

Un messaggio cliente, una pagina web o un file allegato devono essere trattati come **dati non attendibili**, non come istruzioni privilegiate. Questo è particolarmente importante nei sistemi con agenti che possono chiamare tool o modificare risorse. Le guide OWASP GenAI e il profilo NIST GenAI sono riferimenti appropriati per questa separazione tra contenuto non fidato, modello e capacità operative. citeturn9search13turn9search3

## SEO, GEO, paid media e misurazione: come completarli davvero

Sul tema GEO farei attenzione a non inseguire pseudo-tecniche.

Google afferma esplicitamente che per le proprie esperienze AI in Search continuano a valere i fondamentali SEO e che non serve uno speciale markup “AI” o un nuovo file magico per comparire nelle funzionalità generative. Inoltre avverte che generare grandi quantità di contenuti senza valore aggiunto può violare le policy sullo scaled content abuse. citeturn8search0turn8search4turn8search12

Quindi il modulo che chiamerei **Search & AI Discovery** deve comprendere:

**Technical SEO**: indicizzazione, canonical, redirect, performance, metadata, robots, sitemap e structured data appropriati. Google documenta l'uso dei dati strutturati per aiutare a comprendere le pagine e abilitare specifiche esperienze nei risultati, purché rispettino le relative linee guida. citeturn8search5turn8search8

**Content Intelligence**: topic map, search intent, cluster, internal linking, aggiornamenti, contenuti originali, case study e prove reali.

**Index distribution**: sitemap, Search Console e supporto a IndexNow per i motori che lo utilizzano. citeturn8search2

**AI discovery**: decidere consapevolmente il comportamento dei crawler. OpenAI documenta `OAI-SearchBot` come crawler per la ricerca di ChatGPT, separato da `GPTBot`; se si vuole essere candidati alle risposte Search di ChatGPT, la configurazione robots deve essere coerente con questa scelta. citeturn8search3

**Optional emerging metadata**: `llms.txt` può essere supportato come formato emergente per fornire materiale leggibile ai sistemi linguistici, ma è una proposta comunitaria e non va presentata come fattore di ranking ufficiale. citeturn18search0turn18search1

### Ads

Gli adapter pubblicitari devono utilizzare le API ufficiali dove disponibili. Meta espone la Marketing API per la gestione programmatica delle campagne; Google Ads offre API per campagne e reporting ed evolve per versioni; TikTok for Business espone Marketing API; LinkedIn mantiene Marketing APIs versionate e soggette a livelli di accesso. citeturn11search0turn11search1turn11search2turn11search3

Questo significa che OMNI101 deve avere un **Integration Registry** capace di memorizzare:

provider, account cliente, scope concessi, versione API, stato della connessione, token expiry, webhook, health check, last sync e permessi.

Non hardcoderei la struttura di Meta dentro il core. Costruirei un domain model comune e adapter.

### Attribution

Centralizzerei un event schema:

`page_view`  
`cta_clicked`  
`form_started`  
`form_submitted`  
`lead_qualified`  
`meeting_booked`  
`proposal_viewed`  
`proposal_accepted`  
`deal_won`  
`project_started`  
`invoice_paid`  
`renewal`  
`referral_created`

Ogni evento può avere source, medium, campaign, content, referrer e identificativi consentiti.

Il sistema deve distinguere **attribuzione osservata** da causalità. Un dashboard che attribuisce una vendita all'ultimo click non può dichiarare che quel click “ha causato” la vendita.

### Marketing calendar

Il calendario deve diventare una vista trasversale:

**Social + Email + Ads + Content + Landing launches + Events + Client approvals + Campaign milestones**

Lo stesso post può avere stato:

`IDEA → BRIEF → DRAFT → CREATIVE → REVIEW → APPROVED → SCHEDULED → PUBLISHED → ANALYZED → REPURPOSED`

e la stessa logica deve essere utilizzabile da operatori umani e agenti.

## La “fabbrica” modulare per essere pronti con qualsiasi cliente

Questa è forse la parte più importante della richiesta.

Per poter dire davvero “arriva un cliente e abbiamo già un livello avanzato pronto”, non costruirei template monolitici. Costruirei **una libreria di acceleratori componibili**.

### Capability Registry

Un catalogo interno di ciò che OMNI101 sa realizzare:

- Auth e organizations
- RBAC
- CRM
- Forms
- Search
- Uploads
- Notifications
- Payments
- Subscriptions
- Booking
- Chat
- AI assistant
- RAG/search
- Workflow
- Analytics
- Dashboard
- Client portal
- Landing pages
- Email
- Social
- Ads
- SEO
- Media generation
- Voice
- Avatar
- Computer vision
- 3D
- Approval
- Audit
- File/version management

Per ogni capability devono essere disponibili: implementation status, repo/componente, API, design patterns, security requirements, test, licenza e compatibilità.

### Blueprint Registry

Poi combinerei le capability in blueprint.

| Blueprint | Componenti preassemblati |
|---|---|
| **Lead Generation** | landing + adaptive form + CRM + nurture + calendar + attribution |
| **B2B Sales** | content/landing + qualification + meeting + proposal + follow-up |
| **Local Service** | location pages + booking + review/referral + CRM + automation |
| **E-commerce Growth** | product landing + abandoned journey + creative + ads + retention |
| **SaaS Launch** | marketing site + waitlist/trial + onboarding + lifecycle + analytics |
| **Creator/Brand Campaign** | content calendar + creative production + social + ads + attribution |
| **Event/Webinar** | registration + reminder + calendar + attendance + follow-up |
| **Customer Onboarding** | portal + milestones + email + documents + support |
| **Referral Program** | links/codes + attribution + rewards + partner portal |
| **AI Reception** | voice/chat + qualification + CRM + scheduling + handoff |

Ogni blueprint deve ereditare automaticamente:

- design tokens;
- responsive rules;
- accessibility;
- SEO defaults;
- security policies;
- analytics events;
- consent components;
- error/loading/empty states;
- email templates;
- audit;
- testing checklist.

Questo è il punto in cui il lavoro fatto sul design system acquisisce un ritorno enorme: un nuovo cliente cambia brand package e contenuti, non la qualità fondamentale dell'applicazione.

### Un nuovo cliente dovrebbe avere un onboarding industrializzato

Immagino un wizard interno:

**Create Client Workspace**

`Brand → Domain → Contacts → Permissions → Services → Channels → Email domain → Analytics → Consent → Social → Ads → Integrations → Blueprints → Approval → Launch`

Da questo processo vengono creati automaticamente solo gli oggetti necessari:

- client workspace;
- project;
- folders/assets;
- brand kit;
- component theme;
- campaign calendar;
- landing/funnel scaffold;
- analytics events;
- email templates;
- permission groups;
- client portal;
- workflow;
- reporting dashboard.

L'AI può suggerire la configurazione dal brief, ma la struttura deve essere deterministica e validata.

### Il ruolo corretto di REA

REA va utilizzato in maniera chirurgica.

Il progetto ufficiale lo presenta come toolkit per collegare agenti a strumenti di analisi di software, inclusi siti web e applicazioni JavaScript/Electron, con attenzione a evidenze e limitazioni. La sua stessa documentazione suggerisce però di **non utilizzarlo per una normale analisi architetturale quando il repository sorgente è già disponibile**. citeturn16search0turn16search2turn16search7

Quindi la policy dovrebbe essere:

**Repo open source disponibile → scarica/ispeziona il repo.**

**Documentazione API ufficiale disponibile → usa la documentazione.**

**Comportamento runtime non spiegato → browser/DevTools.**

**Comportamento complesso/proprietario osservabile e autorizzato → REA.**

**Implementazione finale → codice originale o codice con licenza compatibile.**

REA non deve diventare un rituale da applicare a ogni libreria; deve evitare lavoro quando fornisce informazioni che le fonti normali non danno.

## Mandato integrativo da inviare ora a Codex / Claude / Hermes

Il seguente prompt è progettato come **continuazione dei mandati esistenti**, non come un restart. Non impone la struttura del repository che io non posso vedere; impone invece obiettivi, invarianti e metodo di adattamento allo stato reale.

> # OMNI101 — REVENUE, GROWTH & CLIENT-READY OPERATING SYSTEM
> ## Master Continuation Mandate
>
> **Modalità:** CONTINUE CURRENT WORK · INSPECT SELECTIVELY · IMPLEMENT · INTEGRATE · VERIFY  
> **Priorità:** P0  
> **Principio:** non ricostruire ciò che esiste e funziona; non creare UI fittizie; non installare sistemi duplicati; adattarsi alla struttura reale del progetto.
>
> ### Direttiva fondamentale
>
> OMNI101 deve essere completato come piattaforma capace non soltanto di produrre lavori per clienti, ma anche di:
>
> **attrarre → acquisire → qualificare → nutrire → convertire → consegnare → fidelizzare → espandere → misurare**
>
> clienti e opportunità.
>
> Email marketing, landing page, funnel, social, advertising, SEO, AI discovery, referral, partner, reselling, customer lifecycle e analytics non devono essere moduli isolati. Devono formare un unico Revenue & Growth System collegato al CRM, ai progetti, alla knowledge base e alla Agent Workforce.
>
> Prima di iniziare qualsiasi nuovo mandato sostanziale, cattura immediatamente la richiesta originale nel sistema persistente già previsto, senza rallentare inutilmente l'esecuzione.
>
> La fonte originale non deve essere sostituita da una sintesi.
>
> Da quella fonte estrai e collega:
>
> `Mandate / Request → Requirements → Decisions → Tasks → Implementations → Tests → Release → Evidence`
>
> Se un sistema equivalente esiste già, miglioralo anziché duplicarlo.
>
> ### Capture-first protocol
>
> Ogni nuova richiesta importante deve ricevere:
>
> - ID persistente;
> - timestamp;
> - autore;
> - source/session;
> - contenuto originale;
> - sintesi;
> - requisiti estratti;
> - priorità;
> - aree interessate;
> - reference;
> - dipendenze;
> - decisioni;
> - stato;
> - collegamenti a task/PR/test.
>
> Non trasformare automaticamente ogni frase in task.
>
> Esegui triage e deduplicazione preservando sempre la provenienza.
>
> Se un requisito sostituisce un precedente, marca `SUPERSEDED_BY`; non cancellare la storia.
>
> ### Growth OS
>
> Verifica ciò che esiste e completa i domini mancanti:
>
> **Audience**
>
> contatti, aziende, lead, segmenti dinamici, lifecycle, scoring, source, activity, consent e preference.
>
> **Campaigns**
>
> entità unificata che collega obiettivo, audience, canali, asset, landing, funnel, budget, calendario, esperimenti, approvazioni e risultati.
>
> **Landing Studio**
>
> visual builder basato sul design system OMNI101, con componenti approvati, responsive preview, versioning, custom domains, SEO, analytics, experiment variants, publish/rollback.
>
> Valuta Puck come candidato quando tecnicamente compatibile con lo stack React esistente.
>
> Non permettere al modello AI di pubblicare codice arbitrario generato in una landing.
>
> L'AI deve comporre componenti autorizzati e configurazioni validate.
>
> **Funnel Studio**
>
> supporta funnel multi-step, branching, lead magnets, adaptive intake, qualification, calendar/booking, nurture, sales handoff, conversion events, experiment variants e analytics.
>
> Ogni funnel deve essere versionato e misurabile per stage.
>
> **Forms / Intake**
>
> implementa:
>
> - freeform;
> - guided;
> - conversational;
> - express;
> - multi-step;
> - progressive profiling;
> - conditional logic;
> - autosave;
> - partial capture;
> - file upload;
> - attribution;
> - consent;
> - anti-abuse;
> - validation;
> - recovery.
>
> I form devono usare il design system moderno già richiesto e non apparire come HTML form statici.
>
> Usa logica deterministica per branching semplice; usa AI quando serve interpretazione semantica.
>
> **Email Marketing**
>
> implementa o completa:
>
> - template library;
> - visual composer;
> - brand components;
> - React-based rendering quando appropriato;
> - responsive previews;
> - personalization;
> - audience;
> - segment;
> - broadcast;
> - transactional;
> - sequence;
> - journey;
> - trigger;
> - branch;
> - delay;
> - conversion event;
> - test send;
> - experiments;
> - suppression;
> - unsubscribe;
> - preference center;
> - bounce/complaint processing;
> - deliverability health;
> - SPF/DKIM/DMARC onboarding;
> - sender/domain verification;
> - analytics;
> - audit.
>
> Valuta React Email per il rendering e studia Plunk, Dittofeed, Mautic e listmonk prima di ricostruire motori equivalenti.
>
> Non installarli tutti.
>
> Mantieni audience, campaign e consent come dominio OMNI101 e utilizza adapter per delivery/provider.
>
> **Lifecycle Automation**
>
> predisponi blueprint:
>
> - welcome;
> - lead nurture;
> - quote follow-up;
> - abandoned brief;
> - onboarding;
> - project updates;
> - renewal;
> - upsell;
> - reactivation;
> - referral;
> - client satisfaction.
>
> **Social Operations**
>
> realizza:
>
> `Idea → Research → Brief → Script/Copy → Asset → Review → Approval → Schedule → Publish → Analyze → Repurpose`
>
> Con:
>
> - content calendar;
> - platform previews;
> - variants;
> - brand voice;
> - channel-specific formatting;
> - approval;
> - publishing queue;
> - failure/retry;
> - analytics;
> - repurposing.
>
> Studia Postiz e Mixpost e riutilizza idee/codice compatibile quando realmente vantaggioso.
>
> Le integrazioni social devono essere adapter, non logica hardcoded dentro i componenti.
>
> **Paid Media**
>
> predisponi adapter e UI per Meta, Google, TikTok e LinkedIn.
>
> Gestisci:
>
> - account;
> - campaigns;
> - groups/ad sets dove pertinenti;
> - ads;
> - creatives;
> - audiences;
> - budgets;
> - schedules;
> - conversion events;
> - UTM;
> - reporting;
> - approvals;
> - spend limits;
> - alerts.
>
> Non pubblicare campagne e non spendere budget senza la policy di approvazione definita.
>
> Le API esterne sono versionate e devono avere health/version tracking.
>
> **Marketing Calendar**
>
> unifica:
>
> - social;
> - email;
> - ads;
> - content;
> - landing launches;
> - events;
> - campaigns;
> - approvals;
> - client milestones.
>
> Day / Week / Month / Agenda, filtri per cliente, canale, owner, stato e campagna.
>
> **SEO & AI Discovery**
>
> implementa:
>
> - technical SEO audit;
> - metadata;
> - canonical;
> - sitemap;
> - redirects;
> - robots;
> - structured data pertinente;
> - internal linking;
> - content clusters;
> - topic backlog;
> - Search Console integration quando autorizzata;
> - Bing/IndexNow;
> - crawler policy;
> - AI-search crawler configuration;
> - optional llms.txt come formato emergente, senza presentarlo come ranking hack;
> - content refresh;
> - page performance;
> - search analytics.
>
> Non creare contenuti AI in massa privi di valore.
>
> **CRO & Experimentation**
>
> supporta:
>
> - funnel analytics;
> - experiments;
> - variants;
> - feature flags quando pertinenti;
> - conversion goals;
> - experiment guardrails;
> - winner/no-winner state;
> - history.
>
> Valuta PostHog/GrowthBook prima di costruire infrastruttura sperimentale duplicata.
>
> **Feedback & Customer Intelligence**
>
> supporta:
>
> - survey;
> - NPS/CSAT dove pertinenti;
> - feedback request;
> - project feedback;
> - churn reason;
> - qualitative insights;
> - client health.
>
> Valuta Formbricks.
>
> **Notifications**
>
> centralizza le notifiche multicanale e valuta Novu o il sistema esistente.
>
> Evita che ogni modulo implementi il proprio email sender.
>
> ### Sales engine
>
> Completa il percorso:
>
> `Visitor → Lead → Qualified → Discovery → Opportunity → Proposal → Negotiation → Won/Lost`
>
> Supporta:
>
> - lead scoring trasparente;
> - source attribution;
> - activity timeline;
> - follow-up;
> - reminders;
> - meeting;
> - proposal;
> - quote;
> - pipeline;
> - lost reason;
> - next action;
> - nurture fallback;
> - reactivation.
>
> Lo scoring deve poter combinare regole deterministicamente configurabili e segnali AI, senza trasformarsi in un punteggio opaco.
>
> ### Partner, affiliate e reseller system
>
> Non trattare tutti i partner allo stesso modo.
>
> Implementa modelli distinti:
>
> **Referral**  
> **Affiliate**  
> **Reseller**  
> **White-label / Agency Partner**
>
> Supporta, secondo il tipo:
>
> - referral links/codes;
> - attribution;
> - commission;
> - margin;
> - product/service catalog;
> - price book;
> - client ownership;
> - approval;
> - payout state;
> - partner portal;
> - reporting;
> - white-label settings;
> - delegated support;
> - audit.
>
> Studia Dub per attribution/affiliate e Stripe Connect per eventuali payout/commercial flows.
>
> Non implementare movimentazione finanziaria custom quando un provider appropriato la gestisce meglio.
>
> ### Client Factory
>
> Crea un sistema di acceleratori componibili, non template monolitici.
>
> Mantieni o crea registri equivalenti per:
>
> **Capability Registry**
>
> cosa OMNI101 può costruire, relativo componente, stato, test, security requirement, reference e licenza.
>
> **Blueprint Registry**
>
> combinazioni pronte per casi d'uso:
>
> - lead generation;
> - B2B sales;
> - local services;
> - ecommerce growth;
> - SaaS launch;
> - creator/brand campaigns;
> - events;
> - customer onboarding;
> - referral;
> - AI receptionist.
>
> **Integration Registry**
>
> provider, capability, credential reference, version, scopes, health, last sync, webhooks.
>
> **Template Registry**
>
> landing, email, social, ads, proposal, report, workflow, funnel, dashboard e creative.
>
> Ogni blueprint deve ereditare automaticamente:
>
> - brand/theme;
> - responsive behavior;
> - accessibility;
> - analytics events;
> - SEO defaults;
> - consent;
> - security;
> - error states;
> - loading states;
> - audit;
> - tests.
>
> ### New-client provisioning
>
> Progetta un processo:
>
> `Client → Brand → Domain → Users → Permissions → Services → Integrations → Channels → Consent → Blueprint → Analytics → Portal → Launch`
>
> L'AI può proporre la configurazione a partire dal brief.
>
> La creazione effettiva deve usare schemi validati e processi idempotenti.
>
> Non creare automaticamente servizi a pagamento.
>
> ### Client portal
>
> Ogni cliente deve poter accedere soltanto alle risorse autorizzate.
>
> Supporta progressivamente:
>
> - overview;
> - projects;
> - deliverables;
> - approvals;
> - comments;
> - requests;
> - files;
> - campaigns;
> - reports;
> - quotes;
> - invoices/links quando integrati;
> - support;
> - users.
>
> Autorizzazione server-side per tenant e risorsa.
>
> ### Roles & authorization
>
> Non limitarti ad Admin/User.
>
> Prevedi una matrice per:
>
> Owner, Admin, Sales, Marketing, Project Manager, Developer, Creative, Finance, Support, Client Owner, Client Admin, Client Member, Reviewer, Partner/Reseller, Contractor, Service Account, AI Agent.
>
> Non è obbligatorio creare tutti i ruoli hardcoded.
>
> Usa permission primitives e role templates.
>
> Gli agenti AI devono ricevere scope più stretti degli Owner.
>
> Valuta OpenFGA o sistemi equivalenti soltanto se la granularità esistente non è sufficiente.
>
> ### Security baseline
>
> Applica threat modeling proporzionato e verifica:
>
> - tenant isolation;
> - object-level authorization;
> - MFA/passkey;
> - session management;
> - secrets;
> - API scopes;
> - webhook verification;
> - replay protection;
> - input validation;
> - file security;
> - CSP/headers;
> - XSS/CSRF dove pertinenti;
> - rate limiting;
> - abuse/spam;
> - audit;
> - backup/recovery;
> - retention;
> - GDPR operations;
> - incident response.
>
> Per AI:
>
> - untrusted content isolation;
> - prompt-injection controls;
> - tool allowlists;
> - resource scopes;
> - budget;
> - egress control;
> - sandbox;
> - human approval;
> - artifact scanning;
> - execution audit.
>
> Utilizza OWASP ASVS, OWASP API Security e OWASP GenAI come reference di verifica, non come checkbox marketing.
>
> ### Consent & communication compliance
>
> Crea un Preference & Consent Center condiviso.
>
> Mantieni:
>
> - purpose;
> - channel;
> - status;
> - source;
> - timestamp;
> - evidence;
> - policy version;
> - revocation.
>
> Un unsubscribe/objection deve propagarsi alle campagne applicabili.
>
> Distingui messaggi transactional/service da marketing.
>
> Considera le indicazioni italiane correnti sui sistemi di tracking nelle email e rendi il tracking configurabile secondo policy.
>
> ### First-party event model
>
> Definisci o consolida un event model comune per marketing, prodotto e CRM.
>
> Gli eventi devono essere tipizzati, versionati e documentati.
>
> Collega UTM/source/campaign e, quando consentito, identificativi di advertising.
>
> Non duplicare tracking indipendente in ogni modulo.
>
> ### AI versus deterministic logic
>
> Non utilizzare un LLM per ciò che è meglio risolto con regole.
>
> AI:
>
> - intent;
> - synthesis;
> - content;
> - planning;
> - semantic classification;
> - creative work;
> - difficult analysis.
>
> Deterministico:
>
> - permissions;
> - validation;
> - scheduling;
> - routing noto;
> - suppression;
> - state machine;
> - calculations;
> - budget limits;
> - event processing.
>
> ### REA and open-source policy
>
> Prima di costruire una capability importante:
>
> 1. Verifica se esiste già nel progetto.
> 2. Verifica repository open source affidabili.
> 3. Leggi codice/documentazione quando disponibili.
> 4. Verifica licenza e security history.
> 5. Usa REA soltanto quando il comportamento runtime di una reference pubblica non è sufficientemente comprensibile dai sorgenti o dalla documentazione.
> 6. Implementa in modo originale ciò che non è riutilizzabile.
> 7. Registra la provenienza delle reference.
>
> Non utilizzare REA come sostituto della lettura di un repository open source.
>
> ### Modern UX
>
> Nessun nuovo modulo deve nascere come CRUD rudimentale.
>
> Applica:
>
> - command palette;
> - global search;
> - saved views;
> - filters;
> - inline edit;
> - kanban;
> - tables;
> - timelines;
> - detail drawers;
> - bulk actions;
> - autosave;
> - undo dove appropriato;
> - optimistic UI;
> - loading/error/empty states;
> - keyboard accessibility;
> - mobile adaptations.
>
> Marketing e CRM devono sembrare strumenti professionali moderni, non pagine admin generate.
>
> ### Ready-to-use definition
>
> “Pronto” significa, per una capability:
>
> - data model;
> - UI;
> - authorization;
> - validation;
> - workflow;
> - integration adapter;
> - error handling;
> - analytics;
> - audit;
> - responsive behavior;
> - tests;
> - documentation;
> - configuration/onboarding;
> - demo/test mode.
>
> Non significa che credenziali di Meta, Google, provider email o servizi a pagamento possano essere inventate.
>
> Quando manca una connessione esterna:
>
> `READY_FOR_CONNECTION`
>
> e non `WORKING`.
>
> ### Verification
>
> Dopo ogni vertical slice:
>
> - test code;
> - test browser;
> - test permissions;
> - test responsive;
> - test error states;
> - test real persistence;
> - verify analytics events;
> - verify audit;
> - verify no client data leakage.
>
> Prima di dichiarare una feature online e funzionante, verificarla realmente nello staging/deployment appropriato.
>
> ### Priorità di esecuzione
>
> **P0 — Revenue foundation**
>
> Capture-first, Campaign domain, Audience/Consent, Landing/Funnel, Email foundation, Growth calendar, Attribution, Sales integration.
>
> **P0 — Security**
>
> Tenant isolation, roles/permissions, client portal boundaries, agent scopes, audit, secrets and communication compliance.
>
> **P1 — Channel operations**
>
> Social, Ads adapters, SEO/AI discovery, CRO, surveys and lifecycle automations.
>
> **P1 — Client factory**
>
> Capability Registry, Blueprint Registry, Integration Registry, new-client provisioning.
>
> **P2 — Commercial expansion**
>
> Affiliate, Referral, Reseller, White-label partner, advanced billing/metering.
>
> Parallelizza i workstream compatibili, ma non creare sistemi duplicati.
>
> ### Deliverable finale di questo mandato
>
> Non consegnare un nuovo documento strategico enorme.
>
> Al termine mostra sinteticamente:
>
> - ciò che esisteva;
> - ciò che è stato riutilizzato;
> - ciò che è stato implementato;
> - ciò che è connesso realmente;
> - ciò che è `READY_FOR_CONNECTION`;
> - le integrazioni scartate e perché;
> - test eseguiti;
> - rischi/blocchi;
> - requirement coverage aggiornato;
> - next highest-value actions.
>
> **Continua il lavoro corrente. Non resettare il progetto. Non installare tutto. Costruisci la piattaforma di crescita e delivery più completa possibile utilizzando in modo intelligente ciò che già esiste.**

## La sintesi strategica

La cosa più importante che aggiungerei rispetto a tutti i mandati precedenti è questa:

**OMNI101 deve trasformarsi da “software usato dall'agenzia” a “sistema da cui l'agenzia può produrre rapidamente sistemi per i clienti”.**

Ciò significa che ogni volta che costruisci una funzione internamente devi chiederti:

**Può diventare una capability riutilizzabile?**

Il tuo modulo campagne può diventare il marketing system di un cliente. Il tuo intake può diventare la reception digitale di un'altra azienda. Il tuo client portal può essere riutilizzato per un servizio professionale. Il workflow engine può diventare il motore operativo di un business. Il Page Builder può generare siti e funnel. Il media system può diventare una piattaforma di produzione. Il sistema affiliate può essere venduto a un e-commerce.

La vera leva non è quindi avere cinquanta funzioni. È avere **primitive di qualità industriale che si possono combinare velocemente**.

E il secondo principio è altrettanto importante: **acquisizione e delivery devono usare la stessa memoria**.

Un annuncio non finisce quando produce un lead. Il sistema deve sapere quale campagna lo ha generato, che brief ha compilato, quale proposta ha ricevuto, che progetto è nato, quanto è costato produrlo, quale margine ha generato e se quel cliente ha poi acquistato altro.

È lì che OMNI101 smette di essere una somma di CRM, AI, email e dashboard e diventa davvero un **Agency Operating System orientato alla crescita**.