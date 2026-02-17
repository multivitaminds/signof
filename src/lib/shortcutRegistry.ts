// ─── Shortcut Registry ────────────────────────────────────────
// Global singleton for shortcut registration, discovery, and query.

export const ShortcutCategory = {
  Navigation: 'navigation',
  Creation: 'creation',
  Actions: 'actions',
  View: 'view',
} as const

export type ShortcutCategory = (typeof ShortcutCategory)[keyof typeof ShortcutCategory]

export interface RegisteredShortcut {
  id: string
  keys: string        // e.g. 'mod+k', 'c', 'mod+shift+p'
  chord?: string      // e.g. 'g+h' for go home
  label: string
  description: string
  category: ShortcutCategory
  handler: () => void
  scope: 'global' | 'module'
  moduleId?: string
}

// ─── Internal store ──────────────────────────────────────────

const registry = new Map<string, RegisteredShortcut>()

// ─── Public API ──────────────────────────────────────────────

export function registerShortcut(shortcut: RegisteredShortcut): void {
  registry.set(shortcut.id, shortcut)
}

export function unregisterShortcut(id: string): void {
  registry.delete(id)
}

export function getAllShortcuts(): RegisteredShortcut[] {
  return Array.from(registry.values())
}

export function getShortcutsByCategory(): Map<ShortcutCategory, RegisteredShortcut[]> {
  const groups = new Map<ShortcutCategory, RegisteredShortcut[]>()
  for (const shortcut of registry.values()) {
    const list = groups.get(shortcut.category) ?? []
    list.push(shortcut)
    groups.set(shortcut.category, list)
  }
  return groups
}

export function getShortcutsByModule(moduleId: string): RegisteredShortcut[] {
  return Array.from(registry.values()).filter(
    (s) => s.scope === 'module' && s.moduleId === moduleId
  )
}

/** Reset registry — useful for tests */
export function clearRegistry(): void {
  registry.clear()
}
