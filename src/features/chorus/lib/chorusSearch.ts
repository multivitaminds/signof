import type { ChorusMessage, ChorusSearchFilter, ChorusSearchResult } from '../types'

/**
 * Parse a search query string into structured filters.
 * Supports: from:username, in:channel, has:reaction|link|file, before:date, after:date
 * Remaining text becomes the free-text query.
 *
 * Example: "database optimization from:jordan in:engineering has:reaction"
 * → { query: "database optimization", filter: { from: "jordan", in: "engineering", has: "reaction" } }
 */
export function parseSearchQuery(raw: string): { query: string; filter: ChorusSearchFilter } {
  const filter: ChorusSearchFilter = {}
  let query = raw

  const patterns: Array<{ key: keyof ChorusSearchFilter; regex: RegExp }> = [
    { key: 'from', regex: /from:(\S+)/gi },
    { key: 'in', regex: /in:(\S+)/gi },
    { key: 'has', regex: /has:(\S+)/gi },
    { key: 'before', regex: /before:(\S+)/gi },
    { key: 'after', regex: /after:(\S+)/gi },
  ]

  for (const { key, regex } of patterns) {
    const match = regex.exec(query)
    if (match?.[1]) {
      filter[key] = match[1]
      query = query.replace(match[0], '')
    }
  }

  return { query: query.trim(), filter }
}

/**
 * Search messages across all conversations.
 *
 * @param messagesMap - Record of conversationId → messages
 * @param query - Free-text search term (case-insensitive substring match)
 * @param filter - Structured filters (from, in, has, before, after)
 * @param channelNames - Map of conversationId → display name
 */
export function searchMessages(
  messagesMap: Record<string, ChorusMessage[]>,
  query: string,
  filter: ChorusSearchFilter,
  channelNames: Record<string, string>,
): ChorusSearchResult[] {
  const results: ChorusSearchResult[] = []
  const lowerQuery = query.toLowerCase()

  for (const [conversationId, messages] of Object.entries(messagesMap)) {
    // Filter by channel
    if (filter.in) {
      const channelName = channelNames[conversationId] ?? ''
      if (!channelName.toLowerCase().includes(filter.in.toLowerCase())) {
        continue
      }
    }

    if (!messages) continue

    for (const msg of messages) {
      if (msg.isDeleted) continue

      // Free-text match
      if (lowerQuery && !msg.content.toLowerCase().includes(lowerQuery)) {
        continue
      }

      // Filter by sender
      if (filter.from) {
        const fromLower = filter.from.toLowerCase()
        if (
          !msg.senderName.toLowerCase().includes(fromLower) &&
          !msg.senderId.toLowerCase().includes(fromLower)
        ) {
          continue
        }
      }

      // Filter by has:
      if (filter.has) {
        const hasLower = filter.has.toLowerCase()
        if (hasLower === 'reaction' && msg.reactions.length === 0) continue
        if (hasLower === 'link' && !msg.content.includes('http')) continue
        if (hasLower === 'file' && msg.attachments.length === 0) continue
        if (hasLower === 'pin' && !msg.isPinned) continue
      }

      // Filter by date range
      if (filter.before) {
        const beforeDate = new Date(filter.before)
        if (!isNaN(beforeDate.getTime()) && new Date(msg.timestamp) >= beforeDate) {
          continue
        }
      }

      if (filter.after) {
        const afterDate = new Date(filter.after)
        if (!isNaN(afterDate.getTime()) && new Date(msg.timestamp) <= afterDate) {
          continue
        }
      }

      // Build highlights
      const highlights: string[] = []
      if (lowerQuery) {
        const idx = msg.content.toLowerCase().indexOf(lowerQuery)
        if (idx >= 0) {
          const start = Math.max(0, idx - 30)
          const end = Math.min(msg.content.length, idx + lowerQuery.length + 30)
          const prefix = start > 0 ? '...' : ''
          const suffix = end < msg.content.length ? '...' : ''
          highlights.push(`${prefix}${msg.content.slice(start, end)}${suffix}`)
        }
      }

      results.push({
        message: msg,
        channelName: channelNames[conversationId] ?? conversationId,
        highlights,
      })
    }
  }

  // Sort by timestamp (newest first)
  results.sort((a, b) =>
    new Date(b.message.timestamp).getTime() - new Date(a.message.timestamp).getTime()
  )

  return results
}
