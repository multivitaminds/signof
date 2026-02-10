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
} as const

export type AgentType = (typeof AgentType)[keyof typeof AgentType]

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
}

// ─── AI Chat Types ──────────────────────────────────────────────────

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
