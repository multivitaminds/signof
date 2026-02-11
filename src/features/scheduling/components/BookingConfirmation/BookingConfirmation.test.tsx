import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookingConfirmation from './BookingConfirmation'
import type { Booking, EventType } from '../../types'
import { BookingStatus, EventTypeCategory, LocationType, DEFAULT_SCHEDULE } from '../../types'

const mockBooking: Booking = {
  id: 'bk-test-123',
  eventTypeId: 'et-test',
  date: '2026-03-15',
  startTime: '14:00',
  endTime: '14:30',
  timezone: 'America/New_York',
  status: BookingStatus.Confirmed,
  attendees: [
    { name: 'Alice Johnson', email: 'alice@example.com', timezone: 'America/New_York' },
  ],
  notes: 'Test booking',
  createdAt: '2026-03-10T10:00:00Z',
  updatedAt: '2026-03-10T10:00:00Z',
}

const mockEventType: EventType = {
  id: 'et-test',
  name: 'Product Demo',
  description: 'A 30-minute walkthrough',
  slug: 'product-demo',
  category: EventTypeCategory.OneOnOne,
  color: '#059669',
  durationMinutes: 30,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  maxBookingsPerDay: 10,
  minimumNoticeMinutes: 60,
  schedulingWindowDays: 60,
  location: LocationType.Zoom,
  schedule: DEFAULT_SCHEDULE,
  dateOverrides: [],
  customQuestions: [],
  maxAttendees: 1,
  waitlistEnabled: false,
  maxWaitlist: 5,
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('BookingConfirmation', () => {
  it('renders the success message', () => {
    render(<BookingConfirmation booking={mockBooking} eventType={mockEventType} />)

    expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument()
    expect(screen.getByText(/product demo has been scheduled/i)).toBeInTheDocument()
  })

  it('renders event type name', () => {
    render(<BookingConfirmation booking={mockBooking} eventType={mockEventType} />)

    expect(screen.getByText('Product Demo')).toBeInTheDocument()
  })

  it('renders the formatted date', () => {
    render(<BookingConfirmation booking={mockBooking} eventType={mockEventType} />)

    // March 15, 2026 is a Sunday
    expect(screen.getByText(/sunday, march 15, 2026/i)).toBeInTheDocument()
  })

  it('renders the time range with duration', () => {
    render(<BookingConfirmation booking={mockBooking} eventType={mockEventType} />)

    expect(screen.getByText(/2:00 PM - 2:30 PM/)).toBeInTheDocument()
    expect(screen.getByText(/30 min/)).toBeInTheDocument()
  })

  it('renders the location', () => {
    render(<BookingConfirmation booking={mockBooking} eventType={mockEventType} />)

    expect(screen.getByText('Zoom')).toBeInTheDocument()
  })

  it('renders attendee name and email', () => {
    render(<BookingConfirmation booking={mockBooking} eventType={mockEventType} />)

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    // Email appears in both attendee section and email notice
    expect(screen.getAllByText('alice@example.com').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the QR code with booking reference', () => {
    render(<BookingConfirmation booking={mockBooking} eventType={mockEventType} />)

    expect(screen.getByRole('img', { name: /booking reference/i })).toBeInTheDocument()
    expect(screen.getByText(/ref: bk-test-/i)).toBeInTheDocument()
  })

  it('renders email confirmation notice', () => {
    render(<BookingConfirmation booking={mockBooking} eventType={mockEventType} />)

    expect(screen.getByText(/confirmation email/i)).toBeInTheDocument()
    // The email notice contains the email in a <strong> tag
    const notice = document.querySelector('.booking-confirmation__email-notice')
    expect(notice).not.toBeNull()
    expect(notice!.textContent).toContain('alice@example.com')
  })

  it('renders Add to Calendar button', () => {
    render(<BookingConfirmation booking={mockBooking} eventType={mockEventType} />)

    expect(screen.getByText('Add to Calendar')).toBeInTheDocument()
  })

  it('renders Share Booking Link button', () => {
    render(<BookingConfirmation booking={mockBooking} eventType={mockEventType} />)

    expect(screen.getByText('Share Booking Link')).toBeInTheDocument()
  })

  it('renders Reschedule button when onReschedule is provided', () => {
    render(
      <BookingConfirmation
        booking={mockBooking}
        eventType={mockEventType}
        onReschedule={vi.fn()}
      />
    )

    expect(screen.getByText('Reschedule')).toBeInTheDocument()
  })

  it('does not render Reschedule button when onReschedule is not provided', () => {
    render(<BookingConfirmation booking={mockBooking} eventType={mockEventType} />)

    expect(screen.queryByText('Reschedule')).not.toBeInTheDocument()
  })

  it('renders Cancel button when onCancel is provided', () => {
    render(
      <BookingConfirmation
        booking={mockBooking}
        eventType={mockEventType}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onReschedule when Reschedule is clicked', async () => {
    const user = userEvent.setup()
    const onReschedule = vi.fn()
    render(
      <BookingConfirmation
        booking={mockBooking}
        eventType={mockEventType}
        onReschedule={onReschedule}
      />
    )

    await user.click(screen.getByText('Reschedule'))
    expect(onReschedule).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <BookingConfirmation
        booking={mockBooking}
        eventType={mockEventType}
        onCancel={onCancel}
      />
    )

    await user.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('renders Book another time when onBookAnother is provided', () => {
    render(
      <BookingConfirmation
        booking={mockBooking}
        eventType={mockEventType}
        onBookAnother={vi.fn()}
      />
    )

    expect(screen.getByText('Book another time')).toBeInTheDocument()
  })

  it('calls onBookAnother when clicked', async () => {
    const user = userEvent.setup()
    const onBookAnother = vi.fn()
    render(
      <BookingConfirmation
        booking={mockBooking}
        eventType={mockEventType}
        onBookAnother={onBookAnother}
      />
    )

    await user.click(screen.getByText('Book another time'))
    expect(onBookAnother).toHaveBeenCalledOnce()
  })
})
