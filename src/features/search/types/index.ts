// ─── Search Result Type ─────────────────────────────────────────────

export const SearchResultType = {
  Page: 'page',
  Issue: 'issue',
  Document: 'document',
  Booking: 'booking',
  Database: 'database',
  TaxDocument: 'tax_document',
  Invoice: 'invoice',
  AgentRun: 'agent_run',
} as const

export type SearchResultType = (typeof SearchResultType)[keyof typeof SearchResultType]

// ─── Search Result ──────────────────────────────────────────────────

export interface SearchResult {
  id: string
  title: string
  description: string
  type: SearchResultType
  path: string
  icon: string
  score: number
}
