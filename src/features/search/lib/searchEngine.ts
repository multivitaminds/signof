import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useWorkspaceStore } from '../../workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../projects/stores/useProjectStore'
import { useSchedulingStore } from '../../scheduling/stores/useSchedulingStore'
import { useDatabaseStore } from '../../databases/stores/useDatabaseStore'
import { SearchResultType, type SearchResult } from '../types'

// ─── Scoring ────────────────────────────────────────────────────────

/**
 * Score a query against a target string.
 *
 * Tiers (highest to lowest):
 *  1. Exact match (case-insensitive)        → 1000
 *  2. Starts with query                     →  500 + length bonus
 *  3. Contains query as substring           →  200 + position bonus
 *  4. Fuzzy: all query chars appear in order →  base per-char scoring
 *  5. No match                              →   -1
 */
function scoreMatch(query: string, target: string): number {
  const q = query.toLowerCase()
  const t = target.toLowerCase()

  if (q.length === 0) return 0

  // Tier 1: exact match
  if (t === q) {
    return 1000
  }

  // Tier 2: starts with
  if (t.startsWith(q)) {
    // Bonus for shorter targets (more relevant)
    return 500 + Math.max(0, 100 - target.length)
  }

  // Tier 3: contains as substring
  const substringIndex = t.indexOf(q)
  if (substringIndex >= 0) {
    // Earlier occurrence scores higher
    return 200 + Math.max(0, 50 - substringIndex)
  }

  // Tier 4: fuzzy match — all query characters appear in order
  let qi = 0
  let ti = 0
  let score = 0
  let consecutiveCount = 0
  let lastMatchIndex = -2

  while (qi < q.length && ti < t.length) {
    if (q[qi] === t[ti]) {
      // Base point per match
      score += 1

      // Consecutive bonus
      if (ti === lastMatchIndex + 1) {
        consecutiveCount++
        score += consecutiveCount * 2
      } else {
        consecutiveCount = 0
      }

      // Word boundary bonus
      if (ti === 0 || /[\s\-_./]/.test(target[ti - 1] ?? '')) {
        score += 5
      }

      lastMatchIndex = ti
      qi++
    }
    ti++
  }

  // All query chars must match
  if (qi !== q.length) {
    return -1
  }

  return score
}

/**
 * Score a query against multiple strings, returning the best score.
 */
function bestScore(query: string, ...targets: string[]): number {
  let best = -1
  for (const target of targets) {
    const s = scoreMatch(query, target)
    if (s > best) best = s
  }
  return best
}

// ─── Search Functions ───────────────────────────────────────────────

function searchPages(query: string): SearchResult[] {
  const { pages } = useWorkspaceStore.getState()
  const results: SearchResult[] = []

  for (const page of Object.values(pages)) {
    if (page.trashedAt) continue

    const title = page.title || 'Untitled'
    const score = bestScore(query, title)
    if (score < 0) continue

    results.push({
      id: page.id,
      title,
      description: `Page${page.icon ? ` ${page.icon}` : ''}`,
      type: SearchResultType.Page,
      path: `/pages/${page.id}`,
      icon: page.icon || '\uD83D\uDCC4',
      score,
    })
  }

  return results
}

function searchIssues(query: string): SearchResult[] {
  const { issues, projects } = useProjectStore.getState()
  const results: SearchResult[] = []

  for (const issue of Object.values(issues)) {
    const score = bestScore(query, issue.title, issue.identifier)
    if (score < 0) continue

    const project = projects[issue.projectId]
    const projectName = project?.name ?? 'Project'

    results.push({
      id: issue.id,
      title: `${issue.identifier} ${issue.title}`,
      description: `${projectName} \u00B7 ${issue.status}`,
      type: SearchResultType.Issue,
      path: `/projects/${issue.projectId}`,
      icon: '\uD83D\uDCCB',
      score,
    })
  }

  return results
}

function searchDocuments(query: string): SearchResult[] {
  const { documents } = useDocumentStore.getState()
  const results: SearchResult[] = []

  for (const doc of documents) {
    const score = bestScore(query, doc.name)
    if (score < 0) continue

    const signerCount = doc.signers.length
    results.push({
      id: doc.id,
      title: doc.name,
      description: `${doc.status} \u00B7 ${signerCount} signer${signerCount !== 1 ? 's' : ''}`,
      type: SearchResultType.Document,
      path: `/documents/${doc.id}`,
      icon: '\u270D\uFE0F',
      score,
    })
  }

  return results
}

function searchBookings(query: string): SearchResult[] {
  const { bookings, eventTypes } = useSchedulingStore.getState()
  const results: SearchResult[] = []

  // Search event types
  for (const et of eventTypes) {
    const score = bestScore(query, et.name, et.description)
    if (score < 0) continue

    results.push({
      id: et.id,
      title: et.name,
      description: `Event type \u00B7 ${et.durationMinutes}min`,
      type: SearchResultType.Booking,
      path: '/calendar/events',
      icon: '\uD83D\uDCC5',
      score,
    })
  }

  // Search bookings by attendee name
  for (const booking of bookings) {
    const eventType = eventTypes.find((et) => et.id === booking.eventTypeId)
    const attendeeNames = booking.attendees.map((a) => a.name).join(', ')
    const searchTarget = eventType ? `${eventType.name} ${attendeeNames}` : attendeeNames

    const score = bestScore(query, searchTarget, booking.notes)
    if (score < 0) continue

    results.push({
      id: booking.id,
      title: eventType?.name ?? 'Booking',
      description: `${booking.date} \u00B7 ${booking.startTime}\u2013${booking.endTime} \u00B7 ${attendeeNames}`,
      type: SearchResultType.Booking,
      path: '/calendar',
      icon: '\uD83D\uDCC6',
      score,
    })
  }

  return results
}

function searchDatabases(query: string): SearchResult[] {
  const { databases, tables } = useDatabaseStore.getState()
  const results: SearchResult[] = []

  for (const db of Object.values(databases)) {
    const score = bestScore(query, db.name, db.description)
    if (score < 0) continue

    const tableCount = db.tables.length
    results.push({
      id: db.id,
      title: db.name,
      description: `Database \u00B7 ${tableCount} table${tableCount !== 1 ? 's' : ''}`,
      type: SearchResultType.Database,
      path: `/data/${db.id}`,
      icon: db.icon || '\uD83D\uDDC3\uFE0F',
      score,
    })
  }

  // Also search table names
  for (const table of Object.values(tables)) {
    const score = bestScore(query, table.name)
    if (score < 0) continue

    // Find the parent database
    let parentDbId = ''
    for (const db of Object.values(databases)) {
      if (db.tables.includes(table.id)) {
        parentDbId = db.id
        break
      }
    }

    results.push({
      id: table.id,
      title: table.name,
      description: `Table \u00B7 ${table.rows.length} row${table.rows.length !== 1 ? 's' : ''}`,
      type: SearchResultType.Database,
      path: parentDbId ? `/data/${parentDbId}` : '/data',
      icon: table.icon || '\uD83D\uDCCB',
      score,
    })
  }

  return results
}

// ─── Main Export ────────────────────────────────────────────────────

/**
 * Search across all modules and return results sorted by relevance.
 */
export function searchAll(query: string): SearchResult[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  const results: SearchResult[] = [
    ...searchPages(trimmed),
    ...searchIssues(trimmed),
    ...searchDocuments(trimmed),
    ...searchBookings(trimmed),
    ...searchDatabases(trimmed),
  ]

  // Sort by score descending, then by title alphabetically for ties
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.title.localeCompare(b.title)
  })

  return results
}
