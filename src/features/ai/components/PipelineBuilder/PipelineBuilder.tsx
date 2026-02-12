import { useState, useCallback } from 'react'
import {
  X, Plus, Trash2, ArrowRight, ChevronUp, ChevronDown,
  Zap,
} from 'lucide-react'
import { AGENT_DEFINITIONS } from '../../lib/agentDefinitions'
import usePipelineStore from '../../stores/usePipelineStore'
import type { AgentType } from '../../types'
import './PipelineBuilder.css'

interface PipelineBuilderProps {
  isOpen: boolean
  onClose: () => void
  initialStages?: Array<{ agentType: AgentType; task: string }>
  templateName?: string
  templateDescription?: string
}

interface StageInput {
  id: string
  agentType: AgentType
  task: string
}

let stageCounter = 0
function nextStageId(): string {
  return `stage-${++stageCounter}-${Date.now()}`
}

export default function PipelineBuilder({
  isOpen,
  onClose,
  initialStages,
  templateName,
  templateDescription,
}: PipelineBuilderProps) {
  const createPipeline = usePipelineStore(s => s.createPipeline)
  const runPipeline = usePipelineStore(s => s.runPipeline)

  const [name, setName] = useState(templateName ?? '')
  const [description, setDescription] = useState(templateDescription ?? '')
  const defaultAgentType = AGENT_DEFINITIONS[0]!.type

  const [stages, setStages] = useState<StageInput[]>(() =>
    initialStages?.map(s => ({ id: nextStageId(), agentType: s.agentType, task: s.task }))
    ?? [{ id: nextStageId(), agentType: defaultAgentType, task: '' }]
  )

  const handleAddStage = useCallback(() => {
    setStages(prev => [...prev, { id: nextStageId(), agentType: defaultAgentType, task: '' }])
  }, [defaultAgentType])

  const handleRemoveStage = useCallback((id: string) => {
    setStages(prev => prev.length > 1 ? prev.filter(s => s.id !== id) : prev)
  }, [])

  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return
    setStages(prev => {
      const next = [...prev]
      const temp = next[index - 1]!
      next[index - 1] = next[index]!
      next[index] = temp
      return next
    })
  }, [])

  const handleMoveDown = useCallback((index: number) => {
    setStages(prev => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      const temp = next[index + 1]!
      next[index + 1] = next[index]!
      next[index] = temp
      return next
    })
  }, [])

  const handleStageTypeChange = useCallback((id: string, agentType: AgentType) => {
    setStages(prev => prev.map(s => s.id === id ? { ...s, agentType } : s))
  }, [])

  const handleStageTaskChange = useCallback((id: string, task: string) => {
    setStages(prev => prev.map(s => s.id === id ? { ...s, task } : s))
  }, [])

  const handleCreate = useCallback((autoRun: boolean) => {
    if (!name.trim()) return
    const pipeline = createPipeline(
      name.trim(),
      description.trim(),
      stages.map(s => ({ agentType: s.agentType, task: s.task || `Default task for ${s.agentType}` })),
    )
    if (autoRun) {
      runPipeline(pipeline.id)
    }
    onClose()
  }, [name, description, stages, createPipeline, runPipeline, onClose])

  if (!isOpen) return null

  return (
    <div className="pipeline-builder__overlay" onClick={onClose} role="dialog" aria-label="Create pipeline" aria-modal="true">
      <div className="pipeline-builder__modal" onClick={e => e.stopPropagation()}>
        <div className="pipeline-builder__header">
          <div className="pipeline-builder__header-info">
            <Zap size={20} className="pipeline-builder__header-icon" />
            <h3 className="pipeline-builder__title">Create Pipeline</h3>
          </div>
          <button className="pipeline-builder__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="pipeline-builder__body">
          <div className="pipeline-builder__fields">
            <input
              className="pipeline-builder__name-input"
              type="text"
              placeholder="Pipeline name"
              value={name}
              onChange={e => setName(e.target.value)}
              aria-label="Pipeline name"
            />
            <input
              className="pipeline-builder__desc-input"
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              aria-label="Pipeline description"
            />
          </div>

          {/* Flow Preview */}
          <div className="pipeline-builder__flow-preview" aria-label="Pipeline flow preview">
            {stages.map((stage, i) => {
              const def = AGENT_DEFINITIONS.find(d => d.type === stage.agentType)
              return (
                <span key={stage.id} className="pipeline-builder__flow-item">
                  <span
                    className="pipeline-builder__flow-dot"
                    style={{ backgroundColor: def?.color ?? '#666' }}
                  />
                  <span className="pipeline-builder__flow-label">{def?.label ?? stage.agentType}</span>
                  {i < stages.length - 1 && <ArrowRight size={14} className="pipeline-builder__flow-arrow" />}
                </span>
              )
            })}
          </div>

          {/* Stage List */}
          <div className="pipeline-builder__stages">
            {stages.map((stage, index) => (
              <div key={stage.id} className="pipeline-builder__stage">
                <div className="pipeline-builder__stage-header">
                  <span className="pipeline-builder__stage-num">{index + 1}</span>
                  <select
                    className="pipeline-builder__stage-select"
                    value={stage.agentType}
                    onChange={e => handleStageTypeChange(stage.id, e.target.value as AgentType)}
                    aria-label={`Agent type for stage ${index + 1}`}
                  >
                    {AGENT_DEFINITIONS.map(d => (
                      <option key={d.type} value={d.type}>{d.label}</option>
                    ))}
                  </select>
                  <div className="pipeline-builder__stage-actions">
                    <button
                      className="pipeline-builder__stage-btn"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      className="pipeline-builder__stage-btn"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === stages.length - 1}
                      aria-label="Move down"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      className="pipeline-builder__stage-btn pipeline-builder__stage-btn--danger"
                      onClick={() => handleRemoveStage(stage.id)}
                      disabled={stages.length <= 1}
                      aria-label="Remove stage"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <input
                  className="pipeline-builder__stage-task"
                  type="text"
                  placeholder="Describe the task for this stage..."
                  value={stage.task}
                  onChange={e => handleStageTaskChange(stage.id, e.target.value)}
                  aria-label={`Task for stage ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <button className="pipeline-builder__add-btn" onClick={handleAddStage}>
            <Plus size={14} />
            Add Stage
          </button>
        </div>

        <div className="pipeline-builder__footer">
          <button className="pipeline-builder__cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="pipeline-builder__create-btn"
            onClick={() => handleCreate(false)}
            disabled={!name.trim()}
          >
            Create Pipeline
          </button>
          <button
            className="pipeline-builder__run-btn"
            onClick={() => handleCreate(true)}
            disabled={!name.trim()}
          >
            <Zap size={14} />
            Create & Run
          </button>
        </div>
      </div>
    </div>
  )
}
