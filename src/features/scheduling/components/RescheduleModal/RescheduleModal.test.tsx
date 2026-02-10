import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RescheduleModal from './RescheduleModal'
import type { Booking } from '../../types'
import { BookingStatus } from '../../types'

const mockBooking: Booking = {
  id: 'bk-1',
  eventTypeId: 'et-1',
  date: '2026-02-15',
  startTime: '10:00',
  endTime: '10:30',
  timezone: 'America/New_York',
  status: BookingStatus.Confirmed,
  attendees: [
    { name: 'Alice Johnson', email: 'alice@example.com', timezone: 'America/New_York' },
  ],
  notes: 'Test booking',
  createdAt: '2026-02-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
}

describe('RescheduleModal', () => {
  const defaultProps = {
    booking: mockBooking,
    onReschedule: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with current booking details', () => {
    render(<RescheduleModal {...defaultProps} />)
    expect(screen.getByText('Reschedule Booking')).toBeInTheDocument()
    expect(screen.getByText('Current Booking')).toBeInTheDocument()
    // The time appears in both the current booking summary and the time slots,
    // so use getAllByText and check at least one match.
    const timeMatches = screen.getAllByText(/10:00 AM/)
    expect(timeMatches.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Alice Johnson/)).toBeInTheDocument()
  })

  it('renders date input and reason textarea', () => {
    render(<RescheduleModal {...defaultProps} />)
    expect(screen.getByLabelText('New Date')).toBeInTheDocument()
    expect(screen.getByLabelText(/Reason/)).toBeInTheDocument()
  })

  it('disables Reschedule button when no time is selected', () => {
    render(<RescheduleModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Reschedule' })).toBeDisabled()
  })

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<RescheduleModal {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(defaultProps.onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when close icon is clicked', async () => {
    const user = userEvent.setup()
    render(<RescheduleModal {...defaultProps} />)
    await user.click(screen.getByLabelText('Close'))
    expect(defaultProps.onClose).toHaveBeenCalledOnce()
  })
})
