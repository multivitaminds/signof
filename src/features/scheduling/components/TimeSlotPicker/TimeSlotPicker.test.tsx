import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TimeSlotPicker from './TimeSlotPicker'
import type { TimeRange } from '../../types'

const mockSlots: TimeRange[] = [
  { start: '09:00', end: '09:30' },
  { start: '10:00', end: '10:30' },
  { start: '14:00', end: '14:30' },
]

describe('TimeSlotPicker', () => {
  const defaultProps = {
    date: new Date(2026, 1, 10),
    slots: mockSlots,
    selectedTime: null,
    onSelectTime: vi.fn(),
    timezone: 'America/New_York',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders time slots', () => {
    render(<TimeSlotPicker {...defaultProps} />)
    expect(screen.getByText('9:00 AM')).toBeInTheDocument()
    expect(screen.getByText('10:00 AM')).toBeInTheDocument()
    expect(screen.getByText('2:00 PM')).toBeInTheDocument()
  })

  it('renders timezone', () => {
    render(<TimeSlotPicker {...defaultProps} />)
    expect(screen.getByText('America/New_York')).toBeInTheDocument()
  })

  it('calls onSelectTime when clicking a slot', async () => {
    const user = userEvent.setup()
    render(<TimeSlotPicker {...defaultProps} />)
    await user.click(screen.getByText('9:00 AM'))
    expect(defaultProps.onSelectTime).toHaveBeenCalledWith('09:00')
  })

  it('highlights selected slot', () => {
    render(<TimeSlotPicker {...defaultProps} selectedTime="10:00" />)
    const slot = screen.getByText('10:00 AM')
    expect(slot).toHaveAttribute('aria-selected', 'true')
  })

  it('shows empty state when no slots', () => {
    render(<TimeSlotPicker {...defaultProps} slots={[]} />)
    expect(screen.getByText('No available times for this date')).toBeInTheDocument()
  })
})
