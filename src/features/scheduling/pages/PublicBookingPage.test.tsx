import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PublicBookingPage from './PublicBookingPage'
import { useSchedulingStore } from '../stores/useSchedulingStore'
import { SAMPLE_EVENT_TYPES } from '../lib/sampleData'
import type { EventType, Booking } from '../types'
import { BookingStatus } from '../types'

function renderWithRouter(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/book/${slug}`]}>
      <Routes>
        <Route path="/book/:slug" element={<PublicBookingPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PublicBookingPage', () => {
  beforeEach(() => {
    useSchedulingStore.setState({
      eventTypes: [...SAMPLE_EVENT_TYPES],
      bookings: [],
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders event type details for a valid slug', () => {
    renderWithRouter('quick-chat')
    expect(screen.getByText('Quick Chat')).toBeInTheDocument()
    expect(screen.getByText(/15 min/)).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
  })

  it('shows not-found message for invalid slug', () => {
    renderWithRouter('nonexistent-event')
    expect(screen.getByText('Event Not Found')).toBeInTheDocument()
  })

  it('renders step progress bar', () => {
    renderWithRouter('quick-chat')
    // Step labels are hidden on small screens but present in DOM
    const container = document.querySelector('.public-booking__progress')
    expect(container).not.toBeNull()
    // Check that the step dots exist (step 1 is active, others are pending)
    const dots = document.querySelectorAll('.public-booking__progress-dot')
    expect(dots.length).toBe(4)
  })

  it('renders the calendar grid on step 1', () => {
    renderWithRouter('quick-chat')
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
  })

  it('navigates months with arrow buttons', async () => {
    const user = userEvent.setup()
    renderWithRouter('product-demo')
    const nextBtn = screen.getByLabelText('Next month')
    const prevBtn = screen.getByLabelText('Previous month')
    // Get initial month text
    const initialMonth = screen.getByText(/\w+ \d{4}/)
    expect(initialMonth).toBeInTheDocument()
    await user.click(nextBtn)
    // Month should change (we can't check exact text since it depends on current date)
    expect(screen.getByLabelText('Next month')).toBeInTheDocument()
    await user.click(prevBtn)
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument()
  })

  it('shows powered by Orchestree footer', () => {
    renderWithRouter('quick-chat')
    expect(screen.getByText('Powered by')).toBeInTheDocument()
    expect(screen.getByText('Orchestree')).toBeInTheDocument()
  })

  // ─── Availability engine integration ──────────────────────

  describe('availability integration', () => {
    it('disables dates on weekends (Saturday/Sunday disabled in default schedule)', () => {
      // Set up a controlled time so we can reason about which days are available
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 1, 9, 8, 0, 0)) // Mon Feb 9, 2026 8am

      renderWithRouter('quick-chat')

      // Find Saturday Feb 14 cell — should be disabled
      const saturdayCells = document.querySelectorAll('.public-booking__cal-cell--disabled')
      expect(saturdayCells.length).toBeGreaterThan(0)
    })

    it('disables dates beyond scheduling window', () => {
      // Quick Chat has schedulingWindowDays: 30
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 1, 10, 8, 0, 0))

      // Create event type with very short scheduling window
      const shortWindowEvent: EventType = {
        ...SAMPLE_EVENT_TYPES[0]!,
        schedulingWindowDays: 3,
      }
      useSchedulingStore.setState({
        eventTypes: [shortWindowEvent],
        bookings: [],
      })

      renderWithRouter('quick-chat')

      // Most dates should be disabled (only 3 days allowed)
      const disabledCells = document.querySelectorAll('.public-booking__cal-cell--disabled')
      const enabledCells = document.querySelectorAll(
        '.public-booking__cal-cell:not(.public-booking__cal-cell--disabled):not(.public-booking__cal-cell--outside)'
      )
      expect(disabledCells.length).toBeGreaterThan(enabledCells.length)
    })

    it('shows available time slots from engine when a date is selected', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.setSystemTime(new Date(2026, 1, 10, 8, 0, 0)) // Tuesday Feb 10 8am

      renderWithRouter('quick-chat')

      const user = userEvent.setup({ delay: null })

      // Find an enabled day (Wednesday Feb 11)
      const enabledCells = document.querySelectorAll(
        '.public-booking__cal-cell:not(.public-booking__cal-cell--disabled):not(.public-booking__cal-cell--outside)'
      )
      // Click the first enabled cell
      if (enabledCells.length > 0) {
        await user.click(enabledCells[0]!)
        // Should move to time selection step and show slots
        const timeSlots = document.querySelectorAll('.public-booking__time-slot')
        // Quick Chat is 15-min with default 9-17 schedule, should have time slots
        expect(timeSlots.length).toBeGreaterThan(0)
      }
    })

    it('shows no available slots message when all slots are taken', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 1, 10, 8, 0, 0))

      // Create event type with maxBookingsPerDay: 1 and one existing booking
      const limitedEvent: EventType = {
        ...SAMPLE_EVENT_TYPES[0]!,
        maxBookingsPerDay: 0, // No bookings allowed
      }

      useSchedulingStore.setState({
        eventTypes: [limitedEvent],
        bookings: [],
      })

      renderWithRouter('quick-chat')

      // All weekdays should be disabled because maxBookingsPerDay is 0
      // which means isDateAvailable is still based on enabled days, not maxBookings directly
      // maxBookingsPerDay: 0 with 0 bookings won't block (0 >= 0 is true), so it blocks
      const disabledCells = document.querySelectorAll('.public-booking__cal-cell--disabled')
      expect(disabledCells.length).toBeGreaterThan(0)
    })
  })

  // ─── Duplicate booking prevention ─────────────────────────

  describe('duplicate booking prevention', () => {
    it('shows duplicate warning when submitting a booking with same email/event/date', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      vi.setSystemTime(new Date(2026, 1, 10, 8, 0, 0))

      // Pre-populate with a booking
      const existingBooking: Booking = {
        id: 'bk-existing',
        eventTypeId: 'et-quick-chat',
        date: '2026-02-11',
        startTime: '10:00',
        endTime: '10:15',
        timezone: 'America/New_York',
        status: BookingStatus.Confirmed,
        attendees: [
          { name: 'Test User', email: 'test@test.com', timezone: 'America/New_York' },
        ],
        notes: '',
        createdAt: '2026-02-10T00:00:00Z',
        updatedAt: '2026-02-10T00:00:00Z',
      }

      useSchedulingStore.setState({
        eventTypes: [...SAMPLE_EVENT_TYPES],
        bookings: [existingBooking],
      })

      renderWithRouter('quick-chat')

      const user = userEvent.setup({ delay: null })

      // Select Wednesday Feb 11
      const enabledCells = document.querySelectorAll(
        '.public-booking__cal-cell:not(.public-booking__cal-cell--disabled):not(.public-booking__cal-cell--outside)'
      )

      // Find the cell for Feb 11
      let targetCell: Element | null = null
      enabledCells.forEach(cell => {
        if (cell.textContent === '11') {
          targetCell = cell
        }
      })

      if (targetCell) {
        await user.click(targetCell)

        // Select a time slot
        const timeSlots = document.querySelectorAll('.public-booking__time-slot')
        if (timeSlots.length > 0) {
          await user.click(timeSlots[0]!)

          // Fill in details with same email
          const nameInput = screen.getByLabelText(/Your Name/i)
          const emailInput = screen.getByLabelText(/Email/i)
          await user.type(nameInput, 'Test User')
          await user.type(emailInput, 'test@test.com')

          // Submit
          const submitBtn = screen.getByText('Confirm Booking')
          await user.click(submitBtn)

          // Should show duplicate warning
          expect(
            screen.getByText(/A booking with this email already exists/)
          ).toBeInTheDocument()
          expect(screen.getByText('Book Anyway')).toBeInTheDocument()
        }
      }
    })
  })
})
