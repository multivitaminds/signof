import { render, screen } from '@testing-library/react'
import BookingAnalyticsPage from './BookingAnalyticsPage'
import { useSchedulingStore } from '../stores/useSchedulingStore'
import { SAMPLE_EVENT_TYPES, SAMPLE_BOOKINGS } from '../lib/sampleData'

describe('BookingAnalyticsPage', () => {
  beforeEach(() => {
    useSchedulingStore.setState({
      eventTypes: [...SAMPLE_EVENT_TYPES],
      bookings: [...SAMPLE_BOOKINGS],
    })
  })

  it('renders the BookingAnalytics component', () => {
    render(<BookingAnalyticsPage />)
    expect(screen.getByText('Booking Analytics')).toBeInTheDocument()
  })

  it('shows this month stat card', () => {
    render(<BookingAnalyticsPage />)
    expect(screen.getByText('This month')).toBeInTheDocument()
  })

  it('shows most popular stat card', () => {
    render(<BookingAnalyticsPage />)
    expect(screen.getByText(/Most popular/)).toBeInTheDocument()
  })

  it('shows popular time stat card', () => {
    render(<BookingAnalyticsPage />)
    expect(screen.getByText('Popular time')).toBeInTheDocument()
  })

  it('shows conversion rate stat card', () => {
    render(<BookingAnalyticsPage />)
    expect(screen.getByText('Conversion rate')).toBeInTheDocument()
  })

  it('shows bookings by day chart', () => {
    render(<BookingAnalyticsPage />)
    expect(screen.getByText('Bookings by Day')).toBeInTheDocument()
  })

  it('shows event type distribution chart', () => {
    render(<BookingAnalyticsPage />)
    expect(screen.getByText('Event Type Distribution')).toBeInTheDocument()
  })

  it('renders with empty bookings', () => {
    useSchedulingStore.setState({
      eventTypes: [...SAMPLE_EVENT_TYPES],
      bookings: [],
    })
    render(<BookingAnalyticsPage />)
    expect(screen.getByText('This month')).toBeInTheDocument()
    // With no bookings, the stat value should be 0
    const zeroElements = screen.getAllByText('0')
    expect(zeroElements.length).toBeGreaterThanOrEqual(1)
  })
})
