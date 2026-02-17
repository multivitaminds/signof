import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SearchResult, SearchFilter } from '../types/index'
import { SearchResultType } from '../types/index'
import { fuzzyMatch } from '../../../lib/fuzzyMatch'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useProjectStore } from '../../../features/projects/stores/useProjectStore'
import { useSchedulingStore } from '../../../features/scheduling/stores/useSchedulingStore'
import { useWorkspaceStore } from '../../../features/workspace/stores/useWorkspaceStore'
import { useDatabaseStore } from '../../../features/databases/stores/useDatabaseStore'
import { useInboxStore } from '../../../features/inbox/stores/useInboxStore'
import useAIAgentStore from '../../../features/ai/stores/useAIAgentStore'
import { useTaxStore } from '../../../features/tax/stores/useTaxStore'
import { useInvoiceStore } from '../../../features/accounting/stores/useInvoiceStore'
import { useContactStore } from '../../../features/documents/stores/useContactStore'

interface SearchState {
  query: string
  results: SearchResult[]
  recentSearches: string[]
  isSearching: boolean
  filters: SearchFilter

  search: (query: string) => void
  clearResults: () => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  setFilters: (filters: Partial<SearchFilter>) => void
}

const MAX_RECENT = 10
const MAX_PER_CATEGORY = 8

function bestMatch(query: string, ...targets: string[]): { score: number; indices: number[] } | null {
  let best: { score: number; indices: number[] } | null = null
  for (const t of targets) {
    if (!t) continue
    const m = fuzzyMatch(query, t)
    if (m && (!best || m.score > best.score)) {
      best = { score: m.score, indices: m.matchedIndices }
    }
  }
  return best
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      results: [],
      recentSearches: [],
      isSearching: false,
      filters: {
        modules: [],
        query: '',
      },

      search: (query: string) => {
        set({ query, isSearching: true })

        if (!query || query.length < 2) {
          set({ results: [], isSearching: false })
          return
        }

        const { filters } = get()
        const activeModules = filters.modules.length > 0 ? new Set(filters.modules) : null
        const results: SearchResult[] = []

        // Search documents
        if (!activeModules || activeModules.has(SearchResultType.Document)) {
          const documents = useDocumentStore.getState().documents
          let count = 0
          for (const doc of documents) {
            if (count >= MAX_PER_CATEGORY) break
            const m = bestMatch(query, doc.name)
            if (m) {
              count++
              results.push({
                id: `doc-${doc.id}`,
                type: SearchResultType.Document,
                title: doc.name,
                description: `${doc.status} - ${doc.signers.length} signer${doc.signers.length !== 1 ? 's' : ''}`,
                modulePath: `/documents/${doc.id}`,
                icon: 'FileText',
                matchScore: m.score,
                timestamp: doc.createdAt,
                matchedIndices: m.indices,
              })
            }
          }
        }

        // Search pages
        if (!activeModules || activeModules.has(SearchResultType.Page)) {
          const pages = Object.values(useWorkspaceStore.getState().pages)
          let count = 0
          for (const page of pages) {
            if (count >= MAX_PER_CATEGORY) break
            const title = page.title || 'Untitled'
            const m = bestMatch(query, title)
            if (m) {
              count++
              results.push({
                id: `page-${page.id}`,
                type: SearchResultType.Page,
                title,
                description: `Page${page.icon ? ` ${page.icon}` : ''}`,
                modulePath: `/pages/${page.id}`,
                icon: 'Layout',
                matchScore: m.score,
                timestamp: page.updatedAt || page.createdAt,
                matchedIndices: m.indices,
              })
            }
          }
        }

        // Search issues
        if (!activeModules || activeModules.has(SearchResultType.Issue)) {
          const projectState = useProjectStore.getState()
          const issues = Object.values(projectState.issues)
          const projects = projectState.projects
          let count = 0
          for (const issue of issues) {
            if (count >= MAX_PER_CATEGORY) break
            const m = bestMatch(query, issue.title, issue.description ?? '', issue.identifier)
            if (m) {
              count++
              const project = projects[issue.projectId]
              results.push({
                id: `issue-${issue.id}`,
                type: SearchResultType.Issue,
                title: `${issue.identifier} ${issue.title}`,
                description: `${project?.name ?? 'Project'} - ${issue.status}`,
                modulePath: `/projects/${issue.projectId}`,
                icon: 'CircleDot',
                matchScore: m.score,
                timestamp: issue.updatedAt || issue.createdAt,
                matchedIndices: m.indices,
              })
            }
          }
        }

        // Search events
        if (!activeModules || activeModules.has(SearchResultType.Event)) {
          const bookings = useSchedulingStore.getState().bookings
          let count = 0
          for (const booking of bookings) {
            if (count >= MAX_PER_CATEGORY) break
            const title = booking.attendees[0]?.name ?? 'Booking'
            const m = bestMatch(query, title)
            if (m) {
              count++
              results.push({
                id: `event-${booking.id}`,
                type: SearchResultType.Event,
                title,
                description: `${booking.status} - ${booking.date}`,
                modulePath: '/calendar/bookings',
                icon: 'Calendar',
                matchScore: m.score,
                timestamp: booking.date,
                matchedIndices: m.indices,
              })
            }
          }
        }

        // Search databases
        if (!activeModules || activeModules.has(SearchResultType.Database)) {
          const databases = Object.values(useDatabaseStore.getState().databases)
          let count = 0
          for (const db of databases) {
            if (count >= MAX_PER_CATEGORY) break
            const m = bestMatch(query, db.name)
            if (m) {
              count++
              results.push({
                id: `db-${db.id}`,
                type: SearchResultType.Database,
                title: db.name,
                description: `Database - ${db.tables.length} table${db.tables.length !== 1 ? 's' : ''}`,
                modulePath: `/data/${db.id}`,
                icon: 'Database',
                matchScore: m.score,
                timestamp: db.createdAt ?? '',
                matchedIndices: m.indices,
              })
            }
          }
        }

        // Search contacts
        if (!activeModules || activeModules.has(SearchResultType.Contact)) {
          const contacts = useContactStore.getState().contacts
          let count = 0
          for (const contact of contacts) {
            if (count >= MAX_PER_CATEGORY) break
            const m = bestMatch(query, contact.name, contact.email, contact.company ?? '')
            if (m) {
              count++
              results.push({
                id: `contact-${contact.id}`,
                type: SearchResultType.Contact,
                title: contact.name,
                description: contact.email,
                modulePath: '/accounting/contacts',
                icon: 'User',
                matchScore: m.score,
                timestamp: contact.createdAt,
                matchedIndices: m.indices,
              })
            }
          }
        }

        // Search invoices
        if (!activeModules || activeModules.has(SearchResultType.Invoice)) {
          const invoices = useInvoiceStore.getState().invoices
          let count = 0
          for (const inv of invoices) {
            if (count >= MAX_PER_CATEGORY) break
            const m = bestMatch(query, inv.customerName, inv.invoiceNumber)
            if (m) {
              count++
              results.push({
                id: `inv-${inv.id}`,
                type: SearchResultType.Invoice,
                title: `${inv.invoiceNumber} - ${inv.customerName}`,
                description: `${inv.status} - $${inv.total.toLocaleString()}`,
                modulePath: '/accounting/invoices',
                icon: 'Receipt',
                matchScore: m.score,
                timestamp: inv.createdAt,
                matchedIndices: m.indices,
              })
            }
          }
        }

        // Search agents
        if (!activeModules || activeModules.has(SearchResultType.Agent)) {
          const runs = useAIAgentStore.getState().runs
          let count = 0
          for (const run of runs) {
            if (count >= MAX_PER_CATEGORY) break
            const m = bestMatch(query, run.task, run.agentType)
            if (m) {
              count++
              results.push({
                id: `agent-${run.id}`,
                type: SearchResultType.Agent,
                title: run.task,
                description: `${run.agentType} agent - ${run.status}`,
                modulePath: '/copilot/agents',
                icon: 'Bot',
                matchScore: m.score,
                timestamp: run.startedAt,
                matchedIndices: m.indices,
              })
            }
          }
        }

        // Search tax deadlines
        if (!activeModules || activeModules.has(SearchResultType.Tax)) {
          const deadlines = useTaxStore.getState().deadlines
          let count = 0
          for (const deadline of deadlines) {
            if (count >= MAX_PER_CATEGORY) break
            const m = bestMatch(query, deadline.title)
            if (m) {
              count++
              results.push({
                id: `tax-${deadline.id}`,
                type: SearchResultType.Tax,
                title: deadline.title,
                description: `${deadline.completed ? 'Completed' : 'Pending'} - Due ${deadline.date}`,
                modulePath: '/tax',
                icon: 'FileSpreadsheet',
                matchScore: m.score,
                timestamp: deadline.date,
                matchedIndices: m.indices,
              })
            }
          }
        }

        // Search inbox notifications
        if (!activeModules || activeModules.has(SearchResultType.Setting)) {
          const notifications = useInboxStore.getState().notifications
          let count = 0
          for (const notif of notifications) {
            if (count >= MAX_PER_CATEGORY) break
            const m = bestMatch(query, notif.title, notif.message)
            if (m) {
              count++
              results.push({
                id: `notif-${notif.id}`,
                type: SearchResultType.Setting,
                title: notif.title,
                description: notif.message,
                modulePath: '/inbox',
                icon: 'Settings',
                matchScore: m.score,
                timestamp: notif.createdAt,
                matchedIndices: m.indices,
              })
            }
          }
        }

        // Sort by matchScore descending
        results.sort((a, b) => b.matchScore - a.matchScore)

        set({ results, isSearching: false })
      },

      clearResults: () => set({ results: [], query: '' }),

      addRecentSearch: (query: string) => {
        set((state) => {
          const filtered = state.recentSearches.filter((s) => s !== query)
          return { recentSearches: [query, ...filtered].slice(0, MAX_RECENT) }
        })
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      setFilters: (partial) => {
        set((state) => ({
          filters: { ...state.filters, ...partial },
        }))
      },
    }),
    {
      name: 'orchestree-search-storage',
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
)
