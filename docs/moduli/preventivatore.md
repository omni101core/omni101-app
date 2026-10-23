# Preventivatore spiegabile

## Stato verificato del 23 ottobre — ritorno Codex

Il preventivatore e il catalogo0012 sono già nel live3adf682, run39994191429 verde. Audit Grok mirato e revisione Codex hanno distinto backlog obsoleto e residui: guardia richiedente/decisore, aritmetica BigInt, requestId per tenant e payload portale sono presenti e testati. Guardia stato/versione presente; nuova regressione concorrente specifica per review versionata aggiunta, da confermare nella prossima CI. Nessuna tariffa o policy modificata qui. Le note locali e la policy precedente alla sezione S1 sotto sono storico.


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
- Cliente destinatario opzionale, validato per tenant e congelato nella versione: solo quote APPROVED appaiono al relativo cliente, senza input/costi. Snapshot immutabili, retry idempotente per autore/payload, conflitti 409, batch atomici e audit. Nessuna sovrascrittura silenziosa.

## Verifica e limiti

Test integrazione: aritmetica, ricorrenze, sconti, limiti, tasse non presunte, idempotenza, due Owner/versioni, blocco CRUD/review, approvazione reale e conversione con quote link, isolamento tenant e ruoli. Browser: crea/calcola/salva/reload/review, mobile screenshot e overflow. Solo CI, nessuna build/install sul Mac.

Da completare: catalogo tariffe approvate, opzioni, PDF/proposta impaginata, personalizzazione fiscale multivaluta, accettazione cliente, pagamenti e fatturazione. Non esporre snapshot con costi al CLIENT. Nessun invio o pagamento attivo. Per rollback il vecchio Worker ignora colonna/tabelle nuove; conservare dati e snapshot.

Review CLI Orca (23 ottobre): Claude Sonnet 5.5 medium ha individuato un caso di collisione requestId che poteva lasciare quote v0: creazione ora condizionata nel batch, test di interleaving. Sconto/sotto costo richiedono motivazione server-side nella richiesta, flag nell’evidenza senza importi interni. Nota storica prima di S1: allora Owner/Admin potevano decidere proprie richieste. Questa frase è superata dalla guardia di separazione dei compiti S1 descritta sotto e già presente nel live verificato. Limite numerico verificabile: diretto<=1e10, costo corretto<=4e10, target<=8e11, massimo prodotto monetario per basis point<=8e15<2^53; nessun overflow presunto senza controesempio. Scenario REJECTED→nuova versione→nuova review aggiunto ai test.

Review Grok 4.7 medium tramite CLI visibile Orca: report in /tmp/omni101-orca-20261023/grok-review.md, solo statica. Risolti: dialog approvazione non si chiude prima dell’esito, motivazione umana richiesta, feedback attribuito/versionato nel preventivatore, azioni nascoste ai ruoli non autorizzati, vista fiscale/lead dello snapshot, review permessa solo sulla versione corrente, stato riletto dal server. Le ipotesi sullo schema approval e sull’ordine degli snapshot sono state confrontate con API/schema: fields per write=[] non sono concessi; snapshot latest100+versione richiesta oppure404, quindi nessuna sostituzione silenziosa della versione richiesta. Portale mostra versione, quota una tantum anche a zero e precisa che visione non equivale ad accettazione/pagamento; canary ora collega un vero cliente QA staging e verifica che l’altro non veda la proposta. Test browser ampliato su rifiuto motivato, feedback, nuova versione e permessi Sales.

## Indurimento S1 (23 ottobre 2026, da verificare in CI)

- Separazione dei compiti: `decision()` rifiuta con 403 la decisione su una review pricing se `requested_by` coincide con chi decide. Serve un secondo Owner/Admin. Test CI e canary usano due utenti distinti.
- Review legata alla versione: prima della decisione il preventivo deve essere `IN_REVIEW` con `pricing_version` pari a `evidence.pricingVersion`, altrimenti 409 e approvazione ancora PENDING. L'UPDATE di stato ripete la stessa condizione.
- Preventivi solo ricorrenti: `amount_cents` di testata resta 0 (nessuna stima annua inventata). Il portale non mostra più «Quota una tantum netta: 0,00 €» e lascia il riepilogo per cadenza. Decisione di prodotto sulla testata resta al founder.
- Aritmetica: arrotondamenti e prezzo obiettivo (per eccesso) con BigInt locale, esatti anche vicino al tetto. I limiti già garantiscono prodotti sotto MAX_SAFE_INTEGER (netto massimo 8e11).
- `requestId` cercato solo nel proprio tenant.
