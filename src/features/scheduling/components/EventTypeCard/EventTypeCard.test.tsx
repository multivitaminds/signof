import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventTypeCard from './EventTypeCard'
import type { EventType } from '../../types'
import { EventTypeCategory, LocationType, DEFAULT_SCHEDULE } from '../../types'

const mockEventType: EventType = {
  id: 'et-1',
  name: 'Quick Chat',
  description: 'A brief 15-minute check-in call',
  slug: 'quick-chat',
  category: EventTypeCategory.OneOnOne,
  color: '#4F46E5',
  durationMinutes: 15,
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
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('EventTypeCard', () => {
  const defaultProps = {
    eventType: mockEventType,
    bookingCount: 5,
    onClick: vi.fn(),
    onToggleActive: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders event type name', () => {
    render(<EventTypeCard {...defaultProps} />)
    expect(screen.getByText('Quick Chat')).toBeInTheDocument()
  })

  it('renders duration badge', () => {
    render(<EventTypeCard {...defaultProps} />)
    expect(screen.getByText('15 min')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<EventTypeCard {...defaultProps} />)
    expect(screen.getByText('A brief 15-minute check-in call')).toBeInTheDocument()
  })

  it('renders booking count', () => {
    render(<EventTypeCard {...defaultProps} />)
    expect(screen.getByText('5 bookings')).toBeInTheDocument()
  })

  it('renders singular booking text for count of 1', () => {
    render(<EventTypeCard {...defaultProps} bookingCount={1} />)
    expect(screen.getByText('1 booking')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup()
    render(<EventTypeCard {...defaultProps} />)
    await user.click(screen.getByRole('button'))
    expect(defaultProps.onClick).toHaveBeenCalledOnce()
  })

  it('renders active toggle', () => {
    render(<EventTypeCard {...defaultProps} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls onToggleActive when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<EventTypeCard {...defaultProps} />)
    await user.click(screen.getByRole('checkbox'))
    expect(defaultProps.onToggleActive).toHaveBeenCalledWith(false)
  })

  it('does not render toggle when onToggleActive is not provided', () => {
    render(<EventTypeCard {...defaultProps} onToggleActive={undefined} />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})
