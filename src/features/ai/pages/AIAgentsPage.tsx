import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  Search, PenTool, Code2, Palette, BarChart3,
  ClipboardList, Mail, Settings,
  Play, Pause, Square, MessageSquare,
  ChevronDown, ChevronUp,
  CheckCircle2, Loader2, Circle, XCircle, Clock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '../../../components/ui'
import useAIAgentStore from '../stores/useAIAgentStore'
import { RunStatus, StepStatus } from '../types'
import type { AgentType, AgentRun, RunStep } from '../types'
import './AIAgentsPage.css'

// ─── Agent Type Definitions (8 agents as requested) ────────────────

interface AgentTypeCard {
  type: AgentType
  name: string
  description: string
  icon: LucideIcon
  color: string
}

const AGENT_TYPE_CARDS: AgentTypeCard[] = [
  {
    type: 'researcher' as AgentType,
    name: 'Research Agent',
    description: 'Gathers information, analyzes data, produces reports',
    icon: Search,
    color: '#0891B2',
  },
  {
    type: 'writer' as AgentType,
    name: 'Writing Agent',
    description: 'Drafts documents, emails, proposals, blog posts',
    icon: PenTool,
    color: '#7C3AED',
  },
  {
    type: 'developer' as AgentType,
    name: 'Code Agent',
    description: 'Writes code, reviews PRs, fixes bugs, runs tests',
    icon: Code2,
    color: '#F59E0B',
  },
  {
    type: 'designer' as AgentType,
    name: 'Design Agent',
    description: 'Creates wireframes, suggests UI improvements, generates assets',
    icon: Palette,
    color: '#EC4899',
  },
  {
    type: 'analyst' as AgentType,
    name: 'Data Agent',
    description: 'Analyzes spreadsheets, creates charts, finds patterns',
    icon: BarChart3,
    color: '#059669',
  },
  {
    type: 'planner' as AgentType,
    name: 'Planning Agent',
    description: 'Breaks down projects, creates timelines, assigns tasks',
    icon: ClipboardList,
    color: '#4F46E5',
  },
  {
    type: 'coordinator' as AgentType,
    name: 'Communication Agent',
    description: 'Drafts emails, schedules meetings, manages inbox',
    icon: Mail,
    color: '#6366F1',
  },
  {
    type: 'reviewer' as AgentType,
    name: 'Operations Agent',
    description: 'Monitors systems, manages deployments, tracks KPIs',
    icon: Settings,
    color: '#DC2626',
  },
]

// ─── Step Status Icons ────────────────────────────────────────────

const STEP_ICON: Record<StepStatus, LucideIcon> = {
  [StepStatus.Pending]: Circle,
  [StepStatus.Running]: Loader2,
  [StepStatus.Completed]: CheckCircle2,
  [StepStatus.Error]: XCircle,
}

const STEP_CLASS: Record<StepStatus, string> = {
  [StepStatus.Pending]: 'ai-agents__step-icon--pending',
  [StepStatus.Running]: 'ai-agents__step-icon--running',
  [StepStatus.Completed]: 'ai-agents__step-icon--completed',
  [StepStatus.Error]: 'ai-agents__step-icon--error',
}

const RUN_STATUS_VARIANT: Record<RunStatus, 'primary' | 'warning' | 'success' | 'danger' | 'default'> = {
  [RunStatus.Running]: 'primary',
  [RunStatus.Paused]: 'warning',
  [RunStatus.Completed]: 'success',
  [RunStatus.Cancelled]: 'default',
  [RunStatus.Failed]: 'danger',
}

// ─── Helper ────────────────────────────────────────────────────────

function formatDuration(startedAt: string, completedAt: string | null): string {
  const start = new Date(startedAt).getTime()
  const end = completedAt ? new Date(completedAt).getTime() : Date.now()
  const diffMs = end - start
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

function formatRelativeDate(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return 'just now'
}

// ─── Component ─────────────────────────────────────────────────────

export default function AIAgentsPage() {
  const runs = useAIAgentStore((s) => s.runs)
  const lastRunByAgent = useAIAgentStore((s) => s.lastRunByAgent)
  const startAgent = useAIAgentStore((s) => s.startAgent)
  const updateRunStep = useAIAgentStore((s) => s.updateRunStep)
  const cancelRun = useAIAgentStore((s) => s.cancelRun)
  const pauseRun = useAIAgentStore((s) => s.pauseRun)
  const resumeRun = useAIAgentStore((s) => s.resumeRun)

  const [runTaskInputs, setRunTaskInputs] = useState<Record<string, string>>({})
  const [showHistory, setShowHistory] = useState(false)
  const [chatRunId, setChatRunId] = useState<string | null>(null)
  const simulationTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of simulationTimers.current.values()) {
        clearTimeout(timer)
      }
    }
  }, [])

  const activeRuns = useMemo(
    () => runs.filter(r => r.status === RunStatus.Running || r.status === RunStatus.Paused),
    [runs],
  )

  const completedRuns = useMemo(
    () => runs.filter(r =>
      r.status === RunStatus.Completed ||
      r.status === RunStatus.Cancelled ||
      r.status === RunStatus.Failed
    ),
    [runs],
  )

  const simulateSteps = useCallback((run: AgentRun) => {
    let stepIndex = 0

    function processNextStep() {
      if (stepIndex >= run.steps.length) return

      // Mark current step running
      updateRunStep(run.id, stepIndex, StepStatus.Running as typeof StepStatus.Running)

      const delay = 1500 + Math.random() * 2000
      const timerId = setTimeout(() => {
        updateRunStep(run.id, stepIndex, StepStatus.Completed as typeof StepStatus.Completed)
        stepIndex++
        if (stepIndex < run.steps.length) {
          processNextStep()
        }
        simulationTimers.current.delete(`${run.id}-${stepIndex - 1}`)
      }, delay)

      simulationTimers.current.set(`${run.id}-${stepIndex}`, timerId)
    }

    processNextStep()
  }, [updateRunStep])

  const handleRun = useCallback((agentType: AgentType) => {
    const task = runTaskInputs[agentType] || `Default task for ${agentType}`
    const run = startAgent(agentType, task)
    setRunTaskInputs(prev => ({ ...prev, [agentType]: '' }))
    simulateSteps(run)
  }, [runTaskInputs, startAgent, simulateSteps])

  const handleTaskInputChange = useCallback((agentType: AgentType, value: string) => {
    setRunTaskInputs(prev => ({ ...prev, [agentType]: value }))
  }, [])

  const handlePause = useCallback((runId: string) => {
    pauseRun(runId)
    // Clear simulation timers for this run
    for (const [key, timer] of simulationTimers.current.entries()) {
      if (key.startsWith(runId)) {
        clearTimeout(timer)
        simulationTimers.current.delete(key)
      }
    }
  }, [pauseRun])

  const handleResume = useCallback((runId: string) => {
    resumeRun(runId)
    const run = runs.find(r => r.id === runId)
    if (run) {
      // Find next pending step and continue
      const nextPending = run.steps.findIndex(s => s.status === StepStatus.Pending || s.status === StepStatus.Running)
      if (nextPending >= 0) {
        const resumeRun_: AgentRun = { ...run, status: RunStatus.Running as typeof RunStatus.Running }
        simulateSteps(resumeRun_)
      }
    }
  }, [resumeRun, runs, simulateSteps])

  const handleCancel = useCallback((runId: string) => {
    cancelRun(runId)
    // Clear all timers for this run
    for (const [key, timer] of simulationTimers.current.entries()) {
      if (key.startsWith(runId)) {
        clearTimeout(timer)
        simulationTimers.current.delete(key)
      }
    }
  }, [cancelRun])

  const handleChat = useCallback((runId: string) => {
    setChatRunId(chatRunId === runId ? null : runId)
  }, [chatRunId])

  const toggleHistory = useCallback(() => {
    setShowHistory(prev => !prev)
  }, [])

  return (
    <div className="ai-agents">
      <div className="ai-agents__header">
        <h2 className="ai-agents__title">Agent Teams</h2>
        <p className="ai-agents__subtitle">
          Run specialized AI agents on any task
        </p>
      </div>

      {/* Agent Type Cards Grid */}
      <div className="ai-agents__grid">
        {AGENT_TYPE_CARDS.map((agent) => {
          const IconComp = agent.icon
          const lastRun = lastRunByAgent[agent.type]
          return (
            <div key={agent.type} className="ai-agents__card" style={{ borderTopColor: agent.color }}>
              <div className="ai-agents__card-header">
                <div className="ai-agents__card-icon" style={{ color: agent.color }}>
                  <IconComp size={24} />
                </div>
                <div className="ai-agents__card-info">
                  <h3 className="ai-agents__card-name">{agent.name}</h3>
                  <p className="ai-agents__card-desc">{agent.description}</p>
                </div>
              </div>
              <div className="ai-agents__card-input-row">
                <input
                  className="ai-agents__card-task-input"
                  type="text"
                  placeholder="Describe the task..."
                  value={runTaskInputs[agent.type] ?? ''}
                  onChange={(e) => handleTaskInputChange(agent.type, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRun(agent.type)
                  }}
                  aria-label={`Task for ${agent.name}`}
                />
                <button
                  className="ai-agents__run-btn"
                  onClick={() => handleRun(agent.type)}
                  style={{ backgroundColor: agent.color }}
                  aria-label={`Run ${agent.name}`}
                >
                  <Play size={14} />
                  Run
                </button>
              </div>
              {lastRun && (
                <span className="ai-agents__card-last-run">
                  <Clock size={12} />
                  Last run: {formatRelativeDate(lastRun)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Active Runs Panel */}
      {activeRuns.length > 0 && (
        <section className="ai-agents__active-runs" aria-label="Active agent runs">
          <h3 className="ai-agents__section-title">Active Runs</h3>
          <div className="ai-agents__runs-list">
            {activeRuns.map((run) => {
              const agentDef = AGENT_TYPE_CARDS.find(a => a.type === run.agentType)
              const completedSteps = run.steps.filter(s => s.status === StepStatus.Completed).length
              const progressPercent = run.steps.length > 0
                ? (completedSteps / run.steps.length) * 100
                : 0

              return (
                <div key={run.id} className="ai-agents__run-card">
                  <div className="ai-agents__run-header">
                    <div className="ai-agents__run-info">
                      <span className="ai-agents__run-agent">{agentDef?.name ?? run.agentType}</span>
                      <span className="ai-agents__run-task">{run.task}</span>
                    </div>
                    <Badge variant={RUN_STATUS_VARIANT[run.status]} size="sm" dot>
                      {run.status}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="ai-agents__progress-bar" role="progressbar" aria-valuenow={completedSteps} aria-valuemin={0} aria-valuemax={run.steps.length} aria-label="Run progress">
                    <div className="ai-agents__progress-fill" style={{ width: `${progressPercent}%` }} />
                  </div>

                  {/* Steps */}
                  <div className="ai-agents__steps" role="list" aria-label="Run steps">
                    {run.steps.map((step: RunStep) => {
                      const StepIcon = STEP_ICON[step.status]
                      return (
                        <div key={step.id} className={`ai-agents__step ai-agents__step--${step.status}`} role="listitem">
                          <StepIcon size={16} className={`ai-agents__step-icon ${STEP_CLASS[step.status]}`} />
                          <span className="ai-agents__step-label">{step.label}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Run Controls */}
                  <div className="ai-agents__run-controls">
                    {run.status === RunStatus.Running && (
                      <button className="ai-agents__control-btn" onClick={() => handlePause(run.id)} aria-label="Pause run">
                        <Pause size={14} /> Pause
                      </button>
                    )}
                    {run.status === RunStatus.Paused && (
                      <button className="ai-agents__control-btn ai-agents__control-btn--primary" onClick={() => handleResume(run.id)} aria-label="Resume run">
                        <Play size={14} /> Resume
                      </button>
                    )}
                    <button className="ai-agents__control-btn ai-agents__control-btn--danger" onClick={() => handleCancel(run.id)} aria-label="Cancel run">
                      <Square size={14} /> Cancel
                    </button>
                    <button className="ai-agents__control-btn" onClick={() => handleChat(run.id)} aria-label="Chat with agent">
                      <MessageSquare size={14} /> Chat
                    </button>
                  </div>

                  {chatRunId === run.id && (
                    <div className="ai-agents__chat-placeholder">
                      <p className="ai-agents__chat-note">Chat with this agent during its run. The agent is currently working on: {run.task}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Run History */}
      {completedRuns.length > 0 && (
        <section className="ai-agents__history" aria-label="Agent run history">
          <button className="ai-agents__history-toggle" onClick={toggleHistory} aria-expanded={showHistory}>
            <h3 className="ai-agents__section-title">Run History ({completedRuns.length})</h3>
            {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showHistory && (
            <div className="ai-agents__history-table-wrap">
              <table className="ai-agents__history-table" role="table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {completedRuns.map((run) => {
                    const agentDef = AGENT_TYPE_CARDS.find(a => a.type === run.agentType)
                    return (
                      <tr key={run.id}>
                        <td>{agentDef?.name ?? run.agentType}</td>
                        <td className="ai-agents__history-task">{run.task}</td>
                        <td>
                          <Badge variant={RUN_STATUS_VARIANT[run.status]} size="sm">
                            {run.status}
                          </Badge>
                        </td>
                        <td>{formatDuration(run.startedAt, run.completedAt)}</td>
                        <td>{new Date(run.startedAt).toLocaleDateString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
