import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NoShowManager from './NoShowManager'
import type { Booking, EventType } from '../../types'
import { BookingStatus, EventTypeCategory, LocationType, DEFAULT_SCHEDULE } from '../../types'

const mockEventTypes: EventType[] = [
  {
    id: 'et-1',
    name: 'Quick Chat',
    description: 'A brief chat',
    slug: 'quick-chat',
    category: EventTypeCategory.OneOnOne,
    color: '#3B82F6',
    durationMinutes: 15,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
    maxBookingsPerDay: 8,
    minimumNoticeMinutes: 60,
    schedulingWindowDays: 30,
    location: LocationType.Phone,
    schedule: DEFAULT_SCHEDULE,
    dateOverrides: [],
    customQuestions: [],
    maxAttendees: 1,
    waitlistEnabled: false,
    maxWaitlist: 5,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'et-2',
    name: 'Product Demo',
    description: 'A product demo',
    slug: 'product-demo',
    category: EventTypeCategory.OneOnOne,
    color: '#059669',
    durationMinutes: 30,
    bufferBeforeMinutes: 10,
    bufferAfterMinutes: 10,
    maxBookingsPerDay: 4,
    minimumNoticeMinutes: 120,
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
  },
]

// All bookings are in the past (before today 2026-02-11)
const mockBookings: Booking[] = [
  {
    id: 'bk-1',
    eventTypeId: 'et-1',
    date: '2026-02-01',
    startTime: '10:00',
    endTime: '10:15',
    timezone: 'America/New_York',
    status: BookingStatus.Confirmed,
    attendees: [{ name: 'Alice Johnson', email: 'alice@example.com', timezone: 'America/New_York' }],
    notes: '',
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-01-25T00:00:00Z',
  },
  {
    id: 'bk-2',
    eventTypeId: 'et-1',
    date: '2026-02-02',
    startTime: '14:00',
    endTime: '14:15',
    timezone: 'America/New_York',
    status: BookingStatus.NoShow,
    attendees: [{ name: 'Bob Chen', email: 'bob@example.com', timezone: 'America/New_York' }],
    notes: '',
    createdAt: '2026-01-26T00:00:00Z',
    updatedAt: '2026-01-26T00:00:00Z',
  },
  {
    id: 'bk-3',
    eventTypeId: 'et-2',
    date: '2026-02-03',
    startTime: '09:00',
    endTime: '09:30',
    timezone: 'America/New_York',
    status: BookingStatus.Completed,
    attendees: [{ name: 'Carol Davis', email: 'carol@example.com', timezone: 'America/New_York' }],
    notes: '',
    createdAt: '2026-01-27T00:00:00Z',
    updatedAt: '2026-01-27T00:00:00Z',
  },
  {
    id: 'bk-future',
    eventTypeId: 'et-1',
    date: '2030-12-31',
    startTime: '10:00',
    endTime: '10:15',
    timezone: 'America/New_York',
    status: BookingStatus.Confirmed,
    attendees: [{ name: 'Future Person', email: 'future@example.com', timezone: 'America/New_York' }],
    notes: '',
    createdAt: '2026-01-28T00:00:00Z',
    updatedAt: '2026-01-28T00:00:00Z',
  },
]

describe('NoShowManager', () => {
  it('renders summary stats', () => {
    render(
      <NoShowManager
        bookings={mockBookings}
        eventTypes={mockEventTypes}
        onMarkNoShow={vi.fn()}
        onUndoNoShow={vi.fn()}
      />
    )

    expect(screen.getByText('Past Bookings')).toBeInTheDocument()
    expect(screen.getByText('No-Shows')).toBeInTheDocument()
    expect(screen.getByText('No-Show Rate')).toBeInTheDocument()
    // 3 past bookings, 1 no-show => 33%
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('33%')).toBeInTheDocument()
  })

  it('renders past bookings but not future ones', () => {
    render(
      <NoShowManager
        bookings={mockBookings}
        eventTypes={mockEventTypes}
        onMarkNoShow={vi.fn()}
        onUndoNoShow={vi.fn()}
      />
    )

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Bob Chen')).toBeInTheDocument()
    expect(screen.getByText('Carol Davis')).toBeInTheDocument()
    expect(screen.queryByText('Future Person')).not.toBeInTheDocument()
  })

  it('shows Mark No-Show button for confirmed/completed bookings', () => {
    render(
      <NoShowManager
        bookings={mockBookings}
        eventTypes={mockEventTypes}
        onMarkNoShow={vi.fn()}
        onUndoNoShow={vi.fn()}
      />
    )

    const markButtons = screen.getAllByText('Mark No-Show')
    // Alice (confirmed) and Carol (completed) get Mark No-Show buttons
    expect(markButtons).toHaveLength(2)
  })

  it('shows Undo button for no-show bookings', () => {
    render(
      <NoShowManager
        bookings={mockBookings}
        eventTypes={mockEventTypes}
        onMarkNoShow={vi.fn()}
        onUndoNoShow={vi.fn()}
      />
    )

    const undoButtons = screen.getAllByText('Undo')
    expect(undoButtons).toHaveLength(1)
  })

  it('calls onMarkNoShow when Mark No-Show is clicked', async () => {
    const user = userEvent.setup()
    const onMarkNoShow = vi.fn()

    render(
      <NoShowManager
        bookings={mockBookings}
        eventTypes={mockEventTypes}
        onMarkNoShow={onMarkNoShow}
        onUndoNoShow={vi.fn()}
      />
    )

    const markButton = screen.getByLabelText('Mark Alice Johnson as no-show')
    await user.click(markButton)
    expect(onMarkNoShow).toHaveBeenCalledWith('bk-1')
  })

  it('calls onUndoNoShow when Undo is clicked', async () => {
    const user = userEvent.setup()
    const onUndoNoShow = vi.fn()

    render(
      <NoShowManager
        bookings={mockBookings}
        eventTypes={mockEventTypes}
        onMarkNoShow={vi.fn()}
        onUndoNoShow={onUndoNoShow}
      />
    )

    const undoButton = screen.getByLabelText('Undo no-show for Bob Chen')
    await user.click(undoButton)
    expect(onUndoNoShow).toHaveBeenCalledWith('bk-2')
  })

  it('filters bookings by event type', async () => {
    const user = userEvent.setup()

    render(
      <NoShowManager
        bookings={mockBookings}
        eventTypes={mockEventTypes}
        onMarkNoShow={vi.fn()}
        onUndoNoShow={vi.fn()}
      />
    )

    const filterSelect = screen.getByLabelText('Filter by event type:')
    await user.selectOptions(filterSelect, 'et-2')

    // Only Carol (Product Demo) should remain
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument()
    expect(screen.queryByText('Bob Chen')).not.toBeInTheDocument()
    expect(screen.getByText('Carol Davis')).toBeInTheDocument()
  })

  it('shows empty state when no past bookings exist', () => {
    render(
      <NoShowManager
        bookings={[]}
        eventTypes={mockEventTypes}
        onMarkNoShow={vi.fn()}
        onUndoNoShow={vi.fn()}
      />
    )

    expect(screen.getByText('No past bookings to display.')).toBeInTheDocument()
  })

  it('displays event type names and color dots', () => {
    render(
      <NoShowManager
        bookings={mockBookings}
        eventTypes={mockEventTypes}
        onMarkNoShow={vi.fn()}
        onUndoNoShow={vi.fn()}
      />
    )

    // 2 in list rows + 1 in the filter dropdown = 3
    expect(screen.getAllByText('Quick Chat')).toHaveLength(3)
    // 1 in list row + 1 in the filter dropdown = 2
    expect(screen.getAllByText('Product Demo')).toHaveLength(2)
  })

  it('displays status badges correctly', () => {
    render(
      <NoShowManager
        bookings={mockBookings}
        eventTypes={mockEventTypes}
        onMarkNoShow={vi.fn()}
        onUndoNoShow={vi.fn()}
      />
    )

    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText('No-Show')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
})
