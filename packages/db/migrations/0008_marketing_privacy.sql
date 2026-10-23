-- Operational registers, not an email sender or legal compliance certification.
CREATE TABLE marketing_suppressions (
 id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id),subject_hash TEXT NOT NULL,
 reason TEXT NOT NULL CHECK(reason IN ('OPT_OUT','HARD_BOUNCE','COMPLAINT','MANUAL')),
 created_by TEXT REFERENCES users(id),created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,
 UNIQUE(organization_id,subject_hash)
);
CREATE TABLE marketing_consent_records (
 id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id),subject_hash TEXT NOT NULL,
 purpose TEXT NOT NULL DEFAULT 'MARKETING' CHECK(purpose='MARKETING'),
 state TEXT NOT NULL CHECK(state IN ('GRANTED','WITHDRAWN')),source TEXT NOT NULL,policy_version TEXT NOT NULL,
 created_by TEXT NOT NULL REFERENCES users(id),created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL
);
CREATE INDEX consent_subject_history ON marketing_consent_records(organization_id,subject_hash,created_at);
CREATE TABLE privacy_requests (
 id TEXT PRIMARY KEY,organization_id TEXT NOT NULL REFERENCES organizations(id),name TEXT NOT NULL,
 subject_email TEXT NOT NULL,request_type TEXT NOT NULL CHECK(request_type IN ('ACCESS','RECTIFY','ERASURE','RESTRICT','PORTABILITY','OBJECT')),
 status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK(status IN ('RECEIVED','VERIFY_IDENTITY','IN_PROGRESS','COMPLETED','CLOSED')),
 description TEXT,due_date TEXT,owner_id TEXT REFERENCES users(id),created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL
);
CREATE INDEX privacy_requests_org ON privacy_requests(organization_id,status,created_at);
