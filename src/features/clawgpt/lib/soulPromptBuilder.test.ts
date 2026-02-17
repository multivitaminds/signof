import { describe, it, expect } from 'vitest'
import { buildSoulPrompt } from './soulPromptBuilder'
import { DEFAULT_SOUL } from '../data/defaultSoul'
import type { SoulConfig } from '../types'
import { ResponseStyle } from '../types'

describe('buildSoulPrompt', () => {
  it('produces a prompt from the default soul config', () => {
    const prompt = buildSoulPrompt(DEFAULT_SOUL)

    expect(prompt).toContain(DEFAULT_SOUL.systemPrompt)
    expect(prompt).toContain('Rules:')
    expect(prompt).toContain('Context:')
    expect(prompt).toContain('Response style: professional')
    expect(prompt).toContain('Language: en')
    expect(prompt).toContain('Timezone: UTC')
  })

  it('includes all rules numbered sequentially', () => {
    const prompt = buildSoulPrompt(DEFAULT_SOUL)

    DEFAULT_SOUL.rules.forEach((rule, i) => {
      expect(prompt).toContain(`${i + 1}. ${rule}`)
    })
  })

  it('includes all context entries as bullet points', () => {
    const prompt = buildSoulPrompt(DEFAULT_SOUL)

    DEFAULT_SOUL.context.forEach(ctx => {
      expect(prompt).toContain(`- ${ctx}`)
    })
  })

  it('handles empty rules gracefully', () => {
    const config: SoulConfig = {
      ...DEFAULT_SOUL,
      rules: [],
    }

    const prompt = buildSoulPrompt(config)

    expect(prompt).not.toContain('Rules:')
    expect(prompt).toContain(config.systemPrompt)
    expect(prompt).toContain('Context:')
  })

  it('handles empty context gracefully', () => {
    const config: SoulConfig = {
      ...DEFAULT_SOUL,
      context: [],
    }

    const prompt = buildSoulPrompt(config)

    expect(prompt).not.toContain('Context:')
    expect(prompt).toContain(config.systemPrompt)
    expect(prompt).toContain('Rules:')
  })

  it('handles both empty rules and context', () => {
    const config: SoulConfig = {
      ...DEFAULT_SOUL,
      rules: [],
      context: [],
    }

    const prompt = buildSoulPrompt(config)

    expect(prompt).not.toContain('Rules:')
    expect(prompt).not.toContain('Context:')
    expect(prompt).toContain(config.systemPrompt)
    expect(prompt).toContain('Response style:')
  })

  it('handles empty system prompt', () => {
    const config: SoulConfig = {
      ...DEFAULT_SOUL,
      systemPrompt: '',
    }

    const prompt = buildSoulPrompt(config)

    expect(prompt).toContain('Rules:')
    expect(prompt).toContain('Context:')
    expect(prompt).not.toMatch(/^\s*$/)
  })

  it('includes the correct response style', () => {
    const config: SoulConfig = {
      ...DEFAULT_SOUL,
      responseStyle: ResponseStyle.Technical,
    }

    const prompt = buildSoulPrompt(config)
    expect(prompt).toContain('Response style: technical')
  })

  it('includes custom language and timezone', () => {
    const config: SoulConfig = {
      ...DEFAULT_SOUL,
      language: 'es',
      timezone: 'America/New_York',
    }

    const prompt = buildSoulPrompt(config)
    expect(prompt).toContain('Language: es')
    expect(prompt).toContain('Timezone: America/New_York')
  })

  it('separates sections with double newlines', () => {
    const prompt = buildSoulPrompt(DEFAULT_SOUL)
    const sections = prompt.split('\n\n')

    // systemPrompt, Rules, Context, Response style, Language, Timezone
    expect(sections.length).toBeGreaterThanOrEqual(6)
  })
})
