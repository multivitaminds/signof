import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CommandPalette from './CommandPalette'
import { useAppStore } from '../../stores/useAppStore'

function renderPalette() {
  return render(
    <MemoryRouter>
      <CommandPalette />
    </MemoryRouter>
  )
}

// scrollIntoView is not available in jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('CommandPalette', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.setState({
      commandPaletteOpen: false,
      recentItems: [],
      shortcutHelpOpen: false,
    })
  })

  it('renders nothing when closed', () => {
    renderPalette()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog when open', () => {
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument()
  })

  it('shows navigation commands by default', () => {
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByText('Go to Home')).toBeInTheDocument()
    expect(screen.getByText('Go to Documents')).toBeInTheDocument()
    expect(screen.getByText('Go to Settings')).toBeInTheDocument()
  })

  it('shows action commands by default', () => {
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByText('Create new page')).toBeInTheDocument()
    expect(screen.getByText('Toggle theme')).toBeInTheDocument()
    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument()
  })

  it('filters commands on query input', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const input = screen.getByPlaceholderText('Type a command or search...')
    await user.type(input, 'home')

    expect(screen.getByText(/Home/)).toBeInTheDocument()
    // Non-matching items should be filtered
    expect(screen.queryByText('Go to Calendar')).not.toBeInTheDocument()
  })

  it('shows empty state with hint for no results', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const input = screen.getByPlaceholderText('Type a command or search...')
    await user.type(input, 'xyznonexistent')

    expect(screen.getByText(/No results found/)).toBeInTheDocument()
    expect(screen.getByText('Try searching for pages, documents, or commands')).toBeInTheDocument()
  })

  it('shows shortcut hints for navigation commands', () => {
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByText('G H')).toBeInTheDocument()
    expect(screen.getByText('G D')).toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const input = screen.getByPlaceholderText('Type a command or search...')
    await user.type(input, '{Escape}')

    expect(useAppStore.getState().commandPaletteOpen).toBe(false)
  })

  it('closes on overlay click', async () => {
    const user = userEvent.setup()
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()

    const overlay = screen.getByRole('dialog').parentElement!
    await user.click(overlay)

    expect(useAppStore.getState().commandPaletteOpen).toBe(false)
  })

  it('shows recent items when query is empty and recents exist', () => {
    useAppStore.setState({
      commandPaletteOpen: true,
      recentItems: [
        { path: '/pages', label: 'Pages', timestamp: Date.now() },
        { path: '/settings', label: 'Settings', timestamp: Date.now() - 1000 },
      ],
    })
    renderPalette()
    expect(screen.getByText('Recent')).toBeInTheDocument()
  })

  it('shows keyboard footer hints', () => {
    useAppStore.setState({ commandPaletteOpen: true })
    renderPalette()
    expect(screen.getByText('to navigate')).toBeInTheDocument()
    expect(screen.getByText('to select')).toBeInTheDocument()
    expect(screen.getByText('to close')).toBeInTheDocument()
  })
})
