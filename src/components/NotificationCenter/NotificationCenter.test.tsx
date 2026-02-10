import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NotificationCenter from './NotificationCenter'

const mockNavigate = vi.fn()
const mockMarkAsRead = vi.fn()
const mockMarkAllAsRead = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const sampleNotifications = [
  {
    id: 'n1',
    type: 'signature_request',
    category: 'documents',
    title: 'Document awaiting signature',
    message: 'Alex sent you a doc',
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/documents',
    actorName: 'Alex Johnson',
    actorAvatar: null,
    actionUrl: '/documents',
    actionLabel: 'Sign Now',
    sourceId: null,
  },
  {
    id: 'n2',
    type: 'mention',
    category: 'workspace',
    title: 'You were mentioned',
    message: 'Sarah mentioned you',
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/pages',
    actorName: 'Sarah Chen',
    actorAvatar: null,
    actionUrl: null,
    actionLabel: null,
    sourceId: null,
  },
  {
    id: 'n3',
    type: 'comment',
    category: 'workspace',
    title: 'New comment',
    message: 'Emma commented on your doc',
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/documents',
    actorName: 'Emma Davis',
    actorAvatar: null,
    actionUrl: null,
    actionLabel: null,
    sourceId: null,
  },
  {
    id: 'n4',
    type: 'system',
    category: 'system',
    title: 'Archived notification',
    message: 'This is archived and should not appear',
    read: true,
    archived: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    link: null,
    actorName: null,
    actorAvatar: null,
    actionUrl: null,
    actionLabel: null,
    sourceId: null,
  },
]

vi.mock('../../features/inbox/stores/useInboxStore', () => ({
  useInboxStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      notifications: sampleNotifications,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    }),
}))

function renderNotificationCenter() {
  return render(
    <MemoryRouter>
      <NotificationCenter />
    </MemoryRouter>
  )
}

describe('NotificationCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the bell icon trigger button', () => {
    renderNotificationCenter()
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
  })

  it('shows unread count badge excluding archived notifications', () => {
    renderNotificationCenter()
    const badge = screen.getByTestId('notification-badge')
    // n1 and n2 are unread and not archived, n4 is archived
    expect(badge).toHaveTextContent('2')
  })

  it('opens the dropdown panel when bell is clicked', async () => {
    const user = userEvent.setup()
    renderNotificationCenter()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Notifications'))

    expect(screen.getByRole('dialog', { name: 'Notifications panel' })).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('shows New and Earlier sections with correct notifications', async () => {
    const user = userEvent.setup()
    renderNotificationCenter()

    await user.click(screen.getByLabelText('Notifications'))

    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Earlier')).toBeInTheDocument()
    expect(screen.getByText('Document awaiting signature')).toBeInTheDocument()
    expect(screen.getByText('You were mentioned')).toBeInTheDocument()
    expect(screen.getByText('New comment')).toBeInTheDocument()
  })

  it('does not show archived notifications in the panel', async () => {
    const user = userEvent.setup()
    renderNotificationCenter()

    await user.click(screen.getByLabelText('Notifications'))

    expect(screen.queryByText('Archived notification')).not.toBeInTheDocument()
    expect(screen.queryByText('This is archived and should not appear')).not.toBeInTheDocument()
  })

  it('marks a notification as read when clicked', async () => {
    const user = userEvent.setup()
    renderNotificationCenter()

    await user.click(screen.getByLabelText('Notifications'))
    await user.click(screen.getByText('Document awaiting signature'))

    expect(mockMarkAsRead).toHaveBeenCalledWith('n1')
  })

  it('shows Mark all as read button when unread exist', async () => {
    const user = userEvent.setup()
    renderNotificationCenter()

    await user.click(screen.getByLabelText('Notifications'))

    expect(screen.getByText('Mark all as read')).toBeInTheDocument()
  })

  it('calls markAllAsRead when button is clicked', async () => {
    const user = userEvent.setup()
    renderNotificationCenter()

    await user.click(screen.getByLabelText('Notifications'))
    await user.click(screen.getByText('Mark all as read'))

    expect(mockMarkAllAsRead).toHaveBeenCalled()
  })

  it('shows View all notifications link that navigates to /inbox', async () => {
    const user = userEvent.setup()
    renderNotificationCenter()

    await user.click(screen.getByLabelText('Notifications'))
    await user.click(screen.getByText('View all notifications'))

    expect(mockNavigate).toHaveBeenCalledWith('/inbox')
  })

  it('renders action button for notifications with actionLabel', async () => {
    const user = userEvent.setup()
    renderNotificationCenter()

    await user.click(screen.getByLabelText('Notifications'))

    // n1 has actionLabel: 'Sign Now'
    expect(screen.getByText('Sign Now')).toBeInTheDocument()
  })

  it('navigates to actionUrl when action button is clicked', async () => {
    const user = userEvent.setup()
    renderNotificationCenter()

    await user.click(screen.getByLabelText('Notifications'))
    await user.click(screen.getByText('Sign Now'))

    expect(mockMarkAsRead).toHaveBeenCalledWith('n1')
    expect(mockNavigate).toHaveBeenCalledWith('/documents')
  })
})
