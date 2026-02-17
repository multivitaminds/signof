import { render, screen } from '@testing-library/react'
import QuickStatsWidget from './QuickStatsWidget'

// Mock stores
vi.mock('../../../../stores/useDocumentStore', () => ({
  useDocumentStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      documents: [
        { id: '1', status: 'pending', updatedAt: '2026-01-01' },
        { id: '2', status: 'completed', updatedAt: '2026-01-01' },
        { id: '3', status: 'sent', updatedAt: '2026-01-01' },
      ],
    }),
}))

vi.mock('../../../projects/stores/useProjectStore', () => ({
  useProjectStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      issues: {
        'i-1': { id: 'i-1', status: 'in_progress', priority: 'high' },
        'i-2': { id: 'i-2', status: 'todo', priority: 'medium' },
        'i-3': { id: 'i-3', status: 'done', priority: 'low' },
      },
    }),
}))

vi.mock('../../../scheduling/stores/useSchedulingStore', () => ({
  useSchedulingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      bookings: [
        { id: 'b-1', status: 'confirmed', date: '2099-12-31', startTime: '10:00' },
        { id: 'b-2', status: 'cancelled', date: '2099-12-31', startTime: '11:00' },
      ],
    }),
}))

vi.mock('../../../clawgpt/stores/useFleetStore', () => ({
  useFleetStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activeInstances: {
        'inst-1': { instanceId: 'inst-1', status: 'working' },
        'inst-2': { instanceId: 'inst-2', status: 'idle' },
      },
    }),
}))

vi.mock('../../../clawgpt/types', () => ({
  FleetAgentStatus: {
    Working: 'working',
    Idle: 'idle',
    Spawning: 'spawning',
    Error: 'error',
    Retiring: 'retiring',
    WaitingApproval: 'waiting_approval',
  },
}))

vi.mock('../../../../types', () => ({
  ACTIVE_STATUSES: ['draft', 'pending', 'sent', 'delivered', 'viewed'],
}))

describe('QuickStatsWidget', () => {
  it('renders stat cards with correct counts', () => {
    const { container } = render(<QuickStatsWidget />)

    // Documents Pending: 2 (pending + sent are in ACTIVE_STATUSES)
    expect(screen.getByText('Documents Pending')).toBeInTheDocument()

    // Open Issues: 2 (in_progress + todo, not done)
    expect(screen.getByText('Open Issues')).toBeInTheDocument()

    // Upcoming Meetings: 1 (only confirmed + future date)
    expect(screen.getByText('Upcoming Meetings')).toBeInTheDocument()

    // Active Agents: 2 (working + idle)
    expect(screen.getByText('Active Agents')).toBeInTheDocument()

    // Verify values via container query to avoid text duplication issues
    const values = container.querySelectorAll('.quick-stats-widget__value')
    expect(values).toHaveLength(4)
    const valueTexts = Array.from(values).map((el) => el.textContent)
    expect(valueTexts).toEqual(['2', '2', '1', '2'])
  })

  it('renders the region with aria label', () => {
    render(<QuickStatsWidget />)
    expect(screen.getByRole('region', { name: /quick stats/i })).toBeInTheDocument()
  })

  it('renders all 4 stat labels', () => {
    render(<QuickStatsWidget />)
    expect(screen.getByText('Documents Pending')).toBeInTheDocument()
    expect(screen.getByText('Open Issues')).toBeInTheDocument()
    expect(screen.getByText('Upcoming Meetings')).toBeInTheDocument()
    expect(screen.getByText('Active Agents')).toBeInTheDocument()
  })
})
