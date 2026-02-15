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

// ─── Autonomous Agent Types ─────────────────────────────────────────

export const AutonomyMode = {
  FullAuto: 'full_auto',
  Suggest: 'suggest',
  AskFirst: 'ask_first',
} as const

export type AutonomyMode = (typeof AutonomyMode)[keyof typeof AutonomyMode]

export const AgentLifecycle = {
  Idle: 'idle',
  Deployed: 'deployed',
  Thinking: 'thinking',
  Acting: 'acting',
  Waiting: 'waiting',
  Healing: 'healing',
  Retired: 'retired',
} as const

export type AgentLifecycle = (typeof AgentLifecycle)[keyof typeof AgentLifecycle]

export const RepairStatus = {
  Detected: 'detected',
  Analyzing: 'analyzing',
  Repairing: 'repairing',
  Resolved: 'resolved',
  Failed: 'failed',
} as const

export type RepairStatus = (typeof RepairStatus)[keyof typeof RepairStatus]

export const MessagePriority = {
  Critical: 'critical',
  High: 'high',
  Normal: 'normal',
  Low: 'low',
} as const

export type MessagePriority = (typeof MessagePriority)[keyof typeof MessagePriority]

export interface AutonomousAgent extends MarketplaceAgent {
  lifecycle: AgentLifecycle
  autonomyMode: AutonomyMode
  memoryIds: string[]
  goalStack: AgentGoal[]
  thinkingLog: ThinkingStep[]
  errorCount: number
  lastHeartbeat: string
  connectorIds: string[]
}

export interface AgentGoal {
  id: string
  description: string
  priority: number
  status: 'active' | 'completed' | 'blocked'
  subGoals: string[]
  createdAt: string
}

export interface ThinkingStep {
  id: string
  type: 'observe' | 'reason' | 'plan' | 'act' | 'reflect'
  content: string
  timestamp: string
  durationMs: number
}

export interface AgentMessage {
  id: string
  fromAgentId: string
  toAgentId: string | null
  topic: string
  content: string
  priority: MessagePriority
  timestamp: string
  acknowledged: boolean
}

export interface RepairContext {
  retryCount?: number
  retryAfterMs?: number
  connectorId?: string
}

export interface RepairRecord {
  id: string
  agentId: string
  errorType: string
  errorMessage: string
  analysis: string
  repairAction: string
  status: RepairStatus
  timestamp: string
  resolvedAt: string | null
  context?: RepairContext
}

export interface ParsedAction {
  type: 'connector' | 'tool' | 'workflow' | 'message' | 'none'
  connectorId?: string
  actionId?: string
  toolName?: string
  workflowId?: string
  params: Record<string, unknown>
  description: string
}

export interface ConnectorDefinition {
  id: string
  name: string
  category: string
  icon: string
  description: string
  authType: 'oauth2' | 'api_key' | 'basic' | 'none'
  status: 'connected' | 'disconnected' | 'error'
  actions: ConnectorAction[]
}

export interface ConnectorAction {
  id: string
  name: string
  description: string
  inputSchema: Record<string, unknown>
  outputSchema: Record<string, unknown>
}

export interface PendingApproval {
  id: string
  agentId: string
  action: string
  description: string
  createdAt: string
}

// ─── Workflow Engine Types ──────────────────────────────────────────

export interface WorkflowNodeDefinition {
  type: string
  category: 'trigger' | 'action' | 'agent' | 'logic' | 'transform'
  label: string
  description: string
  icon: string
  color: string
  inputs: PortDefinition[]
  outputs: PortDefinition[]
  parameters: ParameterDefinition[]
  defaultData: Record<string, unknown>
}

export interface PortDefinition {
  id: string
  label: string
  type: 'flow' | 'data'
}

export interface ParameterDefinition {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'expression' | 'json' | 'code'
  required: boolean
  default?: unknown
  options?: Array<{ label: string; value: string }>
  placeholder?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  status: 'draft' | 'active' | 'paused' | 'error'
  createdAt: string
  updatedAt: string
  lastRunAt: string | null
  runCount: number
  viewport: CanvasViewport
}

export interface WorkflowNode {
  id: string
  type: string
  label: string
  x: number
  y: number
  data: Record<string, unknown>
  status: NodeStatus
  output: unknown
}

export interface WorkflowConnection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
  status: NodeStatus
}

export interface ExecutionEvent {
  nodeId: string
  type: 'start' | 'complete' | 'error' | 'data'
  data: unknown
  timestamp: string
}

export interface NodeResult {
  success: boolean
  output: unknown
  error?: string
}

// ─── Governor Types (Resource Arbitration) ──────────────────────────

export const ResourceLockStatus = {
  Free: 'free',
  Locked: 'locked',
  Contested: 'contested',
} as const

export type ResourceLockStatus = (typeof ResourceLockStatus)[keyof typeof ResourceLockStatus]

export const ConflictResolutionPolicy = {
  PriorityBased: 'priority_based',
  FirstComeFirstServed: 'first_come_first_served',
  EscalateToUser: 'escalate_to_user',
} as const

export type ConflictResolutionPolicy = (typeof ConflictResolutionPolicy)[keyof typeof ConflictResolutionPolicy]

export interface ResourceLock {
  resourceId: string
  resourceType: string
  heldBy: string
  acquiredAt: string
  expiresAt: string
  priority: number
}

export interface ResourceConflict {
  id: string
  resourceId: string
  contenders: string[]
  resolution: ConflictResolutionPolicy
  resolvedAt: string | null
  winnerId: string | null
}

export interface GovernorDecision {
  allowed: boolean
  reason: string
  conflictId?: string
  waitMs?: number
}

// ─── Cost Tracking Types ────────────────────────────────────────────

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface CostRecord {
  id: string
  agentId: string
  type: string
  operation: string
  tokenUsage: TokenUsage | null
  estimatedCostUsd: number
  timestamp: string
}

export interface AgentBudget {
  agentId: string
  maxTokens: number
  maxCostUsd: number
  usedTokens: number
  usedCostUsd: number
  warningThresholdPct: number
  pauseThresholdPct: number
}

export interface BudgetCheckResult {
  allowed: boolean
  reason: string
  remainingTokens: number
  remainingCostUsd: number
  usagePct: number
}

// ─── Circuit Breaker Types ──────────────────────────────────────────

export const CircuitState = {
  Closed: 'closed',
  Open: 'open',
  HalfOpen: 'half_open',
} as const

export type CircuitState = (typeof CircuitState)[keyof typeof CircuitState]

export interface CircuitBreaker {
  connectorId: string
  state: CircuitState
  failureCount: number
  successCount: number
  lastFailureAt: string | null
  lastSuccessAt: string | null
  openedAt: string | null
  nextRetryAt: string | null
  failureThreshold: number
  resetTimeoutMs: number
  halfOpenMaxTests: number
}

export interface CircuitBreakerCheckResult {
  allowed: boolean
  state: CircuitState
  reason: string
}

// ─── Identity & Contract Types ──────────────────────────────────────

export const ContractViolationType = {
  ScopeExceeded: 'scope_exceeded',
  BudgetExceeded: 'budget_exceeded',
  AutonomyExceeded: 'autonomy_exceeded',
  ConnectorDenied: 'connector_denied',
  ToolDenied: 'tool_denied',
} as const

export type ContractViolationType = (typeof ContractViolationType)[keyof typeof ContractViolationType]

export interface CognitiveContract {
  agentId: string
  allowedTools: string[]
  allowedConnectors: string[]
  maxAutonomyLevel: AutonomyMode
  maxTokenBudget: number
  maxCostUsdBudget: number
  restrictions: string[]
  createdAt: string
  updatedAt: string
}

export interface AgentIdentity {
  id: string
  agentType: AgentType
  displayName: string
  createdAt: string
  lastDeployedAt: string | null
  retiredAt: string | null
  totalDeployments: number
  totalCycles: number
  totalActionsExecuted: number
  totalErrors: number
  totalRepairs: number
  successRate: number
  reputationScore: number
  contractViolations: number
  contract: CognitiveContract
}

export interface ContractCheckResult {
  allowed: boolean
  violationType?: ContractViolationType
  reason: string
}

// ─── Aggregate Pre-Flight Type ──────────────────────────────────────

export interface PreflightResult {
  allowed: boolean
  checks: {
    circuitBreaker: CircuitBreakerCheckResult | null
    budget: BudgetCheckResult | null
    contract: ContractCheckResult | null
    governor: GovernorDecision | null
  }
  blockingReason: string | null
}

// ─── Persona Types (Agent Identity System) ──────────────────────────

export const PersonaTab = {
  Roles: 'roles',
  Skills: 'skills',
  Memory: 'memory',
  User: 'user',
  Soul: 'soul',
  Identity: 'identity',
} as const

export type PersonaTab = (typeof PersonaTab)[keyof typeof PersonaTab]

export const ProficiencyLevel = {
  Beginner: 'beginner',
  Intermediate: 'intermediate',
  Advanced: 'advanced',
  Expert: 'expert',
  Master: 'master',
} as const

export type ProficiencyLevel = (typeof ProficiencyLevel)[keyof typeof ProficiencyLevel]

export interface PersonaRoles {
  title: string
  department: string
  reportingTo: string
  missionStatement: string
  responsibilities: string[]
  authorities: string[]
  boundaries: string[]
}

export interface SkillEntry {
  name: string
  level: ProficiencyLevel
  description: string
}

export interface PersonaSkills {
  technical: SkillEntry[]
  soft: SkillEntry[]
  domain: SkillEntry[]
  certifications: string[]
}

export interface PersonaMemory {
  contextWindow: string
  longTermCapacity: string
  retrievalStrategy: string
  knowledgeDomains: string[]
  formativeExperiences: string[]
  corePrinciples: string[]
}

export interface PersonaUser {
  interactionStyle: string
  communicationTone: string
  preferredFormat: string
  availability: string
  escalationPath: string
  userExpectations: string[]
  deliverables: string[]
}

export interface PersonaSoul {
  purpose: string
  values: string[]
  personality: string
  creativityLevel: string
  riskTolerance: string
  ethicalBoundaries: string[]
  motivation: string
  fears: string[]
}

export interface PersonaIdentity {
  codename: string
  version: string
  createdAt: string
  origin: string
  archetype: string
  tagline: string
  motto: string
  visualIdentity: {
    primaryColor: string
    icon: string
    badge: string
  }
}

export interface AgentPersona {
  roles: PersonaRoles
  skills: PersonaSkills
  memory: PersonaMemory
  user: PersonaUser
  soul: PersonaSoul
  identity: PersonaIdentity
}

export interface AgentDetailInfo {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  persona: AgentPersona
  useCases?: string[]
  capabilities?: string[]
  integrations?: string
  autonomy?: string
  price?: string
  domainId?: string
}
