/**
 * Cross-Module Service Layer
 *
 * Read-only aggregation functions that pull data across existing stores
 * to power the HomePage integration hub and cross-module references.
 */

import { useDocumentStore } from '../stores/useDocumentStore'
import { useProjectStore } from '../features/projects/stores/useProjectStore'
import { useSchedulingStore } from '../features/scheduling/stores/useSchedulingStore'
import { useInvoiceStore } from '../features/accounting/stores/useInvoiceStore'
import { useExpenseStore } from '../features/accounting/stores/useExpenseStore'
import { useWorkspaceStore } from '../features/workspace/stores/useWorkspaceStore'
import { useInboxStore } from '../features/inbox/stores/useInboxStore'
import { useActivityStore } from '../features/activity/stores/useActivityStore'
import useAIAgentStore from '../features/ai/stores/useAIAgentStore'
import { useDatabaseStore } from '../features/databases/stores/useDatabaseStore'
import { useTaxStore } from '../features/tax/stores/useTaxStore'
import { useTaxFilingStore } from '../features/tax/stores/useTaxFilingStore'
import { RunStatus } from '../features/ai/types'
import { ACTIVE_STATUSES } from '../types'

// ─── Types ──────────────────────────────────────────────────────

export interface ModuleMetrics {
  documents: { pending: number; total: number }
  projects: { open: number; total: number }
  bookings: { upcoming: number; total: number }
  invoices: { unpaid: number; total: number }
  pages: { total: number }
  inbox: { unread: number }
  databases: { total: number; totalRecords: number }
  aiAgents: { running: number; completed: number; total: number }
  tax: { pendingFilings: number; upcomingDeadlines: number }
}

export interface DeadlineItem {
  id: string
  title: string
  date: string
  module: 'documents' | 'projects' | 'scheduling' | 'accounting' | 'tax' | 'databases'
  path: string
  urgency: 'overdue' | 'today' | 'upcoming'
}

export interface CrossModuleInsight {
  id: string
  message: string
  module: string
  path: string
  severity: 'info' | 'warning' | 'success'
}

// ─── Aggregation Functions ──────────────────────────────────────

export function getModuleMetrics(): ModuleMetrics {
  const documents = useDocumentStore.getState().documents
  const projectState = useProjectStore.getState()
  const issues = Object.values(projectState.issues)
  const projects = Object.values(projectState.projects)
  const bookings = useSchedulingStore.getState().bookings
  const invoices = useInvoiceStore.getState().invoices
  const pages = Object.values(useWorkspaceStore.getState().pages)
  const notifications = useInboxStore.getState().notifications

  const today = new Date().toISOString().split('T')[0] ?? ''

  const pendingDocs = documents.filter((d) =>
    (ACTIVE_STATUSES as string[]).includes(d.status)
  ).length

  const openIssues = issues.filter(
    (i) => i.status !== 'done' && i.status !== 'cancelled'
  ).length

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && b.date >= today
  ).length

  const unpaidInvoices = invoices.filter(
    (inv) => inv.status === 'sent' || inv.status === 'overdue'
  ).length

  const unreadNotifications = notifications.filter((n) => !n.read).length

  const activePages = pages.filter((p) => !p.trashedAt).length

  // Database metrics
  const dbState = useDatabaseStore.getState()
  const allDatabases = Object.values(dbState.databases)
  let totalRecords = 0
  for (const table of Object.values(dbState.tables)) {
    totalRecords += table.rows.length
  }

  // AI agent metrics
  const aiRuns = useAIAgentStore.getState().runs
  const runningAgents = aiRuns.filter((r) => r.status === RunStatus.Running).length
  const completedAgents = aiRuns.filter((r) => r.status === RunStatus.Completed).length

  // Tax metrics
  const taxState = useTaxStore.getState()
  const taxFilingState = useTaxFilingStore.getState()
  const pendingFilings = taxFilingState.filings.filter(
    (f) => f.state !== 'filed' && f.state !== 'accepted' && f.state !== 'rejected'
  ).length
  const upcomingTaxDeadlines = taxState.deadlines.filter((d) => !d.completed).length

  return {
    documents: { pending: pendingDocs, total: documents.length },
    projects: { open: openIssues, total: projects.length },
    bookings: { upcoming: upcomingBookings, total: bookings.length },
    invoices: { unpaid: unpaidInvoices, total: invoices.length },
    pages: { total: activePages },
    inbox: { unread: unreadNotifications },
    databases: { total: allDatabases.length, totalRecords },
    aiAgents: { running: runningAgents, completed: completedAgents, total: aiRuns.length },
    tax: { pendingFilings, upcomingDeadlines: upcomingTaxDeadlines },
  }
}

export function getUpcomingDeadlines(limit = 10): DeadlineItem[] {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0] ?? ''
  const items: DeadlineItem[] = []

  // Document deadlines (expiring documents)
  const documents = useDocumentStore.getState().documents
  for (const doc of documents) {
    if (doc.expiresAt && doc.status !== 'completed' && doc.status !== 'voided') {
      const dateStr = doc.expiresAt.split('T')[0] ?? ''
      items.push({
        id: `doc-${doc.id}`,
        title: doc.name,
        date: dateStr,
        module: 'documents',
        path: `/documents/${doc.id}`,
        urgency: dateStr < todayStr ? 'overdue' : dateStr === todayStr ? 'today' : 'upcoming',
      })
    }
  }

  // Project milestones
  const milestones = useProjectStore.getState().milestones
  for (const milestone of milestones) {
    if (!milestone.completed) {
      const dateStr = milestone.dueDate.split('T')[0] ?? ''
      if (dateStr) {
        items.push({
          id: `ms-${milestone.id}`,
          title: milestone.title,
          date: dateStr,
          module: 'projects',
          path: `/projects/${milestone.projectId}`,
          urgency: dateStr < todayStr ? 'overdue' : dateStr === todayStr ? 'today' : 'upcoming',
        })
      }
    }
  }

  // Upcoming bookings
  const bookings = useSchedulingStore.getState().bookings
  for (const booking of bookings) {
    if (booking.status === 'confirmed' && booking.date >= todayStr) {
      const attendeeName = booking.attendees[0]?.name ?? 'Booking'
      items.push({
        id: `bk-${booking.id}`,
        title: attendeeName,
        date: booking.date,
        module: 'scheduling',
        path: '/calendar/bookings',
        urgency: booking.date === todayStr ? 'today' : 'upcoming',
      })
    }
  }

  // Invoice due dates
  const invoices = useInvoiceStore.getState().invoices
  for (const inv of invoices) {
    if (inv.status === 'sent' || inv.status === 'overdue') {
      items.push({
        id: `inv-${inv.id}`,
        title: `Invoice ${inv.invoiceNumber} - ${inv.customerName}`,
        date: inv.dueDate,
        module: 'accounting',
        path: '/accounting/invoices',
        urgency: inv.dueDate < todayStr ? 'overdue' : inv.dueDate === todayStr ? 'today' : 'upcoming',
      })
    }
  }

  // Tax deadlines
  const taxDeadlines = useTaxStore.getState().deadlines
  for (const deadline of taxDeadlines) {
    if (!deadline.completed) {
      const dateStr = deadline.date
      items.push({
        id: `tax-${deadline.id}`,
        title: deadline.title,
        date: dateStr,
        module: 'tax',
        path: '/tax',
        urgency: dateStr < todayStr ? 'overdue' : dateStr === todayStr ? 'today' : 'upcoming',
      })
    }
  }

  // Sort: overdue first, then today, then upcoming by date
  const urgencyOrder = { overdue: 0, today: 1, upcoming: 2 }
  items.sort((a, b) => {
    const urgDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    if (urgDiff !== 0) return urgDiff
    return a.date.localeCompare(b.date)
  })

  return items.slice(0, limit)
}

export function getCopilotInsights(): CrossModuleInsight[] {
  const metrics = getModuleMetrics()
  const insights: CrossModuleInsight[] = []

  if (metrics.documents.pending > 0) {
    insights.push({
      id: 'pending-docs',
      message: `${metrics.documents.pending} document${metrics.documents.pending > 1 ? 's' : ''} awaiting signature`,
      module: 'Documents',
      path: '/documents',
      severity: metrics.documents.pending > 3 ? 'warning' : 'info',
    })
  }

  if (metrics.projects.open > 0) {
    insights.push({
      id: 'open-issues',
      message: `${metrics.projects.open} open issue${metrics.projects.open > 1 ? 's' : ''} across projects`,
      module: 'Projects',
      path: '/projects',
      severity: metrics.projects.open > 10 ? 'warning' : 'info',
    })
  }

  if (metrics.invoices.unpaid > 0) {
    insights.push({
      id: 'unpaid-invoices',
      message: `${metrics.invoices.unpaid} unpaid invoice${metrics.invoices.unpaid > 1 ? 's' : ''}`,
      module: 'Accounting',
      path: '/accounting/invoices',
      severity: 'warning',
    })
  }

  if (metrics.bookings.upcoming > 0) {
    insights.push({
      id: 'upcoming-bookings',
      message: `${metrics.bookings.upcoming} upcoming booking${metrics.bookings.upcoming > 1 ? 's' : ''}`,
      module: 'Calendar',
      path: '/calendar/bookings',
      severity: 'info',
    })
  }

  if (metrics.inbox.unread > 0) {
    insights.push({
      id: 'unread-inbox',
      message: `${metrics.inbox.unread} unread notification${metrics.inbox.unread > 1 ? 's' : ''}`,
      module: 'Inbox',
      path: '/inbox',
      severity: metrics.inbox.unread > 5 ? 'warning' : 'info',
    })
  }

  if (metrics.aiAgents.running > 0) {
    insights.push({
      id: 'running-agents',
      message: `${metrics.aiAgents.running} agent run${metrics.aiAgents.running > 1 ? 's' : ''} currently in progress`,
      module: 'Copilot',
      path: '/copilot',
      severity: 'info',
    })
  }

  if (metrics.aiAgents.completed > 0) {
    insights.push({
      id: 'completed-agents',
      message: `${metrics.aiAgents.completed} agent run${metrics.aiAgents.completed > 1 ? 's' : ''} completed`,
      module: 'Copilot',
      path: '/copilot',
      severity: 'success',
    })
  }

  if (metrics.databases.total > 0) {
    insights.push({
      id: 'database-records',
      message: `${metrics.databases.total} database${metrics.databases.total > 1 ? 's' : ''} with ${metrics.databases.totalRecords.toLocaleString()} total records`,
      module: 'Databases',
      path: '/databases',
      severity: 'info',
    })
  }

  if (metrics.tax.pendingFilings > 0) {
    insights.push({
      id: 'pending-filings',
      message: `${metrics.tax.pendingFilings} pending tax filing${metrics.tax.pendingFilings > 1 ? 's' : ''}`,
      module: 'Tax',
      path: '/tax',
      severity: 'warning',
    })
  }

  if (metrics.tax.upcomingDeadlines > 0) {
    insights.push({
      id: 'tax-deadlines',
      message: `${metrics.tax.upcomingDeadlines} upcoming tax deadline${metrics.tax.upcomingDeadlines > 1 ? 's' : ''}`,
      module: 'Tax',
      path: '/tax',
      severity: metrics.tax.upcomingDeadlines > 2 ? 'warning' : 'info',
    })
  }

  const expenses = useExpenseStore.getState().expenses
  if (expenses.length > 0) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)
    insights.push({
      id: 'expense-total',
      message: `$${total.toLocaleString()} in tracked expenses across ${expenses.length} entries`,
      module: 'Accounting',
      path: '/accounting',
      severity: 'info',
    })
  }

  return insights
}

export function getRecentCrossModuleActivity(limit = 15) {
  const activities = useActivityStore.getState().activities
  return [...activities]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
}
