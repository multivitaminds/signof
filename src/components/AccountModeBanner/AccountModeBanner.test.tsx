import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import AccountModeBanner from './AccountModeBanner'
import { useAuthStore } from '../../features/auth/stores/useAuthStore'

function renderBanner() {
  return render(
    <MemoryRouter>
      <AccountModeBanner />
    </MemoryRouter>
  )
}

describe('AccountModeBanner', () => {
  beforeEach(() => {
    useAuthStore.setState({ accountMode: 'demo' })
  })

  it('renders demo mode by default', () => {
    renderBanner()
    expect(screen.getByText("You're viewing demo data with sample content.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Switch to Live Account' })).toBeInTheDocument()
  })

  it('renders live mode when accountMode is live', () => {
    useAuthStore.setState({ accountMode: 'live' })
    renderBanner()
    expect(screen.getByText('Live Account')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Switch to Demo' })).toBeInTheDocument()
  })

  it('toggles from demo to live on click', async () => {
    const user = userEvent.setup()
    renderBanner()
    await user.click(screen.getByRole('button', { name: 'Switch to Live Account' }))
    expect(useAuthStore.getState().accountMode).toBe('live')
  })

  it('toggles from live to demo on click', async () => {
    useAuthStore.setState({ accountMode: 'live' })
    const user = userEvent.setup()
    renderBanner()
    await user.click(screen.getByRole('button', { name: 'Switch to Demo' }))
    expect(useAuthStore.getState().accountMode).toBe('demo')
  })

  it('has appropriate aria-label for accessibility', () => {
    renderBanner()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Demo mode active')
  })

  it('shows register CTA in demo mode', () => {
    renderBanner()
    const cta = screen.getByText(/Register for Live Account/)
    expect(cta).toBeInTheDocument()
    expect(cta.closest('a')).toHaveAttribute('href', '/signup')
  })

  it('hides register CTA in live mode', () => {
    useAuthStore.setState({ accountMode: 'live' })
    renderBanner()
    expect(screen.queryByText(/Register for Live Account/)).not.toBeInTheDocument()
  })
})
