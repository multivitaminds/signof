import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GatewayStatus from './GatewayStatus'
import { useGatewayStore } from '../../stores/useGatewayStore'

vi.mock('../../stores/useGatewayStore')

const mockUseGatewayStore = vi.mocked(useGatewayStore)

describe('GatewayStatus', () => {
  const mockStart = vi.fn()
  const mockStop = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders offline state with Start button', () => {
    mockUseGatewayStore.mockReturnValue({
      gatewayStatus: 'offline',
      uptimeSince: null,
      startGateway: mockStart,
      stopGateway: mockStop,
    } as ReturnType<typeof useGatewayStore>)

    render(<GatewayStatus />)
    expect(screen.getByText('Gateway: Offline')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start gateway' })).toBeInTheDocument()
  })

  it('renders online state with Stop button and uptime', () => {
    mockUseGatewayStore.mockReturnValue({
      gatewayStatus: 'online',
      uptimeSince: new Date(Date.now() - 3600000).toISOString(),
      startGateway: mockStart,
      stopGateway: mockStop,
    } as ReturnType<typeof useGatewayStore>)

    render(<GatewayStatus />)
    expect(screen.getByText('Gateway: Online')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Stop gateway' })).toBeInTheDocument()
    expect(screen.getByText(/Uptime:/)).toBeInTheDocument()
  })

  it('renders degraded state', () => {
    mockUseGatewayStore.mockReturnValue({
      gatewayStatus: 'degraded',
      uptimeSince: new Date().toISOString(),
      startGateway: mockStart,
      stopGateway: mockStop,
    } as ReturnType<typeof useGatewayStore>)

    render(<GatewayStatus />)
    expect(screen.getByText('Gateway: Degraded')).toBeInTheDocument()
  })

  it('calls startGateway when Start is clicked', async () => {
    const user = userEvent.setup()
    mockUseGatewayStore.mockReturnValue({
      gatewayStatus: 'offline',
      uptimeSince: null,
      startGateway: mockStart,
      stopGateway: mockStop,
    } as ReturnType<typeof useGatewayStore>)

    render(<GatewayStatus />)
    await user.click(screen.getByRole('button', { name: 'Start gateway' }))
    expect(mockStart).toHaveBeenCalledOnce()
  })

  it('calls stopGateway when Stop is clicked', async () => {
    const user = userEvent.setup()
    mockUseGatewayStore.mockReturnValue({
      gatewayStatus: 'online',
      uptimeSince: new Date().toISOString(),
      startGateway: mockStart,
      stopGateway: mockStop,
    } as ReturnType<typeof useGatewayStore>)

    render(<GatewayStatus />)
    await user.click(screen.getByRole('button', { name: 'Stop gateway' }))
    expect(mockStop).toHaveBeenCalledOnce()
  })

  it('does not show uptime when gateway is offline', () => {
    mockUseGatewayStore.mockReturnValue({
      gatewayStatus: 'offline',
      uptimeSince: null,
      startGateway: mockStart,
      stopGateway: mockStop,
    } as ReturnType<typeof useGatewayStore>)

    render(<GatewayStatus />)
    expect(screen.queryByText(/Uptime:/)).not.toBeInTheDocument()
  })

  it('applies correct dot class for online status', () => {
    mockUseGatewayStore.mockReturnValue({
      gatewayStatus: 'online',
      uptimeSince: new Date().toISOString(),
      startGateway: mockStart,
      stopGateway: mockStop,
    } as ReturnType<typeof useGatewayStore>)

    const { container } = render(<GatewayStatus />)
    const dot = container.querySelector('.gateway-status__dot')
    expect(dot).toHaveClass('gateway-status__dot--online')
  })
})
