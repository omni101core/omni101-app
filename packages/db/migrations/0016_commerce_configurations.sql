CREATE TABLE commerce_configurations (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 owner_user_id TEXT NOT NULL REFERENCES users(id),
 client_id TEXT REFERENCES clients(id),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version >= 1),
 configuration TEXT NOT NULL CHECK(json_valid(configuration)),
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
CREATE INDEX idx_commerce_configurations_org ON commerce_configurations(organization_id,updated_at);
CREATE INDEX idx_commerce_configurations_owner ON commerce_configurations(organization_id,owner_user_id,client_id);
