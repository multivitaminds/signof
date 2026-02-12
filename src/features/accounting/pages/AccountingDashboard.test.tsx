import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AccountingDashboard from './AccountingDashboard'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../stores/useAccountingStore', () => ({
  useAccountingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      accounts: [
        { id: '1', name: 'Service Revenue', type: 'revenue', balance: 45000 },
        { id: '2', name: 'Product Sales', type: 'revenue', balance: 12000 },
        { id: '3', name: 'Rent Expense', type: 'expense', balance: 18000 },
        { id: '4', name: 'Payroll Expense', type: 'expense', balance: 36000 },
      ],
      transactions: [
        {
          id: 'txn-1',
          date: '2026-02-10',
          description: 'Consulting services',
          type: 'income',
          lines: [{ debit: 5000, credit: 0 }],
        },
        {
          id: 'txn-2',
          date: '2026-02-08',
          description: 'Office supplies',
          type: 'expense',
          lines: [{ debit: 450, credit: 0 }],
        },
      ],
    }),
}))

vi.mock('../stores/useInvoiceStore', () => ({
  useInvoiceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      invoices: [
        { id: 'inv-1', status: 'sent', balance: 3450 },
        { id: 'inv-2', status: 'overdue', balance: 1750 },
        { id: 'inv-3', status: 'paid', balance: 0 },
        { id: 'inv-4', status: 'draft', balance: 1200 },
      ],
      getOutstandingTotal: () => 6200,
    }),
}))

vi.mock('../stores/useExpenseStore', () => ({
  useExpenseStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      expenses: [
        { id: 'exp-1', amount: 450, vendorName: 'Office Depot' },
        { id: 'exp-2', amount: 1200, vendorName: 'AWS' },
      ],
    }),
}))

vi.mock('../../settings/stores/useBillingStore', () => ({
  useBillingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      accountingPlan: 'acct_free',
    }),
}))

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AccountingDashboard />
    </MemoryRouter>
  )
}

describe('AccountingDashboard', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders KPI cards', () => {
    renderDashboard()
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Total Expenses')).toBeInTheDocument()
    expect(screen.getByText('Net Profit')).toBeInTheDocument()
    expect(screen.getByText('Outstanding Invoices')).toBeInTheDocument()
  })

  it('shows upgrade banner for free plan', () => {
    renderDashboard()
    expect(screen.getByText(/Accounting Free/)).toBeInTheDocument()
    expect(screen.getByText('Upgrade to Accounting Plus')).toBeInTheDocument()
  })

  it('renders quick action buttons', () => {
    renderDashboard()
    expect(screen.getByText('Create Invoice')).toBeInTheDocument()
    expect(screen.getByText('Record Expense')).toBeInTheDocument()
    expect(screen.getByText('Run Payroll')).toBeInTheDocument()
    expect(screen.getByText('View Reports')).toBeInTheDocument()
  })

  it('renders recent transactions section', () => {
    renderDashboard()
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument()
    expect(screen.getByText('Consulting services')).toBeInTheDocument()
    expect(screen.getByText('Office supplies')).toBeInTheDocument()
  })

  it('renders cash flow chart', () => {
    renderDashboard()
    expect(screen.getByText('Cash Flow')).toBeInTheDocument()
    expect(screen.getByText('Sep')).toBeInTheDocument()
    expect(screen.getByText('Feb')).toBeInTheDocument()
  })
})
