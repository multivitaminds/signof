// ─── HTTP Method ─────────────────────────────────────────────────────

export const HttpMethod = {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Patch: 'PATCH',
  Delete: 'DELETE',
} as const

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod]

// ─── Webhook Events ──────────────────────────────────────────────────

export const WebhookEvent = {
  DocumentCreated: 'document.created',
  DocumentSigned: 'document.signed',
  DocumentCompleted: 'document.completed',
  DocumentVoided: 'document.voided',
  SignerCompleted: 'signer.completed',
  SignerDeclined: 'signer.declined',
  FilingSubmitted: 'filing.submitted',
  FilingAccepted: 'filing.accepted',
  BookingCreated: 'booking.created',
  BookingCancelled: 'booking.cancelled',
} as const

export type WebhookEvent = (typeof WebhookEvent)[keyof typeof WebhookEvent]

export const WEBHOOK_EVENT_CATEGORIES: Record<string, WebhookEvent[]> = {
  Documents: [
    WebhookEvent.DocumentCreated,
    WebhookEvent.DocumentSigned,
    WebhookEvent.DocumentCompleted,
    WebhookEvent.DocumentVoided,
  ],
  Signers: [
    WebhookEvent.SignerCompleted,
    WebhookEvent.SignerDeclined,
  ],
  Filings: [
    WebhookEvent.FilingSubmitted,
    WebhookEvent.FilingAccepted,
  ],
  Bookings: [
    WebhookEvent.BookingCreated,
    WebhookEvent.BookingCancelled,
  ],
}

export const WEBHOOK_EVENT_LABELS: Record<WebhookEvent, string> = {
  [WebhookEvent.DocumentCreated]: 'Document Created',
  [WebhookEvent.DocumentSigned]: 'Document Signed',
  [WebhookEvent.DocumentCompleted]: 'Document Completed',
  [WebhookEvent.DocumentVoided]: 'Document Voided',
  [WebhookEvent.SignerCompleted]: 'Signer Completed',
  [WebhookEvent.SignerDeclined]: 'Signer Declined',
  [WebhookEvent.FilingSubmitted]: 'Filing Submitted',
  [WebhookEvent.FilingAccepted]: 'Filing Accepted',
  [WebhookEvent.BookingCreated]: 'Booking Created',
  [WebhookEvent.BookingCancelled]: 'Booking Cancelled',
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
  key: string
  environment: Environment
  createdAt: string
  lastUsedAt: string | null
}

// ─── Webhook ─────────────────────────────────────────────────────────

export interface Webhook {
  id: string
  url: string
  events: WebhookEvent[]
  secret: string
  active: boolean
  failureCount: number
  createdAt: string
  updatedAt: string
}

// ─── Webhook Log ─────────────────────────────────────────────────────

export interface WebhookLog {
  id: string
  webhookId: string
  event: WebhookEvent
  statusCode: number
  success: boolean
  timestamp: string
  requestBody: string
  responseBody: string
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
