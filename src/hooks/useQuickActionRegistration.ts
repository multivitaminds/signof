import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerAction, unregisterAction } from '../lib/quickActions'
import { useAppStore } from '../stores/useAppStore'
import { useAppearanceStore } from '../features/settings/stores/useAppearanceStore'

const ACTION_IDS = [
  // Navigation
  'nav-home',
  'nav-pages',
  'nav-projects',
  'nav-documents',
  'nav-calendar',
  'nav-databases',
  'nav-inbox',
  'nav-copilot',
  'nav-settings',
  // Creation
  'create-document',
  'create-page',
  'create-project',
  'create-issue',
  'create-event',
  'create-database',
  'create-invoice',
  'create-contact',
  // App actions
  'toggle-dark-mode',
  'toggle-sidebar',
  'open-settings',
  'open-keyboard-shortcuts',
  'start-ai-agent',
  'open-command-center',
  'open-api-docs',
  // Module actions
  'upload-document',
  'file-tax-return',
  'create-booking-page',
  'export-data',
] as const

export function useQuickActionRegistration(): void {
  const navigate = useNavigate()

  useEffect(() => {
    // ─── Navigation actions ─────────────────────────────────
    registerAction({
      id: 'nav-home',
      label: 'Go to Home',
      description: 'Navigate to the home dashboard',
      icon: 'home',
      shortcut: 'mod+1',
      module: 'Navigation',
      keywords: ['dashboard', 'main', 'start'],
      handler: () => navigate('/'),
    })

    registerAction({
      id: 'nav-pages',
      label: 'Go to Pages',
      description: 'Navigate to workspace pages',
      icon: 'file-text',
      shortcut: 'mod+2',
      module: 'Navigation',
      keywords: ['workspace', 'wiki', 'notes', 'docs'],
      handler: () => navigate('/pages'),
    })

    registerAction({
      id: 'nav-projects',
      label: 'Go to Projects',
      description: 'Navigate to project tracker',
      icon: 'folder-kanban',
      shortcut: 'mod+3',
      module: 'Navigation',
      keywords: ['issues', 'tasks', 'board', 'kanban', 'linear'],
      handler: () => navigate('/projects'),
    })

    registerAction({
      id: 'nav-documents',
      label: 'Go to Documents',
      description: 'Navigate to document signing',
      icon: 'file-signature',
      shortcut: 'mod+4',
      module: 'Navigation',
      keywords: ['signing', 'envelopes', 'docusign', 'pandadoc'],
      handler: () => navigate('/documents'),
    })

    registerAction({
      id: 'nav-calendar',
      label: 'Go to Calendar',
      description: 'Navigate to scheduling',
      icon: 'calendar',
      shortcut: 'mod+5',
      module: 'Navigation',
      keywords: ['scheduling', 'events', 'bookings', 'calendly'],
      handler: () => navigate('/calendar'),
    })

    registerAction({
      id: 'nav-databases',
      label: 'Go to Databases',
      description: 'Navigate to databases',
      icon: 'database',
      shortcut: 'mod+6',
      module: 'Navigation',
      keywords: ['tables', 'airtable', 'data', 'records'],
      handler: () => navigate('/data'),
    })

    registerAction({
      id: 'nav-inbox',
      label: 'Go to Inbox',
      description: 'Navigate to notifications inbox',
      icon: 'inbox',
      shortcut: 'mod+7',
      module: 'Navigation',
      keywords: ['notifications', 'messages', 'alerts'],
      handler: () => navigate('/inbox'),
    })

    registerAction({
      id: 'nav-copilot',
      label: 'Go to Copilot',
      description: 'Navigate to AI copilot',
      icon: 'brain',
      shortcut: 'mod+8',
      module: 'Navigation',
      keywords: ['ai', 'agent', 'assistant', 'memory'],
      handler: () => navigate('/copilot'),
    })

    registerAction({
      id: 'nav-settings',
      label: 'Go to Settings',
      description: 'Navigate to workspace settings',
      icon: 'settings',
      shortcut: 'mod+9',
      module: 'Navigation',
      keywords: ['preferences', 'config', 'account', 'team'],
      handler: () => navigate('/settings'),
    })

    // ─── Creation actions ───────────────────────────────────
    registerAction({
      id: 'create-document',
      label: 'New Document',
      description: 'Create a new document for signing',
      icon: 'plus',
      module: 'Documents',
      keywords: ['upload', 'envelope', 'signature', 'create'],
      handler: () => navigate('/documents?action=upload'),
    })

    registerAction({
      id: 'create-page',
      label: 'New Page',
      description: 'Create a new workspace page',
      icon: 'plus',
      module: 'Workspace',
      keywords: ['note', 'wiki', 'create', 'write'],
      handler: () => navigate('/pages/new'),
    })

    registerAction({
      id: 'create-project',
      label: 'New Project',
      description: 'Start a new project',
      icon: 'plus',
      module: 'Projects',
      keywords: ['kanban', 'board', 'create', 'tracker'],
      handler: () => navigate('/projects/new'),
    })

    registerAction({
      id: 'create-issue',
      label: 'New Issue',
      description: 'Create a new issue in a project',
      icon: 'circle-dot',
      module: 'Projects',
      keywords: ['bug', 'task', 'ticket', 'create'],
      handler: () => navigate('/projects'),
    })

    registerAction({
      id: 'create-event',
      label: 'New Event',
      description: 'Create a new event type',
      icon: 'calendar',
      module: 'Calendar',
      keywords: ['meeting', 'booking', 'schedule', 'create'],
      handler: () => navigate('/calendar/events'),
    })

    registerAction({
      id: 'create-database',
      label: 'New Database',
      description: 'Create a new relational database',
      icon: 'database',
      module: 'Databases',
      keywords: ['table', 'records', 'create', 'airtable'],
      handler: () => navigate('/data'),
    })

    registerAction({
      id: 'create-invoice',
      label: 'New Invoice',
      description: 'Create a new invoice',
      icon: 'receipt',
      module: 'Accounting',
      keywords: ['bill', 'payment', 'create', 'billing'],
      handler: () => navigate('/accounting/invoices'),
    })

    registerAction({
      id: 'create-contact',
      label: 'New Contact',
      description: 'Add a new contact',
      icon: 'users',
      module: 'Accounting',
      keywords: ['person', 'client', 'customer', 'create'],
      handler: () => navigate('/accounting/contacts'),
    })

    // ─── App actions ────────────────────────────────────────
    registerAction({
      id: 'toggle-dark-mode',
      label: 'Toggle Dark Mode',
      description: 'Switch between light and dark theme',
      icon: 'moon',
      module: 'App',
      keywords: ['theme', 'light', 'dark', 'appearance', 'night'],
      handler: () => {
        const store = useAppearanceStore.getState()
        const current = store.theme
        const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light'
        store.setTheme(next)
      },
    })

    registerAction({
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      description: 'Show or hide the sidebar',
      icon: 'panel-left',
      module: 'App',
      keywords: ['menu', 'nav', 'panel', 'collapse'],
      handler: () => useAppStore.getState().toggleSidebar(),
    })

    registerAction({
      id: 'open-settings',
      label: 'Open Settings',
      description: 'Open workspace settings',
      icon: 'settings',
      module: 'App',
      keywords: ['preferences', 'config', 'options'],
      handler: () => navigate('/settings'),
    })

    registerAction({
      id: 'open-keyboard-shortcuts',
      label: 'Open Keyboard Shortcuts',
      description: 'View all keyboard shortcuts',
      icon: 'keyboard',
      module: 'App',
      keywords: ['hotkeys', 'keys', 'bindings', 'help'],
      handler: () => useAppStore.getState().toggleShortcutHelp(),
    })

    registerAction({
      id: 'start-ai-agent',
      label: 'Start AI Agent',
      description: 'Launch an autonomous AI agent',
      icon: 'bot',
      module: 'Copilot',
      keywords: ['automation', 'assistant', 'run', 'agent'],
      handler: () => navigate('/copilot/agents'),
    })

    registerAction({
      id: 'open-command-center',
      label: 'Open Command Center',
      description: 'Open the command center hub',
      icon: 'brain',
      module: 'App',
      keywords: ['brain', 'hub', 'central', 'control'],
      handler: () => navigate('/brain'),
    })

    registerAction({
      id: 'open-api-docs',
      label: 'Open API Docs',
      description: 'View API documentation',
      icon: 'code-2',
      module: 'Developer',
      keywords: ['api', 'developer', 'reference', 'docs'],
      handler: () => navigate('/developer/api'),
    })

    // ─── Module actions ─────────────────────────────────────
    registerAction({
      id: 'upload-document',
      label: 'Upload Document',
      description: 'Upload a document for signing',
      icon: 'upload',
      module: 'Documents',
      keywords: ['file', 'pdf', 'upload', 'import'],
      handler: () => navigate('/documents?action=upload'),
    })

    registerAction({
      id: 'file-tax-return',
      label: 'File Tax Return',
      description: 'Start a new tax filing',
      icon: 'receipt',
      module: 'Tax',
      keywords: ['taxes', 'irs', 'filing', 'return', '1099', 'w2'],
      handler: () => navigate('/tax/filing'),
    })

    registerAction({
      id: 'create-booking-page',
      label: 'Create Booking Page',
      description: 'Create a public booking page',
      icon: 'globe',
      module: 'Calendar',
      keywords: ['scheduling', 'availability', 'public', 'calendly'],
      handler: () => navigate('/calendar/events'),
    })

    registerAction({
      id: 'export-data',
      label: 'Export Data',
      description: 'Export workspace data',
      icon: 'download',
      module: 'App',
      keywords: ['csv', 'json', 'download', 'backup'],
      handler: () => navigate('/settings'),
    })

    return () => {
      for (const id of ACTION_IDS) {
        unregisterAction(id)
      }
    }
  }, [navigate])
}
