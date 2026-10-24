-- Approved pricing versions are frozen: a version counts as approved when its approvals row ('pricing:' || id) is APPROVED.
-- Price changes go through a new version, never through an edit or delete of an approved one.
CREATE TRIGGER pricing_versions_approved_no_update BEFORE UPDATE ON pricing_versions
WHEN EXISTS(SELECT 1 FROM approvals a WHERE a.id='pricing:'||OLD.id AND a.organization_id=OLD.organization_id AND a.status='APPROVED')
BEGIN SELECT RAISE(ABORT,'approved pricing_versions are immutable'); END;
CREATE TRIGGER pricing_versions_approved_no_delete BEFORE DELETE ON pricing_versions
WHEN EXISTS(SELECT 1 FROM approvals a WHERE a.id='pricing:'||OLD.id AND a.organization_id=OLD.organization_id AND a.status='APPROVED')
BEGIN SELECT RAISE(ABORT,'approved pricing_versions are immutable'); END;
