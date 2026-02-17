CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  channel_type TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  started_at TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  channel_type TEXT NOT NULL,
  direction TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  tool_calls TEXT,
  status TEXT NOT NULL DEFAULT 'delivered'
);

CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);

CREATE TABLE IF NOT EXISTS fleet_instances (
  instance_id TEXT PRIMARY KEY,
  registry_id TEXT NOT NULL,
  runtime_agent_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  status TEXT NOT NULL,
  current_task TEXT,
  spawned_at TEXT NOT NULL,
  last_heartbeat TEXT NOT NULL,
  tokens_consumed INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0,
  cycle_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS task_queue (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  domain TEXT,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  assigned_instance_id TEXT,
  submitted_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  source TEXT NOT NULL,
  result TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  agent_instance_id TEXT,
  timestamp TEXT NOT NULL,
  acknowledged INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS telemetry_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  registry_id TEXT,
  domain TEXT,
  data TEXT NOT NULL,
  timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_instance_id ON telemetry_events(instance_id);
