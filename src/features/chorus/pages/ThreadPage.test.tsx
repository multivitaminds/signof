import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ThreadPage from './ThreadPage'
import { useChorusStore } from '../stores/useChorusStore'
import { useChorusMessageStore } from '../stores/useChorusMessageStore'
import { ChorusMessageType, ConversationType, ChorusPresenceStatus } from '../types'

// Mock MessageBubble and MessageComposer
vi.mock('../components/MessageBubble/MessageBubble', () => ({
  default: ({ message }: { message: { content: string } }) => (
    <div data-testid="message-bubble">{message.content}</div>
  ),
}))

vi.mock('../components/MessageComposer/MessageComposer', () => ({
  default: () => <div data-testid="message-composer">Composer</div>,
}))

const parentMsg = {
  id: 'msg-1',
  conversationId: 'ch-general',
  conversationType: ConversationType.Channel ,
  senderId: 'user-alex',
  senderName: 'Alex Johnson',
  senderAvatarUrl: '',
  content: 'Parent message in thread',
  messageType: ChorusMessageType.Text ,
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

const replyMsg = {
  ...parentMsg,
  id: 'msg-2',
  senderId: 'user-sarah',
  senderName: 'Sarah Chen',
  content: 'Reply in thread',
  timestamp: '2026-02-19T10:10:00Z',
  threadId: 'msg-1',
  threadReplyCount: 0,
  threadParticipantIds: [],
  threadLastReplyAt: null,
}

function renderThreadPage() {
  return render(
    <MemoryRouter initialEntries={['/chorus/thread/msg-1']}>
      <Routes>
        <Route path="/chorus/thread/:threadId" element={<ThreadPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ThreadPage', () => {
  beforeEach(() => {
    useChorusStore.setState({
      currentUserId: 'user-you',
      activeConversationId: 'ch-general',
      activeConversationType: ConversationType.Channel,
      activeThreadId: null,
      threadPanelOpen: false,
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
      messages: { 'ch-general': [parentMsg, replyMsg] },
    })
  })

  it('renders thread header', () => {
    renderThreadPage()
    expect(screen.getByText('Thread')).toBeInTheDocument()
  })

  it('renders parent message', () => {
    renderThreadPage()
    expect(screen.getByText('Parent message in thread')).toBeInTheDocument()
  })

  it('renders reply count', () => {
    renderThreadPage()
    expect(screen.getAllByText('1 reply').length).toBeGreaterThan(0)
  })

  it('renders message composer', () => {
    renderThreadPage()
    expect(screen.getByTestId('message-composer')).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderThreadPage()
    expect(screen.getByLabelText('Go back')).toBeInTheDocument()
  })

  it('shows not found when thread does not exist', () => {
    useChorusMessageStore.setState({ messages: { 'ch-general': [] } })
    renderThreadPage()
    expect(screen.getByText('Thread not found.')).toBeInTheDocument()
  })
})
