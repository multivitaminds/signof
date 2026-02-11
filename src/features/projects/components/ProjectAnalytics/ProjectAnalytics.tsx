import { useMemo, useState } from 'react'
import { BarChart3, TrendingUp, Clock, Users, Activity } from 'lucide-react'
import { useProjectStore } from '../../stores/useProjectStore'
import {
  IssueStatus,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  STATUS_ORDER,
  PRIORITY_ORDER,
} from '../../types'
import type { Label } from '../../types'
import './ProjectAnalytics.css'

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 30) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function ProjectAnalytics() {
  const issues = useProjectStore((s) => s.issues)
  const members = useProjectStore((s) => s.members)
  const projects = useProjectStore((s) => s.projects)

  const allIssues = useMemo(() => Object.values(issues), [issues])

  // ─── Overview Cards ────────────────────────────────────────────────
  const totalIssues = allIssues.length

  const openIssues = useMemo(
    () =>
      allIssues.filter(
        (i) =>
          i.status !== IssueStatus.Done && i.status !== IssueStatus.Cancelled
      ).length,
    [allIssues]
  )

  const [oneWeekAgo] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000)

  const completedThisWeek = useMemo(() => {
    return allIssues.filter(
      (i) =>
        i.status === IssueStatus.Done &&
        new Date(i.updatedAt).getTime() >= oneWeekAgo
    ).length
  }, [allIssues, oneWeekAgo])

  const averageCycleTime = useMemo(() => {
    const doneIssues = allIssues.filter((i) => i.status === IssueStatus.Done)
    if (doneIssues.length === 0) return 0
    const totalDays = doneIssues.reduce((sum, i) => {
      const created = new Date(i.createdAt).getTime()
      const updated = new Date(i.updatedAt).getTime()
      return sum + (updated - created) / (1000 * 60 * 60 * 24)
    }, 0)
    return Math.round((totalDays / doneIssues.length) * 10) / 10
  }, [allIssues])

  // ─── Velocity Chart (last 8 weeks) ────────────────────────────────
  const [snapshotMs] = useState(() => Date.now())

  const velocityData = useMemo(() => {
    const weeks: { label: string; count: number }[] = []

    for (let i = 7; i >= 0; i--) {
      const weekStart = snapshotMs - (i + 1) * 7 * 24 * 60 * 60 * 1000
      const weekEnd = snapshotMs - i * 7 * 24 * 60 * 60 * 1000
      const count = allIssues.filter((issue) => {
        if (issue.status !== IssueStatus.Done) return false
        const updated = new Date(issue.updatedAt).getTime()
        return updated >= weekStart && updated < weekEnd
      }).length

      const weekDate = new Date(weekEnd)
      const label = `${weekDate.getMonth() + 1}/${weekDate.getDate()}`
      weeks.push({ label, count })
    }

    return weeks
  }, [allIssues, snapshotMs])

  const maxVelocity = useMemo(
    () => Math.max(...velocityData.map((w) => w.count), 1),
    [velocityData]
  )

  // ─── Status Distribution ──────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const status of STATUS_ORDER) {
      counts[status] = 0
    }
    for (const issue of allIssues) {
      counts[issue.status] = (counts[issue.status] ?? 0) + 1
    }
    return counts
  }, [allIssues])

  // ─── Priority Breakdown ───────────────────────────────────────────
  const priorityCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const priority of PRIORITY_ORDER) {
      counts[priority] = 0
    }
    for (const issue of allIssues) {
      counts[issue.priority] = (counts[issue.priority] ?? 0) + 1
    }
    return counts
  }, [allIssues])

  const priorityConicGradient = useMemo(() => {
    if (totalIssues === 0) return 'conic-gradient(var(--border-color) 0deg 360deg)'
    const segments: string[] = []
    let currentDeg = 0
    for (const priority of PRIORITY_ORDER) {
      const count = priorityCounts[priority] ?? 0
      if (count === 0) continue
      const deg = (count / totalIssues) * 360
      const config = PRIORITY_CONFIG[priority]
      segments.push(`${config.color} ${currentDeg}deg ${currentDeg + deg}deg`)
      currentDeg += deg
    }
    if (segments.length === 0) return 'conic-gradient(var(--border-color) 0deg 360deg)'
    return `conic-gradient(${segments.join(', ')})`
  }, [priorityCounts, totalIssues])

  // ─── Activity Timeline ────────────────────────────────────────────
  const recentActivity = useMemo(() => {
    const activities: {
      id: string
      issueIdentifier: string
      issueTitle: string
      action: string
      timestamp: string
    }[] = []

    const sortedIssues = [...allIssues].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    for (const issue of sortedIssues.slice(0, 10)) {
      const statusLabel = STATUS_CONFIG[issue.status].label
      const isNew = issue.createdAt === issue.updatedAt
      activities.push({
        id: issue.id,
        issueIdentifier: issue.identifier,
        issueTitle: issue.title,
        action: isNew ? 'Created' : `Moved to ${statusLabel}`,
        timestamp: issue.updatedAt,
      })
    }

    return activities
  }, [allIssues])

  // ─── Team Workload ────────────────────────────────────────────────
  const teamWorkload = useMemo(() => {
    const assignedCounts: Record<string, number> = {}
    for (const issue of allIssues) {
      if (issue.assigneeId) {
        assignedCounts[issue.assigneeId] =
          (assignedCounts[issue.assigneeId] ?? 0) + 1
      }
    }
    const memberList = members
      .map((m) => ({
        id: m.id,
        name: m.name,
        count: assignedCounts[m.id] ?? 0,
      }))
      .sort((a, b) => b.count - a.count)

    return memberList
  }, [allIssues, members])

  const maxWorkload = useMemo(
    () => Math.max(...teamWorkload.map((m) => m.count), 1),
    [teamWorkload]
  )

  // ─── Burndown Indicator ───────────────────────────────────────────
  const completedCount = useMemo(
    () => allIssues.filter((i) => i.status === IssueStatus.Done).length,
    [allIssues]
  )
  const remainingCount = totalIssues - completedCount
  const completionPercent =
    totalIssues > 0 ? (completedCount / totalIssues) * 100 : 0

  // ─── Labels Cloud ─────────────────────────────────────────────────
  const labelCloud = useMemo(() => {
    const labelMap = new Map<string, Label>()
    for (const project of Object.values(projects)) {
      for (const label of project.labels) {
        labelMap.set(label.id, label)
      }
    }

    const labelCounts: Record<string, number> = {}
    for (const issue of allIssues) {
      for (const labelId of issue.labelIds) {
        labelCounts[labelId] = (labelCounts[labelId] ?? 0) + 1
      }
    }

    return Object.entries(labelCounts)
      .map(([labelId, count]) => {
        const label = labelMap.get(labelId)
        if (!label) return null
        return { ...label, count }
      })
      .filter((l): l is Label & { count: number } => l !== null)
      .sort((a, b) => b.count - a.count)
  }, [allIssues, projects])

  // ─── Unassigned count for status bar tooltip ──────────────────────
  const unassignedCount = useMemo(
    () => allIssues.filter((i) => !i.assigneeId).length,
    [allIssues]
  )

  return (
    <div className="project-analytics">
      {/* ─── Overview Cards ──────────────────────────────────────── */}
      <div className="project-analytics__cards">
        <div className="project-analytics__card">
          <div className="project-analytics__card-icon project-analytics__card-icon--total">
            <BarChart3 size={20} />
          </div>
          <div className="project-analytics__card-body">
            <span className="project-analytics__card-value">{totalIssues}</span>
            <span className="project-analytics__card-label">Total Issues</span>
          </div>
        </div>

        <div className="project-analytics__card">
          <div className="project-analytics__card-icon project-analytics__card-icon--open">
            <Activity size={20} />
          </div>
          <div className="project-analytics__card-body">
            <span className="project-analytics__card-value">{openIssues}</span>
            <span className="project-analytics__card-label">Open Issues</span>
          </div>
        </div>

        <div className="project-analytics__card">
          <div className="project-analytics__card-icon project-analytics__card-icon--completed">
            <TrendingUp size={20} />
          </div>
          <div className="project-analytics__card-body">
            <span className="project-analytics__card-value">
              {completedThisWeek}
            </span>
            <span className="project-analytics__card-label">
              Completed This Week
            </span>
          </div>
        </div>

        <div className="project-analytics__card">
          <div className="project-analytics__card-icon project-analytics__card-icon--cycle">
            <Clock size={20} />
          </div>
          <div className="project-analytics__card-body">
            <span className="project-analytics__card-value">
              {averageCycleTime}
              <span className="project-analytics__card-unit">days</span>
            </span>
            <span className="project-analytics__card-label">
              Avg Cycle Time
            </span>
          </div>
        </div>
      </div>

      {/* ─── Velocity Chart ─────────────────────────────────────── */}
      <div className="project-analytics__section">
        <h3 className="project-analytics__section-title">
          <TrendingUp size={16} />
          Issue Velocity (Last 8 Weeks)
        </h3>
        <div className="project-analytics__velocity">
          {velocityData.map((week, idx) => (
            <div key={idx} className="project-analytics__velocity-col">
              <div className="project-analytics__velocity-bar-track">
                <div
                  className="project-analytics__velocity-bar"
                  style={{ height: `${(week.count / maxVelocity) * 100}%` }}
                  title={`${week.count} issues completed`}
                  aria-label={`Week of ${week.label}: ${week.count} issues`}
                />
              </div>
              <span className="project-analytics__velocity-count">{week.count}</span>
              <span className="project-analytics__velocity-label">{week.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Charts Row ──────────────────────────────────────────── */}
      <div className="project-analytics__charts">
        {/* Status Distribution */}
        <div className="project-analytics__section">
          <h3 className="project-analytics__section-title">
            Status Distribution
          </h3>
          <div className="project-analytics__status-bar">
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] ?? 0
              if (count === 0) return null
              const percent = (count / totalIssues) * 100
              const config = STATUS_CONFIG[status]
              return (
                <div
                  key={status}
                  className="project-analytics__status-segment"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: config.color,
                  }}
                  title={`${config.label}: ${count}`}
                  aria-label={`${config.label}: ${count} issues`}
                />
              )
            })}
          </div>
          <div className="project-analytics__status-legend">
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] ?? 0
              if (count === 0) return null
              const config = STATUS_CONFIG[status]
              return (
                <div key={status} className="project-analytics__legend-item">
                  <span
                    className="project-analytics__legend-dot"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="project-analytics__legend-label">
                    {config.label}
                  </span>
                  <span className="project-analytics__legend-count">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="project-analytics__section">
          <h3 className="project-analytics__section-title">
            Priority Breakdown
          </h3>
          <div className="project-analytics__donut-wrap">
            <div
              className="project-analytics__donut"
              style={{ background: priorityConicGradient }}
              role="img"
              aria-label="Priority distribution chart"
            >
              <div className="project-analytics__donut-hole">
                <span className="project-analytics__donut-total">
                  {totalIssues}
                </span>
                <span className="project-analytics__donut-sub">issues</span>
              </div>
            </div>
            <div className="project-analytics__donut-legend">
              {PRIORITY_ORDER.map((priority) => {
                const count = priorityCounts[priority] ?? 0
                if (count === 0) return null
                const config = PRIORITY_CONFIG[priority]
                return (
                  <div
                    key={priority}
                    className="project-analytics__legend-item"
                  >
                    <span
                      className="project-analytics__legend-dot"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="project-analytics__legend-label">
                      {config.label}
                    </span>
                    <span className="project-analytics__legend-count">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Second Row ──────────────────────────────────────────── */}
      <div className="project-analytics__row">
        {/* Activity Timeline */}
        <div className="project-analytics__section">
          <h3 className="project-analytics__section-title">
            <Activity size={16} />
            Recent Activity
          </h3>
          <div className="project-analytics__timeline">
            {recentActivity.length === 0 && (
              <p className="project-analytics__empty">No recent activity.</p>
            )}
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="project-analytics__timeline-item"
              >
                <div className="project-analytics__timeline-dot" />
                <div className="project-analytics__timeline-content">
                  <div className="project-analytics__timeline-header">
                    <span className="project-analytics__timeline-id">
                      {activity.issueIdentifier}
                    </span>
                    <span className="project-analytics__timeline-action">
                      {activity.action}
                    </span>
                  </div>
                  <p className="project-analytics__timeline-title">
                    {activity.issueTitle}
                  </p>
                  <span className="project-analytics__timeline-time">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload */}
        <div className="project-analytics__section">
          <h3 className="project-analytics__section-title">
            <Users size={16} />
            Team Workload
          </h3>
          <div className="project-analytics__workload">
            {teamWorkload.map((member) => (
              <div key={member.id} className="project-analytics__workload-row">
                <span className="project-analytics__workload-name">
                  {member.name}
                </span>
                <div className="project-analytics__workload-bar-track">
                  <div
                    className="project-analytics__workload-bar-fill"
                    style={{
                      width: `${(member.count / maxWorkload) * 100}%`,
                    }}
                  />
                </div>
                <span className="project-analytics__workload-count">
                  {member.count}
                </span>
              </div>
            ))}
            {unassignedCount > 0 && (
              <div className="project-analytics__workload-row project-analytics__workload-row--unassigned">
                <span className="project-analytics__workload-name">
                  Unassigned
                </span>
                <div className="project-analytics__workload-bar-track">
                  <div
                    className="project-analytics__workload-bar-fill project-analytics__workload-bar-fill--unassigned"
                    style={{
                      width: `${(unassignedCount / maxWorkload) * 100}%`,
                    }}
                  />
                </div>
                <span className="project-analytics__workload-count">
                  {unassignedCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Third Row ───────────────────────────────────────────── */}
      <div className="project-analytics__row">
        {/* Burndown Indicator */}
        <div className="project-analytics__section project-analytics__section--burndown">
          <h3 className="project-analytics__section-title">
            <TrendingUp size={16} />
            Burndown
          </h3>
          <div className="project-analytics__burndown">
            <div className="project-analytics__progress-ring">
              <svg
                viewBox="0 0 120 120"
                className="project-analytics__ring-svg"
                aria-label={`${Math.round(completionPercent)}% complete`}
                role="img"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="project-analytics__ring-bg"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="project-analytics__ring-fill"
                  strokeDasharray={`${(completionPercent / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                  strokeDashoffset="0"
                />
              </svg>
              <div className="project-analytics__ring-label">
                <span className="project-analytics__ring-percent">
                  {Math.round(completionPercent)}%
                </span>
              </div>
            </div>
            <div className="project-analytics__burndown-stats">
              <div className="project-analytics__burndown-stat">
                <span className="project-analytics__burndown-value project-analytics__burndown-value--done">
                  {completedCount}
                </span>
                <span className="project-analytics__burndown-label">
                  completed
                </span>
              </div>
              <div className="project-analytics__burndown-stat">
                <span className="project-analytics__burndown-value project-analytics__burndown-value--remaining">
                  {remainingCount}
                </span>
                <span className="project-analytics__burndown-label">
                  remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Labels Cloud */}
        <div className="project-analytics__section">
          <h3 className="project-analytics__section-title">Labels</h3>
          <div className="project-analytics__labels">
            {labelCloud.length === 0 && (
              <p className="project-analytics__empty">No labels used yet.</p>
            )}
            {labelCloud.map((label) => (
              <span
                key={label.id}
                className="project-analytics__label-pill"
                style={{
                  backgroundColor: `${label.color}20`,
                  color: label.color,
                  borderColor: `${label.color}40`,
                }}
              >
                {label.name}
                <span className="project-analytics__label-count">
                  {label.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
