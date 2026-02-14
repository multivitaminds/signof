import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Expense, ExpenseCategory } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function createSampleExpenses(): Expense[] {
  const now = new Date().toISOString()
  return [
    { id: 'exp-1', date: '2026-02-08', amount: 450, vendorId: 'contact-officedepot', vendorName: 'Office Depot', categoryId: 'office_supplies', description: 'Printer paper, toner, and pens', accountId: 'acct-supplies', receipt: 'receipt-od-7823.pdf', recurring: false, createdAt: now },
    { id: 'exp-2', date: '2026-02-05', amount: 1200, vendorId: 'contact-aws', vendorName: 'AWS', categoryId: 'software', description: 'Monthly cloud hosting', accountId: 'acct-software', receipt: null, recurring: true, createdAt: now },
    { id: 'exp-3', date: '2026-02-01', amount: 3000, vendorId: 'contact-wework', vendorName: 'WeWork', categoryId: 'rent', description: 'February coworking space', accountId: 'acct-rent', receipt: 'receipt-ww-202602.pdf', recurring: true, createdAt: now },
    { id: 'exp-4', date: '2026-01-05', amount: 4500, vendorId: 'contact-adp', vendorName: 'ADP', categoryId: 'payroll', description: 'January payroll processing', accountId: 'acct-payroll', receipt: null, recurring: true, createdAt: now },
    { id: 'exp-5', date: '2026-01-22', amount: 850, vendorId: null, vendorName: 'Delta Airlines', categoryId: 'travel', description: 'Client meeting flight SFO-NYC', accountId: 'acct-checking', receipt: 'receipt-delta-123.pdf', recurring: false, createdAt: now },
    { id: 'exp-6', date: '2026-01-18', amount: 125, vendorId: null, vendorName: 'The Capital Grille', categoryId: 'meals', description: 'Client dinner - Acme Corp', accountId: 'acct-cc', receipt: 'receipt-dinner.pdf', recurring: false, createdAt: now },
    { id: 'exp-7', date: '2026-02-11', amount: 285, vendorId: null, vendorName: 'Pacific Gas & Electric', categoryId: 'utilities', description: 'February electric bill', accountId: 'acct-utilities', receipt: null, recurring: true, createdAt: now },
    { id: 'exp-8', date: '2026-01-25', amount: 150, vendorId: null, vendorName: 'Comcast Business', categoryId: 'utilities', description: 'January internet service', accountId: 'acct-utilities', receipt: null, recurring: true, createdAt: now },
    { id: 'exp-9', date: '2026-01-10', amount: 800, vendorId: null, vendorName: 'Adobe', categoryId: 'software', description: 'Annual Creative Cloud license', accountId: 'acct-software', receipt: 'receipt-adobe.pdf', recurring: false, createdAt: now },
    { id: 'exp-10', date: '2026-02-03', amount: 350, vendorId: null, vendorName: 'Google Ads', categoryId: 'advertising', description: 'February ad campaign', accountId: 'acct-checking', receipt: null, recurring: true, createdAt: now },
  ]
}

interface ExpenseState {
  expenses: Expense[]

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void
  updateExpense: (id: string, updates: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  getExpensesByCategory: (category: ExpenseCategory) => Expense[]
  getExpensesByVendor: (vendorId: string) => Expense[]
  getExpensesByDateRange: (start: string, end: string) => Expense[]
  getTotalByCategory: () => Record<string, number>
  clearData: () => void
  importExpenses: (items: Omit<Expense, 'id' | 'createdAt'>[]) => void
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: createSampleExpenses(),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: generateId(), createdAt: new Date().toISOString() }],
        })),

      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      getExpensesByCategory: (category) => get().expenses.filter((e) => e.categoryId === category),

      getExpensesByVendor: (vendorId) => get().expenses.filter((e) => e.vendorId === vendorId),

      getExpensesByDateRange: (start, end) =>
        get().expenses.filter((e) => e.date >= start && e.date <= end),

      getTotalByCategory: () => {
        const totals: Record<string, number> = {}
        for (const expense of get().expenses) {
          totals[expense.categoryId] = (totals[expense.categoryId] ?? 0) + expense.amount
        }
        return totals
      },

      clearData: () => set({ expenses: [] }),

      importExpenses: (items) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            ...items.map((item) => ({
              ...item,
              id: generateId(),
              createdAt: new Date().toISOString(),
            })),
          ],
        })),
    }),
    { name: 'orchestree-expense-storage' }
  )
)
