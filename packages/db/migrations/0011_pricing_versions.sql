-- Additive: existing manually entered proposals retain their current behavior.
ALTER TABLE quotes ADD COLUMN pricing_version INTEGER;
CREATE TABLE pricing_versions (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 quote_id TEXT NOT NULL REFERENCES quotes(id),
 version INTEGER NOT NULL CHECK(version>0),
 lead_id TEXT REFERENCES leads(id),
 input TEXT NOT NULL,
 calculation TEXT NOT NULL,
 created_by TEXT NOT NULL REFERENCES users(id),
 created_at INTEGER NOT NULL,
 UNIQUE(organization_id,quote_id,version)
);
CREATE INDEX pricing_versions_org_quote ON pricing_versions(organization_id,quote_id,version);
