// Search result type — const object pattern (not TS enum)
export const SearchResultType = {
  Document: 'document',
  Page: 'page',
  Issue: 'issue',
  Event: 'event',
  Database: 'database',
  Contact: 'contact',
  Invoice: 'invoice',
  Agent: 'agent',
  Tax: 'tax',
  Setting: 'setting',
} as const

export type SearchResultType = (typeof SearchResultType)[keyof typeof SearchResultType]

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  description: string
  modulePath: string
  icon: string
  matchScore: number
  timestamp: string
  matchedIndices: number[]
}

export interface SearchFilter {
  modules: SearchResultType[]
  dateRange?: { from: string; to: string }
  query: string
}
