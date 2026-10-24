-- Mini-demo: a commerce_configuration draft linked to a lead. No personal data lives here.
-- Draft = share_token_hash IS NULL; shared = hash set (SHA-256 of the private token, never the token).
ALTER TABLE commerce_configurations ADD COLUMN lead_id TEXT REFERENCES leads(id);
ALTER TABLE commerce_configurations ADD COLUMN language TEXT;
ALTER TABLE commerce_configurations ADD COLUMN share_token_hash TEXT;
ALTER TABLE commerce_configurations ADD COLUMN shared_at INTEGER;
-- One mini-demo per lead: a parallel generation loses on this index instead of duplicating.
CREATE UNIQUE INDEX idx_commerce_configurations_lead ON commerce_configurations(lead_id) WHERE lead_id IS NOT NULL;
CREATE UNIQUE INDEX idx_commerce_configurations_share ON commerce_configurations(share_token_hash) WHERE share_token_hash IS NOT NULL;
