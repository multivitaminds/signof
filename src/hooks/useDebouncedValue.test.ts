import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('does not update until the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'hello', delay: 300 } }
    )

    rerender({ value: 'world', delay: 300 })

    // Before delay elapses, still old value
    expect(result.current).toBe('hello')

    // Advance partial time
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('hello')
  })

  it('updates after the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'hello', delay: 300 } }
    )

    rerender({ value: 'world', delay: 300 })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('world')
  })

  it('resets the timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    )

    rerender({ value: 'ab', delay: 300 })
    act(() => { vi.advanceTimersByTime(100) })

    rerender({ value: 'abc', delay: 300 })
    act(() => { vi.advanceTimersByTime(100) })

    rerender({ value: 'abcd', delay: 300 })
    act(() => { vi.advanceTimersByTime(100) })

    // Still the initial value because timer keeps resetting
    expect(result.current).toBe('a')

    // Wait full delay after last change
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('abcd')
  })

  it('works with number values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 0, delay: 100 } }
    )

    rerender({ value: 42, delay: 100 })
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe(42)
  })

  it('works with object values', () => {
    const initial = { count: 0 }
    const updated = { count: 1 }

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: initial, delay: 200 } }
    )

    rerender({ value: updated, delay: 200 })
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toBe(updated)
  })
})
