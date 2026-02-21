// Short-term memory — Redis-backed conversation buffer with TTL

import { getRedis } from '../../db/redis.js';
import { logger } from '../../lib/logger.js';

const DEFAULT_TTL = 3600; // 1 hour

export interface ShortTermEntry {
  key: string;
  value: unknown;
  expiresAt: string;
}

/**
 * Store a short-term memory entry in Redis.
 */
export async function setShortTerm(
  tenantId: string,
  sessionId: string,
  key: string,
  value: unknown,
  ttlSeconds = DEFAULT_TTL
): Promise<void> {
  const redis = getRedis();
  const redisKey = `stm:${tenantId}:${sessionId}:${key}`;

  await redis.setex(redisKey, ttlSeconds, JSON.stringify(value));
}

/**
 * Retrieve a short-term memory entry.
 */
export async function getShortTerm<T = unknown>(
  tenantId: string,
  sessionId: string,
  key: string
): Promise<T | null> {
  const redis = getRedis();
  const redisKey = `stm:${tenantId}:${sessionId}:${key}`;

  const raw = await redis.get(redisKey);
  if (!raw) return null;

  return JSON.parse(raw) as T;
}

/**
 * Get all short-term memory entries for a session.
 */
export async function getSessionMemory(
  tenantId: string,
  sessionId: string
): Promise<ShortTermEntry[]> {
  const redis = getRedis();
  const pattern = `stm:${tenantId}:${sessionId}:*`;

  const keys = await redis.keys(pattern);
  if (keys.length === 0) return [];

  const entries: ShortTermEntry[] = [];
  for (const key of keys) {
    const value = await redis.get(key);
    const ttl = await redis.ttl(key);
    if (value) {
      const shortKey = key.split(':').slice(3).join(':');
      entries.push({
        key: shortKey,
        value: JSON.parse(value),
        expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
      });
    }
  }

  return entries;
}

/**
 * Store conversation context for a session (rolling buffer).
 */
export async function updateConversationBuffer(
  tenantId: string,
  sessionId: string,
  role: string,
  content: string,
  maxMessages = 20
): Promise<void> {
  const redis = getRedis();
  const bufferKey = `stm:${tenantId}:${sessionId}:_buffer`;

  const entry = JSON.stringify({ role, content, timestamp: Date.now() });
  await redis.rpush(bufferKey, entry);

  // Trim to max messages
  const length = await redis.llen(bufferKey);
  if (length > maxMessages) {
    await redis.ltrim(bufferKey, length - maxMessages, -1);
  }

  // Set TTL on the buffer
  await redis.expire(bufferKey, DEFAULT_TTL);
}

/**
 * Get conversation buffer for a session.
 */
export async function getConversationBuffer(
  tenantId: string,
  sessionId: string
): Promise<Array<{ role: string; content: string; timestamp: number }>> {
  const redis = getRedis();
  const bufferKey = `stm:${tenantId}:${sessionId}:_buffer`;

  const entries = await redis.lrange(bufferKey, 0, -1);
  return entries.map(e => JSON.parse(e) as { role: string; content: string; timestamp: number });
}

/**
 * Clear all short-term memory for a session.
 */
export async function clearSessionMemory(
  tenantId: string,
  sessionId: string
): Promise<void> {
  const redis = getRedis();
  const pattern = `stm:${tenantId}:${sessionId}:*`;

  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }

  logger.debug('Session memory cleared', { tenantId, sessionId, keysRemoved: keys.length });
}
