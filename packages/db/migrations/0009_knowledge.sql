-- Internal workspace memory only. No client documents or binary attachments.
CREATE TABLE IF NOT EXISTS knowledge_records (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id),
 name TEXT NOT NULL, kind TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'CAPTURED',
 body TEXT NOT NULL, source TEXT NOT NULL, acceptance TEXT NOT NULL DEFAULT '', evidence TEXT NOT NULL DEFAULT '',
 source_id TEXT, task_id TEXT, version INTEGER NOT NULL DEFAULT 1,
 created_by TEXT NOT NULL, updated_by TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS knowledge_org_updated ON knowledge_records(organization_id,updated_at DESC);
CREATE TABLE IF NOT EXISTS knowledge_revisions (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, record_id TEXT NOT NULL REFERENCES knowledge_records(id),
 version INTEGER NOT NULL, snapshot TEXT NOT NULL, author_id TEXT NOT NULL, created_at INTEGER NOT NULL,
 UNIQUE(record_id,version)
);
