import { render, screen } from '@testing-library/react'
import BankingPage from './BankingPage'

vi.mock('../stores/useAccountingStore', () => {
  const sampleAccounts = [
    { id: 'acct-checking', name: 'Checking Account', code: '1000', type: 'asset', subType: 'checking', description: '', balance: 24500, createdAt: '' },
    { id: 'acct-savings', name: 'Savings Account', code: '1010', type: 'asset', subType: 'savings', description: '', balance: 50000, createdAt: '' },
  ]

  const sampleTransactions = [
    {
      id: 'txn-1', date: '2026-02-01', description: 'Office rent - February', type: 'expense',
      lines: [
        { id: 'l1', accountId: 'acct-rent', accountName: 'Rent Expense', debit: 3000, credit: 0, description: 'Rent' },
        { id: 'l2', accountId: 'acct-checking', accountName: 'Checking Account', debit: 0, credit: 3000, description: 'Rent payment' },
      ],
      reference: 'RENT-202602', reconciliationStatus: 'reconciled', contactId: null, createdAt: '',
    },
    {
      id: 'txn-2', date: '2026-02-03', description: 'Invoice payment - Acme Corp', type: 'income',
      lines: [
        { id: 'l3', accountId: 'acct-checking', accountName: 'Checking Account', debit: 3450, credit: 0, description: 'Payment' },
        { id: 'l4', accountId: 'acct-ar', accountName: 'Accounts Receivable', debit: 0, credit: 3450, description: 'AR' },
      ],
      reference: 'PMT-001', reconciliationStatus: 'unreconciled', contactId: null, createdAt: '',
    },
  ]

  return {
    useAccountingStore: (selector: (state: Record<string, unknown>) => unknown) => {
      const state = {
        accounts: sampleAccounts,
        transactions: sampleTransactions,
        updateTransaction: vi.fn(),
        deleteTransaction: vi.fn(),
      }
      return selector(state)
    },
  }
})

describe('BankingPage', () => {
  it('renders the page title', () => {
    render(<BankingPage />)
    expect(screen.getByText('Banking & Transactions')).toBeInTheDocument()
  })

  it('renders the account selector with bank accounts', () => {
    render(<BankingPage />)
    expect(screen.getByLabelText('Account')).toBeInTheDocument()
    expect(screen.getByText('Checking Account')).toBeInTheDocument()
    expect(screen.getByText('Savings Account')).toBeInTheDocument()
  })

  it('displays the selected account balance', () => {
    render(<BankingPage />)
    expect(screen.getByText('$24,500.00')).toBeInTheDocument()
  })

  it('renders sample transactions in the table', () => {
    render(<BankingPage />)
    expect(screen.getByText('Office rent - February')).toBeInTheDocument()
    expect(screen.getByText('Invoice payment - Acme Corp')).toBeInTheDocument()
  })

  it('shows Add Transaction and Import CSV buttons', () => {
    render(<BankingPage />)
    expect(screen.getByText('Add Transaction')).toBeInTheDocument()
    expect(screen.getByText('Import CSV')).toBeInTheDocument()
  })

  it('renders filter controls', () => {
    render(<BankingPage />)
    expect(screen.getByLabelText('From')).toBeInTheDocument()
    expect(screen.getByLabelText('To')).toBeInTheDocument()
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search transactions...')).toBeInTheDocument()
  })
})
