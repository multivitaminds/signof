import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  registerAction,
  unregisterAction,
  getAllActions,
  searchActions,
  clearActions,
} from './quickActions'
import type { QuickAction } from './quickActions'

function makeAction(overrides: Partial<QuickAction> = {}): QuickAction {
  return {
    id: 'test-action',
    label: 'Test Action',
    description: 'A test action',
    icon: 'home',
    module: 'App',
    keywords: ['test'],
    handler: vi.fn(),
    ...overrides,
  }
}

describe('quickActions', () => {
  beforeEach(() => {
    clearActions()
  })

  describe('registerAction', () => {
    it('adds an action to the registry', () => {
      registerAction(makeAction({ id: 'a1', label: 'Action One' }))
      const all = getAllActions()
      expect(all).toHaveLength(1)
      expect(all[0]!.id).toBe('a1')
    })

    it('overwrites an existing action with the same id', () => {
      registerAction(makeAction({ id: 'a1', label: 'Version 1' }))
      registerAction(makeAction({ id: 'a1', label: 'Version 2' }))
      const all = getAllActions()
      expect(all).toHaveLength(1)
      expect(all[0]!.label).toBe('Version 2')
    })
  })

  describe('unregisterAction', () => {
    it('removes an action from the registry', () => {
      registerAction(makeAction({ id: 'a1' }))
      registerAction(makeAction({ id: 'a2', label: 'Second' }))
      unregisterAction('a1')
      const all = getAllActions()
      expect(all).toHaveLength(1)
      expect(all[0]!.id).toBe('a2')
    })

    it('does nothing for non-existent id', () => {
      registerAction(makeAction({ id: 'a1' }))
      unregisterAction('nonexistent')
      expect(getAllActions()).toHaveLength(1)
    })
  })

  describe('getAllActions', () => {
    it('returns empty array when no actions registered', () => {
      expect(getAllActions()).toEqual([])
    })

    it('returns all registered actions', () => {
      registerAction(makeAction({ id: 'a1' }))
      registerAction(makeAction({ id: 'a2' }))
      registerAction(makeAction({ id: 'a3' }))
      expect(getAllActions()).toHaveLength(3)
    })
  })

  describe('searchActions', () => {
    beforeEach(() => {
      registerAction(makeAction({ id: 'go-home', label: 'Go to Home', keywords: ['dashboard', 'main'], module: 'Navigation' }))
      registerAction(makeAction({ id: 'new-doc', label: 'New Document', keywords: ['upload', 'create'], module: 'Documents' }))
      registerAction(makeAction({ id: 'toggle-dark', label: 'Toggle Dark Mode', keywords: ['theme', 'light'], module: 'App' }))
      registerAction(makeAction({ id: 'open-settings', label: 'Open Settings', keywords: ['preferences'], module: 'App' }))
    })

    it('returns all actions when query is empty', () => {
      expect(searchActions('')).toHaveLength(4)
    })

    it('matches by label', () => {
      const results = searchActions('home')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.id).toBe('go-home')
    })

    it('matches by keyword', () => {
      const results = searchActions('dashboard')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.id).toBe('go-home')
    })

    it('matches by module name', () => {
      const results = searchActions('navigation')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.id).toBe('go-home')
    })

    it('matches by description', () => {
      registerAction(makeAction({ id: 'special', label: 'XYZ', description: 'unique description', keywords: [] }))
      const results = searchActions('unique')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.id).toBe('special')
    })

    it('returns results sorted by score', () => {
      const results = searchActions('doc')
      // "New Document" should score highest for "doc"
      expect(results[0]!.id).toBe('new-doc')
    })

    it('returns empty for non-matching query', () => {
      const results = searchActions('zzzznothing')
      expect(results).toHaveLength(0)
    })
  })

  describe('clearActions', () => {
    it('removes all actions', () => {
      registerAction(makeAction({ id: 'a1' }))
      registerAction(makeAction({ id: 'a2' }))
      clearActions()
      expect(getAllActions()).toHaveLength(0)
    })
  })
})
