import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookingsPage from './BookingsPage'
import { useSchedulingStore } from '../stores/useSchedulingStore'
import { SAMPLE_EVENT_TYPES, SAMPLE_BOOKINGS } from '../lib/sampleData'

describe('BookingsPage', () => {
  beforeEach(() => {
    useSchedulingStore.setState({
      eventTypes: [...SAMPLE_EVENT_TYPES],
      bookings: [...SAMPLE_BOOKINGS],
      waitlist: [],
    })
  })

  it('renders the filter tabs', () => {
    render(<BookingsPage />)
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
    expect(screen.getByText('Past')).toBeInTheDocument()
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
  })

  it('renders the search input', () => {
    render(<BookingsPage />)
    expect(screen.getByLabelText('Search bookings')).toBeInTheDocument()
  })

  it('switches to All tab and shows all bookings', async () => {
    const user = userEvent.setup()
    render(<BookingsPage />)

    await user.click(screen.getByText('All'))
    // All bookings should show their event type names
    const quickChats = screen.getAllByText('Quick Chat')
    expect(quickChats.length).toBeGreaterThanOrEqual(1)
  })

  it('switches to Cancelled tab and shows cancelled bookings', async () => {
    const user = userEvent.setup()
    render(<BookingsPage />)

    await user.click(screen.getByText('Cancelled'))
    // bk-5 is cancelled with attendee Grace Hopper
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    // "Cancelled" appears as both the tab label and the booking status badge
    const cancelledElements = screen.getAllByText('Cancelled')
    expect(cancelledElements.length).toBeGreaterThanOrEqual(2)
  })

  it('filters bookings by search query', async () => {
    const user = userEvent.setup()
    render(<BookingsPage />)

    // Switch to All first to see all bookings
    await user.click(screen.getByText('All'))

    await user.type(screen.getByLabelText('Search bookings'), 'Alice')
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    // Other attendees should not appear
    expect(screen.queryByText('Bob Chen')).not.toBeInTheDocument()
  })

  it('shows result count when searching', async () => {
    const user = userEvent.setup()
    render(<BookingsPage />)

    await user.click(screen.getByText('All'))
    await user.type(screen.getByLabelText('Search bookings'), 'Alice')
    expect(screen.getByText(/1 result/)).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<BookingsPage />)

    await user.click(screen.getByText('All'))
    await user.type(screen.getByLabelText('Search bookings'), 'Alice')
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Clear search'))
    expect(screen.getByLabelText('Search bookings')).toHaveValue('')
  })

  it('shows empty state when no bookings match', async () => {
    useSchedulingStore.setState({
      eventTypes: [...SAMPLE_EVENT_TYPES],
      bookings: [],
      waitlist: [],
    })
    render(<BookingsPage />)

    expect(screen.getByText('No bookings yet')).toBeInTheDocument()
  })

  it('shows empty state when search has no results', async () => {
    const user = userEvent.setup()
    render(<BookingsPage />)

    await user.click(screen.getByText('All'))
    await user.type(screen.getByLabelText('Search bookings'), 'zzzznonexistent')
    expect(screen.getByText('No bookings yet')).toBeInTheDocument()
  })
})
