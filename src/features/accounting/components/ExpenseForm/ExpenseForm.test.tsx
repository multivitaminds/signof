import { render, screen } from '@testing-library/react'

vi.mock('../../stores/useExpenseStore', () => {
  const store = {
    expenses: [],
    addExpense: vi.fn(),
    updateExpense: vi.fn(),
  }
  return {
    useExpenseStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

vi.mock('../../stores/useAccountingContactStore', () => {
  const vendors = [
    { id: 'v-1', name: 'Vendor Relations', company: 'Office Depot', type: 'vendor' },
  ]
  const store = {
    contacts: vendors,
    getVendors: () => vendors,
  }
  return {
    useAccountingContactStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

vi.mock('../../stores/useAccountingStore', () => {
  const store = {
    accounts: [
      { id: 'acct-1', name: 'Checking Account', code: '1000', type: 'asset', subType: 'checking', description: '', balance: 0, createdAt: '' },
    ],
  }
  return {
    useAccountingStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

describe('ExpenseForm', () => {
  const mockOnClose = vi.fn()

  beforeEach(async () => {
    const { default: ExpenseForm } = await import('./ExpenseForm')
    render(<ExpenseForm onClose={mockOnClose} />)
  })

  it('renders form fields', () => {
    expect(screen.getByLabelText('Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Account')).toBeInTheDocument()
    expect(screen.getByLabelText('Recurring expense')).toBeInTheDocument()
  })

  it('shows category dropdown options', () => {
    const categorySelect = screen.getByLabelText('Category')
    expect(categorySelect).toBeInTheDocument()
    expect(screen.getByText('Advertising')).toBeInTheDocument()
    expect(screen.getByText('Software & Subscriptions')).toBeInTheDocument()
    expect(screen.getByText('Travel')).toBeInTheDocument()
    expect(screen.getByText('Rent & Lease')).toBeInTheDocument()
  })

  it('renders save and cancel buttons', () => {
    expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('renders the receipt drop zone', () => {
    expect(screen.getByText('Drop receipt here')).toBeInTheDocument()
  })
})
