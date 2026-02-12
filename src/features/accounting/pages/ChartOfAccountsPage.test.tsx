import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChartOfAccountsPage from './ChartOfAccountsPage'

vi.mock('../stores/useAccountingStore', () => {
  const sampleAccounts = [
    {
      id: 'acct-1',
      name: 'Checking Account',
      code: '1000',
      type: 'asset',
      subType: 'checking',
      description: 'Primary checking',
      balance: 24500,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'acct-2',
      name: 'Accounts Payable',
      code: '2000',
      type: 'liability',
      subType: 'accounts_payable',
      description: 'Money owed',
      balance: 3200,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ]

  const store = {
    accounts: sampleAccounts,
    addAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
  }

  return {
    useAccountingStore: (selector: (s: typeof store) => unknown) => selector(store),
  }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <ChartOfAccountsPage />
    </MemoryRouter>
  )
}

describe('ChartOfAccountsPage', () => {
  it('renders heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Chart of Accounts' })).toBeInTheDocument()
  })

  it('shows filter tabs', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Assets' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Liabilities' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Equity' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revenue' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expenses' })).toBeInTheDocument()
  })

  it('displays sample accounts in table', () => {
    renderPage()
    expect(screen.getByText('Checking Account')).toBeInTheDocument()
    expect(screen.getByText('1000')).toBeInTheDocument()
    // "Accounts Payable" appears as both account name and sub-type label
    expect(screen.getAllByText('Accounts Payable').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('2000')).toBeInTheDocument()
  })

  it('shows Add Account button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /Add Account/i })).toBeInTheDocument()
  })
})
