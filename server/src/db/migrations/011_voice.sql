-- Voice session logs and transcripts

CREATE TABLE IF NOT EXISTS voice_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  conversation_id TEXT REFERENCES conversations(id),
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_tenant ON voice_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_sessions(user_id);

ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_voice_sessions ON voice_sessions
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE TABLE IF NOT EXISTS voice_transcripts (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES voice_sessions(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_transcripts_session ON voice_transcripts(session_id);

ALTER TABLE voice_transcripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_voice_transcripts ON voice_transcripts
  USING (tenant_id = current_setting('app.tenant_id', true));
