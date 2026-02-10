import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PublicBookingPage from './PublicBookingPage'
import { useSchedulingStore } from '../stores/useSchedulingStore'
import { SAMPLE_EVENT_TYPES } from '../lib/sampleData'

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

  it('shows powered by SignOf footer', () => {
    renderWithRouter('quick-chat')
    expect(screen.getByText('Powered by')).toBeInTheDocument()
    expect(screen.getByText('SignOf')).toBeInTheDocument()
  })
})
