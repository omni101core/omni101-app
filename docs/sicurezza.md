# Sicurezza

Fatti letti il 2026-10-22. Qui ci sono i nomi dei segreti e i file che li nominano. Nessun valore.

## Passkey e sessione

Registrazione: `POST /api/auth/register/options` con un token di invito di almeno 32 caratteri. Il server cerca `invitations.token_hash`, non il token in chiaro. La passkey è `residentKey: required` e `userVerification: required`. `POST /api/auth/register/verify` crea utente e membership nel ruolo dell'invito, marca l'invito usato, scrive `passkeys`.

Login: `POST /api/auth/login/options` poi `login/verify`. La challenge dura 5 minuti (`expires_at` a 300000 ms, cookie `Max-Age=300`). Il cookie di challenge è `__Host-omni_challenge`. La sessione è `__Host-omni_session`, 24 ore, `Path=/; HttpOnly; Secure; SameSite=Strict`. In tabella sta solo l'hash. `POST /api/auth/logout` mette `revoked_at` e azzera il cookie.

`authenticate` in `auth.ts`: se il cookie c'è, la sessione deve essere non scaduta, non revocata, utente e membership `ACTIVE`, sulla `ORGANIZATION_ID`. Se il cookie c'è ma non torna una riga, 401. Senza cookie, il fallback è `Cf-Access-Jwt-Assertion` (`verifiedEmail`): l'email deve già avere una membership attiva. Non crea utenti.

L'invito dal workspace è `POST /api/invitations`, solo OWNER. Ruoli ammessi: `OWNER`, `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `DESIGNER`, `SALES`, `FINANCE`, `CLIENT`. CLIENT senza `client_id` risponde 400. Scadenza 48 ore. La risposta contiene l'URL di invito: non va scritto in un documento né in un esito. `POST /api/invitations/accept` richiede l'identità Access e la stessa email dell'invito.

Il tipo `Role` include anche `AGENT_SERVICE_ACCOUNT`. L'invito HTTP non lo offre.

## Ruoli, in breve

| Ruolo | Puo' |
|---|---|
| OWNER | Inviti, revoca, budget agenti, tutto ciò che possono ADMIN e gli altri ruoli interni. |
| ADMIN | Decisioni di approvazione, conversione lead→progetto, lettura finanza. |
| PROJECT_MANAGER | Workflow, avvio agenti, CRUD manager. |
| SALES | CRM e preventivi. |
| FINANCE | Contratti, fatture, spese, cifre di ricavo e costo AI. |
| DEVELOPER, DESIGNER | Task e ticket, con i manager. |
| CLIENT | Solo record con `client: true` del proprio `client_id`, e il portale. |

`/api/dashboard` azzera `revenueCents` e `aiCostCents` se il ruolo non è OWNER, ADMIN o FINANCE. Il workspace manda un CLIENT su `/portal` (`admin.tsx`).

## Header e confini

Ogni POST, PATCH, PUT, DELETE sotto `/api/` passa da `assertSameOrigin`: l'header `Origin` deve essere l'origine della richiesta. Il login passkey rifiuta anche un'origine diversa da `PUBLIC_ORIGIN`.

Header SSR in `workers/app.ts`: nosniff, `strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, Permissions-Policy come in `architettura.md`.

Corpo JSON delle API CRUD: tetto 65536 byte. Corpo passkey: tetto 40000. Intake: schema Zod stretto, messaggio 20–10000 caratteri, `consent: true`, servizi solo `BUILD|AUTOMATE|CREATE|GROW`.

## Rate limit

Tabella `rate_limits`, chiave hash di IP Cloudflare (o `local`) più il minuto. Intake: 12 per minuto, 429 oltre. Auth: 20. Avvio agente: 5. L'assistente ha un contatore proprio nello stesso schema (`assistant.ts`, finestra sul bucket).

Turnstile su intake: `TURNSTILE_SECRET_KEY` verso `challenges.cloudflare.com`. Senza segreto, 503 e il testo rimanda a info@omni101.app. In staging, solo se `ENVIRONMENT=staging`, `TURNSTILE_TEST_MODE=true` e `PUBLIC_ORIGIN` è `https://preview.omni101.app`, è accettato il token di test fisso di Cloudflare oltre alla verifica normale. Produzione chiede `action=intake` e hostname uguale a `PUBLIC_ORIGIN`.

## Segreti: dove stanno

| Nome | Dove si imposta | Dove non sta |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Secret di GitHub Actions sul repo `omni101core/omni101-app`. Dal 22/10 è un token di account permanente. | Non nel repo. Non rigenerarlo con `scripts/refresh-deploy-auth.py`: quello script lo sovrascrive. |
| `TURNSTILE_SECRET_KEY` | Secret del Worker (`wrangler secret`). | Non in `wrangler.jsonc`. Il sito Astro vecchio parla di `.dev.vars`, file ignorato. |
| `AI_API_KEY` | Secret del Worker. | Il codice chiama `https://integrate.api.nvidia.com/v1/chat/completions` solo se provider, modello e chiave ci sono. In `wrangler.jsonc` i due prezzi `AI_INPUT_CENTS_PER_MILLION` e `AI_OUTPUT_CENTS_PER_MILLION` sono `0`. `runAgent` esige prezzi finiti e non negativi, poi riserva una stima su `agent_budgets`. Senza riga di budget, o se la somma supererebbe `limit_cents`, risponde 409 e non chiama il provider. Con i prezzi a zero la riserva è zero: la riga di budget serve lo stesso. |
| `TURNSTILE_SITE_KEY` | Variabile pubblica in `wrangler.jsonc` e in `GET /api/public-config`. È una site key, non il segreto. | Non copiarla nei documenti. |
| Inviti, link, export Owner | `~/.omni101/state/omni101-app/` | Vietato leggerla e vietato incollare i link. |

`BOOTSTRAP_OWNER_EMAIL`, `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` sono campi di `Env`. Non risultano nel blocco `vars` di `wrangler.jsonc` letto oggi.

`account_id` e gli id D1 sono nel file di configurazione già versionato. Un documento nuovo non ha bisogno di ripeterli.

## Altri confini

- `robots.txt` vieta `/admin`, `/portal`, `/api`.
- Admin: `noindex, nofollow` in `admin.tsx`.
- Artefatto agente: tetto `ARTIFACT_LIMIT_BYTES` = 900 KiB (`mission.ts`). La colonna `r2_key` esiste; il bucket no.
- I frame della webcam non vanno a un endpoint di questa app (`ESITO-12.md`). Il modello MediaPipe si scarica da Google e jsDelivr.
- Nessun cliente, ricavo o caso studio inventato va seminato. I concept in `site-data.ts` sono marcati come concept.
