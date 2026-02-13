import { Play, Pause, Square, MessageSquare } from 'lucide-react'
import { Badge } from '../../../../components/ui'
import { AGENT_DEFINITIONS } from '../../lib/agentDefinitions'
import { STEP_ICON, STEP_CLASS, RUN_STATUS_VARIANT } from '../../lib/agentIcons'
import { RunStatus, StepStatus } from '../../types'
import type { AgentRun, RunStep } from '../../types'
import './ActiveRunsPanel.css'

interface ActiveRunsPanelProps {
  runs: AgentRun[]
  chatRunId: string | null
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  onChat: (id: string) => void
}

export default function ActiveRunsPanel({
  runs,
  chatRunId,
  onPause,
  onResume,
  onCancel,
  onChat,
}: ActiveRunsPanelProps) {
  if (runs.length === 0) return null

  return (
    <section className="copilot-agents__active-runs" aria-label="Active agent runs">
      <h3 className="copilot-agents__section-title">Active Runs</h3>
      <div className="copilot-agents__runs-list">
        {runs.map((run) => {
          const agentDef = AGENT_DEFINITIONS.find(a => a.type === run.agentType)
          const completedSteps = run.steps.filter(s => s.status === StepStatus.Completed).length
          const progressPercent = run.steps.length > 0
            ? (completedSteps / run.steps.length) * 100
            : 0

          return (
            <div key={run.id} className="copilot-agents__run-card">
              <div className="copilot-agents__run-header">
                <div className="copilot-agents__run-info">
                  <span className="copilot-agents__run-agent">{agentDef?.label ?? run.agentType} Agent</span>
                  <span className="copilot-agents__run-task">{run.task}</span>
                </div>
                <Badge variant={RUN_STATUS_VARIANT[run.status]} size="sm" dot>
                  {run.status}
                </Badge>
              </div>

              <div className="copilot-agents__progress-bar" role="progressbar" aria-valuenow={completedSteps} aria-valuemin={0} aria-valuemax={run.steps.length} aria-label="Run progress">
                <div className="copilot-agents__progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="copilot-agents__steps" role="list" aria-label="Run steps">
                {run.steps.map((step: RunStep) => {
                  const StepIcon = STEP_ICON[step.status]
                  return (
                    <div key={step.id} className={`copilot-agents__step copilot-agents__step--${step.status}`} role="listitem">
                      <StepIcon size={16} className={`copilot-agents__step-icon ${STEP_CLASS[step.status]}`} />
                      <div className="copilot-agents__step-content">
                        <span className="copilot-agents__step-label">{step.label}</span>
                        {step.output && (
                          <span className="copilot-agents__step-output">{step.output}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="copilot-agents__run-controls">
                {run.status === RunStatus.Running && (
                  <button className="copilot-agents__control-btn" onClick={() => onPause(run.id)} aria-label="Pause run">
                    <Pause size={14} /> Pause
                  </button>
                )}
                {run.status === RunStatus.Paused && (
                  <button className="copilot-agents__control-btn copilot-agents__control-btn--primary" onClick={() => onResume(run.id)} aria-label="Resume run">
                    <Play size={14} /> Resume
                  </button>
                )}
                <button className="copilot-agents__control-btn copilot-agents__control-btn--danger" onClick={() => onCancel(run.id)} aria-label="Cancel run">
                  <Square size={14} /> Cancel
                </button>
                <button className="copilot-agents__control-btn" onClick={() => onChat(run.id)} aria-label="Chat with agent">
                  <MessageSquare size={14} /> Chat
                </button>
              </div>

              {chatRunId === run.id && (
                <div className="copilot-agents__chat-placeholder">
                  <p className="copilot-agents__chat-note">Chat with this agent during its run. The agent is currently working on: {run.task}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
