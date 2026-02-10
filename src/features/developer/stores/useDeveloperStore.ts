import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Environment, WebhookEvent } from '../types'
import type { ApiKey, Webhook, WebhookLog } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function generateApiKey(env: 'live' | 'test'): string {
  const prefix = env === 'live' ? 'sk_live_' : 'sk_test_'
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return prefix + result
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
    key: 'sk_live_a1B2c3D4e5F6g7H8i9J0kLmNoPqRsTuV',
    environment: Environment.Live as typeof Environment.Live,
    createdAt: '2025-11-15T10:30:00Z',
    lastUsedAt: '2025-12-20T14:22:00Z',
  },
  {
    id: 'key_2',
    name: 'Test Environment Key',
    key: 'sk_test_xY1z2A3b4C5d6E7f8G9h0IjKlMnOpQrS',
    environment: Environment.Test as typeof Environment.Test,
    createdAt: '2025-12-01T09:00:00Z',
    lastUsedAt: '2025-12-22T11:45:00Z',
  },
]

const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: 'wh_1',
    url: 'https://api.example.com/webhooks/signof',
    events: [
      WebhookEvent.DocumentCreated as typeof WebhookEvent.DocumentCreated,
      WebhookEvent.DocumentCompleted as typeof WebhookEvent.DocumentCompleted,
      WebhookEvent.SignerCompleted as typeof WebhookEvent.SignerCompleted,
    ],
    secret: 'whsec_t3s7s3cr3tk3yv4lu3h3r3',
    active: true,
    failureCount: 0,
    createdAt: '2025-11-20T08:00:00Z',
    updatedAt: '2025-12-18T16:30:00Z',
  },
]

const INITIAL_WEBHOOK_LOGS: WebhookLog[] = [
  {
    id: 'log_1',
    webhookId: 'wh_1',
    event: WebhookEvent.DocumentCreated as typeof WebhookEvent.DocumentCreated,
    statusCode: 200,
    success: true,
    timestamp: '2025-12-22T10:15:00Z',
    requestBody: '{"event":"document.created","data":{"id":"doc_abc","name":"Contract.pdf"}}',
    responseBody: '{"received":true}',
  },
  {
    id: 'log_2',
    webhookId: 'wh_1',
    event: WebhookEvent.SignerCompleted as typeof WebhookEvent.SignerCompleted,
    statusCode: 200,
    success: true,
    timestamp: '2025-12-22T10:20:00Z',
    requestBody: '{"event":"signer.completed","data":{"signerId":"sig_123","documentId":"doc_abc"}}',
    responseBody: '{"received":true}',
  },
  {
    id: 'log_3',
    webhookId: 'wh_1',
    event: WebhookEvent.DocumentCompleted as typeof WebhookEvent.DocumentCompleted,
    statusCode: 500,
    success: false,
    timestamp: '2025-12-22T10:25:00Z',
    requestBody: '{"event":"document.completed","data":{"id":"doc_abc"}}',
    responseBody: '{"error":"Internal server error"}',
  },
  {
    id: 'log_4',
    webhookId: 'wh_1',
    event: WebhookEvent.DocumentCreated as typeof WebhookEvent.DocumentCreated,
    statusCode: 200,
    success: true,
    timestamp: '2025-12-21T15:40:00Z',
    requestBody: '{"event":"document.created","data":{"id":"doc_def","name":"NDA.pdf"}}',
    responseBody: '{"received":true}',
  },
]

export interface DeveloperState {
  apiKeys: ApiKey[]
  webhooks: Webhook[]
  webhookLogs: WebhookLog[]
  selectedEnvironment: Environment

  createApiKey: (name: string, environment: Environment) => void
  deleteApiKey: (id: string) => void
  rollApiKey: (id: string) => void
  createWebhook: (url: string, events: WebhookEvent[]) => void
  updateWebhook: (id: string, updates: Partial<Pick<Webhook, 'url' | 'events' | 'active'>>) => void
  deleteWebhook: (id: string) => void
  testWebhook: (id: string) => void
  setEnvironment: (env: Environment) => void
}

const useDeveloperStore = create<DeveloperState>()(
  persist(
    (set, get) => ({
      apiKeys: INITIAL_API_KEYS,
      webhooks: INITIAL_WEBHOOKS,
      webhookLogs: INITIAL_WEBHOOK_LOGS,
      selectedEnvironment: Environment.Test as typeof Environment.Test,

      createApiKey: (name, environment) => {
        const newKey: ApiKey = {
          id: generateId(),
          name,
          key: generateApiKey(environment),
          environment,
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
        }
        set(state => ({ apiKeys: [...state.apiKeys, newKey] }))
      },

      deleteApiKey: (id) => {
        set(state => ({ apiKeys: state.apiKeys.filter(k => k.id !== id) }))
      },

      rollApiKey: (id) => {
        set(state => ({
          apiKeys: state.apiKeys.map(k =>
            k.id === id
              ? { ...k, key: generateApiKey(k.environment), lastUsedAt: null }
              : k
          ),
        }))
      },

      createWebhook: (url, events) => {
        const newWebhook: Webhook = {
          id: generateId(),
          url,
          events,
          secret: generateWebhookSecret(),
          active: true,
          failureCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set(state => ({ webhooks: [...state.webhooks, newWebhook] }))
      },

      updateWebhook: (id, updates) => {
        set(state => ({
          webhooks: state.webhooks.map(wh =>
            wh.id === id
              ? { ...wh, ...updates, updatedAt: new Date().toISOString() }
              : wh
          ),
        }))
      },

      deleteWebhook: (id) => {
        set(state => ({
          webhooks: state.webhooks.filter(wh => wh.id !== id),
          webhookLogs: state.webhookLogs.filter(log => log.webhookId !== id),
        }))
      },

      testWebhook: (id) => {
        const { webhooks } = get()
        const webhook = webhooks.find(wh => wh.id === id)
        if (!webhook) return

        const testEvent = webhook.events[0] ?? WebhookEvent.DocumentCreated
        const success = Math.random() > 0.2
        const newLog: WebhookLog = {
          id: generateId(),
          webhookId: id,
          event: testEvent,
          statusCode: success ? 200 : 500,
          success,
          timestamp: new Date().toISOString(),
          requestBody: JSON.stringify({
            event: testEvent,
            data: { test: true, timestamp: new Date().toISOString() },
          }),
          responseBody: success
            ? '{"received":true}'
            : '{"error":"Connection timeout"}',
        }
        set(state => ({
          webhookLogs: [newLog, ...state.webhookLogs],
          webhooks: state.webhooks.map(wh =>
            wh.id === id
              ? { ...wh, failureCount: success ? wh.failureCount : wh.failureCount + 1 }
              : wh
          ),
        }))
      },

      setEnvironment: (env) => {
        set({ selectedEnvironment: env })
      },
    }),
    {
      name: 'signof-developer-storage',
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        webhooks: state.webhooks,
        webhookLogs: state.webhookLogs,
        selectedEnvironment: state.selectedEnvironment,
      }),
    }
  )
)

export default useDeveloperStore
