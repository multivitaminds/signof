import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ActivityPage from './ActivityPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const sampleActivities = [
  {
    id: 'act-01',
    type: 'document',
    action: 'signed',
    title: 'Employment Agreement signed',
    description: 'Jane Smith signed the Employment Agreement',
    entityId: '1',
    entityPath: '/documents/1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    userId: 'u-jane',
    userName: 'Jane Smith',
    icon: '\u270D\uFE0F',
  },
  {
    id: 'act-02',
    type: 'page',
    action: 'updated',
    title: 'Product Roadmap updated',
    description: 'Alex Chen edited the Product Roadmap',
    entityId: 'p-roadmap',
    entityPath: '/pages/p-roadmap',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    userId: 'u-alex',
    userName: 'Alex Chen',
    icon: '\u{1F4C4}',
  },
  {
    id: 'act-03',
    type: 'issue',
    action: 'created',
    title: 'Fix login redirect loop',
    description: 'Sam Wilson created issue SIG-142',
    entityId: 'i-142',
    entityPath: '/projects',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    userId: 'u-sam',
    userName: 'Sam Wilson',
    icon: '\u{1F6A8}',
  },
  {
    id: 'act-04',
    type: 'booking',
    action: 'completed',
    title: 'Team standup confirmed',
    description: 'Daily standup with engineering team was confirmed',
    entityId: 'b-standup',
    entityPath: '/calendar/bookings',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    userId: 'u-maria',
    userName: 'Maria Garcia',
    icon: '\u{1F4C5}',
  },
]

let mockActivities = sampleActivities

vi.mock('../stores/useActivityStore', () => ({
  useActivityStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activities: mockActivities,
    }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ActivityPage />
    </MemoryRouter>
  )
}

describe('ActivityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActivities = sampleActivities
  })

  it('renders the page header', () => {
    renderPage()
    expect(screen.getByText('Activity')).toBeInTheDocument()
    expect(screen.getByText('Track all changes across your workspace')).toBeInTheDocument()
  })

  it('renders filter tabs', () => {
    renderPage()
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Pages')).toBeInTheDocument()
    expect(screen.getByText('Issues')).toBeInTheDocument()
    expect(screen.getByText('Bookings')).toBeInTheDocument()
  })

  it('renders date range buttons', () => {
    renderPage()
    // "Today" also appears as a timeline date separator, so use getAllByText
    const todayElements = screen.getAllByText('Today')
    expect(todayElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('This Month')).toBeInTheDocument()
    expect(screen.getByText('All Time')).toBeInTheDocument()
  })

  it('shows activity count', () => {
    renderPage()
    expect(screen.getByText('4 activities')).toBeInTheDocument()
  })

  it('renders activity items', () => {
    renderPage()
    expect(screen.getByText('Employment Agreement signed')).toBeInTheDocument()
    expect(screen.getByText('Product Roadmap updated')).toBeInTheDocument()
    expect(screen.getByText('Fix login redirect loop')).toBeInTheDocument()
    expect(screen.getByText('Team standup confirmed')).toBeInTheDocument()
  })

  it('filters activities when a filter tab is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText('Documents'))

    expect(screen.getByText('Employment Agreement signed')).toBeInTheDocument()
    expect(screen.queryByText('Product Roadmap updated')).not.toBeInTheDocument()
    expect(screen.queryByText('Fix login redirect loop')).not.toBeInTheDocument()
    expect(screen.queryByText('Team standup confirmed')).not.toBeInTheDocument()
    expect(screen.getByText('1 activity')).toBeInTheDocument()
  })

  it('navigates when an activity card is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText('Employment Agreement signed'))

    expect(mockNavigate).toHaveBeenCalledWith('/documents/1')
  })

  it('shows empty state when no activities match filter', async () => {
    const user = userEvent.setup()
    mockActivities = [
      {
        id: 'act-01',
        type: 'document',
        action: 'signed',
        title: 'Test Doc',
        description: 'Test',
        entityId: '1',
        entityPath: '/documents/1',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        userId: 'u-jane',
        userName: 'Jane',
        icon: '\u270D\uFE0F',
      },
    ]
    renderPage()

    await user.click(screen.getByText('Issues'))

    expect(screen.getByText('No activities to show for this filter.')).toBeInTheDocument()
  })
})
