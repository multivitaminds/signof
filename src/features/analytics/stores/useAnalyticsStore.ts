import { create } from 'zustand'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useProjectStore } from '../../projects/stores/useProjectStore'
import { useSchedulingStore } from '../../scheduling/stores/useSchedulingStore'
import { useFleetStore } from '../../clawgpt/stores/useFleetStore'
import { useWorkspaceStore } from '../../workspace/stores/useWorkspaceStore'
import { useInvoiceStore } from '../../accounting/stores/useInvoiceStore'
import type { MetricSummary, MetricDataPoint, TimeRange } from '../types'
import { MetricType, TimeRange as TR } from '../types'

function daysForRange(range: TimeRange): number {
  switch (range) {
    case TR.Week: return 7
    case TR.Month: return 30
    case TR.Quarter: return 90
    case TR.All: return 365
  }
}

function dateNDaysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function isWithinRange(dateStr: string, days: number): boolean {
  const cutoff = dateNDaysAgo(days)
  return new Date(dateStr) >= cutoff
}

function generateMockTimeSeries(baseValue: number, days: number): MetricDataPoint[] {
  const points: MetricDataPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = dateNDaysAgo(i)
    const jitter = Math.floor(Math.random() * Math.max(1, Math.floor(baseValue * 0.4)))
    points.push({
      date: d.toISOString().slice(0, 10),
      value: Math.max(0, baseValue + jitter - Math.floor(baseValue * 0.2)),
    })
  }
  return points
}

function computeTrend(current: number, previous: number): 'up' | 'down' | 'flat' {
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'flat'
}

interface AnalyticsState {
  timeRange: TimeRange
  setTimeRange: (range: TimeRange) => void
  getMetrics: () => MetricSummary[]
}

export const useAnalyticsStore = create<AnalyticsState>()((set, get) => ({
  timeRange: TR.Month,

  setTimeRange: (range) => set({ timeRange: range }),

  getMetrics: () => {
    const range = get().timeRange
    const days = daysForRange(range)
    const prevDays = days * 2

    // Documents signed
    const documents = useDocumentStore.getState().documents
    const docsCurrent = documents.filter(
      (d) => d.status === 'completed' && isWithinRange(d.createdAt, days)
    ).length
    const docsPrevious = documents.filter(
      (d) => d.status === 'completed' && isWithinRange(d.createdAt, prevDays) && !isWithinRange(d.createdAt, days)
    ).length

    // Issues completed
    const issues = Object.values(useProjectStore.getState().issues)
    const issuesCurrent = issues.filter(
      (i) => i.status === 'done' && isWithinRange(i.createdAt, days)
    ).length
    const issuesPrevious = issues.filter(
      (i) => i.status === 'done' && isWithinRange(i.createdAt, prevDays) && !isWithinRange(i.createdAt, days)
    ).length

    // Bookings created
    const bookings = useSchedulingStore.getState().bookings
    const bookingsCurrent = bookings.filter(
      (b) => isWithinRange(b.createdAt, days)
    ).length
    const bookingsPrevious = bookings.filter(
      (b) => isWithinRange(b.createdAt, prevDays) && !isWithinRange(b.createdAt, days)
    ).length

    // Agent tasks done
    const taskQueue = useFleetStore.getState().taskQueue
    const agentCurrent = taskQueue.filter(
      (t) => t.status === 'completed' && isWithinRange(t.submittedAt, days)
    ).length
    const agentPrevious = taskQueue.filter(
      (t) => t.status === 'completed' && isWithinRange(t.submittedAt, prevDays) && !isWithinRange(t.submittedAt, days)
    ).length

    // Pages created
    const pages = Object.values(useWorkspaceStore.getState().pages)
    const pagesCurrent = pages.filter(
      (p) => !p.trashedAt && isWithinRange(p.createdAt, days)
    ).length
    const pagesPrevious = pages.filter(
      (p) => !p.trashedAt && isWithinRange(p.createdAt, prevDays) && !isWithinRange(p.createdAt, days)
    ).length

    // Revenue tracked (paid invoices)
    const invoices = useInvoiceStore.getState().invoices
    const revCurrent = invoices
      .filter((inv) => inv.status === 'paid' && isWithinRange(inv.createdAt, days))
      .reduce((sum, inv) => sum + inv.amountPaid, 0)
    const revPrevious = invoices
      .filter((inv) => inv.status === 'paid' && isWithinRange(inv.createdAt, prevDays) && !isWithinRange(inv.createdAt, days))
      .reduce((sum, inv) => sum + inv.amountPaid, 0)

    return [
      {
        type: MetricType.DocumentsSigned,
        current: docsCurrent,
        previous: docsPrevious,
        trend: computeTrend(docsCurrent, docsPrevious),
        data: generateMockTimeSeries(Math.max(1, docsCurrent), Math.min(days, 30)),
      },
      {
        type: MetricType.IssuesCompleted,
        current: issuesCurrent,
        previous: issuesPrevious,
        trend: computeTrend(issuesCurrent, issuesPrevious),
        data: generateMockTimeSeries(Math.max(1, issuesCurrent), Math.min(days, 30)),
      },
      {
        type: MetricType.BookingsCreated,
        current: bookingsCurrent,
        previous: bookingsPrevious,
        trend: computeTrend(bookingsCurrent, bookingsPrevious),
        data: generateMockTimeSeries(Math.max(1, bookingsCurrent), Math.min(days, 30)),
      },
      {
        type: MetricType.AgentTasksDone,
        current: agentCurrent,
        previous: agentPrevious,
        trend: computeTrend(agentCurrent, agentPrevious),
        data: generateMockTimeSeries(Math.max(1, agentCurrent), Math.min(days, 30)),
      },
      {
        type: MetricType.PagesCreated,
        current: pagesCurrent,
        previous: pagesPrevious,
        trend: computeTrend(pagesCurrent, pagesPrevious),
        data: generateMockTimeSeries(Math.max(1, pagesCurrent), Math.min(days, 30)),
      },
      {
        type: MetricType.RevenueTracked,
        current: revCurrent,
        previous: revPrevious,
        trend: computeTrend(revCurrent, revPrevious),
        data: generateMockTimeSeries(Math.max(100, revCurrent), Math.min(days, 30)),
      },
    ]
  },
}))
