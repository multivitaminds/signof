import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KeyboardShortcutHelp from './KeyboardShortcutHelp'
import { useAppStore } from '../../stores/useAppStore'

describe('KeyboardShortcutHelp', () => {
  beforeEach(() => {
    useAppStore.setState({ shortcutHelpOpen: false })
  })

  it('renders nothing when shortcutHelpOpen is false', () => {
    const { container } = render(<KeyboardShortcutHelp />)
    expect(container.innerHTML).toBe('')
  })

  it('renders modal content when shortcutHelpOpen is true', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('displays all shortcut groups', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Navigation (G + ...)')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('displays shortcut descriptions', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)
    expect(screen.getByText('Open command palette')).toBeInTheDocument()
    expect(screen.getByText('Toggle sidebar')).toBeInTheDocument()
    expect(screen.getByText('Go to Home')).toBeInTheDocument()
    expect(screen.getByText('Create new')).toBeInTheDocument()
    expect(screen.getByText('New document')).toBeInTheDocument()
  })

  it('calls closeShortcutHelp when close button is clicked', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    await user.click(screen.getByLabelText('Close keyboard shortcuts'))
    expect(useAppStore.getState().shortcutHelpOpen).toBe(false)
  })

  it('calls closeShortcutHelp when overlay is clicked', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    const overlay = screen.getByRole('dialog')
    await user.click(overlay)
    expect(useAppStore.getState().shortcutHelpOpen).toBe(false)
  })

  it('renders kbd elements for shortcut keys', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    const kbdElements = document.querySelectorAll('.shortcut-help__key')
    expect(kbdElements.length).toBeGreaterThan(0)

    const keyTexts = Array.from(kbdElements).map((el) => el.textContent)
    expect(keyTexts).toContain('?')
    expect(keyTexts).toContain('[')
    expect(keyTexts).toContain('G')
    expect(keyTexts).toContain('H')
    expect(keyTexts).toContain('C')
    expect(keyTexts).toContain('N')
  })
})
