-- Email foundation (Garante deadline 2026-10-29): consent ledger + suppression list. Sends and consent events are audited in audit_logs.
-- Consent is an append-only ledger: one row per event, the latest row per (organization, email, purpose) is the current state.
-- No IP address is stored anywhere (the intake keeps none), so no IP hash column.
CREATE TABLE IF NOT EXISTS email_consents (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), email TEXT NOT NULL, purpose TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('GRANTED','WITHDRAWN')), consent_text TEXT, text_version TEXT, source TEXT NOT NULL, source_ref TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_email_consents_lookup ON email_consents(organization_id,email,purpose,created_at);
-- Events are never edited. DELETE stays possible on purpose: the erasure request (art. 17) is served by the founder.
CREATE TRIGGER email_consents_no_update BEFORE UPDATE ON email_consents BEGIN SELECT RAISE(ABORT,'email_consents is append-only'); END;
-- Suppression blocks every send to the address except the founder's own transactional mail. Lifting it is a deliberate manual act.
CREATE TABLE IF NOT EXISTS email_suppressions (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), email TEXT NOT NULL, reason TEXT NOT NULL CHECK(reason IN ('UNSUBSCRIBE','OPT_OUT','BOUNCE','COMPLAINT','MANUAL')), source TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, UNIQUE(organization_id,email));
