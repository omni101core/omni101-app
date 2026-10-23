# OMNI101 — PRODUCT EXCELLENCE & AUTONOMOUS AGENCY OS
## Master Continuation Mandate · 23 ottobre 2026

**Progetto:** omni101.app  
**Modalità:** CONTINUE, IMPROVE, IMPLEMENT, VALIDATE  
**Priorità:** Massima  
**Ambito:** Frontend pubblico, UX, design system, backend, dashboard, CRM, marketing, collaborazione, agenti AI e infrastruttura  
**Target:** Cloudflare, senza dipendenze produttive dal Mac Studio  
**Responsabile:** agente di coding attualmente incaricato, Claude Code o Codex

---

# 0. DIRETTIVA CENTRALE — NON VOGLIO PIÙ DOVER INDICARE OGNI COMPONENTE

L'utente ha già fornito un numero considerevole di mandati, reference, esempi, screenshot, richieste commerciali e specifiche tecniche.

Il problema è che la realizzazione non raggiunge ancora il livello qualitativo atteso in maniera sistematica.

Vengono implementate singole funzionalità, ma spesso con:

- Componenti visivamente rudimentali.
- Form statici.
- Modali convenzionali poco curati.
- Pagine con strutture ripetitive.
- Navigazione poco intelligente.
- Esperienze non pienamente responsive.
- Funzioni isolate.
- Interazioni senza feedback.
- Pagine che non valorizzano il design disponibile.
- Workflow incompleti.
- Configurazioni difficili da gestire.
- Integrazioni poco intuitive.
- Potenzialità AI insufficientemente sfruttate.
- Assenza di un processo di revisione dell'intera esperienza.

**Devi smettere di trattare ogni richiesta come una modifica locale.**

Quando sviluppi un elemento, ragiona come product designer, UX engineer, frontend engineer, software architect, creative director e product manager contemporaneamente.

Non aspettare che il proprietario ti chieda:

- Di animare un dialog.
- Di migliorare un form.
- Di aggiungere un empty state.
- Di renderlo responsive.
- Di prevedere una conferma.
- Di introdurre una scorciatoia.
- Di rendere modificabile un workflow.
- Di collegarlo a un agente.
- Di prevedere loading ed errori.
- Di integrare un onboarding.
- Di creare un collegamento commerciale.
- Di centralizzare la configurazione.

Queste valutazioni devono diventare parte automatica del tuo processo.

**Ogni componente deve essere una soluzione di prodotto completa, non una semplice rappresentazione grafica.**

Non ricominciare da zero: il progetto è già in sviluppo. Preserva e migliora il lavoro funzionante.

---

# 1. PRINCIPIO DI PRODUCT EXCELLENCE

Per qualsiasi pagina, componente o funzionalità applica obbligatoriamente dieci dimensioni di qualità.

1. **Purpose:** quale problema risolve?
2. **Clarity:** è comprensibile senza spiegazioni?
3. **Visual quality:** è coerente con un prodotto premium?
4. **Interaction:** come reagisce alle azioni?
5. **State:** quali stati reali può assumere?
6. **Accessibility:** funziona con tastiera, touch e tecnologie assistive?
7. **Responsiveness:** si adatta correttamente allo spazio?
8. **Integration:** quali dati, servizi o workflow utilizza?
9. **Efficiency:** elimina passaggi inutili e previene errori?
10. **Extensibility:** è riutilizzabile e configurabile?

Non considerare completo un componente che soddisfa soltanto le prime tre.

Implementa comportamenti adeguati per:

- Default.
- Hover quando pertinente.
- Focus.
- Active.
- Disabled.
- Loading.
- Empty.
- Success.
- Error.
- Pending.
- Offline o network unavailable, quando pertinente.
- Unauthorized.
- Read-only.
- Partial completion.
- Retry.
- Confirmation.
- Undo, quando possibile.

Non tutte le varianti devono essere visibili ovunque: devono esistere quelle appropriate al comportamento reale.

---

# 2. UNIVERSAL UI COMPONENT SYSTEM

Crea o consolida una libreria interna di componenti di prodotto, organizzata per responsabilità.

Non creare componenti visualmente simili con implementazioni indipendenti in ogni pagina.

## 2.1 Azioni e navigazione

- Primary button.
- Secondary button.
- Ghost button.
- Icon button.
- Split button.
- Dropdown button.
- Loading button.
- Confirmation button.
- Segmented control.
- Tabs.
- Breadcrumb.
- Sidebar navigation.
- Contextual navigation.
- Command palette.
- Global search.
- Search suggestions.
- Quick actions.
- Keyboard shortcuts.
- Navigation history.
- Mobile bottom navigation, dove appropriata.
- Context menu.
- Floating action menu, soltanto dove utile.

## 2.2 Form e input

- Text input.
- Textarea.
- Auto-resizing textarea.
- Combobox.
- Searchable select.
- Multi-select.
- Tag input.
- Date/time picker.
- Date range picker.
- File upload.
- Drag-and-drop upload.
- Radio.
- Checkbox.
- Switch.
- Slider.
- Rich text editor.
- Code editor, per configurazioni tecniche.
- OTP/passkey interface.
- Adaptive form.
- Conditional fields.
- Multi-step form.
- Inline validation.
- Autosave.
- Draft recovery.
- Progress indication.
- Upload progress.
- Unsaved changes protection.

I form devono avere logica e microcopy progettati.

Non accumulare campi senza gerarchia.

## 2.3 Overlay e superfici temporanee

- Modal.
- Alert dialog.
- Morphing dialog.
- Popover.
- Morphing popover.
- Tooltip.
- Drawer.
- Side sheet.
- Bottom sheet mobile.
- Command dialog.
- Context menu.
- Toast.
- Snackbar.
- Notification center.
- Inline alert.
- Confirmation prompt.

Per ciascuno definisci quando usare un overlay e quando una pagina dedicata.

Non aprire un modal per operazioni che richiedono molto spazio o più passaggi complessi.

## 2.4 Presentazione dei dati

- Data table.
- Sortable table.
- Filterable table.
- Column visibility.
- Column resizing.
- Row actions.
- Bulk selection.
- Pagination.
- Virtualized list.
- Kanban.
- List view.
- Calendar.
- Timeline.
- Gantt, quando serve.
- Tree view.
- Graph view.
- Activity feed.
- Status badge.
- Avatar group.
- Progress bar.
- Stepper.
- Charts.
- Inspector panel.
- Detail view.
- Expandable row.
- Diff viewer.
- Before/after comparator.

## 2.5 Collaborazione

- Comments.
- Threaded discussion.
- Mentions.
- Reactions, se utili.
- Presence indicator.
- Assignment picker.
- Approval component.
- Review checklist.
- Activity history.
- Version history.
- Change comparison.
- Share dialog.
- Invite members.
- Role picker.
- Permission inspector.
- Access request.
- Invite status.
- Access revocation.

## 2.6 AI components

- Chat.
- Streaming response.
- Tool call preview.
- Action confirmation.
- Generated form.
- Generative UI cards.
- Agent status.
- Agent timeline.
- Run inspector.
- Artifact preview.
- Token and cost display.
- Model selector.
- Provider status.
- Context source viewer.
- Workflow graph.
- Approval request.
- Execution log.
- Error recovery.
- Human handoff.

## 2.7 Media components

- Image viewer.
- Video player.
- Audio player.
- Waveform.
- Media comparison.
- Gallery.
- Canvas.
- Storyboard.
- Timeline.
- Crop controls.
- Annotation.
- Asset selector.
- Version selector.
- Video poster.
- 3D viewer.
- Generation progress.

Non implementare ogni controllo come progetto indipendente: costruisci fondamenta condivise e introduci le componenti quando richieste da una schermata reale.

---

# 3. REFERENCE LIBRARY — DECISIONI GIÀ DEFINITE

Utilizza il seguente catalogo come base concreta, non come lista da esplorare indefinitamente.

## Modern UI e componenti

https://21st.dev

https://reactbits.dev

https://ui.aceternity.com

https://magicui.design

https://motion-primitives.com

https://www.hover.dev

https://www.fancycomponents.dev

https://kokonutui.com

https://animate-ui.com

https://ui.shadcn.com

https://www.radix-ui.com

https://react-spectrum.adobe.com/react-aria/

## Reference mirate

Morphing dialog:
https://motion-primitives.com/docs/morphing-dialog

Morphing popover:
https://motion-primitives.com/docs/morphing-popover

Team invitation:
https://www.shadcn.io/examples/dialog-invite-team-members

Team management:
https://www.shadcn.io/blocks/account-team-members

React Flow:
https://reactflow.dev/examples

Better Auth organization:
https://better-auth-ui.com/docs/shadcn/plugins/organization

## Creative engineering

https://tympanus.net/codrops/

https://tympanus.net/codrops/hub/

https://tympanus.net/Tutorials/Cinematic3DScroll/

https://gsap.com

https://motion.dev

https://threejs.org

https://r3f.docs.pmnd.rs

https://rive.app

## Art direction

https://www.avivashishta.com

https://activetheory.com

https://locomotive.ca

https://unseen.co

https://clay.global

https://www.awwwards.com

## AI product UX

https://elevenlabs.io

https://www.heygen.com

https://runwayml.com

https://higgsfield.ai

https://www.krea.ai

https://creatify.ai

https://lovable.dev

https://replit.com

## Productivity e automazione

https://linear.app

https://www.notion.so

https://n8n.io

https://www.make.com

https://reactflow.dev

Studia anche le convenzioni di Raycast, GitHub, moderni CRM e applicazioni collaborative.

### Regola

Non scegliere il primo componente disponibile.

Per pattern importanti confronta almeno due soluzioni pertinenti, scegli quella tecnicamente e visivamente più adatta, integrala nel design system e verifica il risultato.

Non importare dipendenze senza necessità.

Non copiare codice o asset senza i diritti necessari.

---

# 4. MODERN FORM EXPERIENCE — CASO PRIORITARIO

I form attuali devono essere riesaminati globalmente.

Sostituisci l'idea del classico formulario con un sistema di raccolta informazioni adattivo.

## Public Project Intake

Il cliente può iniziare in tre modi:

**A. Testo libero**

"Raccontaci cosa vuoi realizzare."

**B. Esplorazione guidata**

Selezione del risultato desiderato attraverso opzioni comprensibili.

**C. Assistente conversazionale**

Dialogo con suggerimenti e componenti dinamici.

I tre percorsi devono convergere nello stesso modello dati.

### Funzionalità

- Autosave.
- Resume.
- Progressive disclosure.
- Conditional questions.
- File attachments.
- Voice input opzionale.
- Smart suggestions.
- Validation.
- Duplicate detection.
- CRM integration.
- AI brief enhancement dove realmente utile.
- Review step.
- Confirmation.
- Follow-up.

Le domande devono essere poche, pertinenti e adattate al contesto.

Esempio: se il cliente vuole un avatar, chiedi finalità e tipo di contenuto, non informazioni inutili sul numero di pagine del sito.

Non chiamare un modello AI per mostrare o nascondere un campo: usa logica deterministica.

---

# 5. TEAM INVITATIONS — IMPLEMENTAZIONE MODERNA

Il proprietario ha già un collaboratore entrato nel workspace.

Non ricreare il suo account o cambiare i suoi privilegi senza necessità.

Riprogetta completamente il flusso di gestione persone.

## People & Access

L'interfaccia deve prevedere:

- Lista dei membri.
- Ricerca.
- Filtri.
- Avatar.
- Nome.
- Email.
- Ruolo.
- Stato.
- Ultimo accesso, se disponibile.
- Inviti pendenti.
- Inviti scaduti.
- Dettaglio autorizzazioni.
- Accessi alle integrazioni.
- Opzioni di revoca.

## Invite Flow

Un pulsante "Invita persone" apre un dialog moderno.

Il dialog permette:

1. Inserimento email.
2. Invito multiplo, dove appropriato.
3. Selezione del ruolo.
4. Visualizzazione dei permessi effettivi.
5. Invio.
6. Conferma.
7. Copia link sicuro, se previsto.
8. Verifica stato.
9. Reinvia invito.
10. Revoca.

Il tutto con validazioni, stati e feedback adeguati.

Non limitarti a un input email con bottone Submit.

## Owners

Due account individuali Owner con pari privilegi applicativi.

Le credenziali non devono essere condivise.

Gli accessi alle integrazioni esterne devono essere gestiti separatamente.

---

# 6. DESIGN SYSTEM CONFIGURABILE E CENTRALIZZATO

Questo è un requisito architetturale fondamentale.

Non voglio che per cambiare l'identità visiva sia necessario modificare decine di componenti.

Realizza un sistema centralizzato di design tokens.

## Token categories

### Brand

- Logo.
- Wordmark.
- Favicon.
- Accento.
- Palette.
- Asset.
- Logo variants.

### Colors

- Background.
- Surface.
- Elevated.
- Text.
- Muted.
- Border.
- Action.
- Success.
- Warning.
- Error.
- Information.
- Chart palette.

### Typography

- Families.
- Font weights.
- Type scale.
- Line height.
- Letter spacing.
- Display styles.
- UI styles.

### Geometry

- Spacing.
- Radius.
- Borders.
- Shadows.
- Elevation.
- Grid.
- Container width.
- Breakpoints.
- Component density.

### Motion

- Duration.
- Easing.
- Stagger.
- Spring.
- Entrance.
- Exit.
- Hover.
- Layout transition.
- Reduced-motion fallback.

### Cinematic motion

- Scene preset.
- Camera timing.
- Scroll behavior.
- Object transition.
- Text reveal.
- Media reveal.
- Background treatment.
- Quality level.

### Component variants

- Button styles.
- Form styles.
- Dialog styles.
- Card styles.
- Navigation styles.
- Workspace density.

## Theme system

Prevedi:

- Public light.
- Public dark.
- Workspace light.
- Workspace dark.
- System preference.
- Persistence.

I due ambienti possono avere preset differenti ma devono condividere il vocabolario del brand.

Non obbligare tutte le animazioni 3D a reagire a un semplice cambio di colore: centralizza i parametri, lasciando comportamenti specifici dove tecnicamente necessari.

## Brand Studio

Aggiungi un'area amministrativa che permetta di gestire le principali impostazioni visuali.

Funzioni:

- Preview.
- Presets.
- Draft.
- Version history.
- Publish.
- Revert.
- Theme validation.
- Contrast checks.

Le modifiche sensibili al brand devono essere revisionabili.

Evita di memorizzare configurazioni arbitrarie e non validate che possano rompere l'interfaccia.

---

# 7. PUBLIC EXPERIENCE — UX E COPYWRITING

La parte pubblica deve essere immediatamente comprensibile anche a chi non conosce la tecnologia.

Non presentare OMNI101 come un insieme di termini tecnici.

Usa il principio:

**Problema → Possibilità → Dimostrazione → Risultato → Contatto.**

## Homepage

Headline:

**La tua idea.
Oltre il software.**

Supporting copy:

**Diamo forma a siti, applicazioni, esperienze creative e sistemi intelligenti. Dall'idea al prodotto che funziona.**

CTA:

**Raccontaci la tua idea**

**Esplora cosa possiamo creare**

## Hero

Apri con un'esperienza veramente fullscreen, responsive, leggibile.

Usa una narrazione cinematografica, non una hero compressa dentro un container.

Motion originale e curato.

CTA immediata.

## Capabilities

Mostra chiaramente:

- Software.
- SaaS.
- E-commerce.
- Marketplace.
- Gestionale.
- Agent AI.
- Automazioni.
- Voice.
- Avatar.
- Generative video.
- Images.
- Computer vision.
- Gesture control.
- Creative media.
- Marketing.
- Data.
- 3D.
- Connected systems.

Non mostrare tutto sotto forma di una griglia infinita.

Organizza capacità, applicazioni e combinazioni.

## Product showcase

Le reference di ElevenLabs e HeyGen servono per il modo in cui rendono comprensibili capacità complesse.

Le reference Codrops servono per narrazione, movimento, profondità e impatto.

Uniscile.

Mostra:

- Player audio.
- Avatar video.
- Comparatore media.
- Workflow animato.
- Software preview.
- Camera vision demo.
- AI generation pipeline.
- E-commerce interattivo.

Non inventare risultati e non presentare simulazioni come servizi già operativi.

## Explore

Sezione immersiva con Cinematic 3D Scroll e visual storytelling.

La camera e gli oggetti devono accompagnare la comprensione, non nasconderla.

## Portfolio

Progetti verificati, concept chiaramente dichiarati e presentazioni curate.

## Learning / Insights

Contenuti formativi, esempi, tutorial, casi studio, ricerche e dimostrazioni utili anche per acquisizione clienti.

## Conversion

Brief adattivo, assistente, contatto umano e percorso commerciale.

---

# 8. PUBLIC AI ASSISTANT — HYBRID INTELLIGENCE

L'assistente pubblico non deve essere soltanto un chatbot.

Deve diventare una modalità alternativa per usare OMNI101.

## Capacità

- Rispondere a domande.
- Cercare nei contenuti.
- Suggerire servizi.
- Individuare possibilità correlate.
- Aprire le pagine pertinenti.
- Evidenziare componenti.
- Mostrare demo.
- Generare form contestuali.
- Aiutare a completare il brief.
- Creare lead autorizzati.
- Proporre handoff umano.
- Recuperare una richiesta salvata.

## Tre livelli

**Livello 1 — Deterministico**

Route matching, ricerca, FAQ strutturate, filtri, catalogo, navigazione e regole.

**Livello 2 — AI interpretativa**

Comprensione dell'intenzione e classificazione dei bisogni.

**Livello 3 — AI operativa**

Generazione di proposte, sintesi dei brief e avvio di workflow autorizzati.

Non chiamare un modello quando il primo livello risolve già il compito.

## Generative UI

L'assistente deve poter mostrare:

- Card.
- Tabelle.
- Comparazioni.
- Anteprime.
- Form.
- Checklist.
- Demo.
- Timeline.
- Proposte.
- CTA.

Utilizza un registro di componenti consentiti e schemi di input validati.

Non eseguire codice arbitrario generato dai modelli.

---

# 9. COMPLETE AGENCY OS — MODULI OPERATIVI

Il workspace deve supportare la gestione completa dell'agenzia.

## Command Center

- Overview.
- Quick actions.
- Search.
- AI copilot.
- Notification center.
- Approvals.
- Recent work.
- Deadlines.
- Workload.
- Costs.
- Revenue.
- Operational alerts.

## Sales & CRM

- Inbox.
- Leads.
- Contacts.
- Companies.
- Opportunities.
- Deals.
- Sales pipeline.
- Activities.
- Notes.
- Proposals.
- Follow-ups.
- Customer history.

## Project Delivery

- Projects.
- Milestones.
- Tasks.
- Dependencies.
- Kanban.
- Timeline.
- Calendar.
- Deliverables.
- Files.
- Client feedback.
- Revision management.
- QA.
- Releases.

## Workforce AI

- Mission Control.
- Agent Registry.
- Agent Runs.
- Tool registry.
- Model providers.
- Artifact management.
- Budgets.
- Policies.
- Approvals.
- Execution history.
- Observability.

## Workflow Automation

- Node editor.
- Trigger.
- Conditions.
- Data mapping.
- Transformations.
- AI steps.
- External integrations.
- Approval steps.
- Test mode.
- Versioning.
- Schedules.
- Error recovery.
- Retry.
- Logs.
- Templates.

## Marketing & Growth

Questa è una delle lacune principali da colmare.

Implementa un modulo dedicato con:

- Marketing overview.
- Campaign management.
- Campaign calendar.
- Funnel builder.
- Landing management.
- Lead sources.
- Email campaigns.
- Sequences.
- Audience segmentation.
- CRM automation.
- Social publishing planning.
- Content calendar.
- Creative production.
- Ad creative variants.
- SEO workspace.
- Content briefs.
- Keyword and topic planning.
- Search Console integration, se autorizzata.
- Analytics.
- Conversion goals.
- Attribution.
- A/B experiments.
- Retention.
- Referral tracking.
- Campaign costs.
- Performance reporting.

Le integrazioni reali devono rispettare le API e gli accessi disponibili.

Non rappresentare come attivi canali pubblicitari o email non connessi.

## Creative Production

- Asset library.
- Brand kits.
- Moodboards.
- Storyboards.
- Video projects.
- Image variants.
- Voice assets.
- Avatar assets.
- Dubbing projects.
- Localization.
- Media review.
- Approval.
- Render queue.
- Rights and licensing metadata.

## Operations

- Services.
- Pricing.
- Estimates.
- Proposals.
- Contracts.
- Invoices.
- Expenses.
- Subscriptions.
- AI provider costs.
- Cloud costs.
- Margins.
- Resource planning.
- Standard operating procedures.
- Templates.
- Knowledge base.

## Customer Experience

- Client portal.
- Messages.
- Requests.
- Tickets.
- Files.
- Projects.
- Milestones.
- Approvals.
- Deliverables.
- Feedback.
- Support history.

## Administration

- People.
- Roles.
- Permissions.
- Organizations.
- Integrations.
- Secrets references.
- API keys with scoped management.
- Webhooks.
- Audit logs.
- Usage.
- Billing configuration.
- Feature flags.
- Brand Studio.
- Theme settings.
- Security settings.
- Data retention.

Non creare un menu ingestibile contenente decine di voci indistinte.

Organizza con una navigazione gerarchica, ricerca globale e command palette.

---

# 10. DASHBOARD UX — MODERN PRODUCTIVITY

La dashboard non deve utilizzare 3D decorativo.

Il criterio è aumentare l'efficienza.

## Pattern obbligatori dove appropriati

- Kanban drag-and-drop.
- Tabelle avanzate.
- Saved views.
- Filter presets.
- Inline editing.
- Split view.
- Detail drawer.
- Bulk actions.
- Undo.
- Autosave.
- Keyboard navigation.
- Command palette.
- Contextual actions.
- Quick create.
- Notifications.
- Activity feeds.
- Comments.
- Presence.
- Structured approvals.
- Workflow graph.
- Drill-down analytics.

## Navigation

- Sidebar personalizzabile.
- Gruppi richiudibili.
- Favoriti.
- Recent items.
- Workspace switcher.
- Search.
- Breadcrumb.
- Responsive navigation.

## Empty states

Non mostrare soltanto zeri.

Se non ci sono lead:

"Non hai ancora ricevuto richieste. Prova il modulo pubblico o condividi il link."

Se non ci sono progetti:

"Crea il primo progetto o converti una trattativa."

Se non ci sono agent runs:

"Assegna un incarico o prova un workflow dimostrativo."

Le azioni devono funzionare.

I dati dimostrativi devono essere chiaramente separati da quelli reali.

---

# 11. WORKFLOW BUILDER — N8N/MAKE INSPIRED

Usa React Flow / XYFlow.

Non creare un canvas con nodi decorativi.

Funzionalità:

- Drag and drop.
- Node library.
- Trigger.
- Conditions.
- Branches.
- Data mapping.
- Inspectors.
- Undo/redo.
- Copy/paste.
- Subflows.
- Validation.
- Test mode.
- Execution trace.
- Versioning.
- Templates.
- Scheduling.
- Retry.
- Error paths.
- Human approval.
- Cost estimates.

Il workflow visuale deve corrispondere a un backend realmente capace di eseguirlo.

Per moduli CRUD o stati semplici preferisci normale codice e regole deterministiche.

Non coinvolgere LLM per operazioni meccaniche.

---

# 12. AUTONOMOUS AI AGENCY

Una richiesta commerciale deve poter diventare automaticamente un incarico strutturato.

Pipeline:

Intake → Qualification → Discovery → Solution Architecture → Estimate → Approval → Project → Planning → Execution → QA → Delivery → Maintenance.

Gli agenti devono avere:

- Ruolo.
- Istruzioni versionate.
- Input.
- Output validato.
- Tool.
- Access policy.
- Budget.
- Model routing.
- Context.
- Run history.
- Artifacts.
- Retry.
- Timeout.
- Stop.
- Human handoff.

Le attività di coding possono produrre branch, PR, preview e test in sandbox cloud, quando configurati.

Non concedere permessi di deploy produttivo indiscriminati.

I soci possono approvare, interrompere, riprendere e revisionare.

---

# 13. COLLABORAZIONE TRA SOCI E AGENTI DI CODING

Questo è un requisito prioritario.

Il secondo socio ha già avuto accesso al workspace OMNI101.

Deve poter collaborare in modo semplice usando i propri strumenti AI.

Non deve essere costretto a utilizzare il computer personale del primo socio.

## Architettura scelta

**GitHub come source of truth del codice.**

**OMNI101 come control surface dei progetti e delle attività.**

**Coding agents come esecutori intercambiabili.**

**Cloudflare come runtime dell'applicazione.**

**Cloud sandboxes come ambienti di sviluppo ed esecuzione quando necessari.**

## GitHub collaboration

Implementa o configura:

- Organizzazione o repository condiviso.
- Inviti per i due soci.
- Ruoli appropriati.
- Branch protection.
- Pull requests.
- Code review.
- Required checks.
- Preview deployment.
- Issue/Task synchronization.
- GitHub Actions.
- Deploy approval.
- Audit trail.

## Connect Your Agent

Aggiungi nel workspace una funzionalità dedicata:

**Connetti i tuoi strumenti di sviluppo.**

Dovrebbe permettere ai soci di:

1. Aprire il repository.
2. Connettere l'account GitHub, quando l'integrazione è disponibile.
3. Visualizzare branch e PR.
4. Collegare un task OMNI101 a un issue GitHub.
5. Copiare un brief agent-ready.
6. Aprire una PR o il relativo ambiente di sviluppo.
7. Vedere una preview.
8. Inviare il risultato in review.
9. Consultare l'avanzamento senza uscire dal contesto.
10. Riprendere il lavoro da un altro dispositivo.

Supporta integrazioni con Codex, Claude Code e agenti compatibili attraverso interfacce ufficiali e permessi reali.

Non presumere che ogni prodotto offra un URL scheme, API o avvio remoto identico.

## Agent-ready handoff

Per ciascun task genera un pacchetto trasferibile:

- Contesto.
- Obiettivo.
- Repository.
- Branch.
- File rilevanti.
- Criteri di accettazione.
- Vincoli.
- Link di riferimento.
- Test richiesti.
- Stato.
- ID del task.
- Destinazione degli output.

Il pacchetto deve funzionare anche con un semplice copy-to-clipboard quando l'integrazione diretta non esiste.

## Cloud coding reference

Valuta OpenHands Agent Canvas come riferimento per un sistema di agenti con backend locali e remoti.

Valuta Cloudflare Sandboxes per esecuzione isolata, verificando costi, requisiti e funzionalità del piano.

Non costruire da zero un clone integrale di Codex Desktop o Claude Code.

Integra ciò che esiste e sviluppa soltanto le componenti necessarie.

## Equal owners

I due soci hanno privilegi applicativi equivalenti.

Mantieni account, credenziali, sessioni e audit separati.

Non concedere automaticamente a un agente AI tutti i privilegi del suo proprietario: i permessi degli agenti devono essere più restrittivi e specifici.

---

# 14. REA — INVESTIGATION & REUSABLE CAPABILITY ENGINE

REA è una capacità di ricerca tecnica dell'ambiente agentico.

Verifica la configurazione già presente.

Non reinstallare e non sovrascrivere MCP senza necessità.

## Quando usare REA

- Comportamento di un'app non chiarito dal codice accessibile.
- Analisi di interazioni pubbliche autorizzate.
- Struttura di una web app.
- Investigazione di formati.
- Analisi di desktop app.
- Verifica del runtime.
- Interoperabilità.
- Ricostruzione originale di funzionalità osservabili.

## Quando NON usarlo

- Repository open source completo già disponibile.
- Normale lettura del codice.
- Implementazione di componenti documentati.
- Integrazione di API ufficiali.
- Problemi risolvibili tramite documentazione e debugger.

## Workflow

Source available → Read source.

Source incomplete → Browser + DevTools.

Runtime behavior unclear → REA.

Implementation → Original code.

Validation → Tests + browser evidence.

Non replicare materiale proprietario senza autorizzazione.

Conserva riferimenti, licenze e motivazioni tecniche.

---

# 15. AI VERSUS DETERMINISTIC SOFTWARE

Non utilizzare AI per ogni funzione.

Crea una matrice di decisione.

## Regole deterministiche

Utilizza software ordinario per:

- Routing.
- Filtri.
- Ricerca strutturata.
- Calcoli.
- Validazione.
- Permessi.
- Stati dei workflow.
- Ordinamento.
- Scheduling.
- Deduplicazione esatta.
- Form adattivi basati su regole.
- Automazioni ripetitive.
- Event dispatch.
- Cost accounting.
- UI state.

## Algoritmi e modelli specializzati

Utilizza quando appropriato:

- Ricerca full-text.
- Fuzzy matching.
- Classificazione basata su regole.
- Semantic search.
- OCR specializzato.
- Speech recognition.
- Computer vision.
- Face/hand landmarks.
- Embeddings.
- Recommendation logic.

## LLM

Utilizza per:

- Comprensione di richieste libere.
- Discovery di bisogni.
- Redazione.
- Architettura di soluzione.
- Generazione di contenuti.
- Ragionamento complesso.
- Coding.
- Sintesi.
- Pianificazione ambigua.
- Analisi documentale.

## Decision policy

Prima di introdurre una chiamata AI rispondi:

1. Serve davvero?
2. Esiste un algoritmo più semplice?
3. Qual è il costo?
4. Qual è la latenza?
5. Quali dati verrebbero trasmessi?
6. Serve supervisione?
7. Esiste fallback?
8. Il risultato è verificabile?

Riduci i costi e aumenta l'affidabilità.

---

# 16. MARKETING, SEO E DISTRIBUZIONE

OMNI101 deve essere un'agenzia capace di acquisire clienti anche attraverso i propri strumenti.

Implementa un sistema coerente che collega:

- Content hub.
- SEO.
- Landing.
- Funnel.
- Forms.
- Chat assistant.
- CRM.
- Campaigns.
- Email.
- Attribution.
- Analytics.
- Sales.
- Proposal.
- Project.

## SEO

- SSR.
- Metadata.
- Canonical.
- Sitemap.
- Robots.
- Structured data.
- Internal linking.
- Multi-language readiness.
- Performance.
- Redirect.
- Open Graph.
- Content quality.
- Search Console quando autorizzata.

## Marketing compliance

- Consent records.
- Unsubscribe.
- Suppression lists.
- Frequency controls.
- Data minimization.
- Email deliverability.
- Audit.
- Privacy.
- GDPR.

Non inviare campagne reali senza configurazione e autorizzazione.

---

# 17. DATA, BACKEND E INTEGRAZIONI

L'architettura deve essere modulare.

Distinguere:

- UI.
- Domain logic.
- Application services.
- Data access.
- Integrations.
- AI runtime.
- Workflow runtime.
- Jobs.
- Observability.

Evita che i componenti React chiamino direttamente servizi esterni sensibili.

Usa API tipizzate e validazioni server-side.

Mantieni D1, R2, Workers, Queues e Workflows quando pertinenti e già compatibili con l'implementazione esistente.

Gestisci:

- Database migrations.
- Indexes.
- Authorization.
- Audit.
- Rate limits.
- Retries.
- Idempotency.
- Error boundaries.
- Logging.
- Secrets.
- Data retention.
- Export.
- Recovery.

Predisponi adapter sostituibili per servizi email, CRM esterni, storage e provider AI.

Non introdurre dipendenze monolitiche da un solo vendor.

---

# 18. ACCESSIBILITÀ E RESPONSIVE

Ogni componente deve funzionare correttamente su:

- Desktop.
- Laptop.
- Tablet.
- Mobile.
- Touch.
- Keyboard.
- Screen reader dove pertinente.
- Reduced motion.

Test espliciti:

320, 375, 768, 1024, 1440 e 1920 px.

Non limitarti a restringere gli elementi desktop.

Per mobile:

- Tabelle diventano viste utilizzabili.
- Kanban supporta un'alternativa ergonomica.
- Workflow canvas ha navigazione e inspector adattati.
- Dialog complessi possono diventare sheet.
- Form diventano più semplici.
- Media sono ottimizzati.
- 3D usa qualità ridotta o fallback.

Le esperienze gestuali devono avere alternative standard.

---

# 19. COMPONENT AND EXPERIENCE QUALITY GATES

Ogni componente importante deve passare:

**Visual Review**

È coerente, leggibile e ben rifinito?

**Interaction Review**

Gli stati e le microinterazioni sono appropriati?

**Functional Review**

Opera su dati reali?

**Responsive Review**

Funziona su diverse dimensioni?

**Accessibility Review**

È utilizzabile con input diversi?

**Integration Review**

È collegato correttamente al sistema?

**Regression Review**

Non ha compromesso funzionalità già operative?

**Maintainability Review**

Il codice è modulare, documentato e riutilizzabile?

Non accettare il mero completamento del JSX o del CSS come Definition of Done.

---

# 20. NON SPRECARE TOKEN E SESSIONI

Questa direttiva deve essere eseguita efficientemente.

Non rifare un audit generale ogni volta.

Non generare documenti strategici ridondanti.

Non aprire sessioni indipendenti per ogni bottone.

## Prima fase rapida

Esegui una ricognizione limitata e fattuale:

- Route reali.
- Componenti esistenti.
- Funzionalità operative.
- Design system.
- Dipendenze.
- Integrazioni.
- CI/CD.
- Test.
- Problemi bloccanti.

Aggiorna un'unica matrice dello stato.

## Matrice

Per ogni area:

- Implemented.
- Partial.
- Static.
- Broken.
- Missing.
- Requires integration.
- Verified.

Non dichiarare statico un componente soltanto perché visivamente semplice.

Non dichiarare operativo un componente soltanto perché esiste il pulsante.

## Execution stream

**Stream A — Product UI System**

Design tokens, componenti, form, dialog, inviti, responsive, accessibilità.

**Stream B — Public Experience**

Homepage, Explore, Services, Playground, media, motion, copy e conversione.

**Stream C — Agency Operations**

CRM, progetti, marketing, media studio, finanza, client portal.

**Stream D — AI & Automation**

Chat, copilot, workforce, workflow builder, agent runtime.

**Stream E — Collaboration & Development**

Due Owner, GitHub, PR, preview, agent handoff, cloud coding.

**Stream F — Infrastructure & QA**

Cloudflare, sicurezza, performance, test e monitoraggio.

Gli stream devono condividere lo stesso modello di dominio e le stesse primitive UI.

Evita modifiche concorrenti sugli stessi file.

---

# 21. NUOVE FUNZIONALITÀ DA INTRODURRE CON CRITERIO

Oltre a quanto richiesto esplicitamente, valuta e integra nei punti opportuni:

## Productivity

- Universal command palette.
- Saved workspaces.
- Personal views.
- Customizable dashboards.
- Unified notifications.
- Search across entities.
- Quick create.
- Keyboard-first interactions.
- Bulk actions.
- Smart reminders.

## Collaboration

- Shared project context.
- Agent-ready tasks.
- Review requests.
- Inline comments.
- Presence.
- Task ownership.
- Handoffs.
- Decision history.

## AI operations

- Prompt registry.
- Provider health.
- Model routing.
- Cost limits.
- Test datasets.
- Agent evaluations.
- Failure analysis.
- Run replay where feasible.
- Approval policies.

## Commercial operations

- Proposal templates.
- Pricing estimator.
- Contract workflow.
- Upsell opportunities.
- Customer renewal reminders.
- Support and maintenance packages.
- Project profitability.
- Retainer management.

## Creative production

- Brand kit per cliente.
- Media versions.
- Prompt history.
- Asset provenance.
- Copyright/license metadata.
- Review and approval.
- Creative variants.
- Export presets.

## Growth

- Funnel analytics.
- Campaign planning.
- Content pipeline.
- Landing experiments.
- Attribution.
- SEO backlog.
- CRM-linked nurture flows.

Non introdurre funzionalità perché sono alla moda: devono risolvere un caso d'uso reale oppure costituire una parte necessaria dell'architettura.

---

# 22. PIANO DI ESECUZIONE

## Milestone 1 — Product Foundation

- Consolidamento design system.
- Theme system.
- Componenti moderni.
- Form.
- Dialog.
- Onboarding.
- Inviti.
- Responsive foundation.
- Test componenti.

## Milestone 2 — Public Excellence

- Hero fullscreen.
- Cinematic scroll.
- Media e capability presentation.
- Explore.
- Services.
- Playground.
- Assistant.
- Portfolio.
- Copy e conversione.

## Milestone 3 — Agency Productivity

- Overview.
- CRM avanzato.
- Kanban.
- Projects.
- Marketing.
- Media studio.
- Finance.
- Customer portal.

## Milestone 4 — AI Operations

- Assistant tools.
- Mission Control.
- Agent registry.
- Workflow engine.
- Approval center.
- Cost and execution tracking.

## Milestone 5 — Shared Development

- GitHub collaboration.
- Owner permissions.
- Connected development tools.
- Agent handoff.
- Branch / PR / preview lifecycle.
- Cloud execution where authorized.

## Milestone 6 — Hardening

- Accessibility.
- Security.
- Performance.
- Regression.
- Automated testing.
- Production readiness.

Le milestone possono procedere in parallelo quando non esistono dipendenze, ma devono essere integrate attraverso vertical slice funzionanti.

Non trasformare il progetto in sei app differenti.

---

# 23. ACCEPTANCE CRITERIA GLOBALI

Il progetto sarà considerato allineato quando:

1. La parte pubblica è immersiva, premium, originale e facile da comprendere.
2. Le capacità AI vengono mostrate con demo, visual, media e casi d'uso.
3. Form, dialog, menu, overlay e interazioni rispettano un design system professionale.
4. Il tema può essere modificato attraverso configurazioni centralizzate.
5. Esistono light/dark e preset coerenti.
6. La dashboard è funzionale e non decorativa.
7. Il CRM e le pipeline operano su dati reali.
8. Marketing e Creative Production sono moduli operativi, non semplici voci di menu.
9. Workflow e agenti hanno esecuzioni e stati verificabili.
10. La chat è contestuale, orienta, mostra UI e compie azioni autorizzate.
11. L'AI è utilizzata soltanto quando porta valore.
12. Due soci possono collaborare con privilegi equivalenti.
13. Ogni socio può utilizzare i propri strumenti di sviluppo AI senza dipendere dalla macchina dell'altro.
14. Codice, PR, task e deploy sono collegati in un workflow chiaro.
15. Le componenti sono modulari e riutilizzabili anche nei progetti clienti.
16. Il sistema è responsive e accessibile.
17. Le funzionalità pubblicate sono realmente operative o chiaramente etichettate come demo.
18. I dati e le credenziali sono adeguatamente protetti.
19. L'applicazione funziona su cloud senza dipendenze produttive dal Mac Studio.
20. Il proprietario non deve continuare a individuare manualmente ogni componente rudimentale o comportamento incompleto.

---

# 24. AZIONE IMMEDIATA — PROSEGUI ORA

Non interrompere l'esecuzione per ricominciare la strategia.

Assorbi questo mandato come aggiornamento vincolante della Definition of Done.

Verifica lo stato attuale senza rifare lavoro già completato.

Poi procedi con un miglioramento sistemico e non con interventi isolati.

Il primo passaggio concreto deve essere:

1. Consolidare il sistema di componenti e design tokens.
2. Aggiornare form, dialog e gestione inviti.
3. Rendere il workspace coerente, dinamico e operativo.
4. Completare i moduli assenti di marketing e produzione.
5. Integrare la collaborazione GitHub/agent-ready dei due soci.
6. Proseguire le esperienze pubbliche immersive e le demo AI.
7. Collegare ogni funzione ai dati e ai workflow reali.
8. Verificare nel browser e mediante test.
9. Documentare i risultati, non soltanto le intenzioni.

Non spendere denaro né modificare la produzione in modo distruttivo senza autorizzazione.

Non inventare capacità di strumenti o integrazioni.

**Obiettivo finale: OMNI101 deve raggiungere la maturità di un prodotto professionale, l'identità di uno studio creativo di alto livello e l'efficienza operativa di una vera agenzia AI-native.**

EXECUTE AND VALIDATE.
