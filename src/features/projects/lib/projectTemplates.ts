import type { Label } from '../types'

// ─── Template Status ────────────────────────────────────────────────

export interface TemplateStatus {
  key: string
  label: string
  color: string
}

// ─── Project Template ───────────────────────────────────────────────

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: string
  statuses: TemplateStatus[]
  labels: Label[]
  priorities: string[]
}

// ─── The 8 Project Templates ────────────────────────────────────────

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'tpl-software-dev',
    name: 'Software Development',
    description: 'Track features, bugs, and releases with a development workflow.',
    icon: '\u{1F4BB}',
    statuses: [
      { key: 'backlog', label: 'Backlog', color: '#94A3B8' },
      { key: 'todo', label: 'Todo', color: '#64748B' },
      { key: 'in_progress', label: 'In Progress', color: '#F59E0B' },
      { key: 'in_review', label: 'Review', color: '#8B5CF6' },
      { key: 'done', label: 'Done', color: '#22C55E' },
    ],
    labels: [
      { id: 'tpl-lbl-bug', name: 'Bug', color: '#EF4444' },
      { id: 'tpl-lbl-feature', name: 'Feature', color: '#8B5CF6' },
      { id: 'tpl-lbl-improvement', name: 'Improvement', color: '#3B82F6' },
      { id: 'tpl-lbl-docs', name: 'Documentation', color: '#14B8A6' },
      { id: 'tpl-lbl-tech-debt', name: 'Tech Debt', color: '#F97316' },
    ],
    priorities: ['Urgent', 'High', 'Medium', 'Low', 'None'],
  },
  {
    id: 'tpl-marketing',
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing campaigns from ideation to completion.',
    icon: '\u{1F4E3}',
    statuses: [
      { key: 'planning', label: 'Planning', color: '#94A3B8' },
      { key: 'design', label: 'Design', color: '#8B5CF6' },
      { key: 'review', label: 'Review', color: '#F59E0B' },
      { key: 'live', label: 'Live', color: '#22C55E' },
      { key: 'completed', label: 'Completed', color: '#059669' },
    ],
    labels: [
      { id: 'tpl-lbl-content', name: 'Content', color: '#F59E0B' },
      { id: 'tpl-lbl-social', name: 'Social Media', color: '#3B82F6' },
      { id: 'tpl-lbl-email', name: 'Email', color: '#EC4899' },
      { id: 'tpl-lbl-paid', name: 'Paid Ads', color: '#EF4444' },
    ],
    priorities: ['Urgent', 'High', 'Medium', 'Low', 'None'],
  },
  {
    id: 'tpl-product-launch',
    name: 'Product Launch',
    description: 'Coordinate a product launch from research through post-launch analysis.',
    icon: '\u{1F680}',
    statuses: [
      { key: 'research', label: 'Research', color: '#94A3B8' },
      { key: 'development', label: 'Development', color: '#F59E0B' },
      { key: 'testing', label: 'Testing', color: '#8B5CF6' },
      { key: 'launch', label: 'Launch', color: '#22C55E' },
      { key: 'post_launch', label: 'Post-launch', color: '#059669' },
    ],
    labels: [
      { id: 'tpl-lbl-ux', name: 'UX Research', color: '#8B5CF6' },
      { id: 'tpl-lbl-engineering', name: 'Engineering', color: '#3B82F6' },
      { id: 'tpl-lbl-marketing-pl', name: 'Marketing', color: '#EC4899' },
      { id: 'tpl-lbl-qa', name: 'QA', color: '#F97316' },
    ],
    priorities: ['Urgent', 'High', 'Medium', 'Low', 'None'],
  },
  {
    id: 'tpl-bug-tracking',
    name: 'Bug Tracking',
    description: 'Track, triage, and resolve bugs with a detailed lifecycle.',
    icon: '\u{1F41B}',
    statuses: [
      { key: 'new', label: 'New', color: '#EF4444' },
      { key: 'triaged', label: 'Triaged', color: '#F59E0B' },
      { key: 'in_progress', label: 'In Progress', color: '#3B82F6' },
      { key: 'fixed', label: 'Fixed', color: '#8B5CF6' },
      { key: 'verified', label: 'Verified', color: '#22C55E' },
      { key: 'closed', label: 'Closed', color: '#059669' },
    ],
    labels: [
      { id: 'tpl-lbl-critical', name: 'Critical', color: '#EF4444' },
      { id: 'tpl-lbl-regression', name: 'Regression', color: '#F97316' },
      { id: 'tpl-lbl-ui', name: 'UI', color: '#8B5CF6' },
      { id: 'tpl-lbl-perf', name: 'Performance', color: '#3B82F6' },
      { id: 'tpl-lbl-security', name: 'Security', color: '#DC2626' },
    ],
    priorities: ['Urgent', 'High', 'Medium', 'Low', 'None'],
  },
  {
    id: 'tpl-sprint',
    name: 'Sprint',
    description: 'Lightweight sprint board for agile teams.',
    icon: '\u{26A1}',
    statuses: [
      { key: 'backlog', label: 'Backlog', color: '#94A3B8' },
      { key: 'sprint', label: 'Sprint', color: '#3B82F6' },
      { key: 'in_progress', label: 'In Progress', color: '#F59E0B' },
      { key: 'done', label: 'Done', color: '#22C55E' },
    ],
    labels: [
      { id: 'tpl-lbl-story', name: 'Story', color: '#3B82F6' },
      { id: 'tpl-lbl-task', name: 'Task', color: '#22C55E' },
      { id: 'tpl-lbl-spike', name: 'Spike', color: '#F59E0B' },
    ],
    priorities: ['Urgent', 'High', 'Medium', 'Low', 'None'],
  },
  {
    id: 'tpl-content-calendar',
    name: 'Content Calendar',
    description: 'Manage content creation from idea to publication.',
    icon: '\u{1F4DD}',
    statuses: [
      { key: 'idea', label: 'Idea', color: '#94A3B8' },
      { key: 'writing', label: 'Writing', color: '#F59E0B' },
      { key: 'editing', label: 'Editing', color: '#8B5CF6' },
      { key: 'published', label: 'Published', color: '#22C55E' },
    ],
    labels: [
      { id: 'tpl-lbl-blog', name: 'Blog', color: '#3B82F6' },
      { id: 'tpl-lbl-video', name: 'Video', color: '#EF4444' },
      { id: 'tpl-lbl-newsletter', name: 'Newsletter', color: '#EC4899' },
      { id: 'tpl-lbl-docs-cc', name: 'Documentation', color: '#14B8A6' },
    ],
    priorities: ['Urgent', 'High', 'Medium', 'Low', 'None'],
  },
  {
    id: 'tpl-hiring',
    name: 'Hiring Pipeline',
    description: 'Track candidates through your hiring process.',
    icon: '\u{1F465}',
    statuses: [
      { key: 'applied', label: 'Applied', color: '#94A3B8' },
      { key: 'screening', label: 'Screening', color: '#F59E0B' },
      { key: 'interview', label: 'Interview', color: '#3B82F6' },
      { key: 'offer', label: 'Offer', color: '#8B5CF6' },
      { key: 'hired', label: 'Hired', color: '#22C55E' },
      { key: 'rejected', label: 'Rejected', color: '#EF4444' },
    ],
    labels: [
      { id: 'tpl-lbl-eng', name: 'Engineering', color: '#3B82F6' },
      { id: 'tpl-lbl-design-h', name: 'Design', color: '#8B5CF6' },
      { id: 'tpl-lbl-product', name: 'Product', color: '#F59E0B' },
      { id: 'tpl-lbl-ops', name: 'Operations', color: '#14B8A6' },
    ],
    priorities: ['Urgent', 'High', 'Medium', 'Low', 'None'],
  },
  {
    id: 'tpl-event-planning',
    name: 'Event Planning',
    description: 'Organize events from initial planning through wrap-up.',
    icon: '\u{1F389}',
    statuses: [
      { key: 'planning', label: 'Planning', color: '#94A3B8' },
      { key: 'vendor_selection', label: 'Vendor Selection', color: '#F59E0B' },
      { key: 'setup', label: 'Setup', color: '#3B82F6' },
      { key: 'live', label: 'Live', color: '#22C55E' },
      { key: 'wrap_up', label: 'Wrap-up', color: '#059669' },
    ],
    labels: [
      { id: 'tpl-lbl-venue', name: 'Venue', color: '#3B82F6' },
      { id: 'tpl-lbl-catering', name: 'Catering', color: '#F59E0B' },
      { id: 'tpl-lbl-speakers', name: 'Speakers', color: '#8B5CF6' },
      { id: 'tpl-lbl-logistics', name: 'Logistics', color: '#14B8A6' },
    ],
    priorities: ['Urgent', 'High', 'Medium', 'Low', 'None'],
  },
]
