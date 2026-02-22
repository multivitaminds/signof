import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface IntegrationConfig {
  id: string
  name: string
  icon: string
  description: string
  connected: boolean
  connectedAt: string | null
}

interface IntegrationsState {
  integrations: IntegrationConfig[]

  connectIntegration: (id: string) => void
  disconnectIntegration: (id: string) => void
}

const DEFAULT_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    icon: '\uD83D\uDCC5',
    description: 'Sync your scheduling availability and bookings with Google Calendar.',
    connected: false,
    connectedAt: null,
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '\uD83D\uDCAC',
    description: 'Receive real-time notifications and updates in your Slack channels.',
    connected: false,
    connectedAt: null,
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '\uD83D\uDC19',
    description: 'Link issues and pull requests to your OriginA projects.',
    connected: false,
    connectedAt: null,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '\uD83D\uDCB3',
    description: 'Accept payments and manage billing through Stripe integration.',
    connected: false,
    connectedAt: null,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    icon: '\u26A1',
    description: 'Automate workflows by connecting OriginA with 5,000+ apps.',
    connected: false,
    connectedAt: null,
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: '\uD83D\uDCC1',
    description: 'Import and store documents directly from Google Drive.',
    connected: false,
    connectedAt: null,
  },
]

export const useIntegrationsStore = create<IntegrationsState>()(
  persist(
    (set) => ({
      integrations: DEFAULT_INTEGRATIONS,

      connectIntegration: (id) => {
        set((state) => ({
          integrations: state.integrations.map((integration) =>
            integration.id === id
              ? { ...integration, connected: true, connectedAt: new Date().toISOString() }
              : integration
          ),
        }))
      },

      disconnectIntegration: (id) => {
        set((state) => ({
          integrations: state.integrations.map((integration) =>
            integration.id === id
              ? { ...integration, connected: false, connectedAt: null }
              : integration
          ),
        }))
      },
    }),
    { name: 'origina-integrations-storage' }
  )
)
