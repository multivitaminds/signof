import { render, screen } from '@testing-library/react'
import ChatMessage from './ChatMessage'
import type { PlaygroundMessage } from '../../types'
import { ModelId } from '../../types'

vi.mock('../../../../features/developer/components/CodeBlock/CodeBlock', () => ({
  default: ({ code, language }: { code: string; language: string }) => (
    <pre data-testid="code-block" data-language={language}>{code}</pre>
  ),
}))

function createMessage(overrides: Partial<PlaygroundMessage> = {}): PlaygroundMessage {
  return {
    id: 'msg-1',
    role: 'user',
    content: 'Hello world',
    timestamp: '2025-01-15T10:30:00.000Z',
    modelId: null,
    tokenCount: 3,
    toolCalls: [],
    ...overrides,
  }
}

describe('ChatMessage', () => {
  it('renders user message with correct class', () => {
    render(<ChatMessage message={createMessage({ role: 'user' })} />)
    expect(screen.getByTestId('chat-message')).toHaveClass('chat-message--user')
  })

  it('renders assistant message with correct class', () => {
    render(<ChatMessage message={createMessage({ role: 'assistant', modelId: ModelId.ClaudeSonnet })} />)
    expect(screen.getByTestId('chat-message')).toHaveClass('chat-message--assistant')
  })

  it('renders timestamp', () => {
    render(<ChatMessage message={createMessage()} />)
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toHaveClass('chat-message__timestamp')
  })

  it('renders fenced code blocks', () => {
    render(<ChatMessage message={createMessage({ content: 'Code:\n```javascript\nconst x = 1\n```\nDone.' })} />)
    const codeBlock = screen.getByTestId('code-block')
    expect(codeBlock).toHaveAttribute('data-language', 'javascript')
  })

  it('renders bold text', () => {
    render(<ChatMessage message={createMessage({ content: 'This is **bold** text' })} />)
    expect(screen.getByText('bold').tagName).toBe('STRONG')
  })

  it('renders tool calls when present', () => {
    render(<ChatMessage message={createMessage({
      role: 'assistant', modelId: ModelId.ClaudeSonnet,
      toolCalls: [{ id: 'tc-1', name: 'web_search', input: '{}', output: '{}', status: 'completed', durationMs: 500 }],
    })} />)
    expect(screen.getByText('web_search')).toBeInTheDocument()
  })
})
