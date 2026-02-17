import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BrainDashboardPage from './BrainDashboardPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../stores/useGatewayStore', () => ({
  useGatewayStore: vi.fn(() => ({
    gatewayStatus: 'online',
    activeSessions: [
      { id: 's1', channelId: 'ch-1', channelType: 'slack', contactId: 'c1', contactName: 'Alice', lastMessage: 'hi', lastMessageAt: '', startedAt: '', agentId: null, isActive: true },
      { id: 's2', channelId: 'ch-2', channelType: 'email', contactId: 'c2', contactName: 'Bob', lastMessage: 'hey', lastMessageAt: '', startedAt: '', agentId: null, isActive: false },
    ],
    totalMessagesToday: 42,
    uptimeSince: '2025-06-15T09:00:00Z',
  })),
}))

vi.mock('../stores/useChannelStore', () => ({
  useChannelStore: vi.fn(() => ({
    channels: [
      { id: 'ch-1', name: 'Slack', type: 'slack', status: 'connected', config: {}, unreadCount: 0, lastActivity: null, icon: 'slack', description: '', authType: 'oauth2', capabilities: [], assignedAgentId: null },
      { id: 'ch-2', name: 'Email', type: 'email', status: 'disconnected', config: {}, unreadCount: 0, lastActivity: null, icon: 'mail', description: '', authType: 'smtp', capabilities: [], assignedAgentId: null },
      { id: 'ch-3', name: 'Web Chat', type: 'web_chat', status: 'connected', config: {}, unreadCount: 2, lastActivity: null, icon: 'message-circle', description: '', authType: 'webhook', capabilities: [], assignedAgentId: null },
    ],
  })),
}))

vi.mock('../stores/useMessageStore', () => ({
  useMessageStore: vi.fn(() => ({
    messages: [
      { id: 'msg-1', sessionId: 's1', channelId: 'ch-1', channelType: 'slack', direction: 'inbound', content: 'Hello from Slack', timestamp: '2025-06-15T09:00:00Z', status: 'read', senderName: 'Alice' },
      { id: 'msg-2', sessionId: 's1', channelId: 'ch-1', channelType: 'slack', direction: 'outbound', content: 'Hi Alice!', timestamp: '2025-06-15T09:01:00Z', status: 'sent', senderName: 'Atlas' },
    ],
  })),
}))

vi.mock('../stores/useSkillStore', () => ({
  useSkillStore: vi.fn(() => ({
    skills: [
      { id: 'sk-1', name: 'Smart Reply', description: '', category: 'communication', version: '1.0', author: 'Orchestree', installed: true, enabled: true, config: {}, icon: 'message-square', triggers: [], actions: [] },
      { id: 'sk-2', name: 'Sentiment', description: '', category: 'data', version: '1.0', author: 'Orchestree', installed: true, enabled: true, config: {}, icon: 'activity', triggers: [], actions: [] },
      { id: 'sk-3', name: 'Calendar Sync', description: '', category: 'productivity', version: '1.0', author: 'Orchestree', installed: false, enabled: false, config: {}, icon: 'calendar', triggers: [], actions: [] },
    ],
  })),
}))

vi.mock('../components/GatewayStatus/GatewayStatus', () => ({
  default: () => <div data-testid="gateway-status">GatewayStatus</div>,
}))

vi.mock('../components/ActivityFeed/ActivityFeed', () => ({
  default: ({ messages }: { messages: unknown[] }) => (
    <div data-testid="activity-feed">ActivityFeed ({messages.length} messages)</div>
  ),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <BrainDashboardPage />
    </MemoryRouter>
  )
}

describe('BrainDashboardPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders GatewayStatus component', () => {
    renderPage()
    expect(screen.getByTestId('gateway-status')).toBeInTheDocument()
  })

  it('renders Active Sessions stat card with correct value', () => {
    renderPage()
    expect(screen.getByText('Active Sessions')).toBeInTheDocument()
    // Only 1 session has isActive: true
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders Messages Today stat card with correct value', () => {
    renderPage()
    expect(screen.getByText('Messages Today')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders Channels Connected stat card with correct value', () => {
    renderPage()
    const label = screen.getByText('Channels Connected')
    expect(label).toBeInTheDocument()
    // 2 channels have status 'connected' (ch-1 and ch-3)
    const statCard = label.closest('.brain-dashboard__stat-card')!
    expect(statCard.querySelector('.brain-dashboard__stat-value')!.textContent).toBe('2')
  })

  it('renders Skills Installed stat card with correct value', () => {
    renderPage()
    const label = screen.getByText('Skills Installed')
    expect(label).toBeInTheDocument()
    // 2 skills have installed: true
    const statCard = label.closest('.brain-dashboard__stat-card')!
    expect(statCard.querySelector('.brain-dashboard__stat-value')!.textContent).toBe('2')
  })

  it('renders ActivityFeed component', () => {
    renderPage()
    expect(screen.getByTestId('activity-feed')).toBeInTheDocument()
  })

  it('renders Connect Channel quick action button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Connect Channel' })).toBeInTheDocument()
  })

  it('renders Send Message quick action button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument()
  })

  it('renders Install Skill quick action button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Install Skill' })).toBeInTheDocument()
  })

  it('navigates to channels page when Connect Channel is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Connect Channel' }))
    expect(mockNavigate).toHaveBeenCalledWith('/brain/channels')
  })

  it('navigates to inbox page when Send Message is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Send Message' }))
    expect(mockNavigate).toHaveBeenCalledWith('/brain/inbox')
  })

  it('navigates to skills page when Install Skill is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Install Skill' }))
    expect(mockNavigate).toHaveBeenCalledWith('/brain/skills')
  })
})
