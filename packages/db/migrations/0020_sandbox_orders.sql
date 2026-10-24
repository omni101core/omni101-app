-- SANDBOX order created from an accepted proposal. No payment provider: payment_status starts PENDING_BANK_TRANSFER.
-- One order per acceptance and per quote (unique): a double click or a parallel call can never create a second one.
CREATE TABLE orders (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 acceptance_id TEXT NOT NULL UNIQUE REFERENCES proposal_acceptances(id),
 quote_id TEXT NOT NULL UNIQUE REFERENCES quotes(id),
 client_id TEXT NOT NULL REFERENCES clients(id),
 project_id TEXT NOT NULL REFERENCES projects(id),
 mode TEXT NOT NULL DEFAULT 'SANDBOX' CHECK(mode='SANDBOX'),
 payment_status TEXT NOT NULL DEFAULT 'PENDING_BANK_TRANSFER' CHECK(payment_status IN ('PENDING_BANK_TRANSFER','PAID','CANCELLED')),
 amount_cents INTEGER NOT NULL CHECK(amount_cents>=0),
 currency TEXT NOT NULL DEFAULT 'EUR' CHECK(currency='EUR'),
 option_tier TEXT NOT NULL,
 reference TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
CREATE INDEX orders_org ON orders(organization_id,created_at);
-- The price is frozen at creation; only payment_status moves.
CREATE TRIGGER orders_frozen BEFORE UPDATE OF amount_cents,currency,acceptance_id,quote_id,client_id,project_id,option_tier ON orders BEGIN SELECT RAISE(ABORT,'orders price and links are frozen'); END;
CREATE TRIGGER orders_no_delete BEFORE DELETE ON orders BEGIN SELECT RAISE(ABORT,'orders is append-only'); END;
