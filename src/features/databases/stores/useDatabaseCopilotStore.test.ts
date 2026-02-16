import { act } from 'react'
import { useDatabaseCopilotStore } from './useDatabaseCopilotStore'

// ─── Mock Database Store ─────────────────────────────────────────────

vi.mock('./useDatabaseStore', () => ({
  useDatabaseStore: {
    getState: () => ({
      databases: {
        'db-1': {
          id: 'db-1',
          name: 'CRM Database',
          icon: '📊',
          description: 'Customer relationship data',
          tables: ['tbl-1', 'tbl-2'],
          createdAt: '2026-01-15T00:00:00Z',
          updatedAt: '2026-02-01T00:00:00Z',
        },
      },
      tables: {
        'tbl-1': {
          id: 'tbl-1',
          name: 'Contacts',
          icon: 'users',
          fields: [
            { id: 'fld-1', name: 'Name', type: 'text', width: 280 },
            { id: 'fld-2', name: 'Email', type: 'email', width: 200 },
            { id: 'fld-3', name: 'Company', type: 'text', width: 200 },
            { id: 'fld-4', name: 'Status', type: 'select', width: 160, options: { choices: [{ id: 'c1', name: 'Active', color: '#059669' }] } },
            { id: 'fld-5', name: 'Deals', type: 'relation', width: 160, relationConfig: { targetTableId: 'tbl-2', targetFieldId: 'fld-10', allowMultiple: true } },
          ],
          rows: [
            { id: 'row-1', cells: { 'fld-1': 'Alice Johnson', 'fld-2': 'alice@example.com', 'fld-3': 'Acme', 'fld-4': 'Active', 'fld-5': null }, createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-01-20T00:00:00Z' },
            { id: 'row-2', cells: { 'fld-1': 'Bob Smith', 'fld-2': 'bob@example.com', 'fld-3': '', 'fld-4': null, 'fld-5': null }, createdAt: '2026-01-21T00:00:00Z', updatedAt: '2026-01-21T00:00:00Z' },
          ],
          views: [
            { id: 'view-1', name: 'Grid View', type: 'grid', tableId: 'tbl-1', filters: [], sorts: [], hiddenFields: [], fieldOrder: ['fld-1', 'fld-2', 'fld-3', 'fld-4', 'fld-5'] },
            { id: 'view-2', name: 'By Status', type: 'kanban', tableId: 'tbl-1', filters: [], sorts: [], hiddenFields: [], fieldOrder: ['fld-1', 'fld-2'], groupBy: 'fld-4' },
          ],
        },
        'tbl-2': {
          id: 'tbl-2',
          name: 'Deals',
          icon: 'dollar-sign',
          fields: [
            { id: 'fld-10', name: 'Deal Name', type: 'text', width: 280 },
            { id: 'fld-11', name: 'Value', type: 'number', width: 160 },
            { id: 'fld-12', name: 'Stage', type: 'select', width: 160, required: true },
          ],
          rows: [
            { id: 'row-10', cells: { 'fld-10': 'Enterprise Deal', 'fld-11': 50000, 'fld-12': 'Negotiation' }, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
            { id: 'row-11', cells: { 'fld-10': 'Startup Package', 'fld-11': 5000, 'fld-12': '' }, createdAt: '2026-02-05T00:00:00Z', updatedAt: '2026-02-05T00:00:00Z' },
          ],
          views: [
            { id: 'view-10', name: 'All Deals', type: 'grid', tableId: 'tbl-2', filters: [{ id: 'f1', fieldId: 'fld-12', operator: 'is_not_empty', value: '' }], sorts: [{ fieldId: 'fld-11', direction: 'desc' }], hiddenFields: [], fieldOrder: ['fld-10', 'fld-11', 'fld-12'] },
          ],
        },
      },
      automations: [
        {
          id: 'auto-1',
          name: 'Notify on new deal',
          description: 'Send notification when a deal is created',
          trigger: 'record_created',
          triggerConfig: { tableId: 'tbl-2' },
          action: 'send_notification',
          actionConfig: { message: 'New deal created!' },
          enabled: true,
          createdAt: '2026-01-20T00:00:00Z',
          lastRunAt: '2026-02-10T00:00:00Z',
          runCount: 5,
        },
        {
          id: 'auto-2',
          name: 'Update status on field change',
          description: 'Update contact status when email changes',
          trigger: 'field_changed',
          triggerConfig: { fieldId: 'fld-2' },
          action: 'update_field',
          actionConfig: { fieldId: 'fld-4', value: 'Active' },
          enabled: false,
          createdAt: '2026-01-25T00:00:00Z',
          lastRunAt: null,
          runCount: 0,
        },
      ],
    }),
  },
}))

// ─── Store Reset ────────────────────────────────────────────────────

function resetStore() {
  useDatabaseCopilotStore.setState({
    isOpen: false,
    messages: [],
    isTyping: false,
    suggestions: [],
    isAnalyzing: false,
    lastAnalysis: null,
  })
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('useDatabaseCopilotStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial state', () => {
    it('starts with panel closed, no messages, and no suggestions', () => {
      const state = useDatabaseCopilotStore.getState()
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
        useDatabaseCopilotStore.getState().openPanel()
      })
      expect(useDatabaseCopilotStore.getState().isOpen).toBe(true)
    })

    it('closePanel sets isOpen to false', () => {
      useDatabaseCopilotStore.setState({ isOpen: true })
      act(() => {
        useDatabaseCopilotStore.getState().closePanel()
      })
      expect(useDatabaseCopilotStore.getState().isOpen).toBe(false)
    })

    it('togglePanel flips isOpen', () => {
      expect(useDatabaseCopilotStore.getState().isOpen).toBe(false)

      act(() => {
        useDatabaseCopilotStore.getState().togglePanel()
      })
      expect(useDatabaseCopilotStore.getState().isOpen).toBe(true)

      act(() => {
        useDatabaseCopilotStore.getState().togglePanel()
      })
      expect(useDatabaseCopilotStore.getState().isOpen).toBe(false)
    })
  })

  describe('sendMessage', () => {
    it('adds user message and generates assistant response after delay', () => {
      act(() => {
        useDatabaseCopilotStore.getState().sendMessage('Tell me about tables')
      })

      const stateAfterSend = useDatabaseCopilotStore.getState()
      expect(stateAfterSend.messages).toHaveLength(1)
      expect(stateAfterSend.messages[0]!.role).toBe('user')
      expect(stateAfterSend.messages[0]!.content).toBe('Tell me about tables')
      expect(stateAfterSend.isTyping).toBe(true)

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const stateAfterResponse = useDatabaseCopilotStore.getState()
      expect(stateAfterResponse.messages).toHaveLength(2)
      expect(stateAfterResponse.messages[1]!.role).toBe('assistant')
      expect(stateAfterResponse.isTyping).toBe(false)
      expect(stateAfterResponse.messages[1]!.content).toContain('table')
    })

    it('includes context in the user message when provided', () => {
      act(() => {
        useDatabaseCopilotStore.getState().sendMessage('Help me here', 'tables')
      })

      expect(useDatabaseCopilotStore.getState().messages[0]!.context).toBe('tables')
    })

    it('generates keyword-aware responses for tables', () => {
      act(() => {
        useDatabaseCopilotStore.getState().sendMessage('Show me my tables')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useDatabaseCopilotStore.getState().messages[1]!.content
      expect(response).toContain('table')
      expect(response).toContain('field')
    })

    it('generates keyword-aware responses for views', () => {
      act(() => {
        useDatabaseCopilotStore.getState().sendMessage('What views do I have?')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useDatabaseCopilotStore.getState().messages[1]!.content
      expect(response).toContain('view')
    })

    it('generates keyword-aware responses for automations', () => {
      act(() => {
        useDatabaseCopilotStore.getState().sendMessage('Show my automation rules')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useDatabaseCopilotStore.getState().messages[1]!.content
      expect(response).toContain('automation')
      expect(response).toContain('active')
    })

    it('generates keyword-aware responses for rows/records', () => {
      act(() => {
        useDatabaseCopilotStore.getState().sendMessage('How many rows do I have?')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useDatabaseCopilotStore.getState().messages[1]!.content
      expect(response).toContain('row')
    })

    it('generates keyword-aware responses for relations', () => {
      act(() => {
        useDatabaseCopilotStore.getState().sendMessage('Show me relation fields')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useDatabaseCopilotStore.getState().messages[1]!.content
      expect(response).toContain('advanced field')
    })

    it('generates keyword-aware responses for filters', () => {
      act(() => {
        useDatabaseCopilotStore.getState().sendMessage('Tell me about filter settings')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useDatabaseCopilotStore.getState().messages[1]!.content
      expect(response).toContain('filter')
    })

    it('generates keyword-aware responses for schema', () => {
      act(() => {
        useDatabaseCopilotStore.getState().sendMessage('Show the schema')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useDatabaseCopilotStore.getState().messages[1]!.content
      expect(response).toContain('schema')
    })

    it('generates a fallback response for generic messages', () => {
      act(() => {
        useDatabaseCopilotStore.getState().sendMessage('Hello there')
      })

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      const response = useDatabaseCopilotStore.getState().messages[1]!.content
      expect(response).toContain('Database Copilot')
    })
  })

  describe('clearMessages', () => {
    it('empties the messages array and resets isTyping', () => {
      useDatabaseCopilotStore.setState({
        messages: [
          { id: '1', role: 'user', content: 'Hello', timestamp: '2026-01-01T00:00:00Z' },
          { id: '2', role: 'assistant', content: 'Hi!', timestamp: '2026-01-01T00:00:01Z' },
        ],
        isTyping: true,
      })

      act(() => {
        useDatabaseCopilotStore.getState().clearMessages()
      })

      const state = useDatabaseCopilotStore.getState()
      expect(state.messages).toHaveLength(0)
      expect(state.isTyping).toBe(false)
    })
  })

  describe('addSuggestion', () => {
    it('adds a suggestion with generated id and dismissed=false', () => {
      act(() => {
        useDatabaseCopilotStore.getState().addSuggestion({
          type: 'tip',
          title: 'Test Tip',
          description: 'A helpful tip',
          sectionId: 'schema',
        })
      })

      const suggestions = useDatabaseCopilotStore.getState().suggestions
      expect(suggestions).toHaveLength(1)
      expect(suggestions[0]!.type).toBe('tip')
      expect(suggestions[0]!.title).toBe('Test Tip')
      expect(suggestions[0]!.dismissed).toBe(false)
      expect(suggestions[0]!.id).toBeTruthy()
    })

    it('accumulates multiple suggestions', () => {
      act(() => {
        useDatabaseCopilotStore.getState().addSuggestion({
          type: 'tip',
          title: 'Tip 1',
          description: 'First tip',
        })
        useDatabaseCopilotStore.getState().addSuggestion({
          type: 'warning',
          title: 'Warning 1',
          description: 'A warning',
        })
      })

      expect(useDatabaseCopilotStore.getState().suggestions).toHaveLength(2)
    })
  })

  describe('dismissSuggestion', () => {
    it('marks the specified suggestion as dismissed', () => {
      useDatabaseCopilotStore.setState({
        suggestions: [
          { id: 'sug1', type: 'tip', title: 'Tip', description: 'A tip', dismissed: false },
          { id: 'sug2', type: 'warning', title: 'Warning', description: 'A warning', dismissed: false },
        ],
      })

      act(() => {
        useDatabaseCopilotStore.getState().dismissSuggestion('sug1')
      })

      const suggestions = useDatabaseCopilotStore.getState().suggestions
      expect(suggestions[0]!.dismissed).toBe(true)
      expect(suggestions[1]!.dismissed).toBe(false)
    })
  })

  describe('getSuggestionsForSection', () => {
    it('returns only non-dismissed suggestions for the specified section', () => {
      useDatabaseCopilotStore.setState({
        suggestions: [
          { id: 's1', type: 'tip', title: 'Tip 1', description: 'Schema tip', dismissed: false, sectionId: 'schema' },
          { id: 's2', type: 'warning', title: 'Warning 1', description: 'Dismissed', dismissed: true, sectionId: 'schema' },
          { id: 's3', type: 'review', title: 'Review 1', description: 'Automation review', dismissed: false, sectionId: 'automations' },
          { id: 's4', type: 'optimization', title: 'Opt 1', description: 'Another schema tip', dismissed: false, sectionId: 'schema' },
        ],
      })

      const schemaSuggestions = useDatabaseCopilotStore.getState().getSuggestionsForSection('schema')
      expect(schemaSuggestions).toHaveLength(2)
      expect(schemaSuggestions[0]!.id).toBe('s1')
      expect(schemaSuggestions[1]!.id).toBe('s4')

      const autoSuggestions = useDatabaseCopilotStore.getState().getSuggestionsForSection('automations')
      expect(autoSuggestions).toHaveLength(1)
      expect(autoSuggestions[0]!.id).toBe('s3')

      const emptySuggestions = useDatabaseCopilotStore.getState().getSuggestionsForSection('data_health')
      expect(emptySuggestions).toHaveLength(0)
    })
  })

  describe('analyzeSchema', () => {
    it('produces lastAnalysis with schema type after delay', () => {
      act(() => {
        useDatabaseCopilotStore.getState().analyzeSchema()
      })

      expect(useDatabaseCopilotStore.getState().isAnalyzing).toBe(true)
      expect(useDatabaseCopilotStore.getState().lastAnalysis).toBeNull()

      act(() => {
        vi.advanceTimersByTime(900)
      })

      const state = useDatabaseCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('schema')
      expect(state.lastAnalysis!.summary).toContain('2 table(s)')
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
      expect(state.lastAnalysis!.timestamp).toBeTruthy()
    })

    it('generates suggestions for relation fields and empty tables', () => {
      act(() => {
        useDatabaseCopilotStore.getState().analyzeSchema()
      })

      act(() => {
        vi.advanceTimersByTime(900)
      })

      const suggestions = useDatabaseCopilotStore.getState().suggestions
      expect(suggestions.length).toBeGreaterThan(0)
      const tipSuggestions = suggestions.filter((s) => s.type === 'tip')
      expect(tipSuggestions.length).toBeGreaterThan(0)
    })
  })

  describe('reviewAutomations', () => {
    it('produces lastAnalysis with automations type after delay', () => {
      act(() => {
        useDatabaseCopilotStore.getState().reviewAutomations()
      })

      expect(useDatabaseCopilotStore.getState().isAnalyzing).toBe(true)

      act(() => {
        vi.advanceTimersByTime(900)
      })

      const state = useDatabaseCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('automations')
      expect(state.lastAnalysis!.summary).toBeTruthy()
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
    })

    it('detects inactive automations and generates suggestions', () => {
      act(() => {
        useDatabaseCopilotStore.getState().reviewAutomations()
      })

      act(() => {
        vi.advanceTimersByTime(900)
      })

      const items = useDatabaseCopilotStore.getState().lastAnalysis!.items
      const activeItem = items.find((i) => i.includes('active'))
      expect(activeItem).toBeTruthy()
      const inactiveItem = items.find((i) => i.includes('inactive'))
      expect(inactiveItem).toBeTruthy()

      const suggestions = useDatabaseCopilotStore.getState().suggestions
      const reviewSuggestions = suggestions.filter((s) => s.type === 'review' || s.type === 'warning')
      expect(reviewSuggestions.length).toBeGreaterThan(0)
    })
  })

  describe('checkDataHealth', () => {
    it('produces lastAnalysis with data_health type after delay', () => {
      act(() => {
        useDatabaseCopilotStore.getState().checkDataHealth()
      })

      expect(useDatabaseCopilotStore.getState().isAnalyzing).toBe(true)

      act(() => {
        vi.advanceTimersByTime(700)
      })

      const state = useDatabaseCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('data_health')
      expect(state.lastAnalysis!.summary).toBeTruthy()
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
    })

    it('includes fill rate and row count in items', () => {
      act(() => {
        useDatabaseCopilotStore.getState().checkDataHealth()
      })

      act(() => {
        vi.advanceTimersByTime(700)
      })

      const items = useDatabaseCopilotStore.getState().lastAnalysis!.items
      const rowItem = items.find((i) => i.includes('row'))
      expect(rowItem).toBeTruthy()

      const fillItem = items.find((i) => i.includes('fill rate'))
      expect(fillItem).toBeTruthy()
    })

    it('detects missing required fields', () => {
      act(() => {
        useDatabaseCopilotStore.getState().checkDataHealth()
      })

      act(() => {
        vi.advanceTimersByTime(700)
      })

      // tbl-2 has a required field (fld-12 Stage) with one empty value
      const items = useDatabaseCopilotStore.getState().lastAnalysis!.items
      const requiredItem = items.find((i) => i.includes('required'))
      expect(requiredItem).toBeTruthy()

      const suggestions = useDatabaseCopilotStore.getState().suggestions
      const warningSuggestions = suggestions.filter((s) => s.type === 'warning')
      expect(warningSuggestions.length).toBeGreaterThan(0)
    })
  })

  describe('clearSuggestions', () => {
    it('removes all suggestions', () => {
      useDatabaseCopilotStore.setState({
        suggestions: [
          { id: 's1', type: 'tip', title: 'Tip', description: 'A tip', dismissed: false },
          { id: 's2', type: 'warning', title: 'Warning', description: 'A warning', dismissed: false },
        ],
      })

      act(() => {
        useDatabaseCopilotStore.getState().clearSuggestions()
      })

      expect(useDatabaseCopilotStore.getState().suggestions).toHaveLength(0)
    })
  })
})
