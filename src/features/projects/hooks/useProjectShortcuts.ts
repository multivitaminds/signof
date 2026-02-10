import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts'

interface UseProjectShortcutsOptions {
  onCreateIssue: () => void
  onMoveDown: () => void
  onMoveUp: () => void
  onPreviewIssue: () => void
  onOpenIssue: () => void
  onClosePanel: () => void
  enabled?: boolean
}

export function useProjectShortcuts({
  onCreateIssue,
  onMoveDown,
  onMoveUp,
  onPreviewIssue,
  onOpenIssue,
  onClosePanel,
  enabled = true,
}: UseProjectShortcutsOptions): void {
  useKeyboardShortcuts(
    enabled
      ? [
          { key: 'c', handler: onCreateIssue },
          { key: 'j', handler: onMoveDown },
          { key: 'k', handler: onMoveUp },
          { key: ' ', handler: onPreviewIssue },
          { key: 'Enter', handler: onOpenIssue },
          { key: 'Escape', handler: onClosePanel, ignoreInputs: false },
        ]
      : []
  )
}
