// Episodic memory — timeline-based event memory

import { query } from '../../db/postgres.js';
import { generateId } from '../../lib/jwt.js';

export interface Episode {
  id: string;
  actorId: string | null;
  actorType: string;
  eventType: string;
  summary: string;
  details: Record<string, unknown> | null;
  relatedEntities: string[];
  importance: number;
  occurredAt: string;
}

/**
 * Record an episodic memory event.
 */
export async function recordEpisode(
  tenantId: string,
  actorId: string | null,
  eventType: string,
  summary: string,
  details?: Record<string, unknown>,
  options: {
    actorType?: string;
    relatedEntities?: string[];
    importance?: number;
    occurredAt?: string;
  } = {}
): Promise<string> {
  const id = generateId();

  await query(
    `INSERT INTO memory_episodes (id, tenant_id, actor_id, actor_type, event_type, summary, details, related_entities, importance, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      id,
      tenantId,
      actorId,
      options.actorType ?? 'user',
      eventType,
      summary,
      details ? JSON.stringify(details) : null,
      JSON.stringify(options.relatedEntities ?? []),
      options.importance ?? 0.5,
      options.occurredAt ?? new Date().toISOString(),
    ]
  );

  return id;
}

/**
 * Query episodes in a time range.
 */
export async function queryEpisodes(
  tenantId: string,
  options: {
    actorId?: string;
    eventType?: string;
    since?: string;
    until?: string;
    minImportance?: number;
    limit?: number;
  } = {}
): Promise<Episode[]> {
  const conditions: string[] = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let paramIdx = 2;

  if (options.actorId) {
    conditions.push(`actor_id = $${paramIdx++}`);
    params.push(options.actorId);
  }
  if (options.eventType) {
    conditions.push(`event_type = $${paramIdx++}`);
    params.push(options.eventType);
  }
  if (options.since) {
    conditions.push(`occurred_at >= $${paramIdx++}`);
    params.push(options.since);
  }
  if (options.until) {
    conditions.push(`occurred_at <= $${paramIdx++}`);
    params.push(options.until);
  }
  if (options.minImportance !== undefined) {
    conditions.push(`importance >= $${paramIdx++}`);
    params.push(options.minImportance);
  }

  const limit = Math.min(options.limit ?? 20, 100);

  const result = await query(
    `SELECT id, actor_id, actor_type, event_type, summary, details, related_entities, importance, occurred_at
     FROM memory_episodes
     WHERE ${conditions.join(' AND ')}
     ORDER BY occurred_at DESC
     LIMIT $${paramIdx}`,
    [...params, limit]
  );

  return result.rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    actorId: row.actor_id as string | null,
    actorType: row.actor_type as string,
    eventType: row.event_type as string,
    summary: row.summary as string,
    details: row.details as Record<string, unknown> | null,
    relatedEntities: (row.related_entities ?? []) as string[],
    importance: row.importance as number,
    occurredAt: (row.occurred_at as Date).toISOString(),
  }));
}

/**
 * Get a timeline summary for a user.
 */
export async function getTimeline(
  tenantId: string,
  userId: string,
  days = 7
): Promise<Episode[]> {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
  return queryEpisodes(tenantId, {
    actorId: userId,
    since,
    minImportance: 0.3,
    limit: 50,
  });
}
