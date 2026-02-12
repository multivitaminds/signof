import {
  ArrowRight, CheckCircle2, Loader2, Circle, XCircle,
  Pause, Play, Square,
} from 'lucide-react'
import { Badge } from '../../../../components/ui'
import { AGENT_DEFINITIONS } from '../../lib/agentDefinitions'
import { RunStatus, PipelineStatus } from '../../types'
import type { AgentPipeline } from '../../types'
import './PipelineView.css'

interface PipelineViewProps {
  pipeline: AgentPipeline
  onPause?: () => void
  onResume?: () => void
  onCancel?: () => void
}

const PIPELINE_STATUS_VARIANT: Record<string, 'primary' | 'warning' | 'success' | 'danger' | 'default'> = {
  [PipelineStatus.Draft]: 'default',
  [PipelineStatus.Running]: 'primary',
  [PipelineStatus.Paused]: 'warning',
  [PipelineStatus.Completed]: 'success',
  [PipelineStatus.Failed]: 'danger',
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

export default function PipelineView({ pipeline, onPause, onResume, onCancel }: PipelineViewProps) {
  const completedStages = pipeline.stages.filter(
    s => s.status === RunStatus.Completed
  ).length
  const progressPercent = pipeline.stages.length > 0
    ? (completedStages / pipeline.stages.length) * 100
    : 0

  return (
    <div className="pipeline-view">
      <div className="pipeline-view__header">
        <div className="pipeline-view__info">
          <h4 className="pipeline-view__name">{pipeline.name}</h4>
          {pipeline.description && (
            <p className="pipeline-view__desc">{pipeline.description}</p>
          )}
        </div>
        <div className="pipeline-view__header-right">
          <Badge
            variant={PIPELINE_STATUS_VARIANT[pipeline.status] ?? 'default'}
            size="sm"
            dot
          >
            {pipeline.status}
          </Badge>
          <span className="pipeline-view__duration">
            {formatDuration(pipeline.createdAt, pipeline.completedAt)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="pipeline-view__progress"
        role="progressbar"
        aria-valuenow={completedStages}
        aria-valuemin={0}
        aria-valuemax={pipeline.stages.length}
        aria-label="Pipeline progress"
      >
        <div className="pipeline-view__progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Flow Diagram */}
      <div className="pipeline-view__flow" role="list" aria-label="Pipeline stages">
        {pipeline.stages.map((stage, i) => {
          const def = AGENT_DEFINITIONS.find(d => d.type === stage.agentType)
          const isRunning = stage.status === RunStatus.Running
          const isCompleted = stage.status === RunStatus.Completed
          const isFailed = stage.status === RunStatus.Failed

          let StatusIcon = Circle
          let statusClass = 'pipeline-view__stage--pending'
          if (isRunning) {
            StatusIcon = Loader2
            statusClass = 'pipeline-view__stage--running'
          } else if (isCompleted) {
            StatusIcon = CheckCircle2
            statusClass = 'pipeline-view__stage--completed'
          } else if (isFailed) {
            StatusIcon = XCircle
            statusClass = 'pipeline-view__stage--failed'
          }

          return (
            <div key={stage.id} className="pipeline-view__stage-wrapper" role="listitem">
              <div className={`pipeline-view__stage ${statusClass}`}>
                <div
                  className="pipeline-view__stage-icon"
                  style={{ borderColor: def?.color ?? '#666' }}
                >
                  <StatusIcon
                    size={16}
                    className={isRunning ? 'pipeline-view__spin' : ''}
                    style={{ color: def?.color ?? '#666' }}
                  />
                </div>
                <span className="pipeline-view__stage-label">{def?.label ?? stage.agentType}</span>
                {stage.output && (
                  <span className="pipeline-view__stage-output" title={stage.output}>
                    {stage.output.length > 60 ? `${stage.output.slice(0, 60)}...` : stage.output}
                  </span>
                )}
              </div>
              {i < pipeline.stages.length - 1 && (
                <ArrowRight size={16} className="pipeline-view__arrow" />
              )}
            </div>
          )
        })}
      </div>

      {/* Controls */}
      {(pipeline.status === PipelineStatus.Running || pipeline.status === PipelineStatus.Paused) && (
        <div className="pipeline-view__controls">
          {pipeline.status === PipelineStatus.Running && onPause && (
            <button className="pipeline-view__control-btn" onClick={onPause} aria-label="Pause pipeline">
              <Pause size={14} /> Pause
            </button>
          )}
          {pipeline.status === PipelineStatus.Paused && onResume && (
            <button className="pipeline-view__control-btn pipeline-view__control-btn--primary" onClick={onResume} aria-label="Resume pipeline">
              <Play size={14} /> Resume
            </button>
          )}
          {onCancel && (
            <button className="pipeline-view__control-btn pipeline-view__control-btn--danger" onClick={onCancel} aria-label="Cancel pipeline">
              <Square size={14} /> Cancel
            </button>
          )}
        </div>
      )}
    </div>
  )
}
