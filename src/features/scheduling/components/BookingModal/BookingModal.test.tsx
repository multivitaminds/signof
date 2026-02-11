import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookingModal from './BookingModal'
import type { EventType } from '../../types'
import { EventTypeCategory, LocationType, DEFAULT_SCHEDULE } from '../../types'

const mockEventType: EventType = {
  id: 'et-1',
  name: 'Quick Chat',
  description: 'A brief call',
  slug: 'quick-chat',
  category: EventTypeCategory.OneOnOne,
  color: '#4F46E5',
  durationMinutes: 30,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  maxBookingsPerDay: 10,
  minimumNoticeMinutes: 60,
  schedulingWindowDays: 30,
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

describe('BookingModal', () => {
  const defaultProps = {
    eventType: mockEventType,
    bookings: [],
    onBook: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal with event type name', () => {
    render(<BookingModal {...defaultProps} />)
    expect(screen.getByText('Book Quick Chat')).toBeInTheDocument()
  })

  it('renders step indicator', () => {
    render(<BookingModal {...defaultProps} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('renders date input on step 1', () => {
    render(<BookingModal {...defaultProps} />)
    expect(screen.getByLabelText('Select Date')).toBeInTheDocument()
  })

  it('disables Next button when no date and time selected', () => {
    render(<BookingModal {...defaultProps} />)
    expect(screen.getByText('Next')).toBeDisabled()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<BookingModal {...defaultProps} />)
    await user.click(screen.getByLabelText('Close'))
    expect(defaultProps.onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when clicking overlay', async () => {
    const user = userEvent.setup()
    const { container } = render(<BookingModal {...defaultProps} />)
    const overlay = container.querySelector('.modal-overlay')!
    await user.click(overlay)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})
