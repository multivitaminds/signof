import {
  FileText,
  ClipboardList,
  Calendar,
  FileCode,
  UserPlus,
  Database,
  BarChart3,
  Clock,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import './ToolResultCard.css'

interface ToolResultCardProps {
  toolName: string
  input: Record<string, unknown>
  result: string
}

interface ToolMeta {
  label: string
  icon: LucideIcon
}

const TOOL_META: Record<string, ToolMeta> = {
  create_page: { label: 'Created Page', icon: FileText },
  create_issue: { label: 'Created Task', icon: ClipboardList },
  create_booking: { label: 'Scheduled Meeting', icon: Calendar },
  create_template: { label: 'Created Template', icon: FileCode },
  add_contact: { label: 'Added Contact', icon: UserPlus },
  create_database: { label: 'Created Database', icon: Database },
  get_workspace_stats: { label: 'Workspace Stats', icon: BarChart3 },
  get_upcoming_deadlines: { label: 'Deadlines', icon: Clock },
}

function getToolMeta(toolName: string): ToolMeta {
  return TOOL_META[toolName] ?? { label: toolName, icon: Wrench }
}

function getKeyParam(toolName: string, input: Record<string, unknown>): string | null {
  const key = toolName === 'create_issue' || toolName === 'create_page'
    ? 'title'
    : toolName === 'create_template' || toolName === 'create_database' || toolName === 'add_contact'
      ? 'name'
      : toolName === 'create_booking'
        ? 'attendeeName'
        : null

  if (!key) return null
  const val = input[key]
  return typeof val === 'string' ? val : null
}

function isSuccess(result: string): boolean {
  try {
    const parsed: { success?: boolean } = JSON.parse(result)
    return parsed.success === true
  } catch {
    return false
  }
}

export default function ToolResultCard({ toolName, input, result }: ToolResultCardProps) {
  const meta = getToolMeta(toolName)
  const Icon = meta.icon
  const param = getKeyParam(toolName, input)
  const success = isSuccess(result)

  return (
    <div className={`tool-result-card ${success ? 'tool-result-card--success' : 'tool-result-card--error'}`}>
      <div className="tool-result-card__icon">
        <Icon size={14} />
      </div>
      <div className="tool-result-card__body">
        <span className="tool-result-card__label">{meta.label}</span>
        {param && <span className="tool-result-card__param">{param}</span>}
      </div>
      {success && <span className="tool-result-card__check">&#10003;</span>}
    </div>
  )
}
