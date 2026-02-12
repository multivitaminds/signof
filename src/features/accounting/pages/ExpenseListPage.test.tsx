import { render, screen } from '@testing-library/react'

vi.mock('../stores/useExpenseStore', () => {
  const sampleExpenses = [
    {
      id: 'exp-1',
      date: '2026-02-08',
      amount: 450,
      vendorId: 'v-1',
      vendorName: 'Office Depot',
      categoryId: 'office_supplies',
      description: 'Printer paper',
      accountId: 'acct-1',
      receipt: 'receipt.pdf',
      recurring: false,
      createdAt: '2026-02-08T00:00:00.000Z',
    },
    {
      id: 'exp-2',
      date: '2026-02-05',
      amount: 1200,
      vendorId: 'v-2',
      vendorName: 'AWS',
      categoryId: 'software',
      description: 'Cloud hosting',
      accountId: 'acct-2',
      receipt: null,
      recurring: true,
      createdAt: '2026-02-05T00:00:00.000Z',
    },
  ]

  const store = {
    expenses: sampleExpenses,
    deleteExpense: vi.fn(),
    getTotalByCategory: () => ({ office_supplies: 450, software: 1200 }),
  }

  return {
    useExpenseStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

vi.mock('../stores/useAccountingContactStore', () => {
  const store = {
    contacts: [],
    getVendors: () => [],
  }
  return {
    useAccountingContactStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

vi.mock('../stores/useAccountingStore', () => {
  const store = {
    accounts: [],
  }
  return {
    useAccountingStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

describe('ExpenseListPage', () => {
  beforeEach(async () => {
    const { default: ExpenseListPage } = await import('./ExpenseListPage')
    render(<ExpenseListPage />)
  })

  it('renders the Expenses heading', () => {
    expect(screen.getByRole('heading', { name: 'Expenses' })).toBeInTheDocument()
  })

  it('shows summary cards', () => {
    expect(screen.getByText('Total Expenses (This Month)')).toBeInTheDocument()
    expect(screen.getByText('Largest Category')).toBeInTheDocument()
    expect(screen.getByText('Recurring Total')).toBeInTheDocument()
  })

  it('shows sample expenses in the table', () => {
    expect(screen.getByText('Office Depot')).toBeInTheDocument()
    expect(screen.getByText('AWS')).toBeInTheDocument()
    expect(screen.getByText('Printer paper')).toBeInTheDocument()
    expect(screen.getByText('Cloud hosting')).toBeInTheDocument()
  })

  it('shows the Add Expense button', () => {
    expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument()
  })

  it('shows the category filter', () => {
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
  })
})
