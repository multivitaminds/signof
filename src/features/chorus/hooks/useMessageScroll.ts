import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChorusMessage } from '../types'

const BOTTOM_THRESHOLD = 150

interface UseMessageScrollResult {
  scrollRef: React.RefObject<HTMLDivElement | null>
  isAtBottom: boolean
  scrollToBottom: () => void
  showNewMessagesBanner: boolean
}

export function useMessageScroll(messages: ChorusMessage[]): UseMessageScrollResult {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showNewMessagesBanner, setShowNewMessagesBanner] = useState(false)
  const prevMessageCount = useRef(messages.length)

  const scrollToBottom = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
    setIsAtBottom(true)
    setShowNewMessagesBanner(false)
  }, [])

  // Check scroll position on scroll events
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    function handleScroll() {
      if (!container) return
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight
      const atBottom = distanceFromBottom < BOTTOM_THRESHOLD
      setIsAtBottom(atBottom)
      if (atBottom) {
        setShowNewMessagesBanner(false)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll or show banner when messages change
  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      if (isAtBottom) {
        // Use requestAnimationFrame so DOM updates first
        requestAnimationFrame(() => {
          scrollToBottom()
        })
      } else {
        setShowNewMessagesBanner(true)
      }
    }
    prevMessageCount.current = messages.length
  }, [messages.length, isAtBottom, scrollToBottom])

  // Scroll to bottom on initial mount
  useEffect(() => {
    requestAnimationFrame(() => {
      scrollToBottom()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { scrollRef, isAtBottom, scrollToBottom, showNewMessagesBanner }
}
