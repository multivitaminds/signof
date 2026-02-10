import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExpirationBadge from './ExpirationBadge'

describe('ExpirationBadge', () => {
  it('shows "No expiration" when expiresAt is null', () => {
    render(<ExpirationBadge expiresAt={null} />)
    expect(screen.getByText('No expiration')).toBeInTheDocument()
  })

  it('shows "Expired" for past dates', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString()
    render(<ExpirationBadge expiresAt={pastDate} />)
    expect(screen.getByText('Expired')).toBeInTheDocument()
  })

  it('shows "Expires today" for dates expiring within 24 hours', () => {
    const soonDate = new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    render(<ExpirationBadge expiresAt={soonDate} />)
    expect(screen.getByText('Expires today')).toBeInTheDocument()
  })

  it('shows "Expires in X days" for dates 2-3 days away', () => {
    const twoDays = new Date(Date.now() + 2 * 86400000).toISOString()
    render(<ExpirationBadge expiresAt={twoDays} />)
    expect(screen.getByText(/Expires in \d+ days/)).toBeInTheDocument()
  })

  it('shows formatted date for dates far in future', () => {
    const farDate = new Date(Date.now() + 30 * 86400000).toISOString()
    render(<ExpirationBadge expiresAt={farDate} />)
    expect(screen.getByText(/Expires/)).toBeInTheDocument()
  })

  it('returns null in compact mode when no expiration', () => {
    const { container } = render(<ExpirationBadge expiresAt={null} compact />)
    expect(container.firstChild).toBeNull()
  })

  it('shows badge in compact mode when expiration is set', () => {
    const twoDays = new Date(Date.now() + 2 * 86400000).toISOString()
    const { container } = render(<ExpirationBadge expiresAt={twoDays} compact />)
    expect(container.firstChild).not.toBeNull()
  })

  it('opens date picker when badge is clicked and onSetExpiration is provided', async () => {
    const user = userEvent.setup()
    render(
      <ExpirationBadge expiresAt={null} onSetExpiration={vi.fn()} />
    )

    await user.click(screen.getByText('No expiration'))
    expect(screen.getByText('Set Expiration')).toBeInTheDocument()
    expect(screen.getByLabelText('Expiration date')).toBeInTheDocument()
  })

  it('closes date picker when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ExpirationBadge expiresAt={null} onSetExpiration={vi.fn()} />
    )

    await user.click(screen.getByText('No expiration'))
    expect(screen.getByText('Set Expiration')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Close date picker'))
    expect(screen.queryByText('Set Expiration')).not.toBeInTheDocument()
  })

  it('calls onSetExpiration when Set Date is clicked', async () => {
    const user = userEvent.setup()
    const onSetExpiration = vi.fn()
    render(
      <ExpirationBadge expiresAt={null} onSetExpiration={onSetExpiration} />
    )

    await user.click(screen.getByText('No expiration'))
    const dateInput = screen.getByLabelText('Expiration date')
    await user.type(dateInput, '2026-12-31')
    await user.click(screen.getByText('Set Date'))

    expect(onSetExpiration).toHaveBeenCalledOnce()
    const call = onSetExpiration.mock.calls[0] as [string] | undefined
    expect(call?.[0]).toContain('2026-12-31')
  })

  it('shows Clear button when expiration is already set', async () => {
    const user = userEvent.setup()
    const futureDate = new Date(Date.now() + 7 * 86400000).toISOString()
    render(
      <ExpirationBadge expiresAt={futureDate} onSetExpiration={vi.fn()} />
    )

    await user.click(screen.getByText(/Expires/))
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('calls onSetExpiration with null when Clear is clicked', async () => {
    const user = userEvent.setup()
    const onSetExpiration = vi.fn()
    const futureDate = new Date(Date.now() + 7 * 86400000).toISOString()
    render(
      <ExpirationBadge expiresAt={futureDate} onSetExpiration={onSetExpiration} />
    )

    await user.click(screen.getByText(/Expires/))
    await user.click(screen.getByText('Clear'))
    expect(onSetExpiration).toHaveBeenCalledWith(null)
  })

  it('Set Date button is disabled when no date entered', async () => {
    const user = userEvent.setup()
    render(
      <ExpirationBadge expiresAt={null} onSetExpiration={vi.fn()} />
    )

    await user.click(screen.getByText('No expiration'))
    expect(screen.getByText('Set Date')).toBeDisabled()
  })

  it('has proper aria-label on badge', () => {
    render(<ExpirationBadge expiresAt={null} />)
    expect(screen.getByLabelText('No expiration')).toBeInTheDocument()
  })
})
