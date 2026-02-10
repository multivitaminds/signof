import { useEffect, useCallback } from 'react'

interface ShortcutCallbacks {
  onNewEventType?: () => void
  onToggleView?: () => void
  onToday?: () => void
  onNext?: () => void
  onPrev?: () => void
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const tagName = target.tagName.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  )
}

export function useSchedulingShortcuts(callbacks: ShortcutCallbacks): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isInputElement(event.target)) return

      switch (event.key) {
        case 'e':
        case 'E':
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault()
            callbacks.onNewEventType?.()
          }
          break
        case 'v':
        case 'V':
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault()
            callbacks.onToggleView?.()
          }
          break
        case 't':
        case 'T':
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault()
            callbacks.onToday?.()
          }
          break
        case 'ArrowRight':
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault()
            callbacks.onNext?.()
          }
          break
        case 'ArrowLeft':
          if (!event.metaKey && !event.ctrlKey) {
            event.preventDefault()
            callbacks.onPrev?.()
          }
          break
      }
    },
    [callbacks]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}
