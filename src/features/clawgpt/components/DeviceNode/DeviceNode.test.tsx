import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeviceNode from './DeviceNode'
import type { DeviceNode as DeviceNodeType } from '../../types'

const mockDevice: DeviceNodeType = {
  id: 'device-1',
  name: 'MacBook Pro',
  platform: 'macos',
  status: 'online',
  capabilities: ['shell', 'notifications', 'clipboard'],
  lastSeen: new Date(Date.now() - 300000).toISOString(),
  pairedAt: '2025-06-01T00:00:00Z',
}

describe('DeviceNode', () => {
  const defaultProps = {
    device: mockDevice,
    onUnpair: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders device name', () => {
    render(<DeviceNode {...defaultProps} />)
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument()
  })

  it('renders platform label', () => {
    render(<DeviceNode {...defaultProps} />)
    expect(screen.getByText('macOS')).toBeInTheDocument()
  })

  it('renders online status with correct class', () => {
    const { container } = render(<DeviceNode {...defaultProps} />)
    const statusBadge = container.querySelector('.device-node__status')
    expect(statusBadge).toHaveClass('device-node__status--online')
    expect(statusBadge).toHaveTextContent('Online')
  })

  it('renders offline status with correct class', () => {
    const device: DeviceNodeType = { ...mockDevice, status: 'offline' }
    const { container } = render(<DeviceNode {...defaultProps} device={device} />)
    const statusBadge = container.querySelector('.device-node__status')
    expect(statusBadge).toHaveClass('device-node__status--offline')
  })

  it('renders pairing status with correct class', () => {
    const device: DeviceNodeType = { ...mockDevice, status: 'pairing' }
    const { container } = render(<DeviceNode {...defaultProps} device={device} />)
    const statusBadge = container.querySelector('.device-node__status')
    expect(statusBadge).toHaveClass('device-node__status--pairing')
  })

  it('renders capabilities as tags', () => {
    render(<DeviceNode {...defaultProps} />)
    expect(screen.getByText('shell')).toBeInTheDocument()
    expect(screen.getByText('notifications')).toBeInTheDocument()
    expect(screen.getByText('clipboard')).toBeInTheDocument()
  })

  it('shows last seen time', () => {
    render(<DeviceNode {...defaultProps} />)
    expect(screen.getByText(/Last seen:/)).toBeInTheDocument()
  })

  it('calls onUnpair when Unpair is clicked', async () => {
    const user = userEvent.setup()
    render(<DeviceNode {...defaultProps} />)
    await user.click(screen.getByLabelText('Unpair MacBook Pro'))
    expect(defaultProps.onUnpair).toHaveBeenCalledWith('device-1')
  })

  it('hides Unpair button when onUnpair not provided', () => {
    render(<DeviceNode device={mockDevice} />)
    expect(screen.queryByText('Unpair')).not.toBeInTheDocument()
  })
})
