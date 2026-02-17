import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// POST /api/connectors/:id/execute — Server-side connector proxy
router.post('/connectors/:id/execute', async (req: Request, res: Response) => {
  const connectorId = String(req.params.id);
  const body = req.body as Record<string, unknown>;
  const actionId = typeof body.actionId === 'string' ? body.actionId : '';
  const params = (body.params && typeof body.params === 'object' ? body.params : {}) as Record<string, unknown>;

  if (!actionId) {
    res.status(400).json({ success: false, error: 'actionId is required' });
    return;
  }

  // For now, return a structured mock result
  // Real connector execution will be added when OAuth/API credentials are implemented
  res.json({
    success: true,
    connector: connectorId,
    action: actionId,
    params,
    result: `Server-side execution result for ${connectorId}/${actionId}`,
    timestamp: new Date().toISOString(),
  });
});

export default router;
