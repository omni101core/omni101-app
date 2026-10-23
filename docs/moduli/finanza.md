# Finanza

## Scopo

Tenere preventivi, contratti, fatture e spese come registri dello studio, e il budget degli agenti. Non emettere documenti fiscali.

## File

- Risorse in `apps/web/app/server/schema.ts`: `proposals` (tabella `quotes`), `contracts`, `invoices`, `expenses`.
- Dashboard: `dashboard()` in `api.ts`.
- Budget: `POST /api/budgets` in `api.ts`.
- Nav Delivery: Preventivi, Contratti, Fatture, Spese. Intelligence: Approvazioni.
- `apps/web/app/components/workspace/LeadConversion.tsx` per il passaggio da proposta approvata a progetto.

## API

Lettura finanza: OWNER, ADMIN, FINANCE (`read` su contratti, fatture, spese; i preventivi aggiungono SALES e i manager). Scrittura contratti e fatture: quegli stessi tre, e lo status `APPROVED`, `RECORDED` o `PAID` solo OWNER o FINANCE.

`PATCH` di un preventivo a `APPROVED` risponde 409: «Usa il centro approvazioni». La decisione è `POST /api/approvals/:id/decision`.

`POST /api/lead-to-project` dopo l'approvazione, con `dealWon: true`, crea il progetto. Non è un incasso.

`POST /api/budgets` solo OWNER.

La dashboard nasconde `revenueCents` e `aiCostCents` agli altri ruoli (li manda a 0).

Importi in centesimi. In UI, `money()` divide per 100 e formatta EUR (`admin.tsx`).

## Dati

`quotes`, `quote_items`, `contracts`, `invoices` (`external_reference` è testo libero), `payments`, `expenses`, `agent_budgets`, `approvals`. `payments` non è una voce della nav letta oggi: la tabella c'è, la risorsa HTTP no.

Status fattura: `DRAFT`, `RECORDED`, `PAID`, `OVERDUE`. Status spesa: `PLANNED`, `RECORDED`, `PAID`. Status preventivo: `DRAFT`, `IN_REVIEW`, `APPROVED`, `REJECTED`. Status contratto: `DRAFT`, `IN_REVIEW`, `APPROVED`, `ARCHIVED`.

## Test

`tests/workflow.test.ts`: la proposta resta `PENDING` e non nasce un progetto finché non c'è `dealWon`. `tests/integration.test.ts` sui record. Nessun test di invio a un provider fiscale: non c'è il provider.

## Stato

Parziale, 2026-10-22. Registri e permessi ci sono. Margini, costi AI analitici e un bilancio non sono una vista dedicata: la dashboard ha due numeri, e solo per tre ruoli. SPEC-13 cita margini e costi AI ed è in coda. Nessun pagamento online sul sito pubblico (il carrello demo non chiama un gateway).

## Decisioni

Fattura = registro. L'approvazione interna ≠ accettazione del cliente ≠ pagamento. Il prezzo di un preventivo lo scrive una persona nel campo `amount_cents`, non il modello di intake: il prompt vieta di inventare un budget.

## Trappole

- Collegare un gateway di pagamento è un servizio a pagamento: il mandato del 22/10 non lo autorizza.
- Mostrare `revenueCents` in una nuova UI senza rifare il filtro per ruolo lo espone a SALES e ai ruoli tecnici. La dashboard oggi lo azzera dopo la query.
- `quote_items` non è nel form generico. Il totale editabile è `amount_cents` sulla testata.

## Chi lo possiede ora

SPEC-13 per margini e costi. I permessi già nel server li tocca chiunque cambi `schema.ts`: aggiorna questo file.
