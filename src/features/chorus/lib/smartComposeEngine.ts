// ─── Smart Compose Engine ──────────────────────────────────────────
// Provides AI-powered message suggestions as the user types

import { copilotChat } from '../../ai/lib/copilotLLM'

export interface SmartComposeContext {
  draft: string
  channelName?: string
  recentMessages?: string[]
  topic?: string
}

const COMMON_PATTERNS: [RegExp, string][] = [
  [/^thanks?\s*$/i, 'thanks for the update!'],
  [/^thank you\s*$/i, 'thank you for your help!'],
  [/^can we\s*$/i, 'can we schedule a time to discuss?'],
  [/^i think\s*$/i, 'I think we should move forward with this approach.'],
  [/^let me\s*$/i, 'let me look into this and get back to you.'],
  [/^sounds\s*$/i, 'sounds good, let me know if you need anything else.'],
  [/^i'?ll\s*$/i, "I'll take care of it."],
  [/^we should\s*$/i, 'we should discuss this in our next meeting.'],
  [/^please\s*$/i, 'please review and let me know your thoughts.'],
  [/^lgtm\s*$/i, 'LGTM! Ship it.'],
  [/^agreed\s*$/i, 'agreed, let\'s go with that plan.'],
  [/^good\s*$/i, 'good point, I\'ll update the approach.'],
]

export function generateLocalSuggestion(ctx: SmartComposeContext): string | null {
  const draft = ctx.draft.trim()
  if (draft.length < 3) return null

  for (const [pattern, suggestion] of COMMON_PATTERNS) {
    if (pattern.test(draft)) {
      return suggestion
    }
  }

  return null
}

export async function getSmartSuggestion(ctx: SmartComposeContext): Promise<string | null> {
  const draft = ctx.draft.trim()
  if (draft.length < 3) return null

  const contextParts: string[] = []
  if (ctx.channelName) contextParts.push(`Channel: #${ctx.channelName}`)
  if (ctx.topic) contextParts.push(`Topic: ${ctx.topic}`)
  if (ctx.recentMessages?.length) {
    contextParts.push(`Recent messages:\n${ctx.recentMessages.slice(-3).join('\n')}`)
  }

  const contextSummary = contextParts.join('\n')

  const result = await copilotChat(
    'Chorus',
    `Complete this message: "${draft}"`,
    contextSummary,
    () => generateLocalSuggestion(ctx) ?? '',
  )

  return result || null
}
