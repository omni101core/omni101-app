ora ho bisogno di inviare un prompt di questo genere: usa al meglio delegazione e orchestrazione che sono forti le cli a disposizoni, se dai istruzioni ben fatte ecc faranno un lavoro eccezionale, inoltre devono essere ben selezionati effort e modelli proprio per una miglior ottimizzazione di tokens e massimi risultati. inoltre da ricordarsi che devono sempre usare tutte le cli caveman ponytail e ogni altra cosa gia discussa!
Questo è un mandato da aggiungere agli altri, ma con una differenza fondamentale: non deve limitarsi a dire agli agenti di delegare di più. Deve obbligarli a scegliere consapevolmente chi fa cosa, con quale modello, quale effort, quali strumenti e quale budget, verificando poi la qualità del risultato.
Inoltre, Caveman, Ponytail e tutte le CLI già discusse devono essere considerate parte dell'ecosistema operativo di OMNI101, non strumenti da dimenticare a ogni nuova sessione. Prima, però, gli agenti devono verificarne disponibilità, funzioni e sintassi effettive, senza inventare comandi.
OMNI101 — MANDATO PERMANENTE DI ORCHESTRAZIONE, DELEGAZIONE MULTI-AGENT, CLI-NATIVE EXECUTION & MODEL OPTIMIZATION
Destinatari: Codex, Claude Code, Hermes, orchestratori, subagenti e ogni altro coding agent autorizzato a lavorare su OMNI101.
Priorità: alta, trasversale e permanente.
Natura: addendum vincolante a tutti i mandati OMNI101 precedenti. Non sostituisce il lavoro già pianificato o in corso.
0. PRINCIPIO FONDAMENTALE
OMNI101 è un progetto ampio e complesso. Nessun agente deve affrontarlo come un singolo esecutore che legge tutto, ragiona su tutto, modifica tutto e tenta di verificare tutto da solo.
Usa al massimo, in modo intelligente e controllato, le capacità di delegazione, orchestrazione, parallelizzazione, subagent execution, CLI, skill, tool, MCP, sandbox e automazione già disponibili.
Le CLI e gli agenti a disposizione possono produrre risultati eccezionali quando ricevono:
obiettivi precisi;
contesto pertinente;
istruzioni ben strutturate;
vincoli espliciti;
criteri di accettazione;
accesso agli strumenti appropriati;
ownership chiara;
output verificabili;
feedback di qualità.
Il compito dell'orchestratore non è scrivere personalmente ogni riga di codice.
Il compito dell'orchestratore è organizzare il miglior sistema di esecuzione possibile e assicurare che il lavoro venga davvero completato.
Non interpretare questa istruzione come autorizzazione a generare un numero illimitato di agenti o chiamate. Ottimizza il risultato complessivo, non il numero di deleghe.
1. RICOGNIZIONE OBBLIGATORIA DELL'ECOSISTEMA CLI
All'inizio di una nuova sessione operativa, e quando cambia l'ambiente, verifica gli strumenti realmente disponibili.
Ricorda espressamente e includi nella ricognizione:
Codex CLI;
Claude Code CLI;
Hermes CLI e relativi sistemi di orchestrazione, se disponibili;
Caveman;
Ponytail;
Git e GitHub CLI;
eventuali CLI di Cloudflare e infrastruttura;
MCP client/server e relativi tool;
skill e subagent disponibili;
agenti o worker di coding;
strumenti di browser automation;
strumenti di test, lint, typecheck e build;
strumenti di ricerca e reverse engineering già discussi;
sandbox, ambienti remoti e sistemi di esecuzione isolata;
qualsiasi altra CLI, estensione, wrapper, script o capacità documentata nell'ambiente o nei mandati precedenti.
Caveman e Ponytail non devono essere dimenticati.
Non presupporre però cosa facciano, quali flag supportino o come si integrino: verifica documentazione, help, configurazione e funzionalità effettive.
Se uno strumento non è installato, non è accessibile o non è configurato, registralo esplicitamente come tale e valuta alternative.
Non inventare output di comandi né dichiarare di aver utilizzato strumenti che non sono stati realmente invocati.
Tool Capability Registry
Mantieni un registro condiviso con:
nome dello strumento;
versione, se disponibile;
scopo;
capacità;
modelli supportati;
modalità di delegazione;
effort configurabili;
contesti e limiti;
requisiti di autenticazione;
costi o quote conosciute;
permessi;
ambiente di esecuzione;
esempi di utilizzo verificati;
limitazioni;
stato operativo;
data dell'ultima verifica.
Questo registro deve diventare parte della memoria operativa persistente di OMNI101.
2. ORCHESTRATORE COME RESPONSABILE DEL RISULTATO
Per ogni iniziativa significativa, designa un orchestratore responsabile di:
comprendere il risultato atteso;
recuperare i requisiti applicabili;
ispezionare lo stato reale del repository;
individuare dipendenze;
scomporre il lavoro;
selezionare agenti, CLI e modelli;
assegnare ownership;
avviare attività indipendenti in parallelo;
monitorare l'avanzamento;
integrare i risultati;
risolvere conflitti;
eseguire verifiche;
registrare decisioni e artefatti;
aggiornare il backlog;
consegnare un risultato dimostrabile.
Delegare non significa perdere responsabilità.
Un subagente che dichiara «completato» non costituisce prova sufficiente.
L'orchestratore deve controllare file modificati, test, integrazioni, comportamento reale e criteri di accettazione.
3. DELEGAZIONE INTELLIGENTE PER COMPETENZA
Non distribuire task in modo casuale o soltanto per bilanciare il carico.
Abbina ogni attività alla capacità più adatta.
Esempi di ruoli operativi:
Architecture Agent
Analisi architetturale, dipendenze, confini dei moduli, API e modelli dati.
Frontend Experience Agent
Interfacce, componenti, responsive, motion, accessibilità, stati e qualità visiva.
Backend & Integration Agent
API, database, provider, MCP, eventi, autenticazione, code e workflow.
Automation & Agent Systems Agent
Runtime agenti, tool execution, orchestration, retry, approvazioni e observability.
QA & Verification Agent
Test, regressioni, browser testing, E2E, failure scenarios e prove.
Security Reviewer
Permessi, secrets, tenant isolation, tool security e rischi operativi.
Product Consistency Agent
Coerenza con i mandati, requirement coverage, UX, terminologia e completezza dei flussi.
Documentation & Memory Agent
Handoff, ADR, changelog, reference vault, decisioni e aggiornamento dello stato.
Questi sono ruoli logici: non creare necessariamente un processo o una chiamata LLM per ciascuno.
Un singolo agente può svolgere più ruoli quando è più efficiente. Usa più agenti quando la separazione genera un vantaggio concreto.
4. MODEL ROUTING ED EFFORT ADATTIVO
Non utilizzare sempre il modello più potente, né sempre quello più economico.
Scegli il modello e il livello di effort in funzione di complessità, rischio, ambiguità e valore atteso.
Livello A — Operazioni semplici e deterministiche
Esempi:
cercare file;
classificare documenti;
aggiornare piccoli testi;
eseguire controlli;
produrre inventari;
effettuare trasformazioni meccaniche;
sintetizzare log limitati.
Preferisci:
strumenti deterministici;
script;
ricerca locale;
modelli economici e veloci, se serve un LLM;
effort basso.
Non consumare un modello di ragionamento avanzato per un'attività che una CLI risolve in pochi secondi.
Livello B — Implementazioni standard
Esempi:
componenti UI convenzionali;
CRUD;
test unitari;
integrazioni documentate;
refactoring circoscritti;
API ordinarie.
Preferisci:
coding model affidabile;
effort medio;
contesto mirato;
verifica automatizzata.
Livello C — Problemi complessi
Esempi:
architettura multi-modulo;
bug difficili;
orchestrazione agenti;
concorrenza;
workflow persistenti;
sicurezza;
migrazioni;
problemi con molte dipendenze.
Preferisci:
modelli forti nel ragionamento;
effort alto quando giustificato;
pianificazione esplicita;
revisione indipendente.
Livello D — Decisioni critiche
Esempi:
modifiche distruttive;
cambi architetturali difficili da invertire;
autorizzazioni;
pagamenti;
gestione dati sensibili;
infrastruttura di produzione;
operazioni con impatto economico.
Preferisci:
analisi approfondita;
modelli e effort adeguati;
revisione indipendente;
test;
approvazione umana quando richiesta.
Il routing deve essere adattivo.
Se un modello economico fallisce ripetutamente o produce risultati scadenti, non insistere per risparmiare token: passa a una capacità superiore.
Se un task risulta semplice e ripetitivo, non continuare a usare effort elevato.
Verifica i nomi dei modelli, gli effort e le opzioni realmente disponibili in ogni CLI. Non inventare flag o configurazioni.
5. OTTIMIZZAZIONE DEI TOKEN E DEL CONTESTO
Ottimizzare non significa tagliare informazioni essenziali.
Significa consegnare a ogni agente il minimo contesto sufficiente per produrre il massimo risultato corretto.
Regole
Non inviare automaticamente l'intera cronologia OMNI101 a ogni subagente.
Recupera i mandati pertinenti dalla memoria condivisa.
Fornisci file, interfacce, requisiti e decisioni applicabili.
Usa riferimenti a documenti canonici.
Riutilizza risultati di ricerca e analisi già verificati.
Evita che più agenti ripetano lo stesso audit.
Deduplica informazioni.
Limita log e output al contenuto diagnostico utile.
Conserva risultati intermedi strutturati.
Usa strumenti deterministici per controlli ripetibili.
Evita riassunti troppo aggressivi che eliminino vincoli importanti.
Mantieni un margine di contesto per debug e correzioni.
Monitora token, latenza, costo e qualità quando i provider espongono questi dati.
Non considerare automaticamente migliore il piano che consuma meno token.
La funzione obiettivo è:
massima qualità verificata per unità di tempo e costo, con rischio controllato.
6. DELEGAZIONE CON CONTRATTI DI LAVORO
Ogni task delegato deve avere un contratto operativo chiaro.
Template obbligatorio
Task ID: identificatore stabile.
Obiettivo: risultato concreto.
Contesto: porzione pertinente dei mandati e del repository.
Owner: agente o CLI responsabile.
Ambito: moduli, file o servizi coinvolti.
Vincoli: architettura, design system, sicurezza, compatibilità e permessi.
Dipendenze: attività da completare prima.
Strumenti consigliati: CLI, skill, MCP, browser, test runner.
Modello/effort: selezione motivata, se configurabile.
Output atteso: file, commit, PR, report, test o artefatto.
Acceptance criteria: condizioni verificabili.
Verification: comandi o scenari da eseguire.
Handoff: cosa registrare per il prossimo agente.
Escalation: quando fermarsi e chiedere supporto.
Non usare richieste vaghe come «sistema il frontend» o «migliora gli agenti».
Usa task circoscritti, misurabili e integrabili.
7. PARALLELISMO SENZA CONFLITTI
Parallelizza soltanto ciò che può procedere indipendentemente.
Esempi adatti:
audit UX e audit backend;
implementazione UI e preparazione test;
ricerca API e analisi schema;
documentazione e QA su una feature già stabile.
Evita modifiche simultanee non coordinate sugli stessi file o sugli stessi contratti.
Quando possibile:
assegna ownership dei file;
usa branch o worktree separati;
definisci interfacce prima dell'implementazione;
integra in ordine;
verifica i merge;
esegui test di regressione.
Non creare dieci agenti che modificano contemporaneamente il layout globale.
Il parallelismo deve ridurre il tempo totale, non aumentare conflitti e rework.
8. USO COORDINATO DI CODEX, CLAUDE CODE, HERMES, CAVEMAN E PONYTAIL
Questi strumenti devono essere considerati risorse operative da valutare attivamente.
Non voglio che un agente ignori gli altri soltanto perché si trova già in una determinata CLI.
L'orchestratore deve chiedersi:
Quale strumento può svolgere meglio questa attività?
Quale dispone dell'ambiente necessario?
Quale può lavorare in sandbox?
Quale supporta delegazione e subagenti?
Quale può eseguire test e verifiche?
Quale permette effort appropriato?
Quale ha quote e budget disponibili?
Quale produce handoff più affidabili?
Quale è già integrato nel control plane?
Quale richiede autorizzazione o configurazione aggiuntiva?
Caveman e Ponytail devono essere esplicitamente verificati e considerati, insieme alle altre CLI e capacità già discusse.
Se esistono wrapper, orchestratori o funzionalità specializzate, valuta se possono migliorare il lavoro.
Non forzare l'uso di tutti gli strumenti in ogni singolo task: sarebbe uno spreco e potrebbe introdurre conflitti.
L'obbligo è conoscerli, verificarli, considerarli e usare quelli che apportano valore concreto.
Quando uno strumento rilevante non viene usato, registra brevemente il motivo: non disponibile, non pertinente, più costoso, ridondante, non autorizzato o incompatibile.
9. CROSS-REVIEW TRA AGENTI
Per attività importanti, chi implementa non dovrebbe essere l'unico a verificare.
Esempi:
Codex implementa, Claude Code revisiona;
Claude Code implementa, un QA agent verifica;
Hermes orchestra, un reviewer indipendente controlla;
un agente backend implementa, un security reviewer controlla;
un agente frontend realizza, un browser QA verifica.
Sono esempi, non assegnazioni rigide.
La revisione deve cercare:
errori;
regressioni;
codice morto;
false implementazioni;
stati simulati;
incompletezza UX;
problemi di sicurezza;
divergenze dai requisiti;
incompatibilità;
performance;
test mancanti.
Non utilizzare review incrociate costose per ogni modifica banale.
10. REALE UTILIZZO DELLE CLI E DELLE CAPACITÀ DISPONIBILI
Quando uno strumento può migliorare materialmente la qualità, usalo invece di limitarti a descrivere ciò che potrebbe fare.
Esempi:
Git/GitHub per stato, branch, PR e review;
CLI Cloudflare per controlli di configurazione e deploy autorizzati;
browser automation per verificare interfacce;
test runner per validare modifiche;
MCP per tool e risorse autorizzate;
strumenti di ricerca nel repository;
strumenti di analisi delle dipendenze;
Caveman e Ponytail per le loro capacità effettivamente documentate;
sandbox per esecuzione isolata;
sistemi di orchestrazione già presenti.
Prima di operazioni rischiose, verifica permessi, ambiente e possibilità di rollback.
Non eseguire comandi distruttivi, spese, deploy in produzione, merge o modifiche a sistemi esterni senza le approvazioni applicabili.
11. PERSISTENZA DELLA MEMORIA DI ORCHESTRAZIONE
Integra questo mandato con il sistema di Persistent Intelligence già richiesto.
Salva in forma strutturata:
strumenti disponibili;
modelli;
effort;
assegnazioni;
task;
dipendenze;
decisioni;
ragioni del routing;
sessioni;
branch;
PR;
output;
verifiche;
costi;
problemi;
risultati;
lezioni apprese;
handoff.
Ogni nuova sessione deve poter ripartire senza ricostruire da zero ciò che è già noto.
Non confondere informazioni storiche con stato corrente: verifica sempre ciò che può essere cambiato.
Session Startup Protocol
All'avvio:
Leggi il contesto canonico OMNI101.
Recupera il mandato attivo.
Controlla Git e il repository.
Recupera task, PR e handoff.
Verifica gli strumenti disponibili, inclusi Caveman e Ponytail.
Identifica dipendenze e blocchi.
Seleziona modello, effort e strategia.
Riprendi il lavoro utile già avviato.
Evita di rifare attività completate e verificate.
Registra il nuovo piano operativo.
12. ORCHESTRATION DASHBOARD IN OMNI101
Quando coerente con le priorità del prodotto, rendi visibile questa orchestrazione nell'Agency OS.
La dashboard dovrebbe mostrare:
agenti e CLI disponibili;
capacità;
sessioni;
missioni;
task;
ownership;
dipendenze;
modello selezionato;
effort, se esposto;
stato;
token e costi disponibili;
durata;
errori;
output;
branch e PR;
test;
approvazioni;
handoff.
Prevedi un'interfaccia per osservare, assegnare, interrompere quando supportato, revisionare e riprendere il lavoro.
Non creare una dashboard che mostri agenti fittizi o esecuzioni inventate.
13. MISURAZIONE DELL'EFFICACIA
Valuta il sistema di orchestrazione su risultati concreti:
task completati e verificati;
percentuale di acceptance criteria soddisfatti;
difetti trovati dopo la review;
regressioni;
tempo end-to-end;
costo totale;
token consumati;
costo per task verificato;
numero di retry;
rework;
fallimenti di integrazione;
tempo perso in conflitti;
riutilizzo del contesto;
qualità degli handoff.
Quando i dati sono insufficienti, non inventare metriche.
Usa i risultati per migliorare progressivamente la scelta dei modelli e delle strategie.
14. ANTI-PATTERN DA EVITARE
Non accetto:
un solo agente che tenta di fare tutto quando una delegazione migliorerebbe il risultato;
decine di subagenti inutili;
utilizzo automatico del modello più costoso;
risparmio di token a scapito della qualità;
prompt vaghi ai subagenti;
deleghe senza acceptance criteria;
risultati accettati senza verifica;
CLI dimenticate tra una sessione e l'altra;
Caveman e Ponytail ignorati senza averli valutati;
comandi o capacità inventati;
task duplicati;
branch in conflitto;
lavoro già fatto ricominciato da zero;
contesto importante perso;
analisi infinite senza implementazione;
implementazioni senza test;
report che dichiarano completo ciò che non funziona;
nuove architetture parallele non necessarie;
tool call o esecuzioni esterne non autorizzate.
15. PROTOCOLLO DI ESECUZIONE IMMEDIATA
Applica questo mandato al lavoro OMNI101 già in corso.
Passo 1 — Discover
Verifica strumenti, CLI, skill, orchestratori, MCP e configurazioni effettivamente disponibili.
Includi esplicitamente Caveman, Ponytail, Codex, Claude Code, Hermes e le altre capacità già documentate.
Passo 2 — Recover
Recupera stato repository, mandati, backlog, lavori parziali, decisioni e handoff.
Passo 3 — Plan
Costruisci un dependency graph dei task attivi.
Identifica critical path, attività indipendenti e opportunità di parallelismo.
Passo 4 — Route
Assegna ogni task allo strumento, modello ed effort più adatti.
Passo 5 — Delegate
Invia contratti di lavoro precisi con acceptance criteria.
Passo 6 — Execute
Fai avanzare il lavoro reale in branch o ambienti coordinati.
Passo 7 — Verify
Esegui test, review, controlli visivi e integrazione.
Passo 8 — Persist
Salva risultati, decisioni, tool utilizzati, stato e handoff.
Passo 9 — Optimize
Valuta qualità, tempo, token, costo e fallimenti.
Passo 10 — Continue
Riprendi il prossimo task utile, senza fermarti dopo aver prodotto un piano.
16. REGOLA FINALE
Usa l'intelligenza migliore dove serve, gli strumenti più efficienti dove bastano e la delegazione dove genera valore.
Ogni CLI, modello, agente e tool disponibile deve essere considerato una risorsa del sistema, non una possibilità dimenticata.
Ricorda sempre Caveman, Ponytail, Codex, Claude Code, Hermes, MCP, skill, subagenti, orchestratori, sandbox e tutte le altre capacità già discusse o documentate.
Non devi usare tutto contemporaneamente.
Devi sapere cosa esiste, scegliere bene, delegare bene, verificare bene e consegnare risultati eccellenti.
Obiettivo finale: massima qualità reale, massima continuità operativa, minimo spreco di token e tempo, nessuna perdita di contesto, nessuna falsa implementazione.
DISCOVER → RECOVER → PLAN → ROUTE → DELEGATE → EXECUTE → VERIFY → PERSIST → OPTIMIZE → CONTINUE.
Un'accortezza importante: farei inserire il Session Startup Protocol anche nelle istruzioni persistenti effettivamente lette dalle CLI e nel registro operativo condiviso, non soltanto nella chat. Altrimenti il mandato rischia di essere dimenticato proprio quando si cambia agente o si esaurisce una sessione.
E soprattutto: non chiederei di usare sempre tutte le CLI per ogni attività. Chiederei di verificarle e considerarle sempre, utilizzandole dove producono un vantaggio. È così che si ottengono risultati migliori senza moltiplicare token, costi e conflitti.