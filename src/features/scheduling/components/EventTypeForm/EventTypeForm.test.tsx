import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventTypeForm from './EventTypeForm'
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
  bufferBeforeMinutes: 5,
  bufferAfterMinutes: 5,
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

describe('EventTypeForm', () => {
  const defaultProps = {
    onSave: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields', () => {
    render(<EventTypeForm {...defaultProps} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('URL Slug')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
  })

  it('renders create button for new event type', () => {
    render(<EventTypeForm {...defaultProps} />)
    expect(screen.getByText('Create Event Type')).toBeInTheDocument()
  })

  it('renders save button for existing event type', () => {
    render(<EventTypeForm {...defaultProps} eventType={mockEventType} />)
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })

  it('populates form with existing event type data', () => {
    render(<EventTypeForm {...defaultProps} eventType={mockEventType} />)
    expect(screen.getByLabelText('Name')).toHaveValue('Quick Chat')
    expect(screen.getByLabelText('Description')).toHaveValue('A brief call')
  })

  it('auto-generates slug from name', async () => {
    const user = userEvent.setup()
    render(<EventTypeForm {...defaultProps} />)
    await user.type(screen.getByLabelText('Name'), 'My New Event')
    expect(screen.getByLabelText('URL Slug')).toHaveValue('my-new-event')
  })

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<EventTypeForm {...defaultProps} />)
    await user.click(screen.getByText('Cancel'))
    expect(defaultProps.onCancel).toHaveBeenCalledOnce()
  })

  it('calls onSave with form data on submit', async () => {
    const user = userEvent.setup()
    render(<EventTypeForm {...defaultProps} eventType={mockEventType} />)
    await user.click(screen.getByText('Save Changes'))
    expect(defaultProps.onSave).toHaveBeenCalledOnce()
    const data = defaultProps.onSave.mock.calls[0]![0]
    expect(data.name).toBe('Quick Chat')
  })

  it('disables submit when name is empty', () => {
    render(<EventTypeForm {...defaultProps} />)
    expect(screen.getByText('Create Event Type')).toBeDisabled()
  })

  it('renders color picker', () => {
    render(<EventTypeForm {...defaultProps} />)
    const colorGroup = screen.getByRole('radiogroup', { name: 'Event color' })
    expect(colorGroup).toBeInTheDocument()
  })
})
