import { describe, it, expect, beforeEach } from 'vitest'
import { useSkillStore } from './useSkillStore'
import type { Skill } from '../types'

const SAMPLE_SKILLS: Skill[] = [
  {
    id: 'skill-1',
    name: 'Smart Reply',
    description: 'AI-powered replies',
    category: 'communication',
    version: '2.1.0',
    author: 'OriginA',
    installed: true,
    enabled: true,
    config: { tone: 'professional' },
    icon: 'message-square',
    triggers: [{ type: 'keyword', pattern: 'reply' }],
    actions: [{ id: 'sr-1', name: 'Reply', description: 'Auto reply', handler: 'smartReply' }],
  },
  {
    id: 'skill-2',
    name: 'Sentiment Analysis',
    description: 'Detect sentiment in data messages',
    category: 'data',
    version: '1.4.0',
    author: 'OriginA',
    installed: true,
    enabled: false,
    config: {},
    icon: 'activity',
    triggers: [],
    actions: [],
  },
  {
    id: 'skill-3',
    name: 'Calendar Sync',
    description: 'Book meetings from conversations',
    category: 'productivity',
    version: '1.1.0',
    author: 'OriginA',
    installed: false,
    enabled: false,
    config: {},
    icon: 'calendar',
    triggers: [],
    actions: [],
  },
  {
    id: 'skill-4',
    name: 'Report Generator',
    description: 'Creates data reports from database queries',
    category: 'data',
    version: '2.0.0',
    author: 'OriginA',
    installed: false,
    enabled: false,
    config: {},
    icon: 'bar-chart-2',
    triggers: [],
    actions: [],
  },
]

describe('useSkillStore', () => {
  beforeEach(() => {
    useSkillStore.setState({
      skills: SAMPLE_SKILLS.map((s) => ({ ...s, config: { ...s.config }, triggers: [...s.triggers], actions: [...s.actions] })),
      searchQuery: '',
    })
  })

  it('initializes with skills', () => {
    const state = useSkillStore.getState()
    expect(state.skills).toHaveLength(4)
    expect(state.searchQuery).toBe('')
  })

  describe('installSkill', () => {
    it('sets installed to true', () => {
      useSkillStore.getState().installSkill('skill-3')
      const skill = useSkillStore.getState().skills.find((s) => s.id === 'skill-3')
      expect(skill!.installed).toBe(true)
    })

    it('does not affect already installed skills', () => {
      useSkillStore.getState().installSkill('skill-1')
      const skill = useSkillStore.getState().skills.find((s) => s.id === 'skill-1')
      expect(skill!.installed).toBe(true)
      expect(skill!.enabled).toBe(true)
    })
  })

  describe('uninstallSkill', () => {
    it('sets installed to false and disables the skill', () => {
      useSkillStore.getState().uninstallSkill('skill-1')
      const skill = useSkillStore.getState().skills.find((s) => s.id === 'skill-1')
      expect(skill!.installed).toBe(false)
      expect(skill!.enabled).toBe(false)
    })
  })

  describe('enableSkill', () => {
    it('enables an installed skill', () => {
      useSkillStore.getState().enableSkill('skill-2')
      const skill = useSkillStore.getState().skills.find((s) => s.id === 'skill-2')
      expect(skill!.enabled).toBe(true)
    })

    it('does not enable an uninstalled skill', () => {
      useSkillStore.getState().enableSkill('skill-3')
      const skill = useSkillStore.getState().skills.find((s) => s.id === 'skill-3')
      expect(skill!.enabled).toBe(false)
    })
  })

  describe('disableSkill', () => {
    it('disables a skill', () => {
      useSkillStore.getState().disableSkill('skill-1')
      const skill = useSkillStore.getState().skills.find((s) => s.id === 'skill-1')
      expect(skill!.enabled).toBe(false)
    })
  })

  describe('configureSkill', () => {
    it('merges config into the skill', () => {
      useSkillStore.getState().configureSkill('skill-1', { tone: 'casual', maxLength: 200 })
      const skill = useSkillStore.getState().skills.find((s) => s.id === 'skill-1')
      expect(skill!.config.tone).toBe('casual')
      expect(skill!.config.maxLength).toBe(200)
    })
  })

  describe('setSearchQuery', () => {
    it('updates the search query', () => {
      useSkillStore.getState().setSearchQuery('calendar')
      expect(useSkillStore.getState().searchQuery).toBe('calendar')
    })
  })

  describe('searchSkills', () => {
    it('finds skills by name', () => {
      const results = useSkillStore.getState().searchSkills('smart')
      expect(results).toHaveLength(1)
      expect(results[0]!.name).toBe('Smart Reply')
    })

    it('finds skills by description', () => {
      const results = useSkillStore.getState().searchSkills('database')
      expect(results).toHaveLength(1)
      expect(results[0]!.id).toBe('skill-4')
    })

    it('finds skills by category', () => {
      const results = useSkillStore.getState().searchSkills('data')
      expect(results).toHaveLength(2)
    })

    it('is case insensitive', () => {
      const results = useSkillStore.getState().searchSkills('SENTIMENT')
      expect(results).toHaveLength(1)
    })

    it('returns empty for no matches', () => {
      const results = useSkillStore.getState().searchSkills('nonexistent')
      expect(results).toHaveLength(0)
    })
  })

  describe('getInstalledSkills', () => {
    it('returns only installed skills', () => {
      const installed = useSkillStore.getState().getInstalledSkills()
      expect(installed).toHaveLength(2)
      expect(installed.every((s) => s.installed)).toBe(true)
    })
  })

  describe('getSkillsByCategory', () => {
    it('returns skills in the given category', () => {
      const dataSkills = useSkillStore.getState().getSkillsByCategory('data')
      expect(dataSkills).toHaveLength(2)
    })

    it('returns empty for a category with no skills', () => {
      const customSkills = useSkillStore.getState().getSkillsByCategory('custom')
      expect(customSkills).toHaveLength(0)
    })
  })
})
