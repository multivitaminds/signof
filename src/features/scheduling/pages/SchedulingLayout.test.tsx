import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SchedulingLayout from './SchedulingLayout'

function renderLayout(initialPath = '/calendar/events') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/calendar" element={<SchedulingLayout />}>
          <Route path="events" element={<div>Events Content</div>} />
          <Route path="schedule" element={<div>Schedule Content</div>} />
          <Route path="bookings" element={<div>Bookings Content</div>} />
          <Route path="sync" element={<div>Sync Content</div>} />
          <Route path="analytics" element={<div>Analytics Content</div>} />
          <Route path="no-shows" element={<div>No-Shows Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('SchedulingLayout', () => {
  it('renders the Calendar title', () => {
    renderLayout()
    expect(screen.getByRole('heading', { name: 'Calendar' })).toBeInTheDocument()
  })

  it('renders all navigation tabs', () => {
    renderLayout()
    expect(screen.getByText('Event Types')).toBeInTheDocument()
    expect(screen.getAllByText('Calendar').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Bookings')).toBeInTheDocument()
    expect(screen.getByText('Calendar Sync')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('No-Shows')).toBeInTheDocument()
  })

  it('renders the outlet content for events route', () => {
    renderLayout('/calendar/events')
    expect(screen.getByText('Events Content')).toBeInTheDocument()
  })

  it('renders the outlet content for bookings route', () => {
    renderLayout('/calendar/bookings')
    expect(screen.getByText('Bookings Content')).toBeInTheDocument()
  })

  it('renders the outlet content for analytics route', () => {
    renderLayout('/calendar/analytics')
    expect(screen.getByText('Analytics Content')).toBeInTheDocument()
  })

  it('redirects /calendar to /calendar/events', () => {
    renderLayout('/calendar')
    expect(screen.getByText('Events Content')).toBeInTheDocument()
  })

  it('redirects /calendar/ (trailing slash) to /calendar/events', () => {
    renderLayout('/calendar/')
    expect(screen.getByText('Events Content')).toBeInTheDocument()
  })
})
