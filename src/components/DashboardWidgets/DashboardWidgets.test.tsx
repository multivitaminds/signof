import { render, screen } from '@testing-library/react'
import UpcomingDeadlines from './UpcomingDeadlines'
import RecentActivity from './RecentActivity'
import QuickStats from './QuickStats'
import AIInsights from './AIInsights'

// Mock useDocumentStore
vi.mock('../../stores/useDocumentStore', () => ({
  useDocumentStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      documents: [
        {
          id: '1',
          name: 'Contract Agreement',
          status: 'pending',
          expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Expired NDA',
          status: 'sent',
          expiresAt: new Date(Date.now() - 86400000).toISOString(),
          createdAt: '2025-12-01T00:00:00Z',
          updatedAt: '2025-12-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'Completed Doc',
          status: 'completed',
          expiresAt: null,
          createdAt: '2025-12-01T00:00:00Z',
          updatedAt: '2025-12-01T00:00:00Z',
        },
      ],
    }),
}))

describe('UpcomingDeadlines', () => {
  it('renders the widget with title', () => {
    render(<UpcomingDeadlines />)
    expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument()
  })

  it('renders the widget with aria-label', () => {
    render(<UpcomingDeadlines />)
    expect(screen.getByLabelText('Upcoming deadlines')).toBeInTheDocument()
  })

  it('shows document deadline items', () => {
    render(<UpcomingDeadlines />)
    expect(screen.getByText('Contract Agreement')).toBeInTheDocument()
  })

  it('shows simulated project deadline items', () => {
    render(<UpcomingDeadlines />)
    expect(screen.getByText('Q1 Review sprint ends')).toBeInTheDocument()
    expect(screen.getByText('Design system milestone')).toBeInTheDocument()
  })

  it('shows simulated booking deadline', () => {
    render(<UpcomingDeadlines />)
    expect(screen.getByText('Team standup')).toBeInTheDocument()
  })
})

describe('RecentActivity', () => {
  it('renders the widget with title', () => {
    render(<RecentActivity />)
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('renders the widget with aria-label', () => {
    render(<RecentActivity />)
    expect(screen.getByLabelText('Recent activity')).toBeInTheDocument()
  })

  it('shows activity items from different modules', () => {
    render(<RecentActivity />)
    expect(screen.getByText('Signed Employment Agreement')).toBeInTheDocument()
    expect(screen.getByText('Created issue: Fix login bug')).toBeInTheDocument()
    expect(screen.getByText('Scheduled Team Sync')).toBeInTheDocument()
    expect(screen.getByText('Edited Meeting Notes page')).toBeInTheDocument()
  })

  it('shows relative timestamps', () => {
    render(<RecentActivity />)
    // At least some items should have relative time
    const items = screen.getAllByText(/ago|just now/)
    expect(items.length).toBeGreaterThan(0)
  })
})

describe('QuickStats', () => {
  it('renders the widget with title', () => {
    render(<QuickStats />)
    expect(screen.getByText('Quick Stats')).toBeInTheDocument()
  })

  it('renders the widget with aria-label', () => {
    render(<QuickStats />)
    expect(screen.getByLabelText('Quick stats')).toBeInTheDocument()
  })

  it('shows docs pending signature stat', () => {
    render(<QuickStats />)
    expect(screen.getByText('Docs pending signature')).toBeInTheDocument()
  })

  it('shows open issues stat', () => {
    render(<QuickStats />)
    expect(screen.getByText('Open issues')).toBeInTheDocument()
  })

  it('shows bookings this week stat', () => {
    render(<QuickStats />)
    expect(screen.getByText('Bookings this week')).toBeInTheDocument()
  })

  it('shows pages edited today stat', () => {
    render(<QuickStats />)
    expect(screen.getByText('Pages edited today')).toBeInTheDocument()
  })

  it('renders stat values', () => {
    render(<QuickStats />)
    // Should have stat values rendered
    const statCards = document.querySelectorAll('.dashboard-widget__stat-value')
    expect(statCards.length).toBe(4)
  })
})

describe('AIInsights', () => {
  it('renders the widget with title', () => {
    render(<AIInsights />)
    expect(screen.getByText('AI Insights')).toBeInTheDocument()
  })

  it('renders the widget with aria-label', () => {
    render(<AIInsights />)
    expect(screen.getByLabelText('AI insights')).toBeInTheDocument()
  })

  it('shows overdue issues insight', () => {
    render(<AIInsights />)
    expect(screen.getByText(/overdue issues/)).toBeInTheDocument()
  })

  it('shows productivity insight', () => {
    render(<AIInsights />)
    expect(screen.getByText(/productivity up/)).toBeInTheDocument()
  })

  it('shows awaiting signature insight when pending docs exist', () => {
    render(<AIInsights />)
    expect(screen.getByText(/awaiting signature/)).toBeInTheDocument()
  })

  it('shows milestone achievement insight', () => {
    render(<AIInsights />)
    expect(screen.getByText(/milestone achieved/)).toBeInTheDocument()
  })
})
