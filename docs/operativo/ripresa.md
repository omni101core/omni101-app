# Ripresa

Come una AI, o il founder, rientra su OMNI101 senza rifare la mappa.

## Ripresa — 24 ottobre pomeriggio (Testa + publisher)

Fatti presi solo dagli esiti in `/tmp/omni101-deleghe/*/esito.md`. Nessun push, deploy, worker nuovo o tab in questo pomeriggio.

### Catena release (snapshot e CI)

| Base | Contenuto | CI registrata nei file letti |
|---|---|---|
| base32 | snapshot da 32cdb51, W29 escluso, fix ACL ticket CLIENT | `cddd2f0`: log in `r2-browser-17/ci-cddd2f0-failed.log` (17 failed, 182 passed); conductor scrive run 40095072101 "in corso". Attribuzione da confermare |
| base33 | fix test owners e selettori en-landing, da base32 | nessuna run propria: usa i log di `cddd2f0` |
| base34 | focus menu e mini-demo, da base33 | `7115eae`: 4 failed, 195 passed. `617b04b`: 3 failed, 196 passed (nessun esito scritto) |
| base35 | focus assist e theme-quality, da base34 | nessuna run |
| base36 | `r2-release36` | `ba76362`: 1 failed (`assist-mobile.spec.ts:55`), 204 passed |
| `c88d378` | — | nessun riferimento nei file letti (compare solo nella spec) |

- ACL ticket CLIENT: review indipendente `RELEASE_OK`, nessun blocco. Non ancora rilasciata.
- Release: non avviata. Gate: CI verde, review del diff, poi staging e canary, poi release dallo stesso snapshot.
- Incidente: un comando di lettura ha avviato per errore un publish su `rebuild-commercial` (SHA `fcd6556`, run 40094990351). Annullato prima di migrazioni o deploy; produzione non toccata. Il commit resta sul branch: cancellarlo spetta al founder.

### Snapshot onda (base40–base43)

- base40 (`i-onda1`): integra W29 multiopzione e follow-up, dashboard, CRM con motivo LOST, calendario `.ics`, checkout sandbox, bozza intake, i18n fase 2, Local Desk, case study, focus di base35. Migrazioni 0018–0022 applicate in SQLite in memoria; nessun test di suite eseguito.
- Numerazione riconciliata in integrazione: checkout 0020, CRM 0021, intake 0022; 0019 = immutabilità prezzi approvati.
- base41: base40 più capitolo home a card (base36), avviso lead per mail (solo produzione) e prezzi "da" (base37). Prezzo Local Desk dal blocco `bundle` del file prezzi.
- base42: pezzi UX (hero, 404, stati admin, token portale fuori dall'URL, privacy, pagine `/offerte`), cover in webp, fix F1–F6 della review (limite di richieste per ambito, cliente dell'ordine solo dal preventivo, verifica del bundle sul motore). Migrazioni invariate (0018–0022).
- base43: base42 più SEO/GEO (titoli, JSON-LD, sitemap EN, `llms.txt`, chiave IndexNow), touch target, catalogo e modulo con contesto, messaggi per link scaduti, guardia sulla decisione di prezzo, fondamenta email (migrazione 0023: consensi e soppressioni), fix2 del capitolo (icona OMNI ASSIST su telefono), quattro articoli, `prod-smoke.py`. Nessun test di suite eseguito: tsc, vitest e playwright solo in CI.

### Decisioni founder

- Avviso lead: email a `omni101.core@gmail.com` via inoltro email del dominio. Il destinatario va verificato prima del rilascio; senza verifica il lead resta salvato e l'avviso fallisce.
- Prezzi "da": strategia Testa. Flag `MOSTRA_PREZZI` spento in base40; base37 lo accende: da confermare. Prezzo solo da snapshot approvato.
- Turnstile: verificare dopo la release (chiave pubblica di produzione presente, form non verificabile dall'esterno).
- Capitolo home: sostituito da griglia di card (scelta A, non verificata in browser).
- Anteprima fissa `127.0.0.1:4177` + link Desktop. Nessun worker nuovo.

### Prossimi passi

1. Chiudere CI `ba76362` (assist-mobile) e theme-quality dai log; massimo quattro cicli sul rosso.
2. Review indipendente del pacchetto base40 prima di push. Test di suite e tsc solo in CI.
3. Verificare destinatario avviso lead; poi release e invio di prova (founder).
4. Verificare Turnstile dopo release.
5. Decidere branch `rebuild-commercial` con `fcd6556` (founder).
6. Archiviare orfani del capitolo (con founder, nessuna cancellazione).
7. Rimuovere log diagnostico `menu-focus-trace` quando la CI è verde.
8. Aggiornare docs dei moduli e `docs/decisioni.md` (righe dei mandati non ancora scritte).

## Prima di editare

1. `AGENTS.md` e `docs/README.md`.
2. `docs/STATO.md` e il `docs/moduli/` dell'area.
3. Se il compito è motion, `docs/moduli/regia-motion.md` e il testo `esiti/omni101-codex-ripresa/REGIA-MOTION.md`.
4. Se il compito è un worker Orca, la propria `SPEC-*.md` e `CONTRATTO-COMUNE.md` nella stessa cartella esiti.

Repo: `~/omni101/01-Projects/active/omni101-app`. Branch locale osservato il 22/10: `reinvenzione-2026-10`. Non fare commit locali. Non lanciare git su ceo-os.

## Run e esiti

Run di ripresa: `run_9fb3449e1717`. Elenco task in `esiti/omni101-codex-ripresa/orca-ids.txt`. Mappa mandato → spec in `MAPPA-MANDATO.md`. Esiti `ESITO-*.md` in quella cartella. Un esito dice file, prove, cosa resta. Senza una prova (id di CI, URL, screenshot, test) non si scrive che una cosa funziona.

Il coordinatore non vede il terminale del worker. Si parla con `orca orchestration`. `worker_done` una volta sola.

## Regole dei worker, versione corta

- Si toccano solo i file della propria spec.
- Bozza in `esiti/omni101-codex-ripresa/tmp-<nome>/`, poi `mv` del file finito. Niente file a metà nel repo: `cloud-verify.py` pubblica l'albero intero delle cartelle che conosce.
- Niente cancel di file altrui. Sovrascrivere solo ciò che si possiede.
- Niente deploy di produzione, niente R2, niente DNS, niente `main`, niente Pages.
- Niente `npm install`, build o Playwright sul Mac finché il disco Data è sotto il 15%.
- La verifica CI la fa solo chi ha il permesso. Prima di pubblicare: `gh run list -R omni101core/omni101-app -L 3`. Una run alla volta. Massimo quattro cicli sul rosso, poi si scrive la causa nell'esito.
- Se il rosso è su un file non tuo, non lo si modifica: si scrive al coordinatore.
- Segreti e `~/.omni101/state/omni101-app/` non si leggono e non si copiano.
- Chi cambia un'area aggiorna il modulo in `docs/moduli/` e, se la scelta non è ovvia, `docs/decisioni.md`. Quei file viaggiano con `cloud-verify.py` (dal 22/10, scansione anti-segreti prima del push): se la scansione si ferma, togli il segreto o mettilo come segnaposto e rilancia. `python3 scripts/cloud-verify.py --check` la esegue senza pubblicare.

## Founder

Produzione dopo uno staging verde, con il suo ok sul branch `release-commercial`. L'invito al collaboratore lo manda lui. R2 lo attiva lui. Identità legale e P.IVA sono sue. I link di invito non si chiedono in chat.

## Passaggio corrente — 22 ottobre sera

Questa sezione aggiorna i riferimenti storici sopra. Non riavviare worker Orca citati nel vecchio fascicolo: il working tree include modifiche successive.

- **Live osservato**: preview e produzione revisione `24ac9b74ac99faa1072f9842c5048845635fb908`; DB presente, storage assente. Non confondere working tree, artefatto locale e live.
- **Ultima verifica funzionale completa**: CI `39833548394`, SHA `7289881681d00cad1bfe109e9d187a379691f555`: 87 test server, 99 browser superati, 9 skip preesistenti. Deploy bloccato dopo i test: D1 Cloudflare errore 7403. Il token permanente ha restrizione IP incompatibile con runner e permessi Workers incompleti. Nessun token sostituito; nuova concessione ancora da confermare dal founder.
- **Locale**: `http://127.0.0.1:4176`, artefatto CI dello SHA sopra, cartella temporanea `/tmp/omni101-preview-7289881`, D1 isolato. Non contiene automaticamente gli edit successivi. Non ricostruire sul Mac finché vale il limite disco. Fermare soltanto questo runtime per sostituirlo con un nuovo artefatto verificato, conservando precedente e dati per rollback.
- **Edit successivi non ancora verificati**: centro operativo, finanza aggregata, pianificazione con percorso critico, dipendenze protette, commenti idempotenti, migrazione 0007 e preparazione backlog. Run `39836488222` fermata sul typecheck delle nuove viste; correzioni locali preparate, serve nuova CI.
- **Verifica senza deploy**: `python3 scripts/cloud-verify.py --verify-only` aggiorna solo `verify-commercial`; typecheck, test e build in CI, senza chiamare staging. Non dichiararla pubblicazione. Una run alla volta.
- **Backlog persistente**: Owner → Centro operativo → «Prepara backlog operativo», oppure `POST /api/setup/operating-backlog` autenticata. Crea progetto interno, 15 attività TODO, 3 traguardi senza scadenze inventate, 3 workflow DRAFT con revisione umana. Ripetibile, conserva edit e dipendenze archiviate. Non avvia agenti, run, email o cron. Non è ancora stato applicato al database live.

### Prossime azioni, nell'ordine

1. Chiudere nuova CI delle viste e del bootstrap; registrare conteggi e SHA in STATO.
2. Servire nuovo artefatto locale, preparare backlog nell'organizzazione locale e verificare i percorsi Owner/collaboratore.
3. Completare immagini e casi concreti B&B/ristorazione/professionisti in `/work`; mantenere etichetta concept senza risultati fittizi.
4. Concessione Cloudflare da founder, staging e smoke sulla nuova revisione; produzione solo secondo il gate di rilascio esistente.
5. Affrontare backlog con prove per attività; aggiornare modulo e decisioni ad ogni chiusura. Provider, storage, identità legale e campagne esterne restano da configurare/verificare.

Agenti disponibili: `packages/agents/registry.ts`. I suggerimenti nei task sono brief da assegnare, non agenti attivi. Stato `READY_IF_CONFIGURED` non prova disponibilità di un provider. Workflow bozza attuali si applicano a lead verificati; non sono monitor di deploy o automazioni temporizzate.

### Backlog effettivamente popolato nel D1 locale

Preparato nella sola istanza loopback il 22/10 sera: 15 task TODO, 3 traguardi, 3 workflow DRAFT, zero agent run e zero workflow run (conteggi verificati con D1 locale). Migrazione 0007 applicata soltanto a questa istanza. Snapshot SQL: `/tmp/omni101-preview-7289881/backlog-iniziale.sql`; backup coerente precedente al popolamento: `/tmp/omni101-preview-7289881/before-backlog.sqlite`. Nessun account/sessione di comodo creato: dashboard resta protetta da autenticazione. Conservare lo state D1 quando si sostituisce il bundle locale. Questo non popola lo staging o la produzione.

Ultimo ciclo intermedio `39838095727`: server e typecheck passati, browser 98 passati/4 falliti/10 skip. Cause distinte: test galleria pretendeva il canvas prima di raggiungere la sezione ora caricata in lazy load; etichetta settore includeva il testo delle opzioni; selettore test Centro operativo ambiguo tra h1 e h2. Correzioni: prima raggiungere sezione e poi verificare canvas, nome accessibile esplicito Settore, selettore h2 preciso. Correzione scorrimento galleria ha passato il test diagnostico. Quarta verifica completa da leggere prima di dichiarare verde.

### Esito dopo quattro cicli completi — aggiornamento 23 ottobre

Run `39839506752`, SHA `25ecd29929eb34d49b1e851b867b5bae20244010`: typecheck, test server e build test superati; browser 101 passati, 10 skip, 1 errore nel nuovo test. Il trace mostra piano e tutte le attività caricati: il test cercava il testo esatto senza la freccia `↗` presente nel link. Corretto il selettore sul ruolo link e nome completo; non è stato rimosso alcun controllo funzionale. I quattro cicli e le cause sono registrati qui come richiesto dalla procedura; evitare altri tentativi ripetuti senza una causa precisa. Il founder ha fornito un token esistente dalla clipboard: la nuova verifica di rilascio deve controllare questo cambiamento di accesso, senza creare ulteriori token o modificare DNS.

### Accesso CI e preview locale — 23 ottobre

Il founder ha fornito il token esistente dalla clipboard macOS. Verificati D1 e lettura configurazione Worker, aggiornato il solo secret GitHub `CLOUDFLARE_API_TOKEN` via stdin senza scrivere o mostrare il valore. La clipboard del browser risultava vuota: non era la clipboard macOS. Nessun nuovo token creato e nessun cambio DNS. Run staging avviata: `39884379497`, SHA `a4a84028fed40dddcc57dc8abf1a810f6d9b7e36`; leggere esito prima di dichiarare deploy riuscito.

Preview locale aggiornata: runtime in `/tmp/omni101-preview-25ecd29`, stessa porta 4176, revisione artefatto `25ecd29929eb34d49b1e851b867b5bae20244010`, database conservato in `/tmp/omni101-preview-7289881/state`. Confronto GitHub tree: tutti i blob in apps/ e packages/ identici tra artefatto locale e run staging a4a8402; differenze solo test/documenti. Health locale OK, database presente, storage assente. Screenshot portfolio: `~/.codex/visualizations/2026/10/22/01a16100-836b-7c31-845b-9cb04879cffb/omni101-sector-work.jpg`. Vecchio artefatto e backup conservati per rollback; non cambiare gli altri servizi del Mac.

## 23/10 — rilascio riuscito e nuova memoria in verifica

Produzione confermata via `/api/health`: dbfb3be57967a2e280dee0a5d0f1549a34f4a442, database true, storage false. Run 39887173011 verde sia verify sia production. Promosso esattamente il tree precedentemente verificato 441fc300, senza nuovi account o inviti e senza migrazioni distruttive. I mandati precedenti del founder autorizzano questa pubblicazione incrementale.

Nuovo codice: SEO/SEM/GEO/privacy 0008 e Knowledge 0009. Run 39888078577: typecheck verde, 100/101 test server verdi; fallimento nel fixture cross-tenant che usava ORGANIZATION_ID della prima organizzazione, quindi autenticazione correttamente 401. Corretto usando il contesto della seconda organizzazione, mantenendo attese 404/400 per isolamento. Aggiunta verifica browser autenticata e testo privacy allineato ad assistente NVIDIA e R2 assente. Nuova run da leggere prima di dichiarare questi moduli pubblicati.

Originali degli ultimi tre mandati in docs/mandati con hash. Fonte OpenHands e Sandbox proposta dal founder, non investigata né attivata. Mancano ancora importazione dei mandati nel D1, copertura completa requisiti, calendario/social/publishing e agent adapter. Nessun nuovo costo autorizzato.

Run 39888256155: 101 test server verdi, 102 browser verdi, 11 skip; nuovo percorso browser fermo sul select Tipo: label contenente tutte le option, senza nome accessibile esplicito. Corretti i nomi accessibili dei select (filtri vs elemento) e del consenso/blocco; test usa il nome del controllo reale. Nessun aumento arbitrario dei timeout. Import contesto e copilot successivi inclusi nella prossima run.

Run nuova 39888873562 (a2cf057d76b0b6742da0c29ce2e19052467d9735): include nomi accessibili dei select corretti, copilot memoria, helper import CI. Il catalogo è poi stato esteso da 3 a 6 originali recuperabili (allegati 618e64e3, db2b68f9, f2b96d71); nessun contenuto di chat non letta inventato. Catalogo completo verificato con --sql e doppia esecuzione SQLite in memoria: 21 record/versioni, 12 task. Scan segreti verde. Nessuna scrittura manuale produzione da clipboard: la clipboard non conteneva più il formato atteso e lo script temporaneo si è fermato prima di qualsiasi chiamata o scrittura. Usare il secret CI già valido, senza chiedere un nuovo token.

Run 39888873562, a2cf057d76b0b6742da0c29ce2e19052467d9735: verde completa (typecheck, server, browser, build, 0008/0009, staging, import dei primi 3 originali e smoke cloud). Preparato rilascio incrementale comprensivo del catalogo a 6 originali e recupero puntuale v1; la pipeline release ripete tutte le verifiche in staging, ora anche hash originali e separazione memoria/marketing, prima del job produzione. Nessun agente, invito, account o nuovo servizio a pagamento avviato dal seed.

## Checkpoint rilascio esteso e locale

Candidate release-commercial: 3fa90a5d323cd8273da6e1553b3816f97a35552d, run 39889662855. Questa run deve passare verify completo (inclusi sei originali, richiesta versione v1, hash e screenshot Knowledge/Growth) e production; non interrompere o lanciare un’altra CI sullo staging condiviso. Il job produzione è già autorizzato dai mandati diretti del founder. Leggere `gh run view 39889662855 --repo omni101core/omni101-app`, poi health del dominio. Nessun nuovo token da chiedere: secret CI funzionante.

Locale aggiornato da artefatto verde 39888873562 (a2cf057), server/client in /tmp/omni101-preview-a2cf057; processo Wrangler sessione 12277, solo 127.0.0.1:4176. D1 persistente sempre /tmp/omni101-preview-7289881/state, backup coerente prima di 0008/0009: before-memory-marketing.sqlite. Entrambe le migrazioni applicate localmente. Import locale completo: 21 knowledge record, 12 nuovi task mandato (oltre ai 15 operativi precedenti), zero utenti creati. Tutti i sei originali v1 confrontati con hash del manifest: corrispondenti. Il locale a2cf non contiene ancora il pulsante/API recupero puntuale v1 del candidate finale: aggiornarlo dal relativo artefatto dopo verde, senza install/build. Rollback del solo processo locale: vecchio artefatto /tmp/omni101-preview-25ecd29 con lo stesso persist-to, schema additivo compatibile.

Screenshot corrente locale: omni101-local-updated.jpg nella cartella visualizations della chat. Nessuna sessione Owner fittizia locale; dashboard protetta. Per le prove autenticate usare screenshot dei canary staging revocati, non creare sessioni sintetiche di produzione.

## ESITO FINALE — 23 ottobre

Run 39889662855 verde completa, produzione/staging/locale alla revisione 3fa90a5d323cd8273da6e1553b3816f97a35552d. 102 test server + 103 browser, 11 skip; smoke cloud include hash originali v1, fonte/task, privati esclusi e marketing spento. Import in produzione riuscito via secret CI: 6 originali, 12 requisiti con task, 3 reference; nessuna esecuzione automatica. Health produzione confermato e canonical/JSON-LD del caso Casa Luce indicizzabile; robots esclude workspace/portale/API.

Locale finale: /tmp/omni101-preview-3fa90a5/local.json, sessione Wrangler 22813, medesimo stato D1. Solo questo processo può essere sostituito; rollback a /tmp/omni101-preview-a2cf057/local.json o precedente con lo stesso persist-to. Nessuna build/install locale. Screenshot canary autentificati: staging-knowledge-desktop/mobile.png e staging-growth-desktop/mobile.png nella cartella visualizations; le sessioni sintetiche sono state revocate e non appartengono alla produzione.

Prossima azione: revisione dei 12 gruppi requisito e copertura integrale delle clausole, con versioni attribuite. Il catalogo iniziale contiene formulazioni storiche precedenti all’import di tutti i sei allegati: aggiornarle via UI creando revisioni, senza alterare gli originali. Restano ACL per progetto, import guidato, calendari/social/asset/brand, inviti UX e collaborazione agent-ready; nessun provider o sandbox costoso va attivato automaticamente. Non ricreare l’Owner esistente, non leggere stato privato locale, non chiedere nuovi token.

## Continuazione 23 ottobre — Adaptive Engineering e Revenue

Nuovi originali 296ffb30 e 0f5f2fcf catturati in docs/mandati/sources.json con hash e ID stabili: totale 8. Il mandato Revenue supera 40k caratteri: limite Knowledge portato a 60k e import record/snapshot diviso in richieste SQL per non troncare gli originali o superare dimensione query. Prova SQLite in memoria con tutte le migrazioni e doppia applicazione: 26 record/versioni, 15 task, tutti gli 8 hash originali corrispondenti. Nessun duplicato.

Revenue riusa campagne/CRM/date esistenti: 0010 aggiunge solo link manuali e eventi v1 idempotenti. Workspace /admin/revenue con card, dettaglio Radix, qualificazione di completezza spiegabile (non propensione acquisto), agenda mensile dalle sorgenti. Email/social/Ads NOT_CONNECTED, nessun invio o tracking automatico. Backend/app nuove in e5aab0f0ecbda920aa4a29a7e263da27235bebd0, run 39948348249: attendere esito. Canary ampliato successivamente con letture Revenue/calendario e screenshot, da includere nel rilascio successivo. Non lanciare CI concorrenti sullo staging condiviso.

Routing contestuale: node scripts/project-context.mjs growth (anche knowledge/frontend/security/release), registro docs/operativo/agent-context.json. Growth emette 14 riferimenti senza incorporare documenti canonici; Caveman/Ponytail/backend-patterns presenti sul Mac. Non presumere proxy attivo o risparmi token: non misurati. Nessuna installazione Serena/Headroom/OpenSpec/Beads/GSD; strumenti duplicati non introdotti. CI verifica tutti i riferimenti. Review indipendente in sola lettura di handler/schema/test/UI nuovi: nessun finding; nessun build/test locale fatto dal reviewer.

Produzione iniziale riletta: 3fa90a5; release-commercial punta al solo commit docs e23d5a08e2ce0ed2a04629fcbe2f18685aff63f8. Locale ancora build 3fa90a5/sessione 22813. Preservare Owner/passkey esistenti e ceo-os. Prima release finale verificare stesso stato remoto, poi pipeline completa con health esatto. Il secret CI funziona: non rileggere clipboard, non chiedere altri token.

Run 39948348249 completamente verde (codice e5aab0f0ecbda920aa4a29a7e263da27235bebd0). Build, browser, migrazione 0010, import 8 originali/15 requisiti con task e smoke staging riusciti. Si promuove il codice verificato attraverso release-commercial, aggiungendo solo i controlli canary di lettura Revenue/agenda e screenshot delle due viewport. Nessun cambio successivo del codice app rispetto alla revisione verificata.

Release 39949366149 verde: 76d17bda7bf9a2bcf38fcca15d3e4a77025c3bd7 online, 104 server + 104 browser, 12 skip, import 8 originali/15 requisiti e canary Revenue/calendario/permessi verde. QA visiva screenshot ha scoperto conflitto CSS legacy su CTA Nuova campagna (test click passava ma testo scuro su sfondo trasparente). Patch solo classe del contenitore + layout, con test contrasto4.5 prima del click. Va verificata/pubblicata prima di chiudere il lavoro. Nessun dato o permesso modificato dalla patch.

## ESITO ADAPTIVE / REVENUE — conclusione verificata

Revisione f53fe2c7b8870f08eec7b3d2226a0aab403c8244, run 39950784094: verify e production verdi, 104 server +104 browser, 12 skip. Canary verifica hash degli8 originali, collegamenti requisiti/task, Revenue/agenda e client esclusi; fonti reali e nessun send/tracking. Import produzione: 8 originali, 15 requisiti/task, 3 reference. Conflitto CSS individuato in QA visiva della prima pubblicazione76d17bd: CTA scura su sfondo trasparente. Corretto con contenitore azioni dedicato/header wrap, test del contrasto4.5 aggiunto e nuove immagini desktop/mobile confermate.

Locale definitivo: /tmp/omni101-preview-f53fe2c/local.json, processo33508, porta4176 solo loopback. Stato sempre /tmp/omni101-preview-7289881/state. Backup before-revenue-0010.sqlite; schema0010 applicato, 26 record e 15 task mandato, zero utenti creati; tutti gli8 hash locali confermati. Fonte precedente3fa90a5 conservata, rollback senza cancellazioni. Nessun install/build locale.

Ripresa: node scripts/project-context.mjs growth. Registro esistente in docs/operativo/agent-context.json, 14 riferimenti e zero documenti completi incorporati. Disponibilità rilevata nel catalogo Codex locale; non dimostra proxy attivo o presenza negli altri cataloghi. Non dichiarare risparmi token non misurati. Skill disponibili mantenute, niente Serena/Headroom/OpenSpec/Beads/GSD installati. Prima di orchestrare altre CLI/worker leggere lo SKILL Orca indicato nelle istruzioni correnti del founder; workspace app esplicito, niente mailbox altrui.

Prossimo valore più alto: composer email/versioni e canali/purpose di consenso con delivery autorizzata; landing/funnel composti da blocchi approvati; calendario/scheduling avanzati. Studiare codice/licenze delle candidate prima di implementarne motori equivalenti, senza installare tutti o inventare integrazioni. Stato NOT_CONNECTED finché mancano provider, permessi, sender e procedure; nessuna spesa o comunicazione esterna autorizzata dal solo planning. Rivedere copertura di tutti i mandati: 15 gruppi iniziali non equivalgono a ogni clausola completata. Owner esistente preservato, ceo-os intatto.


## Continuazione consolidamento ed ecosistema — in corso

Dieci originali e 21 gruppi nel manifest locale; 34 record Knowledge previsti. Nuovi originali `consolidamento-operativo-2026-10-23` e `connected-ecosystem-2026-10-23`, hash byte-per-byte; indice sezioni con task e stati non valutati, non copertura atomica completa. Preventivatore 0011 con formule/cadenze/snapshot/CAS/approvazione reale in verifica. Prime CI: 39957701516 errore tipi API client corretto; 39957963104 unico test rosso per ID approval con %3A: corretto decodePathId. Review indipendente ha confermato la causa e segnalato associazione cliente mancante: aggiunta al payload e al percorso UI, protetta dal tenant e dalla versione. Non dichiarare live questa continuazione finché non esiste nuova prova. Nessuna nuova integrazione/MCP/provider connesso.

## Ripresa corrente — qualità prima del prossimo blocco commerce
1. Integrare correzioni CI077 senza indebolire controlli d’intersezione/focus. Verifica mirata, artifactlocale e revisionevisiva; poi releasecompleta e import5originali+65requisiti+5RISK conhash/permessi.
2. Integrare rendererG8 e configurazionipersistenti solo dopo handoff/review/test, separati dalpackquality. Riutilizzare il renderer per demo/preview, nessun checkoutsimulato dichiaratopagamento; prerequisitireali secondo contractcommercegiàsalvato.
3. Copy6bozzesocialrevisionato pronto in /tmp/omni101-deleghe/g7-social-copy/review; importcomeDRAFTneglistoresesistenti, nessunpost/send. ImmaginiCodex-only.
4. Continuare gruppi65 inmatrice pervalore/dipendenze; coperturasemanticaNON_ESTABLISHED, nonconfonderecatturaecompletamento. QAindipendentedurantelases­sione, nessunnuovojobpersistente.

## Ripresa coordinatore — 24 ottobre 09:45 (Opus Testa e publisher)
Il coordinatore precedente era a quota piena fino alle 11:23; il founder ha ripassato coordinamento e publisher. Harness unico: `~/omni101/00-Control-Plane/istruzioni/harness.md`; chi lavora adesso: `omni-delega.py board`. Ogni worker parte da script con Caveman+Ponytail.
- Orca: chiusi 13 tab conclusi; restano Testa, runner Grok e tab di altri progetti.
- CI verify `1694c9c`: focus del menu (contenimento focusin), launcher reduced-motion, modalità commerciali, collegamenti copertura, tipografia footer mobile.
- Worker attivi: W1 integrazione backend configurazioni (classe A), W2 configuratore Landing in dashboard, W3 test brief modalità, W4 scout lingua/copy (Grok, copia filtrata), W5 inventario asset (le immagini le genera la Testa).
- Decisione founder aperta: prezzi pubblici dal motore (una tantum/abbonamento) sulla pagina Soluzioni.
- Ciclo di rilascio (founder 24/10: "le cose che funzionano possono andare già online", più l'anteprima locale per vedere i progressi): ogni CI verify verde → `scripts/cloud-verify.py --release` (produzione omni101.app) → verifica online delle pagine toccate → anteprima locale `scripts/local-preview.py update --run <id verde> --apply` sulla porta 4177 (migrazioni nuove applicate prima al solo D1 locale, vedi anteprima-locale.md). Ciò che è rosso non esce: si corregge con un worker e si ripete.
- Prezzi v2 dal motore (calcolatore-omni101, formula in docs/modello-prezzi-v2.md lì): "da" pubblici in apps/web/app/content/prezzi-pubblici.json, ancora nascosti (MOSTRA_PREZZI=false) finché le landing non sono verificate.
- Multilingua: Paraglide JS 2 (W23 fase 1), voce di backlog i18n-multilingua.
- 24/10 10:35. Verify `40076276240` rossa: slug organizzazione duplicato nel test commerce (la migration 0001 inserisce già `omni101`). Fix locale: un solo insert. E2e allineati a «Copione» e «Essenza / commercio». Atlas cinema e galleria sul webp già presente; il png resta. W23 fermo fino alle 11:20, file infrastruttura già nel tree. Release solo dopo una verify verde. Preview 4177 resta l’ultimo artefatto, non questo tree.
- 24/10 10:45. Verify `40078656846` rossa sul controllo copertura (gruppo i18n-multilingua assente dalla matrice). Matrice rigenerata dallo script: 66 gruppi, 179 gap, il gruppo nuovo resta senza prove. Nuova verify `40078985066`, un solo file, non è un release. Tre worker su copie di classe C: etichette filtro lavori, elenco residui italiani, asserzioni e2e senza importi. Integrazione solo dopo lettura degli esiti.
- 24/10 11:05. Verify `40079559100` ancora rossa, stessi 9 browser. Assist: il keyframe di apertura stretta sposta il dialogo di 32px e la misura fa 876 su viewport 844. Keyframe ridotto alla sola opacità, non ancora in CI. Menu: il focus resta sul pulsante di apertura per tutta la poll; il file shell è del worker fermo fino alle 11:20, non si tocca prima. Quattro tab aperti col comando sbagliato chiusi. Quota messaggi gratis del giorno esaurita fino alle 02:00 del 25/10. Nessun release. Preview 4177 invariata.

## Passaggio al coordinatore app — 24 ottobre ~12:00 (dalla Testa)
Il founder ridà il comando al coordinatore app. La Testa non pubblica e non lancia più worker; nessun monitor è attivo.

### Stato CI e produzione
- Produzione: invariata a 59988 (ultimo rilascio verde). Nessun rilascio fatto oggi.
- verify-commercial `32cdb51`: CI ancora in corso al passaggio. È lo snapshot di tutto il lavoro tranne W29 (vedi sotto). L'ultima rossa (`b42d5c8`) aveva solo il conteggio fisso dei finding in tests/seed-reviewed-context.test.ts, ora dinamico. Prima di quella, a parte il menu, era tutto verde: typecheck, test server, controllo traduzioni, test browser.
- Se `32cdb51` è verde: rilascio con `scripts/cloud-verify.py --release` dallo STESSO snapshot (escludendo i file di W29), poi verifica online e anteprima locale 4177 (anteprima-locale.md). La pipeline applica da sola le migrazioni 0016 e 0017, che sono solo additive.
- Script per pubblicare senza il lavoro a metà di un worker: `~/.omni101/bin/omni-delega/pubblica-snapshot.sh <repo> <dir-pre> <file nuovi da escludere...>`.

### Fatto oggi (nel repo, tutto in CI tranne W29)
- Shell: menu e footer con superfici scure leggibili in entrambi i temi; footer mobile con link a 14px e testo legale a 12px; campi intake a 16px su mobile. Menu: contenimento del focus con redirect rimandato di un frame; test diviso tra tastiera (contratto a11y, verde) e tap. QS24-06: con il tap emulato il focus non entra nel menu, in un browser reale sì; finding aperto, gravità bassa.
- OMNI Assist ridisegnato: launcher con firma tipografica, bottom sheet su mobile, badge "Risposta informativa"/"Azione eseguita", composer a 16px. Keyframe di apertura solo in opacità, perché la traslazione mandava il pannello fuori dal viewport.
- Commerce:
  - backend delle configurazioni landing (migrazione 0016, CAS, ruoli, audit) e configuratore landing in dashboard (admin/landing-configurator);
  - modalità una tantum, continuativa e su misura in Soluzioni, con CTA verso il brief;
  - mini-demo automatica: dal brief del lead l'LLM dell'assistente compila una configurazione landing; anti-claim deterministico; link pubblico /demo/:token con hash a DB, revocabile, noindex (migrazione 0017).
- Lingua: scout di 225 finding (179 corretti), testi pubblici in italiano, firme preservate. Multilingua con Paraglide JS 2, fase 1: <html lang> anche in SSR, shell in IT e EN, selettore, landing /en con 3 offerte e la mini-demo gratuita, scripts/i18n-check.mjs in CI, glossario in apps/web/messages. Voce di backlog: i18n-multilingua.
- Asset: tre foto esistenti finalmente collegate (Explore, Studio, Appunti); webp per l'atlas (da 2,5 MB a 202 KB) e per 3 foto dei lavori; inventario completo in /tmp/omni101-deleghe/w5-asset-audit/assets.json.
- Prezzi: motore v2 in ~/omni101/01-Projects/active/calcolatore-omni101 (docs/modello-prezzi-v2.md lì): prezzo = max(pavimento di costo, valore di mercato), 3 livelli, setup + canone, bundle, mercato e valuta (EUR, USD, GBP), quote() unica per ogni richiesta. Shopify tolto: niente piattaforme di terzi. I "da" pubblici sono in apps/web/app/content/prezzi-pubblici.json, nascosti con MOSTRA_PREZZI=false.

### In corso al passaggio
- W29: preventivo approvato → link cliente → accettazione registrata, istruzioni di bonifico (worker attivo; file: server/proposals.ts, migrazione 0018, route proposta, QuoteProposalShare, PricingWorkspace, api.ts, routes.ts). Esito: /tmp/omni101-deleghe/w29-proposal-accept/esito.md. Da revisionare e mandare in CI. Togliere apps/web/app/server/.claude/HANDOFF.md, creato dal worker dentro l'albero pubblicato.

### Prossimi passi consigliati (in ordine)
1. Rilascio del verde e anteprima locale.
2. Integrare W29 e mandarlo in CI.
3. Multilingua fase 2: migrare le pagine pubbliche ai messaggi. Le traduzioni sono lavoro di classe C: prima i modelli gratuiti, il cui tetto giornaliero si azzera alle 02:00.
4. Prima risposta automatica al lead, quando c'è il provider email.
5. Pagamento: serve un PSP del founder.
6. Rivedere i finding di contrasto e tipografia nella dashboard.

### Funnel internazionale pronto (non pubblicato, nessun invio)
- Offerta Local Desk per attività locali USA: pagina di prenotazione + bozze di risposta alle recensioni. Dal motore: "from 1,900 USD + 148 USD/month" (Essenziale del bundle).
- Contenuti in /tmp/omni101-deleghe/w20b-funnel-us/ (offerta, Contra, email CAN-SPAM, teardown LinkedIn) e /tmp/omni101-deleghe/w20-funnel-content/.
- Ricerche: /tmp/omni101-deleghe/w13-intl-research/ (internazionale), w9-pricing-research (Italia), w17-i18n-research (librerie), w18-revenue-path (cosa manca per incassare).

### Bloccato dal founder (aggiornato 24/10 ~12:10)
- Immagini: le genera il coordinatore app con la sua generazione integrata (decisione del founder). Il saldo fal.ai non serve più. Va comunque ruotata la chiave fal, stampata per errore in un terminale locale.
- Turnstile (anti-spam gratuito di Cloudflare sul modulo intake, già integrato; senza chiave di produzione il modulo risponde 503 per scelta): NON serve il founder. Il coordinatore app crea il widget e imposta la chiave segreta con l'accesso Cloudflare che usa già per i deploy (API/wrangler secret), senza stampare segreti. Non va sostituito con un sistema fatto in casa, che sarebbe più debole.
- Contra (marketplace freelance senza commissioni: un canale di vendita, non uno strumento): FACOLTATIVO. Serve un profilo a nome del founder; testi pronti in /tmp/omni101-deleghe/w20b-funnel-us/contra.md. Alternativa senza account: landing /en + contatti diretti conformi.
- Restano del founder: account email con dominio (SPF/DKIM/DMARC) e un PSP per i pagamenti; conferma dei claim (consegna guidata dal fondatore, supporto post lancio).

### Harness
~/omni101/00-Control-Plane/istruzioni/harness.md, letto da tutte le CLI tramite AGENTS.md:
- Testa e publisher unico.
- Ordine delle corsie: gratuiti (solo classe C) → Grok/Hermes/Cursor (pool xAI, max 3) → Sonnet per la classe A → Haiku per il meccanico.
- Merlin (Chrome, getmerlin.in/chat) per la ricerca.
- Lancio solo con `omni-delega.py agente|lancia`, che iniettano Caveman e Ponytail.
- `board --chiudi-fatti` per vedere chi fa cosa e chiudere i tab finiti.
- preview.omni101.app è vecchio: non si apre.
Registro dei lavori: /tmp/omni101-deleghe/registro.jsonl. Originali privati del founder di oggi: ~/.omni101/mandati/richiesta-founder-harness-2026-10-24.md e richiesta-founder-acquisizione-2026-10-24.md.

## Ripresa Codex App — piano del24ott
Coordinatore/publisher ripreso da Codex App. Nuovo mandato chiede fase piano: nessun nuovo push/deploy/migrazione o refactor. Piano proposto: docs/operativo/piano-strategico-2026-10-24.md (14sezioni, taskP24-01..14). CI32cdb51/run40084388255 FAILED240server/1fail/3TODO; browser nonpartiti, nonrilasciare. W29 consegnato NOT_READY dopo review; prezzi/opzioni nonlegatiapprovazione eANNUAL/USAGE omessi confermati. Prodhealth59988HTTP200;preview4177nessunlistener,config077draft. Originaleblueprint art_20261024T111423_130fc0e42009 sha b034245fbfcbc3775494f33c3e6401a163d7a8f6d58df7979edb4b0b447103e6; importKnowledgepending. Prossimo: approvazione piano, P24-01/02 e W29separato; dettagli/contratti nel piano, nonripetereauditgenerale.

## Esecuzione R2 autorizzata dal founder — 24ott
Il founder ha autorizzato esecuzione integrale progressiva e deleghe Claude/Grok. Il precedente PLAN_READ_ONLY è superato per gli ambiti assegnati. Codex coordina/publisherunico; budget sessione19%residuo, CLI fanno implementazioni. R2canonico: docs/operativo/piano-strategico-2026-10-24.md; backupR1 /tmp/omni101-deleghe/execute-r2-24/p24-before-r2.md. P0CLIENTACLprimaogni release, poiCI/preview/W29/pricing e tutti66gruppi; nessunMVP. Raw privati nonnelrepo, immaginiCodexonly, noAIlocale.

R2 wave1: ClaudeACL+guard+seed consegnati, Grokconfigrete+2E2Eerrori consegnati. Snapshotisolato /tmp/omni101-deleghe/r2-release-snapshot/base32 da32cdb51, W29escluso, suitebrowserfull forzata senza filtri. PrimaCI3dab367/run40094454825 in esecuzione; fixtureorganizationduplicate rilevata review e giàcorretta perprossimasnapshot. Non dichiararelive. W29financialguard corretto in /tmp/omni101-deleghe/r2-w29-financial-guard/in, ancora dareview/integrazione eCIseparata. Importprivato successivo bloccato da securitygatepreparation; nessunaccessosegreti o update trasportocorrente5fonti.
