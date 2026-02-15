import { useState, useCallback, useMemo } from 'react'
import type { WorkflowNode, WorkflowNodeDefinition } from '../../types'
import './NodeParameterPanel.css'

interface NodeParameterPanelProps {
  node: WorkflowNode | null
  definition?: WorkflowNodeDefinition
  onUpdateData?: (nodeId: string, data: Record<string, unknown>) => void
}

export default function NodeParameterPanel({ node, definition, onUpdateData }: NodeParameterPanelProps) {
  const initialData = useMemo(() => (node ? { ...node.data } : {}), [node])
  const [localData, setLocalData] = useState<Record<string, unknown>>(initialData)

  const handleChange = useCallback((key: string, value: unknown) => {
    setLocalData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleApply = useCallback(() => {
    if (node) {
      onUpdateData?.(node.id, localData)
    }
  }, [node, localData, onUpdateData])

  if (!node) {
    return (
      <div className="node-params node-params--empty">
        <p className="node-params__placeholder">Select a node to configure</p>
      </div>
    )
  }

  const parameters = definition?.parameters ?? []

  return (
    <div className="node-params">
      <div className="node-params__header">
        <h3 className="node-params__title">{node.label}</h3>
        <span className="node-params__type">{node.type}</span>
      </div>

      <div className="node-params__form">
        {parameters.map((param) => {
          const value = localData[param.key]
          return (
            <div key={param.key} className="node-params__field">
              <label className="node-params__label" htmlFor={`param-${param.key}`}>
                {param.label}
                {param.required && <span className="node-params__required">*</span>}
              </label>

              {param.type === 'string' && (
                <input
                  id={`param-${param.key}`}
                  className="node-params__input"
                  type="text"
                  value={String(value ?? param.default ?? '')}
                  placeholder={param.placeholder}
                  onChange={(e) => handleChange(param.key, e.target.value)}
                />
              )}

              {param.type === 'number' && (
                <input
                  id={`param-${param.key}`}
                  className="node-params__input"
                  type="number"
                  value={Number(value ?? param.default ?? 0)}
                  placeholder={param.placeholder}
                  onChange={(e) => handleChange(param.key, Number(e.target.value))}
                />
              )}

              {param.type === 'boolean' && (
                <label className="node-params__checkbox-label">
                  <input
                    id={`param-${param.key}`}
                    type="checkbox"
                    checked={Boolean(value ?? param.default ?? false)}
                    onChange={(e) => handleChange(param.key, e.target.checked)}
                  />
                  <span>Enabled</span>
                </label>
              )}

              {param.type === 'select' && (
                <select
                  id={`param-${param.key}`}
                  className="node-params__select"
                  value={String(value ?? param.default ?? '')}
                  onChange={(e) => handleChange(param.key, e.target.value)}
                >
                  <option value="">Select...</option>
                  {param.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {(param.type === 'expression' || param.type === 'json' || param.type === 'code') && (
                <textarea
                  id={`param-${param.key}`}
                  className={`node-params__textarea${param.type === 'code' ? ' node-params__textarea--code' : ''}`}
                  value={String(value ?? param.default ?? '')}
                  placeholder={param.placeholder}
                  rows={4}
                  onChange={(e) => handleChange(param.key, e.target.value)}
                />
              )}
            </div>
          )
        })}

        {parameters.length === 0 && (
          <p className="node-params__no-params">No configurable parameters</p>
        )}
      </div>

      {parameters.length > 0 && (
        <div className="node-params__actions">
          <button className="btn--primary node-params__apply" onClick={handleApply}>
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
