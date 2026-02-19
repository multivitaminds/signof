import { act } from 'react'
import { useAccountingCopilotStore } from './useAccountingCopilotStore'

// ─── Mock copilotLLM (always returns fallback) ──────────────────────

vi.mock('../../ai/lib/copilotLLM', () => ({
  copilotChat: (_mod: string, _msg: string, _ctx: string, fallback: () => string) =>
    Promise.resolve(fallback()),
  copilotAnalysis: (_mod: string, _type: string, _ctx: string, fallback: () => { summary: string; items: string[] }) =>
    Promise.resolve(fallback()),
}))

// ─── Mock Accounting Stores ──────────────────────────────────────────

vi.mock('./useAccountingStore', () => ({
  useAccountingStore: {
    getState: () => ({
      accounts: [
        { id: 'acct-checking', name: 'Checking Account', code: '1000', type: 'asset', subType: 'checking', balance: 24500, createdAt: '2026-01-01T00:00:00Z' },
        { id: 'acct-ar', name: 'Accounts Receivable', code: '1200', type: 'asset', subType: 'accounts_receivable', balance: 8200, createdAt: '2026-01-01T00:00:00Z' },
        { id: 'acct-savings', name: 'Savings Account', code: '1010', type: 'asset', subType: 'savings', balance: 50000, createdAt: '2026-01-01T00:00:00Z' },
        { id: 'acct-ap', name: 'Accounts Payable', code: '2000', type: 'liability', subType: 'accounts_payable', balance: 3200, createdAt: '2026-01-01T00:00:00Z' },
        { id: 'acct-service-rev', name: 'Service Revenue', code: '4000', type: 'revenue', subType: 'service_revenue', balance: 45000, createdAt: '2026-01-01T00:00:00Z' },
        { id: 'acct-rent', name: 'Rent Expense', code: '5000', type: 'expense', subType: 'operating_expense', balance: 18000, createdAt: '2026-01-01T00:00:00Z' },
      ],
      transactions: [
        {
          id: 't1', date: '2026-02-01', description: 'Office rent', type: 'expense',
          lines: [
            { id: 'l1', accountId: 'acct-rent', accountName: 'Rent Expense', debit: 3000, credit: 0, description: 'Rent' },
            { id: 'l2', accountId: 'acct-checking', accountName: 'Checking Account', debit: 0, credit: 3000, description: 'Rent payment' },
          ],
          reference: 'RENT-01', reconciliationStatus: 'reconciled', contactId: null, createdAt: '2026-02-01T00:00:00Z',
        },
        {
          id: 't2', date: '2026-02-03', description: 'Client payment', type: 'income',
          lines: [
            { id: 'l3', accountId: 'acct-checking', accountName: 'Checking Account', debit: 5000, credit: 0, description: 'Payment' },
            { id: 'l4', accountId: 'acct-ar', accountName: 'Accounts Receivable', debit: 0, credit: 5000, description: 'AR cleared' },
          ],
          reference: 'PMT-01', reconciliationStatus: 'reconciled', contactId: null, createdAt: '2026-02-03T00:00:00Z',
        },
      ],
      activeFiscalYear: '2026',
    }),
  },
}))

vi.mock('./useExpenseStore', () => ({
  useExpenseStore: {
    getState: () => ({
      expenses: [
        { id: 'exp-1', date: '2026-02-08', amount: 450, vendorId: null, vendorName: 'Office Depot', categoryId: 'office_supplies', description: 'Paper and toner', accountId: 'acct-supplies', receipt: null, recurring: false, createdAt: '2026-02-08T00:00:00Z' },
        { id: 'exp-2', date: '2026-02-05', amount: 1200, vendorId: null, vendorName: 'AWS', categoryId: 'software', description: 'Monthly hosting', accountId: 'acct-software', receipt: null, recurring: true, createdAt: '2026-02-05T00:00:00Z' },
        { id: 'exp-3', date: '2026-02-01', amount: 3000, vendorId: null, vendorName: 'WeWork', categoryId: 'rent', description: 'February coworking', accountId: 'acct-rent', receipt: null, recurring: true, createdAt: '2026-02-01T00:00:00Z' },
      ],
      getTotalByCategory: () => ({ office_supplies: 450, software: 1200, rent: 3000 }),
    }),
  },
}))

vi.mock('./useInvoiceStore', () => ({
  useInvoiceStore: {
    getState: () => ({
      invoices: [
        { id: 'inv-1', invoiceNumber: 'INV-0001', customerId: 'c1', customerName: 'Acme Corp', issueDate: '2026-02-01', dueDate: '2026-03-03', paymentTerms: 'net_30', status: 'draft', lineItems: [], subtotal: 1200, taxRate: 0, taxAmount: 0, discount: 0, total: 1200, amountPaid: 0, balance: 1200, notes: '', createdAt: '2026-02-01T00:00:00Z' },
        { id: 'inv-2', invoiceNumber: 'INV-0002', customerId: 'c1', customerName: 'Acme Corp', issueDate: '2026-01-15', dueDate: '2026-02-14', paymentTerms: 'net_30', status: 'sent', lineItems: [], subtotal: 3450, taxRate: 0, taxAmount: 0, discount: 0, total: 3450, amountPaid: 0, balance: 3450, notes: '', createdAt: '2026-01-15T00:00:00Z' },
        { id: 'inv-3', invoiceNumber: 'INV-0005', customerId: 'c2', customerName: 'Umbrella Corp', issueDate: '2025-12-15', dueDate: '2026-01-14', paymentTerms: 'net_30', status: 'overdue', lineItems: [], subtotal: 1750, taxRate: 0, taxAmount: 0, discount: 0, total: 1750, amountPaid: 0, balance: 1750, notes: '', createdAt: '2025-12-15T00:00:00Z' },
      ],
      getOutstandingTotal: () => 5200,
      getOverdueTotal: () => 1750,
    }),
  },
}))

vi.mock('./usePayrollStore', () => ({
  usePayrollStore: {
    getState: () => ({
      employees: [
        { id: 'emp-1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@co.com', phone: '555-1111', title: 'Engineering Manager', department: 'Engineering', startDate: '2024-03-15', status: 'active', payRate: 120000, payFrequency: 'monthly', federalWithholding: 0.22, stateWithholding: 0.05 },
        { id: 'emp-2', firstName: 'James', lastName: 'Chen', email: 'james@co.com', phone: '555-2222', title: 'Senior Developer', department: 'Engineering', startDate: '2024-06-01', status: 'active', payRate: 95000, payFrequency: 'biweekly', federalWithholding: 0.22, stateWithholding: 0.05 },
      ],
      payRuns: [
        { id: 'pr-1', payDate: '2026-01-31', status: 'completed', employeeCount: 2, totalGross: 30000, totalTaxes: 5520, totalNet: 24480, createdAt: '2026-01-31T00:00:00Z' },
      ],
      payStubs: [],
    }),
  },
}))

vi.mock('./useAccountingContactStore', () => ({
  useAccountingContactStore: {
    getState: () => ({
      contacts: [
        { id: 'c1', name: 'John Smith', company: 'Acme Corp', email: 'john@acme.com', phone: '555-1001', type: 'customer', address: '123 Main St', outstandingBalance: 3450, createdAt: '2026-01-01T00:00:00Z' },
        { id: 'c2', name: 'AWS Support', company: 'AWS', email: 'billing@aws.com', phone: '800-372-2447', type: 'vendor', address: '410 Terry Ave N', outstandingBalance: 1200, createdAt: '2026-01-01T00:00:00Z' },
      ],
    }),
  },
}))

// ─── Store Reset ────────────────────────────────────────────────────

function resetStore() {
  useAccountingCopilotStore.setState({
    isOpen: false,
    messages: [],
    isTyping: false,
    suggestions: [],
    isAnalyzing: false,
    lastAnalysis: null,
  })
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('useAccountingCopilotStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial state', () => {
    it('starts with panel closed, no messages, and no suggestions', () => {
      const state = useAccountingCopilotStore.getState()
      expect(state.isOpen).toBe(false)
      expect(state.messages).toHaveLength(0)
      expect(state.suggestions).toHaveLength(0)
      expect(state.isTyping).toBe(false)
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).toBeNull()
    })
  })

  describe('Panel controls', () => {
    it('openPanel sets isOpen to true', () => {
      act(() => {
        useAccountingCopilotStore.getState().openPanel()
      })
      expect(useAccountingCopilotStore.getState().isOpen).toBe(true)
    })

    it('closePanel sets isOpen to false', () => {
      useAccountingCopilotStore.setState({ isOpen: true })
      act(() => {
        useAccountingCopilotStore.getState().closePanel()
      })
      expect(useAccountingCopilotStore.getState().isOpen).toBe(false)
    })

    it('togglePanel flips isOpen', () => {
      expect(useAccountingCopilotStore.getState().isOpen).toBe(false)

      act(() => {
        useAccountingCopilotStore.getState().togglePanel()
      })
      expect(useAccountingCopilotStore.getState().isOpen).toBe(true)

      act(() => {
        useAccountingCopilotStore.getState().togglePanel()
      })
      expect(useAccountingCopilotStore.getState().isOpen).toBe(false)
    })
  })

  describe('sendMessage', () => {
    it('adds user message and generates assistant response', async () => {
      act(() => {
        useAccountingCopilotStore.getState().sendMessage('Tell me about expenses')
      })

      const stateAfterSend = useAccountingCopilotStore.getState()
      expect(stateAfterSend.messages).toHaveLength(1)
      expect(stateAfterSend.messages[0]!.role).toBe('user')
      expect(stateAfterSend.messages[0]!.content).toBe('Tell me about expenses')
      expect(stateAfterSend.isTyping).toBe(true)

      await act(async () => {})

      const stateAfterResponse = useAccountingCopilotStore.getState()
      expect(stateAfterResponse.messages).toHaveLength(2)
      expect(stateAfterResponse.messages[1]!.role).toBe('assistant')
      expect(stateAfterResponse.isTyping).toBe(false)
      // Should contain expense-related content
      expect(stateAfterResponse.messages[1]!.content).toContain('expense')
    })

    it('includes context in the user message when provided', () => {
      act(() => {
        useAccountingCopilotStore.getState().sendMessage('Help me here', 'invoices')
      })

      expect(useAccountingCopilotStore.getState().messages[0]!.context).toBe('invoices')
    })

    it('generates keyword-aware responses for invoices', async () => {
      act(() => {
        useAccountingCopilotStore.getState().sendMessage('Show me my invoices')
      })

      await act(async () => {})

      const response = useAccountingCopilotStore.getState().messages[1]!.content
      expect(response).toContain('invoice')
      expect(response).toContain('5,200')
    })

    it('generates keyword-aware responses for payroll', async () => {
      act(() => {
        useAccountingCopilotStore.getState().sendMessage('How much is our payroll?')
      })

      await act(async () => {})

      const response = useAccountingCopilotStore.getState().messages[1]!.content
      expect(response).toContain('employee')
      expect(response).toContain('active')
    })

    it('generates keyword-aware responses for cash flow', async () => {
      act(() => {
        useAccountingCopilotStore.getState().sendMessage('What is our cash flow?')
      })

      await act(async () => {})

      const response = useAccountingCopilotStore.getState().messages[1]!.content
      expect(response).toContain('Cash')
    })
  })

  describe('clearMessages', () => {
    it('empties the messages array and resets isTyping', () => {
      useAccountingCopilotStore.setState({
        messages: [
          { id: '1', role: 'user', content: 'Hello', timestamp: '2026-01-01T00:00:00Z' },
          { id: '2', role: 'assistant', content: 'Hi!', timestamp: '2026-01-01T00:00:01Z' },
        ],
        isTyping: true,
      })

      act(() => {
        useAccountingCopilotStore.getState().clearMessages()
      })

      const state = useAccountingCopilotStore.getState()
      expect(state.messages).toHaveLength(0)
      expect(state.isTyping).toBe(false)
    })
  })

  describe('addSuggestion', () => {
    it('adds a suggestion with generated id and dismissed=false', () => {
      act(() => {
        useAccountingCopilotStore.getState().addSuggestion({
          type: 'tip',
          title: 'Test Tip',
          description: 'A helpful tip',
          sectionId: 'expenses',
        })
      })

      const suggestions = useAccountingCopilotStore.getState().suggestions
      expect(suggestions).toHaveLength(1)
      expect(suggestions[0]!.type).toBe('tip')
      expect(suggestions[0]!.title).toBe('Test Tip')
      expect(suggestions[0]!.dismissed).toBe(false)
      expect(suggestions[0]!.id).toBeTruthy()
    })

    it('accumulates multiple suggestions', () => {
      act(() => {
        useAccountingCopilotStore.getState().addSuggestion({
          type: 'tip',
          title: 'Tip 1',
          description: 'First tip',
        })
        useAccountingCopilotStore.getState().addSuggestion({
          type: 'warning',
          title: 'Warning 1',
          description: 'A warning',
        })
      })

      expect(useAccountingCopilotStore.getState().suggestions).toHaveLength(2)
    })
  })

  describe('dismissSuggestion', () => {
    it('marks the specified suggestion as dismissed', () => {
      useAccountingCopilotStore.setState({
        suggestions: [
          { id: 'sug1', type: 'tip', title: 'Tip', description: 'A tip', dismissed: false },
          { id: 'sug2', type: 'warning', title: 'Warning', description: 'A warning', dismissed: false },
        ],
      })

      act(() => {
        useAccountingCopilotStore.getState().dismissSuggestion('sug1')
      })

      const suggestions = useAccountingCopilotStore.getState().suggestions
      expect(suggestions[0]!.dismissed).toBe(true)
      expect(suggestions[1]!.dismissed).toBe(false)
    })
  })

  describe('getSuggestionsForSection', () => {
    it('returns only non-dismissed suggestions for the specified section', () => {
      useAccountingCopilotStore.setState({
        suggestions: [
          { id: 's1', type: 'tip', title: 'Tip 1', description: 'Expense tip', dismissed: false, sectionId: 'expenses' },
          { id: 's2', type: 'warning', title: 'Warning 1', description: 'Invoice warning', dismissed: true, sectionId: 'expenses' },
          { id: 's3', type: 'review', title: 'Review 1', description: 'Review tip', dismissed: false, sectionId: 'invoices' },
          { id: 's4', type: 'tip', title: 'Tip 2', description: 'Another expense tip', dismissed: false, sectionId: 'expenses' },
        ],
      })

      const expenseSuggestions = useAccountingCopilotStore.getState().getSuggestionsForSection('expenses')
      expect(expenseSuggestions).toHaveLength(2)
      expect(expenseSuggestions[0]!.id).toBe('s1')
      expect(expenseSuggestions[1]!.id).toBe('s4')

      const invoiceSuggestions = useAccountingCopilotStore.getState().getSuggestionsForSection('invoices')
      expect(invoiceSuggestions).toHaveLength(1)
      expect(invoiceSuggestions[0]!.id).toBe('s3')

      const emptySuggestions = useAccountingCopilotStore.getState().getSuggestionsForSection('payroll')
      expect(emptySuggestions).toHaveLength(0)
    })
  })

  describe('analyzeExpenses', () => {
    it('produces lastAnalysis with expenses type', async () => {
      act(() => {
        useAccountingCopilotStore.getState().analyzeExpenses()
      })

      expect(useAccountingCopilotStore.getState().isAnalyzing).toBe(true)
      expect(useAccountingCopilotStore.getState().lastAnalysis).toBeNull()

      await act(async () => {})

      const state = useAccountingCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('expenses')
      expect(state.lastAnalysis!.summary).toContain('3 expense(s)')
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
      expect(state.lastAnalysis!.timestamp).toBeTruthy()
    })

    it('generates suggestions for expense categories', async () => {
      act(() => {
        useAccountingCopilotStore.getState().analyzeExpenses()
      })

      await act(async () => {})

      const suggestions = useAccountingCopilotStore.getState().suggestions
      expect(suggestions.length).toBeGreaterThan(0)
      // Should have a top expense suggestion and recurring suggestion
      const tipSuggestions = suggestions.filter((s) => s.type === 'tip' || s.type === 'review')
      expect(tipSuggestions.length).toBeGreaterThan(0)
    })
  })

  describe('reviewInvoices', () => {
    it('produces lastAnalysis with invoices type', async () => {
      act(() => {
        useAccountingCopilotStore.getState().reviewInvoices()
      })

      expect(useAccountingCopilotStore.getState().isAnalyzing).toBe(true)

      await act(async () => {})

      const state = useAccountingCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('invoices')
      expect(state.lastAnalysis!.summary).toBeTruthy()
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
    })

    it('detects overdue and draft invoices', async () => {
      act(() => {
        useAccountingCopilotStore.getState().reviewInvoices()
      })

      await act(async () => {})

      const items = useAccountingCopilotStore.getState().lastAnalysis!.items
      // Should detect overdue
      const overdueItem = items.find((i) => i.includes('overdue'))
      expect(overdueItem).toBeTruthy()

      // Should detect draft
      const draftItem = items.find((i) => i.includes('draft'))
      expect(draftItem).toBeTruthy()

      // Should generate warning suggestions
      const suggestions = useAccountingCopilotStore.getState().suggestions
      const warningSuggestions = suggestions.filter((s) => s.type === 'warning' || s.type === 'missing_info')
      expect(warningSuggestions.length).toBeGreaterThan(0)
    })
  })

  describe('forecastCashFlow', () => {
    it('produces lastAnalysis with cash_flow type', async () => {
      act(() => {
        useAccountingCopilotStore.getState().forecastCashFlow()
      })

      expect(useAccountingCopilotStore.getState().isAnalyzing).toBe(true)

      await act(async () => {})

      const state = useAccountingCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('cash_flow')
      expect(state.lastAnalysis!.summary).toBeTruthy()
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
    })

    it('includes income and expense transaction counts', async () => {
      act(() => {
        useAccountingCopilotStore.getState().forecastCashFlow()
      })

      await act(async () => {})

      const items = useAccountingCopilotStore.getState().lastAnalysis!.items
      const incomeItem = items.find((i) => i.includes('income transaction'))
      expect(incomeItem).toBeTruthy()

      const expenseItem = items.find((i) => i.includes('expense transaction'))
      expect(expenseItem).toBeTruthy()

      const netItem = items.find((i) => i.includes('Net cash flow'))
      expect(netItem).toBeTruthy()
    })
  })

  describe('clearSuggestions', () => {
    it('removes all suggestions', () => {
      useAccountingCopilotStore.setState({
        suggestions: [
          { id: 's1', type: 'tip', title: 'Tip', description: 'A tip', dismissed: false },
          { id: 's2', type: 'warning', title: 'Warning', description: 'A warning', dismissed: false },
        ],
      })

      act(() => {
        useAccountingCopilotStore.getState().clearSuggestions()
      })

      expect(useAccountingCopilotStore.getState().suggestions).toHaveLength(0)
    })
  })
})
