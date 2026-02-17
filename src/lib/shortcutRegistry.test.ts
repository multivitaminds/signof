import {
  registerShortcut,
  unregisterShortcut,
  getAllShortcuts,
  getShortcutsByCategory,
  getShortcutsByModule,
  clearRegistry,
  ShortcutCategory,
} from './shortcutRegistry'
import type { RegisteredShortcut } from './shortcutRegistry'

function makeShortcut(overrides: Partial<RegisteredShortcut> = {}): RegisteredShortcut {
  return {
    id: 'test-shortcut',
    keys: 'mod+k',
    label: 'Search',
    description: 'Open search',
    category: ShortcutCategory.Navigation,
    handler: () => {},
    scope: 'global',
    ...overrides,
  }
}

describe('shortcutRegistry', () => {
  beforeEach(() => {
    clearRegistry()
  })

  it('registers and retrieves a shortcut', () => {
    const shortcut = makeShortcut()
    registerShortcut(shortcut)

    const all = getAllShortcuts()
    expect(all).toHaveLength(1)
    expect(all[0]?.id).toBe('test-shortcut')
  })

  it('unregisters a shortcut by id', () => {
    registerShortcut(makeShortcut({ id: 'a' }))
    registerShortcut(makeShortcut({ id: 'b' }))
    expect(getAllShortcuts()).toHaveLength(2)

    unregisterShortcut('a')
    expect(getAllShortcuts()).toHaveLength(1)
    expect(getAllShortcuts()[0]?.id).toBe('b')
  })

  it('unregister for nonexistent id is a no-op', () => {
    registerShortcut(makeShortcut({ id: 'a' }))
    unregisterShortcut('nonexistent')
    expect(getAllShortcuts()).toHaveLength(1)
  })

  it('groups shortcuts by category', () => {
    registerShortcut(makeShortcut({ id: 'nav1', category: ShortcutCategory.Navigation }))
    registerShortcut(makeShortcut({ id: 'nav2', category: ShortcutCategory.Navigation }))
    registerShortcut(makeShortcut({ id: 'act1', category: ShortcutCategory.Actions }))
    registerShortcut(makeShortcut({ id: 'cre1', category: ShortcutCategory.Creation }))

    const groups = getShortcutsByCategory()
    expect(groups.get(ShortcutCategory.Navigation)).toHaveLength(2)
    expect(groups.get(ShortcutCategory.Actions)).toHaveLength(1)
    expect(groups.get(ShortcutCategory.Creation)).toHaveLength(1)
    expect(groups.get(ShortcutCategory.View)).toBeUndefined()
  })

  it('filters shortcuts by module id', () => {
    registerShortcut(makeShortcut({ id: 'global1', scope: 'global' }))
    registerShortcut(makeShortcut({ id: 'mod-proj', scope: 'module', moduleId: 'projects' }))
    registerShortcut(makeShortcut({ id: 'mod-doc', scope: 'module', moduleId: 'documents' }))

    const projShortcuts = getShortcutsByModule('projects')
    expect(projShortcuts).toHaveLength(1)
    expect(projShortcuts[0]?.id).toBe('mod-proj')

    const globalShortcuts = getShortcutsByModule('global')
    expect(globalShortcuts).toHaveLength(0)
  })

  it('clearRegistry empties the store', () => {
    registerShortcut(makeShortcut({ id: 'a' }))
    registerShortcut(makeShortcut({ id: 'b' }))
    clearRegistry()
    expect(getAllShortcuts()).toHaveLength(0)
  })

  it('overwrites shortcut with same id on re-register', () => {
    registerShortcut(makeShortcut({ id: 'a', label: 'First' }))
    registerShortcut(makeShortcut({ id: 'a', label: 'Second' }))
    expect(getAllShortcuts()).toHaveLength(1)
    expect(getAllShortcuts()[0]?.label).toBe('Second')
  })
})
