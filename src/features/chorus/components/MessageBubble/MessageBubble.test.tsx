import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageBubble from './MessageBubble'
import { useChorusStore } from '../../stores/useChorusStore'
import type { ChorusMessage } from '../../types'
import { ConversationType, ChorusMessageType, ChorusPresenceStatus } from '../../types'

// Mock PresenceAvatar
vi.mock('../PresenceAvatar/PresenceAvatar', () => ({
  default: ({ name }: { name: string }) => <span data-testid="presence-avatar">{name}</span>,
}))

// Mock formatters
vi.mock('../../lib/chorusFormatters', () => ({
  formatMessageTime: () => '9:30 AM',
  formatFullTimestamp: () => 'Wednesday, February 19, 2026 at 9:30 AM',
}))

function makeMessage(overrides: Partial<ChorusMessage> = {}): ChorusMessage {
  return {
    id: 'msg-1',
    conversationId: 'ch-general',
    conversationType: ConversationType.Channel,
    senderId: 'user-alex',
    senderName: 'Alex Johnson',
    senderAvatarUrl: '',
    content: 'Hello world',
    messageType: ChorusMessageType.Text,
    timestamp: '2026-02-19T09:30:00Z',
    editedAt: null,
    isEdited: false,
    threadId: null,
    threadReplyCount: 0,
    threadParticipantIds: [],
    threadLastReplyAt: null,
    reactions: [],
    isPinned: false,
    isBookmarked: false,
    isDeleted: false,
    attachments: [],
    mentions: [],
    pollData: null,
    crossModuleRef: null,
    ...overrides,
  }
}

const defaultProps = {
  currentUserId: 'user-you',
  conversationId: 'ch-general',
  conversationType: ConversationType.Channel as ConversationType,
  isCompact: false,
}

describe('MessageBubble', () => {
  beforeEach(() => {
    useChorusStore.setState({
      users: [
        {
          id: 'user-alex',
          name: 'alex.johnson',
          displayName: 'Alex Johnson',
          email: 'alex@test.com',
          avatarUrl: '',
          presence: ChorusPresenceStatus.Online,
          customStatus: null,
          customStatusEmoji: null,
          timezone: 'UTC',
          lastSeenAt: '2026-02-19T10:00:00Z',
        },
      ],
    })
  })

  it('renders sender name and message content', () => {
    render(<MessageBubble message={makeMessage()} {...defaultProps} />)
    expect(screen.getAllByText('Alex Johnson').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders timestamp', () => {
    render(<MessageBubble message={makeMessage()} {...defaultProps} />)
    expect(screen.getByText('9:30 AM')).toBeInTheDocument()
  })

  it('renders avatar in non-compact mode', () => {
    render(<MessageBubble message={makeMessage()} {...defaultProps} />)
    expect(screen.getByTestId('presence-avatar')).toBeInTheDocument()
  })

  it('hides avatar and sender name in compact mode', () => {
    render(<MessageBubble message={makeMessage()} {...defaultProps} isCompact />)
    expect(screen.queryByTestId('presence-avatar')).not.toBeInTheDocument()
    expect(screen.queryByText('Alex Johnson')).not.toBeInTheDocument()
  })

  it('shows edited indicator', () => {
    render(
      <MessageBubble
        message={makeMessage({ isEdited: true, editedAt: '2026-02-19T10:00:00Z' })}
        {...defaultProps}
      />
    )
    expect(screen.getByText('(edited)')).toBeInTheDocument()
  })

  it('renders system message with distinct styling', () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({
          messageType: ChorusMessageType.System,
          content: 'User joined the channel',
        })}
        {...defaultProps}
      />
    )
    expect(container.querySelector('.chorus-bubble--system')).toBeInTheDocument()
    expect(screen.getByText('User joined the channel')).toBeInTheDocument()
  })

  it('highlights mention for current user', () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({ mentions: ['user-you'] })}
        {...defaultProps}
      />
    )
    expect(container.querySelector('.chorus-bubble--mentioned')).toBeInTheDocument()
  })

  it('does not highlight mention for other users', () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({ mentions: ['user-alex'] })}
        {...defaultProps}
      />
    )
    expect(container.querySelector('.chorus-bubble--mentioned')).not.toBeInTheDocument()
  })

  it('renders reactions', () => {
    render(
      <MessageBubble
        message={makeMessage({
          reactions: [
            { emoji: '\uD83D\uDC4D', userIds: ['user-alex'], count: 1 },
            { emoji: '\uD83D\uDE80', userIds: ['user-you', 'user-alex'], count: 2 },
          ],
        })}
        {...defaultProps}
      />
    )
    expect(screen.getByLabelText('\uD83D\uDC4D 1')).toBeInTheDocument()
    expect(screen.getByLabelText('\uD83D\uDE80 2')).toBeInTheDocument()
  })

  it('marks active reaction when user has reacted', () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({
          reactions: [{ emoji: '\uD83D\uDE80', userIds: ['user-you'], count: 1 }],
        })}
        {...defaultProps}
      />
    )
    expect(container.querySelector('.chorus-bubble__reaction--active')).toBeInTheDocument()
  })

  it('calls onAddReaction when reaction clicked', async () => {
    const user = userEvent.setup()
    const onAddReaction = vi.fn()
    render(
      <MessageBubble
        message={makeMessage({
          reactions: [{ emoji: '\uD83D\uDC4D', userIds: ['user-alex'], count: 1 }],
        })}
        {...defaultProps}
        onAddReaction={onAddReaction}
      />
    )
    await user.click(screen.getByLabelText('\uD83D\uDC4D 1'))
    expect(onAddReaction).toHaveBeenCalledWith('msg-1', '\uD83D\uDC4D')
  })

  it('renders thread reply link', () => {
    render(
      <MessageBubble
        message={makeMessage({ threadReplyCount: 3 })}
        {...defaultProps}
      />
    )
    expect(screen.getByText('3 replies')).toBeInTheDocument()
  })

  it('renders singular reply label', () => {
    render(
      <MessageBubble
        message={makeMessage({ threadReplyCount: 1 })}
        {...defaultProps}
      />
    )
    expect(screen.getByText('1 reply')).toBeInTheDocument()
  })

  it('calls onOpenThread when thread link clicked', async () => {
    const user = userEvent.setup()
    const onOpenThread = vi.fn()
    render(
      <MessageBubble
        message={makeMessage({ threadReplyCount: 2 })}
        {...defaultProps}
        onOpenThread={onOpenThread}
      />
    )
    await user.click(screen.getByText('2 replies'))
    expect(onOpenThread).toHaveBeenCalledWith('msg-1')
  })

  it('renders pinned indicator', () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({ isPinned: true })}
        {...defaultProps}
      />
    )
    expect(container.querySelector('.chorus-bubble--pinned')).toBeInTheDocument()
    expect(screen.getByLabelText('Pinned')).toBeInTheDocument()
  })

  it('renders cross-module reference link', () => {
    render(
      <MessageBubble
        message={makeMessage({
          crossModuleRef: {
            moduleType: 'projects',
            entityId: 'proj-1',
            entityTitle: 'Project Alpha',
            entityPath: '/projects/proj-1',
          },
        })}
        {...defaultProps}
      />
    )
    expect(screen.getByText('Project Alpha')).toBeInTheDocument()
    expect(screen.getByLabelText('Open Project Alpha')).toBeInTheDocument()
  })

  it('renders inline code', () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({ content: 'Use `useState` hook' })}
        {...defaultProps}
      />
    )
    expect(container.querySelector('.chorus-bubble__inline-code')).toBeInTheDocument()
    expect(container.querySelector('.chorus-bubble__inline-code')?.textContent).toBe('useState')
  })
})
