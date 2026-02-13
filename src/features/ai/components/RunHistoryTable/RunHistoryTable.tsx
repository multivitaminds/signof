import { ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { Badge } from '../../../../components/ui'
import { AGENT_DEFINITIONS } from '../../lib/agentDefinitions'
import { RUN_STATUS_VARIANT, formatDuration } from '../../lib/agentIcons'
import { RunStatus } from '../../types'
import type { AgentRun } from '../../types'
import './RunHistoryTable.css'

interface RunHistoryTableProps {
  runs: AgentRun[]
  showHistory: boolean
  onToggleHistory: () => void
  onViewResult: (runId: string) => void
}

export default function RunHistoryTable({
  runs,
  showHistory,
  onToggleHistory,
  onViewResult,
}: RunHistoryTableProps) {
  if (runs.length === 0) return null

  return (
    <section className="copilot-agents__history" aria-label="Agent run history">
      <button className="copilot-agents__history-toggle" onClick={onToggleHistory} aria-expanded={showHistory}>
        <h3 className="copilot-agents__section-title">Run History ({runs.length})</h3>
        {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {showHistory && (
        <div className="copilot-agents__history-table-wrap">
          <table className="copilot-agents__history-table" role="table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Task</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const agentDef = AGENT_DEFINITIONS.find(a => a.type === run.agentType)
                return (
                  <tr key={run.id}>
                    <td>{agentDef?.label ?? run.agentType} Agent</td>
                    <td className="copilot-agents__history-task">{run.task}</td>
                    <td>
                      <Badge variant={RUN_STATUS_VARIANT[run.status]} size="sm">
                        {run.status}
                      </Badge>
                    </td>
                    <td>{formatDuration(run.startedAt, run.completedAt)}</td>
                    <td>{new Date(run.startedAt).toLocaleDateString()}</td>
                    <td>
                      {run.status === RunStatus.Completed && run.result && (
                        <button
                          className="copilot-agents__view-results-btn"
                          onClick={() => onViewResult(run.id)}
                          aria-label={`View results for ${run.task}`}
                        >
                          <Eye size={14} />
                          View Results
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
