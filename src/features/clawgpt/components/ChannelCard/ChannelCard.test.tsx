import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChannelCard from './ChannelCard'
import type { Channel } from '../../types'

const mockChannel: Channel = {
  id: 'ch-1',
  type: 'slack',
  name: 'Slack',
  status: 'connected',
  config: { authType: 'bot_token' },
  icon: '#',
  description: 'Connect to Slack workspaces',
  authType: 'bot_token',
  capabilities: ['text', 'media', 'reactions'],
  unreadCount: 3,
  lastActivity: '2025-06-15T09:00:00Z',
  assignedAgentId: null,
}

describe('ChannelCard', () => {
  const defaultProps = {
    channel: mockChannel,
    onConnect: vi.fn(),
    onDisconnect: vi.fn(),
    onConfigure: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders channel name and description', () => {
    render(<ChannelCard {...defaultProps} />)
    expect(screen.getByText('Slack')).toBeInTheDocument()
    expect(screen.getByText('Connect to Slack workspaces')).toBeInTheDocument()
  })

  it('shows connected status badge', () => {
    render(<ChannelCard {...defaultProps} />)
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('renders capabilities as tags', () => {
    render(<ChannelCard {...defaultProps} />)
    expect(screen.getByText('text')).toBeInTheDocument()
    expect(screen.getByText('media')).toBeInTheDocument()
    expect(screen.getByText('reactions')).toBeInTheDocument()
  })

  it('shows unread count badge', () => {
    render(<ChannelCard {...defaultProps} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('hides unread badge when count is 0', () => {
    const channel = { ...mockChannel, unreadCount: 0 }
    render(<ChannelCard {...defaultProps} channel={channel} />)
    expect(screen.queryByLabelText(/unread/)).not.toBeInTheDocument()
  })

  it('shows Disconnect button when connected', () => {
    render(<ChannelCard {...defaultProps} />)
    expect(screen.getByText('Disconnect')).toBeInTheDocument()
  })

  it('shows Connect button when disconnected', () => {
    const channel: Channel = { ...mockChannel, status: 'disconnected' }
    render(<ChannelCard {...defaultProps} channel={channel} />)
    expect(screen.getByText('Connect')).toBeInTheDocument()
  })

  it('shows Reconnect button when error', () => {
    const channel: Channel = { ...mockChannel, status: 'error' }
    render(<ChannelCard {...defaultProps} channel={channel} />)
    expect(screen.getByText('Reconnect')).toBeInTheDocument()
  })

  it('calls onDisconnect when Disconnect is clicked', async () => {
    const user = userEvent.setup()
    render(<ChannelCard {...defaultProps} />)
    await user.click(screen.getByText('Disconnect'))
    expect(defaultProps.onDisconnect).toHaveBeenCalledWith('ch-1')
  })

  it('calls onConnect when Connect is clicked', async () => {
    const user = userEvent.setup()
    const channel: Channel = { ...mockChannel, status: 'disconnected' }
    render(<ChannelCard {...defaultProps} channel={channel} />)
    await user.click(screen.getByText('Connect'))
    expect(defaultProps.onConnect).toHaveBeenCalledWith('ch-1')
  })

  it('calls onConfigure when Settings is clicked', async () => {
    const user = userEvent.setup()
    render(<ChannelCard {...defaultProps} />)
    await user.click(screen.getByLabelText('Configure Slack'))
    expect(defaultProps.onConfigure).toHaveBeenCalledWith('ch-1')
  })

  it('applies correct status class', () => {
    const { container } = render(<ChannelCard {...defaultProps} />)
    const badge = container.querySelector('.channel-card__status')
    expect(badge).toHaveClass('channel-card__status--connected')
  })
})
