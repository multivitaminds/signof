import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationsSettings from './NotificationsSettings'

const mockToggleNotification = vi.fn()
const mockUpdateQuietHours = vi.fn()

vi.mock('../stores/useNotificationPrefsStore', () => ({
  useNotificationPrefsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      prefs: {
        documents: {
          newDocument: { inApp: true, email: true },
          signatureRequest: { inApp: true, email: true },
          documentCompleted: { inApp: true, email: true },
          documentExpired: { inApp: true, email: false },
        },
        projects: {
          issueAssigned: { inApp: true, email: true },
          statusChanged: { inApp: true, email: false },
          commentMention: { inApp: true, email: true },
          cycleCompleted: { inApp: true, email: false },
        },
        scheduling: {
          newBooking: { inApp: true, email: true },
          bookingCancelled: { inApp: true, email: true },
          bookingReminder: { inApp: true, email: false },
        },
        workspace: {
          pageShared: { inApp: true, email: false },
          commentOnPage: { inApp: true, email: false },
          teamInvite: { inApp: true, email: true },
        },
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
        },
      },
      toggleNotification: mockToggleNotification,
      updateQuietHours: mockUpdateQuietHours,
    }),
}))

describe('NotificationsSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title and subtitle', () => {
    render(<NotificationsSettings />)
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Choose how you want to be notified')).toBeInTheDocument()
  })

  it('renders all notification category titles', () => {
    render(<NotificationsSettings />)
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Scheduling')).toBeInTheDocument()
    expect(screen.getByText('Workspace')).toBeInTheDocument()
  })

  it('renders all document notification items', () => {
    render(<NotificationsSettings />)
    expect(screen.getByText('New document')).toBeInTheDocument()
    expect(screen.getByText('Signature request')).toBeInTheDocument()
    expect(screen.getByText('Document completed')).toBeInTheDocument()
    expect(screen.getByText('Document expired')).toBeInTheDocument()
  })

  it('renders all project notification items', () => {
    render(<NotificationsSettings />)
    expect(screen.getByText('Issue assigned')).toBeInTheDocument()
    expect(screen.getByText('Status changed')).toBeInTheDocument()
    expect(screen.getByText('Comment mention')).toBeInTheDocument()
    expect(screen.getByText('Cycle completed')).toBeInTheDocument()
  })

  it('renders all scheduling notification items', () => {
    render(<NotificationsSettings />)
    expect(screen.getByText('New booking')).toBeInTheDocument()
    expect(screen.getByText('Booking cancelled')).toBeInTheDocument()
    expect(screen.getByText('Booking reminder')).toBeInTheDocument()
  })

  it('renders all workspace notification items', () => {
    render(<NotificationsSettings />)
    expect(screen.getByText('Page shared')).toBeInTheDocument()
    expect(screen.getByText('Comment on page')).toBeInTheDocument()
    expect(screen.getByText('Team invite')).toBeInTheDocument()
  })

  it('renders In-app and Email column headers for each category', () => {
    render(<NotificationsSettings />)
    // Each category has In-app and Email headers
    const inAppHeaders = screen.getAllByText('In-app')
    const emailHeaders = screen.getAllByText('Email')
    expect(inAppHeaders.length).toBe(4) // 4 categories
    expect(emailHeaders.length).toBe(4)
  })

  it('renders toggle switches with correct aria-checked state', () => {
    render(<NotificationsSettings />)
    const switches = screen.getAllByRole('switch')
    // Count: 14 items x 2 channels + 1 quiet hours = 29 switches
    expect(switches.length).toBe(29)
  })

  it('calls toggleNotification when a toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<NotificationsSettings />)

    // Click the "Document expired email notification" toggle (currently off)
    const expiredEmailToggle = screen.getByLabelText('Document expired email notification')
    await user.click(expiredEmailToggle)

    expect(mockToggleNotification).toHaveBeenCalledWith('documents', 'documentExpired', 'email')
  })

  it('renders the Quiet Hours section', () => {
    render(<NotificationsSettings />)
    expect(screen.getByText('Quiet Hours')).toBeInTheDocument()
    expect(screen.getByText(/Pause non-urgent notifications/)).toBeInTheDocument()
    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })

  it('calls updateQuietHours when quiet hours toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<NotificationsSettings />)

    const quietToggle = screen.getByLabelText('Enable quiet hours')
    await user.click(quietToggle)

    expect(mockUpdateQuietHours).toHaveBeenCalledWith({ enabled: true })
  })

  it('renders descriptions for notification items', () => {
    render(<NotificationsSettings />)
    expect(screen.getByText('When a new document is created in your workspace')).toBeInTheDocument()
    expect(screen.getByText('When someone books a meeting with you')).toBeInTheDocument()
  })
})
