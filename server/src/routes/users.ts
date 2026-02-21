// User management endpoints (extends auth with team/role management)

import { Router } from 'express';
import { query } from '../db/postgres.js';
import { generateId } from '../lib/jwt.js';
import { logAudit } from '../lib/audit.js';
import { logger } from '../lib/logger.js';
import { requirePermission } from '../middleware/rbac.js';

interface TenantRequest {
  tenantId?: string;
  userId?: string;
}

const router = Router();

// GET /api/users — list users in current tenant
router.get('/users', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    if (!tenantReq.tenantId) {
      res.status(400).json({ error: 'Tenant context required' });
      return;
    }

    const result = await query(
      `SELECT u.id, u.email, u.display_name, u.avatar_url, u.created_at,
              tm.role_id, r.name as role_name, tm.status, tm.joined_at
       FROM users u
       JOIN team_members tm ON tm.user_id = u.id AND tm.tenant_id = $1
       JOIN roles r ON r.id = tm.role_id
       WHERE tm.status = 'active'
       ORDER BY tm.joined_at`,
      [tenantReq.tenantId]
    );

    res.json(result.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      roleId: row.role_id,
      roleName: row.role_name,
      status: row.status,
      joinedAt: row.joined_at,
    })));
  } catch (err) {
    logger.error('List users error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/invite — invite a user to the tenant
router.post(
  '/users/invite',
  requirePermission('users.invite'),
  async (req, res) => {
    try {
      const tenantReq = req as unknown as TenantRequest;
      const { email, roleId } = req.body as { email?: string; roleId?: string };

      if (!email || !roleId) {
        res.status(400).json({ error: 'Email and roleId are required' });
        return;
      }
      if (!tenantReq.tenantId) {
        res.status(400).json({ error: 'Tenant context required' });
        return;
      }

      // Check the role exists in this tenant
      const roleResult = await query(
        'SELECT id FROM roles WHERE id = $1 AND tenant_id = $2',
        [roleId, tenantReq.tenantId]
      );
      if (roleResult.rows.length === 0) {
        res.status(400).json({ error: 'Invalid role for this workspace' });
        return;
      }

      // Find user by email
      const userResult = await query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase().trim()]
      );

      if (userResult.rows.length === 0) {
        // User doesn't exist yet — in production, send invite email
        res.status(404).json({ error: 'User not found. They must sign up first.' });
        return;
      }

      const userId = (userResult.rows[0] as Record<string, unknown>).id as string;

      // Check if already a member
      const existingMember = await query(
        'SELECT id FROM team_members WHERE tenant_id = $1 AND user_id = $2',
        [tenantReq.tenantId, userId]
      );
      if (existingMember.rows.length > 0) {
        res.status(409).json({ error: 'User is already a member of this workspace' });
        return;
      }

      const membershipId = generateId();
      await query(
        `INSERT INTO team_members (id, tenant_id, user_id, role_id, invited_by, status)
         VALUES ($1, $2, $3, $4, $5, 'active')`,
        [membershipId, tenantReq.tenantId, userId, roleId, tenantReq.userId]
      );

      // Update user's tenant_id if they don't have one
      await query(
        'UPDATE users SET tenant_id = $1 WHERE id = $2 AND tenant_id IS NULL',
        [tenantReq.tenantId, userId]
      );

      await logAudit({
        tenantId: tenantReq.tenantId,
        actorId: tenantReq.userId,
        action: 'user.invite',
        resourceType: 'user',
        resourceId: userId,
        details: { email, roleId },
      });

      logger.info('User invited', { tenantId: tenantReq.tenantId, userId, roleId });

      res.status(201).json({ ok: true, membershipId });
    } catch (err) {
      logger.error('Invite user error', { error: (err as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PATCH /api/users/:id/role — change a user's role
router.patch(
  '/users/:id/role',
  requirePermission('admin.users'),
  async (req, res) => {
    try {
      const tenantReq = req as unknown as TenantRequest;
      const { roleId } = req.body as { roleId?: string };

      if (!roleId || !tenantReq.tenantId) {
        res.status(400).json({ error: 'roleId and tenant context required' });
        return;
      }

      // Verify role exists
      const roleResult = await query(
        'SELECT id FROM roles WHERE id = $1 AND tenant_id = $2',
        [roleId, tenantReq.tenantId]
      );
      if (roleResult.rows.length === 0) {
        res.status(400).json({ error: 'Invalid role for this workspace' });
        return;
      }

      const result = await query(
        'UPDATE team_members SET role_id = $1 WHERE tenant_id = $2 AND user_id = $3',
        [roleId, tenantReq.tenantId, req.params.id]
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'User not found in this workspace' });
        return;
      }

      await logAudit({
        tenantId: tenantReq.tenantId,
        actorId: tenantReq.userId,
        action: 'user.role_change',
        resourceType: 'user',
        resourceId: req.params.id,
        details: { roleId },
      });

      res.json({ ok: true });
    } catch (err) {
      logger.error('Change role error', { error: (err as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /api/users/:id — remove user from tenant
router.delete(
  '/users/:id',
  requirePermission('admin.users'),
  async (req, res) => {
    try {
      const tenantReq = req as unknown as TenantRequest;
      if (!tenantReq.tenantId) {
        res.status(400).json({ error: 'Tenant context required' });
        return;
      }

      // Prevent self-removal
      if (req.params.id === tenantReq.userId) {
        res.status(400).json({ error: 'Cannot remove yourself from the workspace' });
        return;
      }

      const result = await query(
        "UPDATE team_members SET status = 'removed' WHERE tenant_id = $1 AND user_id = $2 AND status = 'active'",
        [tenantReq.tenantId, req.params.id]
      );

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'User not found in this workspace' });
        return;
      }

      await logAudit({
        tenantId: tenantReq.tenantId,
        actorId: tenantReq.userId,
        action: 'user.remove',
        resourceType: 'user',
        resourceId: req.params.id,
      });

      res.json({ ok: true });
    } catch (err) {
      logger.error('Remove user error', { error: (err as Error).message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/roles — list roles for current tenant
router.get('/roles', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    if (!tenantReq.tenantId) {
      res.status(400).json({ error: 'Tenant context required' });
      return;
    }

    const result = await query(
      'SELECT id, name, description, permissions, is_system FROM roles WHERE tenant_id = $1 ORDER BY name',
      [tenantReq.tenantId]
    );

    res.json(result.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      permissions: row.permissions,
      isSystem: row.is_system,
    })));
  } catch (err) {
    logger.error('List roles error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
