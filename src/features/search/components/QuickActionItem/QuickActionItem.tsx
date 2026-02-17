import { useCallback } from 'react'
import type { QuickAction } from '../../../../lib/quickActions'
import { resolveIcon } from '../../../../lib/iconResolver'
import { highlightMatches } from '../../../../lib/fuzzyMatch'
import { fuzzyMatch } from '../../../../lib/fuzzyMatch'
import './QuickActionItem.css'

interface Props {
  action: QuickAction
  query: string
  isSelected: boolean
  onExecute: (action: QuickAction) => void
  onMouseEnter: () => void
}

const MODULE_COLORS: Record<string, string> = {
  Navigation: 'navigation',
  Documents: 'documents',
  Workspace: 'workspace',
  Projects: 'projects',
  Calendar: 'calendar',
  Databases: 'databases',
  Accounting: 'accounting',
  Copilot: 'copilot',
  Tax: 'tax',
  Developer: 'developer',
  App: 'app',
}

function formatShortcut(shortcut: string): string {
  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform || navigator.userAgent)
  return shortcut
    .replace('mod+', isMac ? '\u2318' : 'Ctrl+')
    .replace('shift+', isMac ? '\u21E7' : 'Shift+')
    .replace('alt+', isMac ? '\u2325' : 'Alt+')
    .toUpperCase()
}

export default function QuickActionItem({ action, query, isSelected, onExecute, onMouseEnter }: Props) {
  const Icon = resolveIcon(action.icon)

  const labelMatch = query ? fuzzyMatch(query, action.label) : null
  const segments = labelMatch
    ? highlightMatches(action.label, labelMatch.matchedIndices)
    : [{ text: action.label, highlight: false }]

  const moduleClass = MODULE_COLORS[action.module] ?? 'app'

  const handleClick = useCallback(() => {
    onExecute(action)
  }, [action, onExecute])

  return (
    <button
      className={`quick-action-item ${isSelected ? 'quick-action-item--selected' : ''}`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      type="button"
    >
      <div className="quick-action-item__icon">
        {Icon ? <Icon size={18} /> : null}
      </div>
      <div className="quick-action-item__content">
        <span className="quick-action-item__label">
          {segments.map((seg, i) =>
            seg.highlight ? (
              <mark key={i} className="quick-action-item__match">{seg.text}</mark>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </span>
        {action.description && (
          <span className="quick-action-item__description">{action.description}</span>
        )}
      </div>
      <span className={`quick-action-item__module quick-action-item__module--${moduleClass}`}>
        {action.module}
      </span>
      {action.shortcut && (
        <kbd className="quick-action-item__shortcut">
          {formatShortcut(action.shortcut)}
        </kbd>
      )}
    </button>
  )
}
