import { useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import {
  registerShortcut,
  unregisterShortcut,
  ShortcutCategory,
} from '../lib/shortcutRegistry'
import type { ShortcutConfig } from './useKeyboardShortcuts'

// Module order for mod+1 through mod+9
const MODULE_ROUTES = [
  '/',           // mod+1 → Home
  '/pages',      // mod+2 → Pages
  '/projects',   // mod+3 → Projects
  '/documents',  // mod+4 → Documents
  '/calendar',   // mod+5 → Calendar
  '/data',       // mod+6 → Databases
  '/inbox',      // mod+7 → Inbox
  '/copilot',    // mod+8 → Copilot
  '/settings',   // mod+9 → Settings
] as const

const MODULE_LABELS = [
  'Home', 'Pages', 'Projects', 'Documents', 'Calendar',
  'Databases', 'Inbox', 'Copilot', 'Settings',
] as const

// Route prefix → "new item" destination
const NEW_ITEM_ROUTES: Record<string, string> = {
  '/documents': '/documents?action=upload',
  '/projects': '/projects/new',
  '/pages': '/pages/new',
  '/calendar': '/calendar/new',
  '/data': '/data/new',
}

export function useGlobalShortcuts(): void {
  const navigate = useNavigate()
  const location = useLocation()

  const openSearch = useCallback(() => {
    useAppStore.getState().toggleCommandPalette()
  }, [])

  const openShortcutHelp = useCallback(() => {
    useAppStore.getState().toggleShortcutHelp()
  }, [])

  const toggleSidebar = useCallback(() => {
    useAppStore.getState().toggleSidebar()
  }, [])

  const goToSettings = useCallback(() => {
    navigate('/settings')
  }, [navigate])

  const contextAwareNew = useCallback(() => {
    const path = location.pathname
    for (const [prefix, dest] of Object.entries(NEW_ITEM_ROUTES)) {
      if (path.startsWith(prefix)) {
        navigate(dest)
        return
      }
    }
    // Default: open new document
    navigate('/documents?action=upload')
  }, [navigate, location.pathname])

  // Module navigation shortcuts (mod+1 through mod+9)
  const moduleNavigators = useMemo(() =>
    MODULE_ROUTES.map((route) => () => navigate(route)),
    [navigate]
  )

  // Build shortcuts config for useKeyboardShortcuts
  const shortcuts: ShortcutConfig[] = useMemo(() => {
    const configs: ShortcutConfig[] = [
      { key: 'mod+k', handler: openSearch },
      { key: 'mod+/', handler: openShortcutHelp, ignoreInputs: true },
      { key: 'mod+b', handler: toggleSidebar },
      { key: 'mod+,', handler: goToSettings },
      { key: 'mod+n', handler: contextAwareNew },
    ]

    // mod+1 through mod+9
    for (let i = 0; i < MODULE_ROUTES.length; i++) {
      const nav = moduleNavigators[i]
      if (nav) {
        configs.push({ key: `mod+${i + 1}`, handler: nav })
      }
    }

    return configs
  }, [openSearch, openShortcutHelp, toggleSidebar, goToSettings, contextAwareNew, moduleNavigators])

  // Register all shortcuts into the global registry
  useEffect(() => {
    const registrations = [
      {
        id: 'global:search',
        keys: 'mod+k',
        label: 'Command palette',
        description: 'Open command palette',
        category: ShortcutCategory.Navigation,
        handler: openSearch,
        scope: 'global' as const,
      },
      {
        id: 'global:shortcuts',
        keys: 'mod+/',
        label: 'Keyboard shortcuts',
        description: 'Show keyboard shortcut help',
        category: ShortcutCategory.View,
        handler: openShortcutHelp,
        scope: 'global' as const,
      },
      {
        id: 'global:toggle-sidebar',
        keys: 'mod+b',
        label: 'Toggle sidebar',
        description: 'Collapse or expand the sidebar',
        category: ShortcutCategory.View,
        handler: toggleSidebar,
        scope: 'global' as const,
      },
      {
        id: 'global:settings',
        keys: 'mod+,',
        label: 'Settings',
        description: 'Navigate to settings',
        category: ShortcutCategory.Navigation,
        handler: goToSettings,
        scope: 'global' as const,
      },
      {
        id: 'global:new-item',
        keys: 'mod+n',
        label: 'New item',
        description: 'Create new item based on current module',
        category: ShortcutCategory.Creation,
        handler: contextAwareNew,
        scope: 'global' as const,
      },
    ]

    // Module shortcuts (mod+1 through mod+9)
    for (let i = 0; i < MODULE_ROUTES.length; i++) {
      const nav = moduleNavigators[i]
      if (nav) {
        registrations.push({
          id: `global:module-${i + 1}`,
          keys: `mod+${i + 1}`,
          label: MODULE_LABELS[i] ?? `Module ${i + 1}`,
          description: `Navigate to ${MODULE_LABELS[i] ?? `module ${i + 1}`}`,
          category: ShortcutCategory.Navigation,
          handler: nav,
          scope: 'global' as const,
        })
      }
    }

    for (const reg of registrations) {
      registerShortcut(reg)
    }

    return () => {
      for (const reg of registrations) {
        unregisterShortcut(reg.id)
      }
    }
  }, [openSearch, openShortcutHelp, toggleSidebar, goToSettings, contextAwareNew, moduleNavigators])

  useKeyboardShortcuts(shortcuts)
}
