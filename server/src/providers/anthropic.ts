import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider, ChatRequest, StreamEvent, SyncResponse, ProviderModel } from './index.js';

const MODELS: ProviderModel[] = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', contextWindow: 200000 },
  { id: 'claude-opus-4-0-20250514', name: 'Claude Opus 4', contextWindow: 200000 },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', contextWindow: 200000 },
];

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export function createAnthropicProvider(): LLMProvider {
  let client: Anthropic | null = null;

  function getClient(): Anthropic {
    if (!client) {
      client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return client;
  }

  function buildMessages(messages: ChatRequest['messages']) {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  }

  function buildSystem(request: ChatRequest): string | undefined {
    const systemMsgs = request.messages.filter((m) => m.role === 'system').map((m) => m.content);
    const parts = [...systemMsgs];
    if (request.systemPrompt) parts.push(request.systemPrompt);
    return parts.length > 0 ? parts.join('\n\n') : undefined;
  }

  function buildTools(tools?: ChatRequest['tools']): Anthropic.Tool[] | undefined {
    if (!tools || tools.length === 0) return undefined;
    return tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema as Anthropic.Tool.InputSchema,
    }));
  }

  return {
    name: 'Anthropic',
    models: MODELS,

    isAvailable(): boolean {
      return !!process.env.ANTHROPIC_API_KEY;
    },

    async streamChat(request: ChatRequest, onEvent: (event: StreamEvent) => void, signal?: AbortSignal): Promise<void> {
      const model = request.model ?? DEFAULT_MODEL;
      const system = buildSystem(request);
      const anthropicTools = buildTools(request.tools);

      const stream = getClient().messages.stream({
        model,
        max_tokens: request.maxTokens ?? 4096,
        messages: buildMessages(request.messages),
        ...(system ? { system } : {}),
        ...(anthropicTools ? { tools: anthropicTools } : {}),
      });

      const abortHandler = () => {
        stream.abort();
      };
      signal?.addEventListener('abort', abortHandler);

      try {
        for await (const event of stream) {
          if (signal?.aborted) break;

          if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              onEvent({ type: 'text_delta', text: event.delta.text });
            } else if (event.delta.type === 'input_json_delta') {
              // Tool input streaming — accumulate on client side
            }
          } else if (event.type === 'content_block_start') {
            if (event.content_block.type === 'tool_use') {
              onEvent({
                type: 'tool_use',
                tool: {
                  id: event.content_block.id,
                  name: event.content_block.name,
                  input: {},
                },
              });
            }
          } else if (event.type === 'message_stop') {
            onEvent({ type: 'message_stop' });
          }
        }
      } finally {
        signal?.removeEventListener('abort', abortHandler);
      }
    },

    async syncChat(request: ChatRequest): Promise<SyncResponse> {
      const model = request.model ?? DEFAULT_MODEL;
      const system = buildSystem(request);
      const anthropicTools = buildTools(request.tools);

      const response = await getClient().messages.create({
        model,
        max_tokens: request.maxTokens ?? 4096,
        messages: buildMessages(request.messages),
        ...(system ? { system } : {}),
        ...(anthropicTools ? { tools: anthropicTools } : {}),
      });

      const textParts: string[] = [];
      const toolCalls: SyncResponse['toolCalls'] = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          textParts.push(block.text);
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            name: block.name,
            input: block.input as Record<string, unknown>,
          });
        }
      }

      return {
        content: textParts.join(''),
        model: response.model,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        ...(toolCalls.length > 0 ? { toolCalls } : {}),
      };
    },
  };
}
