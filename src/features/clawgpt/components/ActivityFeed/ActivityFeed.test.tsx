import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActivityFeed from './ActivityFeed'
import type { BrainMessage } from '../../types'

// Mock the eventBus to prevent side effects
vi.mock('../../../../lib/eventBus', () => ({
  eventBus: {
    on: vi.fn(() => vi.fn()),
    emit: vi.fn(),
  },
  EVENT_TYPES: {
    BRAIN_SESSION_CREATED: 'BRAIN_SESSION_CREATED',
    BRAIN_SKILL_EXECUTED: 'BRAIN_SKILL_EXECUTED',
    BRAIN_GATEWAY_STATUS: 'BRAIN_GATEWAY_STATUS',
  },
}))

const makeMessage = (overrides: Partial<BrainMessage> = {}): BrainMessage => ({
  id: 'msg-1',
  sessionId: 'session-1',
  channelId: 'ch-1',
  channelType: 'slack',
  direction: 'inbound',
  content: 'Hello there',
  timestamp: new Date().toISOString(),
  senderName: 'Alice',
  senderAvatar: null,
  toolCalls: null,
  agentId: null,
  status: 'delivered',
  ...overrides,
})

describe('ActivityFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders messages', () => {
    const messages = [
      makeMessage({ id: 'msg-1', senderName: 'Alice', content: 'Hello' }),
      makeMessage({ id: 'msg-2', senderName: 'Bob', content: 'World' }),
    ]
    render(<ActivityFeed messages={messages} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()
  })

  it('truncates long text to 80 characters', () => {
    const longText = 'A'.repeat(100)
    const messages = [makeMessage({ content: longText })]
    render(<ActivityFeed messages={messages} />)
    expect(screen.getByText('A'.repeat(80) + '...')).toBeInTheDocument()
  })

  it('does not truncate text under 80 characters', () => {
    const shortText = 'Short message'
    const messages = [makeMessage({ content: shortText })]
    render(<ActivityFeed messages={messages} />)
    expect(screen.getByText('Short message')).toBeInTheDocument()
  })

  it('calls onMessageClick with sessionId', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const messages = [makeMessage({ sessionId: 'session-42' })]
    render(<ActivityFeed messages={messages} onMessageClick={onClick} />)
    await user.click(screen.getByRole('listitem'))
    expect(onClick).toHaveBeenCalledWith('session-42')
  })

  it('limits displayed messages to maxItems', () => {
    const messages = Array.from({ length: 30 }, (_, i) =>
      makeMessage({
        id: `msg-${i}`,
        senderName: `User ${i}`,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
      })
    )
    render(<ActivityFeed messages={messages} maxItems={5} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(5)
  })

  it('shows empty state when no messages', () => {
    render(<ActivityFeed messages={[]} />)
    expect(screen.getByText('No activity yet.')).toBeInTheDocument()
  })

  it('sorts messages in reverse chronological order', () => {
    const messages = [
      makeMessage({
        id: 'msg-old',
        senderName: 'Old',
        timestamp: '2025-01-01T00:00:00Z',
      }),
      makeMessage({
        id: 'msg-new',
        senderName: 'New',
        timestamp: '2025-06-15T00:00:00Z',
      }),
    ]
    render(<ActivityFeed messages={messages} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('New')
    expect(items[1]).toHaveTextContent('Old')
  })
})
