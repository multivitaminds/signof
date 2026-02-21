// Voice pipeline — audio in → text → AI → text → audio out

import { processMessage } from '../ai/kernel.js';
import { transcribe } from './stt.js';
import { synthesize } from './tts.js';
import { query } from '../db/postgres.js';
import { generateId } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';

export interface VoiceSession {
  id: string;
  tenantId: string;
  userId: string;
  conversationId?: string;
  status: 'active' | 'paused' | 'ended';
  startedAt: string;
}

const activeSessions = new Map<string, VoiceSession>();

/**
 * Start a voice session.
 */
export async function startVoiceSession(
  tenantId: string,
  userId: string
): Promise<VoiceSession> {
  const session: VoiceSession = {
    id: generateId(),
    tenantId,
    userId,
    status: 'active',
    startedAt: new Date().toISOString(),
  };

  activeSessions.set(session.id, session);

  // Log in DB
  await query(
    `INSERT INTO voice_sessions (id, tenant_id, user_id, status, started_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [session.id, tenantId, userId, session.status, session.startedAt]
  ).catch(() => { /* table may not exist yet */ });

  logger.info('Voice session started', { sessionId: session.id });
  return session;
}

/**
 * Process audio through the full voice pipeline.
 * Audio → STT → AI Kernel → TTS → Audio
 */
export async function processAudio(
  sessionId: string,
  audioBuffer: Buffer,
  options: {
    language?: string;
    voiceId?: string;
    onTranscript?: (text: string) => void;
    onResponse?: (text: string) => void;
    onAudio?: (audioBuffer: Buffer) => void;
  } = {}
): Promise<{ transcript: string; response: string; audioUrl?: string }> {
  const session = activeSessions.get(sessionId);
  if (!session || session.status !== 'active') {
    throw new Error('Voice session not active');
  }

  // 1. Speech-to-Text
  const transcript = await transcribe(audioBuffer, { language: options.language });
  options.onTranscript?.(transcript);
  logger.debug('Transcribed', { sessionId, transcript: transcript.slice(0, 50) });

  // 2. Process through AI Kernel
  const aiResponse = await processMessage({
    tenantId: session.tenantId,
    userId: session.userId,
    conversationId: session.conversationId,
    message: transcript,
    channel: 'voice',
  });

  // Store conversation ID for subsequent messages
  if (!session.conversationId) {
    session.conversationId = aiResponse.conversationId;
  }

  options.onResponse?.(aiResponse.content);

  // 3. Text-to-Speech
  let audioResponseBuffer: Buffer | undefined;
  try {
    audioResponseBuffer = await synthesize(aiResponse.content, {
      voiceId: options.voiceId,
    });
    options.onAudio?.(audioResponseBuffer);
  } catch (err) {
    logger.warn('TTS failed, returning text only', { error: (err as Error).message });
  }

  // 4. Log transcript
  await query(
    `INSERT INTO voice_transcripts (id, session_id, tenant_id, direction, content, created_at)
     VALUES ($1, $2, $3, 'inbound', $4, NOW())`,
    [generateId(), sessionId, session.tenantId, transcript]
  ).catch(() => { /* non-critical */ });

  await query(
    `INSERT INTO voice_transcripts (id, session_id, tenant_id, direction, content, created_at)
     VALUES ($1, $2, $3, 'outbound', $4, NOW())`,
    [generateId(), sessionId, session.tenantId, aiResponse.content]
  ).catch(() => { /* non-critical */ });

  return {
    transcript,
    response: aiResponse.content,
  };
}

/**
 * End a voice session.
 */
export async function endVoiceSession(sessionId: string): Promise<void> {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  session.status = 'ended';
  activeSessions.delete(sessionId);

  await query(
    "UPDATE voice_sessions SET status = 'ended', ended_at = NOW() WHERE id = $1",
    [sessionId]
  ).catch(() => { /* non-critical */ });

  logger.info('Voice session ended', { sessionId });
}

/**
 * Get active voice session.
 */
export function getVoiceSession(sessionId: string): VoiceSession | undefined {
  return activeSessions.get(sessionId);
}
