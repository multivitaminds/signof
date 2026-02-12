import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReportsPage from './ReportsPage'

vi.mock('../stores/useAccountingStore', () => ({
  useAccountingStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      accounts: [
        { id: '1', name: 'Checking', code: '1000', type: 'asset', subType: 'checking', description: '', balance: 10000, createdAt: '' },
        { id: '2', name: 'Accounts Payable', code: '2000', type: 'liability', subType: 'accounts_payable', description: '', balance: 2000, createdAt: '' },
        { id: '3', name: "Owner's Equity", code: '3000', type: 'equity', subType: 'owners_equity', description: '', balance: 8000, createdAt: '' },
        { id: '4', name: 'Service Revenue', code: '4000', type: 'revenue', subType: 'service_revenue', description: '', balance: 15000, createdAt: '' },
        { id: '5', name: 'Rent Expense', code: '5000', type: 'expense', subType: 'operating_expense', description: '', balance: 5000, createdAt: '' },
      ],
      transactions: [],
    }
    return selector(state)
  },
}))

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page heading', () => {
    render(<ReportsPage />)
    expect(screen.getByRole('heading', { name: 'Financial Reports' })).toBeInTheDocument()
  })

  it('renders report tabs', () => {
    render(<ReportsPage />)
    expect(screen.getByRole('tab', { name: 'Profit & Loss' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Balance Sheet' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Cash Flow' })).toBeInTheDocument()
  })

  it('renders date range inputs', () => {
    render(<ReportsPage />)
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('End Date')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })

  it('shows Profit & Loss by default', () => {
    render(<ReportsPage />)
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('Expenses')).toBeInTheDocument()
    expect(screen.getByText('Net Income')).toBeInTheDocument()
  })

  it('switches to Balance Sheet tab', async () => {
    const user = userEvent.setup()
    render(<ReportsPage />)

    await user.click(screen.getByRole('tab', { name: 'Balance Sheet' }))
    expect(screen.getByText('Assets')).toBeInTheDocument()
    expect(screen.getByText('Liabilities')).toBeInTheDocument()
    expect(screen.getByText('Equity')).toBeInTheDocument()
  })

  it('switches to Cash Flow tab', async () => {
    const user = userEvent.setup()
    render(<ReportsPage />)

    await user.click(screen.getByRole('tab', { name: 'Cash Flow' }))
    expect(screen.getByText('Operating Activities')).toBeInTheDocument()
    expect(screen.getByText('Investing Activities')).toBeInTheDocument()
    expect(screen.getByText('Financing Activities')).toBeInTheDocument()
  })

  it('marks active tab with aria-selected', async () => {
    const user = userEvent.setup()
    render(<ReportsPage />)

    const pnlTab = screen.getByRole('tab', { name: 'Profit & Loss' })
    expect(pnlTab).toHaveAttribute('aria-selected', 'true')

    const balanceTab = screen.getByRole('tab', { name: 'Balance Sheet' })
    await user.click(balanceTab)
    expect(balanceTab).toHaveAttribute('aria-selected', 'true')
    expect(pnlTab).toHaveAttribute('aria-selected', 'false')
  })
})
