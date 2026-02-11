import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecurringBookingPicker from './RecurringBookingPicker'

describe('RecurringBookingPicker', () => {
  const defaultProps = {
    selectedDate: new Date('2026-03-01T00:00:00'),
    selectedTime: '10:00',
    onConfirm: vi.fn(),
    onSkip: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title', () => {
    render(<RecurringBookingPicker {...defaultProps} />)

    expect(screen.getByText('Make it recurring?')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<RecurringBookingPicker {...defaultProps} />)

    expect(screen.getByText(/book this same time slot on multiple dates/i)).toBeInTheDocument()
  })

  it('renders frequency select with Weekly as default', () => {
    render(<RecurringBookingPicker {...defaultProps} />)

    const select = screen.getByLabelText('Frequency') as HTMLSelectElement
    expect(select.value).toBe('weekly')
  })

  it('renders count options', () => {
    render(<RecurringBookingPicker {...defaultProps} />)

    expect(screen.getByRole('radio', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '3' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '4' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '6' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '8' })).toBeInTheDocument()
  })

  it('has 4 as the default selected count', () => {
    render(<RecurringBookingPicker {...defaultProps} />)

    const radio4 = screen.getByRole('radio', { name: '4' })
    expect(radio4).toHaveAttribute('aria-checked', 'true')
  })

  it('shows date preview with correct number of dates (default is 4)', () => {
    render(<RecurringBookingPicker {...defaultProps} />)

    expect(screen.getByText(/all dates \(4 bookings at 10:00 AM\)/i)).toBeInTheDocument()
  })

  it('marks the first date as Selected', () => {
    render(<RecurringBookingPicker {...defaultProps} />)

    expect(screen.getByText('Selected')).toBeInTheDocument()
  })

  it('renders the confirm button with correct count', () => {
    render(<RecurringBookingPicker {...defaultProps} />)

    expect(screen.getByText(/book all 4 dates/i)).toBeInTheDocument()
  })

  it('renders the skip button', () => {
    render(<RecurringBookingPicker {...defaultProps} />)

    expect(screen.getByText('Book single date only')).toBeInTheDocument()
  })

  it('calls onSkip when skip button is clicked', async () => {
    const user = userEvent.setup()
    render(<RecurringBookingPicker {...defaultProps} />)

    await user.click(screen.getByText('Book single date only'))
    expect(defaultProps.onSkip).toHaveBeenCalledOnce()
  })

  it('calls onConfirm with date strings when confirm is clicked', async () => {
    const user = userEvent.setup()
    render(<RecurringBookingPicker {...defaultProps} />)

    await user.click(screen.getByText(/book all 4 dates/i))

    expect(defaultProps.onConfirm).toHaveBeenCalledOnce()
    const dates = defaultProps.onConfirm.mock.calls[0]![0] as string[]
    expect(dates).toHaveLength(4)
    expect(dates[0]).toBe('2026-03-01')
    // Weekly: next dates should be Mar 8, 15, 22
    expect(dates[1]).toBe('2026-03-08')
    expect(dates[2]).toBe('2026-03-15')
    expect(dates[3]).toBe('2026-03-22')
  })

  it('updates count when a different count is selected', async () => {
    const user = userEvent.setup()
    render(<RecurringBookingPicker {...defaultProps} />)

    await user.click(screen.getByRole('radio', { name: '2' }))

    expect(screen.getByText(/all dates \(2 bookings at 10:00 AM\)/i)).toBeInTheDocument()
    expect(screen.getByText(/book all 2 dates/i)).toBeInTheDocument()
  })

  it('updates frequency when select is changed', async () => {
    const user = userEvent.setup()
    render(<RecurringBookingPicker {...defaultProps} />)

    const select = screen.getByLabelText('Frequency')
    await user.selectOptions(select, 'biweekly')

    // With biweekly and count 4: dates should be 2 weeks apart
    await user.click(screen.getByText(/book all 4 dates/i))

    const dates = defaultProps.onConfirm.mock.calls[0]![0] as string[]
    expect(dates).toHaveLength(4)
    expect(dates[0]).toBe('2026-03-01')
    expect(dates[1]).toBe('2026-03-15')  // +2 weeks
    expect(dates[2]).toBe('2026-03-29')  // +4 weeks
    expect(dates[3]).toBe('2026-04-12')  // +6 weeks
  })
})
