import { render, screen } from '@testing-library/react'
import MessageList from './MessageList'
import type { ChorusMessage } from '../../types'
import { ConversationType, ChorusMessageType } from '../../types'

// Mock child components
vi.mock('../MessageBubble/MessageBubble', () => ({
  default: ({ message, isCompact }: { message: ChorusMessage; isCompact: boolean }) => (
    <div data-testid="message-bubble" data-compact={isCompact}>
      {message.content}
    </div>
  ),
}))

vi.mock('../DateDivider/DateDivider', () => ({
  default: ({ timestamp }: { timestamp: string }) => (
    <div data-testid="date-divider">{new Date(timestamp).toDateString()}</div>
  ),
}))

vi.mock('../../hooks/useMessageScroll', () => ({
  useMessageScroll: () => ({
    scrollRef: { current: null },
    isAtBottom: true,
    scrollToBottom: vi.fn(),
    showNewMessagesBanner: false,
  }),
}))

vi.mock('../../stores/useChorusMessageStore', () => ({
  useChorusMessageStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ addReaction: vi.fn(), removeReaction: vi.fn() }),
}))

function makeMessage(
  id: string,
  senderId: string,
  senderName: string,
  content: string,
  timestamp: string,
  overrides: Partial<ChorusMessage> = {}
): ChorusMessage {
  return {
    id,
    conversationId: 'ch-general',
    conversationType: ConversationType.Channel,
    senderId,
    senderName,
    senderAvatarUrl: '',
    content,
    messageType: ChorusMessageType.Text,
    timestamp,
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
}

describe('MessageList', () => {
  it('renders messages', () => {
    const messages = [
      makeMessage('m1', 'user-alex', 'Alex', 'Hello', '2026-02-19T09:00:00Z'),
      makeMessage('m2', 'user-sarah', 'Sarah', 'World', '2026-02-19T09:05:00Z'),
    ]
    render(<MessageList messages={messages} {...defaultProps} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()
  })

  it('renders date dividers', () => {
    const messages = [
      makeMessage('m1', 'user-alex', 'Alex', 'Day 1', '2026-02-18T09:00:00Z'),
      makeMessage('m2', 'user-alex', 'Alex', 'Day 2', '2026-02-19T09:00:00Z'),
    ]
    render(<MessageList messages={messages} {...defaultProps} />)
    const dividers = screen.getAllByTestId('date-divider')
    expect(dividers.length).toBe(2)
  })

  it('groups consecutive messages from the same sender', () => {
    const messages = [
      makeMessage('m1', 'user-alex', 'Alex', 'First', '2026-02-19T09:00:00Z'),
      makeMessage('m2', 'user-alex', 'Alex', 'Second', '2026-02-19T09:01:00Z'),
    ]
    render(<MessageList messages={messages} {...defaultProps} />)
    const bubbles = screen.getAllByTestId('message-bubble')
    // First message is not compact, second is compact
    expect(bubbles[0]).toHaveAttribute('data-compact', 'false')
    expect(bubbles[1]).toHaveAttribute('data-compact', 'true')
  })

  it('does not group messages from different senders', () => {
    const messages = [
      makeMessage('m1', 'user-alex', 'Alex', 'From Alex', '2026-02-19T09:00:00Z'),
      makeMessage('m2', 'user-sarah', 'Sarah', 'From Sarah', '2026-02-19T09:01:00Z'),
    ]
    render(<MessageList messages={messages} {...defaultProps} />)
    const bubbles = screen.getAllByTestId('message-bubble')
    expect(bubbles[0]).toHaveAttribute('data-compact', 'false')
    expect(bubbles[1]).toHaveAttribute('data-compact', 'false')
  })

  it('has a log role with label', () => {
    render(<MessageList messages={[]} {...defaultProps} />)
    expect(screen.getByRole('log')).toHaveAttribute('aria-label', 'Messages')
  })

  it('skips deleted messages in grouping', () => {
    const messages = [
      makeMessage('m1', 'user-alex', 'Alex', 'Visible', '2026-02-19T09:00:00Z'),
      makeMessage('m2', 'user-alex', 'Alex', 'Deleted', '2026-02-19T09:01:00Z', { isDeleted: true }),
    ]
    render(<MessageList messages={messages} {...defaultProps} />)
    expect(screen.getByText('Visible')).toBeInTheDocument()
    expect(screen.queryByText('Deleted')).not.toBeInTheDocument()
  })
})
