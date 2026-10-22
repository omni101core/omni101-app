-- Planning records only. No external campaign send, paid generation or billing.
CREATE TABLE campaigns (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), name TEXT NOT NULL,
 project_id TEXT REFERENCES projects(id), owner_id TEXT REFERENCES users(id),
 status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PLANNED','RUNNING','PAUSED','COMPLETED')),
 channel TEXT, objective TEXT, audience TEXT, description TEXT, due_date TEXT,
 created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX idx_campaigns_org ON campaigns(organization_id,status);
CREATE TABLE growth_plans (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), name TEXT NOT NULL,
 project_id TEXT REFERENCES projects(id), owner_id TEXT REFERENCES users(id),
 status TEXT NOT NULL DEFAULT 'BACKLOG' CHECK(status IN ('BACKLOG','IN_PROGRESS','REVIEW','DONE')),
 kind TEXT, description TEXT, success_metric TEXT, due_date TEXT,
 created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX idx_growth_org ON growth_plans(organization_id,status);
CREATE TABLE creative_jobs (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), name TEXT NOT NULL,
 project_id TEXT REFERENCES projects(id), owner_id TEXT REFERENCES users(id),
 status TEXT NOT NULL DEFAULT 'BRIEF' CHECK(status IN ('BRIEF','PRODUCTION','IN_REVIEW','APPROVED','REVISION')),
 kind TEXT, description TEXT, storyboard TEXT, variants TEXT, rights_note TEXT, due_date TEXT,
 created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX idx_creative_org ON creative_jobs(organization_id,status);
CREATE TABLE subscriptions (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id), name TEXT NOT NULL,
 project_id TEXT REFERENCES projects(id),
 status TEXT NOT NULL DEFAULT 'PLANNED' CHECK(status IN ('PLANNED','ACTIVE','PAUSED','CANCELLED')),
 provider TEXT, amount_cents INTEGER NOT NULL DEFAULT 0 CHECK(amount_cents>=0),
 cadence TEXT, due_date TEXT, description TEXT,
 created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id,status);
