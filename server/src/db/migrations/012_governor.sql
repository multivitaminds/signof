-- Governor: policies, approval requests, budget tracking

CREATE TABLE IF NOT EXISTS governor_policies (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  action TEXT NOT NULL,
  effect TEXT NOT NULL DEFAULT 'allow',
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  approval_agent_types JSONB DEFAULT '[]',
  conditions JSONB NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governor_policies_tenant ON governor_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_governor_policies_action ON governor_policies(action);

ALTER TABLE governor_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_governor_policies ON governor_policies
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE TABLE IF NOT EXISTS approval_requests (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  requester_id TEXT NOT NULL,
  action TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  resource_type TEXT,
  estimated_cost REAL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_id TEXT,
  review_note TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_approval_requests_tenant ON approval_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);

ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_approval_requests ON approval_requests
  USING (tenant_id = current_setting('app.tenant_id', true));
