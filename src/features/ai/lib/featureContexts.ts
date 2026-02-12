export const FeatureKey = {
  Home: 'home',
  Workspace: 'workspace',
  Projects: 'projects',
  Documents: 'documents',
  Scheduling: 'scheduling',
  Databases: 'databases',
  Inbox: 'inbox',
} as const

export type FeatureKey = (typeof FeatureKey)[keyof typeof FeatureKey]

export interface QuickAction {
  label: string
  prompt: string
}

export interface FeatureContext {
  key: FeatureKey
  label: string
  placeholder: string
  quickActions: QuickAction[]
  greeting: string
}

export const FEATURE_CONTEXTS: Record<FeatureKey, FeatureContext> = {
  home: {
    key: 'home',
    label: 'Home',
    placeholder: 'Ask about your dashboard...',
    quickActions: [
      { label: 'Show my stats', prompt: 'Show my stats' },
      { label: 'Start AI agent', prompt: 'Start agent researcher' },
      { label: "What's due today?", prompt: "What's due today?" },
      { label: 'Summarize activity', prompt: 'Summarize activity' },
    ],
    greeting: 'Welcome! I can help you navigate your dashboard, show stats, or start an AI agent. What would you like to do?',
  },
  workspace: {
    key: 'workspace',
    label: 'Workspace',
    placeholder: 'Ask about pages and notes...',
    quickActions: [
      { label: 'Create a new page', prompt: 'Create a new page' },
      { label: 'Write meeting notes', prompt: 'Write meeting notes' },
      { label: 'Search my pages', prompt: 'Search my pages' },
      { label: 'Create checklist', prompt: 'Create a checklist page' },
    ],
    greeting: 'I can help you create pages, write notes, and manage your workspace. Try "Create a new page called Meeting Notes".',
  },
  projects: {
    key: 'projects',
    label: 'Projects',
    placeholder: 'Ask about tasks and issues...',
    quickActions: [
      { label: 'Create a task', prompt: 'Create a task' },
      { label: 'Show my issues', prompt: 'Show my issues' },
      { label: 'Start a sprint', prompt: 'Start a sprint' },
      { label: 'Set a goal', prompt: 'Set a goal' },
    ],
    greeting: 'I can help manage your projects. Try "Create a task called Fix login bug" or "Set priority to high".',
  },
  documents: {
    key: 'documents',
    label: 'Documents',
    placeholder: 'Ask about documents and signatures...',
    quickActions: [
      { label: 'Create template', prompt: 'Create a template' },
      { label: 'Add contact', prompt: 'Add a contact' },
      { label: 'Check pending', prompt: 'Check pending signatures' },
      { label: 'Generate document', prompt: 'Generate a document' },
    ],
    greeting: 'I can help with document management. Try "Create template Invoice" or "Add contact John john@example.com".',
  },
  scheduling: {
    key: 'scheduling',
    label: 'Scheduling',
    placeholder: 'Ask about meetings and bookings...',
    quickActions: [
      { label: 'Schedule a meeting', prompt: 'Schedule a meeting' },
      { label: 'Show my bookings', prompt: 'Show my bookings' },
      { label: 'Create event type', prompt: 'Create an event type' },
      { label: 'Check availability', prompt: 'Check my availability' },
    ],
    greeting: 'I can help with scheduling. Try "Schedule a meeting for tomorrow" or "Show my bookings".',
  },
  databases: {
    key: 'databases',
    label: 'Databases',
    placeholder: 'Ask about databases and tables...',
    quickActions: [
      { label: 'Create a database', prompt: 'Create a database' },
      { label: 'Add a table', prompt: 'Add a table' },
      { label: 'Add a record', prompt: 'Add a record' },
      { label: 'Create a view', prompt: 'Create a view' },
    ],
    greeting: 'I can help manage your databases. Try "Create database Contacts" or "Add a record".',
  },
  inbox: {
    key: 'inbox',
    label: 'Inbox',
    placeholder: 'Ask about notifications...',
    quickActions: [
      { label: 'Summarize', prompt: 'Summarize my notifications' },
      { label: 'Mark all read', prompt: 'Mark all read' },
      { label: 'Show unread', prompt: 'Show unread notifications' },
      { label: 'Clear all', prompt: 'Clear all notifications' },
    ],
    greeting: 'I can help manage your inbox. Try "Mark all read" or "Clear all notifications".',
  },
}
