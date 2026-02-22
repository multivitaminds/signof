import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IntegrationsSettings from './IntegrationsSettings'

const mockConnectIntegration = vi.fn()
const mockDisconnectIntegration = vi.fn()

vi.mock('../stores/useIntegrationsStore', () => ({
  useIntegrationsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      integrations: [
        { id: 'google-calendar', name: 'Google Calendar', icon: '\uD83D\uDCC5', description: 'Sync your scheduling availability', connected: false, connectedAt: null },
        { id: 'slack', name: 'Slack', icon: '\uD83D\uDCAC', description: 'Receive real-time notifications', connected: true, connectedAt: '2026-01-15T00:00:00Z' },
        { id: 'github', name: 'GitHub', icon: '\uD83D\uDC19', description: 'Link issues and pull requests', connected: false, connectedAt: null },
        { id: 'stripe', name: 'Stripe', icon: '\uD83D\uDCB3', description: 'Accept payments', connected: false, connectedAt: null },
        { id: 'zapier', name: 'Zapier', icon: '\u26A1', description: 'Automate workflows', connected: false, connectedAt: null },
        { id: 'google-drive', name: 'Google Drive', icon: '\uD83D\uDCC1', description: 'Import and store documents', connected: false, connectedAt: null },
      ],
      connectIntegration: mockConnectIntegration,
      disconnectIntegration: mockDisconnectIntegration,
    }),
}))

describe('IntegrationsSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title and subtitle', () => {
    render(<IntegrationsSettings />)
    expect(screen.getByText('Integrations')).toBeInTheDocument()
    expect(screen.getByText('Connect your favorite tools to OriginA')).toBeInTheDocument()
  })

  it('renders all integration cards', () => {
    render(<IntegrationsSettings />)
    expect(screen.getByText('Google Calendar')).toBeInTheDocument()
    expect(screen.getByText('Slack')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Stripe')).toBeInTheDocument()
    expect(screen.getByText('Zapier')).toBeInTheDocument()
    expect(screen.getByText('Google Drive')).toBeInTheDocument()
  })

  it('shows Connected badge for connected integrations', () => {
    render(<IntegrationsSettings />)
    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText(/since Jan \d+, 2026/)).toBeInTheDocument()
  })

  it('shows Connect button for unconnected integrations', () => {
    render(<IntegrationsSettings />)
    // 5 unconnected integrations should have "Connect" buttons
    const connectButtons = screen.getAllByText('Connect')
    expect(connectButtons.length).toBe(5)
  })

  it('shows Disconnect button for connected integrations', () => {
    render(<IntegrationsSettings />)
    expect(screen.getByText('Disconnect')).toBeInTheDocument()
  })

  it('calls connectIntegration when Connect is clicked', async () => {
    const user = userEvent.setup()
    render(<IntegrationsSettings />)

    const connectButtons = screen.getAllByText('Connect')
    const firstConnect = connectButtons[0]
    if (firstConnect) {
      await user.click(firstConnect)
      expect(mockConnectIntegration).toHaveBeenCalledWith('google-calendar')
    }
  })

  it('calls disconnectIntegration when Disconnect is clicked', async () => {
    const user = userEvent.setup()
    render(<IntegrationsSettings />)

    await user.click(screen.getByText('Disconnect'))
    expect(mockDisconnectIntegration).toHaveBeenCalledWith('slack')
  })

  it('renders integration descriptions', () => {
    render(<IntegrationsSettings />)
    expect(screen.getByText('Sync your scheduling availability')).toBeInTheDocument()
    expect(screen.getByText('Automate workflows')).toBeInTheDocument()
  })
})
