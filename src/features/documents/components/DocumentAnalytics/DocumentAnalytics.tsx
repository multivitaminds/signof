import { useMemo } from 'react'
import {
  FileText,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
} from 'lucide-react'
import { useDocumentStore } from '../../../../stores/useDocumentStore'
import { DocumentStatus, STATUS_LABELS } from '../../../../types'
import type { Document } from '../../../../types'
import './DocumentAnalytics.css'

// ─── Types ──────────────────────────────────────────────────────────

interface StatusCount {
  status: string
  label: string
  count: number
  color: string
}

interface SignerStat {
  name: string
  email: string
  count: number
}

interface CompletionEntry {
  docName: string
  completedAt: string
}

// ─── Constants ──────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  draft: '#94A3B8',
  pending: '#F59E0B',
  sent: '#3B82F6',
  delivered: '#8B5CF6',
  viewed: '#0EA5E9',
  signed: '#10B981',
  completed: '#059669',
  declined: '#EF4444',
  voided: '#6B7280',
}

// ─── Helpers ────────────────────────────────────────────────────────

function computeStatusCounts(documents: Document[]): StatusCount[] {
  const counts: Record<string, number> = {}
  for (const doc of documents) {
    counts[doc.status] = (counts[doc.status] || 0) + 1
  }
  return Object.entries(counts)
    .map(([status, count]) => ({
      status,
      label: STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status,
      count,
      color: STATUS_COLORS[status] ?? '#94A3B8',
    }))
    .sort((a, b) => b.count - a.count)
}

function computeAverageCompletionTime(documents: Document[]): string {
  const completedDocs = documents.filter(
    (d) => d.status === DocumentStatus.Completed
  )
  if (completedDocs.length === 0) return 'N/A'

  let totalMs = 0
  let counted = 0
  for (const doc of completedDocs) {
    const created = new Date(doc.createdAt).getTime()
    const completedEntry = [...doc.audit]
      .reverse()
      .find((e) => e.action === 'completed')
    const completed = completedEntry
      ? new Date(completedEntry.timestamp).getTime()
      : new Date(doc.updatedAt).getTime()
    const diff = completed - created
    if (diff > 0) {
      totalMs += diff
      counted++
    }
  }

  if (counted === 0) return 'N/A'

  const avgMs = totalMs / counted
  const hours = Math.floor(avgMs / 3600000)
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  if (days > 0) {
    return `${days}d ${remainingHours}h`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  const minutes = Math.floor(avgMs / 60000)
  return `${minutes}m`
}

function computeCompletionRate(documents: Document[]): number {
  if (documents.length === 0) return 0
  const completed = documents.filter(
    (d) => d.status === DocumentStatus.Completed
  ).length
  return Math.round((completed / documents.length) * 100)
}

function computeActiveSigners(documents: Document[]): SignerStat[] {
  const signerMap: Record<string, SignerStat> = {}

  for (const doc of documents) {
    for (const signer of doc.signers) {
      if (signer.status === 'signed') {
        const key = signer.email
        if (!signerMap[key]) {
          signerMap[key] = { name: signer.name, email: signer.email, count: 0 }
        }
        signerMap[key].count++
      }
    }
  }

  return Object.values(signerMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

function computeRecentCompletions(documents: Document[]): CompletionEntry[] {
  const completed = documents.filter(
    (d) => d.status === DocumentStatus.Completed
  )

  return completed
    .map((doc) => {
      const completedEntry = [...doc.audit]
        .reverse()
        .find((e) => e.action === 'completed')
      return {
        docName: doc.name,
        completedAt: completedEntry?.timestamp ?? doc.updatedAt,
      }
    })
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    .slice(0, 5)
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

// ─── Donut Chart Sub-component ──────────────────────────────────────

interface DonutSegmentData {
  status: string
  dashLength: number
  dashOffset: number
  color: string
}

function StatusDonut({ statusCounts, total }: { statusCounts: StatusCount[]; total: number }) {
  const size = 140
  const strokeWidth = 22
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  const segments = useMemo(() => {
    let offset = 0
    const result: DonutSegmentData[] = []
    for (const item of statusCounts) {
      const pct = total > 0 ? item.count / total : 0
      const dashLength = pct * circumference
      result.push({
        status: item.status,
        dashLength,
        dashOffset: -offset,
        color: item.color,
      })
      offset += dashLength
    }
    return result
  }, [statusCounts, total, circumference])

  return (
    <svg
      className="document-analytics__donut"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label="Documents by status donut chart"
    >
      {/* Background circle */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="document-analytics__donut-bg"
      />
      {segments.map((segment) => (
        <circle
          key={segment.status}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={segment.color}
          strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
          strokeDashoffset={segment.dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          className="document-analytics__donut-segment"
        />
      ))}
      {/* Center text */}
      <text x={cx} y={cy - 6} textAnchor="middle" className="document-analytics__donut-total">
        {total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="document-analytics__donut-label">
        total
      </text>
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────

function DocumentAnalytics() {
  const documents = useDocumentStore((s) => s.documents)

  const statusCounts = useMemo(() => computeStatusCounts(documents), [documents])
  const avgTime = useMemo(() => computeAverageCompletionTime(documents), [documents])
  const completionRate = useMemo(() => computeCompletionRate(documents), [documents])
  const topSigners = useMemo(() => computeActiveSigners(documents), [documents])
  const recentCompletions = useMemo(
    () => computeRecentCompletions(documents),
    [documents]
  )

  const total = documents.length

  return (
    <div className="document-analytics">
      <div className="document-analytics__header">
        <h2 className="document-analytics__title">Document Analytics</h2>
        <p className="document-analytics__subtitle">
          Signing metrics across all documents
        </p>
      </div>

      {/* Top metrics row */}
      <div className="document-analytics__metrics">
        <div className="document-analytics__metric-card">
          <div className="document-analytics__metric-icon">
            <FileText size={20} />
          </div>
          <div className="document-analytics__metric-content">
            <span className="document-analytics__metric-value">{total}</span>
            <span className="document-analytics__metric-label">Total Documents</span>
          </div>
        </div>

        <div className="document-analytics__metric-card">
          <div className="document-analytics__metric-icon document-analytics__metric-icon--success">
            <TrendingUp size={20} />
          </div>
          <div className="document-analytics__metric-content">
            <span className="document-analytics__metric-value">{completionRate}%</span>
            <span className="document-analytics__metric-label">Completion Rate</span>
          </div>
        </div>

        <div className="document-analytics__metric-card">
          <div className="document-analytics__metric-icon document-analytics__metric-icon--warning">
            <Clock size={20} />
          </div>
          <div className="document-analytics__metric-content">
            <span className="document-analytics__metric-value">{avgTime}</span>
            <span className="document-analytics__metric-label">Avg. Time to Complete</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="document-analytics__charts">
        {/* Status donut */}
        <div className="document-analytics__card">
          <h3 className="document-analytics__card-title">Documents by Status</h3>
          <div className="document-analytics__donut-container">
            <StatusDonut statusCounts={statusCounts} total={total} />
            <div className="document-analytics__legend">
              {statusCounts.map((item) => (
                <div key={item.status} className="document-analytics__legend-item">
                  <span
                    className="document-analytics__legend-dot"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="document-analytics__legend-label">{item.label}</span>
                  <span className="document-analytics__legend-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most active signers */}
        <div className="document-analytics__card">
          <h3 className="document-analytics__card-title">
            <Users size={16} />
            Most Active Signers
          </h3>
          {topSigners.length === 0 ? (
            <div className="document-analytics__empty-state">
              No signed documents yet
            </div>
          ) : (
            <div className="document-analytics__signers-list">
              {topSigners.map((signer, i) => (
                <div key={signer.email} className="document-analytics__signer-row">
                  <span className="document-analytics__signer-rank">{i + 1}</span>
                  <div className="document-analytics__signer-info">
                    <span className="document-analytics__signer-name">{signer.name}</span>
                    <span className="document-analytics__signer-email">{signer.email}</span>
                  </div>
                  <span className="document-analytics__signer-count">
                    {signer.count} signed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent completions */}
        <div className="document-analytics__card">
          <h3 className="document-analytics__card-title">
            <CheckCircle size={16} />
            Recent Completions
          </h3>
          {recentCompletions.length === 0 ? (
            <div className="document-analytics__empty-state">
              No completed documents yet
            </div>
          ) : (
            <div className="document-analytics__completions-list">
              {recentCompletions.map((entry, i) => (
                <div
                  key={`${entry.docName}-${i}`}
                  className="document-analytics__completion-row"
                >
                  <CheckCircle size={14} className="document-analytics__completion-icon" />
                  <span className="document-analytics__completion-name">{entry.docName}</span>
                  <span className="document-analytics__completion-time">
                    {formatRelativeTime(entry.completedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentAnalytics
