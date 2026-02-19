import { create } from 'zustand'
import { useAccountingStore } from './useAccountingStore'
import { useExpenseStore } from './useExpenseStore'
import { useInvoiceStore } from './useInvoiceStore'
import { usePayrollStore } from './usePayrollStore'
import { useAccountingContactStore } from './useAccountingContactStore'
import { EXPENSE_CATEGORY_LABELS } from '../types'
import type { ExpenseCategory } from '../types'
import { copilotChat, copilotAnalysis } from '../../ai/lib/copilotLLM'

// ─── ID Generator ────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Types ──────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: string
}

export interface CopilotSuggestion {
  id: string
  type: 'tip' | 'warning' | 'deduction' | 'missing_info' | 'review'
  title: string
  description: string
  action?: { label: string; route?: string }
  dismissed: boolean
  sectionId?: string
}

// ─── Response Generator ─────────────────────────────────────────────

function generateResponse(userMessage: string, context?: string): string {
  const msg = userMessage.toLowerCase()

  // Read from other stores for context-aware answers
  const accountingState = useAccountingStore.getState()
  const expenseState = useExpenseStore.getState()
  const invoiceState = useInvoiceStore.getState()
  const payrollState = usePayrollStore.getState()
  const contactState = useAccountingContactStore.getState()

  // Keyword: invoice / outstanding / overdue
  if (msg.includes('invoice') || msg.includes('outstanding') || msg.includes('overdue')) {
    const invoices = invoiceState.invoices
    const outstanding = invoiceState.getOutstandingTotal()
    const overdue = invoiceState.getOverdueTotal()
    const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue')
    const recentInvoices = invoices.slice(0, 3)

    let response = `You have ${invoices.length} invoice(s) total. Outstanding balance: $${outstanding.toLocaleString()}. Overdue: $${overdue.toLocaleString()} across ${overdueInvoices.length} invoice(s).`
    if (recentInvoices.length > 0) {
      response += `\n\nRecent invoices:\n${recentInvoices.map((inv) => `- ${inv.invoiceNumber}: ${inv.customerName} — $${inv.total.toLocaleString()} (${inv.status})`).join('\n')}`
    }
    if (overdueInvoices.length > 0) {
      response += `\n\nOverdue invoices need attention:\n${overdueInvoices.map((inv) => `- ${inv.invoiceNumber}: ${inv.customerName} — $${inv.balance.toLocaleString()} overdue`).join('\n')}`
    }
    return response
  }

  // Keyword: expense / spending / cost
  if (msg.includes('expense') || msg.includes('spending') || msg.includes('cost')) {
    const expenses = expenseState.expenses
    const totalByCategory = expenseState.getTotalByCategory()
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

    const categoryBreakdown = Object.entries(totalByCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amount]) => {
        const label = EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] ?? cat
        return `- ${label}: $${amount.toLocaleString()}`
      })
      .join('\n')

    // Find top vendors
    const vendorTotals: Record<string, number> = {}
    for (const exp of expenses) {
      vendorTotals[exp.vendorName] = (vendorTotals[exp.vendorName] ?? 0) + exp.amount
    }
    const topVendors = Object.entries(vendorTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, amount]) => `- ${name}: $${amount.toLocaleString()}`)
      .join('\n')

    return `You have ${expenses.length} expense(s) totaling $${totalExpenses.toLocaleString()}.\n\nBy category:\n${categoryBreakdown}\n\nTop vendors:\n${topVendors}`
  }

  // Keyword: cash flow / cash
  if (msg.includes('cash flow') || msg.includes('cash')) {
    const transactions = accountingState.transactions
    let totalIncome = 0
    let totalExpenses = 0

    for (const txn of transactions) {
      if (txn.type === 'income') {
        for (const line of txn.lines) {
          totalIncome += line.debit
        }
      } else if (txn.type === 'expense') {
        for (const line of txn.lines) {
          totalExpenses += line.debit
        }
      }
    }

    // Income transactions have debit on cash/AR and credit on revenue
    // But for simplicity, income = total debit on income txns, expenses = total debit on expense txns
    // Net is actually income debits minus expense debits (since income debits go to cash, expense debits go to expense accounts)
    const netCashFlow = totalIncome - totalExpenses

    return `Cash flow summary based on ${transactions.length} transaction(s):\n- Cash In: $${totalIncome.toLocaleString()}\n- Cash Out: $${totalExpenses.toLocaleString()}\n- Net Cash Flow: ${netCashFlow >= 0 ? '+' : ''}$${netCashFlow.toLocaleString()}\n\n${netCashFlow >= 0 ? 'Positive cash flow — your business is generating more than it spends.' : 'Negative cash flow — expenses exceed income. Review spending to find areas to cut.'}`
  }

  // Keyword: payroll / salary / employee
  if (msg.includes('payroll') || msg.includes('salary') || msg.includes('employee')) {
    const employees = payrollState.employees
    const activeEmployees = employees.filter((e) => e.status === 'active')
    const payRuns = payrollState.payRuns
    const latestRun = payRuns.length > 0 ? payRuns[payRuns.length - 1] : null
    const totalAnnualPayroll = activeEmployees.reduce((sum, e) => sum + e.payRate, 0)

    let response = `You have ${employees.length} employee(s) (${activeEmployees.length} active). Total annual payroll: $${totalAnnualPayroll.toLocaleString()}.`
    if (latestRun) {
      response += `\n\nLatest pay run (${latestRun.payDate}): ${latestRun.status}\n- Gross: $${latestRun.totalGross.toLocaleString()}\n- Taxes: $${latestRun.totalTaxes.toLocaleString()}\n- Net: $${latestRun.totalNet.toLocaleString()}`
    }

    response += `\n\nEmployees:\n${activeEmployees.map((e) => `- ${e.firstName} ${e.lastName}: ${e.title} — $${e.payRate.toLocaleString()}/yr`).join('\n')}`
    return response
  }

  // Keyword: balance / account
  if (msg.includes('balance') || msg.includes('account')) {
    const accounts = accountingState.accounts
    const byType: Record<string, { count: number; total: number }> = {}

    for (const acct of accounts) {
      if (!byType[acct.type]) {
        byType[acct.type] = { count: 0, total: 0 }
      }
      const entry = byType[acct.type]!
      entry.count++
      entry.total += acct.balance
    }

    const breakdown = Object.entries(byType)
      .map(([type, data]) => `- ${type.charAt(0).toUpperCase() + type.slice(1)}: ${data.count} account(s), $${data.total.toLocaleString()}`)
      .join('\n')

    return `You have ${accounts.length} account(s) across your chart of accounts.\n\n${breakdown}\n\nFiscal year: ${accountingState.activeFiscalYear}`
  }

  // Keyword: contact / customer / vendor
  if (msg.includes('contact') || msg.includes('customer') || msg.includes('vendor')) {
    const contacts = contactState.contacts
    const customers = contacts.filter((c) => c.type === 'customer' || c.type === 'both')
    const vendors = contacts.filter((c) => c.type === 'vendor' || c.type === 'both')
    const totalOutstanding = contacts.reduce((sum, c) => sum + c.outstandingBalance, 0)

    return `You have ${contacts.length} contact(s): ${customers.length} customer(s) and ${vendors.length} vendor(s). Total outstanding balances: $${totalOutstanding.toLocaleString()}.\n\nCustomers:\n${customers.map((c) => `- ${c.company} (${c.name}): $${c.outstandingBalance.toLocaleString()} outstanding`).join('\n')}\n\nVendors:\n${vendors.map((c) => `- ${c.company} (${c.name}): $${c.outstandingBalance.toLocaleString()} outstanding`).join('\n')}`
  }

  // Keyword: profit / revenue / income
  if (msg.includes('profit') || msg.includes('revenue') || msg.includes('income')) {
    const accounts = accountingState.accounts
    const revenueAccounts = accounts.filter((a) => a.type === 'revenue')
    const expenseAccounts = accounts.filter((a) => a.type === 'expense')
    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.balance, 0)
    const totalExpenses = expenseAccounts.reduce((sum, a) => sum + a.balance, 0)
    const netIncome = totalRevenue - totalExpenses

    return `Profit & Loss overview:\n- Total Revenue: $${totalRevenue.toLocaleString()}\n  ${revenueAccounts.map((a) => `  - ${a.name}: $${a.balance.toLocaleString()}`).join('\n  ')}\n- Total Expenses: $${totalExpenses.toLocaleString()}\n  ${expenseAccounts.map((a) => `  - ${a.name}: $${a.balance.toLocaleString()}`).join('\n  ')}\n- Net Income: ${netIncome >= 0 ? '+' : ''}$${netIncome.toLocaleString()}`
  }

  // Context-aware: if the user is in a specific section
  if (context) {
    const sectionContextMap: Record<string, string> = {
      chart_of_accounts: 'the Chart of Accounts, where you manage your general ledger accounts (assets, liabilities, equity, revenue, and expenses)',
      transactions: 'the Transactions page, where you record journal entries, income, expenses, and transfers',
      invoices: 'the Invoices page, where you create, send, and track customer invoices',
      expenses: 'the Expenses page, where you record and categorize business expenses',
      payroll: 'the Payroll page, where you manage employees, run payroll, and view pay stubs',
      contacts: 'the Contacts page, where you manage customers and vendors',
      reports: 'the Reports page, where you view financial statements like P&L, Balance Sheet, and Cash Flow',
    }
    const sectionDesc = sectionContextMap[context]
    if (sectionDesc) {
      return `You're currently working in ${sectionDesc}. I can help you understand the data here or suggest actions. What would you like to know?`
    }
  }

  // Fallback: generic helpful response
  const invoiceCount = invoiceState.invoices.length
  const expenseCount = expenseState.expenses.length
  const employeeCount = payrollState.employees.filter((e) => e.status === 'active').length

  return `I'm your Accounting Copilot — here to help manage your business finances. You currently have ${invoiceCount} invoice(s), ${expenseCount} expense(s), and ${employeeCount} active employee(s). I can help with:\n- Invoice tracking and outstanding balances\n- Expense analysis by category and vendor\n- Cash flow analysis\n- Payroll overview\n- Account balances\n- Contact management\n- Profit and revenue insights\n\nWhat would you like to know?`
}

// ─── Store Interface ────────────────────────────────────────────────

interface AccountingCopilotState {
  // Panel visibility
  isOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void

  // Messages
  messages: CopilotMessage[]
  isTyping: boolean
  sendMessage: (content: string, context?: string) => void
  clearMessages: () => void

  // Suggestions
  suggestions: CopilotSuggestion[]
  addSuggestion: (suggestion: Omit<CopilotSuggestion, 'id' | 'dismissed'>) => void
  dismissSuggestion: (id: string) => void
  getSuggestionsForSection: (sectionId: string) => CopilotSuggestion[]
  clearSuggestions: () => void

  // Analysis
  isAnalyzing: boolean
  lastAnalysis: {
    type: 'expenses' | 'invoices' | 'cash_flow'
    summary: string
    items: string[]
    timestamp: string
  } | null
  analyzeExpenses: () => void
  reviewInvoices: () => void
  forecastCashFlow: () => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useAccountingCopilotStore = create<AccountingCopilotState>()(
  (set, get) => ({
    isOpen: false,
    messages: [],
    isTyping: false,
    suggestions: [],
    isAnalyzing: false,
    lastAnalysis: null,

    // ─── Panel ───────────────────────────────────────────────────────

    openPanel: () => set({ isOpen: true }),

    closePanel: () => set({ isOpen: false }),

    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

    // ─── Messages ────────────────────────────────────────────────────

    sendMessage: (content, context) => {
      const userMessage: CopilotMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        context,
      }

      set((state) => ({
        messages: [...state.messages, userMessage],
        isTyping: true,
      }))

      const invoiceCount = useInvoiceStore.getState().invoices.length
      const expenseCount = useExpenseStore.getState().expenses.length
      const contextSummary = `${invoiceCount} invoices, ${expenseCount} expenses`

      copilotChat('Accounting', content, contextSummary, () => generateResponse(content, context))
        .then((responseContent) => {
          const assistantMessage: CopilotMessage = {
            id: generateId(),
            role: 'assistant',
            content: responseContent,
            timestamp: new Date().toISOString(),
          }

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isTyping: false,
          }))
        })
    },

    clearMessages: () => set({ messages: [], isTyping: false }),

    // ─── Suggestions ─────────────────────────────────────────────────

    addSuggestion: (suggestion) =>
      set((state) => ({
        suggestions: [
          ...state.suggestions,
          { ...suggestion, id: generateId(), dismissed: false },
        ],
      })),

    dismissSuggestion: (id) =>
      set((state) => ({
        suggestions: state.suggestions.map((s) =>
          s.id === id ? { ...s, dismissed: true } : s
        ),
      })),

    getSuggestionsForSection: (sectionId) => {
      return get().suggestions.filter(
        (s) => s.sectionId === sectionId && !s.dismissed
      )
    },

    clearSuggestions: () => set({ suggestions: [] }),

    // ─── Analysis ────────────────────────────────────────────────────

    analyzeExpenses: () => {
      set({ isAnalyzing: true })

      const expenseState = useExpenseStore.getState()
      const expenses = expenseState.expenses
      const totalByCategory = expenseState.getTotalByCategory()
      const dataContext = `${expenses.length} expenses across ${Object.keys(totalByCategory).length} categories`

      const fallbackFn = () => {
        const items: string[] = []
        const sortedCategories = Object.entries(totalByCategory).sort(([, a], [, b]) => b - a)
        for (const [cat, amount] of sortedCategories) {
          const label = EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] ?? cat
          items.push(`${label}: $${amount.toLocaleString()}`)
        }
        const recurringExpenses = expenses.filter((e) => e.recurring)
        if (recurringExpenses.length > 0) {
          const recurringTotal = recurringExpenses.reduce((sum, e) => sum + e.amount, 0)
          items.push(`${recurringExpenses.length} recurring expense(s) totaling $${recurringTotal.toLocaleString()}/period`)
        }
        if (sortedCategories.length > 0) {
          const [topCategory, topAmount] = sortedCategories[0]!
          const topLabel = EXPENSE_CATEGORY_LABELS[topCategory as ExpenseCategory] ?? topCategory
          get().addSuggestion({ type: 'tip', title: `Top Expense: ${topLabel}`, description: `Your largest expense category is ${topLabel} at $${topAmount.toLocaleString()}. Review to identify potential savings.`, action: { label: 'View Expenses', route: '/accounting/expenses' }, sectionId: 'expenses' })
        }
        if (recurringExpenses.length > 0) {
          get().addSuggestion({ type: 'review', title: 'Review Recurring Expenses', description: `You have ${recurringExpenses.length} recurring expense(s). Review these regularly to ensure they are still necessary.`, action: { label: 'View Expenses', route: '/accounting/expenses' }, sectionId: 'expenses' })
        }
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
        const summary = expenses.length > 0 ? `Analyzed ${expenses.length} expense(s) totaling $${totalExpenses.toLocaleString()} across ${sortedCategories.length} categories.` : 'No expenses recorded yet. Start tracking your expenses to get insights.'
        return { summary, items }
      }

      copilotAnalysis('Accounting', 'expenses', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'expenses', ...result, timestamp: new Date().toISOString() } })
        })
    },

    reviewInvoices: () => {
      set({ isAnalyzing: true })

      const invoiceState = useInvoiceStore.getState()
      const invoices = invoiceState.invoices
      const dataContext = `${invoices.length} invoices, outstanding: $${invoiceState.getOutstandingTotal().toLocaleString()}`

      const fallbackFn = () => {
        const items: string[] = []
        if (invoices.length === 0) return { summary: 'No invoices found. Create your first invoice to get started.', items: ['No invoices created yet'] }
        const statusCounts: Record<string, number> = {}
        for (const inv of invoices) { statusCounts[inv.status] = (statusCounts[inv.status] ?? 0) + 1 }
        for (const [status, count] of Object.entries(statusCounts)) { items.push(`${count} invoice(s) with status: ${status}`) }
        const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue')
        if (overdueInvoices.length > 0) {
          const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + inv.balance, 0)
          items.push(`$${overdueTotal.toLocaleString()} overdue across ${overdueInvoices.length} invoice(s)`)
          get().addSuggestion({ type: 'warning', title: 'Overdue Invoices', description: `${overdueInvoices.length} invoice(s) are overdue totaling $${overdueTotal.toLocaleString()}: ${overdueInvoices.map((inv) => `${inv.invoiceNumber} (${inv.customerName})`).join(', ')}.`, action: { label: 'View Invoices', route: '/accounting/invoices' }, sectionId: 'invoices' })
        }
        const draftInvoices = invoices.filter((inv) => inv.status === 'draft')
        if (draftInvoices.length > 0) {
          const draftTotal = draftInvoices.reduce((sum, inv) => sum + inv.total, 0)
          items.push(`${draftInvoices.length} draft invoice(s) totaling $${draftTotal.toLocaleString()} not yet sent`)
          get().addSuggestion({ type: 'missing_info', title: 'Unsent Draft Invoices', description: `${draftInvoices.length} invoice(s) are still in draft and haven't been sent to customers. Total value: $${draftTotal.toLocaleString()}.`, action: { label: 'Review Drafts', route: '/accounting/invoices' }, sectionId: 'invoices' })
        }
        const outstanding = invoiceState.getOutstandingTotal()
        items.push(`Total outstanding: $${outstanding.toLocaleString()}`)
        const summary = `Reviewed ${invoices.length} invoice(s). Outstanding: $${outstanding.toLocaleString()}.${overdueInvoices.length > 0 ? ` ${overdueInvoices.length} overdue.` : ''}`
        return { summary, items }
      }

      copilotAnalysis('Accounting', 'invoices', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'invoices', ...result, timestamp: new Date().toISOString() } })
        })
    },

    forecastCashFlow: () => {
      set({ isAnalyzing: true })

      const accountingState = useAccountingStore.getState()
      const transactions = accountingState.transactions
      const dataContext = `${transactions.length} transactions in ledger`

      const fallbackFn = () => {
        const items: string[] = []
        let totalCashIn = 0, totalCashOut = 0, incomeCount = 0, expenseCount = 0
        for (const txn of transactions) {
          if (txn.type === 'income') { incomeCount++; for (const line of txn.lines) { totalCashIn += line.debit } }
          else if (txn.type === 'expense') { expenseCount++; for (const line of txn.lines) { totalCashOut += line.debit } }
        }
        const netCashFlow = totalCashIn - totalCashOut
        items.push(`${incomeCount} income transaction(s): $${totalCashIn.toLocaleString()} in`)
        items.push(`${expenseCount} expense transaction(s): $${totalCashOut.toLocaleString()} out`)
        items.push(`Net cash flow: ${netCashFlow >= 0 ? '+' : ''}$${netCashFlow.toLocaleString()}`)
        if (totalCashIn > 0 && totalCashOut > 0) {
          const ratio = totalCashIn / totalCashOut
          if (ratio >= 1.5) { items.push('Healthy income-to-expense ratio (1.5x+)') }
          else if (ratio >= 1.0) {
            items.push('Income covers expenses but margins are tight')
            get().addSuggestion({ type: 'tip', title: 'Tight Cash Flow Margins', description: 'Your income barely covers expenses. Consider reviewing recurring costs or increasing revenue to build a financial buffer.', sectionId: 'cash_flow' })
          } else {
            items.push('Warning: expenses exceed income')
            get().addSuggestion({ type: 'warning', title: 'Negative Cash Flow', description: `Expenses ($${totalCashOut.toLocaleString()}) exceed income ($${totalCashIn.toLocaleString()}). Review spending and consider strategies to increase revenue.`, action: { label: 'View Expenses', route: '/accounting/expenses' }, sectionId: 'cash_flow' })
          }
        }
        const checkingAccounts = accountingState.accounts.filter((a) => a.type === 'asset' && (a.name.toLowerCase().includes('checking') || a.name.toLowerCase().includes('savings')))
        if (checkingAccounts.length > 0) {
          const liquidCash = checkingAccounts.reduce((sum, a) => sum + a.balance, 0)
          items.push(`Liquid cash (checking + savings): $${liquidCash.toLocaleString()}`)
        }
        const summary = transactions.length > 0 ? `Cash flow analysis based on ${transactions.length} transaction(s). Net: ${netCashFlow >= 0 ? '+' : ''}$${netCashFlow.toLocaleString()}.` : 'No transactions recorded yet. Start recording transactions to get cash flow insights.'
        return { summary, items }
      }

      copilotAnalysis('Accounting', 'cash_flow', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'cash_flow', ...result, timestamp: new Date().toISOString() } })
        })
    },
  })
)
