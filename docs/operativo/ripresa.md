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
