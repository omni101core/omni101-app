# Architettura

Letto il 2026-10-22 sul working tree locale.

## Stack

| Pezzo | Versione o fatto | File |
|---|---|---|
| UI | React 19.3.1, React Router 7.18.4, SSR | `apps/web/package.json` |
| Validazione | Zod 4 | `apps/web/app/server/schema.ts` |
| Motion pubblico | GSAP 3.13, Motion 12, Three 0.181, React Three Fiber 9 | dipendenze di `apps/web` |
| Workflow editor | `@xyflow/react` 12 | `apps/web/app/components/workspace/WorkflowBuilder.tsx` |
| Visione | `@mediapipe/tasks-vision` 1.1.1, import solo dopo il click | `apps/web/app/components/vision/VisionLab.tsx` |
| Auth | `@simplewebauthn/server` 14, passkey con user verification | `apps/web/app/server/passkeys.ts` |
| Dati | D1, migrazioni in `packages/db/migrations` | `apps/web/wrangler.jsonc` `migrations_dir` |
| Test | Vitest 3 da root; Playwright Chromium desktop e iPhone 13 | `vitest.config.ts`, `playwright.config.ts` |
| Node di CI | 22 | `.github/workflows/verify.yml` |

`npm run dev|build|typecheck|deploy` in root delegano a `apps/web`. `npm test` è Vitest sulla root.

## Cartelle che contano

```
apps/web/app/routes.ts          rotte, le dedicate prima del catch-all
apps/web/app/routes/            pagine
apps/web/app/components/        public, vision, voice, assist, workspace
apps/web/app/server/            API, auth, workflow, pipeline, assistente
apps/web/app/content/           catalogo 75 capacità
apps/web/workers/app.ts         fetch del Worker + due classi Workflow
apps/web/wrangler.jsonc         ambienti staging, test, production
packages/db/migrations/         schema D1
packages/agents/registry.ts     16 agenti, scope brief, nessun tool
tests/                          Vitest e Playwright
scripts/cloud-verify.py         pubblica un sotto-albero (anche docs/) su GitHub, con scansione anti-segreti
src/, worker/, dist/            sito Astro precedente, fuori da quella pubblicazione
```

`routes.ts` oggi: index `routes/home.tsx` (ri-esporta il catch-all pubblico), `admin/*`, `portal/*`, `explore`, `solutions` e `solutions/:family`, `explore/vision`, `explore/voice`, poi `*` → `routes/public.tsx`. Le route dedicate stanno prima del catch-all.

## Runtime

Un solo fetch in `apps/web/workers/app.ts`:

1. `handleApi`. Se risponde, quella è la risposta (`/api/*`, anche `robots.txt` e `sitemap.xml`).
2. Altrimenti React Router SSR.
3. Su ogni risposta SSR: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`. `camera=(self)` solo su `/explore/vision`, `microphone=(self)` solo su `/explore/voice`, geolocalizzazione sempre chiusa. Il valore lo calcola `app/server/permissions.ts` (`permissionsPolicy(pathname)`, trailing slash ignorato), provato da `tests/permissions-policy.test.ts` e da un test e2e sull'header.
4. `/admin` e `/portal`: `Cache-Control: no-store`.

Due classi Workflow nello stesso modulo:

- `LeadIntakeWorkflow`, binding `INTAKE_WORKFLOW`. Uno step `classify-and-brief`, timeout 1 minuto, un retry.
- `AgencyWorkflow`, binding `AGENCY_WORKFLOW`. Esegue il grafo salvato in `workflow_runs`.

Ambienti in `wrangler.jsonc`: default e `production` sul nome `omni101-app` e D1 `omni101-app`; `staging` sul nome `omni101-app-staging`, dominio `preview.omni101.app`, D1 proprio, workflow `omni101-intake-staging` e `omni101-agency-staging`; `test` con D1 locale finto e `workflows: []`. `PUBLIC_ORIGIN` di produzione e default è `https://omni101.app`. Staging è `https://preview.omni101.app` con `TURNSTILE_TEST_MODE=true`.

`Env` in `auth.ts` dichiara anche `MEDIA` (R2) e `QUEUE`. `wrangler.jsonc` non ha `r2_buckets` né `queues`. `/api/health` riporta `storage: !!env.MEDIA`.

## Flussi

```
Visitatore
  -> pagine pubbliche (SSR)
  -> OMNI ASSIST (cookie visitatore, niente lead)
  -> conferma + Turnstile
  -> POST /api/intake
  -> lead + contatto + chiave idempotente
  -> LeadIntakeWorkflow
  -> brief e proposta preliminare (quote DRAFT, approval PENDING)
  -> Owner/Admin decidono in /api/approvals/:id/decision
  -> POST /api/lead-to-project con dealWon:true
  -> progetto e task
  -> grafo AgencyWorkflow (nodo per nodo, si ferma su HUMAN_APPROVAL)
  -> QA (request-qa / outcome)
  -> deliverable al portale
  -> il cliente CLIENT vede solo il proprio client_id
```

L'assistente non scrive il lead da solo. `submit_lead` arriva a `/api/intake`, che rivalida consenso, Turnstile e corpo. La proposta AI non è un prezzo né un contratto. L'approvazione interna non crea il progetto: serve `approveToProject` con `dealWon: true`, ruolo OWNER o ADMIN.

Il playground pubblico `/explore/workflow` è una simulazione. Il test e2e si aspetta il testo «Nessun dato viene scritto nel CRM reale».

## Cosa non gira qui

Il Mac non serve al sito in produzione. CI installa, typecheck, test, migrazioni D1 locali, Playwright, build staging, deploy staging, canary `tests/cloud-smoke.mjs`. Produzione solo sul branch `release-commercial`, dopo il job `verify`. Sotto il 15% di disco libero sul Mac non si lancia install, build o Playwright in locale.
