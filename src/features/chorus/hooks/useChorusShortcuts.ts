import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChorusStore } from '../stores/useChorusStore'

/**
 * Chorus module keyboard shortcuts.
 * Only active when on /chorus/* routes.
 *
 * - Escape: close thread panel
 * - Ctrl/Cmd + Shift + K: search messages (navigate to search)
 * - Ctrl/Cmd + Shift + N: new message
 */
export function useChorusShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Only handle Escape in inputs
        if (e.key === 'Escape') {
          const store = useChorusStore.getState()
          if (store.threadPanelOpen) {
            e.preventDefault()
            store.closeThread()
          }
        }
        return
      }

      if (e.key === 'Escape') {
        const store = useChorusStore.getState()
        if (store.threadPanelOpen) {
          e.preventDefault()
          store.closeThread()
        }
        return
      }

      const isMod = e.metaKey || e.ctrlKey

      if (isMod && e.shiftKey && e.key === 'K') {
        e.preventDefault()
        navigate('/chorus/search')
        return
      }

      if (isMod && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        navigate('/chorus/new')
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
}
