import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useWorkflowStore from '../stores/useWorkflowStore'
import WorkflowToolbar from '../components/WorkflowToolbar/WorkflowToolbar'
import './WorkflowEditorPage.css'

export default function WorkflowEditorPage() {
  const { workflowId } = useParams<{ workflowId: string }>()
  const navigate = useNavigate()
  const workflows = useWorkflowStore((s) => s.workflows)
  const setWorkflowName = useWorkflowStore((s) => s.setWorkflowName)
  const setWorkflowStatus = useWorkflowStore((s) => s.setWorkflowStatus)

  const [selectedNodeId] = useState<string | null>(null)
  const [showPalette, setShowPalette] = useState(true)

  const workflow = useMemo(
    () => workflows.find((w) => w.id === workflowId),
    [workflows, workflowId],
  )

  if (!workflow) {
    return (
      <div className="wf-editor wf-editor--not-found">
        <p>Workflow not found.</p>
        <button className="btn--primary" onClick={() => navigate('/copilot/workflows')}>
          Back to Workflows
        </button>
      </div>
    )
  }

  return (
    <div className="wf-editor">
      <WorkflowToolbar
        workflowName={workflow.name}
        status={workflow.status}
        onNameChange={(name) => setWorkflowName(workflow.id, name)}
        onRun={() => setWorkflowStatus(workflow.id, 'active')}
        onPause={() => setWorkflowStatus(workflow.id, 'paused')}
        onStop={() => setWorkflowStatus(workflow.id, 'draft')}
      />

      <div className="wf-editor__body">
        {showPalette && (
          <div className="wf-editor__palette">
            <div className="wf-editor__palette-header">
              <span>Node Palette</span>
              <button className="wf-editor__close-btn" onClick={() => setShowPalette(false)} aria-label="Close palette">
                &times;
              </button>
            </div>
            <p className="wf-editor__placeholder">[WorkflowNodePalette]</p>
          </div>
        )}

        <div className="wf-editor__canvas">
          {!showPalette && (
            <button className="wf-editor__toggle-palette" onClick={() => setShowPalette(true)} aria-label="Show palette">
              +
            </button>
          )}
          <div className="wf-editor__canvas-inner">
            <p className="wf-editor__canvas-text">
              {workflow.nodes.length === 0
                ? 'Drag nodes from the palette to start building your workflow'
                : `${workflow.nodes.length} nodes, ${workflow.connections.length} connections`}
            </p>
          </div>
        </div>

        {selectedNodeId && (
          <div className="wf-editor__params">
            <p className="wf-editor__placeholder">[NodeParameterPanel for {selectedNodeId}]</p>
          </div>
        )}
      </div>

      <div className="wf-editor__back">
        <button className="wf-editor__back-btn" onClick={() => navigate('/copilot/workflows')}>
          &larr; Back to Workflows
        </button>
      </div>
    </div>
  )
}
