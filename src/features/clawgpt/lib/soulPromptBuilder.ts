import type { SoulConfig } from '../types'

/**
 * Build a complete system prompt from a SoulConfig.
 * Combines the system prompt, formatted rules, and context blocks
 * into a single string suitable for use as an LLM system prompt.
 */
export function buildSoulPrompt(config: SoulConfig): string {
  const sections: string[] = []

  // System prompt section
  if (config.systemPrompt) {
    sections.push(config.systemPrompt)
  }

  // Rules section
  if (config.rules.length > 0) {
    const formattedRules = config.rules
      .map((rule, i) => `${i + 1}. ${rule}`)
      .join('\n')
    sections.push(`Rules:\n${formattedRules}`)
  }

  // Context section
  if (config.context.length > 0) {
    const formattedContext = config.context
      .map(ctx => `- ${ctx}`)
      .join('\n')
    sections.push(`Context:\n${formattedContext}`)
  }

  // Response style directive
  sections.push(`Response style: ${config.responseStyle}`)

  // Language and timezone
  sections.push(`Language: ${config.language}`)
  sections.push(`Timezone: ${config.timezone}`)

  return sections.join('\n\n')
}
