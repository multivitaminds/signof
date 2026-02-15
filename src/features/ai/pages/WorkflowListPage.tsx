import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useWorkflowStore from '../stores/useWorkflowStore'
import './WorkflowListPage.css'

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280',
  active: '#059669',
  paused: '#f59e0b',
  error: '#dc2626',
}

export default function WorkflowListPage() {
  const workflows = useWorkflowStore((s) => s.workflows)
  const createWorkflow = useWorkflowStore((s) => s.createWorkflow)
  const deleteWorkflow = useWorkflowStore((s) => s.deleteWorkflow)
  const duplicateWorkflow = useWorkflowStore((s) => s.duplicateWorkflow)
  const navigate = useNavigate()

  const handleNew = useCallback(() => {
    const id = createWorkflow()
    navigate(`/copilot/workflows/${id}`)
  }, [createWorkflow, navigate])

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      if (window.confirm('Delete this workflow?')) {
        deleteWorkflow(id)
      }
    },
    [deleteWorkflow],
  )

  const handleDuplicate = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      duplicateWorkflow(id)
    },
    [duplicateWorkflow],
  )

  return (
    <div className="wf-list">
      <div className="wf-list__header">
        <h2 className="wf-list__title">Workflows</h2>
        <button className="btn--primary wf-list__new-btn" onClick={handleNew}>
          + New Workflow
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="wf-list__empty">
          <p className="wf-list__empty-text">No workflows yet</p>
          <p className="wf-list__empty-sub">Create your first workflow to automate tasks with AI agents and connectors.</p>
          <button className="btn--primary" onClick={handleNew}>Create Workflow</button>
        </div>
      ) : (
        <div className="wf-list__grid">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="wf-list__card"
              onClick={() => navigate(`/copilot/workflows/${wf.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/copilot/workflows/${wf.id}`)
              }}
            >
              <div className="wf-list__card-header">
                <span className="wf-list__card-name">{wf.name}</span>
                <span className="wf-list__card-status" style={{ color: STATUS_COLORS[wf.status] ?? '#6b7280' }}>
                  {wf.status}
                </span>
              </div>
              {wf.description && (
                <p className="wf-list__card-desc">{wf.description}</p>
              )}
              <div className="wf-list__card-meta">
                <span>{wf.nodes.length} nodes</span>
                <span>{wf.runCount} runs</span>
                {wf.lastRunAt && <span>Last: {new Date(wf.lastRunAt).toLocaleDateString()}</span>}
              </div>
              <div className="wf-list__card-actions">
                <button className="wf-list__action-btn" onClick={(e) => handleDuplicate(e, wf.id)} title="Duplicate">
                  Duplicate
                </button>
                <button className="wf-list__action-btn wf-list__action-btn--danger" onClick={(e) => handleDelete(e, wf.id)} title="Delete">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
