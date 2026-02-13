import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X, TrendingUp, TrendingDown, Minus,
  ArrowRight, ExternalLink,
  FileText, BookOpen, Database, BarChart3, Brain,
  Zap, Share2, Code2, Shield, ShieldCheck, Server,
  Globe, Calendar, Users, DollarSign, FolderOpen,
  ClipboardList, PenTool, CheckSquare, Palette, Bell,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AgentRun } from '../../types'
import { getStructuredResult } from '../../lib/structuredRunResults'
import { AGENT_DEFINITIONS } from '../../lib/agentDefinitions'
import './RunResultsModal.css'

interface RunResultsModalProps {
  run: AgentRun
  onClose: () => void
}

const ICON_MAP: Record<string, LucideIcon> = {
  FileText, BookOpen, Database, BarChart3, Brain,
  Zap, Share2, Code2, Shield, ShieldCheck, Server,
  Globe, Calendar, Users, DollarSign, FolderOpen,
  ClipboardList, PenTool, CheckSquare, Palette, Bell,
}

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? FileText
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  const start = new Date(startedAt).getTime()
  const end = completedAt ? new Date(completedAt).getTime() : Date.now()
  const diffMs = end - start
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

const PRIORITY_CLASS: Record<string, string> = {
  high: 'run-results__action--high',
  medium: 'run-results__action--medium',
  low: 'run-results__action--low',
}

export default function RunResultsModal({ run, onClose }: RunResultsModalProps) {
  const navigate = useNavigate()
  const result = getStructuredResult(run.agentType)
  const agentDef = AGENT_DEFINITIONS.find(a => a.type === run.agentType)

  const handleNavigate = useCallback((link: string) => {
    onClose()
    navigate(link)
  }, [navigate, onClose])

  const handleOverlayClick = useCallback(() => {
    onClose()
  }, [onClose])

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <div className="run-results__overlay" onClick={handleOverlayClick} role="dialog" aria-label="Run results" aria-modal="true">
      <div className="run-results__modal" onClick={handleModalClick}>
        {/* Header */}
        <div className="run-results__header">
          <div className="run-results__header-info">
            <div className="run-results__header-top">
              <h3 className="run-results__title">Run Results</h3>
              {agentDef && (
                <span className="run-results__agent-badge" style={{ color: agentDef.color, borderColor: agentDef.color }}>
                  {agentDef.label}
                </span>
              )}
            </div>
            <span className="run-results__task">{run.task}</span>
          </div>
          <button className="run-results__close" onClick={onClose} aria-label="Close results">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="run-results__body">
          {/* Summary */}
          <p className="run-results__summary">{result.summary}</p>

          {/* Metrics Grid */}
          {result.metrics.length > 0 && (
            <div className="run-results__metrics" aria-label="Result metrics">
              {result.metrics.map((metric) => (
                <div key={metric.label} className="run-results__metric-card">
                  <span className="run-results__metric-value" style={{ color: metric.color }}>
                    {metric.value}
                    {metric.trend === 'up' && <TrendingUp size={14} className="run-results__trend run-results__trend--up" />}
                    {metric.trend === 'down' && <TrendingDown size={14} className="run-results__trend run-results__trend--down" />}
                    {metric.trend === 'neutral' && <Minus size={14} className="run-results__trend run-results__trend--neutral" />}
                  </span>
                  <span className="run-results__metric-label">{metric.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Items */}
          {result.actions.length > 0 && (
            <div className="run-results__section">
              <h4 className="run-results__section-title">Action Items</h4>
              <div className="run-results__actions" role="list" aria-label="Action items">
                {result.actions.map((action) => {
                  const ActionIcon = getIcon(action.icon)
                  return (
                    <button
                      key={action.label}
                      className={`run-results__action ${PRIORITY_CLASS[action.priority] ?? ''}`}
                      onClick={() => handleNavigate(action.link)}
                      role="listitem"
                    >
                      <div className="run-results__action-icon">
                        <ActionIcon size={16} />
                      </div>
                      <div className="run-results__action-content">
                        <span className="run-results__action-label">{action.label}</span>
                        <span className="run-results__action-desc">{action.description}</span>
                      </div>
                      <div className="run-results__action-priority">
                        <span className={`run-results__priority-badge run-results__priority-badge--${action.priority}`}>
                          {action.priority}
                        </span>
                      </div>
                      <ArrowRight size={14} className="run-results__action-arrow" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="run-results__section">
              <h4 className="run-results__section-title">Explore More</h4>
              <div className="run-results__suggestions">
                {result.suggestions.map((suggestion) => {
                  const SugIcon = getIcon(suggestion.icon)
                  return (
                    <div key={suggestion.title} className="run-results__suggestion-card">
                      <div className="run-results__suggestion-header">
                        <SugIcon size={16} className="run-results__suggestion-icon" />
                        <span className="run-results__suggestion-title">{suggestion.title}</span>
                      </div>
                      <p className="run-results__suggestion-desc">{suggestion.description}</p>
                      <button
                        className="run-results__suggestion-btn"
                        onClick={() => handleNavigate(suggestion.link)}
                      >
                        {suggestion.buttonLabel}
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="run-results__footer">
          <span className="run-results__meta">
            Completed {run.completedAt ? new Date(run.completedAt).toLocaleString() : ''} | Duration: {formatDuration(run.startedAt, run.completedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
