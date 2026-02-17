import { useNotificationStore } from './useNotificationStore'
import { NotificationType } from '../types'

describe('useNotificationStore', () => {
  beforeEach(() => {
    // Reset store with predictable sample data
    useNotificationStore.setState({
      notifications: [
        {
          id: 'n1',
          type: NotificationType.DocumentSigned,
          title: 'Doc signed',
          body: 'Test doc signed',
          module: 'documents',
          entityId: 'doc-1',
          entityPath: '/documents',
          read: false,
          dismissed: false,
          createdAt: new Date().toISOString(),
          icon: 'file-signature',
        },
        {
          id: 'n2',
          type: NotificationType.AgentCompleted,
          title: 'Agent done',
          body: 'Agent completed task',
          module: 'copilot',
          entityId: 'agent-1',
          entityPath: '/copilot',
          read: true,
          dismissed: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
          icon: 'sparkles',
        },
        {
          id: 'n3',
          type: NotificationType.SystemAlert,
          title: 'System alert',
          body: 'Maintenance window',
          module: 'system',
          entityId: null,
          entityPath: null,
          read: false,
          dismissed: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
          icon: 'alert-circle',
        },
      ],
      soundEnabled: true,
    })
  })

  it('has initial notifications', () => {
    const { notifications } = useNotificationStore.getState()
    expect(notifications).toHaveLength(3)
  })

  it('adds a notification and prepends it', () => {
    useNotificationStore.getState().addNotification({
      type: NotificationType.InvoicePaid,
      title: 'Invoice paid',
      body: 'Invoice #100 was paid',
      module: 'accounting',
      entityId: 'inv-100',
      entityPath: '/accounting/invoices',
      icon: 'dollar-sign',
    })

    const { notifications } = useNotificationStore.getState()
    expect(notifications).toHaveLength(4)
    const first = notifications[0]!
    expect(first.title).toBe('Invoice paid')
    expect(first.read).toBe(false)
    expect(first.dismissed).toBe(false)
    expect(first.id).toBeTruthy()
  })

  it('marks a notification as read', () => {
    useNotificationStore.getState().markRead('n1')
    const n = useNotificationStore.getState().notifications.find((x) => x.id === 'n1')
    expect(n?.read).toBe(true)
  })

  it('marks all notifications as read', () => {
    useNotificationStore.getState().markAllRead()
    const { notifications } = useNotificationStore.getState()
    expect(notifications.every((n) => n.read)).toBe(true)
  })

  it('dismisses a notification', () => {
    useNotificationStore.getState().dismiss('n1')
    const n = useNotificationStore.getState().notifications.find((x) => x.id === 'n1')
    expect(n?.dismissed).toBe(true)
  })

  it('dismisses all notifications', () => {
    useNotificationStore.getState().dismissAll()
    const { notifications } = useNotificationStore.getState()
    expect(notifications.every((n) => n.dismissed)).toBe(true)
  })

  it('returns unread count excluding dismissed', () => {
    expect(useNotificationStore.getState().getUnreadCount()).toBe(2)
    useNotificationStore.getState().dismiss('n1')
    expect(useNotificationStore.getState().getUnreadCount()).toBe(1)
  })

  it('filters notifications by module', () => {
    const docs = useNotificationStore.getState().getByModule('documents')
    expect(docs).toHaveLength(1)
    expect(docs[0]!.id).toBe('n1')
  })

  it('excludes dismissed from getByModule', () => {
    useNotificationStore.getState().dismiss('n1')
    const docs = useNotificationStore.getState().getByModule('documents')
    expect(docs).toHaveLength(0)
  })

  it('groups notifications by date', () => {
    const groups = useNotificationStore.getState().getGroupedByDate()
    // n1 is today, n2 is yesterday, n3 is older
    expect(groups.length).toBeGreaterThanOrEqual(2)
    expect(groups[0]!.label).toBe('Today')
    expect(groups[0]!.notifications).toHaveLength(1)
  })

  it('caps notifications at MAX_NOTIFICATIONS (200)', () => {
    const many = Array.from({ length: 199 }, (_, i) => ({
      id: `bulk-${i}`,
      type: NotificationType.CommentAdded,
      title: `Comment ${i}`,
      body: `Body ${i}`,
      module: 'pages',
      entityId: null,
      entityPath: null,
      read: false,
      dismissed: false,
      createdAt: new Date().toISOString(),
      icon: 'message-circle',
    }))

    useNotificationStore.setState({ notifications: many })
    // Adding one more should keep total at 200
    useNotificationStore.getState().addNotification({
      type: NotificationType.SystemAlert,
      title: 'New alert',
      body: 'Should cap at 200',
      module: 'system',
      entityId: null,
      entityPath: null,
      icon: 'alert-circle',
    })

    expect(useNotificationStore.getState().notifications.length).toBe(200)

    // Adding another should still be 200
    useNotificationStore.getState().addNotification({
      type: NotificationType.SystemAlert,
      title: 'Another alert',
      body: 'Still capped',
      module: 'system',
      entityId: null,
      entityPath: null,
      icon: 'alert-circle',
    })

    expect(useNotificationStore.getState().notifications.length).toBe(200)
  })
})
