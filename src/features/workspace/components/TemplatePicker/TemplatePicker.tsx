import { PAGE_TEMPLATES } from '../../lib/templates'
import type { PageTemplate } from '../../types'
import './TemplatePicker.css'

interface TemplatePickerProps {
  onSelect: (template: PageTemplate) => void
  onBlank: () => void
}

export default function TemplatePicker({ onSelect, onBlank }: TemplatePickerProps) {
  return (
    <div className="template-picker">
      {PAGE_TEMPLATES.map((template) => (
        <button
          key={template.id}
          className="template-picker__card"
          onClick={() => template.id === 'blank' ? onBlank() : onSelect(template)}
        >
          <span className="template-picker__icon">{template.icon}</span>
          <span className="template-picker__title">{template.title}</span>
          <span className="template-picker__desc">{template.description}</span>
        </button>
      ))}
    </div>
  )
}
