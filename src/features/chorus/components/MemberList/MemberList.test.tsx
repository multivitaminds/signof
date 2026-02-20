import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MemberList from './MemberList'
import { useChorusStore } from '../../stores/useChorusStore'
import { ChorusChannelType, ChorusPresenceStatus } from '../../types'

// Mock PresenceAvatar
vi.mock('../PresenceAvatar/PresenceAvatar', () => ({
  default: ({ name }: { name: string }) => <span data-testid="presence-avatar">{name}</span>,
}))

describe('MemberList', () => {
  beforeEach(() => {
    useChorusStore.setState({
      channels: [
        {
          id: 'ch-1',
          name: 'general',
          displayName: 'General',
          type: ChorusChannelType.Public,
          topic: '',
          description: '',
          createdBy: 'user-1',
          createdAt: '2026-01-01T00:00:00Z',
          memberIds: ['user-1', 'user-2'],
          pinnedMessageIds: [],
          isStarred: false,
          isMuted: false,
          lastMessageAt: '2026-02-19T10:00:00Z',
          unreadCount: 0,
          mentionCount: 0,
        },
      ],
      users: [
        {
          id: 'user-1',
          name: 'alex',
          displayName: 'Alex Johnson',
          email: 'alex@test.com',
          avatarUrl: '',
          presence: ChorusPresenceStatus.Online,
          customStatus: null,
          customStatusEmoji: null,
          timezone: 'UTC',
          lastSeenAt: '2026-02-19T10:00:00Z',
        },
        {
          id: 'user-2',
          name: 'sarah',
          displayName: 'Sarah Chen',
          email: 'sarah@test.com',
          avatarUrl: '',
          presence: ChorusPresenceStatus.Away,
          customStatus: 'In a meeting',
          customStatusEmoji: '\uD83D\uDCDE',
          timezone: 'UTC',
          lastSeenAt: '2026-02-19T09:00:00Z',
        },
      ],
    })
  })

  it('does not render when closed', () => {
    const { container } = render(
      <MemberList channelId="ch-1" isOpen={false} onClose={vi.fn()} />
    )
    expect(container.querySelector('.member-list')).not.toBeInTheDocument()
  })

  it('renders member list when open', () => {
    render(<MemberList channelId="ch-1" isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('Members')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // count
  })

  it('renders all members', () => {
    render(<MemberList channelId="ch-1" isOpen={true} onClose={vi.fn()} />)
    // Name appears in PresenceAvatar mock + member name span, use getAllByText
    expect(screen.getAllByText('Alex Johnson').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Sarah Chen').length).toBeGreaterThanOrEqual(1)
  })

  it('shows online count', () => {
    render(<MemberList channelId="ch-1" isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('1 online')).toBeInTheDocument()
  })

  it('shows custom status', () => {
    render(<MemberList channelId="ch-1" isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('In a meeting')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<MemberList channelId="ch-1" isOpen={true} onClose={onClose} />)

    await user.click(screen.getByLabelText('Close member list'))
    expect(onClose).toHaveBeenCalled()
  })
})
