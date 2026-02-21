import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.js';
import sessionsRoutes from './routes/sessions.js';
import channelsRoutes from './routes/channels.js';
import connectorRoutes from './routes/connectors.js';
import telemetryRoutes from './routes/telemetry.js';
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenants.js';
import userRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import connectorMgmtRoutes from './routes/connectorMgmt.js';
import voiceRoutes from './routes/voice.js';
import governorRoutes from './routes/governor.js';
import { getAllProviders } from './providers/index.js';
import { createWebSocketServer, getWSConnectionCount } from './gateway/websocketServer.js';
import { requireAuth } from './middleware/auth.js';
import { extractTenant } from './middleware/tenancy.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { logger } from './lib/logger.js';

// Database initialization — PostgreSQL or SQLite
const usePostgres = !!process.env.PG_HOST;
let getDatabase: (() => unknown) | null = null;

if (usePostgres) {
  try {
    const { runPgMigrations, checkPgHealth } = await import('./db/postgres.js');
    const { connectRedis, checkRedisHealth } = await import('./db/redis.js');

    // Initialize PostgreSQL
    await runPgMigrations();
    logger.info('PostgreSQL initialized with migrations');

    // Initialize Redis
    try {
      await connectRedis();
      const redisOk = await checkRedisHealth();
      logger.info('Redis initialized', { healthy: redisOk });
    } catch (redisErr) {
      logger.warn('Redis connection failed, continuing without cache', {
        error: (redisErr as Error).message,
      });
    }

    // Health check function for PostgreSQL
    getDatabase = () => {
      // Returns a truthy value if PG is available
      checkPgHealth().catch(() => { /* noop */ });
      return { status: 'postgres' };
    };
  } catch (pgErr) {
    logger.error('PostgreSQL initialization failed', { error: (pgErr as Error).message });
    process.exit(1);
  }
} else {
  // SQLite fallback
  try {
    const dbModule = await import('./db/database.js');
    getDatabase = dbModule.getDatabase;
    logger.info('SQLite initialized (dev mode)');
  } catch {
    // DB module not available, skip
  }
}

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

// Rate limiters
const chatLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });
const generalLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 200 });

// Middleware
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: '10mb' }));

// Health check (public, before auth)
app.get('/api/health', async (_req, res) => {
  const providers = getAllProviders();
  const available: string[] = [];
  const unavailable: string[] = [];

  for (const [key, provider] of providers) {
    if (provider.isAvailable()) {
      available.push(key);
    } else {
      unavailable.push(key);
    }
  }

  const mem = process.memoryUsage();
  const status = available.length > 0 ? 'ok' : 'degraded';

  const health: Record<string, unknown> = {
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100,
      rssMb: Math.round(mem.rss / 1024 / 1024 * 100) / 100,
    },
    wsConnections: getWSConnectionCount(),
    providers: { available, unavailable },
    mode: usePostgres ? 'postgresql' : 'sqlite',
  };

  // Database health check
  if (usePostgres) {
    try {
      const { checkPgHealth } = await import('./db/postgres.js');
      const pgOk = await checkPgHealth();
      health.database = { status: pgOk ? 'connected' : 'error', type: 'postgresql' };
    } catch {
      health.database = { status: 'error', type: 'postgresql' };
    }

    try {
      const { checkRedisHealth } = await import('./db/redis.js');
      const redisOk = await checkRedisHealth();
      health.redis = { status: redisOk ? 'connected' : 'error' };
    } catch {
      health.redis = { status: 'error' };
    }
  } else if (getDatabase) {
    try {
      getDatabase();
      health.database = { status: 'connected', type: 'sqlite' };
    } catch {
      health.database = { status: 'error', type: 'sqlite' };
    }
  }

  res.json(health);
});

// Readiness probe (public, before auth)
app.get('/api/ready', (_req, res) => {
  const providers = getAllProviders();
  let hasProvider = false;
  for (const [, provider] of providers) {
    if (provider.isAvailable()) { hasProvider = true; break; }
  }

  if (!hasProvider) {
    res.status(503).json({ ready: false, reason: 'No LLM providers configured' });
    return;
  }

  res.json({ ready: true });
});

// Rate limiting (before auth to reject early)
app.use('/api/chat', chatLimiter);
app.use('/api', generalLimiter);

// Auth middleware (applied to all /api routes below)
app.use('/api', requireAuth);

// Tenant extraction (after auth, before routes)
app.use('/api', extractTenant);

// Routes
app.use('/api', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', sessionsRoutes);
app.use('/api', channelsRoutes);
app.use('/api', connectorRoutes);
app.use('/api', telemetryRoutes);
app.use('/api', tenantRoutes);
app.use('/api', userRoutes);
app.use('/api', aiRoutes);
app.use('/api', connectorMgmtRoutes);
app.use('/api', voiceRoutes);
app.use('/api', governorRoutes);

// Start server
const server = app.listen(PORT, () => {
  const providers = getAllProviders();
  const available: string[] = [];
  for (const [key, provider] of providers) {
    if (provider.isAvailable()) available.push(key);
  }

  logger.info('Server started', {
    port: PORT,
    url: `http://localhost:${PORT}`,
    mode: usePostgres ? 'postgresql' : 'sqlite',
  });
  logger.info('Providers initialized', { available });
});

// Attach WebSocket server to the HTTP server
createWebSocketServer(server);

// Graceful shutdown
async function shutdown(): Promise<void> {
  logger.info('Shutting down...');

  server.close();

  if (usePostgres) {
    try {
      const { closePool } = await import('./db/postgres.js');
      await closePool();
    } catch { /* ignore */ }

    try {
      const { closeRedis } = await import('./db/redis.js');
      await closeRedis();
    } catch { /* ignore */ }
  } else {
    try {
      const { closeDatabase } = await import('./db/database.js');
      closeDatabase();
    } catch { /* ignore */ }
  }

  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
