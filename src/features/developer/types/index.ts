// ─── HTTP Method ─────────────────────────────────────────────────────

export const HttpMethod = {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Patch: 'PATCH',
  Delete: 'DELETE',
} as const

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod]

// ─── API Key Permission ─────────────────────────────────────────────

export const ApiKeyPermission = {
  Read: 'read',
  Write: 'write',
  Admin: 'admin',
} as const

export type ApiKeyPermission = (typeof ApiKeyPermission)[keyof typeof ApiKeyPermission]

// ─── Webhook Events ──────────────────────────────────────────────────

export const WebhookEvent = {
  DocumentCreated: 'document.created',
  DocumentSigned: 'document.signed',
  DocumentCompleted: 'document.completed',
  DocumentVoided: 'document.voided',
  IssueCreated: 'issue.created',
  IssueUpdated: 'issue.updated',
  BookingCreated: 'booking.created',
  BookingCancelled: 'booking.cancelled',
  PageCreated: 'page.created',
  PageUpdated: 'page.updated',
  MemberJoined: 'member.joined',
} as const

export type WebhookEvent = (typeof WebhookEvent)[keyof typeof WebhookEvent]

export const WEBHOOK_EVENT_CATEGORIES: Record<string, WebhookEvent[]> = {
  Documents: [
    WebhookEvent.DocumentCreated,
    WebhookEvent.DocumentSigned,
    WebhookEvent.DocumentCompleted,
    WebhookEvent.DocumentVoided,
  ],
  Issues: [
    WebhookEvent.IssueCreated,
    WebhookEvent.IssueUpdated,
  ],
  Bookings: [
    WebhookEvent.BookingCreated,
    WebhookEvent.BookingCancelled,
  ],
  Pages: [
    WebhookEvent.PageCreated,
    WebhookEvent.PageUpdated,
  ],
  Team: [
    WebhookEvent.MemberJoined,
  ],
}

export const WEBHOOK_EVENT_LABELS: Record<WebhookEvent, string> = {
  [WebhookEvent.DocumentCreated]: 'Document Created',
  [WebhookEvent.DocumentSigned]: 'Document Signed',
  [WebhookEvent.DocumentCompleted]: 'Document Completed',
  [WebhookEvent.DocumentVoided]: 'Document Voided',
  [WebhookEvent.IssueCreated]: 'Issue Created',
  [WebhookEvent.IssueUpdated]: 'Issue Updated',
  [WebhookEvent.BookingCreated]: 'Booking Created',
  [WebhookEvent.BookingCancelled]: 'Booking Cancelled',
  [WebhookEvent.PageCreated]: 'Page Created',
  [WebhookEvent.PageUpdated]: 'Page Updated',
  [WebhookEvent.MemberJoined]: 'Member Joined',
}

// ─── Environment ─────────────────────────────────────────────────────

export const Environment = {
  Live: 'live',
  Test: 'test',
} as const

export type Environment = (typeof Environment)[keyof typeof Environment]

// ─── API Endpoint ────────────────────────────────────────────────────

export interface ApiEndpointParam {
  name: string
  type: string
  required: boolean
  description: string
}

export interface ApiEndpoint {
  id: string
  method: HttpMethod
  path: string
  description: string
  category: string
  parameters: ApiEndpointParam[]
  requestBody: string | null
  responseBody: string
  curlExample: string
  jsExample: string
  pythonExample: string
}

// ─── API Key ─────────────────────────────────────────────────────────

export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  keyHash: string
  permissions: ApiKeyPermission[]
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
  status: 'active' | 'revoked'
}

// ─── Webhook ─────────────────────────────────────────────────────────

export interface WebhookEndpoint {
  id: string
  url: string
  description: string
  events: WebhookEvent[]
  secret: string
  status: 'active' | 'disabled'
  createdAt: string
  lastDeliveryAt: string | null
  failureCount: number
}

// ─── Webhook Delivery ───────────────────────────────────────────────

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: WebhookEvent
  payload: string
  statusCode: number | null
  responseBody: string | null
  deliveredAt: string
  success: boolean
}

// ─── SDK Language ────────────────────────────────────────────────────

export interface SdkLanguage {
  id: string
  name: string
  version: string
  icon: string
  installCommand: string
  repoUrl: string
  packageUrl: string
  initCode: string
  exampleCode: string
}

// ─── CLI Command ─────────────────────────────────────────────────────

export interface CliFlag {
  name: string
  alias: string | null
  description: string
  required: boolean
}

export interface CliCommand {
  name: string
  description: string
  usage: string
  flags: CliFlag[]
  examples: string[]
}

// ─── Sandbox ─────────────────────────────────────────────────────────

export interface SandboxRequest {
  method: HttpMethod
  url: string
  headers: string
  body: string
}

export interface SandboxResponse {
  statusCode: number
  body: string
  responseTime: number
}

export interface SandboxExample {
  id: string
  name: string
  request: SandboxRequest
}

// ─── MCP Domain ─────────────────────────────────────────────────────

export const McpDomain = {
  Documents: 'documents',
  Projects: 'projects',
  Scheduling: 'scheduling',
  Databases: 'databases',
  Ai: 'ai',
  Workspace: 'workspace',
} as const

export type McpDomain = (typeof McpDomain)[keyof typeof McpDomain]

export const MCP_DOMAIN_LABELS: Record<McpDomain, string> = {
  [McpDomain.Documents]: 'Documents',
  [McpDomain.Projects]: 'Projects',
  [McpDomain.Scheduling]: 'Scheduling',
  [McpDomain.Databases]: 'Databases',
  [McpDomain.Ai]: 'AI',
  [McpDomain.Workspace]: 'Workspace',
}

// ─── Agent Category ─────────────────────────────────────────────────

export const AgentCategory = {
  Core: 'core',
  Creative: 'creative',
  Technical: 'technical',
  Business: 'business',
  Legal: 'legal',
  People: 'people',
} as const

export type AgentCategory = (typeof AgentCategory)[keyof typeof AgentCategory]

export const AGENT_CATEGORY_LABELS: Record<AgentCategory, string> = {
  [AgentCategory.Core]: 'Core',
  [AgentCategory.Creative]: 'Creative',
  [AgentCategory.Technical]: 'Technical',
  [AgentCategory.Business]: 'Business',
  [AgentCategory.Legal]: 'Legal',
  [AgentCategory.People]: 'People',
}

// ─── Marketplace Domain ─────────────────────────────────────────────

export const MarketplaceDomain = {
  WorkProductivity: 'work-productivity',
  FinanceMoney: 'finance-money',
  HealthFitness: 'health-fitness',
  LearningEducation: 'learning-education',
  RelationshipsSocial: 'relationships-social',
  HomeHousehold: 'home-household',
  CreativityContent: 'creativity-content',
} as const

export type MarketplaceDomain = (typeof MarketplaceDomain)[keyof typeof MarketplaceDomain]

export const MARKETPLACE_DOMAIN_LABELS: Record<MarketplaceDomain, string> = {
  [MarketplaceDomain.WorkProductivity]: 'Work & Productivity',
  [MarketplaceDomain.FinanceMoney]: 'Finance & Money',
  [MarketplaceDomain.HealthFitness]: 'Health & Fitness',
  [MarketplaceDomain.LearningEducation]: 'Learning & Education',
  [MarketplaceDomain.RelationshipsSocial]: 'Relationships & Social',
  [MarketplaceDomain.HomeHousehold]: 'Home & Household',
  [MarketplaceDomain.CreativityContent]: 'Creativity & Content',
}

// ─── MCP Tool ───────────────────────────────────────────────────────

export interface McpToolParam {
  name: string
  type: string
  required: boolean
  description: string
}

export interface McpTool {
  id: string
  name: string
  domain: McpDomain
  description: string
  parameters: McpToolParam[]
  returnType: string
  example: string
}

// ─── MCP Resource ───────────────────────────────────────────────────

export interface McpResource {
  id: string
  name: string
  uri: string
  domain: McpDomain
  description: string
}

// ─── Agent Constraints ──────────────────────────────────────────────

export interface AgentConstraints {
  costTier: 'low' | 'medium' | 'high'
  latency: 'fast' | 'moderate' | 'slow'
  concurrency: number
  tokenBudget: number
}

// ─── Agent Entry ────────────────────────────────────────────────────

export interface AgentEntry {
  id: string
  name: string
  type: string
  category: AgentCategory
  color: string
  description: string
  capabilities: string[]
  useCases: string[]
  constraints: AgentConstraints
}

// ─── Marketplace Agent ──────────────────────────────────────────────

export interface MarketplaceAgent {
  id: string
  name: string
  domain: MarketplaceDomain
  description: string
  icon: string
  author: string
  installs: number
  rating: number
}
