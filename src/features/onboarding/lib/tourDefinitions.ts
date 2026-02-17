import type { TourDefinition } from '../types'

export const tourDefinitions: TourDefinition[] = [
  {
    id: 'welcome',
    name: 'Welcome Tour',
    steps: [
      {
        targetSelector: '[data-tour="sidebar"]',
        title: 'Navigation',
        description: 'Use the sidebar to switch between modules like Documents, Projects, Calendar, and more.',
        placement: 'right',
      },
      {
        targetSelector: '[data-tour="search"]',
        title: 'Quick Search',
        description: 'Press \u2318K to search across everything in your workspace instantly.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="modules"]',
        title: 'Your Modules',
        description: 'Documents, Projects, Calendar, Databases, and more — all in one place.',
        placement: 'right',
      },
      {
        targetSelector: '[data-tour="copilot"]',
        title: 'AI Copilot',
        description: 'Your AI assistant lives here. Ask questions, generate content, or automate tasks.',
        placement: 'right',
      },
      {
        targetSelector: '[data-tour="settings"]',
        title: 'Settings',
        description: 'Customize your workspace, manage your team, and configure integrations.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'first-document',
    name: 'First Document Tour',
    steps: [
      {
        targetSelector: '[data-tour="document-upload"]',
        title: 'Upload a Document',
        description: 'Start by uploading a PDF, Word document, or image to sign.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="document-signers"]',
        title: 'Add Signers',
        description: 'Add the people who need to sign this document.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="document-send"]',
        title: 'Send for Signature',
        description: 'Send the document out for signatures with one click.',
        placement: 'bottom',
      },
      {
        targetSelector: '[data-tour="document-list"]',
        title: 'Track Progress',
        description: 'Track the status of all your documents right here.',
        placement: 'top',
      },
    ],
  },
]
