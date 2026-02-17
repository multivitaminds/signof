import { useMemo, useCallback } from 'react'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import MetricCard from '../components/MetricCard/MetricCard'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import { useAnalyticsStore } from '../stores/useAnalyticsStore'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useProjectStore } from '../../projects/stores/useProjectStore'
import { TimeRange } from '../types'
import './AnalyticsDashboardPage.css'

const TIME_RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '7d', value: TimeRange.Week },
  { label: '30d', value: TimeRange.Month },
  { label: '90d', value: TimeRange.Quarter },
  { label: 'All', value: TimeRange.All },
]

export default function AnalyticsDashboardPage() {
  const timeRange = useAnalyticsStore((s) => s.timeRange)
  const setTimeRange = useAnalyticsStore((s) => s.setTimeRange)

  // Call getMetrics directly from the store instance to avoid infinite re-render loops.
  // Using it via a Zustand selector would return a new array reference each time.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Re-compute when timeRange changes
  const metrics = useMemo(() => useAnalyticsStore.getState().getMetrics(), [timeRange])

  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      setTimeRange(range)
    },
    [setTimeRange],
  )

  // Bar chart: documents signed over time
  const docBarData = useMemo(() => {
    const docMetric = metrics.find((m) => m.type === 'documents_signed')
    if (!docMetric) return []
    return docMetric.data.map((d) => ({
      label: d.date.slice(5), // MM-DD
      value: d.value,
    }))
  }, [metrics])

  // Donut chart: document status breakdown
  const documents = useDocumentStore((s) => s.documents)
  const docStatusSegments = useMemo(() => {
    const draft = documents.filter((d) => d.status === 'draft').length
    const pending = documents.filter(
      (d) => d.status !== 'draft' && d.status !== 'completed' && d.status !== 'voided',
    ).length
    const completed = documents.filter((d) => d.status === 'completed').length
    return [
      { label: 'Draft', value: draft, color: 'var(--color-gray-400)' },
      { label: 'Pending', value: pending, color: 'var(--color-warning)' },
      { label: 'Completed', value: completed, color: 'var(--color-success)' },
    ]
  }, [documents])

  // Donut chart: issue status breakdown
  const issuesMap = useProjectStore((s) => s.issues)
  const issueStatusSegments = useMemo(() => {
    const issues = Object.values(issuesMap)
    const backlog = issues.filter((i) => i.status === 'backlog').length
    const todo = issues.filter((i) => i.status === 'todo').length
    const inProgress = issues.filter((i) => i.status === 'in_progress').length
    const inReview = issues.filter((i) => i.status === 'in_review').length
    const done = issues.filter((i) => i.status === 'done').length
    return [
      { label: 'Backlog', value: backlog, color: '#94A3B8' },
      { label: 'Todo', value: todo, color: '#64748B' },
      { label: 'In Progress', value: inProgress, color: '#F59E0B' },
      { label: 'In Review', value: inReview, color: '#8B5CF6' },
      { label: 'Done', value: done, color: '#22C55E' },
    ]
  }, [issuesMap])

  const timeRangeActions = (
    <div className="analytics-page__time-range">
      {TIME_RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`analytics-page__time-btn ${timeRange === opt.value ? 'analytics-page__time-btn--active' : ''}`}
          onClick={() => handleTimeRangeChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="analytics-page">
      <ModuleHeader title="Analytics" subtitle="Platform-wide metrics and insights" actions={timeRangeActions} />

      <div className="analytics-page__metrics-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.type} metric={metric} />
        ))}
      </div>

      <div className="analytics-page__section">
        <h3 className="analytics-page__section-title">Documents Signed Over Time</h3>
        <div className="analytics-page__chart-card">
          <BarChart data={docBarData} height={280} color="var(--color-primary)" />
        </div>
      </div>

      <div className="analytics-page__donuts">
        <div className="analytics-page__donut-card">
          <h3 className="analytics-page__section-title">Document Status</h3>
          <DonutChart segments={docStatusSegments} size={180} />
        </div>
        <div className="analytics-page__donut-card">
          <h3 className="analytics-page__section-title">Issue Status</h3>
          <DonutChart segments={issueStatusSegments} size={180} />
        </div>
      </div>
    </div>
  )
}
