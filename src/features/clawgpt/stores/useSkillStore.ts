import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Skill } from '../types'
import { SkillCategory } from '../types'
import type { SkillCategory as SkillCategoryT } from '../types'

const BUILTIN_SKILLS: Skill[] = [
  {
    id: 'skill-smart-reply',
    name: 'Smart Reply',
    description: 'AI-powered context-aware message replies across all channels',
    category: SkillCategory.Communication,
    version: '2.1.0',
    author: 'Orchestree',
    installed: true,
    enabled: true,
    config: { tone: 'professional', maxLength: 500 },
    icon: 'message-square',
    triggers: [{ type: 'keyword', pattern: 'reply' }],
    actions: [{ id: 'smart-reply-action', name: 'Generate Reply', description: 'Generate a context-aware reply', handler: 'smartReply' }],
  },
  {
    id: 'skill-sentiment',
    name: 'Sentiment Analysis',
    description: 'Real-time sentiment detection and escalation triggers',
    category: SkillCategory.Data,
    version: '1.4.0',
    author: 'Orchestree',
    installed: true,
    enabled: true,
    config: { threshold: 0.3, alertOnNegative: true },
    icon: 'activity',
    triggers: [{ type: 'event', pattern: 'message.received' }],
    actions: [{ id: 'sentiment-action', name: 'Analyze Sentiment', description: 'Detect sentiment in messages', handler: 'analyzeSentiment' }],
  },
  {
    id: 'skill-auto-ticket',
    name: 'Auto-Ticket Creator',
    description: 'Automatically creates support tickets from conversations',
    category: SkillCategory.Productivity,
    version: '1.2.0',
    author: 'Orchestree',
    installed: true,
    enabled: false,
    config: { projectId: null, assignTo: null },
    icon: 'clipboard',
    triggers: [{ type: 'keyword', pattern: 'ticket' }],
    actions: [{ id: 'ticket-action', name: 'Create Ticket', description: 'Create a support ticket', handler: 'createTicket' }],
  },
  {
    id: 'skill-knowledge-base',
    name: 'Knowledge Base Search',
    description: 'Searches workspace pages and docs for relevant answers',
    category: SkillCategory.Data,
    version: '3.0.0',
    author: 'Orchestree',
    installed: true,
    enabled: true,
    config: { searchDepth: 3, includeArchived: false },
    icon: 'book-open',
    triggers: [{ type: 'keyword', pattern: 'search' }],
    actions: [{ id: 'kb-action', name: 'Search Knowledge Base', description: 'Search workspace knowledge', handler: 'searchKB' }],
  },
  {
    id: 'skill-email-draft',
    name: 'Email Composer',
    description: 'Drafts professional email responses with templates',
    category: SkillCategory.Creative,
    version: '1.8.0',
    author: 'Orchestree',
    installed: true,
    enabled: true,
    config: { defaultTemplate: 'professional', includeSignature: true },
    icon: 'edit-3',
    triggers: [{ type: 'keyword', pattern: 'email' }],
    actions: [{ id: 'email-action', name: 'Draft Email', description: 'Draft an email response', handler: 'draftEmail' }],
  },
  {
    id: 'skill-calendar-sync',
    name: 'Calendar Sync',
    description: 'Books meetings and checks availability from conversations',
    category: SkillCategory.Productivity,
    version: '1.1.0',
    author: 'Orchestree',
    installed: false,
    enabled: false,
    config: {},
    icon: 'calendar',
    triggers: [],
    actions: [],
  },
  {
    id: 'skill-data-report',
    name: 'Report Generator',
    description: 'Creates data-driven reports from database queries',
    category: SkillCategory.Data,
    version: '2.0.0',
    author: 'Orchestree',
    installed: false,
    enabled: false,
    config: {},
    icon: 'bar-chart-2',
    triggers: [],
    actions: [],
  },
  {
    id: 'skill-translation',
    name: 'Live Translator',
    description: 'Real-time message translation across 50+ languages',
    category: SkillCategory.Communication,
    version: '1.5.0',
    author: 'Orchestree',
    installed: false,
    enabled: false,
    config: {},
    icon: 'globe',
    triggers: [],
    actions: [],
  },
  {
    id: 'skill-task-assign',
    name: 'Task Assigner',
    description: 'Extracts action items from messages and creates tasks',
    category: SkillCategory.Productivity,
    version: '1.3.0',
    author: 'Orchestree',
    installed: false,
    enabled: false,
    config: {},
    icon: 'check-square',
    triggers: [],
    actions: [],
  },
  {
    id: 'skill-threat-detect',
    name: 'Threat Detection',
    description: 'Detects phishing, spam, and malicious content in messages',
    category: SkillCategory.Developer,
    version: '1.0.0',
    author: 'Orchestree',
    installed: false,
    enabled: false,
    config: {},
    icon: 'shield',
    triggers: [],
    actions: [],
  },
]

interface SkillState {
  skills: Skill[]
  searchQuery: string

  installSkill: (id: string) => void
  uninstallSkill: (id: string) => void
  enableSkill: (id: string) => void
  disableSkill: (id: string) => void
  configureSkill: (id: string, config: Record<string, unknown>) => void
  setSearchQuery: (query: string) => void
  searchSkills: (query: string) => Skill[]
  getInstalledSkills: () => Skill[]
  getSkillsByCategory: (category: SkillCategoryT) => Skill[]
  getEnabledSkills: () => Skill[]
}

export const useSkillStore = create<SkillState>()(
  persist(
    (_set, get) => ({
      skills: BUILTIN_SKILLS,
      searchQuery: '',

      installSkill: (id) => {
        _set((s) => ({
          skills: s.skills.map((sk) =>
            sk.id === id ? { ...sk, installed: true } : sk
          ),
        }))
      },

      uninstallSkill: (id) => {
        _set((s) => ({
          skills: s.skills.map((sk) =>
            sk.id === id ? { ...sk, installed: false, enabled: false } : sk
          ),
        }))
      },

      enableSkill: (id) => {
        _set((s) => ({
          skills: s.skills.map((sk) =>
            sk.id === id && sk.installed ? { ...sk, enabled: true } : sk
          ),
        }))
      },

      disableSkill: (id) => {
        _set((s) => ({
          skills: s.skills.map((sk) =>
            sk.id === id ? { ...sk, enabled: false } : sk
          ),
        }))
      },

      configureSkill: (id, config) => {
        _set((s) => ({
          skills: s.skills.map((sk) =>
            sk.id === id ? { ...sk, config: { ...sk.config, ...config } } : sk
          ),
        }))
      },

      setSearchQuery: (query) => {
        _set({ searchQuery: query })
      },

      searchSkills: (query) => {
        const lower = query.toLowerCase()
        return get().skills.filter(
          (sk) =>
            sk.name.toLowerCase().includes(lower) ||
            sk.description.toLowerCase().includes(lower) ||
            sk.category.toLowerCase().includes(lower)
        )
      },

      getInstalledSkills: () => {
        return get().skills.filter((sk) => sk.installed)
      },

      getSkillsByCategory: (category) => {
        return get().skills.filter((sk) => sk.category === category)
      },

      getEnabledSkills: () => {
        return get().skills.filter((sk) => sk.installed && sk.enabled)
      },
    }),
    { name: 'orchestree-skill-storage' }
  )
)
