import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageThread from './MessageThread'
import type { BrainMessage } from '../../types'

const makeMessage = (overrides: Partial<BrainMessage> = {}): BrainMessage => ({
  id: 'msg-1',
  sessionId: 'session-1',
  channelId: 'ch-1',
  channelType: 'slack',
  direction: 'inbound',
  content: 'Hello there!',
  timestamp: '2025-06-15T09:00:00Z',
  senderName: 'Alice',
  senderAvatar: null,
  toolCalls: null,
  agentId: null,
  status: 'delivered',
  ...overrides,
})

describe('MessageThread', () => {
  it('renders inbound messages with correct class', () => {
    const messages = [makeMessage({ direction: 'inbound' })]
    const { container } = render(
      <MessageThread messages={messages} sessionId="session-1" />
    )
    const bubble = container.querySelector('.message-thread__bubble')
    expect(bubble).toHaveClass('message-thread__bubble--inbound')
  })

  it('renders outbound messages with correct class', () => {
    const messages = [makeMessage({ direction: 'outbound' })]
    const { container } = render(
      <MessageThread messages={messages} sessionId="session-1" />
    )
    const bubble = container.querySelector('.message-thread__bubble')
    expect(bubble).toHaveClass('message-thread__bubble--outbound')
  })

  it('displays sender name', () => {
    const messages = [makeMessage({ senderName: 'Alice' })]
    render(<MessageThread messages={messages} sessionId="session-1" />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('displays message content', () => {
    const messages = [makeMessage({ content: 'Hello there!' })]
    render(<MessageThread messages={messages} sessionId="session-1" />)
    expect(screen.getByText('Hello there!')).toBeInTheDocument()
  })

  it('displays timestamps', () => {
    const messages = [makeMessage({ timestamp: '2025-06-15T09:00:00Z' })]
    render(<MessageThread messages={messages} sessionId="session-1" />)
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('shows status for outbound messages', () => {
    const messages = [makeMessage({ direction: 'outbound', status: 'delivered' })]
    render(<MessageThread messages={messages} sessionId="session-1" />)
    expect(screen.getByText('delivered')).toBeInTheDocument()
  })

  it('does not show status for inbound messages', () => {
    const messages = [makeMessage({ direction: 'inbound', status: 'delivered' })]
    const { container } = render(
      <MessageThread messages={messages} sessionId="session-1" />
    )
    expect(container.querySelector('.message-thread__status')).not.toBeInTheDocument()
  })

  it('filters messages by sessionId', () => {
    const messages = [
      makeMessage({ id: 'msg-1', sessionId: 'session-1', content: 'In session' }),
      makeMessage({ id: 'msg-2', sessionId: 'session-2', content: 'Other session' }),
    ]
    render(<MessageThread messages={messages} sessionId="session-1" />)
    expect(screen.getByText('In session')).toBeInTheDocument()
    expect(screen.queryByText('Other session')).not.toBeInTheDocument()
  })

  it('shows empty state when no messages match', () => {
    render(<MessageThread messages={[]} sessionId="session-1" />)
    expect(screen.getByText('No messages in this session.')).toBeInTheDocument()
  })

  it('renders tool calls as collapsible block', async () => {
    const user = userEvent.setup()
    const messages = [
      makeMessage({ toolCalls: ['searchDocs(query)', 'sendEmail(to)'] }),
    ]
    render(<MessageThread messages={messages} sessionId="session-1" />)
    expect(screen.getByText('Show 2 tool calls')).toBeInTheDocument()

    await user.click(screen.getByText('Show 2 tool calls'))
    expect(screen.getByText('searchDocs(query)')).toBeInTheDocument()
    expect(screen.getByText('sendEmail(to)')).toBeInTheDocument()
    expect(screen.getByText('Hide 2 tool calls')).toBeInTheDocument()
  })
})
