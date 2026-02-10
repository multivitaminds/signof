import { renderHook } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  it('fires handler on basic key press', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([{ key: '?', handler }])
    )

    fireEvent.keyDown(document, { key: '?' })
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not fire handler when a different key is pressed', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([{ key: '?', handler }])
    )

    fireEvent.keyDown(document, { key: 'a' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('skips handler when target is an input and ignoreInputs is true (default)', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([{ key: '?', handler }])
    )

    const input = document.createElement('input')
    document.body.appendChild(input)

    fireEvent.keyDown(input, { key: '?' })
    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('skips handler when target is a textarea', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([{ key: '[', handler }])
    )

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    fireEvent.keyDown(textarea, { key: '[' })
    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(textarea)
  })

  it('skips handler when target is contentEditable', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([{ key: '[', handler }])
    )

    const div = document.createElement('div')
    div.contentEditable = 'true'
    document.body.appendChild(div)

    fireEvent.keyDown(div, { key: '[' })
    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(div)
  })

  it('fires handler on input when ignoreInputs is false', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([{ key: 'Escape', handler, ignoreInputs: false }])
    )

    const input = document.createElement('input')
    document.body.appendChild(input)

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(handler).toHaveBeenCalledOnce()

    document.body.removeChild(input)
  })

  it('fires handler for mod+key with metaKey on Mac', () => {
    // Mock navigator.platform to Mac
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    })

    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([{ key: 'mod+k', handler }])
    )

    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not fire mod+key without modifier', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([{ key: 'mod+k', handler }])
    )

    fireEvent.keyDown(document, { key: 'k' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('fires handler for chord sequence (g then h)', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([{ key: '', handler, chord: 'g+h' }])
    )

    fireEvent.keyDown(document, { key: 'g' })
    fireEvent.keyDown(document, { key: 'h' })
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not fire chord when second key does not match', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([{ key: '', handler, chord: 'g+h' }])
    )

    fireEvent.keyDown(document, { key: 'g' })
    fireEvent.keyDown(document, { key: 'x' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not fire chord when timeout expires', () => {
    vi.useFakeTimers()
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([{ key: '', handler, chord: 'g+h' }])
    )

    fireEvent.keyDown(document, { key: 'g' })
    vi.advanceTimersByTime(1100) // Exceed the 1-second timeout
    fireEvent.keyDown(document, { key: 'h' })
    expect(handler).not.toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('cleans up listener on unmount', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ key: '?', handler }])
    )

    unmount()

    fireEvent.keyDown(document, { key: '?' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('handles multiple shortcuts independently', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([
        { key: '?', handler: handler1 },
        { key: '[', handler: handler2 },
      ])
    )

    fireEvent.keyDown(document, { key: '?' })
    expect(handler1).toHaveBeenCalledOnce()
    expect(handler2).not.toHaveBeenCalled()

    fireEvent.keyDown(document, { key: '[' })
    expect(handler2).toHaveBeenCalledOnce()
  })
})
