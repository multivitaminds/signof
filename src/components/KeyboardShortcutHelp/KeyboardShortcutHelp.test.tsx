import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KeyboardShortcutHelp from './KeyboardShortcutHelp'
import { useAppStore } from '../../stores/useAppStore'
import { clearRegistry } from '../../lib/shortcutRegistry'

describe('KeyboardShortcutHelp', () => {
  beforeEach(() => {
    useAppStore.setState({ shortcutHelpOpen: false })
    clearRegistry()
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

  it('displays shortcut sections', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)
    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('Creation')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('View')).toBeInTheDocument()
  })

  it('displays shortcut labels from fallback data', () => {
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
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    // Advance past the 100ms setTimeout that resets search on open
    vi.advanceTimersByTime(150)

    const searchInput = screen.getByLabelText('Search keyboard shortcuts')
    await user.type(searchInput, 'xyznonexistent')

    expect(screen.getByText(/No shortcuts match/)).toBeInTheDocument()
    vi.useRealTimers()
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
    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('New issue')).toBeInTheDocument()
  })

  it('collapses and expands sections on toggle click', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    // Search should be visible in the Navigation section
    expect(screen.getByText('Search')).toBeInTheDocument()

    // Find the Navigation section toggle button
    const toggleButtons = screen.getAllByRole('button', { expanded: true })
    const navigationToggle = toggleButtons.find((btn) =>
      within(btn).queryByText('Navigation')
    )
    expect(navigationToggle).toBeTruthy()

    await user.click(navigationToggle!)
    // Shortcuts under Navigation should be hidden
    expect(screen.queryByText('Home')).not.toBeInTheDocument()

    await user.click(navigationToggle!)
    // Shortcuts should reappear
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('section toggles have aria-expanded attribute', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    const toggleButtons = screen.getAllByRole('button', { expanded: true })
    const sectionToggles = toggleButtons.filter(
      (btn) => btn.classList.contains('keyboard-help__section-toggle')
    )
    expect(sectionToggles.length).toBeGreaterThanOrEqual(3)
  })

  it('shows section item count badges', () => {
    useAppStore.setState({ shortcutHelpOpen: true })
    render(<KeyboardShortcutHelp />)

    const counts = document.querySelectorAll('.keyboard-help__section-count')
    expect(counts.length).toBeGreaterThanOrEqual(3)
    // Each count should be a positive integer
    for (const count of Array.from(counts)) {
      const num = parseInt(count.textContent ?? '0', 10)
      expect(num).toBeGreaterThan(0)
    }
  })
})
