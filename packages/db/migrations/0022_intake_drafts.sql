-- Public intake draft: minimized form state (no name, email, consent or antispam token), resumed from a private link.
-- The link carries a random token; only its SHA-256 lives here. Rows expire after 14 days and are deleted on submit.
CREATE TABLE IF NOT EXISTS intake_drafts (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), token_hash TEXT NOT NULL, payload TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, UNIQUE(organization_id,token_hash));
CREATE INDEX IF NOT EXISTS idx_intake_drafts_expiry ON intake_drafts(expires_at);
