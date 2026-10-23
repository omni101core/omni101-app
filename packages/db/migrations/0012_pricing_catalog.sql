-- Additive: listino importato, versionato per organizzazione. Nessun dato reale nel repo.
CREATE TABLE pricing_catalog_versions (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 version INTEGER NOT NULL CHECK(version>0),
 generated_at TEXT NOT NULL,
 payload TEXT NOT NULL,
 imported_by TEXT NOT NULL REFERENCES users(id),
 created_at INTEGER NOT NULL,
 UNIQUE(organization_id,version),
 UNIQUE(organization_id,generated_at)
);
CREATE INDEX pricing_catalog_versions_org_version ON pricing_catalog_versions(organization_id,version);
