import type { MemoryCategory, MemoryEntry, MemoryTemplate, CategoryMeta, MemoryInsight } from '../types'

export const CATEGORY_META: CategoryMeta[] = [
  {
    key: 'decisions',
    label: 'Decisions',
    description: 'Key decisions and rationale',
    icon: 'Gavel',
    color: '#6366F1',
    examples: ['Why we chose React', 'Pricing strategy decision'],
  },
  {
    key: 'workflows',
    label: 'Workflows',
    description: 'Processes and standard procedures',
    icon: 'GitBranch',
    color: '#10B981',
    examples: ['PR review process', 'Release checklist'],
  },
  {
    key: 'preferences',
    label: 'Preferences',
    description: 'Team and workspace preferences',
    icon: 'Settings',
    color: '#F59E0B',
    examples: ['Code style conventions', 'Communication norms'],
  },
  {
    key: 'people',
    label: 'People',
    description: 'Team members, contacts, roles',
    icon: 'Users',
    color: '#EC4899',
    examples: ['Team roster', 'Client contacts'],
  },
  {
    key: 'projects',
    label: 'Projects',
    description: 'Project context and status',
    icon: 'FolderOpen',
    color: '#8B5CF6',
    examples: ['Q1 OKRs', 'Product roadmap'],
  },
  {
    key: 'facts',
    label: 'Facts',
    description: 'Reference data and knowledge',
    icon: 'BookOpen',
    color: '#0EA5E9',
    examples: ['API endpoints', 'Brand guidelines'],
  },
]

export const MEMORY_TEMPLATES: MemoryTemplate[] = [
  {
    id: 'tpl-decision-record',
    title: 'Team Decision Record',
    description: 'Record a key decision with context and alternatives considered',
    category: 'decisions',
    scope: 'workspace',
    placeholder: 'Decision: [what] / Context: [why] / Alternatives: [rejected] / Date: [when]',
    tags: ['decision', 'rationale'],
    icon: 'Gavel',
  },
  {
    id: 'tpl-sop',
    title: 'Standard Operating Procedure',
    description: 'Document a repeatable process with clear steps',
    category: 'workflows',
    scope: 'workspace',
    placeholder: 'Process: [name] / Steps: 1. ... 2. ... / Owner: [who] / Last updated: [date]',
    tags: ['process', 'procedure'],
    icon: 'GitBranch',
  },
  {
    id: 'tpl-brand-voice',
    title: 'Brand Voice Guidelines',
    description: 'Define tone, style, and communication standards',
    category: 'preferences',
    scope: 'workspace',
    placeholder: 'Tone: [describe] / Do: [examples] / Don\'t: [examples] / Audience: [who]',
    tags: ['brand', 'voice', 'guidelines'],
    icon: 'Settings',
  },
  {
    id: 'tpl-team-member',
    title: 'Team Member Profile',
    description: 'Store information about a team member',
    category: 'people',
    scope: 'workspace',
    placeholder: 'Name: / Role: / Expertise: / Contact: / Preferences:',
    tags: ['team', 'member', 'profile'],
    icon: 'Users',
  },
  {
    id: 'tpl-project-brief',
    title: 'Project Brief',
    description: 'Capture project goals, timeline, and stakeholders',
    category: 'projects',
    scope: 'workspace',
    placeholder: 'Project: / Goal: / Timeline: / Success criteria: / Stakeholders:',
    tags: ['project', 'brief'],
    icon: 'FolderOpen',
  },
  {
    id: 'tpl-api-reference',
    title: 'API Reference',
    description: 'Document an API endpoint with request and response details',
    category: 'facts',
    scope: 'workspace',
    placeholder: 'Endpoint: / Method: / Auth: / Request: / Response: / Notes:',
    tags: ['api', 'reference', 'endpoint'],
    icon: 'BookOpen',
  },
  {
    id: 'tpl-meeting-notes',
    title: 'Meeting Notes Template',
    description: 'Structured meeting notes with decisions and action items',
    category: 'decisions',
    scope: 'workspace',
    placeholder: 'Date: / Attendees: / Agenda: / Decisions: / Action items:',
    tags: ['meeting', 'notes', 'actions'],
    icon: 'Gavel',
  },
  {
    id: 'tpl-onboarding',
    title: 'Onboarding Checklist',
    description: 'New hire onboarding steps and key resources',
    category: 'workflows',
    scope: 'workspace',
    placeholder: 'New hire: / Start date: / Setup tasks: [list] / Key contacts: / Resources:',
    tags: ['onboarding', 'checklist', 'new-hire'],
    icon: 'GitBranch',
  },
]

export function getCategoryStats(
  entries: MemoryEntry[]
): Array<{ category: MemoryCategory; count: number; tokenCount: number }> {
  const statsMap = new Map<MemoryCategory, { count: number; tokenCount: number }>()

  for (const entry of entries) {
    const existing = statsMap.get(entry.category)
    if (existing) {
      existing.count += 1
      existing.tokenCount += entry.tokenCount
    } else {
      statsMap.set(entry.category, { count: 1, tokenCount: entry.tokenCount })
    }
  }

  return CATEGORY_META.map((meta) => {
    const stats = statsMap.get(meta.key)
    return {
      category: meta.key,
      count: stats?.count ?? 0,
      tokenCount: stats?.tokenCount ?? 0,
    }
  })
}

export function getInsights(entries: MemoryEntry[]): MemoryInsight[] {
  const insights: MemoryInsight[] = []
  const categoriesWithEntries = new Set(entries.map((e) => e.category))

  for (const meta of CATEGORY_META) {
    if (!categoriesWithEntries.has(meta.key)) {
      const template = MEMORY_TEMPLATES.find((t) => t.category === meta.key)
      insights.push({
        type: 'suggestion',
        title: `Add ${meta.label} memories`,
        description: `You don't have any ${meta.label.toLowerCase()} stored yet. Start capturing ${meta.description.toLowerCase()}.`,
        action: template ? { label: `Use ${template.title}`, templateId: template.id } : undefined,
      })
    }
  }

  return insights
}

export function getPinnedEntries(
  entries: MemoryEntry[],
  pinnedIds: string[]
): MemoryEntry[] {
  const pinnedSet = new Set(pinnedIds)
  return entries
    .filter((e) => pinnedSet.has(e.id))
    .sort((a, b) => b.accessCount - a.accessCount)
}
