# Rilascio

## Checkpoint operativo — 23 ottobre, coordinamento Codex

Il founder ha richiesto esplicitamente prosecuzione e rilascio su omni101.app; Codex è l’unico publisher, Grok è esecutore sui file assegnati. Live verificato `3adf682`, run `39994191429`, verify+production verdi e health esatto. Import concluso: 11 originali,48 requisiti/task,5 reference, senza esecuzioni automatiche.

Motion: verify-only `1c7ecab`, run `39995312269`, verde148server/107browser/13skip; release isolata `0b8fc25`, run `39996221347`. Primo tentativo fermato nello smoke da ECONNRESET su POST sintetico; produzione saltata e sessioni test revocate. Ripetuto job fallito allo stesso SHA, senza rendere ritentabili scritture prive di idempotenza. Esito corrente in `docs/STATO.md` e checkpoint Codex.

Un solo flusso può migrare/deployare staging e fare il canary dello SHA alla volta. Una verifica `--verify-only` su snapshot isolato non tocca ambienti remoti: usata per controllare motion mentre terminava la release UX. Non promuovere alberi locali con file worker ancora in scrittura. Nessun comando di pubblicazione delegato ai worker.

Le sezioni datate del 22 ottobre sotto sono storico operativo; non descrivono un blocco credenziali attuale. Il secret CI permanente funziona; nessun nuovo token è necessario. Un esito `production_changed:false` dello script continua a significare soltanto push, non prova di pubblicazione.


Letto il 2026-10-22. Questo worker di documentazione non pubblica e non lancia la CI.

## Branch

| Branch | Cosa fa | Chi lo muove |
|---|---|---|
| `reinvenzione-2026-10` | Working tree locale. Non committare in locale durante la ripresa del 22/10. | I worker, sui file della propria spec. |
| `rebuild-commercial` | Solo staging `preview.omni101.app`. Lo aggiorna `scripts/cloud-verify.py` senza `--release`. | Chi ha il permesso di verifica nella propria spec. |
| `release-commercial` | Dopo il job `verify`, il job `production` pubblica `omni101.app`. | Stesso script con `--release`, solo con l'ok del founder. |
| `main` | Non si tocca. Il vecchio GitHub Pages non è la pipeline di questo Worker. | Nessuno, in questo mandato. |

`cloud-verify.py` crea un commit sul branch remoto con l'albero dei file, parent il branch se esiste, altrimenti `main`. `production_changed` nel JSON di uscita è `false` anche quando il branch è `release-commercial`: il flag non è il deploy. Il deploy lo fa GitHub Actions.

File che lo script carica: `apps/web`, `packages`, `.github/workflows`, `tests`, `docs` (file fino a 1 MB), `scripts/cloud-verify.py` e i file root di configurazione/istruzioni elencati nello script. Scansione anti-segreti prima del push. Esclude dipendenze, build, `.env`, `.dev.vars`, vecchi `src/` e `worker/` e gli altri script operativi locali. Il verificatore include sé stesso perché un nuovo clone possa riprendere il lavoro.

## CI

File: `.github/workflows/verify.yml`. Parte su push a `verify-commercial`, `rebuild-commercial` e `release-commercial`, e su `workflow_dispatch`. Un job `verify` (20 minuti) e, solo se il ref è `release-commercial`, un job `production` (15 minuti).

Ordine di `verify`: checkout, Node 22, `npm install`, `npm run typecheck`, `npm test`, build con `CLOUDFLARE_ENV=test`, migrazioni D1 locali più `tests/owner-fixture.sql`, Playwright Chromium, build con `CLOUDFLARE_ENV=staging`, migrazioni remote staging, `wrangler deploy` con `BUILD_REVISION` = SHA, `node tests/cloud-smoke.mjs`. Artifact `omni101-verified-build` per 7 giorni.

`production`: build `CLOUDFLARE_ENV=production`, migrazioni remote, deploy, poi curl su `https://omni101.app/api/health` (application `omni101-app` e `database` vero) e sulla home (deve contenere «La tua idea.»).

Token: secret GitHub `CLOUDFLARE_API_TOKEN`. Account id nel file del workflow. Non stampare il token. Non eseguire `scripts/refresh-deploy-auth.py`.

Se la CI risponde 401 sull'auth Cloudflare: fermarsi e dirlo al coordinatore. Non rigenerare il token.

Un push alla volta. Se c'è una run `in_progress`, si aspetta. Chi non ha il permesso di verifica non lancia `cloud-verify.py`.

## Staging e produzione

Staging: Worker `omni101-app-staging`, D1 `omni101-app-staging`, workflow `omni101-intake-staging` e `omni101-agency-staging`, dominio `preview.omni101.app`. Turnstile in test mode.

Produzione: Worker `omni101-app`, D1 `omni101-app`, workflow `omni101-intake` e `omni101-agency`, route `omni101.app/*`. Il 22/10 pomeriggio la produzione misurata non aveva `revision` nel health e aveva `storage: false`. Non è stata aggiornata dagli upgrade del giorno.

## Rollback

Il workflow non contiene un job di rollback. Un rilascio precedente si ripubblica con un nuovo deploy dello SHA buono sul branch giusto, non con un revert sul Mac e non toccando DNS. Prima di rifarlo servono l'ok del founder e una CI verde. I database staging e produzione sono distinti: una migrazione `0005` già applicata in remoto non si cancella da git. Le migrazioni sono additive.

Backup del sorgente precedente, citato in `docs/CONTEXT.md` storico: `~/omni101/99-Archive/omni101-app-rebuild-20261022/source-before-rebuild.tgz`. Non è un backup di D1.

## Disco

Sotto il 15% libero su `/System/Volumes/Data` non si lancia `npm install`, `npm run build` o Playwright sul Mac. Il 22/10 il disco era sotto soglia. La verifica è solo il job.

## Runner del riallineamento — 2026-10-22 sera

Run `39829566938`: typecheck, 86 test server e build test passati; interrotta durante installazione browser dopo oltre sette minuti di download molto lento dal mirror `azure.archive.ubuntu.com` (log disponibile). Il runner CI ora usa `archive.ubuntu.com` via HTTPS e installa Chromium headless shell con tutte le dipendenze, timeout 5 minuti. Nessuna modifica al Mac e nessun controllo browser rimosso. `cloud-verify.py` riusa i blob binari invariati già presenti sul branch, dopo la medesima scansione anti-segreti; evita ricaricare tutte le immagini a ogni tentativo.

## Blocco credenziali e verifica senza deploy — 2026-10-22 notte

Run `39833548394`, SHA `7289881`: 87 test server, 99 browser passati e 9 skip; build test/staging verdi. Fallimento autorizzazioni D1 7403, nessun deploy. Browser: token esistente limitato all'IP del Mac e privo di Workers Scripts. Nessuna modifica a quel token; proposta `omni101-app-github-ci` preparata ma NON creata, in attesa di conferma per nuova concessione di accesso. Nessun segreto copiato o rigenerato. Artifact esatto avviato da runtime Wrangler già in cache su `127.0.0.1:4176`, DB locale isolato in `/tmp/omni101-preview-7289881`, nessuna build/installazione sul Mac. Sessione runtime 33833; rollback = fermare soltanto quel processo.

`cloud-verify.py --verify-only` pubblica solo su `verify-commercial`: esegue gli stessi test e build ma salta i quattro passi di staging che richiedono Cloudflare. Non dichiara online il risultato. Consente proseguire la dashboard senza reiterare 7403. `main`, release e produzione invariati.

## Verifica senza deploy

`python3 scripts/cloud-verify.py --verify-only` usa `verify-commercial`: typecheck, test, migrazioni locali e build, senza migrazioni/deploy/smoke remoti. `--check` scansiona soltanto. Non scambiare una verifica senza deploy per una pubblicazione.

23 ottobre: aggiornato il secret permanente CI usando il token esistente fornito esplicitamente dal founder tramite clipboard macOS. Nessun token nuovo, OAuth o modifica DNS. Non stampare mai clipboard o header; valori solo in memoria e stdin verso il secret GitHub. Non eseguire `refresh-deploy-auth.py`.

### Import contesto founder

Il job CI esegue scripts/seed-reviewed-context.mjs dopo deploy, prima dello smoke. Solo tre originali con hash, 12 requisiti/task e tre reference revisionate; insert-or-ignore, nessun overwrite o esecuzione agente. CLI locale --dry-run/--sql non richiede secret. Lo script usa il secret CI esistente senza stamparlo; non dipende dalla clipboard o dal Mac. Un errore si diagnostica e poi si ripete l’import idempotente, senza cancellare record.
