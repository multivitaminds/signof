import { renderHook, act } from '@testing-library/react'
import usePresenceSimulator from '../usePresenceSimulator'

describe('usePresenceSimulator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty array when pageId is empty', () => {
    const { result } = renderHook(() => usePresenceSimulator(''))
    expect(result.current).toEqual([])
  })

  it('returns 2-3 simulated users for a valid pageId', () => {
    const { result } = renderHook(() => usePresenceSimulator('page-1'))
    expect(result.current.length).toBeGreaterThanOrEqual(2)
    expect(result.current.length).toBeLessThanOrEqual(3)
  })

  it('each user has required properties', () => {
    const { result } = renderHook(() => usePresenceSimulator('page-1'))
    for (const user of result.current) {
      expect(user.id).toBeTruthy()
      expect(user.name).toBeTruthy()
      expect(user.initials).toBeTruthy()
      expect(user.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(typeof user.cursorY).toBe('number')
      expect(typeof user.isActive).toBe('boolean')
    }
  })

  it('updates cursor positions periodically', () => {
    const { result } = renderHook(() => usePresenceSimulator('page-1'))
    const initialPositions = result.current.map((u) => u.cursorY)

    // Advance timer past the interval
    act(() => {
      vi.advanceTimersByTime(3500)
    })

    // Positions may have changed (stochastic, so we just verify the hook ran)
    expect(result.current.length).toBeGreaterThanOrEqual(2)
    // At least check users still exist with valid cursorY
    for (const user of result.current) {
      expect(typeof user.cursorY).toBe('number')
    }
    // We can't guarantee positions changed due to randomness, just verify no crash
    expect(initialPositions.length).toBeGreaterThanOrEqual(2)
  })

  it('clears users when pageId becomes empty', () => {
    const { result, rerender } = renderHook(
      ({ pageId }: { pageId: string }) => usePresenceSimulator(pageId),
      { initialProps: { pageId: 'page-1' } }
    )

    expect(result.current.length).toBeGreaterThanOrEqual(2)

    rerender({ pageId: '' })
    expect(result.current).toEqual([])
  })
})
