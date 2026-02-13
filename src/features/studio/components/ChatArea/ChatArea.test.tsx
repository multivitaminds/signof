import { render, screen } from '@testing-library/react'
import ChatArea from './ChatArea'
import type { StudioMessage } from '../../types'

vi.mock('../ChatMessage/ChatMessage', () => ({
  default: ({ message }: { message: StudioMessage }) => (
    <div data-testid="chat-message">{message.content}</div>
  ),
}))

function createMessage(content: string, role: 'user' | 'assistant' = 'user'): StudioMessage {
  return {
    id: `msg-${Math.random()}`,
    role,
    content,
    timestamp: new Date().toISOString(),
    modelId: null,
    tokenCount: content.length / 4,
    toolCalls: [],
  }
}

describe('ChatArea', () => {
  it('shows empty state when no messages', () => {
    render(<ChatArea messages={[]} isTyping={false} />)
    expect(screen.getByText('Start a conversation')).toBeInTheDocument()
    expect(screen.getByText('Send a message to begin')).toBeInTheDocument()
  })

  it('renders messages when provided', () => {
    const messages = [createMessage('Hello'), createMessage('World')]
    render(<ChatArea messages={messages} isTyping={false} />)
    expect(screen.getAllByTestId('chat-message')).toHaveLength(2)
  })

  it('shows typing indicator when isTyping', () => {
    render(<ChatArea messages={[createMessage('Hello')]} isTyping={true} />)
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
  })
})
