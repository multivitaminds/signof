import { renderHook } from '@testing-library/react'
import { useFocusTrap } from './useFocusTrap'

describe('useFocusTrap', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML = `
      <button data-testid="btn1">First</button>
      <input data-testid="input1" type="text" />
      <button data-testid="btn2">Last</button>
    `
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('focuses the first focusable element on mount', async () => {
    vi.useFakeTimers()
    const ref = { current: container }

    renderHook(() => useFocusTrap(ref))

    vi.advanceTimersByTime(10)

    const firstBtn = container.querySelector('[data-testid="btn1"]') as HTMLElement
    expect(document.activeElement).toBe(firstBtn)

    vi.useRealTimers()
  })

  it('traps Tab at the last element by wrapping to first', () => {
    vi.useFakeTimers()
    const ref = { current: container }

    renderHook(() => useFocusTrap(ref))
    vi.advanceTimersByTime(10)

    // Focus the last button
    const lastBtn = container.querySelector('[data-testid="btn2"]') as HTMLElement
    lastBtn.focus()

    // Simulate Tab keydown
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(event)

    // Should have been prevented (wraps to first)
    // In jsdom, focus doesn't actually move via Tab, but the event should be handled
    expect(event.defaultPrevented).toBe(true)

    vi.useRealTimers()
  })

  it('traps Shift+Tab at the first element by wrapping to last', () => {
    vi.useFakeTimers()
    const ref = { current: container }

    renderHook(() => useFocusTrap(ref))
    vi.advanceTimersByTime(10)

    // Focus is on the first button (auto-focused)
    const firstBtn = container.querySelector('[data-testid="btn1"]') as HTMLElement
    expect(document.activeElement).toBe(firstBtn)

    // Simulate Shift+Tab keydown
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)

    vi.useRealTimers()
  })

  it('returns focus to trigger element on unmount', () => {
    vi.useFakeTimers()
    const triggerBtn = document.createElement('button')
    triggerBtn.textContent = 'Trigger'
    document.body.appendChild(triggerBtn)
    triggerBtn.focus()

    const ref = { current: container }

    const { unmount } = renderHook(() => useFocusTrap(ref))
    vi.advanceTimersByTime(10)

    // Focus should have moved into the container
    expect(document.activeElement).not.toBe(triggerBtn)

    // Unmount: should return focus to trigger
    unmount()
    expect(document.activeElement).toBe(triggerBtn)

    document.body.removeChild(triggerBtn)
    vi.useRealTimers()
  })

  it('does not throw when container has no focusable elements', () => {
    const emptyDiv = document.createElement('div')
    emptyDiv.innerHTML = '<p>No focusable elements</p>'
    document.body.appendChild(emptyDiv)

    const ref = { current: emptyDiv }

    expect(() => {
      vi.useFakeTimers()
      renderHook(() => useFocusTrap(ref))
      vi.advanceTimersByTime(10)
      vi.useRealTimers()
    }).not.toThrow()

    document.body.removeChild(emptyDiv)
  })

  it('ignores disabled elements as focusable', () => {
    const div = document.createElement('div')
    div.innerHTML = `
      <button disabled>Disabled</button>
      <input type="text" data-testid="enabled-input" />
    `
    document.body.appendChild(div)

    vi.useFakeTimers()
    const ref = { current: div }
    renderHook(() => useFocusTrap(ref))
    vi.advanceTimersByTime(10)

    // Focus should be on the input (first non-disabled focusable)
    const input = div.querySelector('[data-testid="enabled-input"]') as HTMLElement
    expect(document.activeElement).toBe(input)

    vi.useRealTimers()
    document.body.removeChild(div)
  })
})
