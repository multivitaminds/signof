import { render, screen } from '@testing-library/react'
import CalendarSyncPage from './CalendarSyncPage'
import { useSchedulingStore } from '../stores/useSchedulingStore'

describe('CalendarSyncPage', () => {
  beforeEach(() => {
    useSchedulingStore.setState({
      calendarConnections: [
        {
          id: 'cal-1',
          provider: 'google' as const,
          name: 'Work Calendar',
          email: 'user@gmail.com',
          syncDirection: 'two_way' as const,
          checkConflicts: true,
          connected: true,
          lastSyncedAt: '2026-02-10T10:00:00Z',
        },
        {
          id: 'cal-2',
          provider: 'outlook' as const,
          name: 'Personal',
          email: 'user@outlook.com',
          syncDirection: 'one_way' as const,
          checkConflicts: false,
          connected: false,
          lastSyncedAt: null,
        },
      ],
    })
  })

  it('renders the Connected Calendars title', () => {
    render(<CalendarSyncPage />)
    expect(screen.getByText('Connected Calendars')).toBeInTheDocument()
  })

  it('renders connected calendar cards with provider labels', () => {
    render(<CalendarSyncPage />)
    expect(screen.getByText('Google Calendar')).toBeInTheDocument()
    expect(screen.getByText('user@gmail.com')).toBeInTheDocument()
  })

  it('renders unconnected calendar cards with provider labels', () => {
    render(<CalendarSyncPage />)
    expect(screen.getByText('Outlook Calendar')).toBeInTheDocument()
    expect(screen.getByText('user@outlook.com')).toBeInTheDocument()
  })

  it('shows disconnect button for connected calendars', () => {
    render(<CalendarSyncPage />)
    const disconnectBtn = screen.getByLabelText('Disconnect Google Calendar')
    expect(disconnectBtn).toBeInTheDocument()
  })

  it('shows connect button for unconnected calendars', () => {
    render(<CalendarSyncPage />)
    const connectBtn = screen.getByLabelText('Connect Outlook Calendar')
    expect(connectBtn).toBeInTheDocument()
  })
})
