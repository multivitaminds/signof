import type { Database, DbTable, DbField, DbRow, DbView } from '../types'
import { DbFieldType, ViewType } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Fields ──────────────────────────────────────────────────────────

const titleField: DbField = {
  id: 'f-title',
  name: 'Title',
  type: DbFieldType.Text,
  required: true,
  width: 280,
}

const statusField: DbField = {
  id: 'f-status',
  name: 'Status',
  type: DbFieldType.Select,
  width: 140,
  options: {
    choices: [
      { id: 's1', name: 'Backlog', color: '#94A3B8' },
      { id: 's2', name: 'In Progress', color: '#3B82F6' },
      { id: 's3', name: 'In Review', color: '#A855F7' },
      { id: 's4', name: 'Done', color: '#22C55E' },
    ],
  },
}

const priorityField: DbField = {
  id: 'f-priority',
  name: 'Priority',
  type: DbFieldType.Select,
  width: 120,
  options: {
    choices: [
      { id: 'p1', name: 'Low', color: '#94A3B8' },
      { id: 'p2', name: 'Medium', color: '#F59E0B' },
      { id: 'p3', name: 'High', color: '#EF4444' },
      { id: 'p4', name: 'Urgent', color: '#DC2626' },
    ],
  },
}

const dueDateField: DbField = {
  id: 'f-due',
  name: 'Due Date',
  type: DbFieldType.Date,
  width: 140,
}

const assigneeField: DbField = {
  id: 'f-assignee',
  name: 'Assignee',
  type: DbFieldType.Text,
  width: 140,
}

const notesField: DbField = {
  id: 'f-notes',
  name: 'Notes',
  type: DbFieldType.Text,
  width: 240,
}

const doneField: DbField = {
  id: 'f-done',
  name: 'Complete',
  type: DbFieldType.Checkbox,
  width: 100,
}

const fields = [titleField, statusField, priorityField, dueDateField, assigneeField, notesField, doneField]

// ─── Rows ────────────────────────────────────────────────────────────

const now = '2026-02-10T08:00:00Z'

const rows: DbRow[] = [
  { id: rid(), cells: { 'f-title': 'Design new landing page', 'f-status': 'In Progress', 'f-priority': 'High', 'f-due': '2026-02-15', 'f-assignee': 'Alice', 'f-notes': 'Update hero section and CTA', 'f-done': false }, createdAt: now, updatedAt: now },
  { id: rid(), cells: { 'f-title': 'Implement auth flow', 'f-status': 'In Review', 'f-priority': 'Urgent', 'f-due': '2026-02-12', 'f-assignee': 'Bob', 'f-notes': 'OAuth + magic link', 'f-done': false }, createdAt: now, updatedAt: now },
  { id: rid(), cells: { 'f-title': 'Write API documentation', 'f-status': 'Backlog', 'f-priority': 'Medium', 'f-due': '2026-02-20', 'f-assignee': 'Carol', 'f-notes': '', 'f-done': false }, createdAt: now, updatedAt: now },
  { id: rid(), cells: { 'f-title': 'Set up CI/CD pipeline', 'f-status': 'Done', 'f-priority': 'High', 'f-due': '2026-02-08', 'f-assignee': 'Dave', 'f-notes': 'GitHub Actions', 'f-done': true }, createdAt: now, updatedAt: now },
  { id: rid(), cells: { 'f-title': 'Database migration plan', 'f-status': 'Backlog', 'f-priority': 'Low', 'f-due': '2026-03-01', 'f-assignee': 'Eve', 'f-notes': 'Postgres to Turso', 'f-done': false }, createdAt: now, updatedAt: now },
  { id: rid(), cells: { 'f-title': 'Mobile responsive audit', 'f-status': 'In Progress', 'f-priority': 'Medium', 'f-due': '2026-02-18', 'f-assignee': 'Alice', 'f-notes': 'Check all breakpoints', 'f-done': false }, createdAt: now, updatedAt: now },
  { id: rid(), cells: { 'f-title': 'Performance optimization', 'f-status': 'Backlog', 'f-priority': 'High', 'f-due': '2026-02-25', 'f-assignee': 'Bob', 'f-notes': 'Lighthouse score > 95', 'f-done': false }, createdAt: now, updatedAt: now },
  { id: rid(), cells: { 'f-title': 'User feedback survey', 'f-status': 'Done', 'f-priority': 'Low', 'f-due': '2026-02-05', 'f-assignee': 'Carol', 'f-notes': '42 responses collected', 'f-done': true }, createdAt: now, updatedAt: now },
]

// ─── Views ───────────────────────────────────────────────────────────

const gridView: DbView = {
  id: 'v-grid',
  name: 'All Tasks',
  type: ViewType.Grid,
  tableId: 'tbl-roadmap',
  filters: [],
  sorts: [],
  hiddenFields: [],
  fieldOrder: fields.map((f) => f.id),
}

const kanbanView: DbView = {
  id: 'v-kanban',
  name: 'Board',
  type: ViewType.Kanban,
  tableId: 'tbl-roadmap',
  filters: [],
  sorts: [],
  groupBy: 'f-status',
  hiddenFields: [],
  fieldOrder: fields.map((f) => f.id),
}

const calendarView: DbView = {
  id: 'v-calendar',
  name: 'Timeline',
  type: ViewType.Calendar,
  tableId: 'tbl-roadmap',
  filters: [],
  sorts: [],
  hiddenFields: [],
  fieldOrder: fields.map((f) => f.id),
}

const galleryView: DbView = {
  id: 'v-gallery',
  name: 'Cards',
  type: ViewType.Gallery,
  tableId: 'tbl-roadmap',
  filters: [],
  sorts: [],
  hiddenFields: [],
  fieldOrder: fields.map((f) => f.id),
}

// ─── Table & Database ────────────────────────────────────────────────

export const sampleTable: DbTable = {
  id: 'tbl-roadmap',
  name: 'Roadmap',
  icon: '🗺️',
  fields,
  rows,
  views: [gridView, kanbanView, calendarView, galleryView],
}

export const sampleDatabase: Database = {
  id: 'db-product',
  name: 'Product Roadmap',
  icon: '🚀',
  description: 'Track features, bugs, and milestones',
  tables: ['tbl-roadmap'],
  createdAt: now,
  updatedAt: now,
}
