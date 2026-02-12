import type { Account, Transaction, ReportDateRange, ProfitAndLossRow, BalanceSheetRow, CashFlowRow } from '../types'

export interface ProfitAndLossData {
  revenue: ProfitAndLossRow[]
  expenses: ProfitAndLossRow[]
  totalRevenue: number
  totalExpenses: number
  netIncome: number
}

export function computeProfitAndLoss(accounts: Account[], _transactions: Transaction[], _dateRange: ReportDateRange): ProfitAndLossData {
  const revenueAccounts = accounts.filter(a => a.type === 'revenue')
  const expenseAccounts = accounts.filter(a => a.type === 'expense')

  const revenue = revenueAccounts.map(a => ({ accountName: a.name, amount: a.balance }))
  const expenses = expenseAccounts.map(a => ({ accountName: a.name, amount: a.balance }))
  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return { revenue, expenses, totalRevenue, totalExpenses, netIncome: totalRevenue - totalExpenses }
}

export interface BalanceSheetData {
  assets: BalanceSheetRow[]
  liabilities: BalanceSheetRow[]
  equity: BalanceSheetRow[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  isBalanced: boolean
}

export function computeBalanceSheet(accounts: Account[]): BalanceSheetData {
  const assets = accounts.filter(a => a.type === 'asset').map(a => ({ accountName: a.name, amount: a.balance }))
  const liabilities = accounts.filter(a => a.type === 'liability').map(a => ({ accountName: a.name, amount: a.balance }))
  const equity = accounts.filter(a => a.type === 'equity').map(a => ({ accountName: a.name, amount: a.balance }))

  const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0)

  return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity, isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 }
}

export interface CashFlowData {
  operating: CashFlowRow[]
  investing: CashFlowRow[]
  financing: CashFlowRow[]
  netOperating: number
  netInvesting: number
  netFinancing: number
  netChange: number
  beginningCash: number
  endingCash: number
}

export function computeCashFlow(accounts: Account[], _transactions: Transaction[], _dateRange: ReportDateRange): CashFlowData {
  const revenue = accounts.filter(a => a.type === 'revenue').reduce((sum, a) => sum + a.balance, 0)
  const operatingExpenses = accounts.filter(a => a.type === 'expense' && a.subType === 'operating_expense').reduce((sum, a) => sum + a.balance, 0)

  const operating = [
    { description: 'Revenue received', amount: revenue },
    { description: 'Operating expenses paid', amount: -operatingExpenses },
  ]
  const netOperating = revenue - operatingExpenses

  const fixedAssets = accounts.filter(a => a.subType === 'fixed_asset').reduce((sum, a) => sum + a.balance, 0)
  const investing = [
    { description: 'Equipment & fixed assets', amount: -fixedAssets },
  ]
  const netInvesting = -fixedAssets

  const equityTotal = accounts.filter(a => a.type === 'equity').reduce((sum, a) => sum + a.balance, 0)
  const financing = [
    { description: "Owner's equity & retained earnings", amount: equityTotal },
  ]
  const netFinancing = equityTotal

  const cashAccounts = accounts.filter(a => a.subType === 'checking' || a.subType === 'savings')
  const beginningCash = cashAccounts.reduce((sum, a) => sum + a.balance, 0)
  const netChange = netOperating + netInvesting + netFinancing

  return { operating, investing, financing, netOperating, netInvesting, netFinancing, netChange, beginningCash, endingCash: beginningCash }
}
