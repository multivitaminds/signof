import OpenAI from 'openai';
import type { LLMProvider, ChatRequest, StreamEvent, SyncResponse, ProviderModel } from './index.js';

const MODELS: ProviderModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000 },
  { id: 'o1', name: 'o1', contextWindow: 200000 },
  { id: 'o3-mini', name: 'o3 Mini', contextWindow: 200000 },
];

const DEFAULT_MODEL = 'gpt-4o';

export function createOpenAIProvider(): LLMProvider {
  let client: OpenAI | null = null;

  function getClient(): OpenAI {
    if (!client) {
      client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return client;
  }

  function buildMessages(request: ChatRequest): OpenAI.ChatCompletionMessageParam[] {
    const msgs: OpenAI.ChatCompletionMessageParam[] = [];
    if (request.systemPrompt) {
      msgs.push({ role: 'system', content: request.systemPrompt });
    }
    for (const m of request.messages) {
      msgs.push({ role: m.role, content: m.content });
    }
    return msgs;
  }

  function buildTools(tools?: ChatRequest['tools']): OpenAI.ChatCompletionTool[] | undefined {
    if (!tools || tools.length === 0) return undefined;
    return tools.map((t) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.input_schema,
      },
    }));
  }

  return {
    name: 'OpenAI',
    models: MODELS,

    isAvailable(): boolean {
      return !!process.env.OPENAI_API_KEY;
    },

    async streamChat(request: ChatRequest, onEvent: (event: StreamEvent) => void, signal?: AbortSignal): Promise<void> {
      const model = request.model ?? DEFAULT_MODEL;
      const openaiTools = buildTools(request.tools);

      const stream = await getClient().chat.completions.create({
        model,
        max_tokens: request.maxTokens ?? 4096,
        messages: buildMessages(request),
        stream: true,
        ...(openaiTools ? { tools: openaiTools } : {}),
      });

      try {
        for await (const chunk of stream) {
          if (signal?.aborted) break;

          const delta = chunk.choices[0]?.delta;
          if (!delta) continue;

          if (delta.content) {
            onEvent({ type: 'text_delta', text: delta.content });
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (tc.function?.name) {
                onEvent({
                  type: 'tool_use',
                  tool: {
                    id: tc.id ?? '',
                    name: tc.function.name,
                    input: tc.function.arguments ? JSON.parse(tc.function.arguments) : {},
                  },
                });
              }
            }
          }

          if (chunk.choices[0]?.finish_reason) {
            onEvent({ type: 'message_stop' });
          }
        }
      } catch (err) {
        if (signal?.aborted) return;
        throw err;
      }
    },

    async syncChat(request: ChatRequest): Promise<SyncResponse> {
      const model = request.model ?? DEFAULT_MODEL;
      const openaiTools = buildTools(request.tools);

      const response = await getClient().chat.completions.create({
        model,
        max_tokens: request.maxTokens ?? 4096,
        messages: buildMessages(request),
        ...(openaiTools ? { tools: openaiTools } : {}),
      });

      const choice = response.choices[0];
      const toolCalls = choice?.message?.tool_calls?.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments) as Record<string, unknown>,
      }));

      return {
        content: choice?.message?.content ?? '',
        model: response.model,
        usage: response.usage ? {
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens ?? 0,
        } : undefined,
        ...(toolCalls && toolCalls.length > 0 ? { toolCalls } : {}),
      };
    },
  };
}
