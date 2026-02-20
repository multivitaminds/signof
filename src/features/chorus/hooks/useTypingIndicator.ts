import { useCallback, useEffect, useRef } from 'react'
import { useChorusStore } from '../stores/useChorusStore'
import { useChorusPresenceStore } from '../stores/useChorusPresenceStore'

const TYPING_MIN_DELAY = 2000
const TYPING_MAX_DELAY = 4000

function randomDelay(): number {
  return TYPING_MIN_DELAY + Math.random() * (TYPING_MAX_DELAY - TYPING_MIN_DELAY)
}

export function useTypingIndicator(conversationId: string) {
  const users = useChorusStore((s) => s.users)
  const currentUserId = useChorusStore((s) => s.currentUserId)
  const startTyping = useChorusPresenceStore((s) => s.startTyping)
  const stopTyping = useChorusPresenceStore((s) => s.stopTyping)
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const cleanup = useCallback(() => {
    for (const [key, timer] of timersRef.current.entries()) {
      clearTimeout(timer)
      const userId = key
      stopTyping(userId, conversationId)
    }
    timersRef.current.clear()
  }, [conversationId, stopTyping])

  const simulateTyping = useCallback(() => {
    const otherUsers = users.filter((u) => u.id !== currentUserId)
    if (otherUsers.length === 0) return

    const randomIndex = Math.floor(Math.random() * otherUsers.length)
    const randomUser = otherUsers[randomIndex]
    if (!randomUser) return

    startTyping(randomUser.id, randomUser.displayName, conversationId)

    const delay = randomDelay()
    const timer = setTimeout(() => {
      stopTyping(randomUser.id, conversationId)
      timersRef.current.delete(randomUser.id)
    }, delay)

    timersRef.current.set(randomUser.id, timer)
  }, [users, currentUserId, conversationId, startTyping, stopTyping])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return { simulateTyping }
}
