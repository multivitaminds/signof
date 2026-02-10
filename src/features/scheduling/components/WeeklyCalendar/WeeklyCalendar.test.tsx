import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WeeklyCalendar from './WeeklyCalendar'
import type { Booking, EventType } from '../../types'
import { BookingStatus, EventTypeCategory, DEFAULT_SCHEDULE } from '../../types'

const mockEventTypes: EventType[] = [
  {
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
    schedule: DEFAULT_SCHEDULE,
    dateOverrides: [],
    customQuestions: [],
    maxAttendees: 1,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

const monday = new Date(2026, 1, 9)
const weekDates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(monday)
  d.setDate(monday.getDate() + i)
  return d
})

const mockBookings: Booking[] = [
  {
    id: 'bk-1',
    eventTypeId: 'et-1',
    date: '2026-02-10',
    startTime: '10:00',
    endTime: '10:30',
    timezone: 'UTC',
    status: BookingStatus.Confirmed,
    attendees: [{ name: 'Alice', email: 'a@test.com', timezone: 'UTC' }],
    notes: '',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
]

describe('WeeklyCalendar', () => {
  const defaultProps = {
    weekDates,
    bookings: mockBookings,
    eventTypes: mockEventTypes,
    onTimeSlotClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders day headers', () => {
    render(<WeeklyCalendar {...defaultProps} />)
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
  })

  it('renders time slots', () => {
    render(<WeeklyCalendar {...defaultProps} />)
    const slots = screen.getAllByRole('button')
    expect(slots.length).toBeGreaterThan(0)
  })

  it('calls onTimeSlotClick when clicking a slot', async () => {
    const user = userEvent.setup()
    render(<WeeklyCalendar {...defaultProps} />)
    const slots = screen.getAllByRole('button')
    await user.click(slots[0]!)
    expect(defaultProps.onTimeSlotClick).toHaveBeenCalledOnce()
  })

  it('renders booking blocks', () => {
    const { container } = render(<WeeklyCalendar {...defaultProps} />)
    const blocks = container.querySelectorAll('.weekly-calendar__booking-block')
    expect(blocks.length).toBe(1)
  })

  it('shows event type name on booking block', () => {
    render(<WeeklyCalendar {...defaultProps} />)
    expect(screen.getByText('Quick Chat')).toBeInTheDocument()
  })
})
