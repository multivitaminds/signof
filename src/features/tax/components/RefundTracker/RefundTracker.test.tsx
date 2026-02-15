import { render, screen } from '@testing-library/react'
import RefundTracker from './RefundTracker'

describe('RefundTracker', () => {
  it('renders "Estimated Refund" label when isRefund is true', () => {
    render(<RefundTracker amount={1500} isRefund={true} />)
    expect(screen.getByText('Estimated Refund')).toBeInTheDocument()
  })

  it('renders "Estimated Tax Owed" label when isRefund is false', () => {
    render(<RefundTracker amount={1500} isRefund={false} />)
    expect(screen.getByText('Estimated Tax Owed')).toBeInTheDocument()
  })

  it('formats the amount with dollar sign and no decimals', () => {
    render(<RefundTracker amount={2350} isRefund={true} />)
    expect(screen.getByText('$2,350')).toBeInTheDocument()
  })

  it('formats large amounts with comma separators', () => {
    render(<RefundTracker amount={15000} isRefund={true} />)
    expect(screen.getByText('$15,000')).toBeInTheDocument()
  })

  it('uses absolute value for negative amounts', () => {
    render(<RefundTracker amount={-3200} isRefund={false} />)
    expect(screen.getByText('$3,200')).toBeInTheDocument()
  })

  it('displays $0 when amount is zero', () => {
    render(<RefundTracker amount={0} isRefund={true} />)
    expect(screen.getByText('$0')).toBeInTheDocument()
  })

  it('applies refund-tracker--refund class when isRefund is true', () => {
    render(<RefundTracker amount={500} isRefund={true} />)
    const tracker = screen.getByRole('status')
    expect(tracker).toHaveClass('refund-tracker--refund')
    expect(tracker).not.toHaveClass('refund-tracker--owed')
  })

  it('applies refund-tracker--owed class when isRefund is false', () => {
    render(<RefundTracker amount={500} isRefund={false} />)
    const tracker = screen.getByRole('status')
    expect(tracker).toHaveClass('refund-tracker--owed')
    expect(tracker).not.toHaveClass('refund-tracker--refund')
  })

  it('has role="status" and aria-live="polite" for accessibility', () => {
    render(<RefundTracker amount={100} isRefund={true} />)
    const tracker = screen.getByRole('status')
    expect(tracker).toHaveAttribute('aria-live', 'polite')
  })

  it('renders the amount inside the refund-tracker__amount span', () => {
    render(<RefundTracker amount={7890} isRefund={true} />)
    const amountEl = screen.getByText('$7,890')
    expect(amountEl).toHaveClass('refund-tracker__amount')
  })
})
