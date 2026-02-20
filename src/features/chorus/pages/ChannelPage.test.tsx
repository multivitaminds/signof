import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ChannelPage from './ChannelPage'
import { useChorusStore } from '../stores/useChorusStore'
import { useChorusMessageStore } from '../stores/useChorusMessageStore'
import { ChorusChannelType, ChorusPresenceStatus, ConversationType } from '../types'

// Mock child components
vi.mock('../components/ChannelHeader/ChannelHeader', () => ({
  default: ({ channel }: { channel: { displayName: string } | null }) => (
    <div data-testid="channel-header">{channel?.displayName ?? 'No channel'}</div>
  ),
}))

vi.mock('../components/MessageList/MessageList', () => ({
  default: ({ messages }: { messages: unknown[] }) => (
    <div data-testid="message-list">{messages.length} messages</div>
  ),
}))

vi.mock('../components/MessageComposer/MessageComposer', () => ({
  default: ({ onSend, placeholder }: { onSend: (c: string) => void; placeholder?: string }) => (
    <div data-testid="message-composer">
      <input
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSend('test message')
        }}
      />
    </div>
  ),
}))

const mockChannel = {
  id: 'ch-general',
  name: 'general',
  displayName: 'General',
  type: ChorusChannelType.Public,
  topic: 'Company announcements',
  description: '',
  createdBy: 'user-alex',
  createdAt: '2026-01-01T00:00:00Z',
  memberIds: ['user-you', 'user-alex', 'user-sarah'],
  pinnedMessageIds: [],
  isStarred: false,
  isMuted: false,
  lastMessageAt: '2026-02-19T10:00:00Z',
  unreadCount: 5,
  mentionCount: 1,
}

const mockUsers = [
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
]

function renderChannelPage(channelName = 'general') {
  return render(
    <MemoryRouter initialEntries={[`/chorus/channels/${channelName}`]}>
      <Routes>
        <Route path="/chorus/channels/:channelId" element={<ChannelPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ChannelPage', () => {
  beforeEach(() => {
    useChorusStore.setState({
      channels: [mockChannel],
      users: mockUsers,
      currentUserId: 'user-you',
      clearUnreadCount: vi.fn(),
      openThread: vi.fn(),
      toggleMembersPanel: vi.fn(),
      getCurrentUser: () => mockUsers[0],
    })
    useChorusMessageStore.setState({
      messages: {
        'ch-general': [
          {
            id: 'msg-1',
            conversationId: 'ch-general',
            conversationType: ConversationType.Channel,
            senderId: 'user-alex',
            senderName: 'Alex Johnson',
            senderAvatarUrl: '',
            content: 'Hello',
            messageType: 'text',
            timestamp: '2026-02-19T09:00:00Z',
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
        ],
      },
    })
  })

  it('renders channel header', () => {
    renderChannelPage()
    expect(screen.getByTestId('channel-header')).toHaveTextContent('General')
  })

  it('renders message list with messages', () => {
    renderChannelPage()
    expect(screen.getByTestId('message-list')).toHaveTextContent('1 messages')
  })

  it('renders message composer with channel-specific placeholder', () => {
    renderChannelPage()
    expect(screen.getByPlaceholderText('Message #general')).toBeInTheDocument()
  })

  it('shows not found for unknown channel', () => {
    renderChannelPage('unknown-channel')
    expect(screen.getByText('Channel not found')).toBeInTheDocument()
  })

  it('clears unread count on mount', () => {
    const clearUnreadCount = vi.fn()
    useChorusStore.setState({ clearUnreadCount })
    renderChannelPage()
    expect(clearUnreadCount).toHaveBeenCalledWith('ch-general')
  })

  it('sends a message via composer', async () => {
    const user = userEvent.setup()
    const sendMessage = vi.fn()
    useChorusMessageStore.setState({ sendMessage })

    renderChannelPage()
    const input = screen.getByPlaceholderText('Message #general')
    await user.type(input, '{Enter}')
    expect(sendMessage).toHaveBeenCalled()
  })
})
