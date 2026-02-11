import { render, screen, within, waitFor } from '@testing-library/react'
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

  it('displays all four shortcut sections', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)
    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('Global')).toBeInTheDocument()
  })

  it('displays shortcut labels', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('New issue')).toBeInTheDocument()
    expect(screen.getByText('Dark mode')).toBeInTheDocument()
    expect(screen.getByText('Help')).toBeInTheDocument()
  })

  it('renders kbd elements for shortcut keys', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    const kbdElements = document.querySelectorAll('.keyboard-help__key')
    expect(kbdElements.length).toBeGreaterThan(0)

    const keyTexts = Array.from(kbdElements).map((el) => el.textContent)
    expect(keyTexts).toContain('?')
    expect(keyTexts).toContain('G')
    expect(keyTexts).toContain('H')
    expect(keyTexts).toContain('C')
    expect(keyTexts).toContain('N')
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

  it('has a search input', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)
    expect(screen.getByLabelText('Search keyboard shortcuts')).toBeInTheDocument()
  })

  it('filters shortcuts based on search query', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    const searchInput = screen.getByLabelText('Search keyboard shortcuts')
    await user.type(searchInput, 'bold')

    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.queryByText('Italic')).not.toBeInTheDocument()
    expect(screen.queryByText('New issue')).not.toBeInTheDocument()
  })

  it('shows empty state when search has no results', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    const searchInput = screen.getByLabelText('Search keyboard shortcuts')
    await user.type(searchInput, 'xyznonexistent')

    await waitFor(() => {
      expect(screen.getByText(/No shortcuts match/)).toBeInTheDocument()
    })
  })

  it('clears search when clear button is clicked', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    const searchInput = screen.getByLabelText('Search keyboard shortcuts')
    await user.type(searchInput, 'bold')

    const clearButton = screen.getByLabelText('Clear search')
    await user.click(clearButton)

    expect(searchInput).toHaveValue('')
    // All shortcuts should be visible again
    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('New issue')).toBeInTheDocument()
  })

  it('collapses and expands sections on toggle click', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    // Navigation section should be visible by default
    expect(screen.getByText('Search')).toBeInTheDocument()

    // Find the Navigation section toggle button
    const toggleButtons = screen.getAllByRole('button', { expanded: true })
    const navigationToggle = toggleButtons.find((btn) =>
      within(btn).queryByText('Navigation')
    )
    expect(navigationToggle).toBeTruthy()

    // Click to collapse the Navigation section
    await user.click(navigationToggle!)

    // Shortcuts under Navigation should be hidden
    expect(screen.queryByText('Search')).not.toBeInTheDocument()

    // Click again to expand
    await user.click(navigationToggle!)

    // Shortcuts should reappear
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('section toggles have aria-expanded attribute', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    const toggleButtons = screen.getAllByRole('button', { expanded: true })
    // Should have 4 section toggles (all expanded by default)
    const sectionToggles = toggleButtons.filter(
      (btn) => btn.classList.contains('keyboard-help__section-toggle')
    )
    expect(sectionToggles).toHaveLength(4)
  })

  it('shows section item count badges', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    const counts = document.querySelectorAll('.keyboard-help__section-count')
    expect(counts.length).toBe(4)
    // Navigation has 7 shortcuts
    expect(counts[0]?.textContent).toBe('7')
    // Editor has 6 shortcuts
    expect(counts[1]?.textContent).toBe('6')
    // Actions has 5 shortcuts
    expect(counts[2]?.textContent).toBe('5')
    // Global has 3 shortcuts
    expect(counts[3]?.textContent).toBe('3')
  })
})
