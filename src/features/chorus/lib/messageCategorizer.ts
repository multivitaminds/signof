// ─── Message Categorizer ────────────────────────────────────────────
// Auto-labels messages as Question/Decision/ActionItem/FYI/Blocker via regex

export const MessageCategory = {
  Question: 'question',
  Decision: 'decision',
  ActionItem: 'action_item',
  FYI: 'fyi',
  Blocker: 'blocker',
} as const

export type MessageCategory = (typeof MessageCategory)[keyof typeof MessageCategory]

export const CATEGORY_LABELS: Record<MessageCategory, string> = {
  [MessageCategory.Question]: 'Question',
  [MessageCategory.Decision]: 'Decision',
  [MessageCategory.ActionItem]: 'Action Item',
  [MessageCategory.FYI]: 'FYI',
  [MessageCategory.Blocker]: 'Blocker',
}

export const CATEGORY_COLORS: Record<MessageCategory, string> = {
  [MessageCategory.Question]: '#8B5CF6',
  [MessageCategory.Decision]: '#059669',
  [MessageCategory.ActionItem]: '#D97706',
  [MessageCategory.FYI]: '#6366F1',
  [MessageCategory.Blocker]: '#DC2626',
}

const CATEGORY_PATTERNS: [MessageCategory, RegExp][] = [
  [MessageCategory.Blocker, /\b(blocked|blocker|blocking|stuck|can'?t proceed|impediment)\b/i],
  [MessageCategory.Decision, /\b(decided|decision|agreed|let'?s go with|we'?ll use|approved|confirmed)\b/i],
  [MessageCategory.ActionItem, /\b(todo|to-do|action item|follow[- ]?up|need[s]? to|should|must|assigned to|take care of|please \w+)\b/i],
  [MessageCategory.Question, /\?$|\b(anyone know|does anyone|can someone|how do|what is|when is|where is|who is|why is|could you|would you)\b/i],
  [MessageCategory.FYI, /\b(fyi|for your info|heads[- ]?up|just so you know|letting you know|update:|note:|announcement)\b/i],
]

export function categorizeMessage(content: string): MessageCategory | null {
  const trimmed = content.trim()
  if (!trimmed) return null

  for (const [category, pattern] of CATEGORY_PATTERNS) {
    if (pattern.test(trimmed)) {
      return category
    }
  }

  return null
}
