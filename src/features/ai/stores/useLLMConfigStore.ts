import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LLMMode, LLMConnectionStatus, LLMProvider, LLMModelInfo, ProviderStatus } from '../types'

// ─── Provider Model Catalog ──────────────────────────────────────────

export const PROVIDER_MODELS: Record<LLMProvider, LLMModelInfo[]> = {
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', contextWindow: 200_000, description: 'Best balance of speed and intelligence' },
    { id: 'claude-opus-4-0-20250514', name: 'Claude Opus 4', provider: 'anthropic', contextWindow: 200_000, description: 'Most capable model for complex tasks' },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'anthropic', contextWindow: 200_000, description: 'Fastest model for simple tasks' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128_000, description: 'Multimodal flagship model' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextWindow: 128_000, description: 'Fast and affordable' },
    { id: 'o1', name: 'o1', provider: 'openai', contextWindow: 200_000, description: 'Advanced reasoning model' },
    { id: 'o3-mini', name: 'o3-mini', provider: 'openai', contextWindow: 200_000, description: 'Efficient reasoning model' },
  ],
  google: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', contextWindow: 1_000_000, description: 'Fast model with 1M context' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', contextWindow: 1_000_000, description: 'Most capable Gemini model' },
  ],
  minimax: [
    { id: 'minimax-01', name: 'MiniMax-01', provider: 'minimax', contextWindow: 1_000_000, description: 'Long context model' },
  ],
  deepseek: [
    { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', contextWindow: 64_000, description: 'General-purpose chat model' },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'deepseek', contextWindow: 64_000, description: 'Reasoning-focused model' },
  ],
  mistral: [
    { id: 'mistral-large', name: 'Mistral Large', provider: 'mistral', contextWindow: 128_000, description: 'Most capable Mistral model' },
    { id: 'mistral-small', name: 'Mistral Small', provider: 'mistral', contextWindow: 128_000, description: 'Efficient Mistral model' },
  ],
  groq: [
    { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'groq', contextWindow: 128_000, description: 'Fast inference via Groq' },
    { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'groq', contextWindow: 32_000, description: 'MoE model via Groq' },
  ],
  openrouter: [
    { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'openrouter', contextWindow: 200_000, description: 'Anthropic via OpenRouter' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openrouter', contextWindow: 128_000, description: 'OpenAI via OpenRouter' },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'openrouter', contextWindow: 1_000_000, description: 'Google via OpenRouter' },
    { id: 'meta-llama/llama-4-scout', name: 'Llama 4 Scout', provider: 'openrouter', contextWindow: 512_000, description: 'Meta via OpenRouter' },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'openrouter', contextWindow: 64_000, description: 'DeepSeek via OpenRouter' },
  ],
  xai: [
    { id: 'grok-3', name: 'Grok 3', provider: 'xai', contextWindow: 131_000, description: 'xAI flagship reasoning model' },
    { id: 'grok-3-mini', name: 'Grok 3 Mini', provider: 'xai', contextWindow: 131_000, description: 'Fast and affordable xAI model' },
  ],
}

// ─── Store ───────────────────────────────────────────────────────────

export interface LLMConfigState {
  mode: LLMMode
  connectionStatus: LLMConnectionStatus
  provider: LLMProvider
  model: string
  availableProviders: ProviderStatus[]
  lastCheckedAt: string | null
  errorMessage: string | null

  checkConnection: () => Promise<void>
  setProvider: (provider: LLMProvider) => void
  setModel: (model: string) => void
}

const useLLMConfigStore = create<LLMConfigState>()(
  persist(
    (set) => ({
      mode: 'demo',
      connectionStatus: 'unknown',
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      availableProviders: [],
      lastCheckedAt: null,
      errorMessage: null,

      checkConnection: async () => {
        try {
          const response = await fetch('/api/health')
          if (!response.ok) {
            set({
              mode: 'demo',
              connectionStatus: 'disconnected',
              availableProviders: [],
              lastCheckedAt: new Date().toISOString(),
              errorMessage: `Health check failed: ${response.status}`,
            })
            return
          }

          const data: {
            providers?: { available?: string[]; unavailable?: string[] } | ProviderStatus[]
          } = await response.json()

          // Normalize server response to ProviderStatus[]
          let providers: ProviderStatus[]
          if (Array.isArray(data.providers)) {
            providers = data.providers
          } else if (data.providers && 'available' in data.providers) {
            // Server returns { available: string[], unavailable: string[] }
            const available = data.providers.available ?? []
            const unavailable = data.providers.unavailable ?? []
            providers = [
              ...available.map((p) => ({
                provider: p as LLMProvider,
                available: true,
                models: (PROVIDER_MODELS[p as LLMProvider] ?? []).map((m) => m.id),
              })),
              ...unavailable.map((p) => ({
                provider: p as LLMProvider,
                available: false,
                models: [],
              })),
            ]
          } else {
            providers = []
          }

          const hasAvailable = providers.some((p) => p.available)

          set({
            mode: hasAvailable ? 'live' : 'demo',
            connectionStatus: 'connected',
            availableProviders: providers,
            lastCheckedAt: new Date().toISOString(),
            errorMessage: null,
          })
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Connection failed'
          set({
            mode: 'demo',
            connectionStatus: 'error',
            availableProviders: [],
            lastCheckedAt: new Date().toISOString(),
            errorMessage: message,
          })
        }
      },

      setProvider: (provider) => {
        const models = PROVIDER_MODELS[provider]
        const defaultModel = models[0]?.id ?? ''
        set({ provider, model: defaultModel })
      },

      setModel: (model) => {
        set({ model })
      },
    }),
    {
      name: 'orchestree-llm-config',
      partialize: (state) => ({
        mode: state.mode,
        provider: state.provider,
        model: state.model,
      }),
    }
  )
)

export default useLLMConfigStore
