// AI API endpoints — chat, agent runs, memory queries

import { Router } from 'express';
import { processMessage } from '../ai/kernel.js';
import { getAgentTypes } from '../ai/agentRouter.js';
import { query } from '../db/postgres.js';
import { logger } from '../lib/logger.js';

interface TenantRequest {
  tenantId?: string;
  userId?: string;
}

const router = Router();

// POST /api/ai/chat — send a message through the AI kernel
router.post('/ai/chat', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    const { message, conversationId, agentType } = req.body as {
      message?: string;
      conversationId?: string;
      agentType?: string;
    };

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    if (!tenantReq.tenantId || !tenantReq.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const response = await processMessage({
      tenantId: tenantReq.tenantId,
      userId: tenantReq.userId,
      conversationId,
      message,
      agentType,
    });

    res.json(response);
  } catch (err) {
    logger.error('AI chat error', { error: (err as Error).message });
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// GET /api/ai/conversations — list conversations
router.get('/ai/conversations', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    if (!tenantReq.tenantId) {
      res.status(400).json({ error: 'Tenant context required' });
      return;
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const result = await query(
      `SELECT id, title, agent_type, channel, status, created_at, updated_at
       FROM conversations
       WHERE tenant_id = $1 AND user_id = $2
       ORDER BY updated_at DESC
       LIMIT $3`,
      [tenantReq.tenantId, tenantReq.userId, limit]
    );

    res.json(result.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      title: row.title,
      agentType: row.agent_type,
      channel: row.channel,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })));
  } catch (err) {
    logger.error('List conversations error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ai/conversations/:id/messages — get conversation messages
router.get('/ai/conversations/:id/messages', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;

    const result = await query(
      `SELECT id, role, content, model, input_tokens, output_tokens, created_at
       FROM conversation_messages
       WHERE conversation_id = $1 AND tenant_id = $2
       ORDER BY created_at ASC`,
      [req.params.id, tenantReq.tenantId]
    );

    res.json(result.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      model: row.model,
      inputTokens: row.input_tokens,
      outputTokens: row.output_tokens,
      createdAt: row.created_at,
    })));
  } catch (err) {
    logger.error('Get messages error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ai/runs — list agent runs
router.get('/ai/runs', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string;

    const conditions: string[] = ['tenant_id = $1'];
    const params: unknown[] = [tenantReq.tenantId];
    let paramIdx = 2;

    if (status) {
      conditions.push(`status = $${paramIdx++}`);
      params.push(status);
    }

    const result = await query(
      `SELECT id, agent_type, model, provider, status, task, input_tokens, output_tokens, cost_usd, started_at, completed_at
       FROM agent_runs
       WHERE ${conditions.join(' AND ')}
       ORDER BY started_at DESC
       LIMIT $${paramIdx}`,
      [...params, limit]
    );

    res.json(result.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      agentType: row.agent_type,
      model: row.model,
      provider: row.provider,
      status: row.status,
      task: row.task,
      inputTokens: row.input_tokens,
      outputTokens: row.output_tokens,
      costUsd: row.cost_usd,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    })));
  } catch (err) {
    logger.error('List runs error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ai/costs — get cost tracking summary
router.get('/ai/costs', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    const days = Math.min(parseInt(req.query.days as string) || 30, 90);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().split('T')[0];

    const result = await query(
      `SELECT date, provider, model, request_count, input_tokens, output_tokens, cost_usd
       FROM cost_tracking
       WHERE tenant_id = $1 AND date >= $2
       ORDER BY date DESC`,
      [tenantReq.tenantId, since]
    );

    // Aggregate totals
    let totalCost = 0;
    let totalRequests = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (const row of result.rows as Array<Record<string, unknown>>) {
      totalCost += row.cost_usd as number;
      totalRequests += row.request_count as number;
      totalInputTokens += Number(row.input_tokens);
      totalOutputTokens += Number(row.output_tokens);
    }

    res.json({
      summary: {
        totalCost: Math.round(totalCost * 10000) / 10000,
        totalRequests,
        totalInputTokens,
        totalOutputTokens,
        days,
      },
      daily: result.rows,
    });
  } catch (err) {
    logger.error('Get costs error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ai/agents — list available agent types
router.get('/ai/agents', (_req, res) => {
  res.json(getAgentTypes());
});

// POST /api/ai/memory — store a memory
router.post('/ai/memory', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    const { content, category, scope } = req.body as {
      content?: string;
      category?: string;
      scope?: string;
    };

    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const { storeLongTermMemory } = await import('../ai/memory/longTerm.js');
    const id = await storeLongTermMemory(tenantReq.tenantId!, content, {
      userId: tenantReq.userId,
      category,
      scope,
    });

    res.status(201).json({ id });
  } catch (err) {
    logger.error('Store memory error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ai/memory/search — search memory
router.get('/ai/memory/search', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    const q = req.query.q as string;

    if (!q) {
      res.status(400).json({ error: 'Query parameter q is required' });
      return;
    }

    const { searchLongTermMemory } = await import('../ai/memory/longTerm.js');
    const results = await searchLongTermMemory(tenantReq.tenantId!, q, {
      category: req.query.category as string,
      limit: parseInt(req.query.limit as string) || 10,
    });

    res.json(results);
  } catch (err) {
    logger.error('Search memory error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
