// In-memory session and message storage for Command Center gateway

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

const sessions = new Map<string, StoredSession>();
const messages = new Map<string, StoredMessage[]>();

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function createSession(input: CreateSessionInput): StoredSession {
  const id = generateId();
  const session: StoredSession = {
    id,
    channelId: input.channelId,
    channelType: input.channelType,
    contactId: input.contactId,
    contactName: input.contactName,
    startedAt: new Date().toISOString(),
    isActive: true,
  };
  sessions.set(id, session);
  messages.set(id, []);
  return session;
}

export function closeSession(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.isActive = false;
  }
}

export function getSession(sessionId: string): StoredSession | undefined {
  return sessions.get(sessionId);
}

export function getSessions(): StoredSession[] {
  return Array.from(sessions.values());
}

export function addMessage(input: AddMessageInput): StoredMessage {
  const msg: StoredMessage = {
    id: generateId(),
    sessionId: input.sessionId,
    channelId: input.channelId,
    channelType: input.channelType,
    direction: input.direction,
    content: input.content,
    timestamp: new Date().toISOString(),
    senderName: input.senderName,
    toolCalls: input.toolCalls ?? null,
    status: 'delivered',
  };

  const sessionMessages = messages.get(input.sessionId);
  if (sessionMessages) {
    sessionMessages.push(msg);
  } else {
    messages.set(input.sessionId, [msg]);
  }

  return msg;
}

export function getMessages(sessionId: string): StoredMessage[] {
  return messages.get(sessionId) ?? [];
}
