import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NotificationCenter from './NotificationCenter'
import { useNotificationStore } from '../../stores/useNotificationStore'
import { NotificationType } from '../../types'

function renderCenter(open = true, onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <MemoryRouter>
        <NotificationCenter open={open} onClose={onClose} />
      </MemoryRouter>
    ),
  }
}

describe('NotificationCenter', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [
        {
          id: 'nc-1',
          type: NotificationType.DocumentSigned,
          title: 'Doc signed',
          body: 'Test doc was signed',
          module: 'documents',
          entityId: 'doc-1',
          entityPath: '/documents',
          read: false,
          dismissed: false,
          createdAt: new Date().toISOString(),
          icon: 'file-signature',
        },
        {
          id: 'nc-2',
          type: NotificationType.AgentCompleted,
          title: 'Agent done',
          body: 'Agent completed work',
          module: 'copilot',
          entityId: 'agent-1',
          entityPath: '/copilot',
          read: false,
          dismissed: false,
          createdAt: new Date().toISOString(),
          icon: 'sparkles',
        },
        {
          id: 'nc-3',
          type: NotificationType.SystemAlert,
          title: 'System alert',
          body: 'Maintenance window',
          module: 'system',
          entityId: null,
          entityPath: null,
          read: true,
          dismissed: false,
          createdAt: new Date().toISOString(),
          icon: 'alert-circle',
        },
      ],
      soundEnabled: true,
    })
  })

  it('renders nothing when closed', () => {
    renderCenter(false)
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
  })

  it('renders the title and unread badge when open', () => {
    renderCenter()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // 2 unread
  })

  it('renders all notification items', () => {
    renderCenter()
    expect(screen.getByText('Doc signed')).toBeInTheDocument()
    expect(screen.getByText('Agent done')).toBeInTheDocument()
    expect(screen.getByText('System alert')).toBeInTheDocument()
  })

  it('renders filter tabs', () => {
    renderCenter()
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Unread' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Documents' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Agents' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'System' })).toBeInTheDocument()
  })

  it('filters by Unread tab', async () => {
    const user = userEvent.setup()
    renderCenter()

    await user.click(screen.getByRole('tab', { name: 'Unread' }))

    // nc-3 is read, should be hidden
    expect(screen.getByText('Doc signed')).toBeInTheDocument()
    expect(screen.getByText('Agent done')).toBeInTheDocument()
    expect(screen.queryByText('System alert')).not.toBeInTheDocument()
  })

  it('filters by Documents tab', async () => {
    const user = userEvent.setup()
    renderCenter()

    await user.click(screen.getByRole('tab', { name: 'Documents' }))

    expect(screen.getByText('Doc signed')).toBeInTheDocument()
    expect(screen.queryByText('Agent done')).not.toBeInTheDocument()
    expect(screen.queryByText('System alert')).not.toBeInTheDocument()
  })

  it('marks all as read', async () => {
    const user = userEvent.setup()
    renderCenter()

    await user.click(screen.getByLabelText('Mark all as read'))

    const { notifications } = useNotificationStore.getState()
    expect(notifications.every((n) => n.read)).toBe(true)
  })

  it('closes on close button click', async () => {
    const user = userEvent.setup()
    const { onClose } = renderCenter()

    await user.click(screen.getByLabelText('Close notification center'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows empty state for module with no notifications', async () => {
    const user = userEvent.setup()
    renderCenter()

    await user.click(screen.getByRole('tab', { name: 'Projects' }))
    expect(screen.getByText('No projects notifications')).toBeInTheDocument()
  })
})
