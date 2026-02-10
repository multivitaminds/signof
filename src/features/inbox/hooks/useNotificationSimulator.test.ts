import { renderHook, act } from '@testing-library/react'
import useNotificationSimulator from './useNotificationSimulator'

const mockAddNotification = vi.fn()

let mockSimulatorEnabled = false

vi.mock('../stores/useInboxStore', () => ({
  useInboxStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      simulatorEnabled: mockSimulatorEnabled,
      addNotification: mockAddNotification,
    }),
}))

describe('useNotificationSimulator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockSimulatorEnabled = false
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not generate notifications when disabled', () => {
    mockSimulatorEnabled = false
    renderHook(() => useNotificationSimulator())

    // Advance time well beyond maximum interval (90s)
    act(() => {
      vi.advanceTimersByTime(120_000)
    })

    expect(mockAddNotification).not.toHaveBeenCalled()
  })

  it('generates a notification after the interval when enabled', () => {
    mockSimulatorEnabled = true

    // Mock Math.random to control the interval (returns 0 => 30s interval)
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    renderHook(() => useNotificationSimulator())

    // Advance past the 30s interval
    act(() => {
      vi.advanceTimersByTime(31_000)
    })

    expect(mockAddNotification).toHaveBeenCalledTimes(1)
    // Verify it was called with a valid notification type
    const callArgs = mockAddNotification.mock.calls[0] as unknown[] | undefined
    expect(callArgs).toBeDefined()
    if (!callArgs) return
    expect(typeof callArgs[0]).toBe('string') // type
    expect(typeof callArgs[1]).toBe('string') // title
    expect(typeof callArgs[2]).toBe('string') // message

    randomSpy.mockRestore()
  })

  it('stops generating notifications when unmounted', () => {
    mockSimulatorEnabled = true

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const { unmount } = renderHook(() => useNotificationSimulator())

    unmount()

    act(() => {
      vi.advanceTimersByTime(120_000)
    })

    expect(mockAddNotification).not.toHaveBeenCalled()

    randomSpy.mockRestore()
  })

  it('generates multiple notifications over time', () => {
    mockSimulatorEnabled = true

    // Use 0 for random => 30s interval, idx 0 template
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    renderHook(() => useNotificationSimulator())

    // Advance through 3 intervals
    act(() => {
      vi.advanceTimersByTime(31_000)
    })
    expect(mockAddNotification).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(31_000)
    })
    expect(mockAddNotification).toHaveBeenCalledTimes(2)

    act(() => {
      vi.advanceTimersByTime(31_000)
    })
    expect(mockAddNotification).toHaveBeenCalledTimes(3)

    randomSpy.mockRestore()
  })
})
