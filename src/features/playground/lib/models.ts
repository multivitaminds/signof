import { ModelId, ModelProvider } from '../types'
import type { ModelDefinition } from '../types'

export const MODEL_CATALOG: Record<ModelId, ModelDefinition> = {
  [ModelId.ClaudeOpus]: {
    id: ModelId.ClaudeOpus,
    name: 'Claude Opus',
    provider: ModelProvider.Anthropic,
    contextWindow: 200_000,
    maxOutput: 4096,
    description: 'Most capable model for complex analysis and creative tasks',
    color: '#D97706',
  },
  [ModelId.ClaudeSonnet]: {
    id: ModelId.ClaudeSonnet,
    name: 'Claude Sonnet',
    provider: ModelProvider.Anthropic,
    contextWindow: 200_000,
    maxOutput: 4096,
    description: 'Balanced performance and speed for everyday tasks',
    color: '#4F46E5',
  },
  [ModelId.ClaudeHaiku]: {
    id: ModelId.ClaudeHaiku,
    name: 'Claude Haiku',
    provider: ModelProvider.Anthropic,
    contextWindow: 200_000,
    maxOutput: 4096,
    description: 'Fastest model for quick responses and simple tasks',
    color: '#059669',
  },
  [ModelId.Gpt4o]: {
    id: ModelId.Gpt4o,
    name: 'GPT-4o',
    provider: ModelProvider.OpenAI,
    contextWindow: 128_000,
    maxOutput: 4096,
    description: 'Multimodal flagship model with strong reasoning',
    color: '#10A37F',
  },
  [ModelId.Gpt4oMini]: {
    id: ModelId.Gpt4oMini,
    name: 'GPT-4o Mini',
    provider: ModelProvider.OpenAI,
    contextWindow: 128_000,
    maxOutput: 4096,
    description: 'Cost-effective model for lightweight tasks',
    color: '#10A37F',
  },
  [ModelId.GeminiFlash]: {
    id: ModelId.GeminiFlash,
    name: 'Gemini Flash',
    provider: ModelProvider.Google,
    contextWindow: 1_000_000,
    maxOutput: 8192,
    description: 'Ultra-fast model with 1M token context window',
    color: '#4285F4',
  },
  [ModelId.GeminiPro]: {
    id: ModelId.GeminiPro,
    name: 'Gemini Pro',
    provider: ModelProvider.Google,
    contextWindow: 2_000_000,
    maxOutput: 8192,
    description: 'Advanced model with 2M token context for deep analysis',
    color: '#4285F4',
  },
  [ModelId.Llama4Scout]: {
    id: ModelId.Llama4Scout,
    name: 'Llama 4 Scout',
    provider: ModelProvider.Meta,
    contextWindow: 512_000,
    maxOutput: 4096,
    description: 'Open-source model with strong multilingual support',
    color: '#0467DF',
  },
  [ModelId.Grok3]: {
    id: ModelId.Grok3,
    name: 'Grok 3',
    provider: ModelProvider.XAI,
    contextWindow: 131_000,
    maxOutput: 4096,
    description: 'Witty and direct reasoning model with real-time knowledge',
    color: '#000000',
  },
}

export function getModelsByProvider(): Record<ModelProvider, ModelDefinition[]> {
  const grouped: Record<ModelProvider, ModelDefinition[]> = {
    [ModelProvider.Anthropic]: [],
    [ModelProvider.OpenAI]: [],
    [ModelProvider.Google]: [],
    [ModelProvider.Meta]: [],
    [ModelProvider.OpenRouter]: [],
    [ModelProvider.XAI]: [],
  }

  for (const model of Object.values(MODEL_CATALOG)) {
    grouped[model.provider].push(model)
  }

  return grouped
}

export const DEFAULT_MODEL_ID = ModelId.ClaudeSonnet

export function formatTokenCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toString()
}
