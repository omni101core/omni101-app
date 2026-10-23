# OMNI101 — Agent Intelligence, Skills & Execution Optimization V2

Ho approfondito la ricerca su GitHub, includendo progetti meno conosciuti rispetto ai soliti Superpowers, Caveman e Ponytail.

La conclusione è che il prossimo salto di qualità non verrà dall'aggiunta di altre 50 skill, ma dalla capacità di combinare quelle già disponibili con un sistema che sappia quando usarle, cosa ricordare, come verificare i risultati e quando evitare lavoro superfluo.

Per OMNI101 sceglierei un approccio che chiamo Adaptive Agent Engineering: un insieme di istruzioni e controlli che si adatta alla struttura effettiva del repository, agli agenti disponibili, alla complessità del task e ai costi.

Non conosco lo stato completo del repository OMNI101, né posso confermare quali skill siano attualmente attive nelle singole sessioni. Perciò il mandato non deve imporre cartelle, framework organizzativi o installazioni arbitrarie: deve prima riconoscere ciò che esiste e migliorarlo senza duplicazioni.

## 1. Le scoperte GitHub che ritengo più interessanti

Le ho divise per funzione e utilità specifica, non per numero di stelle.

[Headroom](https://github.com/headroomlabs-ai/headroom?utm_source=chatgpt.com) — Compressione del contesto

Agisce sui dati letti dagli agenti: output dei tool, file, log e risultati di ricerca. È potenzialmente complementare a Ponytail, ma può sovrapporsi al proxy Caveman già installato. Va misurato prima di adottarlo.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



[Serena MCP](https://github.com/oraios/serena?utm_source=chatgpt.com) — Comprensione semantica del codice

Permette ricerca e modifica a livello di simboli, anziché rileggere interi file. Una delle aggiunte più interessanti per repository complessi.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



[Matt Pocock — Skills for Real Engineers](https://github.com/mattpocock/skills?utm_source=chatgpt.com) — Skill piccole e componibili

Interessante perché evita di imporre un enorme framework di sviluppo. Offre skill mirate, modificabili e indipendenti dal modello.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



[OpenSpec](https://github.com/Fission-AI/OpenSpec?utm_source=chatgpt.com) — Requisiti persistenti e modifiche controllate

È particolarmente adatto a un progetto già esistente. Consente di conservare specifiche e cambiamenti nel repository, utilizzabili da agenti diversi.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



[GSD Core](https://github.com/open-gsd/gsd-core?utm_source=chatgpt.com) — Context engineering e continuità delle sessioni

Gestisce pianificazione, esecuzione, verifica e passaggio di contesto. Il vecchio repository `gsd-build/get-shit-done` rimanda oggi a questo progetto.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

Core · GitHub

+1



[Cisco Skill Scanner](https://github.com/cisco-ai-defense/skill-scanner?utm_source=chatgpt.com) — Sicurezza delle skill

Analizza possibili prompt injection, esfiltrazione e codice sospetto nelle skill prima dell'adozione. È un controllo utile, pur non potendo garantire che una skill sia sicura.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



## 2. Altre risorse che terrei nella shortlist

| Repository                                                                                   | Funzione                                                           | Decisione per OMNI101                                                  |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| [Superpowers](https://github.com/obra/superpowers?utm_source=chatgpt.com)                    | TDD, debugging, subagent, review                                   | Adottare selettivamente se manca un processo equivalente               |
| [Sentry Skills](https://github.com/getsentry/skills?utm_source=chatgpt.com)                  | Code review, prompt optimization, AGENTS.md, controllo dei segreti | Ottima fonte di skill specifiche                                       |
| [Anthropic Skills](https://github.com/anthropics/skills?utm_source=chatgpt.com)              | Skill specialistiche e skill creator                               | Riutilizzare la metodologia per skill OMNI101                          |
| [GitHub Spec Kit](https://github.com/github/spec-kit?utm_source=chatgpt.com)                 | Specifiche, implementazione e convergenza                          | Alternativa a OpenSpec: sceglierne uno                                 |
| [Beads](https://github.com/steveyegge/beads?utm_source=chatgpt.com)                          | Task con dipendenze e memoria tra sessioni                         | Valutare soltanto se il sistema task esistente è insufficiente         |
| [AGENTS.md](https://github.com/agentsmd/agents.md?utm_source=chatgpt.com)                    | Istruzioni portabili nel repository                                | Fondamentale come standard di ingresso                                 |
| [Context7](https://github.com/upstash/context7?utm_source=chatgpt.com)                       | Documentazione aggiornata alle versioni delle librerie             | Usare a richiesta, non ad ogni task                                    |
| [Harness Firmware](https://github.com/ryanportfolio/Harness-Firmware?utm_source=chatgpt.com) | Memoria, skill e istruzioni versionate                             | Studiare il modello, senza adottare necessariamente l'intero framework |
| [Sentry for AI](https://github.com/getsentry/sentry-for-ai?utm_source=chatgpt.com)           | Debug e osservabilità assistiti                                    | Utile quando esiste integrazione Sentry                                |
| [Agent Skills Specification](https://agentskills.io/specification?utm_source=chatgpt.com)    | Formato interoperabile delle skill                                 | Standard per le skill interne                                          |

Una scoperta interessante è che gli autori di Caveman e Ponytail confermano esplicitamente la compatibilità fra i due: Ponytail riduce il codice superfluo; Caveman riduce la verbosità. Questo rafforza la scelta di mantenerli entrambi senza riconfigurarli inutilmente.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

DietrichGebert/ponytail



## 3. Cosa adotterei e cosa eviterei

Architettura raccomandata

| Già presenti  | Caveman + Ponytail → verificare soltanto che funzionino come previsto                          |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Alta priorità | Serena, istruzioni condivise, skill mirate e quality gates                                     |
| Da scegliere  | OpenSpec oppure processo equivalente già esistente                                             |
| Da valutare   | GSD Core, Beads, Headroom, Superpowers                                                         |
| Controlli     | Cisco Skill Scanner e skill di review Sentry                                                   |
| Da evitare    | Più compressori sovrapposti, più task tracker e più framework che orchestrano lo stesso lavoro |

Questa è la differenza tra accumulare strumenti e costruire un sistema intelligente.

Per esempio, OpenSpec e Spec Kit possono entrambi risolvere il problema delle specifiche. Installarli insieme non migliora necessariamente nulla. Lo stesso vale per Beads se OMNI101 possiede già un buon sistema di task e dipendenze.

## 4. Mandato esecutivo potenziato — da inviare ora all'agente

Il seguente prompt è pensato per essere aggiunto alla sessione attualmente in corso, non per far iniziare un nuovo progetto. Evita di prescrivere un filesystem che non conosco, riconosce le skill già installate e impone un rapporto molto più intelligente fra qualità e risorse.

# OMNI101 — ADAPTIVE AGENT ENGINEERING V3

## Advanced Skills, Context Intelligence, Multi-Agent Governance & Execution Efficiency

**Data:** 23 ottobre 2026\
**Priorità:** P0 — Miglioramento permanente del processo di sviluppo\
**Modalità:** CONTINUE, INSPECT SELECTIVELY, ADAPT, IMPLEMENT, MEASURE\
**Destinatario:** Codex, Claude Code, Hermes o altro agente incaricato\
**Progetto:** OMNI101.APP\
**Obiettivo:** ottenere risultati sempre migliori con meno contesto superfluo, meno duplicazioni, meno regressioni e meno interventi manuali del proprietario.

---

# 0. QUESTO NON È UN NUOVO PROGETTO

Continua il lavoro attuale su OMNI101.

Non ricominciare dal principio.

Non reinstallare strumenti già presenti.

Non ricostruire documentazione esistente.

Non creare nuove directory sulla base di esempi generici.

Non avviare un audit globale di ore.

Non sostituire workflow già funzionanti soltanto perché esiste un progetto GitHub più recente.

**Devi adattarti alla struttura reale del repository, non costringere il repository ad adattarsi a un framework scelto a priori.**

La priorità è incrementare qualità, affidabilità, continuità e produttività del sistema di sviluppo già attivo.

Caveman e Ponytail risultano già installati e probabilmente in uso.

Non procedere alla loro installazione.

Verifica soltanto, con controlli mirati:

- Disponibilità effettiva.
- Attivazione nella sessione.
- Compatibilità.
- Eventuali sovrapposizioni.
- Beneficio concreto.
- Eventuali problemi o configurazioni obsolete.

Se funzionano correttamente, non modificarli.

---

# 1. DEFINIZIONE DEL SUCCESSO

OMNI101 deve diventare un progetto nel quale qualsiasi agente autorizzato possa:

1. Comprendere rapidamente cosa sta costruendo.
2. Recuperare la visione commerciale e creativa.
3. Sapere quali decisioni sono vincolanti.
4. Individuare il codice e i documenti pertinenti.
5. Conoscere lo stato effettivo dei task.
6. Evitare di ripetere lavoro.
7. Riconoscere le skill già disponibili.
8. Attivare soltanto quelle appropriate.
9. Implementare modifiche coerenti.
10. Verificare il risultato.
11. Consegnare evidenze.
12. Salvare il contesto necessario al prossimo agente.
13. Collaborare con altri agenti e con entrambi i soci.
14. Ridurre il costo complessivo senza sacrificare qualità.
15. Migliorare progressivamente il sistema attraverso problemi realmente osservati.

**Il proprietario non deve dover ripetere continuamente le stesse regole, reference o richieste.**

---

# 2. FIRST PRINCIPLE — QUALITY PER UNIT OF EFFORT

Non ottimizzare esclusivamente il numero di token.

Ottimizza il rapporto:

**Risultati verificati / costo complessivo.**

Considera:

- Input token.
- Output token.
- Context loading.
- Tool calls.
- Browser calls.
- Tempo di esecuzione.
- Costo dei modelli.
- Necessità di nuove sessioni.
- Errori.
- Rework.
- Regressioni.
- Interventi umani.
- Manutenzione futura.

Un agente che risparmia token ma richiede tre correzioni è meno efficiente.

Un framework che aggiunge dieci documenti per modificare un bottone può essere controproducente.

Una skill che accorcia le risposte ma elimina informazioni essenziali è dannosa.

**La massima efficienza significa ridurre il lavoro inutile, non soltanto produrre meno testo.**

---

# 3. DISCOVERY MIRATA DELL'AMBIENTE

Esegui una ricognizione breve e non distruttiva.

Devi conoscere soltanto ciò che serve per decidere come migliorare il sistema.

Identifica:

- Repository effettivo.
- Branch e working tree.
- Entry point delle istruzioni.
- Skill registrate.
- Hook.
- MCP.
- Configurazioni dei coding agent.
- Sistema di memoria.
- Sistema di task.
- Sistema di orchestrazione.
- CI/CD.
- Test.
- Documentazione canonica.
- Convenzioni già attive.
- Integrazioni GitHub.
- Meccanismi di handoff.

Non leggere integralmente ogni cartella.

Non eseguire inventari ripetuti se esiste già un indice attendibile.

Non modificare configurazioni globali del Mac.

Non attivare automazioni persistenti non autorizzate.

Produci internamente una matrice:

EXISTS / WORKS / DUPLICATE / BROKEN / MISSING / USEFUL IMPROVEMENT.

Utilizza tale matrice per scegliere le modifiche.

---

# 4. SKILL INTELLIGENCE — REFERENCE CANDIDATES

Questi progetti sono già stati individuati e devono essere considerati candidati, non installazioni obbligatorie.

## Existing

Caveman:\
[https://github.com/JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman)

Ponytail:\
[https://github.com/DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)

Verifica il loro utilizzo reale senza reinstallarli.

## Context & code navigation

Serena:\
[https://github.com/oraios/serena](https://github.com/oraios/serena)

Headroom:\
[https://github.com/headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom)

Context7:\
[https://github.com/upstash/context7](https://github.com/upstash/context7)

## Engineering skills

Matt Pocock Skills:\
[https://github.com/mattpocock/skills](https://github.com/mattpocock/skills)

Superpowers:\
[https://github.com/obra/superpowers](https://github.com/obra/superpowers)

Sentry Skills:\
[https://github.com/getsentry/skills](https://github.com/getsentry/skills)

Anthropic Skills:\
[https://github.com/anthropics/skills](https://github.com/anthropics/skills)

Vercel Agent Skills:\
[https://github.com/vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)

## Specifications & state

OpenSpec:\
[https://github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)

GitHub Spec Kit:\
[https://github.com/github/spec-kit](https://github.com/github/spec-kit)

GSD Core:\
[https://github.com/open-gsd/gsd-core](https://github.com/open-gsd/gsd-core)

Beads:\
[https://github.com/steveyegge/beads](https://github.com/steveyegge/beads)

Harness Firmware:\
[https://github.com/ryanportfolio/Harness-Firmware](https://github.com/ryanportfolio/Harness-Firmware)

## Interoperability

AGENTS.md:\
[https://github.com/agentsmd/agents.md](https://github.com/agentsmd/agents.md)

Agent Skills Specification:\
[https://agentskills.io/specification](https://agentskills.io/specification)

## Security

Cisco Skill Scanner:\
[https://github.com/cisco-ai-defense/skill-scanner](https://github.com/cisco-ai-defense/skill-scanner)

Sentry for AI:\
[https://github.com/getsentry/sentry-for-ai](https://github.com/getsentry/sentry-for-ai)

Non fermarti soltanto ai repository più famosi quando una capacità importante manca.

Puoi individuare alternative migliori, ma non avviare un'altra ricerca indiscriminata senza un problema specifico da risolvere.

---

# 5. SELECTION POLICY — NON INSTALLARE TUTTO

Per ogni nuovo candidato stabilisci:

- Problema risolto.
- Capacità già disponibile.
- Miglioramento atteso.
- Complessità di integrazione.
- Compatibilità reale.
- Overhead di contesto.
- Nuovi privilegi.
- Dipendenze.
- Manutenzione.
- Licenza.
- Rischi.
- Possibilità di rollback.

Classifica:

KEEP EXISTING

ADOPT

ADAPT IDEAS

ON-DEMAND

DUPLICATE

REJECT

**Se una capacità è già coperta da una soluzione funzionante, usa quella.**

Esempi:

Non adottare Headroom automaticamente se il proxy Caveman già comprime gli stessi output.

Non aggiungere Beads se il tracker esistente gestisce dipendenze e ripresa delle sessioni.

Non integrare OpenSpec e Spec Kit contemporaneamente per fare lo stesso lavoro.

Non sovrapporre due sistemi di memoria senza una separazione di responsabilità.

Non usare Superpowers come obbligo di brainstorming su un requisito già approvato.

Se un repository offre soltanto una buona idea, implementa quella senza importare l'intero sistema.

---

# 6. PROJECT KNOWLEDGE — SINGLE SOURCE OF TRUTH

Individua la documentazione canonica già presente.

La struttura effettiva è decisa dal repository.

Non presupporre percorsi o nomi di cartelle.

Assicurati però che siano coperti questi domini:

## Product Constitution

- Identità OMNI101.
- Visione.
- Target.
- Posizionamento.
- Offerta commerciale.
- Distinzione frontend/workspace.
- Non-goals.
- Vincoli.

## Design Governance

- Brand identity.
- Theme system.
- Component system.
- Motion system.
- Reference.
- UX principles.
- Accessibility.
- Responsive.
- Copywriting.

## Technical Architecture

- Stack reale.
- Data model.
- API.
- Authentication.
- Authorization.
- Infrastructure.
- Integrations.
- Security.
- Testing.
- Deployment.

## Agency Operations

- CRM.
- Projects.
- Workflow.
- Marketing.
- Social.
- Ads.
- Media.
- Finance.
- Clients.
- Collaboration.
- Knowledge.

## AI Operations

- Agent definitions.
- Model routing.
- Tool registry.
- Context management.
- Prompts.
- Evaluations.
- Budgets.
- Approvals.
- Execution.
- Observability.

## Work History

- Mandati.
- Requisiti.
- Decisioni.
- Task.
- Commit.
- Pull requests.
- Test.
- Incidents.
- Lessons learned.

Non creare una copia indipendente di ogni informazione in ogni file.

Usa riferimenti alla fonte canonica.

---

# 7. UNIVERSAL AGENT ENTRYPOINT

Verifica come gli agenti leggono già le istruzioni del progetto.

Se esiste AGENTS.md, miglioralo soltanto dove necessario.

Se esiste CLAUDE.md, conserva la compatibilità.

Hermes e altri agenti devono poter recuperare le stesse regole.

## Entry point minimo

Deve indicare:

- Che cos'è OMNI101.
- Dove risiede la documentazione canonica.
- Quali directory sono pertinenti.
- Come individuare il task attivo.
- Come trovare le skill.
- Come eseguire i test.
- Quali modifiche richiedono approvazione.
- Come consegnare risultati e handoff.

Non duplicare l'intera Constitution nell'entrypoint.

Le regole comuni devono avere una fonte unica.

Le istruzioni specifiche di Claude, Codex o Hermes devono essere adapter leggeri quando possibile.

---

# 8. PROGRESSIVE CONTEXT LOADING

Adotta un sistema a livelli.

## Level 1 — Project orientation

Identità, confini e istruzioni essenziali.

## Level 2 — Task context

Obiettivo, stato, requisiti e criteri di accettazione.

## Level 3 — Domain context

Solo documentazione pertinente al lavoro.

## Level 4 — Code context

Simboli, file e dipendenze interessati.

## Level 5 — Specialist skills

Solo skill pertinenti.

## Level 6 — Extended references

Documentazione esterna o reference complete solo quando servono.

Non inserire tutti i mandati, tutta la libreria Codrops e tutte le skill nel contesto di ogni task.

Mantieni collegamenti alle informazioni complete.

Quando possibile usa ricerca semantica del codice a livello di simboli, ad esempio con Serena, anziché rilettura indiscriminata.

Se Serena duplica le funzionalità native dell'ambiente, non aggiungerlo.

---

# 9. CONTEXT COMPRESSION & TOKEN MANAGEMENT

Caveman e Ponytail sono già disponibili.

Verifica il loro ruolo effettivo.

## Caveman

Può ridurre verbosità o compressione dei risultati dei tool, secondo il componente realmente attivo.

Non presumere che il proxy sia abilitato soltanto perché la skill è installata.

## Ponytail

Favorisce soluzioni snelle, codice essenziale ed eliminazione dell'overengineering.

Non utilizzarlo per rimuovere controlli necessari.

## Headroom

Valutalo soltanto come alternativa o complemento misurabile alla compressione attuale.

Non concatenare automaticamente più proxy.

## Regole trasversali

- Batch delle letture.
- Ricerche mirate.
- Output filtrati.
- Errori integrali recuperabili.
- Cache delle fonti quando appropriato.
- Evitare ripetizione dei documenti.
- Ridurre verbosità dei report.
- Conservare le prove.
- Sintesi incrementale dello stato.
- Tool call con obiettivo concreto.

Non comprimere in modo distruttivo i documenti canonici.

---

# 10. INTELLIGENT TASK CLASSIFICATION

Prima di lavorare classifica il task.

## TRIVIAL

Modifica circoscritta, rischio basso.

Azione:\
modifica mirata + verifica proporzionata.

## STANDARD

Nuova funzionalità o miglioramento locale.

Azione:\
contesto mirato + implementazione + test.

## COMPLEX

Modifica multi-file o cross-domain.

Azione:\
specifica sintetica + dipendenze + task coordinati + integrazione.

## CRITICAL

Autenticazione, permessi, dati, billing, agent execution, infrastruttura produttiva.

Azione:\
analisi dei rischi + test approfonditi + review indipendente + approvazioni.

## CREATIVE

Design, motion, branding, UX.

Azione:\
reference pertinenti + implementazione + browser visual QA + revisione.

Non applicare il processo COMPLEX a un task TRIVIAL.

Non trattare un task CRITICAL come una modifica cosmetica.

---

# 11. SPECIFICATION GOVERNANCE

Verifica quale sistema di specifiche e task è già presente.

Se funziona, miglioralo.

Se manca o non risolve i problemi, valuta OpenSpec come prima opzione per il progetto esistente.

Non adottarlo automaticamente.

Ogni cambiamento significativo deve poter collegare:

REQUIREMENT

DECISION

TASK

CODE

TEST

REVIEW

RELEASE.

Distingui:

- Idea.
- Proposta.
- Approvato.
- In corso.
- Implementato.
- Testato.
- Rilasciato.
- Verificato.
- Superato.

Un agente non deve interpretare una vecchia idea come un requisito vincolante.

Deve riconoscere anche quando una decisione successiva ha sostituito quella precedente.

---

# 12. REQUIREMENT COVERAGE & DRIFT PREVENTION

Realizza o rafforza una vista di copertura dei requisiti.

Gli agenti devono sapere:

- Quali richieste sono ancora valide.
- Quali sono già realizzate.
- Quali sono parziali.
- Quali sono soltanto rappresentate nella UI.
- Quali sono state sostituite.
- Quali sono in attesa di approvazione.
- Quali non sono mai state testate.

## Controllo delle modifiche

Prima di modificare un'area importante:

1. Individua il requisito originale.
2. Identifica la decisione corrente.
3. Verifica le dipendenze.
4. Implementa.
5. Controlla le regressioni.
6. Aggiorna lo stato.

Non chiedere al proprietario di ricordare manualmente ogni requisito precedente.

Non ricostruire ogni volta l'intera cronologia per modifiche ordinarie.

---

# 13. SKILL ROUTER — LOAD ONLY WHAT IS NEEDED

Implementa preferibilmente un registro leggero, non un nuovo framework completo.

Ogni skill deve avere:

- Nome.
- Scopo.
- Trigger.
- Agenti compatibili.
- Prerequisiti.
- Tool.
- Rischi.
- Versione.
- Fonte.
- Livello di confidenza.
- Possibile skill alternativa.

## Esempi di routing

Frontend React:\
Ponytail + regole React pertinenti + design system OMNI101.

Motion:\
OMNI motion rules + GSAP/Codrops pertinente + visual QA.

Backend:\
Domain rules + API contracts + test.

Bug:\
Systematic debugging + verifica.

Security:\
Security review + permission tests.

Multi-agent:\
Handoff + task coordination.

Content/marketing:\
Brand voice + marketing rules + approvazione.

Context compression:\
Caveman esistente, senza duplicare proxy.

Non caricare skill non pertinenti.

Evita trigger troppo generici che attivano metà del catalogo.

---

# 14. SKILL SECURITY & SUPPLY CHAIN

Prima di importare una nuova skill:

- Verifica repository.
- Licenza.
- Maintainer.
- Commit.
- Scripts.
- Hook.
- Comandi shell.
- Richieste di rete.
- Accesso a segreti.
- Modifiche a configurazioni.
- Permessi.
- Dipendenze.

Valuta Cisco Skill Scanner come controllo aggiuntivo.

Un esito senza segnalazioni non equivale a una garanzia di sicurezza.

Non eseguire install script remoti senza ispezionarli.

Preferisci skill installate a livello progetto e versionate quando possibile.

Non permettere a una skill di modificare autonomamente i permessi di sicurezza globali.

---

# 15. AGENT COLLABORATION & HANDOFF

Il sistema deve funzionare con:

- Codex.
- Claude Code.
- Hermes.
- Altri coding agent compatibili.
- I due soci.
- Collaboratori autorizzati.

GitHub rimane la fonte condivisa del codice.

I task devono poter essere collegati a branch, PR e preview.

## Handoff minimo

Quando una sessione termina:

- Task ID.
- Obiettivo.
- Stato.
- Branch.
- Commit.
- File modificati.
- Test eseguiti.
- Test falliti.
- Decisioni.
- Blocchi.
- Rischi.
- Prossima azione concreta.

Non archiviare ogni ragionamento intermedio.

Archivia decisioni, risultati, prove e problemi ancora aperti.

Non creare handoff duplicati a ogni tool call.

---

# 16. AUTOMATION & QUALITY GATES

Valuta i controlli già presenti in CI.

Integra selettivamente:

- Type check.
- Lint.
- Unit tests.
- Integration tests.
- E2E tests.
- Accessibility.
- Visual regression.
- Security scanning.
- Dependency checks.
- Secret scanning.
- License checks.
- Build.
- Migration validation.
- API contract checks.

Applica controlli in funzione del rischio.

Un task UI non deve richiedere l'intera suite infrastrutturale durante ogni modifica.

Una modifica RBAC non deve passare senza test di autorizzazione.

Non introdurre più strumenti di review che generano gli stessi commenti.

---

# 17. SKILL & WORKFLOW BENCHMARKS

Non basarti esclusivamente su benchmark pubblici.

Utilizza un piccolo set di task rappresentativi del repository OMNI101.

Esempi:

- Correzione di un componente UI.
- Miglioramento responsive.
- Bug su API.
- Modifica CRM.
- Workflow con errore.
- Refactor mirato.
- Test di un endpoint.
- Revisione di una PR.

Confronta:

Baseline attuale.

Baseline + Serena, se appropriato.

Baseline + skill specialistica.

Baseline + compressione alternativa, soltanto se giustificato.

Misura quando i dati sono disponibili:

- Token input/output.
- Tempo.
- Tool calls.
- Test superati.
- Regressioni.
- Numero di correzioni.
- Qualità del codice.
- Costo totale.

Non eseguire costosi benchmark su ogni singola skill.

Usa un esperimento rappresentativo per ogni classe di ottimizzazione.

Non attivare più cambiamenti contemporaneamente senza poter attribuire il risultato.

---

# 18. AUTOMATIC IMPROVEMENT LOOP

Quando emerge un problema ripetitivo, non limitarti a correggere il sintomo.

Valuta se può essere eliminato sistematicamente.

Esempi:

Se gli agenti dimenticano il design system:\
migliora il caricamento contestuale delle design rules.

Se ripetono audit già fatti:\
migliora l'indice e lo stato persistente.

Se creano form rudimentali:\
migliora i componenti condivisi e i test visuali.

Se modificano architetture senza motivo:\
rafforza i controlli sui cambiamenti.

Se consumano troppi token sui log:\
ottimizza output e letture.

Se perdono il contesto:\
migliora l'handoff.

Se duplicano task:\
migliora la deduplicazione e il tracker.

## Regola

Non creare automaticamente una nuova skill per ogni errore.

Una nuova regola o skill è giustificata solo quando il problema è ricorrente, significativo e generalizzabile.

---

# 19. MODEL ROUTING & DELEGATION

Usa il modello più adatto al task, nei limiti degli accessi disponibili.

## Compiti complessi

Modelli con maggiore capacità di ragionamento.

## Compiti meccanici

Modelli economici o strumenti deterministici.

## Analisi del codice

Preferisci strumenti di ricerca simbolica quando sufficienti.

## Documentazione API

Preferisci documentazione ufficiale e aggiornata.

## Creatività

Usa modelli e strumenti appropriati, con verifica visuale.

## QA

Utilizza test automatici e review indipendente proporzionata.

Non delegare soltanto per delegare.

Ogni subagent ha un costo di inizializzazione e contesto.

Se un task semplice è più efficiente in una sola sessione, eseguilo direttamente.

Non creare gerarchie ricorsive prive di limiti.

---

# 20. COST AND OBSERVABILITY

Mantieni, se tecnicamente disponibile, una vista delle prestazioni del sistema agentico.

Metriche utili:

- Costo per task.
- Durata.
- Retry.
- Tool calls.
- Token.
- Modello.
- Task success.
- Regressioni.
- Review findings.
- Failure reasons.
- Handoff success.
- Context loading overhead.

Non introdurre una piattaforma analytics complessa solo per misurare quattro comandi.

Inizia dalle informazioni realmente disponibili.

Distingui misure effettive, stime e dati non disponibili.

Non inventare percentuali di risparmio.

---

# 21. DOCUMENTATION DRIFT CONTROL

Verifica la coerenza fra:

- AGENTS.md.
- CLAUDE.md.
- Regole Hermes.
- Skill.
- Architecture docs.
- Product requirements.
- Brand system.
- Design system.
- Component library.
- Test.
- Dipendenze reali.
- CI.
- Deploy.

In presenza di contraddizioni:

- Identifica il conflitto.
- Identifica la fonte canonica.
- Valuta impatto.
- Correggi quando consentito.
- Registra decisioni sostanziali.
- Evita di generare nuove copie divergenti.

Non considerare un documento aggiornato soltanto perché contiene la data più recente.

La fonte di verità va determinata tramite stato approvato, commit e relazioni tra decisioni.

---

# 22. REPOSITORY-ADAPTIVE IMPLEMENTATION

Non imporre nomi e percorsi senza conoscere il repository.

Devi:

1. Individuare le convenzioni esistenti.
2. Riconoscere le fonti canoniche.
3. Conservare ciò che funziona.
4. Consolidare duplicati.
5. Aggiungere soltanto ciò che manca.
6. Mantenere compatibilità con gli agenti.
7. Collegare istruzioni, skill, task e test.
8. Evitare configurazioni globali indesiderate.

Qualora emergano framework alternativi, scegli quello che produce il miglior beneficio con il minor cambiamento necessario.

Non migrare il progetto a un sistema di governance completamente nuovo se quello attuale può essere migliorato.

---

# 23. EXECUTION PRIORITIES

## Immediate — P0

- Conferma Caveman e Ponytail esistenti.
- Mappa le istruzioni realmente caricate.
- Elimina conflitti e duplicazioni.
- Consolida le fonti canoniche.
- Migliora il caricamento contestuale.
- Aggiungi skill routing mirato.
- Rafforza handoff e requirement coverage.
- Migliora quality gates essenziali.

## Next — P1

- Valuta Serena.
- Valuta skill mirate Matt Pocock, Sentry e Superpowers.
- Verifica opportunità OpenSpec o sistema equivalente.
- Introduci controlli di security scanning sulle nuove skill.
- Collega task, PR, test e requisiti.

## Selective — P2

- Benchmark Headroom contro compressione esistente.
- Valuta GSD Core, Beads o altri harness soltanto se manca la capacità corrispondente.
- Migliora metriche, recovery e automazioni.
- Estendi il sistema alle altre applicazioni sviluppate dall'agenzia quando sarà sufficientemente stabile.

La classificazione può essere adattata allo stato reale della codebase, motivando cambiamenti di priorità.

---

# 24. DELIVERY REQUIREMENTS

Non concludere con un elenco di consigli.

Consegna interventi effettivamente realizzati.

Il report finale deve essere conciso e contenere:

**A. Existing capabilities**

Cosa esisteva già e funziona.

**B. Improvements applied**

Quali modifiche sono state effettuate.

**C. Skills selected**

Quali sono state mantenute, aggiunte o scartate e perché.

**D. Context improvements**

Come si riduce la necessità di ricostruire il contesto.

**E. Governance improvements**

Come si impediscono modifiche incoerenti.

**F. Tests**

Quali controlli sono stati eseguiti e i loro risultati.

**G. Performance**

Misure reali o stime chiaramente dichiarate.

**H. Handoff**

Come un altro agente o il secondo socio può riprendere il lavoro.

**I. Remaining limitations**

Blocchi reali, non attività inventate.

Non ripetere integralmente la strategia OMNI101 nel report.

---

# 25. FINAL DIRECTIVE

Non interpretare questo mandato come un ordine di installare più software.

Interpretalo come un ordine di costruire un ambiente di sviluppo AI più intelligente.

Le skill sono capacità.

Le istruzioni sono regole.

La memoria conserva contesto.

Le specifiche definiscono cosa deve essere realizzato.

I task organizzano il lavoro.

I test verificano il comportamento.

Git conserva codice e decisioni.

Gli agenti eseguono il lavoro.

Gli esseri umani mantengono il controllo delle decisioni e delle autorizzazioni critiche.

Tutto deve cooperare.

**L'obiettivo è permettere a qualsiasi agente autorizzato di entrare nel progetto OMNI101, capire rapidamente il contesto pertinente e produrre miglioramenti coerenti, sicuri, verificati e sostenibili, utilizzando il minor numero ragionevole di risorse.**

Non fermarti a proporre una nuova architettura.

Non riavviare il progetto.

Non reinstallare Caveman o Ponytail.

Non sacrificare qualità per ridurre i token.

Non espandere inutilmente il numero di strumenti.

**CONTINUE CURRENT WORK. IMPROVE THE EXISTING SYSTEM. VERIFY THE BENEFIT. PRESERVE PROJECT INTENT.**

## 5. Le tre aggiunte su cui punterei davvero

Dovendo scegliere dove investire l'attenzione immediata, privilegerei:

Serena, perché può far lavorare gli agenti con maggiore precisione nei repository grandi, senza dover leggere interi file ogni volta.

OpenSpec o un equivalente già presente, perché il tuo problema più ricorrente non è il codice in sé: è che le richieste, le decisioni e le verifiche rischiano di perdersi passando da Codex a Claude e a Hermes.

Le skill di review e ottimizzazione di Sentry e Matt Pocock, perché introducono procedure mirate e riutilizzabili senza necessariamente imporre un nuovo orchestratore.

Non aggiungerei Headroom finché non sappiamo se il proxy Caveman è già attivo e quale parte dei token sta effettivamente comprimendo. E non introdurrei contemporaneamente GSD, Beads, Spec Kit e OpenSpec.

La differenza che vogliamo ottenere è molto concreta: ogni nuovo agente deve iniziare a lavorare sapendo già cosa fare, dove intervenire, quali decisioni rispettare e come dimostrare di aver migliorato OMNI101, senza richiederti un'altra lunga spiegazione.