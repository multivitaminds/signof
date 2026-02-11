import { useEffect, useRef, useCallback } from 'react'

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface SwipeCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  /** Minimum distance in px to register as swipe (default: 50) */
  threshold?: number
  /** Maximum time in ms for a swipe gesture (default: 300) */
  maxTime?: number
}

interface TouchState {
  startX: number
  startY: number
  startTime: number
}

/**
 * useSwipeGesture — detects swipe gestures on a referenced element.
 * Attach the returned ref to any element to enable swipe detection.
 */
export function useSwipeGesture<T extends HTMLElement = HTMLElement>(
  callbacks: SwipeCallbacks
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const touchStateRef = useRef<TouchState | null>(null)

  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown } = callbacks
  const threshold = callbacks.threshold ?? 50
  const maxTime = callbacks.maxTime ?? 300

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const state = touchStateRef.current
    if (!state) return

    const touch = e.changedTouches[0]
    if (!touch) return

    const deltaX = touch.clientX - state.startX
    const deltaY = touch.clientY - state.startY
    const elapsed = Date.now() - state.startTime

    touchStateRef.current = null

    if (elapsed > maxTime) return

    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Determine if horizontal or vertical swipe
    if (absDeltaX > absDeltaY && absDeltaX >= threshold) {
      if (deltaX < 0) {
        onSwipeLeft?.()
      } else {
        onSwipeRight?.()
      }
    } else if (absDeltaY > absDeltaX && absDeltaY >= threshold) {
      if (deltaY < 0) {
        onSwipeUp?.()
      } else {
        onSwipeDown?.()
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, maxTime])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchEnd])

  return ref
}

export default useSwipeGesture
