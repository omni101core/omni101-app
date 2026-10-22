# OMNI101

Digital Possibility Studio. Commercial application for **omni101.app**.

Independent application: this repository has no runtime, source or data dependency on ceo-os.

## Application

- `apps/web`: React 19 + TypeScript strict + React Router Framework Mode, SSR on Cloudflare Workers.
- `packages/db/migrations`: versioned D1 relational schema.
- `packages/agents`: scoped workforce execution, budget controls and human approvals.
- Public experience: services, portfolio, insights, real lead intake and interactive demonstrations.
- Workspace: CRM, project delivery, commercial records, content and operational controls.
- Managed identity: verified Cloudflare Access JWT, server membership checks, mandatory configured MFA.

## Verification and release

Run `npm install`, `npm run typecheck`, `npm test`, `npm run build` and `npx playwright test` in CI. Local installation/build requires the disk capacity gate documented in AGENTS.md.

No production release until real Cloudflare bindings, managed identity, anti-bot keys and the release checks are configured. Integrations fail closed when unavailable; an empty CRM is not populated with fabricated business records.

The production domain is changed only after a working preview passes verification. The previous commercial source and deployment are backed up for rollback. Fiscal invoicing and binding offers require separately approved integrations and human decisions.
