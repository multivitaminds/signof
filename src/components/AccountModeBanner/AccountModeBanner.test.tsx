import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountModeBanner from './AccountModeBanner'
import { useAuthStore } from '../../features/auth/stores/useAuthStore'

describe('AccountModeBanner', () => {
  beforeEach(() => {
    useAuthStore.setState({ accountMode: 'demo' })
  })

  it('renders demo mode by default', () => {
    render(<AccountModeBanner />)
    expect(screen.getByText("You're viewing demo data with sample content.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Switch to Live Account' })).toBeInTheDocument()
  })

  it('renders live mode when accountMode is live', () => {
    useAuthStore.setState({ accountMode: 'live' })
    render(<AccountModeBanner />)
    expect(screen.getByText('Live Account')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Switch to Demo' })).toBeInTheDocument()
  })

  it('toggles from demo to live on click', async () => {
    const user = userEvent.setup()
    render(<AccountModeBanner />)
    await user.click(screen.getByRole('button', { name: 'Switch to Live Account' }))
    expect(useAuthStore.getState().accountMode).toBe('live')
  })

  it('toggles from live to demo on click', async () => {
    useAuthStore.setState({ accountMode: 'live' })
    const user = userEvent.setup()
    render(<AccountModeBanner />)
    await user.click(screen.getByRole('button', { name: 'Switch to Demo' }))
    expect(useAuthStore.getState().accountMode).toBe('demo')
  })

  it('has appropriate aria-label for accessibility', () => {
    render(<AccountModeBanner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Demo mode active')
  })
})
