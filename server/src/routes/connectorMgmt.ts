// Connector management API (CRUD, enable/disable)

import { Router } from 'express';
import { query } from '../db/postgres.js';
import { generateId } from '../lib/jwt.js';
import { logAudit } from '../lib/audit.js';
import { startConnector, stopConnector, getConnectorStatuses } from '../connectors/manager.js';
import type { ConnectorConfig } from '../connectors/types.js';
import { logger } from '../lib/logger.js';

interface TenantRequest {
  tenantId?: string;
  userId?: string;
}

const router = Router();

// GET /api/connectors — list connectors
router.get('/connectors/list', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    const result = await query(
      `SELECT id, platform, name, enabled, settings, status, last_error, created_at, updated_at
       FROM connectors WHERE tenant_id = $1 ORDER BY created_at`,
      [tenantReq.tenantId]
    );

    // Merge live statuses
    const liveStatuses = new Map(getConnectorStatuses().map(s => [s.id, s.status]));

    res.json(result.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      platform: row.platform,
      name: row.name,
      enabled: row.enabled,
      settings: row.settings,
      status: liveStatuses.get(row.id as string) ?? row.status,
      lastError: row.last_error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })));
  } catch (err) {
    logger.error('List connectors error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/connectors — create a connector
router.post('/connectors/create', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    const { platform, name, credentials, settings } = req.body as {
      platform?: string;
      name?: string;
      credentials?: Record<string, string>;
      settings?: Record<string, unknown>;
    };

    if (!platform || !name) {
      res.status(400).json({ error: 'Platform and name are required' });
      return;
    }

    const validPlatforms = ['telegram', 'discord', 'slack', 'whatsapp', 'webhook'];
    if (!validPlatforms.includes(platform)) {
      res.status(400).json({ error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` });
      return;
    }

    const id = generateId();
    await query(
      `INSERT INTO connectors (id, tenant_id, platform, name, credentials, settings)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, tenantReq.tenantId, platform, name.trim(), JSON.stringify(credentials ?? {}), JSON.stringify(settings ?? {})]
    );

    await logAudit({
      tenantId: tenantReq.tenantId!,
      actorId: tenantReq.userId,
      action: 'connector.create',
      resourceType: 'connector',
      resourceId: id,
      details: { platform, name },
    });

    res.status(201).json({ id, platform, name: name.trim(), enabled: false, status: 'disconnected' });
  } catch (err) {
    logger.error('Create connector error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/connectors/:id/enable — enable and start a connector
router.post('/connectors/:id/enable', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;

    const result = await query<ConnectorConfig>(
      'SELECT * FROM connectors WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantReq.tenantId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Connector not found' });
      return;
    }

    const config = result.rows[0];
    await query(
      "UPDATE connectors SET enabled = TRUE, updated_at = NOW() WHERE id = $1",
      [req.params.id]
    );

    // Start the connector
    await startConnector({ ...config, enabled: true });

    await logAudit({
      tenantId: tenantReq.tenantId!,
      actorId: tenantReq.userId,
      action: 'connector.enable',
      resourceType: 'connector',
      resourceId: req.params.id,
    });

    res.json({ ok: true, status: 'connected' });
  } catch (err) {
    logger.error('Enable connector error', { error: (err as Error).message });
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/connectors/:id/disable — disable and stop a connector
router.post('/connectors/:id/disable', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;

    await query(
      "UPDATE connectors SET enabled = FALSE, status = 'disconnected', updated_at = NOW() WHERE id = $1 AND tenant_id = $2",
      [req.params.id, tenantReq.tenantId]
    );

    await stopConnector(req.params.id);

    res.json({ ok: true, status: 'disconnected' });
  } catch (err) {
    logger.error('Disable connector error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/connectors/:id — delete a connector
router.delete('/connectors/:id/remove', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;

    await stopConnector(req.params.id);
    await query(
      'DELETE FROM connectors WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantReq.tenantId]
    );

    await logAudit({
      tenantId: tenantReq.tenantId!,
      actorId: tenantReq.userId,
      action: 'connector.delete',
      resourceType: 'connector',
      resourceId: req.params.id,
    });

    res.json({ ok: true });
  } catch (err) {
    logger.error('Delete connector error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
