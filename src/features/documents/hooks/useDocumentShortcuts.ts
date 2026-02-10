import { useEffect } from 'react'

interface DocumentShortcutCallbacks {
  onNewDocument?: () => void
  onNewTemplate?: () => void
  onSearch?: () => void
  onDelete?: () => void
}

export function useDocumentShortcuts(callbacks: DocumentShortcutCallbacks): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      // Ignore if any modifier keys are pressed (let Cmd+K etc. through)
      if (e.metaKey || e.ctrlKey || e.altKey) return

      switch (e.key) {
        case 'd':
        case 'D':
          if (callbacks.onNewDocument) {
            e.preventDefault()
            callbacks.onNewDocument()
          }
          break
        case 't':
        case 'T':
          if (callbacks.onNewTemplate) {
            e.preventDefault()
            callbacks.onNewTemplate()
          }
          break
        case '/':
          if (callbacks.onSearch) {
            e.preventDefault()
            callbacks.onSearch()
          }
          break
        case 'Delete':
        case 'Backspace':
          if (callbacks.onDelete) {
            e.preventDefault()
            callbacks.onDelete()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [callbacks])
}
