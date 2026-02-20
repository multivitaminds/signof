import { useCallback, useEffect, useRef } from 'react'
import { useChorusStore } from '../stores/useChorusStore'

export function useUnreadTracker(conversationId: string) {
  const clearUnreadCount = useChorusStore((s) => s.clearUnreadCount)
  const incrementUnreadCount = useChorusStore((s) => s.incrementUnreadCount)
  const isFocusedRef = useRef(!document.hidden)

  useEffect(() => {
    clearUnreadCount(conversationId)
  }, [conversationId, clearUnreadCount])

  useEffect(() => {
    function handleVisibilityChange() {
      isFocusedRef.current = !document.hidden
      if (!document.hidden) {
        clearUnreadCount(conversationId)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [conversationId, clearUnreadCount])

  const onNewMessage = useCallback(() => {
    if (!isFocusedRef.current) {
      incrementUnreadCount(conversationId)
    }
  }, [conversationId, incrementUnreadCount])

  return { onNewMessage }
}
