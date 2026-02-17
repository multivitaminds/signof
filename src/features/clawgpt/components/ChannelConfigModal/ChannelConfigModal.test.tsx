import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChannelConfigModal from './ChannelConfigModal'
import type { Channel, ChannelConfigField } from '../../types'

const mockChannel: Channel = {
  id: 'ch-1',
  type: 'slack',
  name: 'Slack',
  status: 'connected',
  config: { authType: 'bot_token', botToken: 'xoxb-existing' },
  icon: '#',
  description: 'Slack workspace',
  authType: 'bot_token',
  capabilities: ['text'],
  unreadCount: 0,
  lastActivity: null,
  assignedAgentId: null,
}

const mockFields: ChannelConfigField[] = [
  {
    key: 'botToken',
    label: 'Bot Token',
    type: 'text',
    required: true,
    placeholder: 'xoxb-...',
  },
  {
    key: 'webhookUrl',
    label: 'Webhook URL',
    type: 'url',
    required: false,
    placeholder: 'https://...',
  },
]

describe('ChannelConfigModal', () => {
  const defaultProps = {
    channel: mockChannel,
    configFields: mockFields,
    onSave: vi.fn(),
    onCancel: vi.fn(),
    onTest: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders channel name in title', () => {
    render(<ChannelConfigModal {...defaultProps} />)
    expect(screen.getByText('Configure Slack')).toBeInTheDocument()
  })

  it('renders config fields', () => {
    render(<ChannelConfigModal {...defaultProps} />)
    expect(screen.getByLabelText(/Bot Token/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Webhook URL/)).toBeInTheDocument()
  })

  it('pre-fills existing config values', () => {
    render(<ChannelConfigModal {...defaultProps} />)
    const tokenInput = screen.getByLabelText(/Bot Token/) as HTMLInputElement
    expect(tokenInput.value).toBe('xoxb-existing')
  })

  it('calls onSave with entered values', async () => {
    const user = userEvent.setup()
    render(<ChannelConfigModal {...defaultProps} />)

    const tokenInput = screen.getByLabelText(/Bot Token/)
    await user.clear(tokenInput)
    await user.type(tokenInput, 'xoxb-new-token')

    await user.click(screen.getByText('Save'))
    expect(defaultProps.onSave).toHaveBeenCalledOnce()
    const savedConfig = defaultProps.onSave.mock.calls[0]![0]
    expect(savedConfig.botToken).toBe('xoxb-new-token')
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<ChannelConfigModal {...defaultProps} />)
    await user.click(screen.getByText('Cancel'))
    expect(defaultProps.onCancel).toHaveBeenCalledOnce()
  })

  it('calls onCancel when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ChannelConfigModal {...defaultProps} />)
    await user.click(screen.getByLabelText('Close'))
    expect(defaultProps.onCancel).toHaveBeenCalledOnce()
  })

  it('renders Test Connection button when onTest provided', () => {
    render(<ChannelConfigModal {...defaultProps} />)
    expect(screen.getByText('Test Connection')).toBeInTheDocument()
  })

  it('hides Test Connection button when onTest not provided', () => {
    render(<ChannelConfigModal {...defaultProps} onTest={undefined} />)
    expect(screen.queryByText('Test Connection')).not.toBeInTheDocument()
  })

  it('calls onTest and shows loading state', async () => {
    const user = userEvent.setup()
    render(<ChannelConfigModal {...defaultProps} />)
    await user.click(screen.getByText('Test Connection'))
    expect(defaultProps.onTest).toHaveBeenCalledOnce()
    expect(screen.getByText('Testing...')).toBeInTheDocument()
  })
})
