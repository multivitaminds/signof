import { useNotificationPrefsStore } from './useNotificationPrefsStore'

describe('useNotificationPrefsStore', () => {
  beforeEach(() => {
    // Reset to default state
    useNotificationPrefsStore.setState({
      prefs: {
        documents: {
          newDocument: { inApp: true, email: true },
          signatureRequest: { inApp: true, email: true },
          documentCompleted: { inApp: true, email: true },
          documentExpired: { inApp: true, email: false },
        },
        projects: {
          issueAssigned: { inApp: true, email: true },
          statusChanged: { inApp: true, email: false },
          commentMention: { inApp: true, email: true },
          cycleCompleted: { inApp: true, email: false },
        },
        scheduling: {
          newBooking: { inApp: true, email: true },
          bookingCancelled: { inApp: true, email: true },
          bookingReminder: { inApp: true, email: false },
        },
        workspace: {
          pageShared: { inApp: true, email: false },
          commentOnPage: { inApp: true, email: false },
          teamInvite: { inApp: true, email: true },
        },
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
        },
      },
    })
  })

  it('has correct default notification preferences', () => {
    const { prefs } = useNotificationPrefsStore.getState()
    expect(prefs.documents.newDocument.inApp).toBe(true)
    expect(prefs.documents.newDocument.email).toBe(true)
    expect(prefs.documents.documentExpired.email).toBe(false)
  })

  it('toggles in-app notification for a specific setting', () => {
    useNotificationPrefsStore.getState().toggleNotification('documents', 'newDocument', 'inApp')
    const { prefs } = useNotificationPrefsStore.getState()
    expect(prefs.documents.newDocument.inApp).toBe(false)
    expect(prefs.documents.newDocument.email).toBe(true) // unchanged
  })

  it('toggles email notification for a specific setting', () => {
    useNotificationPrefsStore.getState().toggleNotification('documents', 'documentExpired', 'email')
    const { prefs } = useNotificationPrefsStore.getState()
    expect(prefs.documents.documentExpired.email).toBe(true) // was false
    expect(prefs.documents.documentExpired.inApp).toBe(true) // unchanged
  })

  it('toggles project notifications correctly', () => {
    useNotificationPrefsStore.getState().toggleNotification('projects', 'statusChanged', 'email')
    const { prefs } = useNotificationPrefsStore.getState()
    expect(prefs.projects.statusChanged.email).toBe(true) // was false
  })

  it('toggles scheduling notifications correctly', () => {
    useNotificationPrefsStore.getState().toggleNotification('scheduling', 'bookingReminder', 'email')
    const { prefs } = useNotificationPrefsStore.getState()
    expect(prefs.scheduling.bookingReminder.email).toBe(true) // was false
  })

  it('toggles workspace notifications correctly', () => {
    useNotificationPrefsStore.getState().toggleNotification('workspace', 'pageShared', 'email')
    const { prefs } = useNotificationPrefsStore.getState()
    expect(prefs.workspace.pageShared.email).toBe(true) // was false
  })

  it('does not mutate other categories when toggling', () => {
    const before = useNotificationPrefsStore.getState().prefs.projects.issueAssigned
    useNotificationPrefsStore.getState().toggleNotification('documents', 'newDocument', 'inApp')
    const after = useNotificationPrefsStore.getState().prefs.projects.issueAssigned
    expect(after).toEqual(before)
  })

  it('updateQuietHours enables quiet hours', () => {
    useNotificationPrefsStore.getState().updateQuietHours({ enabled: true })
    const { prefs } = useNotificationPrefsStore.getState()
    expect(prefs.quietHours.enabled).toBe(true)
    expect(prefs.quietHours.startTime).toBe('22:00') // unchanged
    expect(prefs.quietHours.endTime).toBe('08:00') // unchanged
  })

  it('updateQuietHours changes start time', () => {
    useNotificationPrefsStore.getState().updateQuietHours({ startTime: '23:00' })
    const { prefs } = useNotificationPrefsStore.getState()
    expect(prefs.quietHours.startTime).toBe('23:00')
  })

  it('updateQuietHours changes end time', () => {
    useNotificationPrefsStore.getState().updateQuietHours({ endTime: '07:00' })
    const { prefs } = useNotificationPrefsStore.getState()
    expect(prefs.quietHours.endTime).toBe('07:00')
  })

  it('handles non-existent setting gracefully', () => {
    // Should not throw
    useNotificationPrefsStore.getState().toggleNotification('documents', 'nonExistentSetting', 'inApp')
    const { prefs } = useNotificationPrefsStore.getState()
    // State should remain unchanged
    expect(prefs.documents.newDocument.inApp).toBe(true)
  })
})
