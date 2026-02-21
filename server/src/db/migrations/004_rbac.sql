-- RBAC: roles, permissions, team membership

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_tenant_name ON roles(tenant_id, name);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_roles ON roles
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Team membership: links users to roles within a tenant
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  invited_by TEXT REFERENCES users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_tenant_user ON team_members(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_team_members ON team_members
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Seed default roles for the default tenant
INSERT INTO roles (id, tenant_id, name, description, permissions, is_system) VALUES
  ('role_owner', 'default', 'owner', 'Full workspace control', '["*"]', TRUE),
  ('role_admin', 'default', 'admin', 'Workspace administration', '["admin.*","ai.*","connectors.*","users.read","users.invite"]', TRUE),
  ('role_member', 'default', 'member', 'Standard team member', '["ai.chat","ai.agents","connectors.use","users.read"]', TRUE),
  ('role_viewer', 'default', 'viewer', 'Read-only access', '["ai.chat","users.read"]', TRUE)
ON CONFLICT (id) DO NOTHING;
