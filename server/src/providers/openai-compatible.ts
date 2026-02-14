import OpenAI from 'openai';
import type { LLMProvider, ChatRequest, StreamEvent, SyncResponse, ProviderModel } from './index.js';

export interface OpenAICompatibleConfig {
  name: string;
  envKey: string;
  baseURL: string;
  models: ProviderModel[];
}

export function createOpenAICompatibleProvider(config: OpenAICompatibleConfig): LLMProvider {
  let client: OpenAI | null = null;

  function getClient(): OpenAI {
    if (!client) {
      client = new OpenAI({
        apiKey: process.env[config.envKey],
        baseURL: config.baseURL,
      });
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

  const defaultModel = config.models[0]?.id ?? '';

  return {
    name: config.name,
    models: config.models,

    isAvailable(): boolean {
      return !!process.env[config.envKey];
    },

    async streamChat(request: ChatRequest, onEvent: (event: StreamEvent) => void, signal?: AbortSignal): Promise<void> {
      const model = request.model ?? defaultModel;

      const stream = await getClient().chat.completions.create({
        model,
        max_tokens: request.maxTokens ?? 4096,
        messages: buildMessages(request),
        stream: true,
      });

      try {
        for await (const chunk of stream) {
          if (signal?.aborted) break;

          const delta = chunk.choices[0]?.delta;
          if (!delta) continue;

          if (delta.content) {
            onEvent({ type: 'text_delta', text: delta.content });
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
      const model = request.model ?? defaultModel;

      const response = await getClient().chat.completions.create({
        model,
        max_tokens: request.maxTokens ?? 4096,
        messages: buildMessages(request),
      });

      const choice = response.choices[0];

      return {
        content: choice?.message?.content ?? '',
        model: response.model,
        usage: response.usage ? {
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens ?? 0,
        } : undefined,
      };
    },
  };
}
