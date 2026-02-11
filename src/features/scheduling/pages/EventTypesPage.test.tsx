import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventTypesPage from './EventTypesPage'
import { useSchedulingStore } from '../stores/useSchedulingStore'
import { SAMPLE_EVENT_TYPES } from '../lib/sampleData'

describe('EventTypesPage', () => {
  beforeEach(() => {
    useSchedulingStore.setState({
      eventTypes: [...SAMPLE_EVENT_TYPES],
      bookings: [],
    })
  })

  it('renders the page subtitle', () => {
    render(<EventTypesPage />)
    expect(
      screen.getByText('Create and manage your event types for booking')
    ).toBeInTheDocument()
  })

  it('renders the New Event Type button', () => {
    render(<EventTypesPage />)
    expect(screen.getByText('New Event Type')).toBeInTheDocument()
  })

  it('renders all sample event type cards', () => {
    render(<EventTypesPage />)
    expect(screen.getByText('Quick Chat')).toBeInTheDocument()
    expect(screen.getByText('Product Demo')).toBeInTheDocument()
    expect(screen.getByText('Team Standup')).toBeInTheDocument()
    expect(screen.getByText('Contract Signing')).toBeInTheDocument()
  })

  it('shows empty state when no event types exist', () => {
    useSchedulingStore.setState({ eventTypes: [], bookings: [] })
    render(<EventTypesPage />)
    expect(screen.getByText('Create your first event type')).toBeInTheDocument()
    expect(screen.getByText('Create Event Type')).toBeInTheDocument()
  })

  it('shows context menu when actions button is clicked', async () => {
    const user = userEvent.setup()
    render(<EventTypesPage />)

    await user.click(screen.getByLabelText('Actions for Quick Chat'))
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Duplicate')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('opens editor when New Event Type is clicked', async () => {
    const user = userEvent.setup()
    render(<EventTypesPage />)

    await user.click(screen.getByText('New Event Type'))
    // EventTypeEditor should render with form fields
    expect(screen.getByText('Details')).toBeInTheDocument()
  })

  it('duplicates an event type', async () => {
    const user = userEvent.setup()
    render(<EventTypesPage />)

    await user.click(screen.getByLabelText('Actions for Quick Chat'))
    await user.click(screen.getByText('Duplicate'))

    // Store should now have 5 event types
    const state = useSchedulingStore.getState()
    expect(state.eventTypes.length).toBe(5)
    // Duplicated event type should have "Copy" in its name
    const duplicated = state.eventTypes.find((et) =>
      et.name.includes('Copy')
    )
    expect(duplicated).toBeDefined()
  })

  it('shows delete confirmation and deletes event type', async () => {
    const user = userEvent.setup()
    render(<EventTypesPage />)

    await user.click(screen.getByLabelText('Actions for Quick Chat'))
    await user.click(screen.getByText('Delete'))
    // Should now show "Confirm Delete"
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument()

    await user.click(screen.getByText('Confirm Delete'))
    // Quick Chat should be removed
    const state = useSchedulingStore.getState()
    expect(state.eventTypes.find((et) => et.id === 'et-quick-chat')).toBeUndefined()
  })

  it('closes context menu when backdrop is clicked', async () => {
    const user = userEvent.setup()
    render(<EventTypesPage />)

    await user.click(screen.getByLabelText('Actions for Quick Chat'))
    expect(screen.getByText('Edit')).toBeInTheDocument()

    // Click the backdrop
    const backdrop = document.querySelector('.event-types-page__backdrop')
    if (backdrop) {
      await user.click(backdrop)
    }
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })
})
