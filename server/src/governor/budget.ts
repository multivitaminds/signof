// Budget enforcement — per-tenant/user spend limits with real-time tracking

import { query } from '../db/postgres.js';
import { getJsonCache, setJsonCache } from '../db/redis.js';
import { logger } from '../lib/logger.js';

interface BudgetCheck {
  allowed: boolean;
  reason: string;
  currentSpend: number;
  limit: number;
  remaining: number;
}

const BUDGET_CACHE_TTL = 60; // 1 minute cache

/**
 * Check if an action is within budget.
 */
export async function checkBudget(
  tenantId: string,
  _userId: string,
  estimatedCost: number
): Promise<BudgetCheck> {
  // Get tenant budget limit
  const limit = await getTenantBudgetLimit(tenantId);
  if (limit <= 0) {
    // No budget limit set — allow
    return { allowed: true, reason: 'No budget limit', currentSpend: 0, limit: 0, remaining: Infinity };
  }

  // Get current spend
  const currentSpend = await getCurrentMonthSpend(tenantId);
  const remaining = limit - currentSpend;

  if (estimatedCost > remaining) {
    return {
      allowed: false,
      reason: `Budget limit reached. Spent: $${currentSpend.toFixed(4)} / $${limit.toFixed(2)}. Estimated cost: $${estimatedCost.toFixed(4)}`,
      currentSpend,
      limit,
      remaining: Math.max(0, remaining),
    };
  }

  return {
    allowed: true,
    reason: 'Within budget',
    currentSpend,
    limit,
    remaining: remaining - estimatedCost,
  };
}

/**
 * Get tenant's monthly budget limit.
 */
async function getTenantBudgetLimit(tenantId: string): Promise<number> {
  // Check cache
  const cacheKey = `budget_limit:${tenantId}`;
  const cached = await getJsonCache<number>(cacheKey);
  if (cached !== null) return cached;

  // Get from tenant settings
  try {
    const result = await query<{ settings: Record<string, unknown> }>(
      'SELECT settings FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (result.rows.length === 0) return 0;

    const settings = result.rows[0].settings;
    const limit = (settings.monthlyBudgetUsd as number) ?? 0;

    await setJsonCache(cacheKey, limit, BUDGET_CACHE_TTL);
    return limit;
  } catch {
    return 0;
  }
}

/**
 * Get current month's total spend for a tenant.
 */
async function getCurrentMonthSpend(tenantId: string): Promise<number> {
  const cacheKey = `month_spend:${tenantId}`;
  const cached = await getJsonCache<number>(cacheKey);
  if (cached !== null) return cached;

  try {
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);

    const result = await query<{ total: string }>(
      'SELECT COALESCE(SUM(cost_usd), 0) as total FROM cost_tracking WHERE tenant_id = $1 AND date >= $2',
      [tenantId, firstOfMonth.toISOString().split('T')[0]]
    );

    const total = parseFloat(result.rows[0].total);
    await setJsonCache(cacheKey, total, BUDGET_CACHE_TTL);
    return total;
  } catch {
    return 0;
  }
}

/**
 * Get budget summary for a tenant.
 */
export async function getBudgetSummary(tenantId: string): Promise<{
  monthlyLimit: number;
  currentSpend: number;
  remaining: number;
  utilizationPercent: number;
}> {
  const limit = await getTenantBudgetLimit(tenantId);
  const spend = await getCurrentMonthSpend(tenantId);

  return {
    monthlyLimit: limit,
    currentSpend: Math.round(spend * 10000) / 10000,
    remaining: Math.max(0, limit - spend),
    utilizationPercent: limit > 0 ? Math.round((spend / limit) * 100) : 0,
  };
}

/**
 * Set monthly budget limit for a tenant.
 */
export async function setBudgetLimit(tenantId: string, limitUsd: number): Promise<void> {
  await query(
    "UPDATE tenants SET settings = settings || $1::jsonb, updated_at = NOW() WHERE id = $2",
    [JSON.stringify({ monthlyBudgetUsd: limitUsd }), tenantId]
  );

  // Clear cache
  const { deleteCache } = await import('../db/redis.js');
  await deleteCache(`budget_limit:${tenantId}`);

  logger.info('Budget limit updated', { tenantId, limitUsd });
}
