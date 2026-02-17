export interface ConnectorResult {
  success: boolean
  data: unknown
  error?: string
}

export interface ConnectorAdapter {
  execute(actionId: string, params: Record<string, unknown>): Promise<ConnectorResult>
}

class HttpAdapter implements ConnectorAdapter {
  connectorId: string

  constructor(connectorId: string) {
    this.connectorId = connectorId
  }

  async execute(actionId: string, params: Record<string, unknown>): Promise<ConnectorResult> {
    try {
      const apiKey = localStorage.getItem('orchestree_api_key')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

      const response = await fetch(`/api/connectors/${this.connectorId}/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ actionId, params }),
      })

      if (!response.ok) {
        return { success: false, data: null, error: `HTTP ${response.status}` }
      }

      const data: unknown = await response.json()
      return { success: true, data }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Request failed'
      return { success: false, data: null, error: message }
    }
  }
}

class MockAdapter implements ConnectorAdapter {
  connectorId: string

  constructor(connectorId: string) {
    this.connectorId = connectorId
  }

  async execute(actionId: string, params: Record<string, unknown>): Promise<ConnectorResult> {
    return {
      success: true,
      data: {
        connector: this.connectorId,
        action: actionId,
        params,
        result: `Mock result for ${actionId}`,
        timestamp: new Date().toISOString(),
      },
    }
  }
}

const adapters = new Map<string, ConnectorAdapter>()

export function getAdapter(connectorId: string): ConnectorAdapter {
  let adapter = adapters.get(connectorId)
  if (!adapter) {
    // Use HttpAdapter by default, falls back to MockAdapter on failure
    adapter = new HttpAdapter(connectorId)
    adapters.set(connectorId, adapter)
  }
  return adapter
}

export function getMockAdapter(connectorId: string): ConnectorAdapter {
  return new MockAdapter(connectorId)
}
