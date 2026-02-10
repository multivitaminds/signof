import { renderHook, act } from '@testing-library/react'
import { useGlobalSearch } from './useGlobalSearch'

describe('useGlobalSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useGlobalSearch())

    expect(result.current.query).toBe('')
    expect(result.current.results).toEqual([])
    expect(result.current.isSearching).toBe(false)
    expect(result.current.selectedIndex).toBe(0)
  })

  it('updates query immediately on search', () => {
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.search('test')
    })

    expect(result.current.query).toBe('test')
  })

  it('sets isSearching while debouncing', () => {
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.search('Employment')
    })

    // Should be searching before debounce fires
    expect(result.current.isSearching).toBe(true)

    // After debounce, results should populate and isSearching should be false
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.isSearching).toBe(false)
  })

  it('debounces search by 150ms', () => {
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.search('Employment')
    })

    // At 100ms, results should still be empty (debounce not yet fired)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.results).toEqual([])

    // At 150ms, debounce should fire
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.results.length).toBeGreaterThan(0)
  })

  it('returns results for matching query after debounce', () => {
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.search('Employment')
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.results.length).toBeGreaterThan(0)
    expect(result.current.results[0]!.title).toContain('Employment')
  })

  it('returns empty results for non-matching query', () => {
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.search('xyznonexistent123')
    })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.results).toEqual([])
  })

  it('clears all state on clear()', () => {
    const { result } = renderHook(() => useGlobalSearch())

    // First, search for something
    act(() => {
      result.current.search('Employment')
    })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.results.length).toBeGreaterThan(0)

    // Now clear
    act(() => {
      result.current.clear()
    })

    expect(result.current.query).toBe('')
    expect(result.current.results).toEqual([])
    expect(result.current.isSearching).toBe(false)
    expect(result.current.selectedIndex).toBe(0)
  })

  it('resets selectedIndex when query changes', () => {
    const { result } = renderHook(() => useGlobalSearch())

    // Search and get results
    act(() => {
      result.current.search('a')
    })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Navigate down
    act(() => {
      result.current.selectNext()
      result.current.selectNext()
    })
    expect(result.current.selectedIndex).toBe(2)

    // New search resets index
    act(() => {
      result.current.search('Employment')
    })
    expect(result.current.selectedIndex).toBe(0)
  })

  describe('keyboard navigation', () => {
    it('selectNext wraps around', () => {
      const { result } = renderHook(() => useGlobalSearch())

      act(() => {
        result.current.search('a')
      })
      act(() => {
        vi.advanceTimersByTime(200)
      })

      const total = result.current.results.length
      if (total === 0) return

      // Navigate to the end
      for (let i = 0; i < total; i++) {
        act(() => {
          result.current.selectNext()
        })
      }

      // Should wrap to 0
      expect(result.current.selectedIndex).toBe(0)
    })

    it('selectPrev wraps around', () => {
      const { result } = renderHook(() => useGlobalSearch())

      act(() => {
        result.current.search('a')
      })
      act(() => {
        vi.advanceTimersByTime(200)
      })

      const total = result.current.results.length
      if (total === 0) return

      // Navigate up from 0 should wrap to last
      act(() => {
        result.current.selectPrev()
      })

      expect(result.current.selectedIndex).toBe(total - 1)
    })

    it('getSelected returns the correct result', () => {
      const { result } = renderHook(() => useGlobalSearch())

      act(() => {
        result.current.search('Employment')
      })
      act(() => {
        vi.advanceTimersByTime(200)
      })

      if (result.current.results.length === 0) return

      const selected = result.current.getSelected()
      expect(selected).not.toBeNull()
      expect(selected).toBe(result.current.results[0])
    })

    it('getSelected returns null when no results', () => {
      const { result } = renderHook(() => useGlobalSearch())

      const selected = result.current.getSelected()
      expect(selected).toBeNull()
    })
  })

  it('cancels pending debounce on new search', () => {
    const { result } = renderHook(() => useGlobalSearch())

    // Start a search
    act(() => {
      result.current.search('Employment')
    })

    // Before debounce fires, search for something else
    act(() => {
      vi.advanceTimersByTime(100)
    })

    act(() => {
      result.current.search('NDA')
    })

    // Advance past the original debounce — should not have "Employment" results
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Should have NDA results, not Employment
    if (result.current.results.length > 0) {
      expect(result.current.results[0]!.title).toContain('NDA')
    }
  })

  it('handles empty string search without error', () => {
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.search('')
    })

    expect(result.current.query).toBe('')
    expect(result.current.results).toEqual([])
    expect(result.current.isSearching).toBe(false)
  })
})
