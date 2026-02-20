import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThreadPanel from './ThreadPanel'
import { useChorusStore } from '../../stores/useChorusStore'
import { useChorusMessageStore } from '../../stores/useChorusMessageStore'
import { ChorusMessageType, ConversationType, ChorusPresenceStatus } from '../../types'
import type { ChorusMessage } from '../../types'

// Mock MessageBubble and MessageComposer to simplify testing
vi.mock('../MessageBubble/MessageBubble', () => ({
  default: ({ message }: { message: ChorusMessage }) => (
    <div data-testid="message-bubble">{message.content}</div>
  ),
}))

vi.mock('../MessageComposer/MessageComposer', () => ({
  default: ({ onSend, placeholder }: { onSend: (s: string) => void; placeholder?: string }) => (
    <div data-testid="message-composer">
      <input
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSend('test reply')
          }
        }}
      />
    </div>
  ),
}))

const parentMessage: ChorusMessage = {
  id: 'msg-1',
  conversationId: 'ch-general',
  conversationType: ConversationType.Channel,
  senderId: 'user-alex',
  senderName: 'Alex Johnson',
  senderAvatarUrl: '',
  content: 'Parent message',
  messageType: ChorusMessageType.Text,
  timestamp: '2026-02-19T10:00:00Z',
  editedAt: null,
  isEdited: false,
  threadId: null,
  threadReplyCount: 1,
  threadParticipantIds: ['user-sarah'],
  threadLastReplyAt: '2026-02-19T10:10:00Z',
  reactions: [],
  isPinned: false,
  isBookmarked: false,
  isDeleted: false,
  attachments: [],
  mentions: [],
  pollData: null,
  crossModuleRef: null,
}

const replyMessage: ChorusMessage = {
  ...parentMessage,
  id: 'msg-2',
  senderId: 'user-sarah',
  senderName: 'Sarah Chen',
  content: 'Thread reply',
  timestamp: '2026-02-19T10:10:00Z',
  threadId: 'msg-1',
  threadReplyCount: 0,
  threadParticipantIds: [],
  threadLastReplyAt: null,
}

describe('ThreadPanel', () => {
  beforeEach(() => {
    useChorusStore.setState({
      activeThreadId: 'msg-1',
      activeConversationId: 'ch-general',
      activeConversationType: ConversationType.Channel,
      threadPanelOpen: true,
      currentUserId: 'user-you',
      users: [{
        id: 'user-you',
        name: 'you',
        displayName: 'You',
        email: 'you@test.com',
        avatarUrl: '',
        presence: ChorusPresenceStatus.Online,
        customStatus: null,
        customStatusEmoji: null,
        timezone: 'UTC',
        lastSeenAt: '2026-02-19T10:00:00Z',
      }],
    })
    useChorusMessageStore.setState({
      messages: {
        'ch-general': [parentMessage, replyMessage],
      },
    })
  })

  it('renders the thread header with title', () => {
    render(<ThreadPanel />)
    expect(screen.getByText('Thread')).toBeInTheDocument()
  })

  it('renders the parent message', () => {
    render(<ThreadPanel />)
    expect(screen.getByText('Parent message')).toBeInTheDocument()
  })

  it('renders thread replies', () => {
    render(<ThreadPanel />)
    expect(screen.getByText('Thread reply')).toBeInTheDocument()
  })

  it('renders reply count', () => {
    render(<ThreadPanel />)
    // "1 reply" appears in both the header count and the divider
    expect(screen.getAllByText('1 reply').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the message composer', () => {
    render(<ThreadPanel />)
    expect(screen.getByTestId('message-composer')).toBeInTheDocument()
  })

  it('has a close button', () => {
    render(<ThreadPanel />)
    expect(screen.getByLabelText('Close thread')).toBeInTheDocument()
  })

  it('calls closeThread when close button clicked', async () => {
    const user = userEvent.setup()
    const closeThread = vi.fn()
    useChorusStore.setState({ closeThread })

    render(<ThreadPanel />)
    await user.click(screen.getByLabelText('Close thread'))
    expect(closeThread).toHaveBeenCalled()
  })
})
