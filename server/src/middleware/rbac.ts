// Role-Based Access Control middleware

import type { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres.js';
import { getJsonCache, setJsonCache } from '../db/redis.js';
import { logger } from '../lib/logger.js';

interface TenantRequest extends Request {
  tenantId?: string;
  userId?: string;
  permissions?: string[];
}

interface TeamMemberRow {
  role_id: string;
  permissions: string[];
}

const PERMISSION_CACHE_TTL = 300; // 5 minutes

/**
 * Load user permissions from DB (with Redis cache).
 */
async function loadPermissions(userId: string, tenantId: string): Promise<string[]> {
  const cacheKey = `perms:${tenantId}:${userId}`;
  const cached = await getJsonCache<string[]>(cacheKey);
  if (cached) return cached;

  const result = await query<TeamMemberRow>(
    `SELECT r.permissions
     FROM team_members tm
     JOIN roles r ON r.id = tm.role_id
     WHERE tm.user_id = $1 AND tm.tenant_id = $2 AND tm.status = 'active'`,
    [userId, tenantId]
  );

  const permissions: string[] = [];
  for (const row of result.rows) {
    const perms = Array.isArray(row.permissions) ? row.permissions : [];
    permissions.push(...perms);
  }

  const unique = [...new Set(permissions)];
  await setJsonCache(cacheKey, unique, PERMISSION_CACHE_TTL);
  return unique;
}

/**
 * Check if a set of permissions satisfies a required permission.
 * Supports wildcard matching: "admin.*" matches "admin.users", etc.
 */
function hasPermission(userPerms: string[], required: string): boolean {
  if (userPerms.includes('*')) return true;
  if (userPerms.includes(required)) return true;

  // Check wildcard patterns: "admin.*" matches "admin.users"
  for (const perm of userPerms) {
    if (perm.endsWith('.*')) {
      const prefix = perm.slice(0, -1); // "admin."
      if (required.startsWith(prefix)) return true;
    }
  }

  return false;
}

/**
 * Middleware factory: require specific permission(s).
 * Usage: router.post('/endpoint', requirePermission('ai.agents'), handler)
 */
export function requirePermission(...required: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tenantReq = req as TenantRequest;
    const { userId, tenantId } = tenantReq;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const permissions = await loadPermissions(userId, tenantId);
      tenantReq.permissions = permissions;

      const missing = required.filter(r => !hasPermission(permissions, r));
      if (missing.length > 0) {
        logger.warn('Permission denied', { userId, tenantId, required, missing });
        res.status(403).json({
          error: 'Insufficient permissions',
          required: missing,
        });
        return;
      }

      next();
    } catch (err) {
      logger.error('RBAC check failed', { error: (err as Error).message });
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

/**
 * Middleware: load permissions onto request (but don't enforce).
 * Useful when you want to check permissions conditionally in the handler.
 */
export async function loadUserPermissions(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const tenantReq = req as TenantRequest;
  const { userId, tenantId } = tenantReq;

  if (userId && tenantId) {
    try {
      tenantReq.permissions = await loadPermissions(userId, tenantId);
    } catch {
      tenantReq.permissions = [];
    }
  }

  next();
}
