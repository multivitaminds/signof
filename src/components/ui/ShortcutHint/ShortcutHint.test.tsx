import { render, screen } from '@testing-library/react'
import ShortcutHint from './ShortcutHint'

describe('ShortcutHint', () => {
  it('renders a kbd element', () => {
    render(<ShortcutHint keys="mod+k" />)
    expect(document.querySelector('.shortcut-hint')).toBeInTheDocument()
  })

  it('has aria-label for accessibility', () => {
    render(<ShortcutHint keys="mod+k" />)
    expect(screen.getByLabelText('Keyboard shortcut: mod+k')).toBeInTheDocument()
  })

  it('renders key symbols', () => {
    render(<ShortcutHint keys="mod+k" />)
    const hint = document.querySelector('.shortcut-hint')
    expect(hint).toBeInTheDocument()
    // Should contain either Cmd symbol or Ctrl depending on platform
    const text = hint?.textContent ?? ''
    expect(text).toMatch(/(\u2318|Ctrl)K/)
  })

  it('formats single-letter keys as uppercase', () => {
    render(<ShortcutHint keys="c" />)
    const hint = document.querySelector('.shortcut-hint')
    expect(hint?.textContent).toBe('C')
  })

  it('formats number keys correctly', () => {
    render(<ShortcutHint keys="mod+1" />)
    const hint = document.querySelector('.shortcut-hint')
    const text = hint?.textContent ?? ''
    expect(text).toMatch(/(\u2318|Ctrl)1/)
  })

  it('formats shift modifier', () => {
    render(<ShortcutHint keys="mod+shift+p" />)
    const hint = document.querySelector('.shortcut-hint')
    const text = hint?.textContent ?? ''
    // Should show either Mac symbols or PC text
    expect(text).toMatch(/(\u2318\u21E7|CtrlShift)P/)
  })

  it('formats chord keys', () => {
    render(<ShortcutHint keys="g+h" />)
    const hint = document.querySelector('.shortcut-hint')
    expect(hint?.textContent).toBe('GH')
  })
})
