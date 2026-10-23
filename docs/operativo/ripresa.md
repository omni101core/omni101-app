# Ripresa

Come una AI, o il founder, rientra su OMNI101 senza rifare la mappa.

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

Preview locale aggiornata: runtime in `/tmp/omni101-preview-25ecd29`, stessa porta 4176, revisione artefatto `25ecd29929eb34d49b1e851b867b5bae20244010`, database conservato in `/tmp/omni101-preview-7289881/state`. Confronto GitHub tree: tutti i blob in apps/ e packages/ identici tra artefatto locale e run staging a4a8402; differenze solo test/documenti. Health locale OK, database presente, storage assente. Screenshot portfolio: `/Users/alessandropeloso/.codex/visualizations/2026/10/22/01a16100-836b-7c31-845b-9cb04879cffb/omni101-sector-work.jpg`. Vecchio artefatto e backup conservati per rollback; non cambiare gli altri servizi del Mac.

## 23/10 — rilascio riuscito e nuova memoria in verifica

Produzione confermata via `/api/health`: dbfb3be57967a2e280dee0a5d0f1549a34f4a442, database true, storage false. Run 39887173011 verde sia verify sia production. Promosso esattamente il tree precedentemente verificato 441fc300, senza nuovi account o inviti e senza migrazioni distruttive. I mandati precedenti del founder autorizzano questa pubblicazione incrementale.

Nuovo codice: SEO/SEM/GEO/privacy 0008 e Knowledge 0009. Run 39888078577: typecheck verde, 100/101 test server verdi; fallimento nel fixture cross-tenant che usava ORGANIZATION_ID della prima organizzazione, quindi autenticazione correttamente 401. Corretto usando il contesto della seconda organizzazione, mantenendo attese 404/400 per isolamento. Aggiunta verifica browser autenticata e testo privacy allineato ad assistente NVIDIA e R2 assente. Nuova run da leggere prima di dichiarare questi moduli pubblicati.

Originali degli ultimi tre mandati in docs/mandati con hash. Fonte OpenHands e Sandbox proposta dal founder, non investigata né attivata. Mancano ancora importazione dei mandati nel D1, copertura completa requisiti, calendario/social/publishing e agent adapter. Nessun nuovo costo autorizzato.
