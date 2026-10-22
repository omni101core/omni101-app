ALTER TABLE tasks ADD COLUMN start_date TEXT;
ALTER TABLE tasks ADD COLUMN estimate_minutes INTEGER NOT NULL DEFAULT 60 CHECK(estimate_minutes>=0);
ALTER TABLE task_dependencies ADD COLUMN active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1));
CREATE TABLE project_plans (
 project_id TEXT PRIMARY KEY REFERENCES projects(id), organization_id TEXT NOT NULL REFERENCES organizations(id),
 version INTEGER NOT NULL DEFAULT 0, request_id TEXT, updated_at INTEGER NOT NULL
);
CREATE TRIGGER dependency_insert_scope BEFORE INSERT ON task_dependencies WHEN NEW.active=1 BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM tasks a JOIN tasks b ON a.project_id=b.project_id AND a.organization_id=b.organization_id WHERE a.id=NEW.task_id AND b.id=NEW.depends_on_task_id AND a.project_id IS NOT NULL) THEN RAISE(ABORT,'DEPENDENCY_SCOPE') END;
 SELECT CASE WHEN EXISTS(WITH RECURSIVE chain(id) AS (SELECT NEW.depends_on_task_id UNION SELECT d.depends_on_task_id FROM task_dependencies d JOIN chain c ON d.task_id=c.id WHERE d.active=1) SELECT 1 FROM chain WHERE id=NEW.task_id) THEN RAISE(ABORT,'DEPENDENCY_CYCLE') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM tasks a JOIN tasks b ON b.id=NEW.depends_on_task_id WHERE a.id=NEW.task_id AND a.status IN ('IN_PROGRESS','REVIEW','DONE') AND b.status<>'DONE') THEN RAISE(ABORT,'DEPENDENCY_ACTIVE') END;
END;
CREATE TRIGGER dependency_update_scope BEFORE UPDATE OF active ON task_dependencies WHEN NEW.active=1 BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM tasks a JOIN tasks b ON a.project_id=b.project_id AND a.organization_id=b.organization_id WHERE a.id=NEW.task_id AND b.id=NEW.depends_on_task_id AND a.project_id IS NOT NULL) THEN RAISE(ABORT,'DEPENDENCY_SCOPE') END;
 SELECT CASE WHEN EXISTS(WITH RECURSIVE chain(id) AS (SELECT NEW.depends_on_task_id UNION SELECT d.depends_on_task_id FROM task_dependencies d JOIN chain c ON d.task_id=c.id WHERE d.active=1) SELECT 1 FROM chain WHERE id=NEW.task_id) THEN RAISE(ABORT,'DEPENDENCY_CYCLE') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM tasks a JOIN tasks b ON b.id=NEW.depends_on_task_id WHERE a.id=NEW.task_id AND a.status IN ('IN_PROGRESS','REVIEW','DONE') AND b.status<>'DONE') THEN RAISE(ABORT,'DEPENDENCY_ACTIVE') END;
END;
CREATE TRIGGER task_dependency_gate BEFORE UPDATE OF status ON tasks BEGIN
 SELECT CASE WHEN NEW.status IN ('IN_PROGRESS','REVIEW','DONE') AND EXISTS(SELECT 1 FROM task_dependencies d JOIN tasks p ON p.id=d.depends_on_task_id WHERE d.task_id=NEW.id AND d.active=1 AND p.status<>'DONE') THEN RAISE(ABORT,'DEPENDENCY_UNFINISHED') END;
 SELECT CASE WHEN OLD.status='DONE' AND NEW.status<>'DONE' AND EXISTS(SELECT 1 FROM task_dependencies d JOIN tasks t ON t.id=d.task_id WHERE d.depends_on_task_id=NEW.id AND d.active=1 AND t.status IN ('IN_PROGRESS','REVIEW','DONE')) THEN RAISE(ABORT,'DEPENDENCY_REOPEN') END;
END;
CREATE TRIGGER task_dependency_project BEFORE UPDATE OF project_id ON tasks WHEN NEW.project_id IS NOT OLD.project_id BEGIN
 SELECT CASE WHEN EXISTS(SELECT 1 FROM task_dependencies WHERE active=1 AND (task_id=OLD.id OR depends_on_task_id=OLD.id)) THEN RAISE(ABORT,'DEPENDENCY_PROJECT') END;
END;
