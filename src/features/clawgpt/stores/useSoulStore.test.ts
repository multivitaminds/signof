import { describe, it, expect, beforeEach } from 'vitest'
import { useSoulStore } from './useSoulStore'
import type { SoulConfig, SoulPreset } from '../types'

const DEFAULT_SOUL: SoulConfig = {
  name: 'Atlas',
  personality: 'Professional, helpful, and proactive assistant',
  responseStyle: 'professional',
  rules: [
    'Always be polite and professional',
    'Never share confidential information externally',
    'Escalate urgent issues to human agents immediately',
  ],
  context: [
    'Company: OriginA - unified work platform',
    'Workspace tools: Pages, Projects, Documents, Calendar, Databases',
  ],
  systemPrompt: 'You are Atlas, an AI assistant for the OriginA workspace platform. Help users with their work tasks efficiently and professionally.',
  language: 'English',
  timezone: 'UTC',
}

const PRESETS: SoulPreset[] = [
  { id: 'preset-professional', name: 'Professional', description: 'Formal style', config: { ...DEFAULT_SOUL } },
  {
    id: 'preset-casual',
    name: 'Casual',
    description: 'Relaxed style',
    config: {
      ...DEFAULT_SOUL,
      personality: 'Friendly and conversational',
      responseStyle: 'casual',
    },
  },
  {
    id: 'preset-developer',
    name: 'Developer',
    description: 'Technical style',
    config: {
      ...DEFAULT_SOUL,
      personality: 'Technical expert',
      responseStyle: 'technical',
    },
  },
]

describe('useSoulStore', () => {
  beforeEach(() => {
    useSoulStore.setState({
      soulConfig: { ...DEFAULT_SOUL, rules: [...DEFAULT_SOUL.rules], context: [...DEFAULT_SOUL.context] },
      presets: PRESETS.map((p) => ({ ...p, config: { ...p.config, rules: [...p.config.rules], context: [...p.config.context] } })),
      activePresetId: 'preset-professional',
    })
  })

  it('initializes with default soul config', () => {
    const state = useSoulStore.getState()
    expect(state.soulConfig.name).toBe('Atlas')
    expect(state.soulConfig.responseStyle).toBe('professional')
    expect(state.activePresetId).toBe('preset-professional')
  })

  describe('updateSoul', () => {
    it('updates soul config fields', () => {
      useSoulStore.getState().updateSoul({ name: 'Athena', language: 'Spanish' })
      const state = useSoulStore.getState()
      expect(state.soulConfig.name).toBe('Athena')
      expect(state.soulConfig.language).toBe('Spanish')
      expect(state.soulConfig.personality).toBe('Professional, helpful, and proactive assistant')
    })

    it('clears active preset on update', () => {
      useSoulStore.getState().updateSoul({ name: 'Custom' })
      expect(useSoulStore.getState().activePresetId).toBeNull()
    })
  })

  describe('resetToDefault', () => {
    it('resets soul config to default values', () => {
      useSoulStore.getState().updateSoul({ name: 'Changed', language: 'French' })
      useSoulStore.getState().resetToDefault()
      const state = useSoulStore.getState()
      expect(state.soulConfig.name).toBe('Atlas')
      expect(state.soulConfig.language).toBe('English')
      expect(state.activePresetId).toBe('preset-professional')
    })
  })

  describe('switchPreset', () => {
    it('applies preset config to soulConfig', () => {
      useSoulStore.getState().switchPreset('preset-casual')
      const state = useSoulStore.getState()
      expect(state.soulConfig.personality).toBe('Friendly and conversational')
      expect(state.soulConfig.responseStyle).toBe('casual')
      expect(state.activePresetId).toBe('preset-casual')
    })

    it('does nothing for unknown preset id', () => {
      useSoulStore.getState().switchPreset('nonexistent')
      expect(useSoulStore.getState().soulConfig.name).toBe('Atlas')
      expect(useSoulStore.getState().activePresetId).toBe('preset-professional')
    })
  })

  describe('addRule', () => {
    it('appends a rule and clears preset', () => {
      useSoulStore.getState().addRule('New rule')
      const state = useSoulStore.getState()
      expect(state.soulConfig.rules).toHaveLength(4)
      expect(state.soulConfig.rules[3]).toBe('New rule')
      expect(state.activePresetId).toBeNull()
    })
  })

  describe('removeRule', () => {
    it('removes a rule by index', () => {
      useSoulStore.getState().removeRule(0)
      const state = useSoulStore.getState()
      expect(state.soulConfig.rules).toHaveLength(2)
      expect(state.soulConfig.rules[0]).toBe('Never share confidential information externally')
    })

    it('clears active preset', () => {
      useSoulStore.getState().removeRule(0)
      expect(useSoulStore.getState().activePresetId).toBeNull()
    })
  })

  describe('addContext', () => {
    it('appends a context item', () => {
      useSoulStore.getState().addContext('New context')
      const state = useSoulStore.getState()
      expect(state.soulConfig.context).toHaveLength(3)
      expect(state.soulConfig.context[2]).toBe('New context')
    })
  })

  describe('removeContext', () => {
    it('removes a context item by index', () => {
      useSoulStore.getState().removeContext(0)
      const state = useSoulStore.getState()
      expect(state.soulConfig.context).toHaveLength(1)
      expect(state.soulConfig.context[0]).toBe('Workspace tools: Pages, Projects, Documents, Calendar, Databases')
    })
  })

  describe('exportSoul', () => {
    it('returns JSON string of soulConfig', () => {
      const json = useSoulStore.getState().exportSoul()
      const parsed = JSON.parse(json)
      expect(parsed.name).toBe('Atlas')
      expect(parsed.language).toBe('English')
      expect(parsed.rules).toHaveLength(3)
    })
  })

  describe('importSoul', () => {
    it('imports valid JSON and applies it', () => {
      const config: SoulConfig = {
        name: 'Imported Bot',
        personality: 'Custom personality',
        responseStyle: 'casual',
        rules: ['Rule 1'],
        context: [],
        systemPrompt: 'Custom prompt',
        language: 'English',
        timezone: 'UTC',
      }
      const result = useSoulStore.getState().importSoul(JSON.stringify(config))
      expect(result).toBe(true)
      expect(useSoulStore.getState().soulConfig.name).toBe('Imported Bot')
      expect(useSoulStore.getState().activePresetId).toBeNull()
    })

    it('returns false for invalid JSON', () => {
      const result = useSoulStore.getState().importSoul('not-json')
      expect(result).toBe(false)
      expect(useSoulStore.getState().soulConfig.name).toBe('Atlas')
    })

    it('returns false for JSON missing required fields', () => {
      const result = useSoulStore.getState().importSoul(JSON.stringify({ foo: 'bar' }))
      expect(result).toBe(false)
    })
  })
})
