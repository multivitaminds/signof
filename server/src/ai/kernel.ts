// AI Kernel — core orchestration engine
// Routes requests to agents, manages context, streams responses

import { routeToAgent } from './agentRouter.js';
import { selectModel } from './modelSelector.js';
import { executeTools } from './toolExecutor.js';
import { getUnifiedMemory } from './memory/index.js';
import { query } from '../db/postgres.js';
import { generateId } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';

export interface KernelRequest {
  tenantId: string;
  userId: string;
  conversationId?: string;
  message: string;
  agentType?: string;
  channel?: string;
  channelId?: string;
  metadata?: Record<string, unknown>;
}

export interface KernelResponse {
  conversationId: string;
  content: string;
  agentType: string;
  model: string;
  provider: string;
  runId: string;
  toolCalls?: Array<{ name: string; input: Record<string, unknown>; output: string }>;
  usage: { inputTokens: number; outputTokens: number; costUsd: number };
}

export interface StreamCallback {
  onToken: (token: string) => void;
  onToolCall?: (name: string, input: Record<string, unknown>) => void;
  onToolResult?: (name: string, result: string) => void;
  onDone: (response: KernelResponse) => void;
  onError: (error: Error) => void;
}

/**
 * Process a message through the AI kernel.
 * 1. Route to appropriate agent
 * 2. Select optimal model
 * 3. Load relevant memory
 * 4. Build context and call LLM
 * 5. Execute tools if needed
 * 6. Store results
 */
export async function processMessage(
  request: KernelRequest,
  stream?: StreamCallback
): Promise<KernelResponse> {
  const runId = generateId();
  const startedAt = new Date();

  try {
    // 1. Determine agent type
    const agentType = request.agentType ?? routeToAgent(request.message);
    logger.debug('Agent routed', { agentType, runId });

    // 2. Select model based on agent type and tenant plan
    const { model, provider } = await selectModel(agentType, request.tenantId);
    logger.debug('Model selected', { model, provider, runId });

    // 3. Load relevant memory context
    const memory = getUnifiedMemory();
    const memoryContext = await memory.getRelevantContext(
      request.tenantId,
      request.userId,
      request.message
    );

    // 4. Get or create conversation
    const conversationId = request.conversationId ?? await createConversation(
      request.tenantId,
      request.userId,
      agentType,
      request.channel ?? 'web',
      request.channelId
    );

    // 5. Get conversation history
    const history = await getConversationHistory(conversationId);

    // 6. Store user message
    await storeMessage(request.tenantId, conversationId, 'user', request.message);

    // 7. Create agent run record
    await query(
      `INSERT INTO agent_runs (id, tenant_id, user_id, agent_type, model, provider, status, task, started_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'running', $7, $8)`,
      [runId, request.tenantId, request.userId, agentType, model, provider, request.message, startedAt.toISOString()]
    );

    // 8. Build system prompt with memory context
    const systemPrompt = buildAgentPrompt(agentType, memoryContext);

    // 9. Call LLM provider
    const { getProvider } = await import('../providers/index.js');
    const llmProvider = getProvider(provider);
    if (!llmProvider) {
      throw new Error(`Provider ${provider} not available`);
    }

    const messages = [
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: request.message },
    ];

    const llmResponse = await llmProvider.syncChat({
      messages,
      systemPrompt,
    });

    let finalContent = llmResponse.content;
    const executedToolCalls: Array<{ name: string; input: Record<string, unknown>; output: string }> = [];

    // 10. Handle tool calls
    if (llmResponse.toolCalls && llmResponse.toolCalls.length > 0) {
      for (const tc of llmResponse.toolCalls) {
        const input = tc.input as Record<string, unknown>;
        stream?.onToolCall?.(tc.name, input);

        const result = await executeTools(tc.name, input, request.tenantId);
        executedToolCalls.push({ name: tc.name, input, output: result });

        stream?.onToolResult?.(tc.name, result);

        // Log tool call
        await query(
          `INSERT INTO agent_tool_calls (id, tenant_id, run_id, tool_name, input, output, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'completed')`,
          [generateId(), request.tenantId, runId, tc.name, JSON.stringify(input), result]
        );
      }

      // Re-call LLM with tool results
      const followUpMessages = [
        ...messages,
        { role: 'assistant' as const, content: llmResponse.content || 'Let me look into that.' },
        { role: 'user' as const, content: `Tool results:\n${executedToolCalls.map(tc => `[${tc.name}]: ${tc.output}`).join('\n')}` },
      ];

      const followUp = await llmProvider.syncChat({
        messages: followUpMessages,
        systemPrompt,
      });

      finalContent = followUp.content;
    }

    // 11. Stream tokens if callback provided
    if (stream) {
      stream.onToken(finalContent);
    }

    // 12. Calculate costs
    const usage = {
      inputTokens: llmResponse.usage?.inputTokens ?? 0,
      outputTokens: llmResponse.usage?.outputTokens ?? 0,
      costUsd: calculateCost(provider, model, llmResponse.usage?.inputTokens ?? 0, llmResponse.usage?.outputTokens ?? 0),
    };

    // 13. Store assistant response
    await storeMessage(request.tenantId, conversationId, 'assistant', finalContent, model, usage.inputTokens, usage.outputTokens);

    // 14. Update agent run
    await query(
      `UPDATE agent_runs SET status = 'completed', result = $1, input_tokens = $2, output_tokens = $3, cost_usd = $4, completed_at = NOW()
       WHERE id = $5`,
      [finalContent.slice(0, 1000), usage.inputTokens, usage.outputTokens, usage.costUsd, runId]
    );

    // 15. Track daily costs
    await trackDailyCost(request.tenantId, provider, model, usage);

    // 16. Store episodic memory
    await memory.recordEpisode(request.tenantId, request.userId, 'ai_interaction', request.message.slice(0, 200), {
      agentType,
      model,
      conversationId,
    });

    const response: KernelResponse = {
      conversationId,
      content: finalContent,
      agentType,
      model,
      provider,
      runId,
      toolCalls: executedToolCalls.length > 0 ? executedToolCalls : undefined,
      usage,
    };

    stream?.onDone(response);
    return response;

  } catch (err) {
    const error = err as Error;
    logger.error('Kernel processing error', { runId, error: error.message });

    // Update run as failed
    await query(
      `UPDATE agent_runs SET status = 'failed', error = $1, completed_at = NOW() WHERE id = $2`,
      [error.message, runId]
    ).catch(() => { /* ignore */ });

    stream?.onError(error);
    throw error;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

async function createConversation(
  tenantId: string,
  userId: string,
  agentType: string,
  channel: string,
  channelId?: string
): Promise<string> {
  const id = generateId();
  await query(
    `INSERT INTO conversations (id, tenant_id, user_id, agent_type, channel, channel_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, tenantId, userId, agentType, channel, channelId ?? null]
  );
  return id;
}

async function getConversationHistory(conversationId: string): Promise<Array<{ role: string; content: string }>> {
  const result = await query(
    `SELECT role, content FROM conversation_messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT 50`,
    [conversationId]
  );
  return result.rows as Array<{ role: string; content: string }>;
}

async function storeMessage(
  tenantId: string,
  conversationId: string,
  role: string,
  content: string,
  model?: string,
  inputTokens?: number,
  outputTokens?: number
): Promise<void> {
  await query(
    `INSERT INTO conversation_messages (id, tenant_id, conversation_id, role, content, model, input_tokens, output_tokens)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [generateId(), tenantId, conversationId, role, content, model ?? null, inputTokens ?? null, outputTokens ?? null]
  );
}

function buildAgentPrompt(agentType: string, memoryContext: string): string {
  const agentPrompts: Record<string, string> = {
    researcher: 'You are a research specialist. Analyze information thoroughly, cite sources, and provide comprehensive answers.',
    writer: 'You are a professional writer. Create clear, engaging content tailored to the audience and purpose.',
    coder: 'You are an expert software engineer. Write clean, well-tested code with clear explanations.',
    analyst: 'You are a data analyst. Identify patterns, draw insights, and present findings clearly.',
    scheduler: 'You are a scheduling assistant. Help organize time, manage calendars, and optimize workflows.',
    coordinator: 'You are a team coordinator. Orchestrate multiple tasks, delegate work, and track progress.',
    general: 'You are a helpful AI assistant. Provide accurate, concise answers to any question.',
  };

  const basePrompt = agentPrompts[agentType] ?? agentPrompts.general;
  const parts = [basePrompt];

  if (memoryContext) {
    parts.push(`\nRelevant context from memory:\n${memoryContext}`);
  }

  return parts.join('\n');
}

function calculateCost(provider: string, model: string, inputTokens: number, outputTokens: number): number {
  // Pricing per 1M tokens (approximate)
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-sonnet-4-5-20250929': { input: 3, output: 15 },
    'claude-opus-4-6': { input: 15, output: 75 },
    'gpt-4o': { input: 2.5, output: 10 },
    'gpt-4-turbo': { input: 10, output: 30 },
    'gemini-2.0-flash': { input: 0.075, output: 0.3 },
    'gemini-2.5-pro': { input: 1.25, output: 5 },
  };

  const rates = pricing[model] ?? { input: 1, output: 3 };
  return (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000;
}

async function trackDailyCost(
  tenantId: string,
  provider: string,
  model: string,
  usage: { inputTokens: number; outputTokens: number; costUsd: number }
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    await query(
      `INSERT INTO cost_tracking (id, tenant_id, date, provider, model, request_count, input_tokens, output_tokens, cost_usd)
       VALUES ($1, $2, $3, $4, $5, 1, $6, $7, $8)
       ON CONFLICT (tenant_id, date, provider, model)
       DO UPDATE SET
         request_count = cost_tracking.request_count + 1,
         input_tokens = cost_tracking.input_tokens + $6,
         output_tokens = cost_tracking.output_tokens + $7,
         cost_usd = cost_tracking.cost_usd + $8,
         updated_at = NOW()`,
      [generateId(), tenantId, today, provider, model, usage.inputTokens, usage.outputTokens, usage.costUsd]
    );
  } catch (err) {
    logger.error('Failed to track cost', { error: (err as Error).message });
  }
}
