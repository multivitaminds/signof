import { render, screen } from '@testing-library/react'
import BookingAnalytics from './BookingAnalytics'
import { useSchedulingStore } from '../../stores/useSchedulingStore'
import { SAMPLE_EVENT_TYPES, SAMPLE_BOOKINGS } from '../../lib/sampleData'

describe('BookingAnalytics', () => {
  beforeEach(() => {
    useSchedulingStore.setState({
      eventTypes: [...SAMPLE_EVENT_TYPES],
      bookings: [...SAMPLE_BOOKINGS],
    })
  })

  it('renders the title and description', () => {
    render(<BookingAnalytics />)

    expect(screen.getByText('Booking Analytics')).toBeInTheDocument()
    expect(screen.getByText(/overview of your booking performance/i)).toBeInTheDocument()
  })

  it('renders stat cards', () => {
    render(<BookingAnalytics />)

    expect(screen.getByText('This month')).toBeInTheDocument()
    expect(screen.getByText(/most popular/i)).toBeInTheDocument()
    expect(screen.getByText('Popular time')).toBeInTheDocument()
    expect(screen.getByText('Conversion rate')).toBeInTheDocument()
  })

  it('renders the bar chart section', () => {
    render(<BookingAnalytics />)

    expect(screen.getByText('Bookings by Day')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /bar chart/i })).toBeInTheDocument()
  })

  it('renders the donut chart section', () => {
    render(<BookingAnalytics />)

    expect(screen.getByText('Event Type Distribution')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /donut chart/i })).toBeInTheDocument()
  })

  it('shows event type names in the donut legend', () => {
    render(<BookingAnalytics />)

    // Sample data has bookings for various types — check inside legend items
    const legendItems = document.querySelectorAll('.booking-analytics__legend-name')
    expect(legendItems.length).toBeGreaterThan(0)
    const names = Array.from(legendItems).map(el => el.textContent)
    expect(names.some(n => n?.includes('Quick Chat'))).toBe(true)
  })

  it('shows busiest day label when there are bookings', () => {
    render(<BookingAnalytics />)

    expect(screen.getByText(/busiest day:/i)).toBeInTheDocument()
  })

  it('renders properly with empty bookings', () => {
    useSchedulingStore.setState({ bookings: [] })
    render(<BookingAnalytics />)

    expect(screen.getByText('Booking Analytics')).toBeInTheDocument()
    expect(screen.getByText('No booking data yet.')).toBeInTheDocument()
  })
})
