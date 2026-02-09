import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ChatMessage } from '../../types'
import AgentChat from './AgentChat'

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    agentId: 'agent-1',
    role: 'user',
    content: 'Hello there',
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

describe('AgentChat', () => {
  const defaultProps = {
    teamId: 'team-1',
    agentId: 'agent-1',
    agentName: 'Test Agent',
    messages: [] as ChatMessage[],
    onSendMessage: vi.fn(),
    onClose: vi.fn(),
  }

  it('renders the agent name in header', () => {
    render(<AgentChat {...defaultProps} />)

    expect(screen.getByText('Test Agent')).toBeInTheDocument()
  })

  it('renders messages', () => {
    const messages = [
      makeMessage({ id: 'm1', role: 'user', content: 'Hi agent' }),
      makeMessage({ id: 'm2', role: 'agent', content: 'Hello! How can I help?' }),
    ]

    render(<AgentChat {...defaultProps} messages={messages} />)

    expect(screen.getByText('Hi agent')).toBeInTheDocument()
    expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument()
  })

  it('shows empty state when no messages', () => {
    render(<AgentChat {...defaultProps} />)

    expect(screen.getByText(/No messages yet/)).toBeInTheDocument()
  })

  it('sends message on button click', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()

    render(<AgentChat {...defaultProps} onSendMessage={onSendMessage} />)

    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Test message')
    await user.click(screen.getByLabelText('Send message'))

    expect(onSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('sends message on Enter key', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()

    render(<AgentChat {...defaultProps} onSendMessage={onSendMessage} />)

    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Enter message{Enter}')

    expect(onSendMessage).toHaveBeenCalledWith('Enter message')
  })

  it('disables send button when input is empty', () => {
    render(<AgentChat {...defaultProps} />)

    const sendBtn = screen.getByLabelText('Send message')
    expect(sendBtn).toBeDisabled()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<AgentChat {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByLabelText('Close chat'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('only shows messages for the specified agent', () => {
    const messages = [
      makeMessage({ id: 'm1', agentId: 'agent-1', content: 'For this agent' }),
      makeMessage({ id: 'm2', agentId: 'agent-2', content: 'For another agent' }),
    ]

    render(<AgentChat {...defaultProps} messages={messages} />)

    expect(screen.getByText('For this agent')).toBeInTheDocument()
    expect(screen.queryByText('For another agent')).not.toBeInTheDocument()
  })
})
