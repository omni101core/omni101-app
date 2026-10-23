-- Private founder originals are readable by Owner/Admin only. Additive: every existing record stays TEAM_INTERNAL.
ALTER TABLE knowledge_records ADD COLUMN access_scope TEXT NOT NULL DEFAULT 'TEAM_INTERNAL' CHECK (access_scope IN ('TEAM_INTERNAL','OWNER_ADMIN'));
UPDATE knowledge_records SET access_scope='OWNER_ADMIN' WHERE source LIKE 'Private founder original%';
-- ponytail: insert-time guard so an importer that does not yet set access_scope cannot publish a private original to the team. Updates are left to the API rules.
CREATE TRIGGER IF NOT EXISTS knowledge_private_original_scope AFTER INSERT ON knowledge_records
WHEN NEW.source LIKE 'Private founder original%' AND NEW.access_scope<>'OWNER_ADMIN'
BEGIN UPDATE knowledge_records SET access_scope='OWNER_ADMIN' WHERE id=NEW.id; END;
