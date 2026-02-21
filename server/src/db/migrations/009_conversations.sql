-- Server-side conversation and message storage for AI kernel

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  title TEXT,
  agent_type TEXT,
  channel TEXT NOT NULL DEFAULT 'web',
  channel_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel, channel_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_conversations ON conversations
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Conversation messages (distinct from gateway messages)
CREATE TABLE IF NOT EXISTS conversation_messages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_calls JSONB,
  tool_results JSONB,
  model TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_messages_conv ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_messages_created ON conversation_messages(created_at);

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_conv_messages ON conversation_messages
  USING (tenant_id = current_setting('app.tenant_id', true));
