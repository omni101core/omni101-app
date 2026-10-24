# Portale cliente

## Scopo

Dare a un cliente invitato i suoi progetti, i preventivi già approvati, i contratti approvati, le fatture che non sono bozze, le consegne e un modo per aprire un ticket. Niente dati degli altri clienti.

## File

- `apps/web/app/routes/portal.tsx`
- `portal()` e `acceptInvite` in `apps/web/app/server/api.ts`
- Decisioni consegna e ticket in `apps/web/app/server/pipeline.ts`
- Invito: `POST /api/invitations` in `api.ts`, pannello in `routes/admin.tsx` (`SettingsPanel`)

## API

- `GET /api/portal` — 403 se il ruolo non è CLIENT o manca `clientId`. Progetti con `visibility='CLIENT'`. Preventivi e contratti solo `APPROVED`. Fatture con status diverso da `DRAFT`. Deliverable con `client_visible` e le colonne di consegna.
- `POST /api/portal/deliverables/:id/decision`
- `POST /api/portal/tickets` — crea una issue legata al cliente.
- `POST /api/invitations/accept` — identità Cloudflare Access, email uguale all'invito.

La sessione del portale è la stessa passkey del workspace. `admin.tsx` se vede ruolo CLIENT fa `location.replace('/portal')`.

## Dati

`clients`, `memberships.client_id`, `projects.visibility`, `quotes`, `contracts`, `invoices`, `deliverables`, `issues`. Filtro doppio: `organization_id` e `client_id`.

## Test

`tests/e2e/owners.spec.ts`: «client portal: each invited client sees only their own project and delivery». `tests/agency-pipeline.test.ts` sul gate di consegna. `public.spec.ts` chiede 401 su `GET /api/portal` da anonimo.

## Stato

Parziale, 2026-10-22. Il filtro per cliente c'è. Non c'è un'area file, né commenti, né un login separato dal passkey. L'invito del secondo socio reale lo spedisce il founder: il link non sta in git.

## Decisioni

Il cliente non è un ruolo dello staff con la nav tagliata. Ha route, API e query diverse. Un preventivo in bozza non compare.

## Trappole

- Settare `visibility` a `TEAM` toglie il progetto dal portale anche se `client_id` è pieno.
- `client_visible=0` nasconde il deliverable. La consegna (`POST .../deliver`) è il passo che lo mostra.
- Accettare un invito CLIENT senza `client_id` è rifiutato in creazione (400). Non aggirarlo in `accept`.
- Non loggare l'`inviteUrl`.
- CLIENT non usa `/api/records/*`: il generico fa `SELECT *` senza filtri di stato/visibility e restituirebbe bozze, progetti `TEAM` e colonne interne. Ogni lettura cliente passa da `/api/portal` (eccezione: `GET /api/records/issues` restituisce i propri ticket con le colonne del portale); per aprire una lettura generica serve una policy per risorsa condivisa col portale. Test: `tests/client-records-acl.test.ts`.

## Chi lo possiede ora

SPEC-06, insieme a Mission Control e all'assistente.
