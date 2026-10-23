# AGENTS.md — omni101-app

Leggi `docs/README.md` prima di lavorare. Poi `docs/STATO.md` e il file in `docs/moduli/` dell'area che tocchi. A fine lavoro aggiorna quel modulo. Se la scelta non è ovvia, aggiungi una riga datata in `docs/decisioni.md`. Un lavoro senza questo aggiornamento non è finito.

## Divieti

- ceo-os (`~/Projects/ceo-os-omni101-main-brand` e ogni altro percorso ceo-os) è sola lettura. Niente git, niente build, niente scrittura.
- Non toccare `main`, `release-commercial` di tua iniziativa, GitHub Pages, DNS, le route Cloudflare di produzione.
- Niente deploy di produzione. Niente R2 e niente altri servizi a pagamento.
- Niente commit git locali su questo repo durante la ripresa del 22/10, salvo un ordine esplicito del founder fuori da quel vincolo.
- Niente `scripts/refresh-deploy-auth.py`. Il token CI è già un secret permanente.
- Sotto il 15% libero su `/System/Volumes/Data`: niente `npm install`, `npm run build`, Playwright sul Mac.
- Niente segreti nel codice e nei documenti. Niente lettura di `~/.omni101/state/omni101-app/`. Niente link di invito negli esiti.
- Non cancellare file. Sovrascrivi solo i file che la tua spec ti assegna. Il file deve essere intero e, se è TypeScript, compilabile.
- `src/` e `worker/` sono il sito Astro precedente. Non sono l'app che pubblica `scripts/cloud-verify.py`. `MOSTRA_PREZZI` in `src/data/prezzi.ts` resta `false` finché il founder non decide il contrario. Non governa `apps/web`.

## Verifica

Solo in CI, e solo se la tua spec te lo permette. Sequenza in `docs/operativo/rilascio.md`. Senza un id di run verde non si dichiara il lavoro pubblicato. Lo staging si controlla dopo la propria run, sulle proprie pagine.

`docs/` e questo file viaggiano con `scripts/cloud-verify.py` (dal 22/10, con scansione anti-segreti prima del push). Aggiornarli resta obbligatorio: sono la fonte per ogni AI che mette mano al repo.

## Caricamento mirato e handoff

Per selezionare solo i file pertinenti: `node scripts/project-context.mjs growth` (anche knowledge/frontend/security/release). È un indice, non un esecutore o una concessione di permessi. Fonte unica: docs/operativo/agent-context.json. Non caricare tutti i mandati o installare harness duplicati. Originali in docs/mandati/sources.json; task/decisioni/test vanno collegati alle fonti. Lo stato runtime si legge in docs/STATO.md e nell’health, non si deduce dall’esistenza di una skill. Caveman/Ponytail disponibili non dimostrano che un proxy sia acceso. Handoff nei campi del registro, senza segreti.

## Avvio sessione per CLI

1. Leggi `docs/CONTEXT.md`, `docs/STATO.md` e il checkpoint corrente (campo `handoff` del registro) prima di toccare file.
2. `omni-delega quote` prima di aprire worker; se il pool è saturo cambi motore, non classe dati.
3. Dichiara la classe dati (C pubblici / B anonimizzati / A cliente-segreti) e passa il gate: `delega-gate.sh` + `rizzo-gate.py`.
4. Lancia con `omni-delega lancia` su file disgiunti: una CLI per insieme di file, nessuna scrittura condivisa.
5. Il coordinatore verifica e ricalcola i numeri chiave; nessun worker si autodichiara finito.
6. Handoff su file nei `handoff_fields`, senza segreti, non in chat.
7. Tool, modelli, classi e routing stanno solo in `docs/operativo/agent-context.json` (`tool_capabilities`, `delegation_plan`): non duplicarli qui.
