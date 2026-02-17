// SQLite-backed session and message storage for Command Center gateway

import { getDatabase } from '../db/database.js';

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
}

export interface AddMessageInput {
  sessionId: string;
  channelId: string;
  channelType: string;
  direction: 'inbound' | 'outbound';
  content: string;
  senderName: string;
  toolCalls?: string[] | null;
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

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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

export function createSession(input: CreateSessionInput): StoredSession {
  const db = getDatabase();
  const id = generateId();
  const startedAt = new Date().toISOString();

  const stmt = db.prepare(
    `INSERT INTO sessions (id, channel_id, channel_type, contact_id, contact_name, started_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`
  );
  stmt.run(id, input.channelId, input.channelType, input.contactId, input.contactName, startedAt);

  return {
    id,
    channelId: input.channelId,
    channelType: input.channelType,
    contactId: input.contactId,
    contactName: input.contactName,
    startedAt,
    isActive: true,
  };
}

export function closeSession(sessionId: string): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE sessions SET is_active = 0 WHERE id = ?');
  stmt.run(sessionId);
}

export function getSession(sessionId: string): StoredSession | undefined {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
  const row = stmt.get(sessionId) as SessionRow | undefined;
  return row ? rowToSession(row) : undefined;
}

export function getSessions(): StoredSession[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM sessions ORDER BY started_at DESC');
  const rows = stmt.all() as SessionRow[];
  return rows.map(rowToSession);
}

export function addMessage(input: AddMessageInput): StoredMessage {
  const db = getDatabase();
  const id = generateId();
  const timestamp = new Date().toISOString();
  const toolCallsJson = input.toolCalls ? JSON.stringify(input.toolCalls) : null;

  const stmt = db.prepare(
    `INSERT INTO messages (id, session_id, channel_id, channel_type, direction, content, timestamp, sender_name, tool_calls, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'delivered')`
  );
  stmt.run(id, input.sessionId, input.channelId, input.channelType, input.direction, input.content, timestamp, input.senderName, toolCallsJson);

  return {
    id,
    sessionId: input.sessionId,
    channelId: input.channelId,
    channelType: input.channelType,
    direction: input.direction,
    content: input.content,
    timestamp,
    senderName: input.senderName,
    toolCalls: input.toolCalls ?? null,
    status: 'delivered',
  };
}

export function getMessages(sessionId: string): StoredMessage[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC');
  const rows = stmt.all(sessionId) as MessageRow[];
  return rows.map(rowToMessage);
}
