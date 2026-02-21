-- Messaging connectors: configs, message log, channel mappings

CREATE TABLE IF NOT EXISTS connectors (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  credentials JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connectors_tenant ON connectors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_connectors_platform ON connectors(platform);

ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_connectors ON connectors
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Channel mappings: link external channels to internal conversations
CREATE TABLE IF NOT EXISTS channel_mappings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  connector_id TEXT NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
  external_channel_id TEXT NOT NULL,
  external_channel_name TEXT,
  conversation_id TEXT REFERENCES conversations(id),
  auto_respond BOOLEAN NOT NULL DEFAULT TRUE,
  agent_type TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_channel_mappings_external ON channel_mappings(connector_id, external_channel_id);

ALTER TABLE channel_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_channel_mappings ON channel_mappings
  USING (tenant_id = current_setting('app.tenant_id', true));
