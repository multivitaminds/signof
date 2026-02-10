import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MonthlyCalendar from './MonthlyCalendar'
import type { Booking } from '../../types'
import { BookingStatus } from '../../types'

const mockBookings: Booking[] = [
  {
    id: 'bk-1',
    eventTypeId: 'et-1',
    date: '2026-02-10',
    startTime: '10:00',
    endTime: '10:30',
    timezone: 'America/New_York',
    status: BookingStatus.Confirmed,
    attendees: [{ name: 'Alice', email: 'a@test.com', timezone: 'UTC' }],
    notes: '',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
]

describe('MonthlyCalendar', () => {
  const defaultProps = {
    year: 2026,
    month: 2,
    bookings: mockBookings,
    onDateClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders weekday headers', () => {
    render(<MonthlyCalendar {...defaultProps} />)
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
  })

  it('renders the grid with role="grid"', () => {
    render(<MonthlyCalendar {...defaultProps} />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('renders day numbers for the month', () => {
    render(<MonthlyCalendar {...defaultProps} />)
    // Use aria-labels to target specific February dates, since bare day
    // numbers like '1' appear in both the current and adjacent months.
    expect(screen.getByLabelText(/February 1, 2026/)).toBeInTheDocument()
    expect(screen.getByLabelText(/February 28, 2026/)).toBeInTheDocument()
  })

  it('calls onDateClick when clicking a cell', async () => {
    const user = userEvent.setup()
    render(<MonthlyCalendar {...defaultProps} />)
    const cells = screen.getAllByRole('gridcell')
    await user.click(cells[0]!)
    expect(defaultProps.onDateClick).toHaveBeenCalledOnce()
  })

  it('shows dots for dates with bookings', () => {
    const { container } = render(<MonthlyCalendar {...defaultProps} />)
    const dots = container.querySelectorAll('.monthly-calendar__dot')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('highlights selected date', () => {
    const selected = new Date(2026, 1, 15)
    const { container } = render(
      <MonthlyCalendar {...defaultProps} selectedDate={selected} />
    )
    const selectedCells = container.querySelectorAll('.monthly-calendar__cell--selected')
    expect(selectedCells.length).toBe(1)
  })
})
