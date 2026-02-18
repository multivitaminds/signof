import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import { useAppStore } from './stores/useAppStore'

vi.mock('./features/workspace/stores/useWorkspaceStore', () => ({
  useWorkspaceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ pages: {}, blocks: {} }),
}))

vi.mock('./features/workspace/components/PageTree/PageTree', () => ({
  default: () => null,
}))

// Mock cross-module service (used by HomePage)
vi.mock('./lib/crossModuleService', () => ({
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
vi.mock('./features/auth/stores/useAuthStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: { name: 'Sam Lightson' }, onboardingComplete: true }),
}))

// Mock pull-to-refresh hook
vi.mock('./hooks/usePullToRefresh', () => ({
  usePullToRefresh: () => ({ isRefreshing: false, pullDistance: 0, ref: { current: null } }),
}))

// Mock useIsMobile hook
vi.mock('./hooks/useMediaQuery', () => ({
  useIsMobile: () => false,
}))

// Mock scheduling store (used by HomePage)
vi.mock('./features/scheduling/stores/useSchedulingStore', () => ({
  useSchedulingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      bookings: [],
      eventTypes: [],
    }),
}))

// Mock DashboardWidgets
vi.mock('./components/DashboardWidgets/UpcomingDeadlines', () => ({
  default: () => <div data-testid="upcoming-deadlines">Upcoming Deadlines</div>,
}))

vi.mock('./components/DashboardWidgets/RecentActivity', () => ({
  default: () => <div data-testid="recent-activity">Recent Activity</div>,
}))

vi.mock('./components/DashboardWidgets/QuickStats', () => ({
  default: () => <div data-testid="quick-stats">Quick Stats</div>,
}))

vi.mock('./components/DashboardWidgets/AIInsights', () => ({
  default: () => <div data-testid="ai-insights">Copilot Insights</div>,
}))

// Mock activity components
vi.mock('./features/activity/components/ActivityFeed/ActivityFeed', () => ({
  default: () => <div data-testid="activity-feed">Activity Feed</div>,
}))

vi.mock('./features/activity/components/DashboardCharts/DashboardCharts', () => ({
  default: () => <div data-testid="dashboard-charts">Dashboard Charts</div>,
}))

// Mock widget components
vi.mock('./components/StatsOverview/StatsOverview', () => ({
  default: () => <div data-testid="stats-overview">Stats Overview</div>,
}))

vi.mock('./components/QuickActions/QuickActions', () => ({
  default: () => <div data-testid="quick-actions">Quick Actions</div>,
}))

vi.mock('./components/RecentItems/RecentItems', () => ({
  default: () => <div data-testid="recent-items">Recent Items</div>,
}))

// Mock AIFeatureWidget
vi.mock('./features/ai/components/AIFeatureWidget/AIFeatureWidget', () => ({
  default: () => null,
}))

function renderWithRouter(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('Orchestree App', () => {
  beforeEach(() => {
    useAppStore.setState({
      sidebarExpanded: true,
      shortcutHelpOpen: false,
      commandPaletteOpen: false,
    })
  })

  it('renders the sidebar with brand', () => {
    renderWithRouter()
    expect(screen.getByText('Orchestree')).toBeInTheDocument()
  })

  it('shows the command palette shortcut', () => {
    renderWithRouter()
    expect(screen.getByText(/⌘K/i)).toBeInTheDocument()
  })

  it('renders the 404 page for unknown routes', () => {
    renderWithRouter(['/nonexistent-route'])
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
    expect(screen.getByText('Go Home')).toBeInTheDocument()
    expect(screen.getByText('Go Back')).toBeInTheDocument()
  })

  it('cycles theme on toggle button click', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    // Default theme is 'system' → icon label = "System theme"
    const themeBtn = screen.getByLabelText('System theme')
    expect(themeBtn).toBeInTheDocument()

    // Cycle: system → light
    await user.click(themeBtn)
    expect(screen.getByLabelText('Light mode')).toBeInTheDocument()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    // Cycle: light → dark
    await user.click(screen.getByLabelText('Light mode'))
    expect(screen.getByLabelText('Dark mode')).toBeInTheDocument()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    // Cycle: dark → system
    await user.click(screen.getByLabelText('Dark mode'))
    expect(screen.getByLabelText('System theme')).toBeInTheDocument()
  })

  it('toggles sidebar with [ keyboard shortcut', () => {
    renderWithRouter()

    // Sidebar starts expanded (pinned) — unpin button visible
    expect(screen.getByLabelText('Unpin sidebar')).toBeInTheDocument()

    // Press [ to toggle (unpin)
    fireEvent.keyDown(document, { key: '[' })
    expect(screen.getByLabelText('Pin sidebar open')).toBeInTheDocument()

    // Press [ again to re-expand (pin)
    fireEvent.keyDown(document, { key: '[' })
    expect(screen.getByLabelText('Unpin sidebar')).toBeInTheDocument()
  })

  it('has a hamburger menu button', () => {
    renderWithRouter()
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })

  it('opens shortcut help with ? key', () => {
    renderWithRouter()

    fireEvent.keyDown(document, { key: '?' })
    expect(useAppStore.getState().shortcutHelpOpen).toBe(true)
  })

  it('does not fire shortcuts when focus is in an input', () => {
    renderWithRouter()

    // Create a temporary input and focus it
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    fireEvent.keyDown(input, { key: '?' })
    expect(useAppStore.getState().shortcutHelpOpen).toBe(false)

    document.body.removeChild(input)
  })

  it('renders breadcrumbs in the topbar', () => {
    renderWithRouter()
    expect(screen.getByLabelText('Breadcrumbs')).toBeInTheDocument()
  })
})
