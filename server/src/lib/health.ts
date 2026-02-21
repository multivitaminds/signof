// Health check endpoint — DB, Redis, connectors

import { checkPgHealth } from '../db/postgres.js';
import { checkRedisHealth } from '../db/redis.js';
import { getConnectorStatuses } from '../connectors/manager.js';
import { isSTTAvailable } from '../voice/stt.js';
import { isTTSAvailable } from '../voice/tts.js';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: { status: string; type: string };
    redis: { status: string };
    connectors: Array<{ id: string; platform: string; status: string }>;
    voice: { stt: boolean; tts: boolean };
  };
  uptime: number;
  timestamp: string;
}

/**
 * Run all health checks.
 */
export async function runHealthChecks(): Promise<HealthStatus> {
  const checks = {
    database: { status: 'unknown', type: 'postgresql' },
    redis: { status: 'unknown' },
    connectors: getConnectorStatuses().map(c => ({
      id: c.id,
      platform: c.platform,
      status: c.status,
    })),
    voice: { stt: isSTTAvailable(), tts: isTTSAvailable() },
  };

  // Check PostgreSQL
  try {
    const pgOk = await checkPgHealth();
    checks.database.status = pgOk ? 'connected' : 'error';
  } catch {
    checks.database.status = 'error';
  }

  // Check Redis
  try {
    const redisOk = await checkRedisHealth();
    checks.redis.status = redisOk ? 'connected' : 'error';
  } catch {
    checks.redis.status = 'error';
  }

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (checks.database.status === 'error') status = 'unhealthy';
  else if (checks.redis.status === 'error') status = 'degraded';

  return {
    status,
    checks,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}
