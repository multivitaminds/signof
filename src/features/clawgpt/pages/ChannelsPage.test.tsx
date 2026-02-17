import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ChannelsPage from './ChannelsPage'

const mockChannels = [
  { id: 'ch-slack', name: 'Slack', type: 'slack', status: 'connected', config: {}, unreadCount: 3, lastActivity: '2025-06-15T10:00:00Z', icon: 'slack', description: 'Connect to Slack workspaces', authType: 'oauth2', capabilities: ['text', 'media'], assignedAgentId: null },
  { id: 'ch-email', name: 'Email', type: 'email', status: 'connected', config: {}, unreadCount: 1, lastActivity: '2025-06-15T09:00:00Z', icon: 'mail', description: 'Handle email conversations', authType: 'smtp', capabilities: ['text', 'media'], assignedAgentId: null },
  { id: 'ch-discord', name: 'Discord', type: 'discord', status: 'disconnected', config: {}, unreadCount: 0, lastActivity: null, icon: 'hash', description: 'Discord bot integration', authType: 'bot_token', capabilities: ['text'], assignedAgentId: null },
]

const mockConnectChannel = vi.fn()
const mockDisconnectChannel = vi.fn()
const mockUpdateChannelConfig = vi.fn()
const mockAddCustomChannel = vi.fn()

vi.mock('../stores/useChannelStore', () => ({
  useChannelStore: vi.fn(() => ({
    channels: mockChannels,
    connectChannel: mockConnectChannel,
    disconnectChannel: mockDisconnectChannel,
    updateChannelConfig: mockUpdateChannelConfig,
    addCustomChannel: mockAddCustomChannel,
  })),
}))

// Mock ChannelCard to render with onConfigure callback
vi.mock('../components/ChannelCard/ChannelCard', () => ({
  default: ({ channel, onConfigure }: { channel: { id: string; name: string }; onConfigure?: (id: string) => void }) => (
    <div data-testid={`channel-card-${channel.id}`}>
      <span>{channel.name}</span>
      {onConfigure && (
        <button onClick={() => onConfigure(channel.id)}>Configure</button>
      )}
    </div>
  ),
}))

// Mock ChannelConfigModal matching actual props: channel, configFields, onSave, onCancel
vi.mock('../components/ChannelConfigModal/ChannelConfigModal', () => ({
  default: ({ channel, onCancel }: { channel: { name: string }; configFields: unknown[]; onSave: (config: unknown) => void; onCancel: () => void }) => (
    <div data-testid="channel-config-modal" role="dialog">
      <span>Configuring {channel.name}</span>
      <button onClick={onCancel}>Close</button>
    </div>
  ),
}))

vi.mock('../lib/channelDefinitions', () => ({
  CHANNEL_DEFINITIONS: [],
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ChannelsPage />
    </MemoryRouter>
  )
}

describe('ChannelsPage', () => {
  beforeEach(() => {
    mockAddCustomChannel.mockClear()
  })

  it('renders all channel cards', () => {
    renderPage()
    expect(screen.getByTestId('channel-card-ch-slack')).toBeInTheDocument()
    expect(screen.getByTestId('channel-card-ch-email')).toBeInTheDocument()
    expect(screen.getByTestId('channel-card-ch-discord')).toBeInTheDocument()
  })

  it('renders filter buttons', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Connected' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disconnected' })).toBeInTheDocument()
  })

  it('filters channels to connected only', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Connected' }))

    expect(screen.getByTestId('channel-card-ch-slack')).toBeInTheDocument()
    expect(screen.getByTestId('channel-card-ch-email')).toBeInTheDocument()
    expect(screen.queryByTestId('channel-card-ch-discord')).not.toBeInTheDocument()
  })

  it('filters channels to disconnected only', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Disconnected' }))

    expect(screen.queryByTestId('channel-card-ch-slack')).not.toBeInTheDocument()
    expect(screen.getByTestId('channel-card-ch-discord')).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderPage()
    expect(screen.getByLabelText('Search channels')).toBeInTheDocument()
  })

  it('filters channels by search query', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Search channels'), 'slack')

    expect(screen.getByTestId('channel-card-ch-slack')).toBeInTheDocument()
    expect(screen.queryByTestId('channel-card-ch-email')).not.toBeInTheDocument()
    expect(screen.queryByTestId('channel-card-ch-discord')).not.toBeInTheDocument()
  })

  it('shows empty message when no channels match', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Search channels'), 'xyznonexistent')

    expect(screen.getByText('No channels match your filters.')).toBeInTheDocument()
  })

  it('renders Add Custom Channel button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Add Custom Channel' })).toBeInTheDocument()
  })

  it('calls addCustomChannel when Add Custom Channel is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Add Custom Channel' }))

    expect(mockAddCustomChannel).toHaveBeenCalledTimes(1)
  })

  it('opens config modal when configure is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const configButtons = screen.getAllByRole('button', { name: 'Configure' })
    await user.click(configButtons[0]!)

    expect(screen.getByTestId('channel-config-modal')).toBeInTheDocument()
  })

  it('closes config modal when close is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    const configButtons = screen.getAllByRole('button', { name: 'Configure' })
    await user.click(configButtons[0]!)
    expect(screen.getByTestId('channel-config-modal')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByTestId('channel-config-modal')).not.toBeInTheDocument()
  })
})
