import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UpcomingBookings from './UpcomingBookings'
import type { Booking, EventType } from '../../types'
import {
  BookingStatus,
  EventTypeCategory,
  LocationType,
  DEFAULT_SCHEDULE,
} from '../../types'

const futureDate = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})()

const mockEventTypes: EventType[] = [
  {
    id: 'et-1',
    name: 'Quick Chat',
    description: 'A brief call',
    slug: 'quick-chat',
    category: EventTypeCategory.OneOnOne,
    color: '#3B82F6',
    durationMinutes: 15,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    maxBookingsPerDay: 10,
    minimumNoticeMinutes: 0,
    schedulingWindowDays: 60,
    location: LocationType.Phone,
    schedule: DEFAULT_SCHEDULE,
    dateOverrides: [],
    customQuestions: [],
    maxAttendees: 1,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

const mockBookings: Booking[] = [
  {
    id: 'bk-1',
    eventTypeId: 'et-1',
    date: futureDate,
    startTime: '10:00',
    endTime: '10:15',
    timezone: 'America/New_York',
    status: BookingStatus.Confirmed,
    attendees: [
      { name: 'Alice Johnson', email: 'alice@test.com', timezone: 'UTC' },
    ],
    notes: '',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'bk-2',
    eventTypeId: 'et-1',
    date: futureDate,
    startTime: '14:00',
    endTime: '14:15',
    timezone: 'America/New_York',
    status: BookingStatus.Confirmed,
    attendees: [
      { name: 'Bob Chen', email: 'bob@test.com', timezone: 'UTC' },
    ],
    notes: '',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
]

describe('UpcomingBookings', () => {
  const defaultProps = {
    bookings: mockBookings,
    eventTypes: mockEventTypes,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upcoming bookings with event type name', () => {
    render(<UpcomingBookings {...defaultProps} />)
    expect(screen.getByText('Upcoming Bookings')).toBeInTheDocument()
    const cards = screen.getAllByText('Quick Chat')
    expect(cards.length).toBe(2)
  })

  it('shows attendee names on cards', () => {
    render(<UpcomingBookings {...defaultProps} />)
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Bob Chen')).toBeInTheDocument()
  })

  it('shows empty state when no upcoming bookings', () => {
    render(
      <UpcomingBookings
        bookings={[]}
        eventTypes={mockEventTypes}
      />
    )
    expect(screen.getByText('No upcoming bookings')).toBeInTheDocument()
  })

  it('shows View all button when onViewAll is provided', async () => {
    const user = userEvent.setup()
    const onViewAll = vi.fn()
    render(<UpcomingBookings {...defaultProps} onViewAll={onViewAll} />)
    const viewAllBtn = screen.getByText('View all')
    expect(viewAllBtn).toBeInTheDocument()
    await user.click(viewAllBtn)
    expect(onViewAll).toHaveBeenCalledOnce()
  })

  it('shows status badge on each card', () => {
    render(<UpcomingBookings {...defaultProps} />)
    const badges = screen.getAllByText('Confirmed')
    expect(badges.length).toBe(2)
  })
})
