import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'

// Mock cross-module service
vi.mock('../lib/crossModuleService', () => ({
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

// Mock the widget components to isolate HomePage layout tests
vi.mock('../components/QuickActions/QuickActions', () => ({
  default: () => <div data-testid="quick-actions">Quick Actions</div>,
}))

// Mock the DashboardGrid
vi.mock('../features/home/components/DashboardGrid/DashboardGrid', () => ({
  default: () => <div data-testid="dashboard-grid">Dashboard Grid</div>,
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

  it('renders the quick actions section', () => {
    renderHomePage()
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
  })

  it('renders the customizable dashboard grid', () => {
    renderHomePage()
    expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument()
  })

  it('renders upcoming bookings section', () => {
    renderHomePage()
    expect(screen.getByText('Upcoming Bookings')).toBeInTheDocument()
    expect(screen.getByText('Team Sync')).toBeInTheDocument()
  })
})
