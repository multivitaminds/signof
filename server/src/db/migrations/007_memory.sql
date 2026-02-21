-- AI Memory system: 4-tier memory (short-term, long-term, profiles, episodic)

-- Enable pgvector extension for embedding storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Short-term memory (also backed by Redis, this is the persistent fallback)
CREATE TABLE IF NOT EXISTS memory_short_term (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  session_id TEXT,
  user_id TEXT REFERENCES users(id),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_st_tenant ON memory_short_term(tenant_id);
CREATE INDEX IF NOT EXISTS idx_memory_st_session ON memory_short_term(session_id);
CREATE INDEX IF NOT EXISTS idx_memory_st_expires ON memory_short_term(expires_at);

ALTER TABLE memory_short_term ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_memory_st ON memory_short_term
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Long-term memory with vector embeddings (pgvector)
CREATE TABLE IF NOT EXISTS memory_long_term (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  content TEXT NOT NULL,
  embedding vector(1536),
  category TEXT NOT NULL DEFAULT 'general',
  scope TEXT NOT NULL DEFAULT 'workspace',
  metadata JSONB NOT NULL DEFAULT '{}',
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_lt_tenant ON memory_long_term(tenant_id);
CREATE INDEX IF NOT EXISTS idx_memory_lt_category ON memory_long_term(category);
CREATE INDEX IF NOT EXISTS idx_memory_lt_scope ON memory_long_term(scope);

-- IVFFlat index for similarity search (create after data load for best performance)
-- CREATE INDEX idx_memory_lt_embedding ON memory_long_term USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE memory_long_term ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_memory_lt ON memory_long_term
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Structured user/org profiles
CREATE TABLE IF NOT EXISTS memory_profiles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  profile_data JSONB NOT NULL DEFAULT '{}',
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_profiles_entity ON memory_profiles(tenant_id, entity_type, entity_id);

ALTER TABLE memory_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_memory_profiles ON memory_profiles
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Episodic timeline memory
CREATE TABLE IF NOT EXISTS memory_episodes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor_id TEXT,
  actor_type TEXT NOT NULL DEFAULT 'user',
  event_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  details JSONB,
  related_entities JSONB DEFAULT '[]',
  importance REAL NOT NULL DEFAULT 0.5,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_episodes_tenant ON memory_episodes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_memory_episodes_actor ON memory_episodes(actor_id);
CREATE INDEX IF NOT EXISTS idx_memory_episodes_type ON memory_episodes(event_type);
CREATE INDEX IF NOT EXISTS idx_memory_episodes_occurred ON memory_episodes(occurred_at);

ALTER TABLE memory_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_memory_episodes ON memory_episodes
  USING (tenant_id = current_setting('app.tenant_id', true));
