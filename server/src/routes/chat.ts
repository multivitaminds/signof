import { Router } from 'express';
import type { Request, Response } from 'express';
import { getProvider, getDefaultProvider, getAllProviders } from '../providers/index.js';
import type { ChatRequest } from '../providers/index.js';
import { logger } from '../lib/logger.js';

const router = Router();

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  systemPrompt?: string;
  provider?: string;
  model?: string;
  maxTokens?: number;
  tools?: Array<{ name: string; description: string; input_schema: Record<string, unknown> }>;
}

function validateBody(body: unknown): body is ChatRequestBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.messages) || b.messages.length === 0) return false;
  return true;
}

function resolveProvider(providerName?: string) {
  if (providerName) {
    const provider = getProvider(providerName);
    if (!provider) {
      return { error: `Unknown provider: ${providerName}`, status: 400 } as const;
    }
    if (!provider.isAvailable()) {
      return { error: `Provider ${providerName} is not configured. Set the API key in your environment.`, status: 503 } as const;
    }
    return { provider, key: providerName } as const;
  }

  const defaultP = getDefaultProvider();
  if (!defaultP) {
    return { error: 'No LLM providers are configured. Set at least one API key.', status: 503 } as const;
  }
  return { provider: defaultP.provider, key: defaultP.key } as const;
}

// POST /api/chat — Streaming SSE
router.post('/chat', (req: Request, res: Response) => {
  if (!validateBody(req.body)) {
    res.status(400).json({ error: 'Invalid request body. "messages" array is required.' });
    return;
  }

  const body = req.body as ChatRequestBody;
  const resolved = resolveProvider(body.provider);

  if ('error' in resolved) {
    res.status(resolved.status as number).json({ error: resolved.error });
    return;
  }

  const { provider } = resolved;

  const chatRequest: ChatRequest = {
    messages: body.messages,
    systemPrompt: body.systemPrompt,
    model: body.model,
    maxTokens: body.maxTokens,
    tools: body.tools,
  };

  // Set up SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const controller = new AbortController();

  req.on('close', () => {
    controller.abort();
  });

  provider
    .streamChat(
      chatRequest,
      (event) => {
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
      },
      controller.signal,
    )
    .then(() => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ type: 'message_stop' })}\n\n`);
        res.end();
      }
    })
    .catch((err: unknown) => {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Unknown streaming error';
      logger.error('Chat stream error', { error: message });
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`);
        res.end();
      }
    });
});

// POST /api/chat/sync — Non-streaming JSON
router.post('/chat/sync', async (req: Request, res: Response) => {
  if (!validateBody(req.body)) {
    res.status(400).json({ error: 'Invalid request body. "messages" array is required.' });
    return;
  }

  const body = req.body as ChatRequestBody;
  const resolved = resolveProvider(body.provider);

  if ('error' in resolved) {
    res.status(resolved.status as number).json({ error: resolved.error });
    return;
  }

  const { provider } = resolved;

  const chatRequest: ChatRequest = {
    messages: body.messages,
    systemPrompt: body.systemPrompt,
    model: body.model,
    maxTokens: body.maxTokens,
    tools: body.tools,
  };

  try {
    const result = await provider.syncChat(chatRequest);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Chat sync error', { error: message });
    res.status(500).json({ error: message });
  }
});

// GET /api/providers — List all providers and their models
router.get('/providers', (_req: Request, res: Response) => {
  const providers = getAllProviders();
  const result: Array<{
    key: string;
    name: string;
    available: boolean;
    models: Array<{ id: string; name: string; contextWindow?: number }>;
  }> = [];

  for (const [key, provider] of providers) {
    result.push({
      key,
      name: provider.name,
      available: provider.isAvailable(),
      models: provider.models,
    });
  }

  res.json({ providers: result });
});

export default router;
