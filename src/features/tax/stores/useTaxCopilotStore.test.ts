import { act } from 'react'
import { useTaxCopilotStore } from './useTaxCopilotStore'

// ─── Mock Other Tax Stores ──────────────────────────────────────────

vi.mock('./useTaxDocumentStore', () => ({
  useTaxDocumentStore: {
    getState: () => ({
      documents: [
        {
          id: 'doc1',
          fileName: 'W-2_Acme.pdf',
          formType: 'w2',
          taxYear: '2025',
          employerName: 'Acme Corp',
          uploadDate: '2026-01-15T10:30:00Z',
          status: 'verified',
          fileSize: 245000,
          issueNote: '',
        },
        {
          id: 'doc2',
          fileName: '1099-NEC_Freelance.pdf',
          formType: '1099_nec',
          taxYear: '2025',
          employerName: 'Design Studio',
          uploadDate: '2026-01-20T14:15:00Z',
          status: 'pending_review',
          fileSize: 128000,
          issueNote: '',
        },
        {
          id: 'doc3',
          fileName: '1098_Mortgage.pdf',
          formType: '1098',
          taxYear: '2025',
          employerName: 'Wells Fargo',
          uploadDate: '2026-02-01T16:45:00Z',
          status: 'issue_found',
          fileSize: 312000,
          issueNote: 'Missing Box 1',
        },
      ],
      extractionResults: {},
      verifiedCount: () => 1,
      pendingCount: () => 1,
      issueCount: () => 1,
    }),
  },
}))

vi.mock('./useTaxFilingStore', () => ({
  useTaxFilingStore: {
    getState: () => ({
      filings: [
        {
          id: 'filing1',
          taxYear: '2025',
          state: 'in_progress',
          filingStatus: 'single',
          firstName: 'Alex',
          lastName: 'Johnson',
          ssn: '***-**-4589',
          email: 'alex@email.com',
          phone: '555-1234',
          address: {
            street: '742 Evergreen Terrace',
            apt: '',
            city: 'Springfield',
            state: 'IL',
            zip: '62704',
          },
          wages: 85000,
          otherIncome: 12000,
          totalIncome: 97000,
          useStandardDeduction: true,
          standardDeduction: 15000,
          itemizedDeductions: 0,
          effectiveDeduction: 15000,
          taxableIncome: 82000,
          federalTax: 13124,
          estimatedPayments: 0,
          withheld: 14500,
          refundOrOwed: -1376,
          createdAt: '2026-01-28T16:00:00Z',
          updatedAt: '2026-02-01T11:30:00Z',
          filedAt: null,
        },
      ],
      checklist: [
        { id: 'personal_info', label: 'Personal Information', completed: true },
        { id: 'all_w2s', label: 'All W-2s Uploaded', completed: true },
        { id: 'all_1099s', label: 'All 1099s Uploaded', completed: false },
      ],
      checklistProgress: () => 67,
      confirmation: null,
    }),
  },
}))

vi.mock('./useTaxInterviewStore', () => ({
  useTaxInterviewStore: {
    getState: () => ({
      sections: [
        { id: 'personal_info', title: 'Personal Information', description: 'Name and contact', status: 'completed' },
        { id: 'filing_status', title: 'Filing Status', description: 'Filing status selection', status: 'completed' },
        { id: 'income_w2', title: 'W-2 Income', description: 'Employment wages', status: 'in_progress' },
        { id: 'income_1099', title: '1099 Income', description: 'Freelance income', status: 'not_started' },
        { id: 'deductions_standard', title: 'Standard Deduction', description: 'Standard deduction', status: 'not_started' },
      ],
      answers: {},
      isStarted: true,
      isCompleted: false,
      selectedTopics: [],
      filingType: 'individual',
      currentSectionId: 'income_w2',
      getOverallProgress: () => 40,
      getCompletedSections: () => ['personal_info', 'filing_status'],
    }),
  },
}))

// ─── Store Reset ────────────────────────────────────────────────────

function resetStore() {
  useTaxCopilotStore.setState({
    isOpen: false,
    messages: [],
    isTyping: false,
    suggestions: [],
    isAnalyzing: false,
    lastAnalysis: null,
  })
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('useTaxCopilotStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial state', () => {
    it('starts with panel closed, no messages, and no suggestions', () => {
      const state = useTaxCopilotStore.getState()
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
        useTaxCopilotStore.getState().openPanel()
      })
      expect(useTaxCopilotStore.getState().isOpen).toBe(true)
    })

    it('closePanel sets isOpen to false', () => {
      useTaxCopilotStore.setState({ isOpen: true })
      act(() => {
        useTaxCopilotStore.getState().closePanel()
      })
      expect(useTaxCopilotStore.getState().isOpen).toBe(false)
    })

    it('togglePanel flips isOpen', () => {
      expect(useTaxCopilotStore.getState().isOpen).toBe(false)

      act(() => {
        useTaxCopilotStore.getState().togglePanel()
      })
      expect(useTaxCopilotStore.getState().isOpen).toBe(true)

      act(() => {
        useTaxCopilotStore.getState().togglePanel()
      })
      expect(useTaxCopilotStore.getState().isOpen).toBe(false)
    })
  })

  describe('sendMessage', () => {
    it('adds user message and generates assistant response after delay', () => {
      act(() => {
        useTaxCopilotStore.getState().sendMessage('Tell me about deductions')
      })

      const stateAfterSend = useTaxCopilotStore.getState()
      expect(stateAfterSend.messages).toHaveLength(1)
      expect(stateAfterSend.messages[0]!.role).toBe('user')
      expect(stateAfterSend.messages[0]!.content).toBe('Tell me about deductions')
      expect(stateAfterSend.isTyping).toBe(true)

      // Advance past max delay (1500ms)
      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const stateAfterResponse = useTaxCopilotStore.getState()
      expect(stateAfterResponse.messages).toHaveLength(2)
      expect(stateAfterResponse.messages[1]!.role).toBe('assistant')
      expect(stateAfterResponse.isTyping).toBe(false)
      // Should contain deduction-related content
      expect(stateAfterResponse.messages[1]!.content).toContain('deduction')
    })

    it('includes context in the user message when provided', () => {
      act(() => {
        useTaxCopilotStore.getState().sendMessage('Help me here', 'income_w2')
      })

      expect(useTaxCopilotStore.getState().messages[0]!.context).toBe('income_w2')
    })

    it('generates keyword-aware responses for refund', () => {
      act(() => {
        useTaxCopilotStore.getState().sendMessage('What is my refund?')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useTaxCopilotStore.getState().messages[1]!.content
      // The mock filing has refundOrOwed = -1376 (refund)
      expect(response).toContain('refund')
      expect(response).toContain('1,376')
    })

    it('generates keyword-aware responses for audit', () => {
      act(() => {
        useTaxCopilotStore.getState().sendMessage('Am I at risk for an audit?')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useTaxCopilotStore.getState().messages[1]!.content
      expect(response).toContain('audit')
      expect(response).toContain('IRS')
    })
  })

  describe('clearMessages', () => {
    it('empties the messages array and resets isTyping', () => {
      useTaxCopilotStore.setState({
        messages: [
          { id: '1', role: 'user', content: 'Hello', timestamp: '2026-01-01T00:00:00Z' },
          { id: '2', role: 'assistant', content: 'Hi!', timestamp: '2026-01-01T00:00:01Z' },
        ],
        isTyping: true,
      })

      act(() => {
        useTaxCopilotStore.getState().clearMessages()
      })

      const state = useTaxCopilotStore.getState()
      expect(state.messages).toHaveLength(0)
      expect(state.isTyping).toBe(false)
    })
  })

  describe('addSuggestion', () => {
    it('adds a suggestion with generated id and dismissed=false', () => {
      act(() => {
        useTaxCopilotStore.getState().addSuggestion({
          type: 'tip',
          title: 'Test Tip',
          description: 'A helpful tip',
          sectionId: 'income_w2',
        })
      })

      const suggestions = useTaxCopilotStore.getState().suggestions
      expect(suggestions).toHaveLength(1)
      expect(suggestions[0]!.type).toBe('tip')
      expect(suggestions[0]!.title).toBe('Test Tip')
      expect(suggestions[0]!.dismissed).toBe(false)
      expect(suggestions[0]!.id).toBeTruthy()
    })

    it('accumulates multiple suggestions', () => {
      act(() => {
        useTaxCopilotStore.getState().addSuggestion({
          type: 'tip',
          title: 'Tip 1',
          description: 'First tip',
        })
        useTaxCopilotStore.getState().addSuggestion({
          type: 'warning',
          title: 'Warning 1',
          description: 'A warning',
        })
      })

      expect(useTaxCopilotStore.getState().suggestions).toHaveLength(2)
    })
  })

  describe('dismissSuggestion', () => {
    it('marks the specified suggestion as dismissed', () => {
      useTaxCopilotStore.setState({
        suggestions: [
          { id: 'sug1', type: 'tip', title: 'Tip', description: 'A tip', dismissed: false },
          { id: 'sug2', type: 'warning', title: 'Warning', description: 'A warning', dismissed: false },
        ],
      })

      act(() => {
        useTaxCopilotStore.getState().dismissSuggestion('sug1')
      })

      const suggestions = useTaxCopilotStore.getState().suggestions
      expect(suggestions[0]!.dismissed).toBe(true)
      expect(suggestions[1]!.dismissed).toBe(false)
    })
  })

  describe('getSuggestionsForSection', () => {
    it('returns only non-dismissed suggestions for the specified section', () => {
      useTaxCopilotStore.setState({
        suggestions: [
          { id: 's1', type: 'tip', title: 'Tip 1', description: 'Tip for income', dismissed: false, sectionId: 'income_w2' },
          { id: 's2', type: 'warning', title: 'Warning 1', description: 'Warning for income', dismissed: true, sectionId: 'income_w2' },
          { id: 's3', type: 'deduction', title: 'Deduction 1', description: 'Deduction tip', dismissed: false, sectionId: 'deductions_standard' },
          { id: 's4', type: 'tip', title: 'Tip 2', description: 'Another income tip', dismissed: false, sectionId: 'income_w2' },
        ],
      })

      const incomeSuggestions = useTaxCopilotStore.getState().getSuggestionsForSection('income_w2')
      expect(incomeSuggestions).toHaveLength(2)
      expect(incomeSuggestions[0]!.id).toBe('s1')
      expect(incomeSuggestions[1]!.id).toBe('s4')

      const deductionSuggestions = useTaxCopilotStore.getState().getSuggestionsForSection('deductions_standard')
      expect(deductionSuggestions).toHaveLength(1)
      expect(deductionSuggestions[0]!.id).toBe('s3')

      const emptySuggestions = useTaxCopilotStore.getState().getSuggestionsForSection('bank_info')
      expect(emptySuggestions).toHaveLength(0)
    })
  })

  describe('analyzeDocuments', () => {
    it('produces lastAnalysis with document type after delay', () => {
      act(() => {
        useTaxCopilotStore.getState().analyzeDocuments()
      })

      expect(useTaxCopilotStore.getState().isAnalyzing).toBe(true)
      expect(useTaxCopilotStore.getState().lastAnalysis).toBeNull()

      // Advance past the 800ms delay
      act(() => {
        vi.advanceTimersByTime(900)
      })

      const state = useTaxCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('document')
      expect(state.lastAnalysis!.summary).toContain('3 document(s)')
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
      expect(state.lastAnalysis!.timestamp).toBeTruthy()
    })

    it('generates suggestions for documents with issues', () => {
      act(() => {
        useTaxCopilotStore.getState().analyzeDocuments()
      })

      act(() => {
        vi.advanceTimersByTime(900)
      })

      const suggestions = useTaxCopilotStore.getState().suggestions
      // Should have suggestions for unextracted docs and issue docs
      expect(suggestions.length).toBeGreaterThan(0)
      const warningTypes = suggestions.filter((s) => s.type === 'warning' || s.type === 'missing_info')
      expect(warningTypes.length).toBeGreaterThan(0)
    })
  })

  describe('reviewFiling', () => {
    it('produces lastAnalysis with filing type after delay', () => {
      act(() => {
        useTaxCopilotStore.getState().reviewFiling()
      })

      expect(useTaxCopilotStore.getState().isAnalyzing).toBe(true)

      // Advance past the 1000ms delay
      act(() => {
        vi.advanceTimersByTime(1100)
      })

      const state = useTaxCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('filing')
      expect(state.lastAnalysis!.summary).toBeTruthy()
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
    })

    it('detects incomplete interview sections', () => {
      act(() => {
        useTaxCopilotStore.getState().reviewFiling()
      })

      act(() => {
        vi.advanceTimersByTime(1100)
      })

      const items = useTaxCopilotStore.getState().lastAnalysis!.items
      const sectionItem = items.find((i) => i.includes('interview section(s) incomplete'))
      expect(sectionItem).toBeTruthy()
    })
  })

  describe('suggestDeductions', () => {
    it('produces lastAnalysis with deductions type after delay', () => {
      act(() => {
        useTaxCopilotStore.getState().suggestDeductions()
      })

      expect(useTaxCopilotStore.getState().isAnalyzing).toBe(true)

      // Advance past the 600ms delay
      act(() => {
        vi.advanceTimersByTime(700)
      })

      const state = useTaxCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('deductions')
      expect(state.lastAnalysis!.summary).toBeTruthy()
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
    })

    it('suggests deductions based on uploaded document types', () => {
      act(() => {
        useTaxCopilotStore.getState().suggestDeductions()
      })

      act(() => {
        vi.advanceTimersByTime(700)
      })

      const items = useTaxCopilotStore.getState().lastAnalysis!.items
      // Mock has 1098 (mortgage) and 1099_nec (self-employment)
      const mortgageItem = items.find((i) => i.includes('Mortgage'))
      expect(mortgageItem).toBeTruthy()

      const selfEmploymentItem = items.find((i) => i.includes('Self-employment'))
      expect(selfEmploymentItem).toBeTruthy()
    })

    it('generates deduction suggestions', () => {
      act(() => {
        useTaxCopilotStore.getState().suggestDeductions()
      })

      act(() => {
        vi.advanceTimersByTime(700)
      })

      const suggestions = useTaxCopilotStore.getState().suggestions
      const deductionSuggestions = suggestions.filter((s) => s.type === 'deduction')
      expect(deductionSuggestions.length).toBeGreaterThan(0)
    })
  })

  describe('clearSuggestions', () => {
    it('removes all suggestions', () => {
      useTaxCopilotStore.setState({
        suggestions: [
          { id: 's1', type: 'tip', title: 'Tip', description: 'A tip', dismissed: false },
          { id: 's2', type: 'warning', title: 'Warning', description: 'A warning', dismissed: false },
        ],
      })

      act(() => {
        useTaxCopilotStore.getState().clearSuggestions()
      })

      expect(useTaxCopilotStore.getState().suggestions).toHaveLength(0)
    })
  })
})
