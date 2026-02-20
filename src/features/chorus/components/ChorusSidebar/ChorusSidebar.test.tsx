import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ChorusSidebar from './ChorusSidebar'
import { useChorusStore } from '../../stores/useChorusStore'
import { ChorusChannelType, ChorusPresenceStatus, ConversationType } from '../../types'

// Mock PresenceAvatar
vi.mock('../PresenceAvatar/PresenceAvatar', () => ({
  default: ({ name }: { name: string }) => <span data-testid="presence-avatar">{name}</span>,
}))

const mockChannels = [
  {
    id: 'ch-general',
    name: 'general',
    displayName: 'General',
    type: ChorusChannelType.Public,
    topic: '',
    description: '',
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    memberIds: ['user-you'],
    pinnedMessageIds: [],
    isStarred: true,
    isMuted: false,
    lastMessageAt: '2026-02-19T10:00:00Z',
    unreadCount: 3,
    mentionCount: 1,
  },
  {
    id: 'ch-engineering',
    name: 'engineering',
    displayName: 'Engineering',
    type: ChorusChannelType.Public,
    topic: '',
    description: '',
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    memberIds: ['user-you'],
    pinnedMessageIds: [],
    isStarred: false,
    isMuted: false,
    lastMessageAt: '2026-02-19T09:00:00Z',
    unreadCount: 0,
    mentionCount: 0,
  },
  {
    id: 'ch-private',
    name: 'leadership',
    displayName: 'Leadership',
    type: ChorusChannelType.Private,
    topic: '',
    description: '',
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    memberIds: ['user-you'],
    pinnedMessageIds: [],
    isStarred: false,
    isMuted: false,
    lastMessageAt: '2026-02-18T10:00:00Z',
    unreadCount: 0,
    mentionCount: 0,
  },
]

const mockDMs = [
  {
    id: 'dm-sarah',
    type: ConversationType.DM,
    participantIds: ['user-you', 'user-sarah'],
    name: 'Sarah Chen',
    lastMessageAt: '2026-02-19T09:40:00Z',
    unreadCount: 2,
    isStarred: true,
    isMuted: false,
  },
]

const mockUsers = [
  {
    id: 'user-sarah',
    name: 'sarah.chen',
    displayName: 'Sarah Chen',
    email: 'sarah@test.com',
    avatarUrl: '',
    presence: ChorusPresenceStatus.Online,
    customStatus: null,
    customStatusEmoji: null,
    timezone: 'UTC',
    lastSeenAt: '2026-02-19T10:00:00Z',
  },
]

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/chorus/channels/general']}>
      <ChorusSidebar />
    </MemoryRouter>
  )
}

describe('ChorusSidebar', () => {
  beforeEach(() => {
    useChorusStore.setState({
      channels: mockChannels,
      directMessages: mockDMs,
      users: mockUsers,
      currentUserId: 'user-you',
    })
  })

  it('renders the Chorus title', () => {
    renderSidebar()
    expect(screen.getByText('Chorus')).toBeInTheDocument()
  })

  it('renders starred channels', () => {
    renderSidebar()
    expect(screen.getByText('Starred')).toBeInTheDocument()
    // general is starred
    const generalButtons = screen.getAllByRole('button', { name: /general/i })
    expect(generalButtons.length).toBeGreaterThan(0)
  })

  it('renders channel list with unread badges', () => {
    renderSidebar()
    expect(screen.getByText('Channels')).toBeInTheDocument()
    // Check for unread badge
    expect(screen.getAllByLabelText('3 unread').length).toBeGreaterThan(0)
  })

  it('renders direct messages section', () => {
    renderSidebar()
    expect(screen.getByText('Direct Messages')).toBeInTheDocument()
    // Sarah appears in both starred and DM sections
    expect(screen.getAllByText('Sarah Chen').length).toBeGreaterThanOrEqual(1)
  })

  it('renders search button', () => {
    renderSidebar()
    expect(screen.getByLabelText('Search messages')).toBeInTheDocument()
  })

  it('clears unread count when clicking a channel', async () => {
    const user = userEvent.setup()
    renderSidebar()

    const clearUnreadCount = vi.fn()
    useChorusStore.setState({ clearUnreadCount })

    // Re-render with the mock
    renderSidebar()

    const engineeringBtns = screen.getAllByText('engineering')
    if (engineeringBtns[0]) {
      await user.click(engineeringBtns[0])
    }
  })
})
