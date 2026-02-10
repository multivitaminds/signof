import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BillingSettings from './BillingSettings'

const mockSetPlan = vi.fn()
const mockSetBillingCycle = vi.fn()
const mockSetUsage = vi.fn()
const mockSetPaymentMethod = vi.fn()

vi.mock('../stores/useBillingStore', () => ({
  useBillingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      currentPlan: 'starter',
      billingCycle: 'monthly',
      usage: {
        documents: { used: 32, limit: 50 },
        storage: { used: 0.6, limit: 1 },
        members: { used: 2, limit: 3 },
      },
      paymentMethod: {
        brand: 'Visa',
        last4: '4242',
        expiry: '12/27',
      },
      billingHistory: [
        { id: 'inv-001', date: '2026-02-01', description: 'Starter Plan - February 2026', amount: '$0.00', status: 'paid', invoiceUrl: '#' },
        { id: 'inv-002', date: '2026-01-01', description: 'Starter Plan - January 2026', amount: '$0.00', status: 'paid', invoiceUrl: '#' },
      ],
      setPlan: mockSetPlan,
      setBillingCycle: mockSetBillingCycle,
      setUsage: mockSetUsage,
      setPaymentMethod: mockSetPaymentMethod,
    }),
}))

describe('BillingSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the billing page title', () => {
    render(<BillingSettings />)
    expect(screen.getByText('Plan & Billing')).toBeInTheDocument()
  })

  it('renders the current plan badge', () => {
    render(<BillingSettings />)
    expect(screen.getByText('Starter Plan')).toBeInTheDocument()
  })

  it('renders all plan cards', () => {
    render(<BillingSettings />)
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('renders Current Plan button for the active plan', () => {
    render(<BillingSettings />)
    expect(screen.getByText('Current Plan')).toBeInTheDocument()
  })

  it('renders upgrade buttons for higher-tier plans', () => {
    render(<BillingSettings />)
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument()
    expect(screen.getByText('Upgrade to Business')).toBeInTheDocument()
    expect(screen.getByText('Contact Sales')).toBeInTheDocument()
  })

  it('renders the Most Popular badge on Pro plan', () => {
    render(<BillingSettings />)
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('renders usage section with progress bars', () => {
    render(<BillingSettings />)
    expect(screen.getByText('Usage')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Storage')).toBeInTheDocument()
    expect(screen.getByText('Team Members')).toBeInTheDocument()
    expect(screen.getByText('32 / 50')).toBeInTheDocument()
    expect(screen.getByText('600 MB / 1 GB')).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('renders payment method section', () => {
    render(<BillingSettings />)
    expect(screen.getByText('Payment Method')).toBeInTheDocument()
    expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument()
    expect(screen.getByText('Expires 12/27')).toBeInTheDocument()
  })

  it('renders billing history table', () => {
    render(<BillingSettings />)
    expect(screen.getByText('Billing History')).toBeInTheDocument()
    expect(screen.getByText('Starter Plan - February 2026')).toBeInTheDocument()
    expect(screen.getByText('Starter Plan - January 2026')).toBeInTheDocument()
  })

  it('renders the billing cycle toggle', () => {
    render(<BillingSettings />)
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Yearly')).toBeInTheDocument()
  })

  it('opens confirmation modal when Upgrade is clicked', async () => {
    const user = userEvent.setup()
    render(<BillingSettings />)

    await user.click(screen.getByText('Upgrade to Pro'))
    expect(screen.getByText('Confirm Plan Change')).toBeInTheDocument()
    expect(screen.getByText(/switching from/)).toBeInTheDocument()
  })

  it('closes confirmation modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<BillingSettings />)

    await user.click(screen.getByText('Upgrade to Pro'))
    expect(screen.getByText('Confirm Plan Change')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Confirm Plan Change')).not.toBeInTheDocument()
  })

  it('calls setPlan when Confirm Change is clicked', async () => {
    const user = userEvent.setup()
    render(<BillingSettings />)

    await user.click(screen.getByText('Upgrade to Pro'))
    await user.click(screen.getByText('Confirm Change'))

    expect(mockSetPlan).toHaveBeenCalledWith('pro')
  })

  it('calls setBillingCycle when billing cycle toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<BillingSettings />)

    const cycleSwitch = screen.getByRole('switch', { name: /switch to yearly billing/i })
    await user.click(cycleSwitch)

    expect(mockSetBillingCycle).toHaveBeenCalledWith('yearly')
  })

  it('renders invoice download buttons', () => {
    render(<BillingSettings />)
    const downloadButtons = screen.getAllByText('PDF')
    expect(downloadButtons.length).toBe(2)
  })

  it('renders Paid status badges for billing history', () => {
    render(<BillingSettings />)
    const paidBadges = screen.getAllByText('Paid')
    expect(paidBadges.length).toBe(2)
  })
})
