-- Bozze email interne. Nessun destinatario, nessun invio, nessun dato di cliente nel repo.
CREATE TABLE IF NOT EXISTS email_drafts (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 campaign_id TEXT REFERENCES campaigns(id),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','IN_REVIEW','APPROVED')),
 subject TEXT NOT NULL,
 preheader TEXT NOT NULL DEFAULT '',
 body TEXT NOT NULL,
 cta_label TEXT NOT NULL DEFAULT '',
 cta_url TEXT NOT NULL DEFAULT '',
 updated_by TEXT REFERENCES users(id),
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_email_drafts_org ON email_drafts(organization_id,updated_at);
