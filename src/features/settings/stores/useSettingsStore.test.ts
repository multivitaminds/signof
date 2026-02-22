import { useSettingsStore } from './useSettingsStore'

describe('useSettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      workspace: {
        name: 'OriginA Workspace',
        slug: 'origina-workspace',
        logo: null,
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      notifications: {
        emailDigest: true,
        mentionAlerts: true,
        signatureRequests: true,
        weeklyReport: false,
        desktopNotifications: true,
      },
      integrations: [
        { id: 'int-1', name: 'Slack', icon: '💬', description: 'Slack integration', connected: true, connectedAt: '2024-02-01T00:00:00Z' },
        { id: 'int-2', name: 'Google Drive', icon: '📁', description: 'Drive integration', connected: false, connectedAt: null },
        { id: 'int-3', name: 'GitHub', icon: '🐙', description: 'GitHub integration', connected: true, connectedAt: '2024-03-15T00:00:00Z' },
      ],
    })
  })

  describe('initial state', () => {
    it('has default workspace settings', () => {
      const { workspace } = useSettingsStore.getState()
      expect(workspace.name).toBe('OriginA Workspace')
      expect(workspace.slug).toBe('origina-workspace')
      expect(workspace.logo).toBeNull()
      expect(workspace.language).toBe('en')
      expect(workspace.dateFormat).toBe('MM/DD/YYYY')
    })

    it('has default notification preferences', () => {
      const { notifications } = useSettingsStore.getState()
      expect(notifications.emailDigest).toBe(true)
      expect(notifications.mentionAlerts).toBe(true)
      expect(notifications.signatureRequests).toBe(true)
      expect(notifications.weeklyReport).toBe(false)
      expect(notifications.desktopNotifications).toBe(true)
    })

    it('has sample integrations', () => {
      const { integrations } = useSettingsStore.getState()
      expect(integrations).toHaveLength(3)
      expect(integrations[0]!.name).toBe('Slack')
      expect(integrations[0]!.connected).toBe(true)
      expect(integrations[1]!.connected).toBe(false)
    })
  })

  describe('updateWorkspace', () => {
    it('updates workspace name', () => {
      useSettingsStore.getState().updateWorkspace({ name: 'My Company' })
      expect(useSettingsStore.getState().workspace.name).toBe('My Company')
    })

    it('updates multiple workspace fields at once', () => {
      useSettingsStore.getState().updateWorkspace({
        name: 'Acme Corp',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
      })
      const { workspace } = useSettingsStore.getState()
      expect(workspace.name).toBe('Acme Corp')
      expect(workspace.language).toBe('es')
      expect(workspace.dateFormat).toBe('DD/MM/YYYY')
    })

    it('preserves unupdated workspace fields', () => {
      useSettingsStore.getState().updateWorkspace({ name: 'New Name' })
      const { workspace } = useSettingsStore.getState()
      expect(workspace.slug).toBe('origina-workspace')
      expect(workspace.language).toBe('en')
    })
  })

  describe('updateNotifications', () => {
    it('toggles a notification preference', () => {
      useSettingsStore.getState().updateNotifications({ weeklyReport: true })
      expect(useSettingsStore.getState().notifications.weeklyReport).toBe(true)
    })

    it('updates multiple notification prefs', () => {
      useSettingsStore.getState().updateNotifications({
        emailDigest: false,
        desktopNotifications: false,
      })
      const { notifications } = useSettingsStore.getState()
      expect(notifications.emailDigest).toBe(false)
      expect(notifications.desktopNotifications).toBe(false)
    })

    it('preserves unupdated notification fields', () => {
      useSettingsStore.getState().updateNotifications({ weeklyReport: true })
      const { notifications } = useSettingsStore.getState()
      expect(notifications.emailDigest).toBe(true)
      expect(notifications.mentionAlerts).toBe(true)
    })
  })

  describe('toggleIntegration', () => {
    it('disconnects a connected integration', () => {
      useSettingsStore.getState().toggleIntegration('int-1')
      const slack = useSettingsStore.getState().integrations.find((i) => i.id === 'int-1')!
      expect(slack.connected).toBe(false)
      expect(slack.connectedAt).toBeNull()
    })

    it('connects a disconnected integration', () => {
      useSettingsStore.getState().toggleIntegration('int-2')
      const drive = useSettingsStore.getState().integrations.find((i) => i.id === 'int-2')!
      expect(drive.connected).toBe(true)
      expect(drive.connectedAt).toBeTruthy()
    })

    it('does not affect other integrations', () => {
      useSettingsStore.getState().toggleIntegration('int-1')
      const github = useSettingsStore.getState().integrations.find((i) => i.id === 'int-3')!
      expect(github.connected).toBe(true)
    })
  })
})
