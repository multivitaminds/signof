import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationsSettings from './NotificationsSettings'

const mockUpdateNotifications = vi.fn()

vi.mock('../stores/useSettingsStore', () => ({
  useSettingsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      notifications: {
        emailDigest: true,
        mentionAlerts: true,
        signatureRequests: true,
        weeklyReport: false,
        desktopNotifications: true,
      },
      updateNotifications: mockUpdateNotifications,
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

  it('renders all notification toggle labels', () => {
    render(<NotificationsSettings />)
    expect(screen.getByText('Email Digest')).toBeInTheDocument()
    expect(screen.getByText('Mention Alerts')).toBeInTheDocument()
    expect(screen.getByText('Signature Requests')).toBeInTheDocument()
    expect(screen.getByText('Weekly Report')).toBeInTheDocument()
    expect(screen.getByText('Desktop Notifications')).toBeInTheDocument()
  })

  it('renders toggle switches with correct aria-checked state', () => {
    render(<NotificationsSettings />)
    const switches = screen.getAllByRole('switch')
    // emailDigest: true, mentionAlerts: true, signatureRequests: true, weeklyReport: false, desktopNotifications: true
    expect(switches[0]).toHaveAttribute('aria-checked', 'true')  // emailDigest
    expect(switches[1]).toHaveAttribute('aria-checked', 'true')  // mentionAlerts
    expect(switches[2]).toHaveAttribute('aria-checked', 'true')  // signatureRequests
    expect(switches[3]).toHaveAttribute('aria-checked', 'false') // weeklyReport
    expect(switches[4]).toHaveAttribute('aria-checked', 'true')  // desktopNotifications
  })

  it('calls updateNotifications when a toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<NotificationsSettings />)

    const switches = screen.getAllByRole('switch')
    // Click the weeklyReport toggle (currently false)
    const weeklySwitch = switches[3]
    expect(weeklySwitch).toBeDefined()
    if (!weeklySwitch) return
    await user.click(weeklySwitch)

    expect(mockUpdateNotifications).toHaveBeenCalledWith({ weeklyReport: true })
  })

  it('renders descriptions for each notification setting', () => {
    render(<NotificationsSettings />)
    expect(screen.getByText(/daily summary of activity/)).toBeInTheDocument()
    expect(screen.getByText(/someone mentions you/)).toBeInTheDocument()
    expect(screen.getByText(/document is sent to you for signing/)).toBeInTheDocument()
  })
})
