import { renderHook, act } from '@testing-library/react'
import { useSmartCompose } from './useSmartCompose'

vi.mock('../lib/smartComposeEngine', () => ({
  getSmartSuggestion: vi.fn((ctx: { draft: string }) => {
    if (ctx.draft.startsWith('thanks')) {
      return Promise.resolve('thanks for the update!')
    }
    return Promise.resolve(null)
  }),
}))

describe('useSmartCompose', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns null suggestion initially', () => {
    const { result } = renderHook(() => useSmartCompose())
    expect(result.current.suggestion).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('does not trigger for short input', () => {
    const { result } = renderHook(() => useSmartCompose())

    act(() => {
      result.current.onDraftChange('hi')
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.suggestion).toBeNull()
  })

  it('debounces and returns suggestion after 500ms', async () => {
    const { result } = renderHook(() => useSmartCompose({ channelName: 'general' }))

    act(() => {
      result.current.onDraftChange('thanks')
    })

    expect(result.current.isLoading).toBe(true)

    // Advance past debounce
    await act(async () => {
      vi.advanceTimersByTime(500)
      await Promise.resolve()
    })

    expect(result.current.suggestion).toBe('thanks for the update!')
    expect(result.current.isLoading).toBe(false)
  })

  it('clears suggestion on new draft change', async () => {
    const { result } = renderHook(() => useSmartCompose())

    act(() => {
      result.current.onDraftChange('thanks')
    })

    await act(async () => {
      vi.advanceTimersByTime(500)
      await Promise.resolve()
    })

    expect(result.current.suggestion).toBe('thanks for the update!')

    act(() => {
      result.current.onDraftChange('something else')
    })

    expect(result.current.suggestion).toBeNull()
  })

  it('acceptSuggestion returns and clears suggestion', async () => {
    const { result } = renderHook(() => useSmartCompose())

    act(() => {
      result.current.onDraftChange('thanks')
    })

    await act(async () => {
      vi.advanceTimersByTime(500)
      await Promise.resolve()
    })

    let accepted: string | null = null
    act(() => {
      accepted = result.current.acceptSuggestion()
    })

    expect(accepted).toBe('thanks for the update!')
    expect(result.current.suggestion).toBeNull()
  })

  it('dismissSuggestion clears suggestion', async () => {
    const { result } = renderHook(() => useSmartCompose())

    act(() => {
      result.current.onDraftChange('thanks')
    })

    await act(async () => {
      vi.advanceTimersByTime(500)
      await Promise.resolve()
    })

    act(() => {
      result.current.dismissSuggestion()
    })

    expect(result.current.suggestion).toBeNull()
  })

  it('does not fetch when disabled', () => {
    const { result } = renderHook(() => useSmartCompose({ enabled: false }))

    act(() => {
      result.current.onDraftChange('thanks')
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('returns null for unmatched patterns', async () => {
    const { result } = renderHook(() => useSmartCompose())

    act(() => {
      result.current.onDraftChange('the quick brown fox')
    })

    await act(async () => {
      vi.advanceTimersByTime(500)
      await Promise.resolve()
    })

    expect(result.current.suggestion).toBeNull()
  })
})
