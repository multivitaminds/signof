// Long-term memory — pgvector semantic memory (embed + store + retrieve)

import { query } from '../../db/postgres.js';
import { generateId } from '../../lib/jwt.js';
import { logger } from '../../lib/logger.js';

export interface LongTermMemory {
  id: string;
  content: string;
  category: string;
  scope: string;
  metadata: Record<string, unknown>;
  accessCount: number;
  pinned: boolean;
  createdAt: string;
}

/**
 * Store a long-term memory entry.
 * Optionally includes an embedding vector for semantic search.
 */
export async function storeLongTermMemory(
  tenantId: string,
  content: string,
  options: {
    userId?: string;
    category?: string;
    scope?: string;
    metadata?: Record<string, unknown>;
    embedding?: number[];
    pinned?: boolean;
  } = {}
): Promise<string> {
  const id = generateId();
  const embeddingStr = options.embedding
    ? `[${options.embedding.join(',')}]`
    : null;

  await query(
    `INSERT INTO memory_long_term (id, tenant_id, user_id, content, embedding, category, scope, metadata, pinned)
     VALUES ($1, $2, $3, $4, $5::vector, $6, $7, $8, $9)`,
    [
      id,
      tenantId,
      options.userId ?? null,
      content,
      embeddingStr,
      options.category ?? 'general',
      options.scope ?? 'workspace',
      JSON.stringify(options.metadata ?? {}),
      options.pinned ?? false,
    ]
  );

  logger.debug('Long-term memory stored', { id, category: options.category });
  return id;
}

/**
 * Search long-term memory by text similarity (ILIKE fallback when no embeddings).
 */
export async function searchLongTermMemory(
  tenantId: string,
  searchQuery: string,
  options: {
    category?: string;
    scope?: string;
    limit?: number;
  } = {}
): Promise<LongTermMemory[]> {
  const conditions: string[] = ['tenant_id = $1', 'content ILIKE $2'];
  const params: unknown[] = [tenantId, `%${searchQuery}%`];
  let paramIdx = 3;

  if (options.category) {
    conditions.push(`category = $${paramIdx++}`);
    params.push(options.category);
  }
  if (options.scope) {
    conditions.push(`scope = $${paramIdx++}`);
    params.push(options.scope);
  }

  const limit = Math.min(options.limit ?? 10, 50);

  const result = await query(
    `SELECT id, content, category, scope, metadata, access_count, pinned, created_at
     FROM memory_long_term
     WHERE ${conditions.join(' AND ')}
     ORDER BY pinned DESC, access_count DESC, created_at DESC
     LIMIT $${paramIdx}`,
    [...params, limit]
  );

  // Update access counts
  const ids = result.rows.map((r: Record<string, unknown>) => r.id as string);
  if (ids.length > 0) {
    await query(
      `UPDATE memory_long_term
       SET access_count = access_count + 1, last_accessed_at = NOW()
       WHERE id = ANY($1)`,
      [ids]
    ).catch(() => { /* non-critical */ });
  }

  return result.rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    content: row.content as string,
    category: row.category as string,
    scope: row.scope as string,
    metadata: row.metadata as Record<string, unknown>,
    accessCount: row.access_count as number,
    pinned: row.pinned as boolean,
    createdAt: (row.created_at as Date).toISOString(),
  }));
}

/**
 * Semantic search using vector similarity (requires embeddings).
 */
export async function semanticSearch(
  tenantId: string,
  embedding: number[],
  options: {
    category?: string;
    limit?: number;
    threshold?: number;
  } = {}
): Promise<Array<LongTermMemory & { similarity: number }>> {
  const embeddingStr = `[${embedding.join(',')}]`;
  const conditions: string[] = ['tenant_id = $1', 'embedding IS NOT NULL'];
  const params: unknown[] = [tenantId];
  let paramIdx = 2;

  if (options.category) {
    conditions.push(`category = $${paramIdx++}`);
    params.push(options.category);
  }

  const limit = Math.min(options.limit ?? 10, 50);
  const threshold = options.threshold ?? 0.7;

  const result = await query(
    `SELECT id, content, category, scope, metadata, access_count, pinned, created_at,
            1 - (embedding <=> $${paramIdx}::vector) as similarity
     FROM memory_long_term
     WHERE ${conditions.join(' AND ')}
       AND 1 - (embedding <=> $${paramIdx}::vector) > $${paramIdx + 1}
     ORDER BY similarity DESC
     LIMIT $${paramIdx + 2}`,
    [...params, embeddingStr, threshold, limit]
  );

  return result.rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    content: row.content as string,
    category: row.category as string,
    scope: row.scope as string,
    metadata: row.metadata as Record<string, unknown>,
    accessCount: row.access_count as number,
    pinned: row.pinned as boolean,
    createdAt: (row.created_at as Date).toISOString(),
    similarity: row.similarity as number,
  }));
}

/**
 * Delete a memory entry.
 */
export async function deleteLongTermMemory(tenantId: string, memoryId: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM memory_long_term WHERE id = $1 AND tenant_id = $2',
    [memoryId, tenantId]
  );
  return (result.rowCount ?? 0) > 0;
}
