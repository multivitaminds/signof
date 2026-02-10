import { useIntegrationsStore } from './useIntegrationsStore'

describe('useIntegrationsStore', () => {
  beforeEach(() => {
    // Reset to default state
    useIntegrationsStore.setState({
      integrations: [
        { id: 'google-calendar', name: 'Google Calendar', icon: '\uD83D\uDCC5', description: 'Sync availability', connected: false, connectedAt: null },
        { id: 'slack', name: 'Slack', icon: '\uD83D\uDCAC', description: 'Notifications', connected: false, connectedAt: null },
        { id: 'github', name: 'GitHub', icon: '\uD83D\uDC19', description: 'Link issues', connected: false, connectedAt: null },
        { id: 'stripe', name: 'Stripe', icon: '\uD83D\uDCB3', description: 'Payments', connected: false, connectedAt: null },
        { id: 'zapier', name: 'Zapier', icon: '\u26A1', description: 'Automate', connected: false, connectedAt: null },
        { id: 'google-drive', name: 'Google Drive', icon: '\uD83D\uDCC1', description: 'Documents', connected: false, connectedAt: null },
      ],
    })
  })

  it('has 6 default integrations', () => {
    const { integrations } = useIntegrationsStore.getState()
    expect(integrations.length).toBe(6)
  })

  it('all integrations start disconnected', () => {
    const { integrations } = useIntegrationsStore.getState()
    integrations.forEach((integration) => {
      expect(integration.connected).toBe(false)
      expect(integration.connectedAt).toBeNull()
    })
  })

  it('connectIntegration sets connected to true and adds timestamp', () => {
    useIntegrationsStore.getState().connectIntegration('slack')
    const slack = useIntegrationsStore.getState().integrations.find((i) => i.id === 'slack')
    expect(slack?.connected).toBe(true)
    expect(slack?.connectedAt).not.toBeNull()
  })

  it('connectIntegration only affects the specified integration', () => {
    useIntegrationsStore.getState().connectIntegration('slack')
    const { integrations } = useIntegrationsStore.getState()
    const others = integrations.filter((i) => i.id !== 'slack')
    others.forEach((integration) => {
      expect(integration.connected).toBe(false)
    })
  })

  it('disconnectIntegration sets connected to false and clears timestamp', () => {
    useIntegrationsStore.getState().connectIntegration('github')
    expect(useIntegrationsStore.getState().integrations.find((i) => i.id === 'github')?.connected).toBe(true)

    useIntegrationsStore.getState().disconnectIntegration('github')
    const github = useIntegrationsStore.getState().integrations.find((i) => i.id === 'github')
    expect(github?.connected).toBe(false)
    expect(github?.connectedAt).toBeNull()
  })

  it('can connect and disconnect multiple integrations', () => {
    useIntegrationsStore.getState().connectIntegration('slack')
    useIntegrationsStore.getState().connectIntegration('stripe')

    const { integrations } = useIntegrationsStore.getState()
    expect(integrations.filter((i) => i.connected).length).toBe(2)

    useIntegrationsStore.getState().disconnectIntegration('slack')
    const updated = useIntegrationsStore.getState().integrations
    expect(updated.filter((i) => i.connected).length).toBe(1)
  })
})
