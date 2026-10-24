-- Additive. Motivo perso obbligatorio (anche a livello DB) + storico cambi fase per lead e trattative.
ALTER TABLE leads ADD COLUMN lost_reason TEXT;
ALTER TABLE leads ADD COLUMN lost_at INTEGER;
ALTER TABLE deals ADD COLUMN lost_reason TEXT;
ALTER TABLE deals ADD COLUMN lost_at INTEGER;

CREATE TABLE crm_stage_events (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL REFERENCES organizations(id),
 resource_type TEXT NOT NULL CHECK(resource_type IN ('leads','deals')),
 resource_id TEXT NOT NULL,
 from_status TEXT,
 to_status TEXT NOT NULL,
 reason TEXT,
 actor_id TEXT REFERENCES users(id),
 created_at INTEGER NOT NULL
);
CREATE INDEX crm_stage_events_resource ON crm_stage_events(organization_id,resource_type,resource_id,created_at);

-- Rete di sicurezza: nessun percorso (API generica, import, SQL) porta a LOST senza motivo di almeno 5 caratteri.
CREATE TRIGGER leads_lost_reason_insert BEFORE INSERT ON leads WHEN new.status='LOST' AND length(trim(coalesce(new.lost_reason,'')))<5
BEGIN SELECT RAISE(ABORT,'lost_reason_required'); END;
CREATE TRIGGER leads_lost_reason_update BEFORE UPDATE OF status ON leads WHEN new.status='LOST' AND old.status IS NOT 'LOST' AND length(trim(coalesce(new.lost_reason,'')))<5
BEGIN SELECT RAISE(ABORT,'lost_reason_required'); END;
CREATE TRIGGER deals_lost_reason_insert BEFORE INSERT ON deals WHEN new.status='LOST' AND length(trim(coalesce(new.lost_reason,'')))<5
BEGIN SELECT RAISE(ABORT,'lost_reason_required'); END;
CREATE TRIGGER deals_lost_reason_update BEFORE UPDATE OF status ON deals WHEN new.status='LOST' AND old.status IS NOT 'LOST' AND length(trim(coalesce(new.lost_reason,'')))<5
BEGIN SELECT RAISE(ABORT,'lost_reason_required'); END;

-- Storico: ogni cambio di status scrive un evento, da qualunque percorso. actor_id lo completa l'endpoint di spostamento.
CREATE TRIGGER leads_stage_event AFTER UPDATE OF status ON leads WHEN old.status IS NOT new.status
BEGIN
 INSERT INTO crm_stage_events(id,organization_id,resource_type,resource_id,from_status,to_status,reason,actor_id,created_at)
 VALUES(lower(hex(randomblob(16))),new.organization_id,'leads',new.id,old.status,new.status,CASE WHEN new.status='LOST' THEN new.lost_reason END,NULL,new.updated_at);
END;
CREATE TRIGGER deals_stage_event AFTER UPDATE OF status ON deals WHEN old.status IS NOT new.status
BEGIN
 INSERT INTO crm_stage_events(id,organization_id,resource_type,resource_id,from_status,to_status,reason,actor_id,created_at)
 VALUES(lower(hex(randomblob(16))),new.organization_id,'deals',new.id,old.status,new.status,CASE WHEN new.status='LOST' THEN new.lost_reason END,NULL,new.updated_at);
END;

-- Uscire da LOST pulisce il motivo (resta nello storico).
CREATE TRIGGER leads_leave_lost AFTER UPDATE OF status ON leads WHEN old.status='LOST' AND new.status IS NOT 'LOST'
BEGIN UPDATE leads SET lost_reason=NULL,lost_at=NULL WHERE id=new.id; END;
CREATE TRIGGER deals_leave_lost AFTER UPDATE OF status ON deals WHEN old.status='LOST' AND new.status IS NOT 'LOST'
BEGIN UPDATE deals SET lost_reason=NULL,lost_at=NULL WHERE id=new.id; END;
