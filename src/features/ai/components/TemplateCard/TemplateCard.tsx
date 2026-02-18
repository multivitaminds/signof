import { ArrowRight, Zap } from 'lucide-react'
import { AGENT_DEFINITIONS } from '../../lib/agentDefinitions'
import type { WorkflowTemplate } from '../../lib/workflowTemplates'
import './TemplateCard.css'

interface TemplateCardProps {
  template: WorkflowTemplate
  onUseTemplate: (template: WorkflowTemplate) => void
}

export default function TemplateCard({ template, onUseTemplate }: TemplateCardProps) {
  return (
    <div className="wf-template-card">
      <div className="wf-template-card__header">
        <h4 className="wf-template-card__name">{template.name}</h4>
        <span className="wf-template-card__stage-count">{template.stages.length} stages</span>
      </div>
      <p className="wf-template-card__desc">{template.description}</p>

      <div className="wf-template-card__flow" aria-label="Template agent flow">
        {template.stages.map((stage, i) => {
          const def = AGENT_DEFINITIONS.find(d => d.type === stage.agentType)
          return (
            <span key={`${template.id}-${stage.agentType}-${i}`} className="wf-template-card__flow-item">
              <span
                className="wf-template-card__flow-dot"
                style={{ backgroundColor: def?.color ?? '#666' }}
              />
              <span className="wf-template-card__flow-label">{def?.label ?? stage.agentType}</span>
              {i < template.stages.length - 1 && (
                <ArrowRight size={12} className="wf-template-card__flow-arrow" />
              )}
            </span>
          )
        })}
      </div>

      <button
        className="wf-template-card__use-btn"
        onClick={() => onUseTemplate(template)}
        aria-label={`Use ${template.name} template`}
      >
        <Zap size={14} />
        Use Template
      </button>
    </div>
  )
}
