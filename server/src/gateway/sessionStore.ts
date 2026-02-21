// Session and message storage — PostgreSQL + Redis (primary) or SQLite (fallback)

import { isPostgresMode } from '../db/database.js';

interface StoredSession {
  id: string;
  channelId: string;
  channelType: string;
  contactId: string;
  contactName: string;
  startedAt: string;
  isActive: boolean;
}

interface StoredMessage {
  id: string;
  sessionId: string;
  channelId: string;
  channelType: string;
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  senderName: string;
  toolCalls: string[] | null;
  status: string;
}

interface CreateSessionInput {
  channelId: string;
  channelType: string;
  contactId: string;
  contactName: string;
  tenantId?: string;
}

export interface AddMessageInput {
  sessionId: string;
  channelId: string;
  channelType: string;
  direction: 'inbound' | 'outbound';
  content: string;
  senderName: string;
  toolCalls?: string[] | null;
  tenantId?: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── PostgreSQL + Redis implementation ──────────────────────────────

async function pgCreateSession(input: CreateSessionInput): Promise<StoredSession> {
  const { query } = await import('../db/postgres.js');
  const { setJsonCache } = await import('../db/redis.js');

  const id = generateId();
  const startedAt = new Date().toISOString();

  await query(
    `INSERT INTO sessions (id, channel_id, channel_type, contact_id, contact_name, started_at, is_active, tenant_id)
     VALUES ($1, $2, $3, $4, $5, $6, 1, $7)`,
    [id, input.channelId, input.channelType, input.contactId, input.contactName, startedAt, input.tenantId ?? 'default']
  );

  const session: StoredSession = {
    id, channelId: input.channelId, channelType: input.channelType,
    contactId: input.contactId, contactName: input.contactName,
    startedAt, isActive: true,
  };

  // Cache in Redis for fast lookup (1 hour TTL)
  await setJsonCache(`session:${id}`, session, 3600);

  return session;
}

async function pgCloseSession(sessionId: string): Promise<void> {
  const { query } = await import('../db/postgres.js');
  const { deleteCache } = await import('../db/redis.js');

  await query('UPDATE sessions SET is_active = 0 WHERE id = $1', [sessionId]);
  await deleteCache(`session:${sessionId}`);
}

async function pgGetSession(sessionId: string): Promise<StoredSession | undefined> {
  const { getJsonCache, setJsonCache } = await import('../db/redis.js');

  // Try Redis cache first
  const cached = await getJsonCache<StoredSession>(`session:${sessionId}`);
  if (cached) return cached;

  // Fall back to PostgreSQL
  const { query } = await import('../db/postgres.js');
  const result = await query(
    'SELECT id, channel_id, channel_type, contact_id, contact_name, started_at, is_active FROM sessions WHERE id = $1',
    [sessionId]
  );

  if (result.rows.length === 0) return undefined;

  const row = result.rows[0] as Record<string, unknown>;
  const session: StoredSession = {
    id: row.id as string,
    channelId: row.channel_id as string,
    channelType: row.channel_type as string,
    contactId: row.contact_id as string,
    contactName: row.contact_name as string,
    startedAt: row.started_at as string,
    isActive: row.is_active === 1 || row.is_active === true,
  };

  // Cache for next lookup
  await setJsonCache(`session:${sessionId}`, session, 3600);
  return session;
}

async function pgGetSessions(): Promise<StoredSession[]> {
  const { query } = await import('../db/postgres.js');
  const result = await query(
    'SELECT id, channel_id, channel_type, contact_id, contact_name, started_at, is_active FROM sessions ORDER BY started_at DESC'
  );

  return result.rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    channelId: row.channel_id as string,
    channelType: row.channel_type as string,
    contactId: row.contact_id as string,
    contactName: row.contact_name as string,
    startedAt: row.started_at as string,
    isActive: row.is_active === 1 || row.is_active === true,
  }));
}

async function pgAddMessage(input: AddMessageInput): Promise<StoredMessage> {
  const { query } = await import('../db/postgres.js');
  const id = generateId();
  const timestamp = new Date().toISOString();
  const toolCallsJson = input.toolCalls ? JSON.stringify(input.toolCalls) : null;

  await query(
    `INSERT INTO messages (id, session_id, channel_id, channel_type, direction, content, timestamp, sender_name, tool_calls, status, tenant_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'delivered', $10)`,
    [id, input.sessionId, input.channelId, input.channelType, input.direction, input.content, timestamp, input.senderName, toolCallsJson, input.tenantId ?? 'default']
  );

  return {
    id, sessionId: input.sessionId, channelId: input.channelId,
    channelType: input.channelType, direction: input.direction,
    content: input.content, timestamp, senderName: input.senderName,
    toolCalls: input.toolCalls ?? null, status: 'delivered',
  };
}

async function pgGetMessages(sessionId: string): Promise<StoredMessage[]> {
  const { query } = await import('../db/postgres.js');
  const result = await query(
    'SELECT id, session_id, channel_id, channel_type, direction, content, timestamp, sender_name, tool_calls, status FROM messages WHERE session_id = $1 ORDER BY timestamp ASC',
    [sessionId]
  );

  return result.rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    sessionId: row.session_id as string,
    channelId: row.channel_id as string,
    channelType: row.channel_type as string,
    direction: row.direction as 'inbound' | 'outbound',
    content: row.content as string,
    timestamp: row.timestamp as string,
    senderName: row.sender_name as string,
    toolCalls: row.tool_calls ? JSON.parse(row.tool_calls as string) as string[] : null,
    status: row.status as string,
  }));
}

// ─── SQLite implementation ──────────────────────────────────────────

// Lazy-loaded SQLite database reference (avoids require() in ESM)
let _sqliteDbPromise: Promise<{ getDatabase: () => unknown }> | null = null;
async function getSqliteDb() {
  if (!_sqliteDbPromise) _sqliteDbPromise = import('../db/database.js');
  const mod = await _sqliteDbPromise;
  return mod.getDatabase() as {
    prepare: (sql: string) => {
      run: (...args: unknown[]) => void;
      get: (...args: unknown[]) => unknown;
      all: (...args: unknown[]) => unknown[];
    };
  };
}

interface SessionRow {
  id: string;
  channel_id: string;
  channel_type: string;
  contact_id: string;
  contact_name: string;
  started_at: string;
  is_active: number;
}

interface MessageRow {
  id: string;
  session_id: string;
  channel_id: string;
  channel_type: string;
  direction: string;
  content: string;
  timestamp: string;
  sender_name: string;
  tool_calls: string | null;
  status: string;
}

function rowToSession(row: SessionRow): StoredSession {
  return {
    id: row.id,
    channelId: row.channel_id,
    channelType: row.channel_type,
    contactId: row.contact_id,
    contactName: row.contact_name,
    startedAt: row.started_at,
    isActive: row.is_active === 1,
  };
}

function rowToMessage(row: MessageRow): StoredMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    channelId: row.channel_id,
    channelType: row.channel_type,
    direction: row.direction as 'inbound' | 'outbound',
    content: row.content,
    timestamp: row.timestamp,
    senderName: row.sender_name,
    toolCalls: row.tool_calls ? JSON.parse(row.tool_calls) as string[] : null,
    status: row.status,
  };
}

async function sqliteCreateSession(input: CreateSessionInput): Promise<StoredSession> {
  const db = await getSqliteDb();
  const id = generateId();
  const startedAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO sessions (id, channel_id, channel_type, contact_id, contact_name, started_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`
  ).run(id, input.channelId, input.channelType, input.contactId, input.contactName, startedAt);

  return {
    id, channelId: input.channelId, channelType: input.channelType,
    contactId: input.contactId, contactName: input.contactName,
    startedAt, isActive: true,
  };
}

async function sqliteCloseSession(sessionId: string): Promise<void> {
  const db = await getSqliteDb();
  db.prepare('UPDATE sessions SET is_active = 0 WHERE id = ?').run(sessionId);
}

async function sqliteGetSession(sessionId: string): Promise<StoredSession | undefined> {
  const db = await getSqliteDb();
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as SessionRow | undefined;
  return row ? rowToSession(row) : undefined;
}

async function sqliteGetSessions(): Promise<StoredSession[]> {
  const db = await getSqliteDb();
  const rows = db.prepare('SELECT * FROM sessions ORDER BY started_at DESC').all() as SessionRow[];
  return rows.map(rowToSession);
}

async function sqliteAddMessage(input: AddMessageInput): Promise<StoredMessage> {
  const db = await getSqliteDb();
  const id = generateId();
  const timestamp = new Date().toISOString();
  const toolCallsJson = input.toolCalls ? JSON.stringify(input.toolCalls) : null;

  db.prepare(
    `INSERT INTO messages (id, session_id, channel_id, channel_type, direction, content, timestamp, sender_name, tool_calls, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'delivered')`
  ).run(id, input.sessionId, input.channelId, input.channelType, input.direction, input.content, timestamp, input.senderName, toolCallsJson);

  return {
    id, sessionId: input.sessionId, channelId: input.channelId,
    channelType: input.channelType, direction: input.direction,
    content: input.content, timestamp, senderName: input.senderName,
    toolCalls: input.toolCalls ?? null, status: 'delivered',
  };
}

async function sqliteGetMessages(sessionId: string): Promise<StoredMessage[]> {
  const db = await getSqliteDb();
  const rows = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC').all(sessionId) as MessageRow[];
  return rows.map(rowToMessage);
}

// ─── Unified exports ────────────────────────────────────────────────

export function createSession(input: CreateSessionInput): Promise<StoredSession> {
  if (isPostgresMode()) return pgCreateSession(input);
  return sqliteCreateSession(input);
}

export function closeSession(sessionId: string): Promise<void> {
  if (isPostgresMode()) return pgCloseSession(sessionId);
  return sqliteCloseSession(sessionId);
}

export function getSession(sessionId: string): Promise<StoredSession | undefined> {
  if (isPostgresMode()) return pgGetSession(sessionId);
  return sqliteGetSession(sessionId);
}

export function getSessions(): Promise<StoredSession[]> {
  if (isPostgresMode()) return pgGetSessions();
  return sqliteGetSessions();
}

export function addMessage(input: AddMessageInput): Promise<StoredMessage> {
  if (isPostgresMode()) return pgAddMessage(input);
  return sqliteAddMessage(input);
}

export function getMessages(sessionId: string): Promise<StoredMessage[]> {
  if (isPostgresMode()) return pgGetMessages(sessionId);
  return sqliteGetMessages(sessionId);
}
