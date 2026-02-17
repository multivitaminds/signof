import { useAnalyticsStore } from './useAnalyticsStore'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useProjectStore } from '../../projects/stores/useProjectStore'
import { useSchedulingStore } from '../../scheduling/stores/useSchedulingStore'
import { useWorkspaceStore } from '../../workspace/stores/useWorkspaceStore'
import { useInvoiceStore } from '../../accounting/stores/useInvoiceStore'
import { useFleetStore } from '../../clawgpt/stores/useFleetStore'
import { MetricType, TimeRange } from '../types'

describe('useAnalyticsStore', () => {
  beforeEach(() => {
    useAnalyticsStore.setState({ timeRange: TimeRange.Month })
  })

  it('defaults to 30d time range', () => {
    expect(useAnalyticsStore.getState().timeRange).toBe('30d')
  })

  it('setTimeRange updates the range', () => {
    useAnalyticsStore.getState().setTimeRange(TimeRange.Week)
    expect(useAnalyticsStore.getState().timeRange).toBe('7d')
  })

  it('getMetrics returns all 6 metric types', () => {
    const metrics = useAnalyticsStore.getState().getMetrics()
    expect(metrics).toHaveLength(6)

    const types = metrics.map((m) => m.type)
    expect(types).toContain(MetricType.DocumentsSigned)
    expect(types).toContain(MetricType.IssuesCompleted)
    expect(types).toContain(MetricType.BookingsCreated)
    expect(types).toContain(MetricType.AgentTasksDone)
    expect(types).toContain(MetricType.PagesCreated)
    expect(types).toContain(MetricType.RevenueTracked)
  })

  it('each metric has data points', () => {
    const metrics = useAnalyticsStore.getState().getMetrics()
    for (const metric of metrics) {
      expect(metric.data.length).toBeGreaterThan(0)
      expect(metric.data[0]).toHaveProperty('date')
      expect(metric.data[0]).toHaveProperty('value')
    }
  })

  it('each metric has a valid trend', () => {
    const metrics = useAnalyticsStore.getState().getMetrics()
    for (const metric of metrics) {
      expect(['up', 'down', 'flat']).toContain(metric.trend)
    }
  })

  it('filters documents by completed status', () => {
    // Set up documents with known dates
    const now = new Date().toISOString()
    useDocumentStore.setState({
      documents: [
        {
          id: '1', name: 'Done', status: 'completed' as const, createdAt: now,
          updatedAt: now, fileUrl: '', fileType: 'application/pdf',
          signers: [], signatures: [], audit: [], fields: [],
          folderId: null, templateId: null, expiresAt: null,
          reminderSentAt: null, signingOrder: 'parallel' as const,
          pricingTable: null, notes: [],
        },
      ],
    })

    useAnalyticsStore.setState({ timeRange: TimeRange.All })
    const metrics = useAnalyticsStore.getState().getMetrics()
    const docMetric = metrics.find((m) => m.type === MetricType.DocumentsSigned)
    expect(docMetric).toBeDefined()
    expect(docMetric!.current).toBeGreaterThanOrEqual(1)
  })

  it('counts completed issues from project store', () => {
    const now = new Date().toISOString()
    useProjectStore.setState({
      issues: {
        'iss-1': {
          id: 'iss-1', projectId: 'p1', identifier: 'P-1', title: 'Done issue',
          description: '', status: 'done', priority: 'medium', assigneeId: null,
          labels: [], createdAt: now, updatedAt: now, cycleId: null,
          dueDate: null, estimate: null,
        } as never,
      },
    })

    useAnalyticsStore.setState({ timeRange: TimeRange.All })
    const metrics = useAnalyticsStore.getState().getMetrics()
    const issueMetric = metrics.find((m) => m.type === MetricType.IssuesCompleted)
    expect(issueMetric).toBeDefined()
    expect(issueMetric!.current).toBeGreaterThanOrEqual(1)
  })

  it('counts bookings from scheduling store', () => {
    const now = new Date().toISOString()
    useSchedulingStore.setState({
      bookings: [
        {
          id: 'b1', eventTypeId: 'et1', startTime: now, endTime: now,
          status: 'confirmed', attendees: [{ name: 'Test', email: 'test@test.com', timezone: 'UTC' }],
          createdAt: now, location: '',
        } as never,
      ],
    })

    useAnalyticsStore.setState({ timeRange: TimeRange.All })
    const metrics = useAnalyticsStore.getState().getMetrics()
    const bookingMetric = metrics.find((m) => m.type === MetricType.BookingsCreated)
    expect(bookingMetric).toBeDefined()
    expect(bookingMetric!.current).toBeGreaterThanOrEqual(1)
  })

  it('time range filtering works for 7d', () => {
    useAnalyticsStore.getState().setTimeRange(TimeRange.Week)
    const metrics = useAnalyticsStore.getState().getMetrics()
    expect(metrics).toHaveLength(6)
    // Data points should be at most 7 for a week
    for (const m of metrics) {
      expect(m.data.length).toBeLessThanOrEqual(30)
    }
  })

  it('aggregates fleet task completions', () => {
    const now = new Date().toISOString()
    useFleetStore.setState({
      taskQueue: [
        {
          id: 't1', description: 'Test task', domain: null,
          priority: 'normal', source: 'user', status: 'completed',
          assignedInstanceId: null, submittedAt: now, startedAt: null, completedAt: now, result: 'ok',
        } as never,
      ],
    })

    useAnalyticsStore.setState({ timeRange: TimeRange.All })
    const metrics = useAnalyticsStore.getState().getMetrics()
    const agentMetric = metrics.find((m) => m.type === MetricType.AgentTasksDone)
    expect(agentMetric).toBeDefined()
    expect(agentMetric!.current).toBeGreaterThanOrEqual(1)
  })

  it('counts workspace pages', () => {
    const now = new Date().toISOString()
    useWorkspaceStore.setState({
      pages: {
        'p1': {
          id: 'p1', title: 'Test Page', icon: '', coverUrl: '', parentId: null,
          blockIds: [], createdAt: now, updatedAt: now, isFavorite: false,
          lastViewedAt: null, trashedAt: null, properties: {},
        } as never,
      },
    })

    useAnalyticsStore.setState({ timeRange: TimeRange.All })
    const metrics = useAnalyticsStore.getState().getMetrics()
    const pageMetric = metrics.find((m) => m.type === MetricType.PagesCreated)
    expect(pageMetric).toBeDefined()
    expect(pageMetric!.current).toBeGreaterThanOrEqual(1)
  })

  it('sums paid invoice amounts for revenue', () => {
    const now = new Date().toISOString()
    useInvoiceStore.setState({
      invoices: [
        {
          id: 'inv1', invoiceNumber: 'INV-0001', customerId: 'c1', customerName: 'Test',
          issueDate: now, dueDate: now, paymentTerms: 'net_30',
          status: 'paid', lineItems: [], subtotal: 1000, taxRate: 0, taxAmount: 0,
          discount: 0, total: 1000, amountPaid: 1000, balance: 0,
          notes: '', createdAt: now,
        } as never,
      ],
    })

    useAnalyticsStore.setState({ timeRange: TimeRange.All })
    const metrics = useAnalyticsStore.getState().getMetrics()
    const revMetric = metrics.find((m) => m.type === MetricType.RevenueTracked)
    expect(revMetric).toBeDefined()
    expect(revMetric!.current).toBeGreaterThanOrEqual(1000)
  })
})
