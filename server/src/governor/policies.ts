// Policy definitions — what needs approval, spend thresholds, restrictions

import { query } from '../db/postgres.js';
import { getJsonCache, setJsonCache } from '../db/redis.js';

export interface Policy {
  id: string;
  name: string;
  description?: string;
  action: string;
  effect: 'allow' | 'deny';
  requiresApproval?: boolean;
  approvalAgentTypes?: string[];
  conditions: Record<string, unknown>;
  priority: number;
  enabled: boolean;
}

const POLICY_CACHE_TTL = 300; // 5 minutes

/**
 * Load all active policies for a tenant.
 */
export async function loadPolicies(tenantId: string): Promise<Policy[]> {
  // Check cache
  const cacheKey = `policies:${tenantId}`;
  const cached = await getJsonCache<Policy[]>(cacheKey);
  if (cached) return cached;

  try {
    const result = await query(
      `SELECT id, name, description, action, effect, requires_approval, approval_agent_types,
              conditions, priority, enabled
       FROM governor_policies
       WHERE tenant_id = $1 AND enabled = TRUE
       ORDER BY priority DESC`,
      [tenantId]
    );

    const policies: Policy[] = result.rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string | undefined,
      action: row.action as string,
      effect: row.effect as 'allow' | 'deny',
      requiresApproval: row.requires_approval as boolean | undefined,
      approvalAgentTypes: row.approval_agent_types as string[] | undefined,
      conditions: (row.conditions ?? {}) as Record<string, unknown>,
      priority: row.priority as number,
      enabled: row.enabled as boolean,
    }));

    await setJsonCache(cacheKey, policies, POLICY_CACHE_TTL);
    return policies;
  } catch {
    // Return default policies if table doesn't exist yet
    return getDefaultPolicies();
  }
}

/**
 * Default policies when no custom policies are configured.
 */
function getDefaultPolicies(): Policy[] {
  return [
    {
      id: 'default_high_cost',
      name: 'High-cost action approval',
      description: 'Require approval for actions estimated over $1',
      action: '*',
      effect: 'allow',
      requiresApproval: true,
      conditions: { minCost: 1.0 },
      priority: 100,
      enabled: true,
    },
    {
      id: 'default_data_export',
      name: 'Data export approval',
      description: 'Require approval for data exports',
      action: 'data.export',
      effect: 'allow',
      requiresApproval: true,
      conditions: {},
      priority: 200,
      enabled: true,
    },
    {
      id: 'default_data_delete',
      name: 'Data deletion approval',
      description: 'Require approval for bulk data deletion',
      action: 'data.delete',
      effect: 'allow',
      requiresApproval: true,
      conditions: {},
      priority: 200,
      enabled: true,
    },
  ];
}

/**
 * Create a custom policy.
 */
export async function createPolicy(
  tenantId: string,
  policy: Omit<Policy, 'id'>
): Promise<string> {
  const { generateId } = await import('../lib/jwt.js');
  const id = generateId();

  await query(
    `INSERT INTO governor_policies (id, tenant_id, name, description, action, effect, requires_approval, approval_agent_types, conditions, priority, enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      id,
      tenantId,
      policy.name,
      policy.description ?? null,
      policy.action,
      policy.effect,
      policy.requiresApproval ?? false,
      JSON.stringify(policy.approvalAgentTypes ?? []),
      JSON.stringify(policy.conditions),
      policy.priority,
      policy.enabled,
    ]
  );

  // Clear cache
  const { deleteCache } = await import('../db/redis.js');
  await deleteCache(`policies:${tenantId}`);

  return id;
}
