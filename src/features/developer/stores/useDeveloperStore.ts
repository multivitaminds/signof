import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ApiKeyPermission, WebhookEvent } from '../types'
import type { ApiKey, WebhookEndpoint, WebhookDelivery } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return 'sk_live_' + result
}

function hashKey(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    const chr = key.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return 'hash_' + Math.abs(hash).toString(36)
}

function generateWebhookSecret(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'whsec_'
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: 'key_1',
    name: 'Production API Key',
    keyPrefix: 'sk_live_Ab',
    keyHash: 'hash_prod_a1b2c3',
    permissions: [
      ApiKeyPermission.Read as typeof ApiKeyPermission.Read,
      ApiKeyPermission.Write as typeof ApiKeyPermission.Write,
      ApiKeyPermission.Admin as typeof ApiKeyPermission.Admin,
    ],
    createdAt: '2025-11-15T10:30:00Z',
    lastUsedAt: '2026-02-08T14:22:00Z',
    expiresAt: null,
    status: 'active',
  },
  {
    id: 'key_2',
    name: 'CI/CD Pipeline Key',
    keyPrefix: 'sk_live_Xz',
    keyHash: 'hash_ci_x9y8z7',
    permissions: [
      ApiKeyPermission.Read as typeof ApiKeyPermission.Read,
    ],
    createdAt: '2025-12-01T09:00:00Z',
    lastUsedAt: '2026-01-15T11:45:00Z',
    expiresAt: '2025-12-31T23:59:59Z',
    status: 'revoked',
  },
]

const INITIAL_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'wh_1',
    url: 'https://api.example.com/webhooks/orchestree',
    description: 'Production webhook for document events',
    events: [
      WebhookEvent.DocumentCreated as typeof WebhookEvent.DocumentCreated,
      WebhookEvent.DocumentCompleted as typeof WebhookEvent.DocumentCompleted,
      WebhookEvent.DocumentSigned as typeof WebhookEvent.DocumentSigned,
    ],
    secret: 'whsec_t3s7s3cr3tk3yv4lu3h3r3',
    status: 'active',
    createdAt: '2025-11-20T08:00:00Z',
    lastDeliveryAt: '2026-02-08T10:25:00Z',
    failureCount: 1,
  },
  {
    id: 'wh_2',
    url: 'https://hooks.slack.com/services/T00/B00/xxx',
    description: 'Slack notifications for bookings',
    events: [
      WebhookEvent.BookingCreated as typeof WebhookEvent.BookingCreated,
      WebhookEvent.BookingCancelled as typeof WebhookEvent.BookingCancelled,
    ],
    secret: 'whsec_sl4ckn0t1f1c4t10ns3c',
    status: 'active',
    createdAt: '2026-01-05T12:00:00Z',
    lastDeliveryAt: '2026-02-07T09:30:00Z',
    failureCount: 0,
  },
]

const INITIAL_DELIVERIES: WebhookDelivery[] = [
  {
    id: 'del_1',
    webhookId: 'wh_1',
    event: WebhookEvent.DocumentCreated as typeof WebhookEvent.DocumentCreated,
    payload: '{"event":"document.created","data":{"id":"doc_abc","name":"Contract.pdf","created_at":"2026-02-08T10:15:00Z"}}',
    statusCode: 200,
    responseBody: '{"received":true}',
    deliveredAt: '2026-02-08T10:15:00Z',
    success: true,
  },
  {
    id: 'del_2',
    webhookId: 'wh_1',
    event: WebhookEvent.DocumentSigned as typeof WebhookEvent.DocumentSigned,
    payload: '{"event":"document.signed","data":{"id":"doc_abc","signer":"sig_123"}}',
    statusCode: 200,
    responseBody: '{"received":true}',
    deliveredAt: '2026-02-08T10:20:00Z',
    success: true,
  },
  {
    id: 'del_3',
    webhookId: 'wh_1',
    event: WebhookEvent.DocumentCompleted as typeof WebhookEvent.DocumentCompleted,
    payload: '{"event":"document.completed","data":{"id":"doc_abc"}}',
    statusCode: 500,
    responseBody: '{"error":"Internal server error"}',
    deliveredAt: '2026-02-08T10:25:00Z',
    success: false,
  },
  {
    id: 'del_4',
    webhookId: 'wh_2',
    event: WebhookEvent.BookingCreated as typeof WebhookEvent.BookingCreated,
    payload: '{"event":"booking.created","data":{"id":"bk_001","event_type":"consultation"}}',
    statusCode: 200,
    responseBody: '{"ok":true}',
    deliveredAt: '2026-02-07T09:30:00Z',
    success: true,
  },
]

export interface DeveloperState {
  apiKeys: ApiKey[]
  webhooks: WebhookEndpoint[]
  deliveries: WebhookDelivery[]

  createApiKey: (name: string, permissions: ApiKeyPermission[], expiresAt?: string | null) => string
  revokeApiKey: (id: string) => void
  deleteApiKey: (id: string) => void
  createWebhook: (url: string, description: string, events: WebhookEvent[]) => void
  updateWebhook: (id: string, updates: Partial<Pick<WebhookEndpoint, 'url' | 'description' | 'events'>>) => void
  deleteWebhook: (id: string) => void
  toggleWebhook: (id: string) => void
  testWebhook: (id: string) => void
  getDeliveries: (webhookId: string) => WebhookDelivery[]
}

const useDeveloperStore = create<DeveloperState>()(
  persist(
    (set, get) => ({
      apiKeys: INITIAL_API_KEYS,
      webhooks: INITIAL_WEBHOOKS,
      deliveries: INITIAL_DELIVERIES,

      createApiKey: (name, permissions, expiresAt = null) => {
        const fullKey = generateApiKey()
        const newKey: ApiKey = {
          id: generateId(),
          name,
          keyPrefix: fullKey.slice(0, 10),
          keyHash: hashKey(fullKey),
          permissions,
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
          expiresAt: expiresAt ?? null,
          status: 'active',
        }
        set(state => ({ apiKeys: [...state.apiKeys, newKey] }))
        return fullKey
      },

      revokeApiKey: (id) => {
        set(state => ({
          apiKeys: state.apiKeys.map(k =>
            k.id === id ? { ...k, status: 'revoked' as const } : k
          ),
        }))
      },

      deleteApiKey: (id) => {
        set(state => ({ apiKeys: state.apiKeys.filter(k => k.id !== id) }))
      },

      createWebhook: (url, description, events) => {
        const newWebhook: WebhookEndpoint = {
          id: generateId(),
          url,
          description,
          events,
          secret: generateWebhookSecret(),
          status: 'active',
          createdAt: new Date().toISOString(),
          lastDeliveryAt: null,
          failureCount: 0,
        }
        set(state => ({ webhooks: [...state.webhooks, newWebhook] }))
      },

      updateWebhook: (id, updates) => {
        set(state => ({
          webhooks: state.webhooks.map(wh =>
            wh.id === id ? { ...wh, ...updates } : wh
          ),
        }))
      },

      deleteWebhook: (id) => {
        set(state => ({
          webhooks: state.webhooks.filter(wh => wh.id !== id),
          deliveries: state.deliveries.filter(d => d.webhookId !== id),
        }))
      },

      toggleWebhook: (id) => {
        set(state => ({
          webhooks: state.webhooks.map(wh =>
            wh.id === id
              ? { ...wh, status: (wh.status === 'active' ? 'disabled' : 'active') as 'active' | 'disabled' }
              : wh
          ),
        }))
      },

      testWebhook: (id) => {
        const { webhooks } = get()
        const webhook = webhooks.find(wh => wh.id === id)
        if (!webhook) return

        const testEvent = webhook.events[0] ?? WebhookEvent.DocumentCreated
        const success = Math.random() > 0.3
        const timestamp = new Date().toISOString()
        const newDelivery: WebhookDelivery = {
          id: generateId(),
          webhookId: id,
          event: testEvent,
          payload: JSON.stringify({
            event: testEvent,
            data: { test: true, timestamp },
          }),
          statusCode: success ? 200 : 500,
          responseBody: success
            ? '{"received":true}'
            : '{"error":"Connection timeout"}',
          deliveredAt: timestamp,
          success,
        }
        set(state => ({
          deliveries: [newDelivery, ...state.deliveries],
          webhooks: state.webhooks.map(wh =>
            wh.id === id
              ? {
                  ...wh,
                  lastDeliveryAt: timestamp,
                  failureCount: success ? wh.failureCount : wh.failureCount + 1,
                }
              : wh
          ),
        }))
      },

      getDeliveries: (webhookId) => {
        return get().deliveries
          .filter(d => d.webhookId === webhookId)
          .sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime())
      },
    }),
    {
      name: 'orchestree-developer-storage',
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        webhooks: state.webhooks,
        deliveries: state.deliveries,
      }),
    }
  )
)

export default useDeveloperStore
