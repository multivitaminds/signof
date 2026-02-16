import { useAccountingStore } from './useAccountingStore'
import { AccountSubType, TransactionType, ReconciliationStatus } from '../types'

describe('useAccountingStore', () => {
  beforeEach(() => {
    // Reset to a minimal known state for deterministic tests
    useAccountingStore.setState({
      accounts: [
        { id: 'acct-1', name: 'Checking', code: '1000', type: 'asset', subType: AccountSubType.Checking, description: 'Main checking', balance: 10000, createdAt: '2026-01-01T00:00:00Z' },
        { id: 'acct-2', name: 'Revenue', code: '4000', type: 'revenue', subType: AccountSubType.ServiceRevenue, description: 'Service revenue', balance: 5000, createdAt: '2026-01-01T00:00:00Z' },
        { id: 'acct-3', name: 'Rent', code: '5000', type: 'expense', subType: AccountSubType.OperatingExpense, description: 'Rent expense', balance: 3000, createdAt: '2026-01-01T00:00:00Z' },
      ],
      transactions: [
        {
          id: 'txn-1', date: '2026-02-01', description: 'Rent payment', type: TransactionType.Expense,
          lines: [
            { id: 'line-1', accountId: 'acct-3', accountName: 'Rent', debit: 3000, credit: 0, description: 'Feb rent' },
            { id: 'line-2', accountId: 'acct-1', accountName: 'Checking', debit: 0, credit: 3000, description: 'Feb rent' },
          ],
          reference: 'RENT-001', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: null, createdAt: '2026-02-01T00:00:00Z',
        },
        {
          id: 'txn-2', date: '2026-01-15', description: 'Client invoice', type: TransactionType.Income,
          lines: [
            { id: 'line-3', accountId: 'acct-1', accountName: 'Checking', debit: 5000, credit: 0, description: 'Payment' },
            { id: 'line-4', accountId: 'acct-2', accountName: 'Revenue', debit: 0, credit: 5000, description: 'Revenue' },
          ],
          reference: 'INV-001', reconciliationStatus: ReconciliationStatus.Unreconciled, contactId: 'c-1', createdAt: '2026-01-15T00:00:00Z',
        },
      ],
      activeFiscalYear: '2026',
    })
  })

  describe('initial state', () => {
    it('has accounts and transactions', () => {
      const state = useAccountingStore.getState()
      expect(state.accounts).toHaveLength(3)
      expect(state.transactions).toHaveLength(2)
      expect(state.activeFiscalYear).toBe('2026')
    })
  })

  describe('addAccount', () => {
    it('adds a new account with generated id and timestamp', () => {
      useAccountingStore.getState().addAccount({
        name: 'Savings',
        code: '1010',
        type: 'asset',
        subType: AccountSubType.Savings,
        description: 'Savings account',
        balance: 0,
      })
      const accounts = useAccountingStore.getState().accounts
      expect(accounts).toHaveLength(4)
      const added = accounts[3]!
      expect(added.name).toBe('Savings')
      expect(added.id).toBeTruthy()
      expect(added.createdAt).toBeTruthy()
    })
  })

  describe('updateAccount', () => {
    it('updates an existing account', () => {
      useAccountingStore.getState().updateAccount('acct-1', { balance: 15000 })
      const acct = useAccountingStore.getState().accounts.find((a) => a.id === 'acct-1')!
      expect(acct.balance).toBe(15000)
      expect(acct.name).toBe('Checking')
    })

    it('does not affect other accounts', () => {
      useAccountingStore.getState().updateAccount('acct-1', { name: 'Updated' })
      const acct2 = useAccountingStore.getState().accounts.find((a) => a.id === 'acct-2')!
      expect(acct2.name).toBe('Revenue')
    })
  })

  describe('deleteAccount', () => {
    it('removes an account by id', () => {
      useAccountingStore.getState().deleteAccount('acct-3')
      const accounts = useAccountingStore.getState().accounts
      expect(accounts).toHaveLength(2)
      expect(accounts.find((a) => a.id === 'acct-3')).toBeUndefined()
    })
  })

  describe('addTransaction', () => {
    it('adds a new transaction', () => {
      useAccountingStore.getState().addTransaction({
        date: '2026-02-10',
        description: 'New expense',
        type: TransactionType.Expense,
        lines: [
          { id: 'l1', accountId: 'acct-3', accountName: 'Rent', debit: 500, credit: 0, description: 'Misc' },
          { id: 'l2', accountId: 'acct-1', accountName: 'Checking', debit: 0, credit: 500, description: 'Misc' },
        ],
        reference: 'EXP-001',
        reconciliationStatus: ReconciliationStatus.Unreconciled,
        contactId: null,
      })
      expect(useAccountingStore.getState().transactions).toHaveLength(3)
    })
  })

  describe('updateTransaction', () => {
    it('updates a transaction by id', () => {
      useAccountingStore.getState().updateTransaction('txn-1', { description: 'Updated rent' })
      const txn = useAccountingStore.getState().transactions.find((t) => t.id === 'txn-1')!
      expect(txn.description).toBe('Updated rent')
    })
  })

  describe('deleteTransaction', () => {
    it('removes a transaction by id', () => {
      useAccountingStore.getState().deleteTransaction('txn-2')
      expect(useAccountingStore.getState().transactions).toHaveLength(1)
      expect(useAccountingStore.getState().transactions[0]!.id).toBe('txn-1')
    })
  })

  describe('setActiveFiscalYear', () => {
    it('updates the active fiscal year', () => {
      useAccountingStore.getState().setActiveFiscalYear('2025')
      expect(useAccountingStore.getState().activeFiscalYear).toBe('2025')
    })
  })

  describe('getAccountById', () => {
    it('returns account by id', () => {
      const acct = useAccountingStore.getState().getAccountById('acct-2')
      expect(acct).toBeDefined()
      expect(acct!.name).toBe('Revenue')
    })

    it('returns undefined for unknown id', () => {
      const acct = useAccountingStore.getState().getAccountById('nonexistent')
      expect(acct).toBeUndefined()
    })
  })

  describe('getAccountsByType', () => {
    it('filters accounts by type', () => {
      const assets = useAccountingStore.getState().getAccountsByType('asset')
      expect(assets).toHaveLength(1)
      expect(assets[0]!.name).toBe('Checking')
    })

    it('returns empty array for type with no accounts', () => {
      const liabilities = useAccountingStore.getState().getAccountsByType('liability')
      expect(liabilities).toHaveLength(0)
    })
  })

  describe('getTransactionsByDateRange', () => {
    it('returns transactions within date range', () => {
      const txns = useAccountingStore.getState().getTransactionsByDateRange('2026-01-01', '2026-01-31')
      expect(txns).toHaveLength(1)
      expect(txns[0]!.id).toBe('txn-2')
    })

    it('returns all transactions for a wide range', () => {
      const txns = useAccountingStore.getState().getTransactionsByDateRange('2026-01-01', '2026-12-31')
      expect(txns).toHaveLength(2)
    })

    it('returns empty for out-of-range dates', () => {
      const txns = useAccountingStore.getState().getTransactionsByDateRange('2025-01-01', '2025-12-31')
      expect(txns).toHaveLength(0)
    })
  })

  describe('clearData', () => {
    it('empties accounts and transactions', () => {
      useAccountingStore.getState().clearData()
      const state = useAccountingStore.getState()
      expect(state.accounts).toHaveLength(0)
      expect(state.transactions).toHaveLength(0)
    })
  })

  describe('importTransactions', () => {
    it('bulk-imports transactions with generated ids', () => {
      useAccountingStore.getState().importTransactions([
        {
          date: '2026-03-01',
          description: 'Imported 1',
          type: TransactionType.Income,
          lines: [{ id: 'l1', accountId: 'acct-1', accountName: 'Checking', debit: 1000, credit: 0, description: '' }],
          reference: 'IMP-1',
          reconciliationStatus: ReconciliationStatus.Unreconciled,
          contactId: null,
        },
        {
          date: '2026-03-02',
          description: 'Imported 2',
          type: TransactionType.Expense,
          lines: [{ id: 'l2', accountId: 'acct-3', accountName: 'Rent', debit: 500, credit: 0, description: '' }],
          reference: 'IMP-2',
          reconciliationStatus: ReconciliationStatus.Unreconciled,
          contactId: null,
        },
      ])
      const txns = useAccountingStore.getState().transactions
      expect(txns).toHaveLength(4) // 2 existing + 2 imported
      expect(txns[2]!.description).toBe('Imported 1')
      expect(txns[3]!.description).toBe('Imported 2')
      expect(txns[2]!.id).toBeTruthy()
      expect(txns[3]!.createdAt).toBeTruthy()
    })
  })
})
