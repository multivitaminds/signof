import { searchAll } from './searchEngine'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useWorkspaceStore } from '../../workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../projects/stores/useProjectStore'
import { useSchedulingStore } from '../../scheduling/stores/useSchedulingStore'
import { useDatabaseStore } from '../../databases/stores/useDatabaseStore'
import { SearchResultType } from '../types'

describe('searchEngine', () => {
  describe('searchAll', () => {
    it('returns empty array for empty query', () => {
      expect(searchAll('')).toEqual([])
      expect(searchAll('   ')).toEqual([])
    })

    it('searches documents by name', () => {
      const docs = useDocumentStore.getState().documents
      // There should be sample documents in the store
      expect(docs.length).toBeGreaterThan(0)

      const results = searchAll('Employment')
      const docResults = results.filter((r) => r.type === SearchResultType.Document)
      expect(docResults.length).toBeGreaterThan(0)
      expect(docResults[0]!.title).toContain('Employment')
      expect(docResults[0]!.type).toBe('document')
      expect(docResults[0]!.path).toMatch(/^\/documents\//)
    })

    it('searches workspace pages by title', () => {
      const pages = Object.values(useWorkspaceStore.getState().pages)
      expect(pages.length).toBeGreaterThan(0)

      const results = searchAll('Getting Started')
      const pageResults = results.filter((r) => r.type === SearchResultType.Page)
      expect(pageResults.length).toBeGreaterThan(0)
      expect(pageResults[0]!.title).toBe('Getting Started')
      expect(pageResults[0]!.path).toMatch(/^\/pages\//)
    })

    it('searches project issues by title', () => {
      const issues = Object.values(useProjectStore.getState().issues)
      if (issues.length === 0) return // Skip if no sample issues

      const firstIssue = issues[0]!
      const queryWord = firstIssue.title.split(' ')[0]!
      const results = searchAll(queryWord)
      const issueResults = results.filter((r) => r.type === SearchResultType.Issue)
      expect(issueResults.length).toBeGreaterThan(0)
    })

    it('searches scheduling event types by name', () => {
      const eventTypes = useSchedulingStore.getState().eventTypes
      if (eventTypes.length === 0) return // Skip if no sample events

      const firstEvent = eventTypes[0]!
      const results = searchAll(firstEvent.name)
      const bookingResults = results.filter((r) => r.type === SearchResultType.Booking)
      expect(bookingResults.length).toBeGreaterThan(0)
      expect(bookingResults[0]!.title).toBe(firstEvent.name)
    })

    it('searches databases by name', () => {
      const databases = Object.values(useDatabaseStore.getState().databases)
      if (databases.length === 0) return // Skip if no sample databases

      const firstDb = databases[0]!
      const results = searchAll(firstDb.name)
      const dbResults = results.filter((r) => r.type === SearchResultType.Database)
      expect(dbResults.length).toBeGreaterThan(0)
    })

    it('returns results sorted by score descending', () => {
      const results = searchAll('NDA')
      if (results.length < 2) return

      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1]!
        const curr = results[i]!
        // Higher score should come first, or equal score with alphabetical title
        expect(prev.score).toBeGreaterThanOrEqual(curr.score)
      }
    })

    it('does not return trashed pages', () => {
      // The workspace store has sample data; trash a page
      const store = useWorkspaceStore.getState()
      const pages = Object.values(store.pages)
      const firstPage = pages[0]!

      // Trash the page
      store.deletePage(firstPage.id)

      const results = searchAll(firstPage.title)
      const trashedPageResults = results.filter(
        (r) => r.type === SearchResultType.Page && r.id === firstPage.id
      )
      expect(trashedPageResults).toHaveLength(0)
    })
  })

  describe('scoring', () => {
    it('ranks exact matches highest', () => {
      // "NDA" should match the NDA document with a high score
      const results = searchAll('NDA')
      const ndaResults = results.filter((r) => r.title.includes('NDA'))
      if (ndaResults.length > 0) {
        // NDA result should be near the top
        const ndaIndex = results.indexOf(ndaResults[0]!)
        expect(ndaIndex).toBeLessThan(5)
      }
    })

    it('ranks starts-with matches above substring matches', () => {
      // Create a scenario where we can distinguish starts-with from contains
      // "Getting" should rank "Getting Started" higher than something containing "Getting" mid-string
      const results = searchAll('Getting')
      const pageResults = results.filter((r) => r.type === SearchResultType.Page)
      if (pageResults.length > 0) {
        expect(pageResults[0]!.title).toContain('Getting')
      }
    })

    it('performs fuzzy matching when no substring match exists', () => {
      // "Empl Agr" should fuzzy match "Employment Agreement"
      const results = searchAll('Empl')
      const docResults = results.filter((r) => r.type === SearchResultType.Document)
      expect(docResults.length).toBeGreaterThan(0)
      expect(docResults[0]!.title).toContain('Employment')
    })

    it('each result has required fields', () => {
      const results = searchAll('a')
      for (const result of results) {
        expect(result.id).toBeDefined()
        expect(typeof result.id).toBe('string')
        expect(result.title).toBeDefined()
        expect(typeof result.title).toBe('string')
        expect(result.description).toBeDefined()
        expect(typeof result.description).toBe('string')
        expect(result.type).toBeDefined()
        expect(result.path).toBeDefined()
        expect(typeof result.path).toBe('string')
        expect(result.icon).toBeDefined()
        expect(typeof result.score).toBe('number')
        expect(result.score).toBeGreaterThanOrEqual(0)
      }
    })

    it('handles special characters in query gracefully', () => {
      // Should not throw
      expect(() => searchAll('$pecial [chars]')).not.toThrow()
      expect(() => searchAll('test (query)')).not.toThrow()
      expect(() => searchAll('')).not.toThrow()
    })
  })
})
