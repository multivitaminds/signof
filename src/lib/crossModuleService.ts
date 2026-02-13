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
import { useWorkspaceStore } from '../features/workspace/stores/useWorkspaceStore'
import { useInboxStore } from '../features/inbox/stores/useInboxStore'
import { useActivityStore } from '../features/activity/stores/useActivityStore'
import { ACTIVE_STATUSES } from '../types'

// ─── Types ──────────────────────────────────────────────────────

export interface ModuleMetrics {
  documents: { pending: number; total: number }
  projects: { open: number; total: number }
  bookings: { upcoming: number; total: number }
  invoices: { unpaid: number; total: number }
  pages: { total: number }
  inbox: { unread: number }
}

export interface DeadlineItem {
  id: string
  title: string
  date: string
  module: 'documents' | 'projects' | 'scheduling' | 'accounting'
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

  return {
    documents: { pending: pendingDocs, total: documents.length },
    projects: { open: openIssues, total: projects.length },
    bookings: { upcoming: upcomingBookings, total: bookings.length },
    invoices: { unpaid: unpaidInvoices, total: invoices.length },
    pages: { total: activePages },
    inbox: { unread: unreadNotifications },
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

  return insights
}

export function getRecentCrossModuleActivity(limit = 15) {
  const activities = useActivityStore.getState().activities
  return [...activities]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
}
