import { useState, useMemo, useCallback, useRef, useEffect } from 'react'

interface UseVirtualListOptions<T> {
  /** The full list of items */
  items: T[]
  /** Height of each item in pixels */
  itemHeight: number
  /** Height of the scrollable container in pixels */
  containerHeight: number
  /** Number of extra items to render above and below the viewport */
  overscan?: number
}

interface VirtualItem<T> {
  /** The original item */
  item: T
  /** Index in the full items array */
  index: number
}

interface UseVirtualListReturn<T> {
  /** Items that should currently be rendered */
  visibleItems: VirtualItem<T>[]
  /** Total height of all items (for the inner spacer) */
  totalHeight: number
  /** Top offset for the rendered slice (translateY) */
  offsetY: number
  /** Ref to attach to the scrollable container element */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Programmatically scroll to a specific index */
  scrollToIndex: (index: number) => void
}

/**
 * useVirtualList -- windowed rendering hook that only renders items
 * visible in the viewport plus an overscan buffer.
 *
 * Attach `containerRef` to the scrollable container element.
 * Set its height to `containerHeight` and `overflow-y: auto`.
 * Inside, wrap rendered items in a div with `height: totalHeight`
 * and a child with `transform: translateY(${offsetY}px)`.
 */
export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: UseVirtualListOptions<T>): UseVirtualListReturn<T> {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const totalHeight = items.length * itemHeight

  const { visibleItems, offsetY } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan
    const endIndex = Math.min(items.length, startIndex + visibleCount)

    const visible: VirtualItem<T>[] = []
    for (let i = startIndex; i < endIndex; i++) {
      const item = items[i]
      if (item !== undefined) {
        visible.push({ item, index: i })
      }
    }

    return {
      visibleItems: visible,
      offsetY: startIndex * itemHeight,
    }
  }, [items, itemHeight, containerHeight, scrollTop, overscan])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current
      if (!container) return
      const targetTop = index * itemHeight
      container.scrollTop = targetTop
    },
    [itemHeight]
  )

  return {
    visibleItems,
    totalHeight,
    offsetY,
    containerRef,
    scrollToIndex,
  }
}
