import { renderHook, act } from '@testing-library/react'
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery'

describe('useMediaQuery', () => {
  let listeners: Array<() => void> = []
  let currentMatches = false

  beforeEach(() => {
    listeners = []
    currentMatches = false

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: currentMatches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_event: string, handler: () => void) => {
          listeners.push(handler)
        }),
        removeEventListener: vi.fn((_event: string, handler: () => void) => {
          listeners = listeners.filter((l) => l !== handler)
        }),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('returns false by default when no match', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    expect(result.current).toBe(false)
  })

  it('returns true when media query matches', () => {
    currentMatches = true
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    expect(result.current).toBe(true)
  })

  it('calls window.matchMedia with the query', () => {
    renderHook(() => useMediaQuery('(min-width: 1025px)'))
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1025px)')
  })

  it('adds and removes event listener on mount/unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    // Should have added a listener
    expect(listeners.length).toBeGreaterThan(0)

    const listenerCount = listeners.length
    unmount()
    // After unmount, listener should be removed
    expect(listeners.length).toBeLessThan(listenerCount)
  })

  it('updates when media query changes', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    expect(result.current).toBe(false)

    // Simulate media query change
    currentMatches = true
    // Re-mock matchMedia to return new result
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // Trigger the listener
    act(() => {
      listeners.forEach((l) => l())
    })
  })
})

describe('useIsMobile', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('queries max-width 767px', () => {
    renderHook(() => useIsMobile())
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })
})

describe('useIsTablet', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('queries correct tablet range', () => {
    renderHook(() => useIsTablet())
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px) and (max-width: 1024px)')
  })
})

describe('useIsDesktop', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('queries min-width 1025px', () => {
    renderHook(() => useIsDesktop())
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1025px)')
  })
})
