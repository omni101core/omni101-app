-- Proposal link for an APPROVED quote and the customer's acceptance.
-- Share: SHA-256 of the private token only, 30-day expiry, revocable. The snapshot is frozen at share time: prices are never recalculated.
CREATE TABLE proposal_shares (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 quote_id TEXT NOT NULL REFERENCES quotes(id),
 pricing_version INTEGER NOT NULL,
 token_hash TEXT NOT NULL UNIQUE,
 language TEXT NOT NULL DEFAULT 'it' CHECK(language IN ('it','en')),
 snapshot TEXT NOT NULL,
 expires_at INTEGER NOT NULL,
 revoked_at INTEGER,
 created_by TEXT NOT NULL REFERENCES users(id),
 created_at INTEGER NOT NULL
);
CREATE INDEX proposal_shares_quote ON proposal_shares(organization_id,quote_id);
-- Acceptance: one per quote (a second attempt hits the unique index), append-only (triggers below).
CREATE TABLE proposal_acceptances (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 quote_id TEXT NOT NULL UNIQUE REFERENCES quotes(id),
 share_id TEXT NOT NULL REFERENCES proposal_shares(id),
 pricing_version INTEGER NOT NULL,
 option_tier TEXT NOT NULL CHECK(option_tier IN ('ESSENZIALE','CONSIGLIATA','COMPLETA')),
 option_snapshot TEXT NOT NULL,
 proposal_snapshot TEXT NOT NULL,
 signer_name TEXT NOT NULL,
 signer_role TEXT NOT NULL,
 signer_email TEXT NOT NULL,
 terms_accepted INTEGER NOT NULL CHECK(terms_accepted=1),
 ip_hash TEXT NOT NULL,
 accepted_at INTEGER NOT NULL
);
CREATE TRIGGER proposal_acceptances_no_update BEFORE UPDATE ON proposal_acceptances BEGIN SELECT RAISE(ABORT,'proposal_acceptances is append-only'); END;
CREATE TRIGGER proposal_acceptances_no_delete BEFORE DELETE ON proposal_acceptances BEGIN SELECT RAISE(ABORT,'proposal_acceptances is append-only'); END;
