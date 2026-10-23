# Dashboard — inventario operativo e criteri di chiusura

Aggiornato: 2026-10-22. Ambito: piattaforma commerciale `apps/web`, non CEO OS.

«Presente» indica codice disponibile: per le nuove viste leggere la prova corrente in STATO prima di dichiararle verificate o online. Il backlog persistente si prepara dal Centro operativo come Owner; non contiene dati di clienti fittizi.

| Area | Disponibilità e criterio per chiuderla |
|---|---|
| Identità e accesso | Passkey, ruoli, inviti e revoca presenti. Provare accesso individuale collaboratore e recupero credenziali senza condivisione account. |
| Separazione dati | Query per organizzazione e cliente; test integrazione. Ogni nuovo endpoint deve mantenere isolamento e autorizzazione server. |
| Centro operativo | Nuovo: priorità deterministiche, scadute, avanzamento, approvazioni, errori e notifiche. Limiti espliciti 500 task/100 progetti; niente KPI globali oltre il campione. |
| CRM | Contatti, aziende, lead, trattative, clienti e board presenti. Restano deduplica guidata, filtri salvati e cronologia commerciale più completa. |
| Acquisizione | Intake persistente, discovery e approvazione. Verificare sempre percorso visitatore → record → presa in carico. |
| Pianificazione | Nuovo: stime, date, traguardi, prerequisiti, percorso critico e commenti. Percorso critico misura lavoro, non disponibilità/calendario. Stime backlog iniziali zero: da compilare, non previsioni affidabili. |
| Dipendenze | Vincoli DB impediscono cicli, avvio anticipato e riapertura incompatibile. Versione piano evita sovrascritture concorrenti delle dipendenze. |
| Collaborazione | Nuovi commenti persistenti e idempotenti, audit individuale. Restano menzioni, allegati e notifiche mirate per persona. |
| QA e consegna | Pipeline e outcome QA presenti. Ogni consegna richiede prove, approvazione e criterio di accettazione. |
| Portale cliente | Progetti, consegne, preventivi, fatture e ticket. Provare due clienti diversi: nessuna visibilità incrociata. |
| Workflow | Builder versionato, validazione DAG, dry run, approvazione, retry e cancel presenti. Template backlog DRAFT; niente cron avviati. Loop/subflow e catalogo 18 nodi non completi. |
| Agenti | Registro 16 specializzazioni, missioni, artefatti e limiti. Provider e budget richiesti; READY_IF_CONFIGURED non significa agente in esecuzione. |
| Recupero errori | Run recuperabili e idempotenza presenti. Verificare provider indisponibile, dispatch fallito, retry e cancellazione con storico preservato. |
| Notifiche | Registro e nuova lettura persistente. Attualmente organizzazione condivisa; non notifiche private o email inviate. |
| Campagne e funnel | Registri Growth presenti; attribuzione, eventi, conversioni e provider invii ancora da collegare. |
| SEO e analytics | Route e registri presenti; completare eventi reali, definizioni metriche, dati strutturati e controllo indicizzazione. |
| Studio creativo | Registro lavorazioni, stato, brief e review. Generazione media/video e archivio allegati dipendono da provider/storage. |
| Finanza | Registri gestionali e nuova sintesi per ruoli finanziari. Differenza incassi/spese parziale, nessuna emissione fiscale o utile certificato. |
| Abbonamenti | Registro ricorrenze presente; nessun addebito o rinnovo provider automatico. |
| Costi AI | Registrazione e budget presenti; costo totale separato se non attribuito al progetto. Non inventare margine progetto. |
| Media e documenti | Storage live assente. Prima di attivarlo definire provider autorizzato, limiti, accesso, retention e backup. |
| Sicurezza operativa | Origin, sessioni, ruoli, audit e scansione segreti. Nuovi flussi devono coprire input invalidi e risposte prive di dettagli sensibili. |
| Accessibilità | Tastiera, focus, etichette, contrasto temi, motion ridotto e mobile da provare sulle nuove viste. |
| Prestazioni | Limitare canvas e immagini; nuove copertine JPEG. Misurare su mobile dopo aggiornamento artefatto. |
| Rilascio | CI separata dal deploy; Cloudflare 7403 ancora bloccante. Nessun «online» senza revisione health e smoke corrispondenti. |
| Continuità | Indice, STATO, moduli, decisioni e ripresa presenti. Per ogni attività: responsabile reale, prova, limite residuo, prossima azione. |

## Regola per attività e agenti

Ogni task deve avere input autorizzati, risultato osservabile, vincoli e verifica. Le specializzazioni nel backlog sono suggerimenti, non assegnazioni o esecuzioni. Prima compilare stime e responsabilità con il team; poi avviare solo il lavoro necessario. Nessuna pubblicazione, email, spesa o attivazione provider implicita in una bozza.

Il bootstrap crea il progetto `OMNI101 · Sviluppo piattaforma`, senza clienti fittizi, con priorità e dipendenze iniziali. Si può ripetere senza perdere edit. Per la procedura e le prove correnti vedere `ripresa.md` e `../STATO.md`.
