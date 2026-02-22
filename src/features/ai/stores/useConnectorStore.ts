import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ConnectorDefinition } from '../types'

const INITIAL_CONNECTORS: ConnectorDefinition[] = [
  {
    id: 'gmail', name: 'Gmail', category: 'communication', icon: 'mail',
    description: 'Send and receive emails via Gmail', authType: 'oauth2', status: 'disconnected',
    actions: [
      { id: 'gmail-send', name: 'Send Email', description: 'Send an email', inputSchema: { to: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' } }, outputSchema: { messageId: { type: 'string' } } },
      { id: 'gmail-read', name: 'Read Emails', description: 'Read recent emails', inputSchema: { limit: { type: 'number' } }, outputSchema: { emails: { type: 'array' } } },
    ],
  },
  {
    id: 'google-calendar', name: 'Google Calendar', category: 'scheduling', icon: 'calendar',
    description: 'Manage Google Calendar events', authType: 'oauth2', status: 'disconnected',
    actions: [
      { id: 'gcal-create', name: 'Create Event', description: 'Create a calendar event', inputSchema: { title: { type: 'string' }, start: { type: 'string' }, end: { type: 'string' } }, outputSchema: { eventId: { type: 'string' } } },
      { id: 'gcal-list', name: 'List Events', description: 'List upcoming events', inputSchema: { days: { type: 'number' } }, outputSchema: { events: { type: 'array' } } },
    ],
  },
  {
    id: 'google-drive', name: 'Google Drive', category: 'storage', icon: 'hard-drive',
    description: 'Manage files in Google Drive', authType: 'oauth2', status: 'disconnected',
    actions: [
      { id: 'gdrive-upload', name: 'Upload File', description: 'Upload a file', inputSchema: { name: { type: 'string' }, content: { type: 'string' } }, outputSchema: { fileId: { type: 'string' } } },
      { id: 'gdrive-search', name: 'Search Files', description: 'Search for files', inputSchema: { query: { type: 'string' } }, outputSchema: { files: { type: 'array' } } },
    ],
  },
  {
    id: 'slack', name: 'Slack', category: 'communication', icon: 'message-square',
    description: 'Send messages and manage Slack channels', authType: 'oauth2', status: 'disconnected',
    actions: [
      { id: 'slack-send', name: 'Send Message', description: 'Send a message to a channel', inputSchema: { channel: { type: 'string' }, text: { type: 'string' } }, outputSchema: { ts: { type: 'string' } } },
      { id: 'slack-list', name: 'List Channels', description: 'List available channels', inputSchema: {}, outputSchema: { channels: { type: 'array' } } },
    ],
  },
  {
    id: 'ms-teams', name: 'Microsoft Teams', category: 'communication', icon: 'users',
    description: 'Send messages and manage Teams channels', authType: 'oauth2', status: 'disconnected',
    actions: [
      { id: 'teams-send', name: 'Send Message', description: 'Send a message', inputSchema: { channel: { type: 'string' }, text: { type: 'string' } }, outputSchema: { id: { type: 'string' } } },
    ],
  },
  {
    id: 'stripe', name: 'Stripe', category: 'finance', icon: 'credit-card',
    description: 'Process payments and manage subscriptions', authType: 'api_key', status: 'disconnected',
    actions: [
      { id: 'stripe-charge', name: 'Create Charge', description: 'Create a payment charge', inputSchema: { amount: { type: 'number' }, currency: { type: 'string' } }, outputSchema: { chargeId: { type: 'string' } } },
      { id: 'stripe-customers', name: 'List Customers', description: 'List customers', inputSchema: { limit: { type: 'number' } }, outputSchema: { customers: { type: 'array' } } },
    ],
  },
  {
    id: 'quickbooks', name: 'QuickBooks', category: 'finance', icon: 'book-open',
    description: 'Manage accounting with QuickBooks', authType: 'oauth2', status: 'disconnected',
    actions: [
      { id: 'qb-invoice', name: 'Create Invoice', description: 'Create an invoice', inputSchema: { customer: { type: 'string' }, amount: { type: 'number' } }, outputSchema: { invoiceId: { type: 'string' } } },
    ],
  },
  {
    id: 'github', name: 'GitHub', category: 'development', icon: 'git-branch',
    description: 'Manage repositories and issues on GitHub', authType: 'oauth2', status: 'disconnected',
    actions: [
      { id: 'gh-issue', name: 'Create Issue', description: 'Create a GitHub issue', inputSchema: { repo: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' } }, outputSchema: { issueNumber: { type: 'number' } } },
      { id: 'gh-pr', name: 'Create Pull Request', description: 'Create a pull request', inputSchema: { repo: { type: 'string' }, title: { type: 'string' }, head: { type: 'string' }, base: { type: 'string' } }, outputSchema: { prNumber: { type: 'number' } } },
    ],
  },
  {
    id: 'jira', name: 'Jira', category: 'development', icon: 'clipboard-list',
    description: 'Manage Jira issues and projects', authType: 'api_key', status: 'disconnected',
    actions: [
      { id: 'jira-create', name: 'Create Issue', description: 'Create a Jira issue', inputSchema: { project: { type: 'string' }, summary: { type: 'string' }, type: { type: 'string' } }, outputSchema: { issueKey: { type: 'string' } } },
    ],
  },
  {
    id: 'salesforce', name: 'Salesforce', category: 'crm', icon: 'briefcase',
    description: 'Manage leads and opportunities in Salesforce', authType: 'oauth2', status: 'disconnected',
    actions: [
      { id: 'sf-lead', name: 'Create Lead', description: 'Create a new lead', inputSchema: { name: { type: 'string' }, email: { type: 'string' }, company: { type: 'string' } }, outputSchema: { leadId: { type: 'string' } } },
      { id: 'sf-opp', name: 'Create Opportunity', description: 'Create an opportunity', inputSchema: { name: { type: 'string' }, amount: { type: 'number' }, stage: { type: 'string' } }, outputSchema: { oppId: { type: 'string' } } },
    ],
  },
]

export interface ConnectorState {
  connectors: ConnectorDefinition[]

  getConnector: (id: string) => ConnectorDefinition | undefined
  getConnectorsByCategory: (category: string) => ConnectorDefinition[]
  getCategories: () => string[]
  setConnectorStatus: (id: string, status: ConnectorDefinition['status']) => void
  getConnectedConnectors: () => ConnectorDefinition[]
  mockExecute: (connectorId: string, actionId: string, params: Record<string, unknown>) => string
  execute: (connectorId: string, actionId: string, params: Record<string, unknown>) => Promise<string>
}

const useConnectorStore = create<ConnectorState>()(
  persist(
    (set, get) => ({
      connectors: INITIAL_CONNECTORS,

      getConnector: (id) => {
        return get().connectors.find((c) => c.id === id)
      },

      getConnectorsByCategory: (category) => {
        return get().connectors.filter((c) => c.category === category)
      },

      getCategories: () => {
        const cats = new Set(get().connectors.map((c) => c.category))
        return Array.from(cats)
      },

      setConnectorStatus: (id, status) => {
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id ? { ...c, status } : c,
          ),
        }))
      },

      getConnectedConnectors: () => {
        return get().connectors.filter((c) => c.status === 'connected')
      },

      mockExecute: (connectorId, actionId, params) => {
        const connector = get().connectors.find((c) => c.id === connectorId)
        if (!connector) {
          return JSON.stringify({ success: false, error: `Connector not found: ${connectorId}` })
        }
        const action = connector.actions.find((a) => a.id === actionId)
        if (!action) {
          return JSON.stringify({ success: false, error: `Action not found: ${actionId}` })
        }
        if (connector.status !== 'connected') {
          return JSON.stringify({ success: false, error: `Connector ${connector.name} is not connected` })
        }
        return JSON.stringify({
          success: true,
          connector: connector.name,
          action: action.name,
          params,
          result: `Mock result for ${action.name}`,
          timestamp: new Date().toISOString(),
        })
      },

      execute: async (connectorId, actionId, params) => {
        const connector = get().connectors.find((c) => c.id === connectorId)
        if (!connector) {
          return JSON.stringify({ success: false, error: `Connector not found: ${connectorId}` })
        }
        if (connector.status !== 'connected') {
          // Fall back to mock for disconnected connectors
          return get().mockExecute(connectorId, actionId, params)
        }

        try {
          const { getAdapter } = await import('../lib/connectorRuntime')
          const adapter = getAdapter(connectorId)
          const result = await adapter.execute(actionId, params)
          if (result.success) {
            return JSON.stringify(result.data)
          }
          // Fall back to mock on adapter failure
          return get().mockExecute(connectorId, actionId, params)
        } catch {
          return get().mockExecute(connectorId, actionId, params)
        }
      },
    }),
    {
      name: 'origina-connector-storage',
    },
  ),
)

export default useConnectorStore
