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
const mockArchiveNotification = vi.fn()
const mockArchiveMultiple = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const sampleNotifications = [
  {
    id: 'notif-1',
    type: 'signature_request',
    category: 'documents',
    title: 'Document awaiting your signature',
    message: 'Alex sent you a document',
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/documents',
    actorName: 'Alex Johnson',
    actorAvatar: null,
    actionUrl: '/documents',
    actionLabel: 'Sign Now',
    sourceId: 'doc-123',
  },
  {
    id: 'notif-2',
    type: 'mention',
    category: 'workspace',
    title: 'You were mentioned',
    message: 'Sarah mentioned you in a page',
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
    id: 'notif-3',
    type: 'comment',
    category: 'workspace',
    title: 'New comment',
    message: 'Emma commented on a document',
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
      archiveNotification: mockArchiveNotification,
      archiveMultiple: mockArchiveMultiple,
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

  it('renders category sidebar navigation', () => {
    renderInbox()
    const nav = screen.getByRole('navigation', { name: 'Filter by category' })
    expect(nav).toBeInTheDocument()
    // Check sidebar category items exist within the navigation
    const sidebarItems = nav.querySelectorAll('.inbox-page__sidebar-item')
    expect(sidebarItems.length).toBe(6) // All, Documents, Projects, Scheduling, Workspace, System
    expect(screen.getByText('Categories')).toBeInTheDocument()
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

  it('renders category badges on notification items', () => {
    renderInbox()
    const badges = document.querySelectorAll('.inbox-page__item-category-badge')
    expect(badges.length).toBeGreaterThanOrEqual(3)
    // Check the data-category attributes exist
    const categories = Array.from(badges).map((b) => b.getAttribute('data-category'))
    expect(categories).toContain('documents')
    expect(categories).toContain('workspace')
  })

  it('renders action button for notifications with actionLabel', () => {
    renderInbox()
    // notif-1 has actionLabel: 'Sign Now'
    expect(screen.getByText('Sign Now')).toBeInTheDocument()
  })

  it('renders archive buttons on notification items', () => {
    renderInbox()
    const archiveButtons = screen.getAllByLabelText('Archive notification')
    expect(archiveButtons.length).toBe(3)
  })

  it('renders delete buttons on notification items', () => {
    renderInbox()
    const deleteButtons = screen.getAllByLabelText('Delete notification')
    expect(deleteButtons.length).toBe(3)
  })

  it('shows detail pane empty state initially', () => {
    renderInbox()
    expect(screen.getByText('Select a notification to view details')).toBeInTheDocument()
  })

  it('shows detail pane when a notification is clicked', async () => {
    const user = userEvent.setup()
    renderInbox()

    await user.click(screen.getByText('Document awaiting your signature'))

    // The detail pane should show the full notification
    expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1')
    // Detail title should be visible
    const detailTitle = document.querySelector('.inbox-page__detail-title')
    expect(detailTitle).toHaveTextContent('Document awaiting your signature')
  })

  it('renders collapsible date group headers', () => {
    renderInbox()
    // The notifications are grouped by date - at least "Today" should appear
    const groupHeaders = document.querySelectorAll('.inbox-page__group-header')
    expect(groupHeaders.length).toBeGreaterThanOrEqual(1)
  })

  it('can collapse and expand date groups', async () => {
    const user = userEvent.setup()
    renderInbox()

    // Find a group header and click to collapse
    const groupHeaders = document.querySelectorAll('.inbox-page__group-header')
    expect(groupHeaders.length).toBeGreaterThanOrEqual(1)

    const firstHeader = groupHeaders[0]!
    // Get item count before collapsing
    const itemsBefore = document.querySelectorAll('.inbox-page__item').length
    expect(itemsBefore).toBeGreaterThan(0)

    await user.click(firstHeader)

    // After collapsing, items in that group should be hidden
    const itemsAfter = document.querySelectorAll('.inbox-page__item').length
    expect(itemsAfter).toBeLessThan(itemsBefore)
  })

  it('calls markAllAsRead when Mark all as read button is clicked', async () => {
    const user = userEvent.setup()
    renderInbox()

    await user.click(screen.getByText('Mark all as read'))
    expect(mockMarkAllAsRead).toHaveBeenCalled()
  })

  it('calls archiveNotification when archive button is clicked', async () => {
    const user = userEvent.setup()
    renderInbox()

    const archiveButtons = screen.getAllByLabelText('Archive notification')
    await user.click(archiveButtons[0]!)

    expect(mockArchiveNotification).toHaveBeenCalledWith('notif-1')
  })

  it('filters notifications by search query', async () => {
    const user = userEvent.setup()
    renderInbox()

    const searchInput = screen.getByLabelText('Search notifications')
    await user.type(searchInput, 'signature')

    // Only the notification with "signature" in title should remain
    expect(screen.getByText('Document awaiting your signature')).toBeInTheDocument()
    expect(screen.queryByText('You were mentioned')).not.toBeInTheDocument()
  })
})
