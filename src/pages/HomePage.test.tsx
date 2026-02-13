import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'

// Mock cross-module service
vi.mock('../lib/crossModuleService', () => ({
  getModuleMetrics: () => ({
    documents: { pending: 0, total: 0 },
    projects: { open: 0, total: 0 },
    bookings: { upcoming: 0, total: 0 },
    invoices: { unpaid: 0, total: 0 },
    pages: { total: 0 },
    inbox: { unread: 0 },
  }),
  getUpcomingDeadlines: () => [],
  getCopilotInsights: () => [],
}))

// Mock auth store
vi.mock('../features/auth/stores/useAuthStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: { name: 'Sam Lightson' }, onboardingComplete: true }),
}))

// Mock pull-to-refresh hook
vi.mock('../hooks/usePullToRefresh', () => ({
  usePullToRefresh: () => ({ isRefreshing: false, pullDistance: 0, ref: { current: null } }),
}))

// Mock useIsMobile hook
vi.mock('../hooks/useMediaQuery', () => ({
  useIsMobile: () => false,
}))

// Mock FirstRunChecklist
vi.mock('../components/FirstRunChecklist/FirstRunChecklist', () => ({
  default: () => null,
}))

// Mock DashboardWidgets
vi.mock('../components/DashboardWidgets/UpcomingDeadlines', () => ({
  default: () => <div data-testid="upcoming-deadlines">Upcoming Deadlines</div>,
}))

vi.mock('../components/DashboardWidgets/RecentActivity', () => ({
  default: () => <div data-testid="recent-activity">Recent Activity</div>,
}))

vi.mock('../components/DashboardWidgets/QuickStats', () => ({
  default: () => <div data-testid="quick-stats">Quick Stats</div>,
}))

vi.mock('../components/DashboardWidgets/AIInsights', () => ({
  default: () => <div data-testid="ai-insights">Copilot Insights</div>,
}))

// Mock AIFeatureWidget
vi.mock('../features/ai/components/AIFeatureWidget/AIFeatureWidget', () => ({
  default: () => null,
}))

// Mock the scheduling store
vi.mock('../features/scheduling/stores/useSchedulingStore', () => ({
  useSchedulingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      bookings: [
        {
          id: 'b1',
          eventTypeId: 'et1',
          date: '2099-12-31',
          startTime: '10:00',
          endTime: '11:00',
          status: 'confirmed',
          inviteeName: 'Test',
          inviteeEmail: 'test@test.com',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
      eventTypes: [
        {
          id: 'et1',
          name: 'Team Sync',
          color: '#4F46E5',
          slug: 'team-sync',
          duration: 30,
          description: '',
          location: '',
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
    }),
}))

// Mock the activity feed and dashboard charts
vi.mock('../features/activity/components/ActivityFeed/ActivityFeed', () => ({
  default: () => <div data-testid="activity-feed">Activity Feed</div>,
}))

vi.mock('../features/activity/components/DashboardCharts/DashboardCharts', () => ({
  default: () => <div data-testid="dashboard-charts">Dashboard Charts</div>,
}))

// Mock the widget components to isolate HomePage layout tests
vi.mock('../components/WelcomeBanner/WelcomeBanner', () => ({
  default: () => <div data-testid="welcome-banner">Welcome Banner</div>,
}))

vi.mock('../components/StatsOverview/StatsOverview', () => ({
  default: () => <div data-testid="stats-overview">Stats Overview</div>,
}))

vi.mock('../components/QuickActions/QuickActions', () => ({
  default: () => <div data-testid="quick-actions">Quick Actions</div>,
}))

vi.mock('../components/RecentItems/RecentItems', () => ({
  default: () => <div data-testid="recent-items">Recent Items</div>,
}))

function renderHomePage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <HomePage />
    </MemoryRouter>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the salutation greeting with first name', () => {
    renderHomePage()
    expect(screen.getByText(/Good (morning|afternoon|evening), Sam/)).toBeInTheDocument()
  })

  it('renders the welcome banner', () => {
    renderHomePage()
    expect(screen.getByTestId('welcome-banner')).toBeInTheDocument()
  })

  it('renders the stats overview', () => {
    renderHomePage()
    expect(screen.getByTestId('stats-overview')).toBeInTheDocument()
  })

  it('renders the quick actions section', () => {
    renderHomePage()
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
  })

  it('renders the recent items feed', () => {
    renderHomePage()
    expect(screen.getByTestId('recent-items')).toBeInTheDocument()
  })

  it('renders the activity feed sidebar', () => {
    renderHomePage()
    expect(screen.getByTestId('activity-feed')).toBeInTheDocument()
    expect(screen.getByText('Activity')).toBeInTheDocument()
  })

  it('renders upcoming bookings section', () => {
    renderHomePage()
    expect(screen.getByText('Upcoming Bookings')).toBeInTheDocument()
    expect(screen.getByText('Team Sync')).toBeInTheDocument()
  })

  it('renders the dashboard charts overview section', () => {
    renderHomePage()
    expect(screen.getByTestId('dashboard-charts')).toBeInTheDocument()
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('renders the two-column layout grid', () => {
    const { container } = renderHomePage()
    const mainGrid = container.querySelector('.home-page__main-grid')
    expect(mainGrid).toBeInTheDocument()
    const mainCol = container.querySelector('.home-page__main-col')
    const sidebarCol = container.querySelector('.home-page__sidebar-col')
    expect(mainCol).toBeInTheDocument()
    expect(sidebarCol).toBeInTheDocument()
  })
})
