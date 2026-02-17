import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DevicesPage from './DevicesPage'

let mockDevicesData = [
  {
    id: 'device-1',
    name: 'MacBook Pro - Work',
    platform: 'macos',
    capabilities: ['shell', 'screen', 'notifications'],
    status: 'online',
    pairedAt: '2025-01-10T14:00:00Z',
    lastSeen: '2025-06-15T10:30:00Z',
  },
  {
    id: 'device-2',
    name: 'iPhone 16 Pro',
    platform: 'ios',
    capabilities: ['notifications', 'camera'],
    status: 'offline',
    pairedAt: '2025-02-20T09:00:00Z',
    lastSeen: '2025-06-14T22:15:00Z',
  },
]

const mockUnpairDevice = vi.fn()
const mockGeneratePairingCode = vi.fn()

vi.mock('../stores/useDeviceStore', () => ({
  useDeviceStore: vi.fn(() => ({
    devices: mockDevicesData,
    unpairDevice: mockUnpairDevice,
    pairingCode: null,
    pairingExpiry: null,
    generatePairingCode: mockGeneratePairingCode,
  })),
}))

// Mock DevicePairingFlow with actual props: pairingCode, pairingExpiry, onGenerate, onCancel
vi.mock('../components/DevicePairingFlow/DevicePairingFlow', () => ({
  default: ({ onCancel }: { pairingCode: string | null; pairingExpiry: string | null; onGenerate: () => void; onCancel: () => void }) => (
    <div data-testid="device-pairing-flow">
      <span>Pairing Flow</span>
      <button onClick={onCancel}>Close Pairing</button>
    </div>
  ),
}))

// Mock DeviceNode to render device details
vi.mock('../components/DeviceNode/DeviceNode', () => ({
  default: ({ device, onUnpair }: { device: { id: string; name: string; platform: string; status: string; capabilities: string[] }; onUnpair: (id: string) => void }) => (
    <div data-testid={`device-node-${device.id}`}>
      <span>{device.name}</span>
      <span className="device-status">{device.status === 'online' ? 'Online' : 'Offline'}</span>
      <span className="device-platform">{device.platform === 'macos' ? 'macOS' : device.platform === 'ios' ? 'iOS' : device.platform}</span>
      <div className="device-capabilities">
        {device.capabilities.map((cap: string) => (
          <span key={cap}>{cap}</span>
        ))}
      </div>
      <button onClick={() => onUnpair(device.id)} aria-label={`Unpair ${device.name}`}>Unpair</button>
    </div>
  ),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <DevicesPage />
    </MemoryRouter>
  )
}

describe('DevicesPage', () => {
  beforeEach(() => {
    mockDevicesData = [
      {
        id: 'device-1',
        name: 'MacBook Pro - Work',
        platform: 'macos',
        capabilities: ['shell', 'screen', 'notifications'],
        status: 'online',
        pairedAt: '2025-01-10T14:00:00Z',
        lastSeen: '2025-06-15T10:30:00Z',
      },
      {
        id: 'device-2',
        name: 'iPhone 16 Pro',
        platform: 'ios',
        capabilities: ['notifications', 'camera'],
        status: 'offline',
        pairedAt: '2025-02-20T09:00:00Z',
        lastSeen: '2025-06-14T22:15:00Z',
      },
    ]
    mockUnpairDevice.mockClear()
    mockGeneratePairingCode.mockClear()
  })

  it('renders Pair New Device button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Pair New Device' })).toBeInTheDocument()
  })

  it('renders device cards', () => {
    renderPage()
    expect(screen.getByText('MacBook Pro - Work')).toBeInTheDocument()
    expect(screen.getByText('iPhone 16 Pro')).toBeInTheDocument()
  })

  it('renders filter buttons', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Online' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Offline' })).toBeInTheDocument()
  })

  it('filters to online devices only', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Online' }))

    expect(screen.getByText('MacBook Pro - Work')).toBeInTheDocument()
    expect(screen.queryByText('iPhone 16 Pro')).not.toBeInTheDocument()
  })

  it('filters to offline devices only', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Offline' }))

    expect(screen.queryByText('MacBook Pro - Work')).not.toBeInTheDocument()
    expect(screen.getByText('iPhone 16 Pro')).toBeInTheDocument()
  })

  it('shows device status badges', () => {
    renderPage()
    const statusElements = screen.getAllByText('Online')
    // One is the filter button, one is the device status badge
    expect(statusElements.length).toBeGreaterThanOrEqual(2)
    const offlineElements = screen.getAllByText('Offline')
    expect(offlineElements.length).toBeGreaterThanOrEqual(2)
  })

  it('shows device platform', () => {
    renderPage()
    expect(screen.getByText('macOS')).toBeInTheDocument()
    expect(screen.getByText('iOS')).toBeInTheDocument()
  })

  it('shows capability tags', () => {
    renderPage()
    expect(screen.getByText('screen')).toBeInTheDocument()
    expect(screen.getByText('camera')).toBeInTheDocument()
  })

  it('renders Unpair button for each device', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Unpair MacBook Pro - Work' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unpair iPhone 16 Pro' })).toBeInTheDocument()
  })

  it('calls unpairDevice when Unpair is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Unpair MacBook Pro - Work' }))

    expect(mockUnpairDevice).toHaveBeenCalledWith('device-1')
  })

  it('shows pairing flow when Pair New Device is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Pair New Device' }))

    expect(screen.getByTestId('device-pairing-flow')).toBeInTheDocument()
    expect(mockGeneratePairingCode).toHaveBeenCalledTimes(1)
  })

  it('hides pairing flow when close is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Pair New Device' }))
    expect(screen.getByTestId('device-pairing-flow')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close Pairing' }))
    expect(screen.queryByTestId('device-pairing-flow')).not.toBeInTheDocument()
  })
})

describe('DevicesPage empty state', () => {
  beforeEach(() => {
    mockDevicesData = []
    mockUnpairDevice.mockClear()
  })

  it('shows empty state when no devices', () => {
    renderPage()
    expect(screen.getByText('No devices paired yet')).toBeInTheDocument()
  })
})
