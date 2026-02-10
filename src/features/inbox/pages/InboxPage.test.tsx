import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import InboxPage from './InboxPage'

const mockNavigate = vi.fn()
const mockAddNotification = vi.fn()
const mockMarkAsRead = vi.fn()
const mockToggleRead = vi.fn()
const mockMarkSelectedAsRead = vi.fn()
const mockMarkAllAsRead = vi.fn()
const mockDeleteNotification = vi.fn()
const mockDeleteMultiple = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const sampleNotifications = [
  {
    id: 'notif-1',
    type: 'signature_request',
    title: 'Document awaiting your signature',
    message: 'Alex sent you a document',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/documents',
    actorName: 'Alex Johnson',
    actorAvatar: null,
  },
  {
    id: 'notif-2',
    type: 'mention',
    title: 'You were mentioned',
    message: 'Sarah mentioned you in a page',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/pages',
    actorName: 'Sarah Chen',
    actorAvatar: null,
  },
  {
    id: 'notif-3',
    type: 'comment',
    title: 'New comment',
    message: 'Emma commented on a document',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/documents',
    actorName: 'Emma Davis',
    actorAvatar: null,
  },
]

vi.mock('../stores/useInboxStore', () => ({
  useInboxStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      notifications: sampleNotifications,
      addNotification: mockAddNotification,
      markAsRead: mockMarkAsRead,
      toggleRead: mockToggleRead,
      markSelectedAsRead: mockMarkSelectedAsRead,
      markAllAsRead: mockMarkAllAsRead,
      deleteNotification: mockDeleteNotification,
      deleteMultiple: mockDeleteMultiple,
    }),
}))

function renderInbox() {
  return render(
    <MemoryRouter>
      <InboxPage />
    </MemoryRouter>
  )
}

describe('InboxPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title with unread badge', () => {
    renderInbox()
    expect(screen.getByText('Inbox')).toBeInTheDocument()
    // 2 unread notifications - the badge appears in the title area
    const badge = screen.getByText('Inbox').closest('h1')?.querySelector('.inbox-page__badge')
    expect(badge).toHaveTextContent('2')
    expect(screen.getByText('Your notifications and updates')).toBeInTheDocument()
  })

  it('renders all notification titles', () => {
    renderInbox()
    expect(screen.getByText('Document awaiting your signature')).toBeInTheDocument()
    expect(screen.getByText('You were mentioned')).toBeInTheDocument()
    expect(screen.getByText('New comment')).toBeInTheDocument()
  })

  it('renders filter tabs', () => {
    renderInbox()
    const tablist = screen.getByRole('tablist', { name: 'Filter notifications' })
    expect(tablist).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^All$/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Unread/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Mentions/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Signatures/ })).toBeInTheDocument()
  })

  it('renders the search input', () => {
    renderInbox()
    expect(screen.getByLabelText('Search notifications')).toBeInTheDocument()
  })

  it('renders the Mark all as read button when unread exist', () => {
    renderInbox()
    expect(screen.getByText('Mark all as read')).toBeInTheDocument()
  })

  it('shows the New Notification button', () => {
    renderInbox()
    expect(screen.getByLabelText('New notification')).toBeInTheDocument()
  })

  it('shows compose form when New Notification is clicked', async () => {
    const user = userEvent.setup()
    renderInbox()

    await user.click(screen.getByLabelText('New notification'))

    expect(screen.getByText('Create Test Notification')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
  })

  it('renders actor names on notifications', () => {
    renderInbox()
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.getByText('Emma Davis')).toBeInTheDocument()
  })
})
