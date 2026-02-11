import { useState, useEffect, useRef, useCallback } from 'react'

export interface PullToRefreshOptions {
  /** Callback invoked on pull-to-refresh (should return a Promise or void) */
  onRefresh?: () => void | Promise<void>
  /** Minimum pull distance to trigger refresh (default: 80) */
  threshold?: number
  /** Whether pull-to-refresh is enabled (default: true) */
  enabled?: boolean
}

export interface PullToRefreshState {
  /** Whether the refresh is in progress */
  isRefreshing: boolean
  /** Current pull distance (0 when not pulling) */
  pullDistance: number
}

/**
 * usePullToRefresh — mobile-only pull-down gesture at top of scrollable content.
 * Returns a ref to attach to the scrollable container and the current state.
 */
export function usePullToRefresh<T extends HTMLElement = HTMLElement>(
  options: PullToRefreshOptions = {}
): PullToRefreshState & { ref: React.RefObject<T | null> } {
  const { onRefresh, threshold = 80, enabled = true } = options

  const ref = useRef<T | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const startYRef = useRef(0)
  const pullingRef = useRef(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing) return
    const el = ref.current
    if (!el) return

    // Only activate when scrolled to top
    if (el.scrollTop > 0) return

    const touch = e.touches[0]
    if (!touch) return
    startYRef.current = touch.clientY
    pullingRef.current = true
  }, [enabled, isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pullingRef.current || !enabled || isRefreshing) return

    const touch = e.touches[0]
    if (!touch) return

    const delta = touch.clientY - startYRef.current
    if (delta > 0) {
      // Apply resistance: diminishing returns as distance grows
      const distance = Math.min(delta * 0.5, 150)
      setPullDistance(distance)
    } else {
      setPullDistance(0)
    }
  }, [enabled, isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return
    pullingRef.current = false

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(0)

      try {
        if (onRefresh) {
          await onRefresh()
        } else {
          // Simulated delay when no callback
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } finally {
        setIsRefreshing(false)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  useEffect(() => {
    const element = ref.current
    if (!element || !enabled) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled])

  return { isRefreshing, pullDistance, ref }
}

export default usePullToRefresh
