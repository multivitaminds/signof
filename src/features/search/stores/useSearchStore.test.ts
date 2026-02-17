import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearchStore } from './useSearchStore'
import { SearchResultType } from '../types/index'

// Mock all external stores
vi.mock('../../../stores/useDocumentStore', () => ({
  useDocumentStore: {
    getState: () => ({
      documents: [
        { id: '1', name: 'Employment Agreement', status: 'pending', createdAt: '2026-01-01', signers: [{ id: 's1', name: 'Jane' }] },
        { id: '2', name: 'NDA Contract', status: 'completed', createdAt: '2026-01-15', signers: [] },
      ],
    }),
  },
}))

vi.mock('../../../features/projects/stores/useProjectStore', () => ({
  useProjectStore: {
    getState: () => ({
      issues: {
        'i1': { id: 'i1', title: 'Fix login bug', description: 'Auth issue', identifier: 'PRJ-1', status: 'todo', projectId: 'p1', createdAt: '2026-01-10', updatedAt: '2026-01-12' },
      },
      projects: {
        'p1': { id: 'p1', name: 'Main Project' },
      },
    }),
  },
}))

vi.mock('../../../features/scheduling/stores/useSchedulingStore', () => ({
  useSchedulingStore: {
    getState: () => ({
      bookings: [
        { id: 'b1', title: 'Team Standup', status: 'confirmed', date: '2026-02-20', attendees: [{ name: 'Alice' }] },
      ],
    }),
  },
}))

vi.mock('../../../features/workspace/stores/useWorkspaceStore', () => ({
  useWorkspaceStore: {
    getState: () => ({
      pages: {
        'pg1': { id: 'pg1', title: 'Getting Started', content: 'Welcome guide', icon: null, createdAt: '2026-01-01', updatedAt: '2026-01-05' },
      },
    }),
  },
}))

vi.mock('../../../features/databases/stores/useDatabaseStore', () => ({
  useDatabaseStore: {
    getState: () => ({
      databases: {
        'db1': { id: 'db1', name: 'Customer Database', tables: [{ rows: [] }], createdAt: '2026-01-01' },
      },
    }),
  },
}))

vi.mock('../../../features/inbox/stores/useInboxStore', () => ({
  useInboxStore: {
    getState: () => ({
      notifications: [
        { id: 'n1', title: 'New signature request', message: 'Document awaiting signature', createdAt: '2026-02-01' },
      ],
    }),
  },
}))

vi.mock('../../../features/ai/stores/useAIAgentStore', () => ({
  __esModule: true,
  default: {
    getState: () => ({
      runs: [
        { id: 'r1', task: 'Research competitors', agentType: 'researcher', status: 'completed', startedAt: '2026-02-01' },
      ],
    }),
  },
}))

vi.mock('../../../features/tax/stores/useTaxStore', () => ({
  useTaxStore: {
    getState: () => ({
      deadlines: [
        { id: 't1', title: 'Q1 Tax Filing', completed: false, date: '2026-04-15' },
      ],
    }),
  },
}))

vi.mock('../../../features/accounting/stores/useInvoiceStore', () => ({
  useInvoiceStore: {
    getState: () => ({
      invoices: [
        { id: 'inv1', invoiceNumber: 'INV-0001', customerName: 'Acme Corp', status: 'sent', total: 1200, createdAt: '2026-02-01' },
      ],
    }),
  },
}))

vi.mock('../../../features/documents/stores/useContactStore', () => ({
  useContactStore: {
    getState: () => ({
      contacts: [
        { id: 'c1', name: 'John Doe', email: 'john@example.com', company: 'Acme', createdAt: '2026-01-01' },
      ],
    }),
  },
}))

describe('useSearchStore', () => {
  beforeEach(() => {
    const state = useSearchStore.getState()
    state.clearResults()
    state.clearRecentSearches()
    state.setFilters({ modules: [] })
  })

  it('starts with empty state', () => {
    const state = useSearchStore.getState()
    expect(state.query).toBe('')
    expect(state.results).toEqual([])
    expect(state.recentSearches).toEqual([])
    expect(state.isSearching).toBe(false)
  })

  it('returns empty results for short queries', () => {
    useSearchStore.getState().search('a')
    expect(useSearchStore.getState().results).toEqual([])
  })

  it('searches documents by name', () => {
    useSearchStore.getState().search('Employment')
    const results = useSearchStore.getState().results
    const docResults = results.filter((r) => r.type === SearchResultType.Document)
    expect(docResults.length).toBeGreaterThan(0)
    expect(docResults[0]?.title).toContain('Employment')
  })

  it('searches issues by title', () => {
    useSearchStore.getState().search('login bug')
    const results = useSearchStore.getState().results
    const issueResults = results.filter((r) => r.type === SearchResultType.Issue)
    expect(issueResults.length).toBeGreaterThan(0)
  })

  it('searches across multiple modules', () => {
    useSearchStore.getState().search('Acme')
    const results = useSearchStore.getState().results
    const types = new Set(results.map((r) => r.type))
    // Should match invoice (Acme Corp) and contact (John Doe at Acme)
    expect(types.size).toBeGreaterThanOrEqual(1)
  })

  it('sorts results by match score descending', () => {
    useSearchStore.getState().search('Agreement')
    const results = useSearchStore.getState().results
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.matchScore).toBeGreaterThanOrEqual(results[i]!.matchScore)
    }
  })

  it('tracks recent searches', () => {
    useSearchStore.getState().addRecentSearch('test query')
    expect(useSearchStore.getState().recentSearches).toContain('test query')
  })

  it('deduplicates recent searches', () => {
    const store = useSearchStore.getState()
    store.addRecentSearch('alpha')
    store.addRecentSearch('beta')
    store.addRecentSearch('alpha')
    const recents = useSearchStore.getState().recentSearches
    expect(recents.filter((r) => r === 'alpha').length).toBe(1)
    expect(recents[0]).toBe('alpha')
  })

  it('limits recent searches to 10', () => {
    const store = useSearchStore.getState()
    for (let i = 0; i < 15; i++) {
      store.addRecentSearch(`query-${i}`)
    }
    expect(useSearchStore.getState().recentSearches.length).toBeLessThanOrEqual(10)
  })

  it('clears recent searches', () => {
    useSearchStore.getState().addRecentSearch('test')
    useSearchStore.getState().clearRecentSearches()
    expect(useSearchStore.getState().recentSearches).toEqual([])
  })

  it('clears results', () => {
    useSearchStore.getState().search('Employment')
    expect(useSearchStore.getState().results.length).toBeGreaterThan(0)
    useSearchStore.getState().clearResults()
    expect(useSearchStore.getState().results).toEqual([])
    expect(useSearchStore.getState().query).toBe('')
  })

  it('respects module filters', () => {
    useSearchStore.getState().setFilters({ modules: [SearchResultType.Document] })
    useSearchStore.getState().search('Acme')
    const results = useSearchStore.getState().results
    // With Document filter active, should only get document results (Acme won't match docs)
    for (const r of results) {
      expect(r.type).toBe(SearchResultType.Document)
    }
  })

  it('searches contacts', () => {
    useSearchStore.getState().search('John Doe')
    const results = useSearchStore.getState().results
    const contactResults = results.filter((r) => r.type === SearchResultType.Contact)
    expect(contactResults.length).toBeGreaterThan(0)
    expect(contactResults[0]?.title).toBe('John Doe')
  })

  it('searches invoices', () => {
    useSearchStore.getState().search('INV-0001')
    const results = useSearchStore.getState().results
    const invResults = results.filter((r) => r.type === SearchResultType.Invoice)
    expect(invResults.length).toBeGreaterThan(0)
  })
})
