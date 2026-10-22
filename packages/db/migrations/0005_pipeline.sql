-- Pipeline chiusa: esecuzione -> QA -> consegna -> manutenzione. Additive only.
ALTER TABLE tasks ADD COLUMN kind TEXT NOT NULL DEFAULT 'WORK';
ALTER TABLE tasks ADD COLUMN qa_for TEXT;
ALTER TABLE deliverables ADD COLUMN delivered_at INTEGER;
ALTER TABLE deliverables ADD COLUMN approved_by TEXT;
ALTER TABLE deliverables ADD COLUMN approved_at INTEGER;
ALTER TABLE deliverables ADD COLUMN client_note TEXT;
ALTER TABLE issues ADD COLUMN client_id TEXT;
ALTER TABLE issues ADD COLUMN created_by TEXT;
ALTER TABLE issues ADD COLUMN priority TEXT DEFAULT 'NORMAL';
ALTER TABLE agent_runs ADD COLUMN retry_of TEXT;
CREATE TABLE IF NOT EXISTS qa_reviews (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id),
 project_id TEXT NOT NULL REFERENCES projects(id), task_id TEXT NOT NULL REFERENCES tasks(id), qa_task_id TEXT NOT NULL REFERENCES tasks(id),
 status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','PASS','REJECT')), notes TEXT,
 requested_by TEXT REFERENCES users(id), reviewer_id TEXT REFERENCES users(id), decided_at INTEGER,
 created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_qa_pending ON qa_reviews(task_id) WHERE status='PENDING';
CREATE INDEX IF NOT EXISTS idx_qa_project ON qa_reviews(organization_id,project_id,status);
CREATE TABLE IF NOT EXISTS pipeline_events (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id),
 project_id TEXT NOT NULL, stage TEXT NOT NULL CHECK(stage IN ('PLANNING','EXECUTION','QA','DELIVERY','MAINTENANCE')),
 event_type TEXT NOT NULL, actor_id TEXT, details TEXT, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pipeline_events ON pipeline_events(organization_id,project_id,created_at);
CREATE INDEX IF NOT EXISTS idx_issues_client ON issues(organization_id,client_id,created_at);
