-- Multi-tenancy: tenants, org settings
-- Every subsequent table gets a tenant_id column for RLS

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- Add tenant_id to existing tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS tenant_id TEXT REFERENCES tenants(id);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_id ON sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_tenant_id ON messages(tenant_id);

-- Enable Row-Level Security on tenanted tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policies: only see rows matching current tenant context
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_sessions ON sessions
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation_messages ON messages
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Default tenant for existing data (dev/demo)
INSERT INTO tenants (id, name, slug, plan)
VALUES ('default', 'Default Workspace', 'default', 'free')
ON CONFLICT (id) DO NOTHING;

-- Assign existing rows to default tenant
UPDATE users SET tenant_id = 'default' WHERE tenant_id IS NULL;
UPDATE sessions SET tenant_id = 'default' WHERE tenant_id IS NULL;
UPDATE messages SET tenant_id = 'default' WHERE tenant_id IS NULL;
