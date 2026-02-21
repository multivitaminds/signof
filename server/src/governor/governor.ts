// Central policy engine — checks every agent action against rules

import { checkApprovalRequired, createApprovalRequest } from './approvals.js';
import { checkBudget } from './budget.js';
import { loadPolicies } from './policies.js';
import { logAudit } from '../lib/audit.js';
import { logger } from '../lib/logger.js';

export interface GovernorContext {
  tenantId: string;
  userId: string;
  agentType: string;
  action: string;
  resourceType?: string;
  estimatedCost?: number;
  metadata?: Record<string, unknown>;
}

export type GovernorDecision = {
  allowed: true;
} | {
  allowed: false;
  reason: string;
  requiresApproval?: boolean;
  approvalRequestId?: string;
};

/**
 * Check an action against all governance policies.
 * Returns whether the action is allowed, denied, or requires approval.
 */
export async function checkAction(context: GovernorContext): Promise<GovernorDecision> {
  try {
    const policies = await loadPolicies(context.tenantId);

    // 1. Check budget limits
    if (context.estimatedCost) {
      const budgetResult = await checkBudget(context.tenantId, context.userId, context.estimatedCost);
      if (!budgetResult.allowed) {
        await logAudit({
          tenantId: context.tenantId,
          actorId: context.userId,
          actorType: 'agent',
          action: 'governor.budget_denied',
          resourceType: context.resourceType ?? context.action,
          details: {
            agentType: context.agentType,
            estimatedCost: context.estimatedCost,
            reason: budgetResult.reason,
          },
        });

        return { allowed: false, reason: budgetResult.reason };
      }
    }

    // 2. Check if action requires approval
    const approvalRequired = await checkApprovalRequired(
      context.tenantId,
      context.action,
      context.agentType,
      policies
    );

    if (approvalRequired) {
      const requestId = await createApprovalRequest({
        tenantId: context.tenantId,
        requesterId: context.userId,
        action: context.action,
        agentType: context.agentType,
        resourceType: context.resourceType,
        estimatedCost: context.estimatedCost,
        metadata: context.metadata,
      });

      await logAudit({
        tenantId: context.tenantId,
        actorId: context.userId,
        actorType: 'agent',
        action: 'governor.approval_requested',
        resourceType: context.resourceType ?? context.action,
        details: { requestId, agentType: context.agentType },
      });

      return {
        allowed: false,
        reason: 'Action requires approval',
        requiresApproval: true,
        approvalRequestId: requestId,
      };
    }

    // 3. Check action-specific policies
    for (const policy of policies) {
      if (policy.action === context.action || policy.action === '*') {
        if (policy.effect === 'deny') {
          // Check conditions
          const conditionMet = evaluateConditions(policy.conditions, context);
          if (conditionMet) {
            return { allowed: false, reason: `Policy "${policy.name}" denied this action` };
          }
        }
      }
    }

    // 4. Log allowed action
    await logAudit({
      tenantId: context.tenantId,
      actorId: context.userId,
      actorType: 'agent',
      action: `governor.allowed:${context.action}`,
      resourceType: context.resourceType ?? context.action,
      details: { agentType: context.agentType },
    });

    return { allowed: true };

  } catch (err) {
    logger.error('Governor check failed', { error: (err as Error).message, context });
    // Fail open in non-critical cases, fail closed for sensitive actions
    const sensitiveActions = ['data.delete', 'data.export', 'user.remove', 'payment.process'];
    if (sensitiveActions.includes(context.action)) {
      return { allowed: false, reason: 'Governor check failed, action denied for safety' };
    }
    return { allowed: true };
  }
}

function evaluateConditions(
  conditions: Record<string, unknown> | undefined,
  context: GovernorContext
): boolean {
  if (!conditions || Object.keys(conditions).length === 0) return true;

  // Simple condition matching
  if (conditions.agentType && conditions.agentType !== context.agentType) return false;
  if (conditions.minCost && context.estimatedCost && context.estimatedCost < (conditions.minCost as number)) return false;
  if (conditions.maxCost && context.estimatedCost && context.estimatedCost > (conditions.maxCost as number)) return true;

  return true;
}
