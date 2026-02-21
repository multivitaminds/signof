// Tenant management endpoints

import { Router } from 'express';
import { query } from '../db/postgres.js';
import { generateId } from '../lib/jwt.js';
import { logAudit } from '../lib/audit.js';
import { logger } from '../lib/logger.js';

interface TenantRequest {
  tenantId?: string;
  userId?: string;
}

const router = Router();

// POST /api/tenants — create a new tenant
router.post('/tenants', async (req, res) => {
  try {
    const { name, slug } = req.body as { name?: string; slug?: string };
    const tenantReq = req as unknown as TenantRequest;

    if (!name || !slug) {
      res.status(400).json({ error: 'Name and slug are required' });
      return;
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      res.status(400).json({ error: 'Slug must be lowercase alphanumeric with hyphens' });
      return;
    }

    // Check uniqueness
    const existing = await query('SELECT id FROM tenants WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'A workspace with this slug already exists' });
      return;
    }

    const id = generateId();
    const now = new Date().toISOString();

    await query(
      `INSERT INTO tenants (id, name, slug, plan, created_at, updated_at)
       VALUES ($1, $2, $3, 'free', $4, $4)`,
      [id, name.trim(), slug, now]
    );

    // Create default roles for the new tenant
    await query(
      `INSERT INTO roles (id, tenant_id, name, description, permissions, is_system) VALUES
        ($1, $5, 'owner', 'Full workspace control', '["*"]', TRUE),
        ($2, $5, 'admin', 'Workspace administration', '["admin.*","ai.*","connectors.*","users.read","users.invite"]', TRUE),
        ($3, $5, 'member', 'Standard team member', '["ai.chat","ai.agents","connectors.use","users.read"]', TRUE),
        ($4, $5, 'viewer', 'Read-only access', '["ai.chat","users.read"]', TRUE)`,
      [
        `${id}_owner`, `${id}_admin`, `${id}_member`, `${id}_viewer`,
        id,
      ]
    );

    // If there's a current user, make them the owner
    if (tenantReq.userId) {
      await query(
        `INSERT INTO team_members (id, tenant_id, user_id, role_id, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [generateId(), id, tenantReq.userId, `${id}_owner`]
      );
    }

    await logAudit({
      tenantId: id,
      actorId: tenantReq.userId,
      action: 'tenant.create',
      resourceType: 'tenant',
      resourceId: id,
      details: { name, slug },
    });

    logger.info('Tenant created', { tenantId: id, slug });

    res.status(201).json({
      id,
      name: name.trim(),
      slug,
      plan: 'free',
      createdAt: now,
    });
  } catch (err) {
    logger.error('Create tenant error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tenants — list tenants for current user
router.get('/tenants', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;

    if (!tenantReq.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const result = await query(
      `SELECT t.id, t.name, t.slug, t.plan, t.created_at, tm.role_id
       FROM tenants t
       JOIN team_members tm ON tm.tenant_id = t.id
       WHERE tm.user_id = $1 AND tm.status = 'active'
       ORDER BY t.created_at`,
      [tenantReq.userId]
    );

    res.json(result.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan,
      roleId: row.role_id,
      createdAt: row.created_at,
    })));
  } catch (err) {
    logger.error('List tenants error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tenants/:id — get tenant details
router.get('/tenants/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, slug, plan, settings, created_at, updated_at FROM tenants WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const row = result.rows[0] as Record<string, unknown>;
    res.json({
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan,
      settings: row.settings,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    logger.error('Get tenant error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/tenants/:id — update tenant
router.patch('/tenants/:id', async (req, res) => {
  try {
    const { name, settings } = req.body as { name?: string; settings?: Record<string, unknown> };
    const tenantReq = req as unknown as TenantRequest;

    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name.trim());
    }
    if (settings) {
      updates.push(`settings = $${paramIndex++}`);
      params.push(JSON.stringify(settings));
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No updates provided' });
      return;
    }

    updates.push(`updated_at = NOW()`);
    params.push(req.params.id);

    await query(
      `UPDATE tenants SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      params
    );

    await logAudit({
      tenantId: req.params.id,
      actorId: tenantReq.userId,
      action: 'tenant.update',
      resourceType: 'tenant',
      resourceId: req.params.id,
      details: { name, settings },
    });

    res.json({ ok: true });
  } catch (err) {
    logger.error('Update tenant error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
