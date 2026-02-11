import { renderHook } from '@testing-library/react'
import { useVirtualList } from './useVirtualList'

describe('useVirtualList', () => {
  const items = Array.from({ length: 100 }, (_, i) => ({ id: i, label: `Item ${i}` }))

  it('returns correct total height', () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items,
        itemHeight: 40,
        containerHeight: 200,
        overscan: 0,
      })
    )

    expect(result.current.totalHeight).toBe(4000) // 100 * 40
  })

  it('only renders items that fit in the viewport plus overscan', () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items,
        itemHeight: 40,
        containerHeight: 200,
        overscan: 0,
      })
    )

    // 200 / 40 = 5 visible items
    expect(result.current.visibleItems.length).toBe(5)
    expect(result.current.visibleItems[0]!.index).toBe(0)
    expect(result.current.visibleItems[4]!.index).toBe(4)
  })

  it('includes overscan items', () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items,
        itemHeight: 40,
        containerHeight: 200,
        overscan: 2,
      })
    )

    // 5 visible + 2 overscan below = 7 (no overscan above at start)
    // startIndex = max(0, 0 - 2) = 0
    // visibleCount = ceil(200/40) + 2*2 = 5 + 4 = 9
    // endIndex = min(100, 0 + 9) = 9
    expect(result.current.visibleItems.length).toBe(9)
  })

  it('starts with offsetY 0', () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items,
        itemHeight: 40,
        containerHeight: 200,
        overscan: 0,
      })
    )

    expect(result.current.offsetY).toBe(0)
  })

  it('returns a containerRef', () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items,
        itemHeight: 40,
        containerHeight: 200,
      })
    )

    expect(result.current.containerRef).toBeDefined()
    expect(result.current.containerRef.current).toBeNull()
  })

  it('provides a scrollToIndex function', () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items,
        itemHeight: 40,
        containerHeight: 200,
      })
    )

    expect(typeof result.current.scrollToIndex).toBe('function')
  })

  it('handles empty items array', () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items: [],
        itemHeight: 40,
        containerHeight: 200,
      })
    )

    expect(result.current.visibleItems).toHaveLength(0)
    expect(result.current.totalHeight).toBe(0)
    expect(result.current.offsetY).toBe(0)
  })

  it('handles items fewer than viewport capacity', () => {
    const fewItems = [{ id: 1 }, { id: 2 }]
    const { result } = renderHook(() =>
      useVirtualList({
        items: fewItems,
        itemHeight: 40,
        containerHeight: 200,
        overscan: 0,
      })
    )

    expect(result.current.visibleItems.length).toBe(2)
    expect(result.current.totalHeight).toBe(80)
  })

  it('each visible item has original item and index', () => {
    const { result } = renderHook(() =>
      useVirtualList({
        items,
        itemHeight: 40,
        containerHeight: 80,
        overscan: 0,
      })
    )

    for (const vi of result.current.visibleItems) {
      expect(vi.item).toBe(items[vi.index])
      expect(vi.index).toBeGreaterThanOrEqual(0)
    }
  })
})
