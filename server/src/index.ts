import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.js';
import sessionsRoutes from './routes/sessions.js';
import channelsRoutes from './routes/channels.js';
import connectorRoutes from './routes/connectors.js';
import telemetryRoutes from './routes/telemetry.js';
import { getAllProviders } from './providers/index.js';
import { createWebSocketServer, getWSConnectionCount } from './gateway/websocketServer.js';
import { requireAuth } from './middleware/auth.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { logger } from './lib/logger.js';

// Try to import database module for health check
let getDatabase: (() => unknown) | null = null;
try {
  const dbModule = await import('./db/database.js');
  getDatabase = dbModule.getDatabase;
} catch {
  // DB module not available, skip
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
app.get('/api/health', (_req, res) => {
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
  };

  // Include database status if available
  if (getDatabase) {
    try {
      getDatabase();
      health.database = { status: 'connected' };
    } catch {
      health.database = { status: 'error' };
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

// Routes
app.use('/api', chatRoutes);
app.use('/api', sessionsRoutes);
app.use('/api', channelsRoutes);
app.use('/api', connectorRoutes);
app.use('/api', telemetryRoutes);

// Start server
const server = app.listen(PORT, () => {
  const providers = getAllProviders();
  const available: string[] = [];
  for (const [key, provider] of providers) {
    if (provider.isAvailable()) available.push(key);
  }

  logger.info('Server started', { port: PORT, url: `http://localhost:${PORT}` });
  logger.info('Providers initialized', { available });
});

// Attach WebSocket server to the HTTP server
createWebSocketServer(server);
