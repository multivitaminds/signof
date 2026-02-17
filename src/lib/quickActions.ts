// ─── Quick Actions Registry ─────────────────────────────────
// Global singleton for action registration, discovery, and fuzzy search.

import { fuzzyMatch } from './fuzzyMatch'

export interface QuickAction {
  id: string
  label: string
  description?: string
  icon: string // lucide icon name
  shortcut?: string // e.g. 'mod+n'
  module: string // module name for grouping
  keywords: string[] // extra search terms
  handler: () => void
}

// ─── Internal store ──────────────────────────────────────────

const actions = new Map<string, QuickAction>()

// ─── Public API ──────────────────────────────────────────────

export function registerAction(action: QuickAction): void {
  actions.set(action.id, action)
}

export function unregisterAction(id: string): void {
  actions.delete(id)
}

export function getAllActions(): QuickAction[] {
  return Array.from(actions.values())
}

export function searchActions(query: string): QuickAction[] {
  if (!query) return getAllActions()

  const results: Array<{ action: QuickAction; score: number }> = []

  for (const action of actions.values()) {
    // Try fuzzy match on label
    const labelMatch = fuzzyMatch(query, action.label)
    let bestScore = labelMatch?.score ?? -1

    // Try fuzzy match on description
    if (action.description) {
      const descMatch = fuzzyMatch(query, action.description)
      if (descMatch && descMatch.score > bestScore) {
        bestScore = descMatch.score
      }
    }

    // Try fuzzy match on keywords
    for (const kw of action.keywords) {
      const kwMatch = fuzzyMatch(query, kw)
      if (kwMatch && kwMatch.score > bestScore) {
        bestScore = kwMatch.score
      }
    }

    // Try fuzzy match on module
    const modMatch = fuzzyMatch(query, action.module)
    if (modMatch && modMatch.score > bestScore) {
      bestScore = modMatch.score
    }

    if (bestScore > 0) {
      results.push({ action, score: bestScore })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.map((r) => r.action)
}

/** Reset registry -- useful for tests */
export function clearActions(): void {
  actions.clear()
}
