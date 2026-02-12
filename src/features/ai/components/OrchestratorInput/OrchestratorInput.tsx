import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Sparkles, ArrowRight, Play } from 'lucide-react'
import { detectPipeline } from '../../lib/orchestrator'
import { AGENT_DEFINITIONS } from '../../lib/agentDefinitions'
import type { AgentType } from '../../types'
import type { OrchestratorResult } from '../../lib/orchestrator'
import './OrchestratorInput.css'

interface OrchestratorInputProps {
  onRunSingle: (agentType: AgentType, task: string) => void
  onRunPipeline: (stages: Array<{ agentType: AgentType; task: string }>) => void
}

export default function OrchestratorInput({ onRunSingle, onRunPipeline }: OrchestratorInputProps) {
  const [input, setInput] = useState('')
  const [debouncedInput, setDebouncedInput] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedInput(input)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input])

  const result: OrchestratorResult | null = useMemo(() => {
    if (!debouncedInput.trim()) return null
    return detectPipeline(debouncedInput)
  }, [debouncedInput])

  const handleRun = useCallback(() => {
    if (!result || result.agents.length === 0 || !input.trim()) return
    if (result.isMultiAgent) {
      onRunPipeline(result.agents.map(a => ({ agentType: a, task: input.trim() })))
    } else {
      onRunSingle(result.agents[0]!, input.trim())
    }
    setInput('')
    setDebouncedInput('')
  }, [result, input, onRunSingle, onRunPipeline])

  const confidenceLabel = result
    ? result.confidence >= 0.8 ? 'High' : result.confidence >= 0.5 ? 'Medium' : 'Low'
    : null

  return (
    <div className="orchestrator-input">
      <div className="orchestrator-input__wrapper">
        <Sparkles size={20} className="orchestrator-input__icon" />
        <input
          className="orchestrator-input__field"
          type="text"
          placeholder="What do you need done? Describe any task..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleRun()
          }}
          aria-label="Describe your task"
        />
        {result && result.agents.length > 0 && (
          <button
            className="orchestrator-input__run-btn"
            onClick={handleRun}
            aria-label="Run detected pipeline"
          >
            <Play size={14} />
            Run
          </button>
        )}
      </div>

      {/* Live Preview */}
      {result && result.agents.length > 0 && (
        <div className="orchestrator-input__preview" aria-label="Detected agent pipeline">
          <div className="orchestrator-input__agents">
            {result.agents.map((agentType, i) => {
              const def = AGENT_DEFINITIONS.find(d => d.type === agentType)
              return (
                <span key={`${agentType}-${i}`} className="orchestrator-input__agent">
                  <span
                    className="orchestrator-input__agent-dot"
                    style={{ backgroundColor: def?.color ?? '#666' }}
                  />
                  <span className="orchestrator-input__agent-name">{def?.label ?? agentType}</span>
                  {i < result.agents.length - 1 && (
                    <ArrowRight size={12} className="orchestrator-input__arrow" />
                  )}
                </span>
              )
            })}
          </div>
          <span className={`orchestrator-input__confidence orchestrator-input__confidence--${confidenceLabel?.toLowerCase()}`}>
            {confidenceLabel} confidence
          </span>
        </div>
      )}

      {input.trim() && (!result || result.agents.length === 0) && (
        <div className="orchestrator-input__hint">
          Type more to detect which agents to use...
        </div>
      )}
    </div>
  )
}
