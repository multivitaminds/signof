// Redis client for caching, sessions, and short-term memory

import Redis from 'ioredis';
import { logger } from '../lib/logger.js';

let client: Redis | null = null;

interface RedisConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  db: number;
  keyPrefix: string;
  tls?: object;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
}

function getConfig(): RedisConfig {
  const useTls = process.env.REDIS_TLS === 'true';

  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB ?? '0', 10),
    keyPrefix: process.env.REDIS_PREFIX ?? 'oa:',
    ...(useTls ? { tls: {} } : {}),
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  };
}

export function getRedis(): Redis {
  if (client) return client;

  // REDIS_URL takes precedence (full connection string for cloud providers)
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const prefix = process.env.REDIS_PREFIX ?? 'orc:';
    client = new Redis(redisUrl, {
      keyPrefix: prefix,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  } else {
    const config = getConfig();
    client = new Redis(config);
  }

  client.on('connect', () => {
    logger.debug('Redis connected');
  });

  client.on('ready', () => {
    logger.info('Redis ready');
  });

  client.on('error', (err) => {
    logger.error('Redis error', { error: err.message });
  });

  client.on('close', () => {
    logger.debug('Redis connection closed');
  });

  return client;
}

/** Connect to Redis (call on startup) */
export async function connectRedis(): Promise<void> {
  const redis = getRedis();
  await redis.connect();
}

/** Check if Redis is reachable */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const redis = getRedis();
    const result = await redis.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

/** Gracefully close Redis */
export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
    logger.info('Redis connection closed');
  }
}

// ─── Convenience helpers ────────────────────────────────────────────

/** Set a key with optional TTL (seconds) */
export async function setCache(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const redis = getRedis();
  if (ttlSeconds) {
    await redis.setex(key, ttlSeconds, value);
  } else {
    await redis.set(key, value);
  }
}

/** Get a cached value */
export async function getCache(key: string): Promise<string | null> {
  return getRedis().get(key);
}

/** Delete a cached value */
export async function deleteCache(key: string): Promise<void> {
  await getRedis().del(key);
}

/** Set JSON value with optional TTL */
export async function setJsonCache<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  await setCache(key, JSON.stringify(value), ttlSeconds);
}

/** Get parsed JSON value */
export async function getJsonCache<T>(key: string): Promise<T | null> {
  const raw = await getCache(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}
