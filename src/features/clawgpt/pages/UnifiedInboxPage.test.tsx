import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import UnifiedInboxPage from './UnifiedInboxPage'

const mockSessions = [
  { id: 'session-1', channelId: 'ch-slack', channelType: 'slack', contactName: 'Sarah Connor', startedAt: '2025-06-15T09:00:00Z', lastMessageAt: '2025-06-15T09:32:00Z', messageCount: 12, isActive: true },
  { id: 'session-2', channelId: 'ch-email', channelType: 'email', contactName: 'John Doe', startedAt: '2025-06-15T08:45:00Z', lastMessageAt: '2025-06-15T09:15:00Z', messageCount: 5, isActive: true },
]

const mockMessages = [
  { id: 'msg-1', sessionId: 'session-1', channelId: 'ch-slack', channelType: 'slack', direction: 'inbound', content: 'Hello from Slack', timestamp: '2025-06-15T09:00:00Z', status: 'read', isRead: true, senderName: 'Sarah Connor', metadata: {} },
  { id: 'msg-2', sessionId: 'session-1', channelId: 'ch-slack', channelType: 'slack', direction: 'outbound', content: 'Hi Sarah!', timestamp: '2025-06-15T09:01:00Z', status: 'sent', isRead: true, senderName: 'Atlas', metadata: {} },
  { id: 'msg-3', sessionId: 'session-2', channelId: 'ch-email', channelType: 'email', direction: 'inbound', content: 'Invoice request', timestamp: '2025-06-15T08:45:00Z', status: 'read', isRead: true, senderName: 'John Doe', metadata: {} },
]

const mockSendMessage = vi.fn()
const mockMarkRead = vi.fn()
const mockSetActiveSession = vi.fn()

let mockActiveSessionId: string | null = null

vi.mock('../stores/useGatewayStore', () => ({
  useGatewayStore: vi.fn(() => ({
    activeSessions: mockSessions,
  })),
}))

vi.mock('../stores/useMessageStore', () => ({
  useMessageStore: vi.fn(() => ({
    messages: mockMessages,
    activeSessionId: mockActiveSessionId,
    sendMessage: mockSendMessage,
    markRead: mockMarkRead,
    setActiveSession: mockSetActiveSession,
  })),
}))

vi.mock('../components/SessionPanel/SessionPanel', () => ({
  default: ({ sessions, onSelectSession }: { sessions: { id: string; contactName: string }[]; activeSessionId: string | null; onSelectSession: (id: string) => void }) => (
    <div data-testid="session-panel">
      {sessions.map((s) => (
        <button key={s.id} onClick={() => onSelectSession(s.id)} data-testid={`session-${s.id}`}>
          {s.contactName}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('../components/MessageThread/MessageThread', () => ({
  default: ({ messages }: { messages: { id: string; content: string }[] }) => (
    <div data-testid="message-thread">
      {messages.map((m) => (
        <div key={m.id}>{m.content}</div>
      ))}
    </div>
  ),
}))

vi.mock('../components/MessageComposer/MessageComposer', () => ({
  default: ({ onSend }: { onSend: (content: string) => void }) => (
    <div data-testid="message-composer">
      <button onClick={() => onSend('test message')}>Send</button>
    </div>
  ),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <UnifiedInboxPage />
    </MemoryRouter>
  )
}

describe('UnifiedInboxPage', () => {
  beforeEach(() => {
    mockActiveSessionId = null
    mockSendMessage.mockClear()
    mockMarkRead.mockClear()
    mockSetActiveSession.mockClear()
  })

  it('renders the session panel', () => {
    renderPage()
    expect(screen.getByTestId('session-panel')).toBeInTheDocument()
  })

  it('renders sessions in the panel', () => {
    renderPage()
    expect(screen.getByText('Sarah Connor')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows empty state when no session is selected', () => {
    renderPage()
    expect(screen.getByText('Select a conversation to view messages')).toBeInTheDocument()
  })

  it('does not show message thread when no session selected', () => {
    renderPage()
    expect(screen.queryByTestId('message-thread')).not.toBeInTheDocument()
  })

  it('does not show message composer when no session selected', () => {
    renderPage()
    expect(screen.queryByTestId('message-composer')).not.toBeInTheDocument()
  })

  it('calls setActiveSession when a session is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('session-session-1'))

    expect(mockSetActiveSession).toHaveBeenCalledWith('session-1')
  })

  it('calls markRead when a session is selected', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByTestId('session-session-1'))

    expect(mockMarkRead).toHaveBeenCalledWith('session-1')
  })
})

describe('UnifiedInboxPage with active session', () => {
  beforeEach(() => {
    mockActiveSessionId = 'session-1'
    mockSendMessage.mockClear()
    mockMarkRead.mockClear()
    mockSetActiveSession.mockClear()
  })

  it('shows message thread for selected session', () => {
    renderPage()
    expect(screen.getByTestId('message-thread')).toBeInTheDocument()
  })

  it('shows message composer for selected session', () => {
    renderPage()
    expect(screen.getByTestId('message-composer')).toBeInTheDocument()
  })

  it('shows session details panel', () => {
    renderPage()
    expect(screen.getByText('Session Details')).toBeInTheDocument()
  })

  it('shows contact name in the header', () => {
    renderPage()
    const nameElements = screen.getAllByText('Sarah Connor')
    expect(nameElements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows toggle details button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Hide details' })).toBeInTheDocument()
  })

  it('hides details panel when toggle is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Hide details' }))

    expect(screen.queryByText('Session Details')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show details' })).toBeInTheDocument()
  })
})
