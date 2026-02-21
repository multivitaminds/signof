-- Redis-backed session metadata (PostgreSQL stores persistent session data,
-- Redis handles ephemeral session state like active connections)

-- Add user ownership to sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Session metadata for Redis-backed lookup
CREATE TABLE IF NOT EXISTS session_tokens (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_session_tokens_user ON session_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tokens_expires ON session_tokens(expires_at);

ALTER TABLE session_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_session_tokens ON session_tokens
  USING (tenant_id = current_setting('app.tenant_id', true));
