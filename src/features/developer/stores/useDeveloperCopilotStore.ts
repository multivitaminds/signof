import { create } from 'zustand'
import useDeveloperStore from './useDeveloperStore'
import { copilotChat, copilotAnalysis } from '../../ai/lib/copilotLLM'

// ─── ID Generator ────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Types ──────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: string
}

// ─── Response Generator ─────────────────────────────────────────────

function generateResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase()
  const dev = useDeveloperStore.getState()

  if (msg.includes('api key') || msg.includes('apikey') || msg.includes('authentication') || msg.includes('auth')) {
    const keys = dev.apiKeys
    const active = keys.filter((k: { status: string }) => k.status === 'active')
    const revoked = keys.filter((k: { status: string }) => k.status === 'revoked')
    return `API Keys: ${active.length} active, ${revoked.length} revoked.\n\nBest practices:\n- Rotate keys every 90 days\n- Use separate keys for dev/staging/production\n- Never expose keys in client-side code\n- Set minimal permissions (principle of least privilege)\n- Revoke immediately if compromised\n\nAuthenticate requests with: \`Authorization: Bearer <your-api-key>\``
  }

  if (msg.includes('webhook')) {
    const webhooks = dev.webhooks
    const active = webhooks.filter((w: { status: string }) => w.status === 'active')
    const deliveries = dev.deliveries
    const failures = deliveries.filter((d: { success: boolean }) => !d.success)
    return `Webhooks: ${active.length} active out of ${webhooks.length} total.\n${failures.length > 0 ? `⚠ ${failures.length} failed delivery(ies) — check endpoint availability.` : 'All recent deliveries successful.'}\n\nWebhook setup tips:\n- Use HTTPS endpoints only\n- Verify webhook signatures with your signing secret\n- Return 2xx status within 5 seconds\n- Implement retry logic for transient failures\n- Log payloads for debugging\n\nAvailable events: document.signed, document.viewed, envelope.completed, signer.declined`
  }

  if (msg.includes('endpoint') || msg.includes('rest') || msg.includes('api')) {
    return 'Orchestree REST API overview:\n\n**Documents**\n- `GET /api/v1/documents` — List documents\n- `POST /api/v1/documents` — Create document\n- `POST /api/v1/documents/:id/send` — Send for signing\n\n**Contacts**\n- `GET /api/v1/contacts` — List contacts\n- `POST /api/v1/contacts` — Create contact\n\n**Templates**\n- `GET /api/v1/templates` — List templates\n- `POST /api/v1/templates/:id/send` — Send from template\n\nAll endpoints accept JSON, return JSON, and require Bearer token authentication. Rate limit: 1000 req/min.'
  }

  if (msg.includes('sdk') || msg.includes('library') || msg.includes('package')) {
    return 'Official Orchestree SDKs:\n\n**JavaScript/TypeScript** (npm)\n```\nnpm install @orchestree/sdk\n```\n\n**Python** (pip)\n```\npip install orchestree\n```\n\n**Ruby** (gem)\n```\ngem install orchestree\n```\n\nAll SDKs provide typed clients, error handling, pagination helpers, and webhook signature verification. See the SDK Reference tab for usage examples.'
  }

  if (msg.includes('rate limit') || msg.includes('throttl') || msg.includes('quota')) {
    return 'API rate limits:\n- **Standard**: 1,000 requests per minute\n- **Bulk operations**: 100 requests per minute\n- **File uploads**: 50 requests per minute\n\nHeaders returned:\n- `X-RateLimit-Limit`: Max requests per window\n- `X-RateLimit-Remaining`: Remaining requests\n- `X-RateLimit-Reset`: UTC timestamp of window reset\n\nWhen rate limited (HTTP 429), respect the `Retry-After` header. Use exponential backoff for retries.'
  }

  if (msg.includes('error') || msg.includes('debug') || msg.includes('troubleshoot')) {
    return 'Common API errors and fixes:\n\n**401 Unauthorized** — Invalid or missing API key. Check `Authorization` header.\n**403 Forbidden** — Key lacks required permissions. Update key permissions.\n**404 Not Found** — Resource doesn\'t exist or wrong endpoint path.\n**422 Unprocessable** — Invalid request body. Check required fields.\n**429 Too Many Requests** — Rate limited. Implement backoff.\n**500 Server Error** — Transient issue. Retry with exponential backoff.\n\nEnable verbose logging in your SDK: `client.setDebug(true)`'
  }

  if (msg.includes('sandbox') || msg.includes('test') || msg.includes('playground')) {
    return 'The API Sandbox lets you test endpoints without affecting production data.\n\n- Use the Sandbox tab to send test requests\n- Switch between environments (sandbox/production)\n- Test webhook deliveries with mock events\n- Inspect request/response headers and bodies\n- Save frequently used requests for quick access\n\nSandbox API key prefix: `sk_test_*` (vs production: `sk_live_*`)'
  }

  const activeKeys = dev.apiKeys.filter((k: { status: string }) => k.status === 'active').length
  const activeWebhooks = dev.webhooks.filter((w: { status: string }) => w.status === 'active').length
  return `I'm your Developer Copilot — here to help with API integration. You have ${activeKeys} active API key(s) and ${activeWebhooks} webhook(s) configured.\n\nI can help with:\n- API authentication and key management\n- Webhook setup and debugging\n- REST endpoint documentation\n- SDK installation and usage\n- Rate limits and error handling\n- Sandbox and testing\n\nWhat would you like to know?`
}

// ─── Store Interface ────────────────────────────────────────────────

interface DeveloperCopilotState {
  isOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void

  messages: CopilotMessage[]
  isTyping: boolean
  sendMessage: (content: string, context?: string) => void
  clearMessages: () => void

  isAnalyzing: boolean
  lastAnalysis: {
    type: 'api_health' | 'webhooks' | 'keys'
    summary: string
    items: string[]
    timestamp: string
  } | null
  checkApiHealth: () => void
  debugWebhooks: () => void
  reviewKeys: () => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useDeveloperCopilotStore = create<DeveloperCopilotState>()(
  (set) => ({
    isOpen: false,
    messages: [],
    isTyping: false,
    isAnalyzing: false,
    lastAnalysis: null,

    openPanel: () => set({ isOpen: true }),
    closePanel: () => set({ isOpen: false }),
    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

    sendMessage: (content, context) => {
      const userMessage: CopilotMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        context,
      }

      set((state) => ({
        messages: [...state.messages, userMessage],
        isTyping: true,
      }))

      const dev = useDeveloperStore.getState()
      const activeKeys = dev.apiKeys.filter((k: { status: string }) => k.status === 'active').length
      const activeWebhooks = dev.webhooks.filter((w: { status: string }) => w.status === 'active').length
      const contextSummary = `${activeKeys} API keys, ${activeWebhooks} webhooks`

      copilotChat('Developer', content, contextSummary, () => generateResponse(content))
        .then((responseContent) => {
          const assistantMessage: CopilotMessage = {
            id: generateId(),
            role: 'assistant',
            content: responseContent,
            timestamp: new Date().toISOString(),
          }

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isTyping: false,
          }))
        })
    },

    clearMessages: () => set({ messages: [], isTyping: false }),

    checkApiHealth: () => {
      set({ isAnalyzing: true })

      const dev = useDeveloperStore.getState()
      const dataContext = `${dev.apiKeys.length} API keys, ${dev.webhooks.length} webhooks, ${dev.deliveries.length} deliveries`

      const fallbackFn = () => {
        const items: string[] = []
        const deliveries = dev.deliveries
        const recent = deliveries.slice(-20)
        const failures = recent.filter((d: { success: boolean }) => !d.success)
        items.push(`${dev.apiKeys.filter((k: { status: string }) => k.status === 'active').length} active API key(s)`)
        items.push(`${dev.webhooks.filter((w: { status: string }) => w.status === 'active').length} active webhook(s)`)
        if (recent.length > 0) {
          const successRate = Math.round(((recent.length - failures.length) / recent.length) * 100)
          items.push(`Webhook success rate: ${successRate}% (last ${recent.length} deliveries)`)
        }
        if (failures.length > 0) items.push(`⚠ ${failures.length} failed webhook delivery(ies) in recent batch`)
        return { summary: failures.length > 0 ? 'API health: some issues detected.' : 'API health: all systems operational.', items }
      }

      copilotAnalysis('Developer', 'API health', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'api_health', ...result, timestamp: new Date().toISOString() } })
        })
    },

    debugWebhooks: () => {
      set({ isAnalyzing: true })

      const dev = useDeveloperStore.getState()
      const dataContext = `${dev.webhooks.length} webhooks configured`

      const fallbackFn = () => {
        const items: string[] = []
        for (const webhook of dev.webhooks) {
          const deliveries = dev.getDeliveries(webhook.id)
          const failures = deliveries.filter((d: { success: boolean }) => !d.success)
          if (failures.length > 0) items.push(`"${webhook.description || webhook.url}": ${failures.length} failure(s)`)
          else if (deliveries.length === 0) items.push(`"${webhook.description || webhook.url}": no deliveries yet`)
        }
        if (items.length === 0) items.push('All webhooks healthy — no failures detected')
        return { summary: `Webhook debug: ${dev.webhooks.length} endpoint(s) checked.`, items }
      }

      copilotAnalysis('Developer', 'webhooks', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'webhooks', ...result, timestamp: new Date().toISOString() } })
        })
    },

    reviewKeys: () => {
      set({ isAnalyzing: true })

      const dev = useDeveloperStore.getState()
      const dataContext = `${dev.apiKeys.length} API keys`

      const fallbackFn = () => {
        const items: string[] = []
        const now = new Date()
        for (const key of dev.apiKeys) {
          if (key.status === 'active') {
            if (key.expiresAt && new Date(key.expiresAt) < now) {
              items.push(`⚠ "${key.name}" has expired — revoke or rotate`)
            } else if (key.expiresAt) {
              const daysLeft = Math.ceil((new Date(key.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              if (daysLeft < 30) items.push(`"${key.name}" expires in ${daysLeft} days — plan rotation`)
            }
          }
        }
        const revoked = dev.apiKeys.filter((k: { status: string }) => k.status === 'revoked')
        if (revoked.length > 0) items.push(`${revoked.length} revoked key(s) — consider deleting for cleanup`)
        if (items.length === 0) items.push('All API keys are healthy — no issues found')
        return { summary: `Key review: ${dev.apiKeys.length} key(s) checked.`, items }
      }

      copilotAnalysis('Developer', 'keys', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'keys', ...result, timestamp: new Date().toISOString() } })
        })
    },
  })
)
