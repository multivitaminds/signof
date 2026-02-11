import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalendarSync from './CalendarSync'
import { useSchedulingStore } from '../../stores/useSchedulingStore'
import { CalendarProvider, SyncDirection } from '../../types'

function setupStore() {
  useSchedulingStore.setState({
    calendarConnections: [
      {
        id: 'cal-google',
        provider: CalendarProvider.Google,
        name: 'Google Calendar',
        email: 'user@gmail.com',
        syncDirection: SyncDirection.TwoWay,
        checkConflicts: true,
        connected: true,
        lastSyncedAt: '2026-02-10T08:30:00Z',
      },
      {
        id: 'cal-outlook',
        provider: CalendarProvider.Outlook,
        name: 'Outlook Calendar',
        email: 'user@outlook.com',
        syncDirection: SyncDirection.OneWay,
        checkConflicts: false,
        connected: false,
        lastSyncedAt: null,
      },
    ],
  })
}

describe('CalendarSync', () => {
  beforeEach(() => {
    setupStore()
  })

  it('renders all calendar connections', () => {
    render(<CalendarSync />)

    expect(screen.getByText('Google Calendar')).toBeInTheDocument()
    expect(screen.getByText('Outlook Calendar')).toBeInTheDocument()
  })

  it('shows Connected badge for connected calendars', () => {
    render(<CalendarSync />)

    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText('Not connected')).toBeInTheDocument()
  })

  it('shows emails for all connections', () => {
    render(<CalendarSync />)

    expect(screen.getByText('user@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('user@outlook.com')).toBeInTheDocument()
  })

  it('renders Connect button for disconnected calendars', () => {
    render(<CalendarSync />)

    expect(screen.getByRole('button', { name: /connect outlook/i })).toBeInTheDocument()
  })

  it('renders Disconnect button for connected calendars', () => {
    render(<CalendarSync />)

    expect(screen.getByRole('button', { name: /disconnect google/i })).toBeInTheDocument()
  })

  it('connects a disconnected calendar when Connect is clicked', async () => {
    const user = userEvent.setup()
    render(<CalendarSync />)

    const connectBtn = screen.getByRole('button', { name: /connect outlook/i })
    await user.click(connectBtn)

    const conn = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-outlook')
    expect(conn!.connected).toBe(true)
  })

  it('disconnects a connected calendar when Disconnect is clicked', async () => {
    const user = userEvent.setup()
    render(<CalendarSync />)

    const disconnectBtn = screen.getByRole('button', { name: /disconnect google/i })
    await user.click(disconnectBtn)

    const conn = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-google')
    expect(conn!.connected).toBe(false)
  })

  it('shows sync direction select for connected calendars', () => {
    render(<CalendarSync />)

    expect(screen.getByLabelText('Sync direction')).toBeInTheDocument()
  })

  it('shows check for conflicts toggle for connected calendars', () => {
    render(<CalendarSync />)

    const toggle = screen.getByRole('switch', { name: /check for conflicts/i })
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('toggles check for conflicts when clicked', async () => {
    const user = userEvent.setup()
    render(<CalendarSync />)

    const toggle = screen.getByRole('switch', { name: /check for conflicts/i })
    await user.click(toggle)

    const conn = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-google')
    expect(conn!.checkConflicts).toBe(false)
  })

  it('renders the page title and description', () => {
    render(<CalendarSync />)

    expect(screen.getByText('Connected Calendars')).toBeInTheDocument()
    expect(screen.getByText(/sync your calendars/i)).toBeInTheDocument()
  })
})
