import { useCallback } from 'react'
import { Lightbulb, Info, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../../../components/ui'
import type { MemoryCategory, MemoryInsight } from '../../types'
import { CATEGORY_META } from '../../lib/memoryTemplates'
import { Gavel, GitBranch, Settings, Users, FolderOpen, BookOpen } from 'lucide-react'
import './MemoryInsightsPanel.css'

interface MemoryInsightsPanelProps {
  categoryStats: Array<{ category: MemoryCategory; count: number; tokenCount: number }>
  insights: MemoryInsight[]
  onActionClick?: (insight: MemoryInsight) => void
}

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Gavel,
  GitBranch,
  Settings,
  Users,
  FolderOpen,
  BookOpen,
}

const INSIGHT_ICON_MAP: Record<MemoryInsight['type'], LucideIcon> = {
  suggestion: Lightbulb,
  coverage: Info,
  stale: Clock,
}

export default function MemoryInsightsPanel({ categoryStats, insights, onActionClick }: MemoryInsightsPanelProps) {
  const maxCount = Math.max(...categoryStats.map((s) => s.count), 1)

  const handleActionClick = useCallback(
    (insight: MemoryInsight) => {
      onActionClick?.(insight)
    },
    [onActionClick]
  )

  return (
    <aside className="memory-insights" aria-labelledby="memory-insights-title">
      <h2 className="memory-insights__title" id="memory-insights-title">Insights</h2>

      <div className="memory-insights__coverage">
        <h3 className="memory-insights__section-label">Coverage</h3>
        {CATEGORY_META.map((meta) => {
          const stat = categoryStats.find((s) => s.category === meta.key)
          const count = stat?.count ?? 0
          const fillPercent = (count / maxCount) * 100
          const IconComponent = CATEGORY_ICON_MAP[meta.icon]

          return (
            <div key={meta.key} className="memory-insights__bar" role="group" aria-label={`${meta.label}: ${count}`}>
              <div className="memory-insights__bar-label">
                {IconComponent && <IconComponent size={14} aria-hidden="true" />}
                <span>{meta.label}</span>
              </div>
              <div className="memory-insights__bar-track">
                <div
                  className="memory-insights__bar-fill"
                  style={{ width: `${fillPercent}%`, backgroundColor: meta.color }}
                  role="meter"
                  aria-valuenow={count}
                  aria-valuemin={0}
                  aria-valuemax={maxCount}
                  aria-label={`${meta.label} count`}
                />
              </div>
              <span className="memory-insights__bar-count">{count}</span>
            </div>
          )
        })}
      </div>

      {insights.length > 0 && (
        <div className="memory-insights__suggestions">
          <h3 className="memory-insights__section-label">Suggestions</h3>
          {insights.map((insight, index) => {
            const InsightIcon = INSIGHT_ICON_MAP[insight.type]

            return (
              <div key={index} className={`memory-insights__suggestion memory-insights__suggestion--${insight.type}`}>
                <div className="memory-insights__suggestion-header">
                  <InsightIcon size={16} aria-hidden="true" />
                  <span className="memory-insights__suggestion-title">{insight.title}</span>
                </div>
                <p className="memory-insights__suggestion-description">{insight.description}</p>
                {insight.action && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleActionClick(insight)}
                  >
                    {insight.action.label}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </aside>
  )
}
