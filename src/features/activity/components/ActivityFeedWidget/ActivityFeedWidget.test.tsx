import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ActivityFeedWidget from './ActivityFeedWidget'

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
]

let mockActivities = sampleActivities

vi.mock('../../stores/useActivityStore', () => ({
  useActivityStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activities: mockActivities,
    }),
}))

function renderWidget(props: { maxItems?: number } = {}) {
  return render(
    <MemoryRouter>
      <ActivityFeedWidget {...props} />
    </MemoryRouter>
  )
}

describe('ActivityFeedWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActivities = sampleActivities
  })

  it('renders the widget title and badge', () => {
    renderWidget()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders activity items with user names', () => {
    renderWidget()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Alex Chen')).toBeInTheDocument()
    expect(screen.getByText('Sam Wilson')).toBeInTheDocument()
  })

  it('limits displayed items to maxItems', () => {
    renderWidget({ maxItems: 2 })
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Alex Chen')).toBeInTheDocument()
    expect(screen.queryByText('Sam Wilson')).not.toBeInTheDocument()
  })

  it('shows "View all activity" when there are more items than maxItems', () => {
    renderWidget({ maxItems: 2 })
    expect(screen.getByText('View all activity')).toBeInTheDocument()
  })

  it('does not show "View all activity" when all items fit', () => {
    renderWidget({ maxItems: 10 })
    expect(screen.queryByText('View all activity')).not.toBeInTheDocument()
  })

  it('navigates to /activity when "View all activity" is clicked', async () => {
    const user = userEvent.setup()
    renderWidget({ maxItems: 2 })

    await user.click(screen.getByText('View all activity'))

    expect(mockNavigate).toHaveBeenCalledWith('/activity')
  })

  it('navigates to activity entity when item is clicked', async () => {
    const user = userEvent.setup()
    renderWidget()

    await user.click(screen.getByText('Jane Smith'))

    expect(mockNavigate).toHaveBeenCalledWith('/documents/1')
  })

  it('shows empty state when there are no activities', () => {
    mockActivities = []
    renderWidget()

    expect(screen.getByText('No recent activity')).toBeInTheDocument()
  })
})
