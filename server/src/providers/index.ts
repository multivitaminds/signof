export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface ChatRequest {
  messages: ChatMessage[];
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  tools?: ToolDefinition[];
}

export interface StreamEvent {
  type: 'text_delta' | 'tool_use' | 'message_stop' | 'error';
  text?: string;
  tool?: {
    id: string;
    name: string;
    input: Record<string, unknown>;
  };
  error?: string;
}

export interface SyncResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  toolCalls?: Array<{
    id: string;
    name: string;
    input: Record<string, unknown>;
  }>;
}

export interface ProviderModel {
  id: string;
  name: string;
  contextWindow?: number;
}

export interface LLMProvider {
  name: string;
  models: ProviderModel[];
  isAvailable(): boolean;
  streamChat(request: ChatRequest, onEvent: (event: StreamEvent) => void, signal?: AbortSignal): Promise<void>;
  syncChat(request: ChatRequest): Promise<SyncResponse>;
}

// --- Provider Registry ---

import { createAnthropicProvider } from './anthropic.js';
import { createOpenAIProvider } from './openai.js';
import { createOpenAICompatibleProvider } from './openai-compatible.js';

function buildProviders(): Map<string, LLMProvider> {
  const map = new Map<string, LLMProvider>();

  map.set('anthropic', createAnthropicProvider());
  map.set('openai', createOpenAIProvider());

  map.set('google', createOpenAICompatibleProvider({
    name: 'Google Gemini',
    envKey: 'GOOGLE_API_KEY',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', contextWindow: 1048576 },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', contextWindow: 1048576 },
    ],
  }));

  map.set('minimax', createOpenAICompatibleProvider({
    name: 'Minimax',
    envKey: 'MINIMAX_API_KEY',
    baseURL: 'https://api.minimax.chat/v1',
    models: [
      { id: 'minimax-01', name: 'Minimax-01', contextWindow: 1000000 },
    ],
  }));

  map.set('deepseek', createOpenAICompatibleProvider({
    name: 'DeepSeek',
    envKey: 'DEEPSEEK_API_KEY',
    baseURL: 'https://api.deepseek.com',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', contextWindow: 65536 },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', contextWindow: 65536 },
    ],
  }));

  map.set('mistral', createOpenAICompatibleProvider({
    name: 'Mistral',
    envKey: 'MISTRAL_API_KEY',
    baseURL: 'https://api.mistral.ai/v1',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', contextWindow: 131072 },
      { id: 'mistral-small-latest', name: 'Mistral Small', contextWindow: 131072 },
    ],
  }));

  map.set('groq', createOpenAICompatibleProvider({
    name: 'Groq',
    envKey: 'GROQ_API_KEY',
    baseURL: 'https://api.groq.com/openai/v1',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', contextWindow: 131072 },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', contextWindow: 32768 },
    ],
  }));

  map.set('openrouter', createOpenAICompatibleProvider({
    name: 'OpenRouter',
    envKey: 'OPENROUTER_API_KEY',
    baseURL: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4 (via OpenRouter)', contextWindow: 200000 },
      { id: 'openai/gpt-4o', name: 'GPT-4o (via OpenRouter)', contextWindow: 128000 },
      { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro (via OpenRouter)', contextWindow: 1048576 },
      { id: 'meta-llama/llama-4-scout', name: 'Llama 4 Scout (via OpenRouter)', contextWindow: 512000 },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (via OpenRouter)', contextWindow: 65536 },
    ],
  }));

  map.set('xai', createOpenAICompatibleProvider({
    name: 'xAI',
    envKey: 'XAI_API_KEY',
    baseURL: 'https://api.x.ai/v1',
    models: [
      { id: 'grok-3', name: 'Grok 3', contextWindow: 131072 },
      { id: 'grok-3-mini', name: 'Grok 3 Mini', contextWindow: 131072 },
    ],
  }));

  return map;
}

const providers = buildProviders();

export function getProvider(name: string): LLMProvider | undefined {
  return providers.get(name);
}

export function getAllProviders(): Map<string, LLMProvider> {
  return providers;
}

export function getDefaultProvider(): { key: string; provider: LLMProvider } | undefined {
  // Prefer Anthropic, then OpenAI, then first available
  for (const key of ['anthropic', 'openai']) {
    const p = providers.get(key);
    if (p?.isAvailable()) return { key, provider: p };
  }
  for (const [key, p] of providers) {
    if (p.isAvailable()) return { key, provider: p };
  }
  return undefined;
}
