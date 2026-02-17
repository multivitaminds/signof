import { Router } from 'express';
import type { Request, Response } from 'express';
import { getDatabase } from '../db/database.js';
import { logger } from '../lib/logger.js';

const router = Router();

// ─── Types ─────────────────────────────────────────────────────────

interface TelemetryEvent {
  type: string;
  instanceId: string;
  registryId?: string;
  domain?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

interface TelemetryBatchBody {
  events: TelemetryEvent[];
}

// ─── POST /api/telemetry/batch — Ingest telemetry events ──────────

router.post('/telemetry/batch', (req: Request, res: Response) => {
  const body = req.body as TelemetryBatchBody;

  if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
    res.status(400).json({ error: 'Request body must contain a non-empty "events" array.' });
    return;
  }

  // Cap batch size to prevent abuse
  const MAX_BATCH = 500;
  const events = body.events.slice(0, MAX_BATCH);

  try {
    const db = getDatabase();
    const stmt = db.prepare(
      `INSERT INTO telemetry_events (type, instance_id, registry_id, domain, data, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const insertMany = db.transaction((items: TelemetryEvent[]) => {
      for (const event of items) {
        stmt.run(
          event.type,
          event.instanceId,
          event.registryId ?? null,
          event.domain ?? null,
          JSON.stringify(event.data),
          event.timestamp,
        );
      }
    });

    insertMany(events);

    res.json({ inserted: events.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Telemetry batch insert failed', { error: message });
    res.status(500).json({ error: message });
  }
});

// ─── GET /api/telemetry — Query recent telemetry ──────────────────

router.get('/telemetry', (req: Request, res: Response) => {
  const agentId = req.query.agentId as string | undefined;
  const limitStr = req.query.limit as string | undefined;
  const limit = Math.min(Math.max(parseInt(limitStr ?? '100', 10) || 100, 1), 1000);

  try {
    const db = getDatabase();

    let rows: unknown[];
    if (agentId) {
      rows = db.prepare(
        `SELECT id, type, instance_id, registry_id, domain, data, timestamp
         FROM telemetry_events
         WHERE instance_id = ?
         ORDER BY timestamp DESC
         LIMIT ?`
      ).all(agentId, limit);
    } else {
      rows = db.prepare(
        `SELECT id, type, instance_id, registry_id, domain, data, timestamp
         FROM telemetry_events
         ORDER BY timestamp DESC
         LIMIT ?`
      ).all(limit);
    }

    // Parse data JSON for each row
    const events = (rows as Array<Record<string, unknown>>).map((row) => ({
      id: row.id,
      type: row.type,
      instanceId: row.instance_id,
      registryId: row.registry_id,
      domain: row.domain,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      timestamp: row.timestamp,
    }));

    res.json({ events });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Telemetry query failed', { error: message });
    res.status(500).json({ error: message });
  }
});

export default router;
