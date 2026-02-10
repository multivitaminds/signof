import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ActivityFeed from './ActivityFeed'

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

function renderFeed(props: { maxItems?: number; showFilters?: boolean } = {}) {
  return render(
    <MemoryRouter>
      <ActivityFeed {...props} />
    </MemoryRouter>
  )
}

describe('ActivityFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActivities = sampleActivities
  })

  it('renders activity items with titles and descriptions', () => {
    renderFeed()
    expect(screen.getByText('Employment Agreement signed')).toBeInTheDocument()
    expect(screen.getByText('Product Roadmap updated')).toBeInTheDocument()
    expect(screen.getByText('Fix login redirect loop')).toBeInTheDocument()
  })

  it('renders user names and time ago text', () => {
    renderFeed()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Alex Chen')).toBeInTheDocument()
    expect(screen.getByText('Sam Wilson')).toBeInTheDocument()
  })

  it('renders filter tabs by default', () => {
    renderFeed()
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Pages')).toBeInTheDocument()
    expect(screen.getByText('Issues')).toBeInTheDocument()
    expect(screen.getByText('Bookings')).toBeInTheDocument()
  })

  it('hides filter tabs when showFilters is false', () => {
    renderFeed({ showFilters: false })
    expect(screen.queryByText('Documents')).not.toBeInTheDocument()
    expect(screen.queryByText('Pages')).not.toBeInTheDocument()
  })

  it('filters activities when a filter tab is clicked', async () => {
    const user = userEvent.setup()
    renderFeed()

    // Click "Documents" filter
    await user.click(screen.getByText('Documents'))

    // Only document type activities should be visible
    expect(screen.getByText('Employment Agreement signed')).toBeInTheDocument()
    expect(screen.queryByText('Product Roadmap updated')).not.toBeInTheDocument()
    expect(screen.queryByText('Fix login redirect loop')).not.toBeInTheDocument()
  })

  it('navigates when an activity item is clicked', async () => {
    const user = userEvent.setup()
    renderFeed()

    await user.click(screen.getByText('Employment Agreement signed'))

    expect(mockNavigate).toHaveBeenCalledWith('/documents/1')
  })

  it('shows empty state when there are no activities', () => {
    mockActivities = []
    renderFeed()

    expect(screen.getByText('No activity yet')).toBeInTheDocument()
    expect(screen.getByText(/Activity from documents, pages, issues/)).toBeInTheDocument()
  })

  it('shows Load more button when there are more items than maxItems', () => {
    renderFeed({ maxItems: 2 })

    expect(screen.getByText('Load more')).toBeInTheDocument()
    // Only 2 items should be visible initially
    expect(screen.getByText('Employment Agreement signed')).toBeInTheDocument()
    expect(screen.getByText('Product Roadmap updated')).toBeInTheDocument()
  })
})
