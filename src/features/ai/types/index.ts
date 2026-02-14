// ─── Memory Types ────────────────────────────────────────────────────

export const MemoryScope = {
  Workspace: 'workspace',
  Personal: 'personal',
  Team: 'team',
  Project: 'project',
} as const

export type MemoryScope = (typeof MemoryScope)[keyof typeof MemoryScope]

export const MemoryCategory = {
  Decisions: 'decisions',
  Workflows: 'workflows',
  Preferences: 'preferences',
  People: 'people',
  Projects: 'projects',
  Facts: 'facts',
} as const

export type MemoryCategory = (typeof MemoryCategory)[keyof typeof MemoryCategory]

export const MemorySortOrder = {
  Recent: 'recent',
  Oldest: 'oldest',
  Largest: 'largest',
  Category: 'category',
} as const

export type MemorySortOrder = (typeof MemorySortOrder)[keyof typeof MemorySortOrder]

export interface MemoryEntry {
  id: string
  title: string
  content: string
  category: MemoryCategory
  tags: string[]
  scope: MemoryScope
  tokenCount: number
  createdAt: string
  updatedAt: string
  pinned: boolean
  sourceType: string | null
  sourceRef: string | null
  lastAccessedAt: string
  accessCount: number
}

export interface MemoryTemplate {
  id: string
  title: string
  description: string
  category: MemoryCategory
  scope: MemoryScope
  placeholder: string
  tags: string[]
  icon: string
}

export interface CategoryMeta {
  key: MemoryCategory
  label: string
  description: string
  icon: string
  color: string
  examples: string[]
}

export interface MemoryInsight {
  type: 'suggestion' | 'coverage' | 'stale'
  title: string
  description: string
  action?: { label: string; templateId?: string }
}

// ─── Agent Types ─────────────────────────────────────────────────────

export const AgentType = {
  Planner: 'planner',
  Researcher: 'researcher',
  Writer: 'writer',
  Analyst: 'analyst',
  Designer: 'designer',
  Developer: 'developer',
  Reviewer: 'reviewer',
  Coordinator: 'coordinator',
  Sales: 'sales',
  Marketing: 'marketing',
  Finance: 'finance',
  Legal: 'legal',
  Compliance: 'compliance',
  HR: 'hr',
  CustomerSuccess: 'customerSuccess',
  Translation: 'translation',
  SEO: 'seo',
  SocialMedia: 'socialMedia',
  Security: 'security',
  DevOps: 'devops',
} as const

export type AgentType = (typeof AgentType)[keyof typeof AgentType]

export const AgentCategory = {
  Core: 'core',
  Business: 'business',
  Creative: 'creative',
  Technical: 'technical',
  People: 'people',
  Legal: 'legal',
} as const

export type AgentCategory = (typeof AgentCategory)[keyof typeof AgentCategory]

export const AgentStatus = {
  Idle: 'idle',
  Running: 'running',
  Paused: 'paused',
  Completed: 'completed',
  Error: 'error',
} as const

export type AgentStatus = (typeof AgentStatus)[keyof typeof AgentStatus]

export const TeamStatus = {
  Draft: 'draft',
  Running: 'running',
  Paused: 'paused',
  Completed: 'completed',
} as const

export type TeamStatus = (typeof TeamStatus)[keyof typeof TeamStatus]

export const StepStatus = {
  Pending: 'pending',
  Running: 'running',
  Completed: 'completed',
  Error: 'error',
} as const

export type StepStatus = (typeof StepStatus)[keyof typeof StepStatus]

export interface SimulationStep {
  id: string
  label: string
  status: StepStatus
  output?: string
  durationMs: number
}

export interface AgentInstance {
  id: string
  name: string
  type: AgentType
  status: AgentStatus
  instructions: string
  memoryAllocation: number
  steps: SimulationStep[]
  currentStepIndex: number
}

export interface ChatMessage {
  id: string
  agentId: string
  role: 'user' | 'agent'
  content: string
  timestamp: string
}

export interface AgentTeam {
  id: string
  name: string
  status: TeamStatus
  agents: AgentInstance[]
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface AgentTypeDefinition {
  type: AgentType
  label: string
  description: string
  icon: string
  color: string
  category: AgentCategory
  useCases: string[]
  capabilities: string[]
  defaultSteps: Array<{ label: string; durationMs: number }>
}

// ─── Agent Run Types (individual agent runs, not team-based) ─────────

export const RunStatus = {
  Running: 'running',
  Paused: 'paused',
  Completed: 'completed',
  Cancelled: 'cancelled',
  Failed: 'failed',
} as const

export type RunStatus = (typeof RunStatus)[keyof typeof RunStatus]

export interface RunStep {
  id: string
  label: string
  description: string
  status: StepStatus
  output?: string
  _stepIndex?: number
}

export interface AgentRun {
  id: string
  agentType: AgentType
  task: string
  steps: RunStep[]
  status: RunStatus
  startedAt: string
  completedAt: string | null
  lastRunAt: string | null
  result?: string
}

// ─── Pipeline Types ──────────────────────────────────────────────────

export const PipelineStatus = {
  Draft: 'draft',
  Running: 'running',
  Paused: 'paused',
  Completed: 'completed',
  Failed: 'failed',
} as const

export type PipelineStatus = (typeof PipelineStatus)[keyof typeof PipelineStatus]

export interface PipelineStage {
  id: string
  agentType: AgentType
  task: string
  status: RunStatus
  runId: string | null
  output: string | null
}

export interface AgentPipeline {
  id: string
  name: string
  description: string
  stages: PipelineStage[]
  status: PipelineStatus
  createdAt: string
  completedAt: string | null
  templateId: string | null
}

// ─── Structured Run Result Types ─────────────────────────────────────

export interface RunResultMetric {
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}

export interface RunResultAction {
  label: string
  description: string
  link: string
  priority: 'high' | 'medium' | 'low'
  icon: string
}

export interface RunResultSuggestion {
  title: string
  description: string
  link: string
  buttonLabel: string
  icon: string
}

export interface StructuredRunResult {
  summary: string
  metrics: RunResultMetric[]
  actions: RunResultAction[]
  suggestions: RunResultSuggestion[]
}

// ─── AI Chat Types ──────────────────────────────────────────────────

export interface AIChatToolResult {
  toolName: string
  input: Record<string, unknown>
  result: string
}

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  toolResults?: AIChatToolResult[]
}

// ─── Canvas Types (Workflow Editor) ─────────────────────────────────

export const CanvasMode = {
  Select: 'select',
  Connect: 'connect',
  Pan: 'pan',
} as const

export type CanvasMode = (typeof CanvasMode)[keyof typeof CanvasMode]

export const NodeStatus = {
  Idle: 'idle',
  Running: 'running',
  Completed: 'completed',
  Error: 'error',
} as const

export type NodeStatus = (typeof NodeStatus)[keyof typeof NodeStatus]

export interface CanvasNode {
  id: string
  agentType: AgentType
  task: string
  x: number
  y: number
  status: NodeStatus
  output: string | null
}

export interface CanvasConnection {
  id: string
  sourceNodeId: string
  targetNodeId: string
  status: NodeStatus
}

export interface CanvasViewport {
  x: number
  y: number
  zoom: number
}

// ─── Marketplace Types ──────────────────────────────────────────────

export interface MarketplaceAgent {
  id: number
  name: string
  description: string
  integrations: string
  autonomy: string
  price: string
}

export interface MarketplaceDomain {
  id: string
  name: string
  description: string
  agentCount: number
  color: string
  agents: MarketplaceAgent[]
}

// ─── LLM Configuration Types ────────────────────────────────────────

export const LLMMode = {
  Demo: 'demo',
  Live: 'live',
} as const

export type LLMMode = (typeof LLMMode)[keyof typeof LLMMode]

export const LLMConnectionStatus = {
  Unknown: 'unknown',
  Connected: 'connected',
  Disconnected: 'disconnected',
  Error: 'error',
} as const

export type LLMConnectionStatus = (typeof LLMConnectionStatus)[keyof typeof LLMConnectionStatus]

export const LLMProvider = {
  Anthropic: 'anthropic',
  OpenAI: 'openai',
  Google: 'google',
  Minimax: 'minimax',
  DeepSeek: 'deepseek',
  Mistral: 'mistral',
  Groq: 'groq',
  OpenRouter: 'openrouter',
  XAI: 'xai',
} as const

export type LLMProvider = (typeof LLMProvider)[keyof typeof LLMProvider]

export interface LLMModelInfo {
  id: string
  name: string
  provider: LLMProvider
  contextWindow: number
  description: string
}

export interface ProviderStatus {
  provider: LLMProvider
  available: boolean
  models: string[]
}
