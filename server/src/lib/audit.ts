// Audit logging helper — append-only immutable record

import { query } from '../db/postgres.js';
import { generateId } from './jwt.js';
import { logger } from './logger.js';

export interface AuditEntry {
  tenantId: string;
  actorId?: string;
  actorType?: 'user' | 'system' | 'agent';
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event. Fire-and-forget — does not throw on failure.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const id = generateId();
    await query(
      `INSERT INTO audit_log (id, tenant_id, actor_id, actor_type, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        entry.tenantId,
        entry.actorId ?? null,
        entry.actorType ?? 'user',
        entry.action,
        entry.resourceType,
        entry.resourceId ?? null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ipAddress ?? null,
        entry.userAgent ?? null,
      ]
    );
  } catch (err) {
    // Audit logging should never break the main flow
    logger.error('Failed to write audit log', {
      action: entry.action,
      error: (err as Error).message,
    });
  }
}

/**
 * Query audit logs for a tenant.
 */
export async function queryAuditLogs(
  tenantId: string,
  options: {
    actorId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  logs: Array<{
    id: string;
    actorId: string | null;
    actorType: string;
    action: string;
    resourceType: string;
    resourceId: string | null;
    details: Record<string, unknown> | null;
    ipAddress: string | null;
    createdAt: string;
  }>;
  total: number;
}> {
  const conditions: string[] = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let paramIndex = 2;

  if (options.actorId) {
    conditions.push(`actor_id = $${paramIndex++}`);
    params.push(options.actorId);
  }
  if (options.action) {
    conditions.push(`action = $${paramIndex++}`);
    params.push(options.action);
  }
  if (options.resourceType) {
    conditions.push(`resource_type = $${paramIndex++}`);
    params.push(options.resourceType);
  }
  if (options.resourceId) {
    conditions.push(`resource_id = $${paramIndex++}`);
    params.push(options.resourceId);
  }

  const where = conditions.join(' AND ');
  const limit = Math.min(options.limit ?? 50, 500);
  const offset = options.offset ?? 0;

  const [dataResult, countResult] = await Promise.all([
    query(
      `SELECT id, actor_id, actor_type, action, resource_type, resource_id, details, ip_address, created_at
       FROM audit_log WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM audit_log WHERE ${where}`,
      params
    ),
  ]);

  return {
    logs: dataResult.rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      actorId: row.actor_id as string | null,
      actorType: row.actor_type as string,
      action: row.action as string,
      resourceType: row.resource_type as string,
      resourceId: row.resource_id as string | null,
      details: row.details as Record<string, unknown> | null,
      ipAddress: row.ip_address as string | null,
      createdAt: (row.created_at as Date).toISOString(),
    })),
    total: parseInt(countResult.rows[0].count, 10),
  };
}
