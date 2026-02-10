import { useInboxStore } from './useInboxStore'
import { NotificationType, NotificationCategory } from '../types'

describe('useInboxStore', () => {
  beforeEach(() => {
    useInboxStore.setState({ notifications: [] })
  })

  it('starts with empty notifications after reset', () => {
    expect(useInboxStore.getState().notifications).toHaveLength(0)
  })

  it('adds a notification with category and action fields', () => {
    const store = useInboxStore.getState()
    store.addNotification(
      NotificationType.SignatureRequest,
      'Test Title',
      'Test Message',
      {
        actionUrl: '/documents',
        actionLabel: 'Sign Now',
        link: '/documents',
        actorName: 'Alice',
        sourceId: 'doc-123',
      }
    )

    const notifications = useInboxStore.getState().notifications
    expect(notifications).toHaveLength(1)
    const first = notifications[0]
    expect(first).toBeDefined()
    if (!first) return
    expect(first.title).toBe('Test Title')
    expect(first.message).toBe('Test Message')
    expect(first.type).toBe(NotificationType.SignatureRequest)
    expect(first.category).toBe(NotificationCategory.Documents)
    expect(first.read).toBe(false)
    expect(first.archived).toBe(false)
    expect(first.actionUrl).toBe('/documents')
    expect(first.actionLabel).toBe('Sign Now')
    expect(first.actorName).toBe('Alice')
    expect(first.sourceId).toBe('doc-123')
    expect(first.id).toBeTruthy()
    expect(first.createdAt).toBeTruthy()
  })

  it('auto-assigns category based on type via TYPE_TO_CATEGORY', () => {
    const store = useInboxStore.getState()
    store.addNotification(NotificationType.Comment, 'Comment', 'A comment')
    store.addNotification(NotificationType.Assignment, 'Task', 'A task')
    store.addNotification(NotificationType.Booking, 'Booking', 'A booking')
    store.addNotification(NotificationType.System, 'System', 'A system')

    const notifications = useInboxStore.getState().notifications
    expect(notifications[3]?.category).toBe(NotificationCategory.Workspace)
    expect(notifications[2]?.category).toBe(NotificationCategory.Projects)
    expect(notifications[1]?.category).toBe(NotificationCategory.Scheduling)
    expect(notifications[0]?.category).toBe(NotificationCategory.System)
  })

  it('adds notification with default null options', () => {
    useInboxStore.getState().addNotification(
      NotificationType.System,
      'Minimal',
      'No options'
    )

    const notif = useInboxStore.getState().notifications[0]
    expect(notif).toBeDefined()
    if (!notif) return
    expect(notif.link).toBeNull()
    expect(notif.actorName).toBeNull()
    expect(notif.actionUrl).toBeNull()
    expect(notif.actionLabel).toBeNull()
    expect(notif.sourceId).toBeNull()
    expect(notif.archived).toBe(false)
  })

  it('adds notification with link and actorName', () => {
    useInboxStore.getState().addNotification(
      NotificationType.Mention,
      'Mentioned',
      'You were mentioned',
      { link: '/pages/123', actorName: 'Alice' }
    )

    const notif = useInboxStore.getState().notifications[0]
    expect(notif).toBeDefined()
    if (!notif) return
    expect(notif.link).toBe('/pages/123')
    expect(notif.actorName).toBe('Alice')
  })

  it('marks a notification as read', () => {
    useInboxStore.getState().addNotification(NotificationType.System, 'Test', 'Message')
    const first = useInboxStore.getState().notifications[0]
    expect(first).toBeDefined()
    if (!first) return

    useInboxStore.getState().markAsRead(first.id)

    expect(useInboxStore.getState().notifications[0]?.read).toBe(true)
  })

  it('toggles the read status of a notification', () => {
    useInboxStore.getState().addNotification(NotificationType.System, 'Test', 'Message')
    const first = useInboxStore.getState().notifications[0]
    expect(first).toBeDefined()
    if (!first) return

    expect(useInboxStore.getState().notifications[0]?.read).toBe(false)

    useInboxStore.getState().toggleRead(first.id)
    expect(useInboxStore.getState().notifications[0]?.read).toBe(true)

    useInboxStore.getState().toggleRead(first.id)
    expect(useInboxStore.getState().notifications[0]?.read).toBe(false)
  })

  it('marks multiple notifications as read', () => {
    useInboxStore.getState().addNotification(NotificationType.System, 'One', 'Msg 1')
    useInboxStore.getState().addNotification(NotificationType.System, 'Two', 'Msg 2')
    useInboxStore.getState().addNotification(NotificationType.System, 'Three', 'Msg 3')

    const notifications = useInboxStore.getState().notifications
    const ids: string[] = []
    for (const n of notifications) {
      ids.push(n.id)
    }
    useInboxStore.getState().markSelectedAsRead([ids[0] ?? '', ids[1] ?? ''])

    const updated = useInboxStore.getState().notifications
    expect(updated[0]?.read).toBe(true)
    expect(updated[1]?.read).toBe(true)
    expect(updated[2]?.read).toBe(false)
  })

  it('marks all notifications as read', () => {
    useInboxStore.getState().addNotification(NotificationType.System, 'One', 'Msg 1')
    useInboxStore.getState().addNotification(NotificationType.Mention, 'Two', 'Msg 2')

    useInboxStore.getState().markAllAsRead()

    const allRead = useInboxStore.getState().notifications.every((n) => n.read)
    expect(allRead).toBe(true)
  })

  it('deletes a notification by id', () => {
    useInboxStore.getState().addNotification(NotificationType.System, 'Keep', 'Keep msg')
    useInboxStore.getState().addNotification(NotificationType.System, 'Delete', 'Delete msg')

    const toDelete = useInboxStore.getState().notifications.find((n) => n.title === 'Delete')
    expect(toDelete).toBeDefined()
    if (!toDelete) return

    useInboxStore.getState().deleteNotification(toDelete.id)

    const remaining = useInboxStore.getState().notifications
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.title).toBe('Keep')
  })

  it('deletes multiple notifications at once', () => {
    useInboxStore.getState().addNotification(NotificationType.System, 'A', 'Msg A')
    useInboxStore.getState().addNotification(NotificationType.System, 'B', 'Msg B')
    useInboxStore.getState().addNotification(NotificationType.System, 'C', 'Msg C')

    const notifications = useInboxStore.getState().notifications
    const ids: string[] = []
    for (const n of notifications) {
      ids.push(n.id)
    }
    useInboxStore.getState().deleteMultiple([ids[0] ?? '', ids[2] ?? ''])

    const remaining = useInboxStore.getState().notifications
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.id).toBe(ids[1])
  })

  it('archives a notification', () => {
    useInboxStore.getState().addNotification(NotificationType.System, 'Test', 'Msg')
    const first = useInboxStore.getState().notifications[0]
    expect(first).toBeDefined()
    if (!first) return

    useInboxStore.getState().archiveNotification(first.id)

    const updated = useInboxStore.getState().notifications[0]
    expect(updated?.archived).toBe(true)
    expect(updated?.read).toBe(true)
  })

  it('archives multiple notifications', () => {
    useInboxStore.getState().addNotification(NotificationType.System, 'A', 'Msg')
    useInboxStore.getState().addNotification(NotificationType.System, 'B', 'Msg')

    const ids = useInboxStore.getState().notifications.map((n) => n.id)
    useInboxStore.getState().archiveMultiple(ids)

    const allArchived = useInboxStore.getState().notifications.every((n) => n.archived && n.read)
    expect(allArchived).toBe(true)
  })

  it('clears all notifications', () => {
    useInboxStore.getState().addNotification(NotificationType.System, 'A', 'Msg')
    useInboxStore.getState().addNotification(NotificationType.System, 'B', 'Msg')

    useInboxStore.getState().clearAll()

    expect(useInboxStore.getState().notifications).toHaveLength(0)
  })

  it('getUnreadCount excludes archived notifications', () => {
    useInboxStore.getState().addNotification(NotificationType.System, 'A', 'Msg')
    useInboxStore.getState().addNotification(NotificationType.System, 'B', 'Msg')

    expect(useInboxStore.getState().getUnreadCount()).toBe(2)

    const first = useInboxStore.getState().notifications[0]
    if (!first) return
    useInboxStore.getState().archiveNotification(first.id)

    expect(useInboxStore.getState().getUnreadCount()).toBe(1)
  })

  it('getUnreadCountByCategory returns correct per-category counts', () => {
    useInboxStore.getState().addNotification(NotificationType.Comment, 'A', 'Workspace')
    useInboxStore.getState().addNotification(NotificationType.Mention, 'B', 'Workspace')
    useInboxStore.getState().addNotification(NotificationType.Assignment, 'C', 'Projects')

    expect(useInboxStore.getState().getUnreadCountByCategory(NotificationCategory.Workspace)).toBe(2)
    expect(useInboxStore.getState().getUnreadCountByCategory(NotificationCategory.Projects)).toBe(1)
    expect(useInboxStore.getState().getUnreadCountByCategory(NotificationCategory.Documents)).toBe(0)
  })

  it('sets simulator enabled state', () => {
    expect(useInboxStore.getState().simulatorEnabled).toBe(false)
    useInboxStore.getState().setSimulatorEnabled(true)
    expect(useInboxStore.getState().simulatorEnabled).toBe(true)
    useInboxStore.getState().setSimulatorEnabled(false)
    expect(useInboxStore.getState().simulatorEnabled).toBe(false)
  })

  it('sets digest frequency', () => {
    useInboxStore.getState().setDigestFrequency('daily')
    expect(useInboxStore.getState().digestFrequency).toBe('daily')
    useInboxStore.getState().setDigestFrequency('never')
    expect(useInboxStore.getState().digestFrequency).toBe('never')
  })
})
