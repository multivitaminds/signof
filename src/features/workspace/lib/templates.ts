import { BlockType } from '../types'
import type { PageTemplate } from '../types'

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'blank',
    title: 'Blank',
    icon: '📄',
    description: 'Start with an empty page',
    blocks: [],
  },
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    icon: '📝',
    description: 'Capture meeting notes and action items',
    blocks: [
      { type: BlockType.Heading1, content: 'Meeting Notes' },
      { type: BlockType.BulletList, content: 'Date: ' },
      { type: BlockType.BulletList, content: 'Attendees: ' },
      { type: BlockType.Heading2, content: 'Agenda' },
      { type: BlockType.BulletList, content: '' },
      { type: BlockType.Heading2, content: 'Action Items' },
      { type: BlockType.BulletList, content: '' },
    ],
  },
  {
    id: 'project-brief',
    title: 'Project Brief',
    icon: '🎯',
    description: 'Outline a new project',
    blocks: [
      { type: BlockType.Heading1, content: 'Project Brief' },
      { type: BlockType.Heading2, content: 'Overview' },
      { type: BlockType.Paragraph, content: '' },
      { type: BlockType.Heading2, content: 'Goals' },
      { type: BlockType.BulletList, content: '' },
      { type: BlockType.Heading2, content: 'Timeline' },
      { type: BlockType.Paragraph, content: '' },
      { type: BlockType.Heading2, content: 'Resources' },
      { type: BlockType.BulletList, content: '' },
    ],
  },
  {
    id: 'weekly-review',
    title: 'Weekly Review',
    icon: '📊',
    description: 'Review your week',
    blocks: [
      { type: BlockType.Heading1, content: 'Weekly Review' },
      { type: BlockType.Heading2, content: 'Wins' },
      { type: BlockType.BulletList, content: '' },
      { type: BlockType.Heading2, content: 'Challenges' },
      { type: BlockType.BulletList, content: '' },
      { type: BlockType.Heading2, content: 'Next Week' },
      { type: BlockType.BulletList, content: '' },
    ],
  },
  {
    id: 'decision-log',
    title: 'Decision Log',
    icon: '⚖️',
    description: 'Record important decisions',
    blocks: [
      { type: BlockType.Heading1, content: 'Decision Log' },
      { type: BlockType.Paragraph, content: 'Record important decisions and their rationale here.' },
      { type: BlockType.Divider, content: '' },
    ],
  },
]
