// Profile memory — structured user/org profiles in PostgreSQL

import { query } from '../../db/postgres.js';
import { generateId } from '../../lib/jwt.js';

export interface ProfileData {
  id: string;
  entityType: string;
  entityId: string;
  profileData: Record<string, unknown>;
  preferences: Record<string, unknown>;
  updatedAt: string;
}

/**
 * Get or create a profile for an entity (user, org, team, etc.)
 */
export async function getProfile(
  tenantId: string,
  entityType: string,
  entityId: string
): Promise<ProfileData> {
  const result = await query(
    `SELECT id, entity_type, entity_id, profile_data, preferences, updated_at
     FROM memory_profiles
     WHERE tenant_id = $1 AND entity_type = $2 AND entity_id = $3`,
    [tenantId, entityType, entityId]
  );

  if (result.rows.length > 0) {
    const row = result.rows[0] as Record<string, unknown>;
    return {
      id: row.id as string,
      entityType: row.entity_type as string,
      entityId: row.entity_id as string,
      profileData: row.profile_data as Record<string, unknown>,
      preferences: row.preferences as Record<string, unknown>,
      updatedAt: (row.updated_at as Date).toISOString(),
    };
  }

  // Create empty profile
  const id = generateId();
  await query(
    `INSERT INTO memory_profiles (id, tenant_id, entity_type, entity_id, profile_data, preferences)
     VALUES ($1, $2, $3, $4, '{}', '{}')`,
    [id, tenantId, entityType, entityId]
  );

  return {
    id,
    entityType,
    entityId,
    profileData: {},
    preferences: {},
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update profile data (merge with existing).
 */
export async function updateProfile(
  tenantId: string,
  entityType: string,
  entityId: string,
  data: { profileData?: Record<string, unknown>; preferences?: Record<string, unknown> }
): Promise<void> {
  // Ensure profile exists
  await getProfile(tenantId, entityType, entityId);

  const updates: string[] = ['updated_at = NOW()'];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (data.profileData) {
    updates.push(`profile_data = profile_data || $${paramIdx++}::jsonb`);
    params.push(JSON.stringify(data.profileData));
  }
  if (data.preferences) {
    updates.push(`preferences = preferences || $${paramIdx++}::jsonb`);
    params.push(JSON.stringify(data.preferences));
  }

  params.push(tenantId, entityType, entityId);

  await query(
    `UPDATE memory_profiles SET ${updates.join(', ')}
     WHERE tenant_id = $${paramIdx++} AND entity_type = $${paramIdx++} AND entity_id = $${paramIdx}`,
    params
  );
}

/**
 * Get all profiles for a tenant (optional type filter).
 */
export async function listProfiles(
  tenantId: string,
  entityType?: string
): Promise<ProfileData[]> {
  const conditions: string[] = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];

  if (entityType) {
    conditions.push('entity_type = $2');
    params.push(entityType);
  }

  const result = await query(
    `SELECT id, entity_type, entity_id, profile_data, preferences, updated_at
     FROM memory_profiles
     WHERE ${conditions.join(' AND ')}
     ORDER BY updated_at DESC`,
    params
  );

  return result.rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    entityType: row.entity_type as string,
    entityId: row.entity_id as string,
    profileData: row.profile_data as Record<string, unknown>,
    preferences: row.preferences as Record<string, unknown>,
    updatedAt: (row.updated_at as Date).toISOString(),
  }));
}
