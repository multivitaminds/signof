import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import DirectMessagePage from './DirectMessagePage'
import { useChorusStore } from '../stores/useChorusStore'
import { useChorusMessageStore } from '../stores/useChorusMessageStore'
import { useChorusPresenceStore } from '../stores/useChorusPresenceStore'
import { ChorusPresenceStatus, ConversationType, ChorusMessageType } from '../types'
import type { ChorusUser, ChorusDirectMessage, ChorusMessage } from '../types'

// Mock MessageList
vi.mock('../components/MessageList/MessageList', () => ({
  default: ({ messages }: { messages: ChorusMessage[] }) => (
    <div data-testid="message-list">
      {messages.map((m) => (
        <div key={m.id} data-testid="message-item">{m.content}</div>
      ))}
    </div>
  ),
}))

// Mock MessageComposer
vi.mock('../components/MessageComposer/MessageComposer', () => ({
  default: ({ onSend, placeholder }: { onSend: (s: string) => void; placeholder?: string }) => (
    <div data-testid="message-composer">
      <input
        placeholder={placeholder}
        data-testid="composer-input"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSend('test message')
          }
        }}
      />
    </div>
  ),
}))

// Mock TypingIndicator
vi.mock('../components/TypingIndicator/TypingIndicator', () => ({
  default: ({ conversationId }: { conversationId: string }) => (
    <div data-testid="typing-indicator">{conversationId}</div>
  ),
}))

// Mock PresenceAvatar
vi.mock('../components/PresenceAvatar/PresenceAvatar', () => ({
  default: ({ name }: { name: string }) => (
    <div data-testid="presence-avatar">{name}</div>
  ),
}))

const mockUsers: ChorusUser[] = [
  {
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
  },
  {
    id: 'user-sarah',
    name: 'sarah.chen',
    displayName: 'Sarah Chen',
    email: 'sarah@test.com',
    avatarUrl: '',
    presence: ChorusPresenceStatus.Online,
    customStatus: 'In a meeting',
    customStatusEmoji: null,
    timezone: 'UTC',
    lastSeenAt: '2026-02-19T10:00:00Z',
  },
  {
    id: 'user-mike',
    name: 'mike.rivera',
    displayName: 'Mike Rivera',
    email: 'mike@test.com',
    avatarUrl: '',
    presence: ChorusPresenceStatus.Away,
    customStatus: null,
    customStatusEmoji: null,
    timezone: 'UTC',
    lastSeenAt: '2026-02-19T10:00:00Z',
  },
]

const mockDM: ChorusDirectMessage = {
  id: 'dm-sarah',
  type: ConversationType.DM,
  participantIds: ['user-you', 'user-sarah'],
  name: 'Sarah Chen',
  lastMessageAt: '2026-02-19T09:40:00Z',
  unreadCount: 2,
  isStarred: false,
  isMuted: false,
}

const mockGroupDM: ChorusDirectMessage = {
  id: 'dm-group',
  type: ConversationType.GroupDM,
  participantIds: ['user-you', 'user-sarah', 'user-mike'],
  name: 'Sprint Planning',
  lastMessageAt: '2026-02-19T08:30:00Z',
  unreadCount: 0,
  isStarred: false,
  isMuted: false,
}

const mockMessages: ChorusMessage[] = [
  {
    id: 'msg-1',
    conversationId: 'dm-sarah',
    conversationType: ConversationType.DM,
    senderId: 'user-sarah',
    senderName: 'Sarah Chen',
    senderAvatarUrl: '',
    content: 'Hello there!',
    messageType: ChorusMessageType.Text,
    timestamp: '2026-02-19T09:20:00Z',
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
  },
]

function renderWithRouter(dmId: string) {
  return render(
    <MemoryRouter initialEntries={[`/chorus/dm/${dmId}`]}>
      <Routes>
        <Route path="/chorus/dm/:dmId" element={<DirectMessagePage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('DirectMessagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useChorusStore.setState({
      users: mockUsers,
      currentUserId: 'user-you',
      directMessages: [mockDM, mockGroupDM],
      channels: [],
      activeConversationId: null,
      activeConversationType: null,
    })
    useChorusMessageStore.setState({
      messages: {
        'dm-sarah': mockMessages,
        'dm-group': [],
      },
    })
    useChorusPresenceStore.setState({ typingUsers: [] })
  })

  it('renders DM header with participant name', () => {
    renderWithRouter('dm-sarah')
    expect(screen.getByRole('heading', { name: 'Sarah Chen' })).toBeInTheDocument()
  })

  it('renders participant custom status', () => {
    renderWithRouter('dm-sarah')
    expect(screen.getByText('In a meeting')).toBeInTheDocument()
  })

  it('renders presence avatar for 1:1 DM', () => {
    renderWithRouter('dm-sarah')
    expect(screen.getByTestId('presence-avatar')).toBeInTheDocument()
  })

  it('renders the message list', () => {
    renderWithRouter('dm-sarah')
    expect(screen.getByTestId('message-list')).toBeInTheDocument()
    expect(screen.getByText('Hello there!')).toBeInTheDocument()
  })

  it('renders the message composer with correct placeholder', () => {
    renderWithRouter('dm-sarah')
    expect(screen.getByPlaceholderText('Message Sarah Chen')).toBeInTheDocument()
  })

  it('renders the typing indicator', () => {
    renderWithRouter('dm-sarah')
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
  })

  it('shows "Conversation not found" for invalid dmId', () => {
    renderWithRouter('dm-nonexistent')
    expect(screen.getByText('Conversation not found')).toBeInTheDocument()
  })

  it('renders group DM header with member count', () => {
    renderWithRouter('dm-group')
    expect(screen.getByText('Sprint Planning')).toBeInTheDocument()
    expect(screen.getByText('3 members')).toBeInTheDocument()
  })

  it('sends a message when composer submits', async () => {
    const user = userEvent.setup()
    const sendMessage = vi.fn()
    useChorusMessageStore.setState({ sendMessage })

    renderWithRouter('dm-sarah')

    const input = screen.getByTestId('composer-input')
    await user.click(input)
    await user.keyboard('{Enter}')

    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'dm-sarah',
        content: 'test message',
        senderId: 'user-you',
      })
    )
  })
})
