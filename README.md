# OMNI101

Digital Possibility Studio — commercial application for **omni101.app**. Independent source, data and cloud runtime; ceo-os is outside this project's scope.

## Modules

- `apps/web`: React 19, strict TypeScript, React Router SSR on Cloudflare Workers.
- `packages/db/migrations`: versioned relational D1 schema, individual identities and audit.
- `packages/agents`: versioned agent registry and bounded execution policies.
- Public studio: services, original concept portfolio, insights, protected lead intake, commerce/creative/workflow demonstrations and Vision Lab.
- Agency workspace: CRM, persisted Kanban, record search, projects, planning tasks, proposals, approvals and operational records.
- OMNI ASSIST: actual configured NVIDIA inference, structured allowlisted navigation, consent-protected brief handoff, private copilot reads and confirmed task creation. Public history is isolated by an opaque visitor cookie; internal history by authenticated user. Default retention 7/30 days can be shortened through `assistant_retention_days`.
- Mission Control: actual runs, provider/model, measured tokens, artifacts, audit events and decisions.
- Workflow Builder: versioned XYFlow DAGs, bounded validated nodes and Cloudflare durable execution. Approval waiting and retry are explicit. Unsupported external email/HTTP/schedule/loop nodes are unavailable, rather than simulated.

## Identity and decisions

Individual WebAuthn passkeys require user verification. Registration needs a single-use expiring invitation. Session cookies are HttpOnly/Secure/SameSite=Strict; revocation and server membership checks apply. An optional configured Cloudflare Access identity adapter is also available.

AI intake creates a **preliminary** proposal requiring human review. Internal approval does not imply customer acceptance. Owner/Admin must explicitly confirm acquisition before conversion creates the project and task plan. Invoices are management records; no verified fiscal issuance integration is active.

## Verification and release

CI runs `npm install`, `npm run typecheck`, `npm test`, isolated D1 migrations, a production test build, and Playwright Chromium desktop/mobile. It then builds and deploys staging and exercises real visitor→assistant/lead→AI proposal→approval→project/tasks and durable graph execution using synthetic records. Local install/build requires the disk capacity gate documented in AGENTS.md.

`rebuild-commercial` deploys only staging. Production releases require founder approval on the reviewable result, then the verified `release-commercial` pipeline. Each environment has separate D1 and workflow bindings. Staging alone uses official Turnstile test keys; production requires real hostname/action-validated proofs.

No paid provider is enabled automatically. Free NVIDIA execution checks configured zero pricing, rate limits and an approved budget. Missing credentials/bindings fail closed. R2 media storage currently requires account activation; upload/production media integrations are not represented as active. Cloud coding sandboxes, live voice/video providers, optional desktop gesture companion and advanced finance remain separate integrations requiring verification.

## Recovery and limitations

Previous commercial source and GitHub deployment were backed up before replacement. Production runs wholly on Cloudflare, without a Mac server dependency. Wrangler OAuth used for CI is short-lived and must be refreshed before a release; a durable CI credential has not been provisioned.

Vision inference runs in the browser after explicit camera consent. Runtime/model downloads use documented Google MediaPipe and jsDelivr endpoints; frames are not uploaded or recorded by this application. Manual controls remain available. Synthetic/manual tests do not establish webcam gesture reliability on a user's hardware.

No invented clients, revenue, case-study outcomes or production metrics are seeded. Legal identity/retention disclosures and provider-specific compliance must be completed with verified business information before broader commercial collection.
