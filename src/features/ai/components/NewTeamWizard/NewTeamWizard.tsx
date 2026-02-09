import { useState, useCallback } from 'react'
import type { AgentType } from '../../types'
import { AGENT_DEFINITIONS, getDefinition } from '../../lib/agentDefinitions'
import AgentConfigPanel from '../AgentConfigPanel/AgentConfigPanel'
import {
  ClipboardList, Search, PenTool, BarChart3,
  Palette, Code2, CheckSquare, Users,
  Check,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import './NewTeamWizard.css'

const ICON_MAP: Record<string, LucideIcon> = {
  ClipboardList, Search, PenTool, BarChart3,
  Palette, Code2, CheckSquare, Users,
}

interface AgentConfig {
  name: string
  type: AgentType
  instructions: string
  memoryAllocation: number
}

interface NewTeamWizardProps {
  onComplete: (name: string, agents: AgentConfig[]) => void
  onCancel: () => void
}

const STEPS = ['Name', 'Select Agents', 'Configure', 'Review'] as const

export default function NewTeamWizard({ onComplete, onCancel }: NewTeamWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [teamName, setTeamName] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<AgentType[]>([])
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([])

  const toggleAgentType = useCallback((type: AgentType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep === 1) {
      // Moving from selection to configure: initialize configs for newly selected types
      setAgentConfigs(prev => {
        const existing = new Map(prev.map(c => [c.type, c]))
        return selectedTypes.map((type, i) => {
          const found = existing.get(type)
          if (found) return found
          const def = getDefinition(type)
          return {
            name: def?.label ?? `Agent ${i + 1}`,
            type,
            instructions: '',
            memoryAllocation: 10000,
          }
        })
      })
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
  }, [currentStep, selectedTypes])

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  const handleLaunch = useCallback(() => {
    onComplete(teamName, agentConfigs)
  }, [teamName, agentConfigs, onComplete])

  const handleConfigChange = useCallback((index: number, updates: Partial<{ name: string; instructions: string; memoryAllocation: number }>) => {
    setAgentConfigs(prev => prev.map((config, i) =>
      i === index ? { ...config, ...updates } : config
    ))
  }, [])

  const canProceed = () => {
    switch (currentStep) {
      case 0: return teamName.trim().length > 0
      case 1: return selectedTypes.length > 0
      case 2: return agentConfigs.every(c => c.name.trim().length > 0)
      case 3: return true
      default: return false
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content team-wizard"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Create new team"
      >
        {/* Step indicators */}
        <div className="team-wizard__steps">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`team-wizard__step-indicator${
                i === currentStep ? ' team-wizard__step-indicator--active' : ''
              }${i < currentStep ? ' team-wizard__step-indicator--completed' : ''}`}
            >
              <div className="team-wizard__step-number">
                {i < currentStep ? <Check size={14} /> : i + 1}
              </div>
              <span className="team-wizard__step-label">{label}</span>
              {i < STEPS.length - 1 && <div className="team-wizard__step-connector" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="team-wizard__body">
          {currentStep === 0 && (
            <div className="team-wizard__name-step">
              <h3 className="team-wizard__heading">Name your team</h3>
              <p className="team-wizard__description">
                Give your agent team a descriptive name.
              </p>
              <input
                type="text"
                className="team-wizard__name-input"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Product Launch Team"
                autoFocus
                aria-label="Team name"
              />
            </div>
          )}

          {currentStep === 1 && (
            <div className="team-wizard__select-step">
              <h3 className="team-wizard__heading">Select agents</h3>
              <p className="team-wizard__description">
                Choose the agent types for your team. Selected: {selectedTypes.length}
              </p>
              <div className="team-wizard__agent-grid">
                {AGENT_DEFINITIONS.map(def => {
                  const isSelected = selectedTypes.includes(def.type)
                  const IconComp = ICON_MAP[def.icon]
                  return (
                    <button
                      key={def.type}
                      className={`team-wizard__agent-type-card${isSelected ? ' team-wizard__agent-type-card--selected' : ''}`}
                      onClick={() => toggleAgentType(def.type)}
                      aria-pressed={isSelected}
                      style={{ borderColor: isSelected ? def.color : undefined }}
                    >
                      <div className="team-wizard__agent-type-icon" style={{ color: def.color }}>
                        {IconComp && <IconComp size={24} />}
                      </div>
                      <span className="team-wizard__agent-type-name">{def.label}</span>
                      <span className="team-wizard__agent-type-desc">{def.description}</span>
                      {isSelected && (
                        <div className="team-wizard__agent-type-check" style={{ backgroundColor: def.color }}>
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="team-wizard__configure-step">
              <h3 className="team-wizard__heading">Configure agents</h3>
              <p className="team-wizard__description">
                Customize each agent's name, instructions, and memory allocation.
              </p>
              <div className="team-wizard__config-list">
                {agentConfigs.map((config, i) => {
                  const def = getDefinition(config.type)
                  if (!def) return null
                  return (
                    <AgentConfigPanel
                      key={config.type}
                      agent={config}
                      typeDefinition={def}
                      onChange={(updates) => handleConfigChange(i, updates)}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="team-wizard__review-step">
              <h3 className="team-wizard__heading">Review and launch</h3>
              <p className="team-wizard__description">
                Verify your team configuration before launching.
              </p>
              <div className="team-wizard__review-card">
                <div className="team-wizard__review-field">
                  <span className="team-wizard__review-label">Team Name</span>
                  <span className="team-wizard__review-value">{teamName}</span>
                </div>
                <div className="team-wizard__review-field">
                  <span className="team-wizard__review-label">Agents ({agentConfigs.length})</span>
                  <div className="team-wizard__review-agents">
                    {agentConfigs.map(config => {
                      const def = getDefinition(config.type)
                      return (
                        <div key={config.type} className="team-wizard__review-agent">
                          <span className="team-wizard__review-agent-name">{config.name}</span>
                          <span className="team-wizard__review-agent-type">{def?.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="team-wizard__actions">
          <button
            className="btn-secondary"
            onClick={currentStep === 0 ? onCancel : handleBack}
          >
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>
          {currentStep < STEPS.length - 1 ? (
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleLaunch}
              disabled={!canProceed()}
            >
              Launch Team
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
