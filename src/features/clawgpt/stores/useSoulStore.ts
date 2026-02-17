import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SoulConfig, SoulPreset } from '../types'
import { ResponseStyle } from '../types'

const DEFAULT_SOUL: SoulConfig = {
  name: 'Atlas',
  personality: 'Professional, helpful, and proactive assistant',
  responseStyle: ResponseStyle.Professional,
  rules: [
    'Always be polite and professional',
    'Never share confidential information externally',
    'Escalate urgent issues to human agents immediately',
    'Provide sources when referencing workspace data',
    'Respect user privacy and data boundaries',
  ],
  context: [
    'Company: Orchestree - unified work platform',
    'Workspace tools: Pages, Projects, Documents, Calendar, Databases',
    'Support hours: Monday-Friday 9am-6pm EST',
  ],
  systemPrompt: 'You are Atlas, an AI assistant for the Orchestree workspace platform. Help users with their work tasks efficiently and professionally.',
  language: 'English',
  timezone: 'UTC',
}

const PRESETS: SoulPreset[] = [
  {
    id: 'preset-professional',
    name: 'Professional',
    description: 'Formal, business-focused communication style',
    config: {
      ...DEFAULT_SOUL,
      name: 'Atlas',
      personality: 'Professional, helpful, and proactive assistant',
      responseStyle: ResponseStyle.Professional,
    },
  },
  {
    id: 'preset-casual',
    name: 'Casual',
    description: 'Relaxed, friendly conversational tone',
    config: {
      ...DEFAULT_SOUL,
      name: 'Atlas',
      personality: 'Friendly, approachable, and conversational helper',
      responseStyle: ResponseStyle.Casual,
    },
  },
  {
    id: 'preset-developer',
    name: 'Developer',
    description: 'Technical, code-focused responses with examples',
    config: {
      ...DEFAULT_SOUL,
      name: 'Atlas',
      personality: 'Technical expert who provides code examples and detailed explanations',
      responseStyle: ResponseStyle.Technical,
      rules: [
        ...DEFAULT_SOUL.rules,
        'Always include code examples when relevant',
        'Suggest best practices and performance tips',
      ],
    },
  },
  {
    id: 'preset-support',
    name: 'Support Agent',
    description: 'Customer-facing support with empathy and solutions',
    config: {
      ...DEFAULT_SOUL,
      name: 'Atlas',
      personality: 'Empathetic support agent focused on resolving issues quickly',
      responseStyle: ResponseStyle.Friendly,
      rules: [
        ...DEFAULT_SOUL.rules,
        'Always acknowledge the customer\'s frustration',
        'Offer concrete next steps',
        'Follow up to ensure issue is resolved',
      ],
    },
  },
  {
    id: 'preset-executive',
    name: 'Executive Assistant',
    description: 'Concise, decision-oriented briefings',
    config: {
      ...DEFAULT_SOUL,
      name: 'Atlas',
      personality: 'Executive assistant providing concise briefings and actionable summaries',
      responseStyle: ResponseStyle.Concise,
      rules: [
        ...DEFAULT_SOUL.rules,
        'Keep responses concise - bullet points preferred',
        'Prioritize by urgency and impact',
        'Always include a recommended action',
      ],
    },
  },
]

interface SoulState {
  soulConfig: SoulConfig
  presets: SoulPreset[]
  activePresetId: string | null

  updateSoul: (partial: Partial<SoulConfig>) => void
  resetToDefault: () => void
  switchPreset: (id: string) => void
  addRule: (rule: string) => void
  removeRule: (index: number) => void
  addContext: (ctx: string) => void
  removeContext: (index: number) => void
  exportSoul: () => string
  importSoul: (json: string) => boolean
}

export const useSoulStore = create<SoulState>()(
  persist(
    (_set, get) => ({
      soulConfig: DEFAULT_SOUL,
      presets: PRESETS,
      activePresetId: 'preset-professional',

      updateSoul: (partial) => {
        _set((s) => ({
          soulConfig: { ...s.soulConfig, ...partial },
          activePresetId: null,
        }))
      },

      resetToDefault: () => {
        _set({
          soulConfig: DEFAULT_SOUL,
          activePresetId: 'preset-professional',
        })
      },

      switchPreset: (id) => {
        const preset = get().presets.find((p) => p.id === id)
        if (!preset) return
        _set({
          soulConfig: { ...preset.config },
          activePresetId: id,
        })
      },

      addRule: (rule) => {
        _set((s) => ({
          soulConfig: {
            ...s.soulConfig,
            rules: [...s.soulConfig.rules, rule],
          },
          activePresetId: null,
        }))
      },

      removeRule: (index) => {
        _set((s) => ({
          soulConfig: {
            ...s.soulConfig,
            rules: s.soulConfig.rules.filter((_, i) => i !== index),
          },
          activePresetId: null,
        }))
      },

      addContext: (ctx) => {
        _set((s) => ({
          soulConfig: {
            ...s.soulConfig,
            context: [...s.soulConfig.context, ctx],
          },
          activePresetId: null,
        }))
      },

      removeContext: (index) => {
        _set((s) => ({
          soulConfig: {
            ...s.soulConfig,
            context: s.soulConfig.context.filter((_, i) => i !== index),
          },
          activePresetId: null,
        }))
      },

      exportSoul: () => {
        return JSON.stringify(get().soulConfig)
      },

      importSoul: (json) => {
        try {
          const parsed = JSON.parse(json) as SoulConfig
          if (!parsed.name || !parsed.personality || !parsed.responseStyle) {
            return false
          }
          _set({
            soulConfig: parsed,
            activePresetId: null,
          })
          return true
        } catch {
          return false
        }
      },
    }),
    { name: 'orchestree-soul-storage' }
  )
)
