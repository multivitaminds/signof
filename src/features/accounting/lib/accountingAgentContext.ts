import { useAccountingStore } from '../stores/useAccountingStore'
import { useExpenseStore } from '../stores/useExpenseStore'
import { useInvoiceStore } from '../stores/useInvoiceStore'
import { usePayrollStore } from '../stores/usePayrollStore'
import { ACCOUNT_TYPE_LABELS, EXPENSE_CATEGORY_LABELS, ACC_INVOICE_STATUS_LABELS } from '../types'
import type { AccountType, ExpenseCategory, AccInvoiceStatus } from '../types'

// ─── Accounting Context ──────────────────────────────────────────────

export function buildAccountingContext(): string {
  const state = useAccountingStore.getState()
  const { accounts, activeFiscalYear } = state

  if (accounts.length === 0) {
    return 'Accounting: No accounts in the chart of accounts.'
  }

  const lines: string[] = [`Accounting: ${accounts.length} account(s), Fiscal Year ${activeFiscalYear}`]

  // Count by type
  const byType: Record<string, { count: number; total: number }> = {}
  for (const acct of accounts) {
    if (!byType[acct.type]) {
      byType[acct.type] = { count: 0, total: 0 }
    }
    const entry = byType[acct.type]!
    entry.count++
    entry.total += acct.balance
  }

  for (const [type, data] of Object.entries(byType)) {
    const label = ACCOUNT_TYPE_LABELS[type as AccountType] ?? type
    lines.push(`  ${label}: ${data.count} account(s), $${data.total.toLocaleString()}`)
  }

  // Summary totals
  const totalAssets = byType['asset']?.total ?? 0
  const totalLiabilities = byType['liability']?.total ?? 0
  const totalEquity = byType['equity']?.total ?? 0
  lines.push(`  Total Assets: $${totalAssets.toLocaleString()}`)
  lines.push(`  Total Liabilities: $${totalLiabilities.toLocaleString()}`)
  lines.push(`  Total Equity: $${totalEquity.toLocaleString()}`)

  return lines.join('\n')
}

// ─── Invoice Context ────────────────────────────────────────────────

export function buildInvoiceContext(): string {
  const state = useInvoiceStore.getState()
  const { invoices } = state

  if (invoices.length === 0) {
    return 'Invoices: No invoices created yet.'
  }

  const lines: string[] = [`Invoices: ${invoices.length} total`]

  // By status
  const byStatus: Record<string, number> = {}
  for (const inv of invoices) {
    byStatus[inv.status] = (byStatus[inv.status] ?? 0) + 1
  }

  for (const [status, count] of Object.entries(byStatus)) {
    const label = ACC_INVOICE_STATUS_LABELS[status as AccInvoiceStatus] ?? status
    lines.push(`  ${label}: ${count}`)
  }

  // Outstanding and overdue
  const outstanding = state.getOutstandingTotal()
  const overdue = state.getOverdueTotal()
  lines.push(`  Outstanding Total: $${outstanding.toLocaleString()}`)
  lines.push(`  Overdue Total: $${overdue.toLocaleString()}`)

  // Recent invoices
  const recent = invoices.slice(0, 5)
  lines.push('  Recent:')
  for (const inv of recent) {
    lines.push(`    - ${inv.invoiceNumber}: ${inv.customerName} — $${inv.total.toLocaleString()} (${inv.status})`)
  }

  return lines.join('\n')
}

// ─── Expense Context ────────────────────────────────────────────────

export function buildExpenseContext(): string {
  const state = useExpenseStore.getState()
  const { expenses } = state

  if (expenses.length === 0) {
    return 'Expenses: No expenses recorded yet.'
  }

  const totalByCategory = state.getTotalByCategory()
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const lines: string[] = [`Expenses: ${expenses.length} total, $${totalExpenses.toLocaleString()}`]

  // By category
  const sortedCategories = Object.entries(totalByCategory)
    .sort(([, a], [, b]) => b - a)

  for (const [cat, amount] of sortedCategories) {
    const label = EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] ?? cat
    lines.push(`  ${label}: $${amount.toLocaleString()}`)
  }

  // Top vendors
  const vendorTotals: Record<string, number> = {}
  for (const exp of expenses) {
    vendorTotals[exp.vendorName] = (vendorTotals[exp.vendorName] ?? 0) + exp.amount
  }
  const topVendors = Object.entries(vendorTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  lines.push('  Top Vendors:')
  for (const [name, amount] of topVendors) {
    lines.push(`    - ${name}: $${amount.toLocaleString()}`)
  }

  // Recurring count
  const recurringCount = expenses.filter((e) => e.recurring).length
  lines.push(`  Recurring: ${recurringCount} expense(s)`)

  return lines.join('\n')
}

// ─── Payroll Context ────────────────────────────────────────────────

export function buildPayrollContext(): string {
  const state = usePayrollStore.getState()
  const { employees, payRuns } = state

  if (employees.length === 0) {
    return 'Payroll: No employees registered.'
  }

  const activeCount = employees.filter((e) => e.status === 'active').length
  const totalAnnualPayroll = employees
    .filter((e) => e.status === 'active')
    .reduce((sum, e) => sum + e.payRate, 0)

  const lines: string[] = [
    `Payroll: ${employees.length} employee(s), ${activeCount} active`,
    `  Total Annual Payroll: $${totalAnnualPayroll.toLocaleString()}`,
  ]

  // Latest pay run
  if (payRuns.length > 0) {
    const latest = payRuns[payRuns.length - 1]!
    lines.push(`  Latest Pay Run: ${latest.payDate} (${latest.status})`)
    lines.push(`    Gross: $${latest.totalGross.toLocaleString()}, Net: $${latest.totalNet.toLocaleString()}`)
  } else {
    lines.push('  No pay runs yet')
  }

  return lines.join('\n')
}

// ─── Full Accounting Context ────────────────────────────────────────

export function buildFullAccountingContext(): string {
  const lines: string[] = [
    '=== Accounting Context ===',
    '',
    buildAccountingContext(),
    '',
    buildInvoiceContext(),
    '',
    buildExpenseContext(),
    '',
    buildPayrollContext(),
    '',
    '=== End Accounting Context ===',
  ]

  return lines.join('\n')
}
