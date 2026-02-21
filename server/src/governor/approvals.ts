// Approval workflow — request → review → approve/deny

import { query } from '../db/postgres.js';
import { generateId } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';

export interface ApprovalRequest {
  id: string;
  tenantId: string;
  requesterId: string;
  action: string;
  agentType: string;
  resourceType?: string;
  estimatedCost?: number;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  reviewerId?: string;
  reviewNote?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  reviewedAt?: string;
}

interface Policy {
  action: string;
  requiresApproval?: boolean;
  approvalAgentTypes?: string[];
}

/**
 * Check if an action requires approval based on policies.
 */
export async function checkApprovalRequired(
  _tenantId: string,
  action: string,
  agentType: string,
  policies: Policy[]
): Promise<boolean> {
  for (const policy of policies) {
    if (policy.action === action || policy.action === '*') {
      if (policy.requiresApproval) {
        // Check if this agent type requires approval
        if (policy.approvalAgentTypes && policy.approvalAgentTypes.length > 0) {
          return policy.approvalAgentTypes.includes(agentType);
        }
        return true;
      }
    }
  }
  return false;
}

/**
 * Create an approval request.
 */
export async function createApprovalRequest(input: {
  tenantId: string;
  requesterId: string;
  action: string;
  agentType: string;
  resourceType?: string;
  estimatedCost?: number;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const id = generateId();

  await query(
    `INSERT INTO approval_requests (id, tenant_id, requester_id, action, agent_type, resource_type, estimated_cost, status, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)`,
    [
      id,
      input.tenantId,
      input.requesterId,
      input.action,
      input.agentType,
      input.resourceType ?? null,
      input.estimatedCost ?? null,
      JSON.stringify(input.metadata ?? {}),
    ]
  );

  logger.info('Approval request created', { id, action: input.action, agentType: input.agentType });
  return id;
}

/**
 * Approve a request.
 */
export async function approveRequest(
  requestId: string,
  reviewerId: string,
  note?: string
): Promise<void> {
  await query(
    `UPDATE approval_requests
     SET status = 'approved', reviewer_id = $1, review_note = $2, reviewed_at = NOW()
     WHERE id = $3 AND status = 'pending'`,
    [reviewerId, note ?? null, requestId]
  );
}

/**
 * Deny a request.
 */
export async function denyRequest(
  requestId: string,
  reviewerId: string,
  reason: string
): Promise<void> {
  await query(
    `UPDATE approval_requests
     SET status = 'denied', reviewer_id = $1, review_note = $2, reviewed_at = NOW()
     WHERE id = $3 AND status = 'pending'`,
    [reviewerId, reason, requestId]
  );
}

/**
 * Get pending approval requests for a tenant.
 */
export async function getPendingApprovals(tenantId: string): Promise<ApprovalRequest[]> {
  const result = await query(
    `SELECT id, tenant_id, requester_id, action, agent_type, resource_type, estimated_cost,
            status, reviewer_id, review_note, metadata, created_at, reviewed_at
     FROM approval_requests
     WHERE tenant_id = $1 AND status = 'pending'
     ORDER BY created_at ASC`,
    [tenantId]
  );

  return result.rows.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    tenantId: row.tenant_id as string,
    requesterId: row.requester_id as string,
    action: row.action as string,
    agentType: row.agent_type as string,
    resourceType: row.resource_type as string | undefined,
    estimatedCost: row.estimated_cost as number | undefined,
    status: row.status as ApprovalRequest['status'],
    reviewerId: row.reviewer_id as string | undefined,
    reviewNote: row.review_note as string | undefined,
    metadata: row.metadata as Record<string, unknown> | undefined,
    createdAt: (row.created_at as Date).toISOString(),
    reviewedAt: row.reviewed_at ? (row.reviewed_at as Date).toISOString() : undefined,
  }));
}

/**
 * Check if a pending request has been resolved.
 */
export async function checkApprovalStatus(requestId: string): Promise<'pending' | 'approved' | 'denied' | 'expired'> {
  const result = await query<{ status: string }>(
    'SELECT status FROM approval_requests WHERE id = $1',
    [requestId]
  );

  if (result.rows.length === 0) return 'expired';
  return result.rows[0].status as ApprovalRequest['status'];
}
