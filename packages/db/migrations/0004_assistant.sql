CREATE TABLE IF NOT EXISTS assistant_conversations (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id),
 mode TEXT NOT NULL CHECK(mode IN ('public','internal')), owner_hash TEXT NOT NULL,
 user_id TEXT REFERENCES users(id), title TEXT NOT NULL, expires_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_assistant_owner ON assistant_conversations(organization_id,owner_hash,mode,updated_at);
CREATE INDEX IF NOT EXISTS idx_assistant_expiry ON assistant_conversations(expires_at);
CREATE TABLE IF NOT EXISTS assistant_messages (
 id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
 role TEXT NOT NULL CHECK(role IN ('user','assistant')), content TEXT NOT NULL,
 structured TEXT, provider TEXT, model TEXT, tokens_used INTEGER NOT NULL DEFAULT 0,
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_assistant_messages ON assistant_messages(conversation_id,created_at);
