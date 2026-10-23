-- Shared commercial records: manual links/events, not browser tracking or delivery.
CREATE TABLE campaign_links (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id),
 campaign_id TEXT NOT NULL REFERENCES campaigns(id), resource_type TEXT NOT NULL CHECK(resource_type IN ('LEAD','TASK','GROWTH_PLAN','CREATIVE_JOB')),
 resource_id TEXT NOT NULL, created_by TEXT NOT NULL, created_at INTEGER NOT NULL,
 UNIQUE(organization_id,campaign_id,resource_type,resource_id)
);
CREATE INDEX idx_campaign_links_org ON campaign_links(organization_id,campaign_id);
CREATE TABLE revenue_events (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id),
 campaign_id TEXT REFERENCES campaigns(id), lead_id TEXT REFERENCES leads(id),
 type TEXT NOT NULL CHECK(type IN ('NOTE_ADDED','FOLLOW_UP_COMPLETED','QUALIFICATION_RECORDED')),
 description TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'MANUAL', schema_version INTEGER NOT NULL DEFAULT 1,
 created_by TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE INDEX idx_revenue_events_org ON revenue_events(organization_id,created_at DESC);
