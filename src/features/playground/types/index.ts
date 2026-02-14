// ─── Model Providers ────────────────────────────────────────────────
export const ModelProvider = {
  Anthropic: 'anthropic',
  OpenAI: 'openai',
  Google: 'google',
  Meta: 'meta',
  OpenRouter: 'openrouter',
  XAI: 'xai',
} as const

export type ModelProvider = (typeof ModelProvider)[keyof typeof ModelProvider]

// ─── Model IDs ──────────────────────────────────────────────────────
export const ModelId = {
  ClaudeOpus: 'claude-opus',
  ClaudeSonnet: 'claude-sonnet',
  ClaudeHaiku: 'claude-haiku',
  Gpt4o: 'gpt-4o',
  Gpt4oMini: 'gpt-4o-mini',
  GeminiFlash: 'gemini-flash',
  GeminiPro: 'gemini-pro',
  Llama4Scout: 'llama-4-scout',
  Grok3: 'grok-3',
} as const

export type ModelId = (typeof ModelId)[keyof typeof ModelId]

// ─── Tool Call Status ───────────────────────────────────────────────
export const ToolCallStatus = {
  Running: 'running',
  Completed: 'completed',
  Error: 'error',
} as const

export type ToolCallStatus = (typeof ToolCallStatus)[keyof typeof ToolCallStatus]

// ─── Interfaces ─────────────────────────────────────────────────────
export interface ModelDefinition {
  id: ModelId
  name: string
  provider: ModelProvider
  contextWindow: number
  maxOutput: number
  description: string
  color: string
}

export interface ToolCall {
  id: string
  name: string
  input: string
  output: string | null
  status: ToolCallStatus
  durationMs: number
}

export interface PlaygroundMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  modelId: ModelId | null
  tokenCount: number
  toolCalls: ToolCall[]
}

export interface ConversationSettings {
  systemPrompt: string
  temperature: number
  maxTokens: number
  topP: number
  streaming: boolean
  agentMode: boolean
}

export interface Conversation {
  id: string
  title: string
  modelId: ModelId
  settings: ConversationSettings
  messages: PlaygroundMessage[]
  createdAt: string
  updatedAt: string
  totalTokens: number
}
