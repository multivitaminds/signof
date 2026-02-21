-- Agent runs, tool calls, and cost tracking

CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  agent_type TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  task TEXT,
  result TEXT,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0,
  step_count INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_tenant ON agent_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started ON agent_runs(started_at);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_agent_runs ON agent_runs
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Individual tool calls within an agent run
CREATE TABLE IF NOT EXISTS agent_tool_calls (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  run_id TEXT NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  input JSONB,
  output TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_calls_run ON agent_tool_calls(run_id);

ALTER TABLE agent_tool_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_agent_tool_calls ON agent_tool_calls
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Cost tracking per tenant (daily aggregates)
CREATE TABLE IF NOT EXISTS cost_tracking (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  input_tokens BIGINT NOT NULL DEFAULT 0,
  output_tokens BIGINT NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cost_tracking_daily ON cost_tracking(tenant_id, date, provider, model);

ALTER TABLE cost_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_cost_tracking ON cost_tracking
  USING (tenant_id = current_setting('app.tenant_id', true));
