import { describe, it, expect } from 'vitest'
import type { Account, Transaction, ReportDateRange } from '../types'
import { computeProfitAndLoss, computeBalanceSheet, computeCashFlow } from './reportCalculations'

const testAccounts: Account[] = [
  { id: '1', name: 'Checking', code: '1000', type: 'asset', subType: 'checking', description: '', balance: 10000, createdAt: '' },
  { id: '2', name: 'Savings', code: '1010', type: 'asset', subType: 'savings', description: '', balance: 5000, createdAt: '' },
  { id: '3', name: 'Equipment', code: '1500', type: 'asset', subType: 'fixed_asset', description: '', balance: 3000, createdAt: '' },
  { id: '4', name: 'Accounts Payable', code: '2000', type: 'liability', subType: 'accounts_payable', description: '', balance: 2000, createdAt: '' },
  { id: '5', name: 'Credit Card', code: '2100', type: 'liability', subType: 'credit_card', description: '', balance: 1000, createdAt: '' },
  { id: '6', name: "Owner's Equity", code: '3000', type: 'equity', subType: 'owners_equity', description: '', balance: 10000, createdAt: '' },
  { id: '7', name: 'Retained Earnings', code: '3100', type: 'equity', subType: 'retained_earnings', description: '', balance: 5000, createdAt: '' },
  { id: '8', name: 'Service Revenue', code: '4000', type: 'revenue', subType: 'service_revenue', description: '', balance: 20000, createdAt: '' },
  { id: '9', name: 'Product Revenue', code: '4100', type: 'revenue', subType: 'product_revenue', description: '', balance: 8000, createdAt: '' },
  { id: '10', name: 'Rent Expense', code: '5000', type: 'expense', subType: 'operating_expense', description: '', balance: 6000, createdAt: '' },
  { id: '11', name: 'Payroll', code: '5100', type: 'expense', subType: 'operating_expense', description: '', balance: 12000, createdAt: '' },
  { id: '12', name: 'Depreciation', code: '5200', type: 'expense', subType: 'other_expense', description: '', balance: 500, createdAt: '' },
]

const testTransactions: Transaction[] = []
const testDateRange: ReportDateRange = { startDate: '2026-01-01', endDate: '2026-12-31' }

describe('computeProfitAndLoss', () => {
  it('separates revenue and expense accounts', () => {
    const result = computeProfitAndLoss(testAccounts, testTransactions, testDateRange)
    expect(result.revenue).toHaveLength(2)
    expect(result.expenses).toHaveLength(3)
  })

  it('computes correct totals', () => {
    const result = computeProfitAndLoss(testAccounts, testTransactions, testDateRange)
    expect(result.totalRevenue).toBe(28000)
    expect(result.totalExpenses).toBe(18500)
    expect(result.netIncome).toBe(9500)
  })

  it('includes account names in rows', () => {
    const result = computeProfitAndLoss(testAccounts, testTransactions, testDateRange)
    expect(result.revenue[0]?.accountName).toBe('Service Revenue')
    expect(result.revenue[1]?.accountName).toBe('Product Revenue')
  })

  it('returns zero values when no accounts match', () => {
    const result = computeProfitAndLoss([], testTransactions, testDateRange)
    expect(result.totalRevenue).toBe(0)
    expect(result.totalExpenses).toBe(0)
    expect(result.netIncome).toBe(0)
  })
})

describe('computeBalanceSheet', () => {
  it('separates accounts by type', () => {
    const result = computeBalanceSheet(testAccounts)
    expect(result.assets).toHaveLength(3)
    expect(result.liabilities).toHaveLength(2)
    expect(result.equity).toHaveLength(2)
  })

  it('computes correct totals', () => {
    const result = computeBalanceSheet(testAccounts)
    expect(result.totalAssets).toBe(18000)
    expect(result.totalLiabilities).toBe(3000)
    expect(result.totalEquity).toBe(15000)
  })

  it('detects balanced sheet', () => {
    const result = computeBalanceSheet(testAccounts)
    // 18000 === 3000 + 15000
    expect(result.isBalanced).toBe(true)
  })

  it('detects unbalanced sheet', () => {
    const unbalanced: Account[] = [
      { id: '1', name: 'Cash', code: '1000', type: 'asset', subType: 'checking', description: '', balance: 5000, createdAt: '' },
      { id: '2', name: 'Equity', code: '3000', type: 'equity', subType: 'owners_equity', description: '', balance: 3000, createdAt: '' },
    ]
    const result = computeBalanceSheet(unbalanced)
    expect(result.isBalanced).toBe(false)
  })

  it('handles empty accounts', () => {
    const result = computeBalanceSheet([])
    expect(result.totalAssets).toBe(0)
    expect(result.totalLiabilities).toBe(0)
    expect(result.totalEquity).toBe(0)
    expect(result.isBalanced).toBe(true)
  })
})

describe('computeCashFlow', () => {
  it('computes operating cash flow', () => {
    const result = computeCashFlow(testAccounts, testTransactions, testDateRange)
    // Revenue: 28000, Operating expenses: 18000
    expect(result.netOperating).toBe(10000)
  })

  it('computes investing cash flow', () => {
    const result = computeCashFlow(testAccounts, testTransactions, testDateRange)
    // Fixed assets: 3000
    expect(result.netInvesting).toBe(-3000)
  })

  it('computes financing cash flow', () => {
    const result = computeCashFlow(testAccounts, testTransactions, testDateRange)
    // Equity: 15000
    expect(result.netFinancing).toBe(15000)
  })

  it('computes net change', () => {
    const result = computeCashFlow(testAccounts, testTransactions, testDateRange)
    expect(result.netChange).toBe(result.netOperating + result.netInvesting + result.netFinancing)
  })

  it('computes beginning cash from checking and savings', () => {
    const result = computeCashFlow(testAccounts, testTransactions, testDateRange)
    expect(result.beginningCash).toBe(15000) // 10000 + 5000
  })

  it('returns section rows', () => {
    const result = computeCashFlow(testAccounts, testTransactions, testDateRange)
    expect(result.operating).toHaveLength(2)
    expect(result.investing).toHaveLength(1)
    expect(result.financing).toHaveLength(1)
  })
})
