import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SessionPanel from './SessionPanel'
import type { Session } from '../../types'

const makeSessions = (): Session[] => [
  {
    id: 'session-1',
    channelId: 'ch-1',
    channelType: 'slack',
    contactId: 'contact-1',
    contactName: 'Alice Smith',
    contactAvatar: null,
    lastMessage: 'Hey there, I need help with my account settings please',
    lastMessageAt: new Date(Date.now() - 300000).toISOString(),
    startedAt: '2025-06-15T09:00:00Z',
    agentId: null,
    isActive: true,
  },
  {
    id: 'session-2',
    channelId: 'ch-2',
    channelType: 'email',
    contactId: 'contact-2',
    contactName: 'Bob Jones',
    contactAvatar: null,
    lastMessage: 'Thanks for the update',
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    startedAt: '2025-06-15T08:00:00Z',
    agentId: null,
    isActive: false,
  },
]

describe('SessionPanel', () => {
  const defaultProps = {
    sessions: makeSessions(),
    activeSessionId: 'session-1',
    onSelectSession: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders session contact names', () => {
    render(<SessionPanel {...defaultProps} />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('shows last message preview', () => {
    render(<SessionPanel {...defaultProps} />)
    expect(screen.getByText('Hey there, I need help with my account s...')).toBeInTheDocument()
  })

  it('does not truncate short messages', () => {
    render(<SessionPanel {...defaultProps} />)
    expect(screen.getByText('Thanks for the update')).toBeInTheDocument()
  })

  it('highlights active session', () => {
    const { container } = render(<SessionPanel {...defaultProps} />)
    const activeItem = container.querySelector('.session-panel__item--active')
    expect(activeItem).toBeInTheDocument()
    expect(activeItem).toHaveTextContent('Alice Smith')
  })

  it('calls onSelectSession when session is clicked', async () => {
    const user = userEvent.setup()
    render(<SessionPanel {...defaultProps} />)
    await user.click(screen.getByText('Bob Jones'))
    expect(defaultProps.onSelectSession).toHaveBeenCalledWith('session-2')
  })

  it('renders avatar initials when no avatar image', () => {
    render(<SessionPanel {...defaultProps} />)
    expect(screen.getByText('AS')).toBeInTheDocument()
    expect(screen.getByText('BJ')).toBeInTheDocument()
  })

  it('shows empty state when no sessions', () => {
    render(<SessionPanel sessions={[]} activeSessionId={null} onSelectSession={vi.fn()} />)
    expect(screen.getByText('No active sessions.')).toBeInTheDocument()
  })

  it('shows active indicator for active sessions', () => {
    const { container } = render(<SessionPanel {...defaultProps} />)
    const unreadDots = container.querySelectorAll('.session-panel__unread')
    expect(unreadDots.length).toBe(1)
  })
})
