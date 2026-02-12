import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Account, Transaction, FiscalYear, AccountType } from '../types'
import { AccountSubType, TransactionType, ReconciliationStatus } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function createSampleAccounts(): Account[] {
  const now = new Date().toISOString()
  return [
    { id: 'acct-checking', name: 'Checking Account', code: '1000', type: 'asset', subType: AccountSubType.Checking, description: 'Primary business checking', balance: 24500, createdAt: now },
    { id: 'acct-savings', name: 'Savings Account', code: '1010', type: 'asset', subType: AccountSubType.Savings, description: 'Business savings', balance: 50000, createdAt: now },
    { id: 'acct-ar', name: 'Accounts Receivable', code: '1200', type: 'asset', subType: AccountSubType.AccountsReceivable, description: 'Money owed by customers', balance: 8200, createdAt: now },
    { id: 'acct-equipment', name: 'Equipment', code: '1500', type: 'asset', subType: AccountSubType.FixedAsset, description: 'Office equipment and hardware', balance: 15000, createdAt: now },
    { id: 'acct-ap', name: 'Accounts Payable', code: '2000', type: 'liability', subType: AccountSubType.AccountsPayable, description: 'Money owed to vendors', balance: 3200, createdAt: now },
    { id: 'acct-cc', name: 'Credit Card', code: '2100', type: 'liability', subType: AccountSubType.CreditCard, description: 'Business credit card', balance: 1800, createdAt: now },
    { id: 'acct-equity', name: "Owner's Equity", code: '3000', type: 'equity', subType: AccountSubType.OwnersEquity, description: 'Owner investment', balance: 80000, createdAt: now },
    { id: 'acct-retained', name: 'Retained Earnings', code: '3100', type: 'equity', subType: AccountSubType.RetainedEarnings, description: 'Accumulated profits', balance: 12700, createdAt: now },
    { id: 'acct-service-rev', name: 'Service Revenue', code: '4000', type: 'revenue', subType: AccountSubType.ServiceRevenue, description: 'Revenue from services', balance: 45000, createdAt: now },
    { id: 'acct-product-rev', name: 'Product Sales', code: '4100', type: 'revenue', subType: AccountSubType.ProductRevenue, description: 'Revenue from product sales', balance: 12000, createdAt: now },
    { id: 'acct-rent', name: 'Rent Expense', code: '5000', type: 'expense', subType: AccountSubType.OperatingExpense, description: 'Office rent', balance: 18000, createdAt: now },
    { id: 'acct-payroll', name: 'Payroll Expense', code: '5100', type: 'expense', subType: AccountSubType.OperatingExpense, description: 'Employee salaries and wages', balance: 36000, createdAt: now },
    { id: 'acct-supplies', name: 'Office Supplies', code: '5200', type: 'expense', subType: AccountSubType.OperatingExpense, description: 'Office supplies and materials', balance: 2400, createdAt: now },
    { id: 'acct-software', name: 'Software & Subscriptions', code: '5300', type: 'expense', subType: AccountSubType.OperatingExpense, description: 'Software licenses and SaaS', balance: 4800, createdAt: now },
    { id: 'acct-utilities', name: 'Utilities', code: '5400', type: 'expense', subType: AccountSubType.OperatingExpense, description: 'Electric, water, internet', balance: 3600, createdAt: now },
  ]
}

function createSampleTransactions(): Transaction[] {
  const now = new Date().toISOString()
  return [
    {
      id: generateId(), date: '2026-02-01', description: 'Office rent - February', type: TransactionType.Expense,
      lines: [
        { id: generateId(), accountId: 'acct-rent', accountName: 'Rent Expense', debit: 3000, credit: 0, description: 'February rent' },
        { id: generateId(), accountId: 'acct-checking', accountName: 'Checking Account', debit: 0, credit: 3000, description: 'February rent payment' },
      ],
      reference: 'RENT-202602', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: null, createdAt: now,
    },
    {
      id: generateId(), date: '2026-02-03', description: 'Invoice payment - Acme Corp', type: TransactionType.Income,
      lines: [
        { id: generateId(), accountId: 'acct-checking', accountName: 'Checking Account', debit: 3450, credit: 0, description: 'Acme Corp payment' },
        { id: generateId(), accountId: 'acct-ar', accountName: 'Accounts Receivable', debit: 0, credit: 3450, description: 'Acme Corp AR cleared' },
      ],
      reference: 'PMT-001', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: 'contact-acme', createdAt: now,
    },
    {
      id: generateId(), date: '2026-02-05', description: 'AWS monthly subscription', type: TransactionType.Expense,
      lines: [
        { id: generateId(), accountId: 'acct-software', accountName: 'Software & Subscriptions', debit: 1200, credit: 0, description: 'AWS hosting' },
        { id: generateId(), accountId: 'acct-cc', accountName: 'Credit Card', debit: 0, credit: 1200, description: 'AWS charge' },
      ],
      reference: 'AWS-202602', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: 'contact-aws', createdAt: now,
    },
    {
      id: generateId(), date: '2026-02-07', description: 'Payroll - January', type: TransactionType.Expense,
      lines: [
        { id: generateId(), accountId: 'acct-payroll', accountName: 'Payroll Expense', debit: 9000, credit: 0, description: 'January payroll' },
        { id: generateId(), accountId: 'acct-checking', accountName: 'Checking Account', debit: 0, credit: 9000, description: 'Payroll disbursement' },
      ],
      reference: 'PAY-202601', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: null, createdAt: now,
    },
    {
      id: generateId(), date: '2026-02-08', description: 'Office supplies purchase', type: TransactionType.Expense,
      lines: [
        { id: generateId(), accountId: 'acct-supplies', accountName: 'Office Supplies', debit: 450, credit: 0, description: 'Printer paper and toner' },
        { id: generateId(), accountId: 'acct-cc', accountName: 'Credit Card', debit: 0, credit: 450, description: 'Office Depot charge' },
      ],
      reference: 'OD-7823', reconciliationStatus: ReconciliationStatus.Unreconciled, contactId: 'contact-officedepot', createdAt: now,
    },
    {
      id: generateId(), date: '2026-02-10', description: 'Consulting services - Globex Inc', type: TransactionType.Income,
      lines: [
        { id: generateId(), accountId: 'acct-ar', accountName: 'Accounts Receivable', debit: 5000, credit: 0, description: 'Globex consulting invoice' },
        { id: generateId(), accountId: 'acct-service-rev', accountName: 'Service Revenue', debit: 0, credit: 5000, description: 'Consulting revenue' },
      ],
      reference: 'INV-0003', reconciliationStatus: ReconciliationStatus.Unreconciled, contactId: 'contact-globex', createdAt: now,
    },
    {
      id: generateId(), date: '2026-02-10', description: 'Transfer to savings', type: TransactionType.Transfer,
      lines: [
        { id: generateId(), accountId: 'acct-savings', accountName: 'Savings Account', debit: 5000, credit: 0, description: 'Transfer in' },
        { id: generateId(), accountId: 'acct-checking', accountName: 'Checking Account', debit: 0, credit: 5000, description: 'Transfer out' },
      ],
      reference: 'TRF-001', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: null, createdAt: now,
    },
    {
      id: generateId(), date: '2026-02-11', description: 'Electric bill', type: TransactionType.Expense,
      lines: [
        { id: generateId(), accountId: 'acct-utilities', accountName: 'Utilities', debit: 285, credit: 0, description: 'Electric bill February' },
        { id: generateId(), accountId: 'acct-checking', accountName: 'Checking Account', debit: 0, credit: 285, description: 'Utility payment' },
      ],
      reference: 'UTIL-202602', reconciliationStatus: ReconciliationStatus.Unreconciled, contactId: null, createdAt: now,
    },
    {
      id: generateId(), date: '2026-01-15', description: 'Product sale - Initech', type: TransactionType.Income,
      lines: [
        { id: generateId(), accountId: 'acct-checking', accountName: 'Checking Account', debit: 2800, credit: 0, description: 'Initech payment' },
        { id: generateId(), accountId: 'acct-product-rev', accountName: 'Product Sales', debit: 0, credit: 2800, description: 'Product revenue' },
      ],
      reference: 'INV-0004', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: 'contact-initech', createdAt: now,
    },
    {
      id: generateId(), date: '2026-01-20', description: 'WeWork coworking space', type: TransactionType.Expense,
      lines: [
        { id: generateId(), accountId: 'acct-rent', accountName: 'Rent Expense', debit: 3000, credit: 0, description: 'January coworking' },
        { id: generateId(), accountId: 'acct-checking', accountName: 'Checking Account', debit: 0, credit: 3000, description: 'WeWork payment' },
      ],
      reference: 'WW-202601', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: 'contact-wework', createdAt: now,
    },
    {
      id: generateId(), date: '2026-01-25', description: 'Internet service', type: TransactionType.Expense,
      lines: [
        { id: generateId(), accountId: 'acct-utilities', accountName: 'Utilities', debit: 150, credit: 0, description: 'Internet January' },
        { id: generateId(), accountId: 'acct-checking', accountName: 'Checking Account', debit: 0, credit: 150, description: 'Internet payment' },
      ],
      reference: 'ISP-202601', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: null, createdAt: now,
    },
    {
      id: generateId(), date: '2026-01-28', description: 'Service revenue - Umbrella Corp', type: TransactionType.Income,
      lines: [
        { id: generateId(), accountId: 'acct-ar', accountName: 'Accounts Receivable', debit: 1750, credit: 0, description: 'Umbrella Corp invoice' },
        { id: generateId(), accountId: 'acct-service-rev', accountName: 'Service Revenue', debit: 0, credit: 1750, description: 'Service revenue' },
      ],
      reference: 'INV-0005', reconciliationStatus: ReconciliationStatus.Unreconciled, contactId: 'contact-umbrella', createdAt: now,
    },
    {
      id: generateId(), date: '2026-01-05', description: 'ADP payroll processing', type: TransactionType.Expense,
      lines: [
        { id: generateId(), accountId: 'acct-payroll', accountName: 'Payroll Expense', debit: 4500, credit: 0, description: 'ADP processing fee' },
        { id: generateId(), accountId: 'acct-checking', accountName: 'Checking Account', debit: 0, credit: 4500, description: 'ADP payment' },
      ],
      reference: 'ADP-202601', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: 'contact-adp', createdAt: now,
    },
    {
      id: generateId(), date: '2026-01-10', description: 'Software licenses renewal', type: TransactionType.Expense,
      lines: [
        { id: generateId(), accountId: 'acct-software', accountName: 'Software & Subscriptions', debit: 800, credit: 0, description: 'Annual license renewal' },
        { id: generateId(), accountId: 'acct-cc', accountName: 'Credit Card', debit: 0, credit: 800, description: 'Software charge' },
      ],
      reference: 'SW-202601', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: null, createdAt: now,
    },
    {
      id: generateId(), date: '2026-01-12', description: 'Consulting service - Stark Industries', type: TransactionType.Income,
      lines: [
        { id: generateId(), accountId: 'acct-checking', accountName: 'Checking Account', debit: 8500, credit: 0, description: 'Stark Industries payment' },
        { id: generateId(), accountId: 'acct-service-rev', accountName: 'Service Revenue', debit: 0, credit: 8500, description: 'Consulting revenue' },
      ],
      reference: 'INV-0006', reconciliationStatus: ReconciliationStatus.Reconciled, contactId: 'contact-stark', createdAt: now,
    },
  ]
}

interface AccountingState {
  accounts: Account[]
  transactions: Transaction[]
  activeFiscalYear: FiscalYear

  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  deleteAccount: (id: string) => void
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  setActiveFiscalYear: (year: FiscalYear) => void
  getAccountById: (id: string) => Account | undefined
  getAccountsByType: (type: AccountType) => Account[]
  getTransactionsByDateRange: (start: string, end: string) => Transaction[]
  clearData: () => void
}

export const useAccountingStore = create<AccountingState>()(
  persist(
    (set, get) => ({
      accounts: createSampleAccounts(),
      transactions: createSampleTransactions(),
      activeFiscalYear: '2026',

      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, { ...account, id: generateId(), createdAt: new Date().toISOString() }],
        })),

      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [...state.transactions, { ...transaction, id: generateId(), createdAt: new Date().toISOString() }],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setActiveFiscalYear: (year) => set({ activeFiscalYear: year }),

      getAccountById: (id) => get().accounts.find((a) => a.id === id),

      getAccountsByType: (type) => get().accounts.filter((a) => a.type === type),

      getTransactionsByDateRange: (start, end) =>
        get().transactions.filter((t) => t.date >= start && t.date <= end),

      clearData: () =>
        set({
          accounts: [],
          transactions: [],
        }),
    }),
    { name: 'signof-accounting-storage' }
  )
)
