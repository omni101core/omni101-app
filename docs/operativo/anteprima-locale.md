# Anteprima locale da artifact CI

Usare `python3 scripts/local-preview.py status` per revisione configurata, prova disponibile e health di `127.0.0.1:4177` (revision/database/storage). Nessun valore di credenziali o configurazione viene stampato.

Preparazione senza modifiche: `python3 scripts/local-preview.py update --run ID_RUN`. Il repository è fisso: `omni101core/omni101-app`; serve una run push del repository stesso sui branch `release-commercial`, `rebuild-commercial` o `verify-commercial`, proveniente da `.github/workflows/verify.yml`, completata con successo e un solo artifact non scaduto `omni101-verified-build`. L’autenticazione è quella già disponibile a `gh`.

Prerequisito schema: il wrapper non applica migrazioni. Prima di usare codice più recente, il coordinatore deve applicare la migrazione `0015_knowledge_access.sql` esclusivamente al D1 locale già posseduto dall’anteprima e verificare le altre migrazioni richieste. Non usare D1 remoto o un nuovo stato isolato per questa operazione.

Dopo revisione del coordinatore: stesso comando con `--apply`. Scarica in una nuova directory `/tmp/omni101-preview-SHA-…`, estrae solo `apps/web/build/server` e `client`, rifiuta traversal/symlink/dimensioni eccessive. Conserva `social-review` e `email-review` locali se presenti. Nessuna dipendenza, npm, build, porta o processo viene avviato, fermato o riavviato. Non esiste modalità draft: run fallite/in corso sono rifiutate.

Aggiorna atomicamente soltanto `main`, `assets.directory`, `vars.BUILD_REVISION` nel config già posseduto `/tmp/omni101-preview-3af1af4/local.json`. Gli altri valori e lo stato persistente restano invariati. Prima salva una copia `local.backup-TIMESTAMP.json` nella stessa directory; il percorso è stampato. `preview-source.json` accanto al build registra SHA, run, status/conclusion e VERIFIED: indica l’origine CI, non una prova che il processo locale abbia ricaricato il build e non autorizza release.

Rollback: copiare il backup indicato su `/tmp/omni101-preview-3af1af4/local.restore.json`, poi rinominarlo con `mv` su `local.json`. È una sostituzione atomica nella stessa directory; non toccare directory di stato, porte o processi. Le directory preparate restano conservate anche in caso di errore. Eseguire `status` e confrontare health/revisione configurata: se differiscono, l’anteprima non è ancora aggiornata; eventuale intervento sul processo richiede una verifica separata.

Vincoli: massimo 150 MiB archivio/build, 50 MiB per file, 12.000 entry ZIP; supplementi massimo 25 MiB/2.000 entry per directory. Il wrapper non legge `.env`, stato applicativo o credenziali locali. Prima applicazione riservata alla revisione del coordinatore; nessun aggiornamento eseguito durante l’implementazione.
