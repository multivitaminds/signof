import { useCallback } from 'react'
import { Gavel, GitBranch, Settings, Users, FolderOpen, BookOpen, FileText, ClipboardList, Palette, UserPlus, Briefcase, Code, Calendar, CheckSquare } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../../../components/ui'
import { MEMORY_TEMPLATES, CATEGORY_META } from '../../lib/memoryTemplates'
import './MemoryQuickStart.css'

interface MemoryQuickStartProps {
  onUseTemplate: (templateId: string) => void
}

const ICON_MAP: Record<string, LucideIcon> = {
  Gavel,
  GitBranch,
  Settings,
  Users,
  FolderOpen,
  BookOpen,
  FileText,
  ClipboardList,
  Palette,
  UserPlus,
  Briefcase,
  Code,
  Calendar,
  CheckSquare,
}

function getCategoryColor(category: string): string {
  const meta = CATEGORY_META.find((m) => m.key === category)
  return meta?.color ?? '#6366F1'
}

export default function MemoryQuickStart({ onUseTemplate }: MemoryQuickStartProps) {
  const handleUseTemplate = useCallback(
    (templateId: string) => {
      onUseTemplate(templateId)
    },
    [onUseTemplate]
  )

  return (
    <section className="memory-quickstart" aria-labelledby="memory-quickstart-title">
      <h2 className="memory-quickstart__title" id="memory-quickstart-title">
        Quick Start — What should you store?
      </h2>
      <p className="memory-quickstart__description">
        Build your organization&apos;s knowledge base with these templates
      </p>

      <div className="memory-quickstart__grid">
        {MEMORY_TEMPLATES.map((template) => {
          const IconComponent = ICON_MAP[template.icon]
          const accentColor = getCategoryColor(template.category)

          return (
            <div
              key={template.id}
              className="memory-quickstart__card"
              style={{ borderTopColor: accentColor }}
            >
              <div className="memory-quickstart__card-header">
                {IconComponent && (
                  <span className="memory-quickstart__card-icon" style={{ color: accentColor }}>
                    <IconComponent size={20} aria-hidden="true" />
                  </span>
                )}
                <h3 className="memory-quickstart__card-title">{template.title}</h3>
              </div>
              <p className="memory-quickstart__card-description">{template.description}</p>
              <div className="memory-quickstart__card-footer">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  Use Template
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
