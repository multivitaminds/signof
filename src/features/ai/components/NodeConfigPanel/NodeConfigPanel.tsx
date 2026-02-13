import { useState, useCallback } from 'react'
import { X, Play, Trash2 } from 'lucide-react'
import useCanvasStore from '../../stores/useCanvasStore'
import { AGENT_DEFINITIONS } from '../../lib/agentDefinitions'
import type { CanvasNode } from '../../types'
import './NodeConfigPanel.css'

interface NodeConfigPanelProps {
  node: CanvasNode
  onClose: () => void
  onTestStep: (nodeId: string) => void
  onRemove: (nodeId: string) => void
}

type ConfigTab = 'configuration' | 'output' | 'history'

export default function NodeConfigPanel({ node, onClose, onTestStep, onRemove }: NodeConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<ConfigTab>('configuration')
  const updateNodeTask = useCanvasStore(s => s.updateNodeTask)

  const definition = AGENT_DEFINITIONS.find(a => a.type === node.agentType)

  const handleTaskChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeTask(node.id, e.target.value)
  }, [node.id, updateNodeTask])

  const handleTestStep = useCallback(() => {
    onTestStep(node.id)
  }, [node.id, onTestStep])

  const handleRemove = useCallback(() => {
    onRemove(node.id)
  }, [node.id, onRemove])

  return (
    <div className="node-config" role="complementary" aria-label="Node configuration">
      <div className="node-config__header">
        <div className="node-config__header-info">
          <h3 className="node-config__title">{definition?.label ?? node.agentType} Agent</h3>
          <span className="node-config__subtitle">{definition?.category}</span>
        </div>
        <button
          className="node-config__close"
          onClick={onClose}
          aria-label="Close configuration"
        >
          <X size={16} />
        </button>
      </div>

      <div className="node-config__tabs" role="tablist" aria-label="Configuration tabs">
        <button
          className={`node-config__tab${activeTab === 'configuration' ? ' node-config__tab--active' : ''}`}
          onClick={() => setActiveTab('configuration')}
          role="tab"
          aria-selected={activeTab === 'configuration'}
        >
          Configuration
        </button>
        <button
          className={`node-config__tab${activeTab === 'output' ? ' node-config__tab--active' : ''}`}
          onClick={() => setActiveTab('output')}
          role="tab"
          aria-selected={activeTab === 'output'}
        >
          Output
        </button>
        <button
          className={`node-config__tab${activeTab === 'history' ? ' node-config__tab--active' : ''}`}
          onClick={() => setActiveTab('history')}
          role="tab"
          aria-selected={activeTab === 'history'}
        >
          Run History
        </button>
      </div>

      <div className="node-config__body">
        {activeTab === 'configuration' && (
          <div className="node-config__section">
            <label className="node-config__label" htmlFor="node-task">
              Task Description
            </label>
            <textarea
              id="node-task"
              className="node-config__textarea"
              value={node.task}
              onChange={handleTaskChange}
              placeholder="Describe what this agent should do..."
              rows={4}
            />

            {definition && (
              <>
                <div className="node-config__detail">
                  <h4 className="node-config__detail-label">Capabilities</h4>
                  <div className="node-config__tags">
                    {definition.capabilities.map(cap => (
                      <span key={cap} className="node-config__tag">{cap}</span>
                    ))}
                  </div>
                </div>

                <div className="node-config__detail">
                  <h4 className="node-config__detail-label">Use Cases</h4>
                  <ul className="node-config__use-cases">
                    {definition.useCases.map(uc => (
                      <li key={uc}>{uc}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'output' && (
          <div className="node-config__section">
            {node.output ? (
              <pre className="node-config__output">{node.output}</pre>
            ) : (
              <p className="node-config__empty">No output yet. Execute the workflow to see results.</p>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="node-config__section">
            <p className="node-config__empty">No run history for this node.</p>
          </div>
        )}
      </div>

      <div className="node-config__footer">
        <button
          className="node-config__btn node-config__btn--test"
          onClick={handleTestStep}
          aria-label="Test this step"
        >
          <Play size={14} />
          Test Step
        </button>
        <button
          className="node-config__btn node-config__btn--remove"
          onClick={handleRemove}
          aria-label="Remove this node"
        >
          <Trash2 size={14} />
          Remove
        </button>
      </div>
    </div>
  )
}
