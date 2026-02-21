// REST routes for session management

import { Router } from 'express';
import type { Request, Response } from 'express';
import { getSessions, getSession, createSession, closeSession, getMessages } from '../gateway/sessionStore.js';

const router = Router();

// GET /api/sessions — List all sessions
router.get('/sessions', async (_req: Request, res: Response) => {
  res.json({ sessions: await getSessions() });
});

// GET /api/sessions/:id — Get a single session
router.get('/sessions/:id', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const session = await getSession(id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});

// POST /api/sessions — Create a new session
router.post('/sessions', async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const session = await createSession({
    channelId: (body.channelId as string) ?? 'webchat',
    channelType: (body.channelType as string) ?? 'webchat',
    contactId: (body.contactId as string) ?? 'anonymous',
    contactName: (body.contactName as string) ?? 'Anonymous',
  });
  res.status(201).json(session);
});

// DELETE /api/sessions/:id — Close a session
router.delete('/sessions/:id', async (req: Request, res: Response) => {
  await closeSession(String(req.params.id));
  res.json({ success: true });
});

// GET /api/sessions/:id/messages — Get messages for a session
router.get('/sessions/:id/messages', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const session = await getSession(id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json({ messages: await getMessages(id) });
});

export default router;
