# Preventivatore spiegabile

23 ottobre 2026 — implementazione locale, verifica CI e rilascio ancora da eseguire. Mandato: consolidamento-operativo §7; ecosistema connesso §5, scenari A/B. Nessun listino, imposta o margine approvato presunto.

## Percorso

`/admin/estimates`: crea stima → scope/condizioni/assunzioni → voci costo per cadenza → calcola → conferma controllo valori → salva snapshot → richiedi approvazione → centro approvazioni. Il reviewer può aprire il calcolo attribuito. Con lead collegato, l'approvazione alimenta il percorso esistente di conversione esplicita in progetto solo dopo conferma acquisizione commerciale. Non è accettazione cliente automatica.

## Contratto

- `server/pricing.ts`: API autenticata, ruoli OWNER/ADMIN/PROJECT_MANAGER/SALES/FINANCE. Clienti e tecnici esclusi. Scritture con controllo origine comune.
- POST `/api/pricing/preview`: nessuna persistenza, nessun provider.
- GET/POST `/api/pricing`: ultime 100 (+sentinella per troncamento), save con quoteId/requestId/version/input.
- GET `/api/pricing/:id`: storico fino a 100 snapshot, autore e input/calcolo; solo tenant corrente.
- POST `/api/pricing/:id/review`: crea approvazione PENDING applicata dal backend, lega versione e snapshot, blocca modifiche. Una nuova versione si può salvare solo da DRAFT/REJECTED; APPROVED resta immutabile.
- Migrazione additiva 0011: `quotes.pricing_version`, `pricing_versions` con unique org/quote/version. I vecchi preventivi manuali mantengono il percorso precedente. CRUD generico vieta modifiche ai preventivi calcolati.
- Centesimi, quantità in millesimi, percentuali in basis point; limiti numerici espliciti. Arrotondamento per riga, prezzo target per eccesso. Overhead su diretto, contingency su diretto+overhead, margine sul costo corretto, sconto dopo prezzo target. Mostra margine effettivo e sotto costo. Nessuna confusione markup/margine.
- ONE_TIME/MONTHLY/ANNUAL/USAGE separati. Consumo per 1 unità dichiarata, niente volume presunto; una sola unità consumo per proposta. Nessun totale combinato. Testata legacy contiene esclusivamente netto una tantum; summary mostra prezzi per cadenza senza costi interni. Imposta nullable e riferimento umano obbligatorio se configurata.
- Snapshot immutabili, retry idempotente per autore/payload, conflitti 409, batch atomici e audit. Nessuna sovrascrittura silenziosa.

## Verifica e limiti

Test integrazione: aritmetica, ricorrenze, sconti, limiti, tasse non presunte, idempotenza, due Owner/versioni, blocco CRUD/review, approvazione reale e conversione con quote link, isolamento tenant e ruoli. Browser: crea/calcola/salva/reload/review, mobile screenshot e overflow. Solo CI, nessuna build/install sul Mac.

Da completare: catalogo tariffe approvate, opzioni, PDF/proposta impaginata, personalizzazione fiscale multivaluta, collegamento cliente nel portale, accettazione cliente, pagamenti e fatturazione. Non esporre snapshot con costi al CLIENT. Nessun invio o pagamento attivo. Per rollback il vecchio Worker ignora colonna/tabelle nuove; conservare dati e snapshot.
