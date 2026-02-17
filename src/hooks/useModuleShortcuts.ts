import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import {
  registerShortcut,
  unregisterShortcut,
  ShortcutCategory,
} from '../lib/shortcutRegistry'
import type { ShortcutConfig } from './useKeyboardShortcuts'

export interface ModuleShortcutConfig {
  id: string
  keys: string
  chord?: string
  label: string
  description: string
  category: ShortcutCategory
  handler: () => void
}

export function useModuleShortcuts(
  moduleId: string,
  shortcuts: ModuleShortcutConfig[]
): void {
  const location = useLocation()

  // Determine if we're on this module's route
  const isActive = useMemo(() => {
    const routeMap: Record<string, string> = {
      home: '/',
      pages: '/pages',
      projects: '/projects',
      documents: '/documents',
      calendar: '/calendar',
      databases: '/data',
      inbox: '/inbox',
      copilot: '/copilot',
      tax: '/tax',
      accounting: '/accounting',
      settings: '/settings',
      developer: '/developer',
    }
    const prefix = routeMap[moduleId]
    if (!prefix) return false
    if (prefix === '/') return location.pathname === '/'
    return location.pathname.startsWith(prefix)
  }, [moduleId, location.pathname])

  // Build shortcut configs for useKeyboardShortcuts (only when active)
  const keyboardConfigs: ShortcutConfig[] = useMemo(() => {
    if (!isActive) return []
    return shortcuts.map((s) => ({
      key: s.keys,
      chord: s.chord,
      handler: s.handler,
    }))
  }, [isActive, shortcuts])

  // Register into the global registry when active
  useEffect(() => {
    if (!isActive) return

    for (const s of shortcuts) {
      registerShortcut({
        id: `module:${moduleId}:${s.id}`,
        keys: s.keys,
        chord: s.chord,
        label: s.label,
        description: s.description,
        category: s.category,
        handler: s.handler,
        scope: 'module',
        moduleId,
      })
    }

    return () => {
      for (const s of shortcuts) {
        unregisterShortcut(`module:${moduleId}:${s.id}`)
      }
    }
  }, [isActive, moduleId, shortcuts])

  useKeyboardShortcuts(keyboardConfigs)
}
