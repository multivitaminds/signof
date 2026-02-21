// Governor management API — policies, approvals, budget

import { Router } from 'express';
import { getPendingApprovals, approveRequest, denyRequest } from '../governor/approvals.js';
import { getBudgetSummary, setBudgetLimit } from '../governor/budget.js';
import { loadPolicies, createPolicy } from '../governor/policies.js';
import { queryAuditLogs } from '../lib/audit.js';
import { logger } from '../lib/logger.js';

interface TenantRequest {
  tenantId?: string;
  userId?: string;
}

const router = Router();

// GET /api/governor/approvals — get pending approvals
router.get('/governor/approvals', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    if (!tenantReq.tenantId) {
      res.status(400).json({ error: 'Tenant context required' });
      return;
    }

    const approvals = await getPendingApprovals(tenantReq.tenantId);
    res.json(approvals);
  } catch (err) {
    logger.error('Get approvals error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/governor/approvals/:id/approve — approve a request
router.post('/governor/approvals/:id/approve', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    const { note } = req.body as { note?: string };

    await approveRequest(req.params.id, tenantReq.userId!, note);
    res.json({ ok: true });
  } catch (err) {
    logger.error('Approve error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/governor/approvals/:id/deny — deny a request
router.post('/governor/approvals/:id/deny', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    const { reason } = req.body as { reason?: string };

    if (!reason) {
      res.status(400).json({ error: 'Reason is required' });
      return;
    }

    await denyRequest(req.params.id, tenantReq.userId!, reason);
    res.json({ ok: true });
  } catch (err) {
    logger.error('Deny error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/governor/budget — get budget summary
router.get('/governor/budget', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    if (!tenantReq.tenantId) {
      res.status(400).json({ error: 'Tenant context required' });
      return;
    }

    const summary = await getBudgetSummary(tenantReq.tenantId);
    res.json(summary);
  } catch (err) {
    logger.error('Get budget error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/governor/budget — set budget limit
router.put('/governor/budget', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    const { monthlyLimitUsd } = req.body as { monthlyLimitUsd?: number };

    if (monthlyLimitUsd === undefined || monthlyLimitUsd < 0) {
      res.status(400).json({ error: 'Valid monthlyLimitUsd required' });
      return;
    }

    await setBudgetLimit(tenantReq.tenantId!, monthlyLimitUsd);
    res.json({ ok: true, monthlyLimitUsd });
  } catch (err) {
    logger.error('Set budget error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/governor/policies — list policies
router.get('/governor/policies', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    if (!tenantReq.tenantId) {
      res.status(400).json({ error: 'Tenant context required' });
      return;
    }

    const policies = await loadPolicies(tenantReq.tenantId);
    res.json(policies);
  } catch (err) {
    logger.error('Get policies error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/governor/policies — create a policy
router.post('/governor/policies', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    const policy = req.body as {
      name?: string;
      action?: string;
      effect?: string;
      requiresApproval?: boolean;
      conditions?: Record<string, unknown>;
      priority?: number;
    };

    if (!policy.name || !policy.action) {
      res.status(400).json({ error: 'Name and action are required' });
      return;
    }

    const id = await createPolicy(tenantReq.tenantId!, {
      name: policy.name,
      action: policy.action,
      effect: (policy.effect as 'allow' | 'deny') ?? 'allow',
      requiresApproval: policy.requiresApproval ?? false,
      conditions: policy.conditions ?? {},
      priority: policy.priority ?? 0,
      enabled: true,
    });

    res.status(201).json({ id });
  } catch (err) {
    logger.error('Create policy error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/governor/audit — query audit logs
router.get('/governor/audit', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    if (!tenantReq.tenantId) {
      res.status(400).json({ error: 'Tenant context required' });
      return;
    }

    const result = await queryAuditLogs(tenantReq.tenantId, {
      actorId: req.query.actorId as string,
      action: req.query.action as string,
      resourceType: req.query.resourceType as string,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    });

    res.json(result);
  } catch (err) {
    logger.error('Audit query error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
