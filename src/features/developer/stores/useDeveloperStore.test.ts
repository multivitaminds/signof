import useDeveloperStore from './useDeveloperStore'
import { ApiKeyPermission, WebhookEvent } from '../types'

function resetStore() {
  useDeveloperStore.setState({
    apiKeys: [],
    webhooks: [],
    deliveries: [],
  })
}

describe('useDeveloperStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('API Keys', () => {
    it('creates an API key and returns the full key', () => {
      const fullKey = useDeveloperStore.getState().createApiKey(
        'Test Key',
        [ApiKeyPermission.Read],
        null
      )

      expect(fullKey).toMatch(/^sk_live_/)
      expect(fullKey.length).toBeGreaterThan(10)

      const { apiKeys } = useDeveloperStore.getState()
      expect(apiKeys).toHaveLength(1)

      const key = apiKeys[0]!
      expect(key.name).toBe('Test Key')
      expect(key.status).toBe('active')
      expect(key.permissions).toEqual([ApiKeyPermission.Read])
      expect(key.keyPrefix).toBe(fullKey.slice(0, 10))
    })

    it('creates a key with expiration date', () => {
      const expiry = new Date('2026-12-31T00:00:00Z').toISOString()
      useDeveloperStore.getState().createApiKey(
        'Expiring Key',
        [ApiKeyPermission.Write],
        expiry
      )

      const { apiKeys } = useDeveloperStore.getState()
      expect(apiKeys[0]!.expiresAt).toBe(expiry)
    })

    it('revokes an API key', () => {
      useDeveloperStore.getState().createApiKey(
        'Key to Revoke',
        [ApiKeyPermission.Read],
        null
      )

      const keyId = useDeveloperStore.getState().apiKeys[0]!.id
      useDeveloperStore.getState().revokeApiKey(keyId)

      const { apiKeys } = useDeveloperStore.getState()
      expect(apiKeys[0]!.status).toBe('revoked')
    })

    it('deletes an API key', () => {
      useDeveloperStore.getState().createApiKey(
        'Key to Delete',
        [ApiKeyPermission.Admin],
        null
      )

      const keyId = useDeveloperStore.getState().apiKeys[0]!.id
      useDeveloperStore.getState().deleteApiKey(keyId)

      expect(useDeveloperStore.getState().apiKeys).toHaveLength(0)
    })
  })

  describe('Webhooks', () => {
    it('creates a webhook', () => {
      useDeveloperStore.getState().createWebhook(
        'https://example.com/webhook',
        'Test webhook',
        [WebhookEvent.DocumentCreated]
      )

      const { webhooks } = useDeveloperStore.getState()
      expect(webhooks).toHaveLength(1)

      const wh = webhooks[0]!
      expect(wh.url).toBe('https://example.com/webhook')
      expect(wh.description).toBe('Test webhook')
      expect(wh.events).toEqual([WebhookEvent.DocumentCreated])
      expect(wh.status).toBe('active')
      expect(wh.secret).toMatch(/^whsec_/)
      expect(wh.failureCount).toBe(0)
    })

    it('updates a webhook', () => {
      useDeveloperStore.getState().createWebhook(
        'https://example.com/webhook',
        'Original',
        [WebhookEvent.DocumentCreated]
      )

      const whId = useDeveloperStore.getState().webhooks[0]!.id
      useDeveloperStore.getState().updateWebhook(whId, {
        url: 'https://updated.com/webhook',
        description: 'Updated',
      })

      const { webhooks } = useDeveloperStore.getState()
      expect(webhooks[0]!.url).toBe('https://updated.com/webhook')
      expect(webhooks[0]!.description).toBe('Updated')
    })

    it('toggles a webhook between active and disabled', () => {
      useDeveloperStore.getState().createWebhook(
        'https://example.com/webhook',
        'Toggle test',
        [WebhookEvent.BookingCreated]
      )

      const whId = useDeveloperStore.getState().webhooks[0]!.id
      expect(useDeveloperStore.getState().webhooks[0]!.status).toBe('active')

      useDeveloperStore.getState().toggleWebhook(whId)
      expect(useDeveloperStore.getState().webhooks[0]!.status).toBe('disabled')

      useDeveloperStore.getState().toggleWebhook(whId)
      expect(useDeveloperStore.getState().webhooks[0]!.status).toBe('active')
    })

    it('deletes a webhook and its deliveries', () => {
      useDeveloperStore.getState().createWebhook(
        'https://example.com/webhook',
        'Delete test',
        [WebhookEvent.DocumentCreated]
      )

      const whId = useDeveloperStore.getState().webhooks[0]!.id

      // Trigger a test delivery first
      useDeveloperStore.getState().testWebhook(whId)
      expect(useDeveloperStore.getState().deliveries.length).toBeGreaterThan(0)

      useDeveloperStore.getState().deleteWebhook(whId)
      expect(useDeveloperStore.getState().webhooks).toHaveLength(0)
      expect(useDeveloperStore.getState().deliveries.filter(d => d.webhookId === whId)).toHaveLength(0)
    })

    it('tests a webhook and adds a delivery', () => {
      useDeveloperStore.getState().createWebhook(
        'https://example.com/webhook',
        'Test delivery',
        [WebhookEvent.DocumentSigned]
      )

      const whId = useDeveloperStore.getState().webhooks[0]!.id
      useDeveloperStore.getState().testWebhook(whId)

      const { deliveries } = useDeveloperStore.getState()
      expect(deliveries).toHaveLength(1)

      const del = deliveries[0]!
      expect(del.webhookId).toBe(whId)
      expect(del.event).toBe(WebhookEvent.DocumentSigned)
      expect(typeof del.success).toBe('boolean')
      expect([200, 500]).toContain(del.statusCode)
    })

    it('returns deliveries for a specific webhook sorted by date', () => {
      useDeveloperStore.getState().createWebhook(
        'https://example.com/webhook',
        'Delivery test',
        [WebhookEvent.DocumentCreated]
      )

      const whId = useDeveloperStore.getState().webhooks[0]!.id

      // Create multiple deliveries
      useDeveloperStore.getState().testWebhook(whId)
      useDeveloperStore.getState().testWebhook(whId)
      useDeveloperStore.getState().testWebhook(whId)

      const deliveries = useDeveloperStore.getState().getDeliveries(whId)
      expect(deliveries).toHaveLength(3)

      // Verify sorted by date descending
      for (let i = 0; i < deliveries.length - 1; i++) {
        expect(new Date(deliveries[i]!.deliveredAt).getTime())
          .toBeGreaterThanOrEqual(new Date(deliveries[i + 1]!.deliveredAt).getTime())
      }
    })
  })
})
