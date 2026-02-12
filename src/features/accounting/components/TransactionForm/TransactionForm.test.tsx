import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TransactionForm from './TransactionForm'

vi.mock('../../stores/useAccountingStore', () => {
  const sampleAccounts = [
    { id: 'acct-checking', name: 'Checking Account', code: '1000', type: 'asset', subType: 'checking', description: '', balance: 24500, createdAt: '' },
    { id: 'acct-savings', name: 'Savings Account', code: '1010', type: 'asset', subType: 'savings', description: '', balance: 50000, createdAt: '' },
    { id: 'acct-service-rev', name: 'Service Revenue', code: '4000', type: 'revenue', subType: 'service_revenue', description: '', balance: 45000, createdAt: '' },
    { id: 'acct-rent', name: 'Rent Expense', code: '5000', type: 'expense', subType: 'operating_expense', description: '', balance: 18000, createdAt: '' },
  ]

  return {
    useAccountingStore: (selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        accounts: sampleAccounts,
        addTransaction: vi.fn(),
        updateTransaction: vi.fn(),
      }
      return selector(state)
    },
  }
})

describe('TransactionForm', () => {
  it('renders "New Transaction" title when not editing', () => {
    render(<TransactionForm onClose={vi.fn()} />)
    expect(screen.getByText('New Transaction')).toBeInTheDocument()
  })

  it('renders the type selector with all types', () => {
    render(<TransactionForm onClose={vi.fn()} />)
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Expense')).toBeInTheDocument()
    expect(screen.getByText('Transfer')).toBeInTheDocument()
    expect(screen.getByText('Journal Entry')).toBeInTheDocument()
  })

  it('shows bank account and amount fields for income type', () => {
    render(<TransactionForm onClose={vi.fn()} />)
    expect(screen.getByLabelText('Bank Account')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
  })

  it('shows from/to account fields when Transfer is selected', async () => {
    const user = userEvent.setup()
    render(<TransactionForm onClose={vi.fn()} />)
    await user.click(screen.getByText('Transfer'))
    expect(screen.getByLabelText('From Account')).toBeInTheDocument()
    expect(screen.getByLabelText('To Account')).toBeInTheDocument()
  })

  it('shows journal entry lines when Journal Entry is selected', async () => {
    const user = userEvent.setup()
    render(<TransactionForm onClose={vi.fn()} />)
    await user.click(screen.getByText('Journal Entry'))
    expect(screen.getByText('Add Line')).toBeInTheDocument()
    expect(screen.getByText('Totals')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<TransactionForm onClose={onClose} />)
    await user.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
