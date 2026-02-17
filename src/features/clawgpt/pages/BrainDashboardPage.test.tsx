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
    activeSessions: [],
    totalMessagesToday: 0,
    uptimeSince: '2025-06-15T09:00:00Z',
    fleetMetrics: null,
  })),
}))

vi.mock('../stores/useMessageStore', () => ({
  useMessageStore: vi.fn(() => ({
    messages: [],
  })),
}))

vi.mock('../stores/useFleetStore', () => {
  const store = Object.assign(
    vi.fn(() => ({
      totalRegistered: 0,
      totalActive: 0,
      totalIdle: 0,
      totalErrored: 0,
      tasksTodayCompleted: 0,
      tasksTodayFailed: 0,
      totalTokensToday: 0,
      totalCostToday: 0,
      avgTaskDurationMs: 0,
    })),
    {
      getState: vi.fn(() => ({
        refreshMetrics: vi.fn(),
      })),
    },
  )
  return { useFleetStore: store }
})

vi.mock('../components/GatewayStatus/GatewayStatus', () => ({
  default: () => <div data-testid="gateway-status">GatewayStatus</div>,
}))

vi.mock('../components/FleetOverview/FleetOverview', () => ({
  default: () => <div data-testid="fleet-overview">FleetOverview</div>,
}))

vi.mock('../components/FleetGrid/FleetGrid', () => ({
  default: () => <div data-testid="fleet-grid">FleetGrid</div>,
}))

vi.mock('../components/TaskQueuePanel/TaskQueuePanel', () => ({
  default: () => <div data-testid="task-queue-panel">TaskQueuePanel</div>,
}))

vi.mock('../components/BudgetDashboard/BudgetDashboard', () => ({
  default: () => <div data-testid="budget-dashboard">BudgetDashboard</div>,
}))

vi.mock('../components/AlertPanel/AlertPanel', () => ({
  default: () => <div data-testid="alert-panel">AlertPanel</div>,
}))

vi.mock('../components/AgentSpawner/AgentSpawner', () => ({
  default: () => null,
}))

vi.mock('../components/FleetAgentDetail/FleetAgentDetail', () => ({
  default: () => null,
}))

vi.mock('../components/ActivityFeed/ActivityFeed', () => ({
  default: () => <div data-testid="activity-feed">ActivityFeed</div>,
}))

vi.mock('../lib/agentKernel', () => ({
  spawnAgent: vi.fn(),
  retireAgent: vi.fn(),
  submitTask: vi.fn(),
  startReconciliation: vi.fn(),
}))

vi.mock('../../ai/lib/agentRegistry', () => ({
  getRegistrySize: vi.fn(() => 540),
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

  it('renders FleetOverview component', () => {
    renderPage()
    expect(screen.getByTestId('fleet-overview')).toBeInTheDocument()
  })

  it('renders FleetGrid component', () => {
    renderPage()
    expect(screen.getByTestId('fleet-grid')).toBeInTheDocument()
  })

  it('renders TaskQueuePanel component', () => {
    renderPage()
    expect(screen.getByTestId('task-queue-panel')).toBeInTheDocument()
  })

  it('renders BudgetDashboard component', () => {
    renderPage()
    expect(screen.getByTestId('budget-dashboard')).toBeInTheDocument()
  })

  it('renders AlertPanel component', () => {
    renderPage()
    expect(screen.getByTestId('alert-panel')).toBeInTheDocument()
  })

  it('renders ActivityFeed component', () => {
    renderPage()
    expect(screen.getByTestId('activity-feed')).toBeInTheDocument()
  })

  it('renders Active Fleet section title', () => {
    renderPage()
    expect(screen.getByText('Active Fleet')).toBeInTheDocument()
  })

  it('renders Task Queue section title', () => {
    renderPage()
    expect(screen.getByText('Task Queue')).toBeInTheDocument()
  })

  it('renders Budget section title', () => {
    renderPage()
    expect(screen.getByText('Budget')).toBeInTheDocument()
  })

  it('renders Alerts section title', () => {
    renderPage()
    expect(screen.getByText('Alerts')).toBeInTheDocument()
  })

  it('renders Spawn Agent button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Spawn Agent' })).toBeInTheDocument()
  })
})
