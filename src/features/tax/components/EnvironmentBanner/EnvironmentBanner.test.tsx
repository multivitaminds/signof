import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EnvironmentBanner from './EnvironmentBanner'

describe('EnvironmentBanner', () => {
  const defaultProps = {
    environment: 'sandbox' as const,
    onToggle: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onToggle.mockClear()
  })

  it('renders sandbox mode text', () => {
    render(<EnvironmentBanner {...defaultProps} />)
    expect(
      screen.getByText(/Demo Mode.*filings go to TaxBandits sandbox, NOT the IRS/)
    ).toBeInTheDocument()
  })

  it('renders production mode text', () => {
    render(<EnvironmentBanner {...defaultProps} environment="production" />)
    expect(
      screen.getByText(/Live Account.*filings will be submitted to the IRS/)
    ).toBeInTheDocument()
  })

  it('shows "Go Live" button in sandbox mode', () => {
    render(<EnvironmentBanner {...defaultProps} />)
    expect(screen.getByText('Go Live')).toBeInTheDocument()
  })

  it('shows "Switch to Demo" button in production mode', () => {
    render(<EnvironmentBanner {...defaultProps} environment="production" />)
    expect(screen.getByText('Switch to Demo')).toBeInTheDocument()
  })

  it('has role="status" for accessibility', () => {
    render(<EnvironmentBanner {...defaultProps} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has correct aria-label for sandbox toggle', () => {
    render(<EnvironmentBanner {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: 'Switch to production mode' })
    ).toBeInTheDocument()
  })

  it('has correct aria-label for production toggle', () => {
    render(<EnvironmentBanner {...defaultProps} environment="production" />)
    expect(
      screen.getByRole('button', { name: 'Switch to sandbox mode' })
    ).toBeInTheDocument()
  })

  it('calls onToggle when toggle button is clicked', async () => {
    const user = userEvent.setup()
    render(<EnvironmentBanner {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: 'Switch to production mode' }))
    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1)
  })

  it('applies sandbox CSS class in sandbox mode', () => {
    render(<EnvironmentBanner {...defaultProps} />)
    const banner = screen.getByRole('status')
    expect(banner).toHaveClass('environment-banner--sandbox')
  })

  it('applies production CSS class in production mode', () => {
    render(<EnvironmentBanner {...defaultProps} environment="production" />)
    const banner = screen.getByRole('status')
    expect(banner).toHaveClass('environment-banner--production')
  })
})
