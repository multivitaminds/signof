// Voice session endpoints (start/stop/config)

import { Router } from 'express';
import { startVoiceSession, endVoiceSession, processAudio } from '../voice/pipeline.js';
import { isSTTAvailable } from '../voice/stt.js';
import { isTTSAvailable } from '../voice/tts.js';
import { logger } from '../lib/logger.js';

interface TenantRequest {
  tenantId?: string;
  userId?: string;
}

const router = Router();

// GET /api/voice/status — check voice capabilities
router.get('/voice/status', (_req, res) => {
  res.json({
    stt: isSTTAvailable(),
    tts: isTTSAvailable(),
    available: isSTTAvailable(), // STT is minimum requirement
  });
});

// POST /api/voice/sessions — start a voice session
router.post('/voice/sessions', async (req, res) => {
  try {
    const tenantReq = req as unknown as TenantRequest;
    if (!tenantReq.tenantId || !tenantReq.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!isSTTAvailable()) {
      res.status(503).json({ error: 'Voice services not configured (DEEPGRAM_API_KEY required)' });
      return;
    }

    const session = await startVoiceSession(tenantReq.tenantId, tenantReq.userId);
    res.status(201).json(session);
  } catch (err) {
    logger.error('Start voice session error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/voice/sessions/:id/audio — process audio
router.post('/voice/sessions/:id/audio', async (req, res) => {
  try {
    // Expect raw audio in request body
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    if (audioBuffer.length === 0) {
      res.status(400).json({ error: 'Audio data required' });
      return;
    }

    const result = await processAudio(req.params.id, audioBuffer, {
      language: req.headers['x-language'] as string,
      voiceId: req.headers['x-voice-id'] as string,
    });

    res.json(result);
  } catch (err) {
    logger.error('Process audio error', { error: (err as Error).message });
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE /api/voice/sessions/:id — end a voice session
router.delete('/voice/sessions/:id', async (req, res) => {
  try {
    await endVoiceSession(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    logger.error('End voice session error', { error: (err as Error).message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
