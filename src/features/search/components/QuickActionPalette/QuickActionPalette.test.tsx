import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuickActionPalette from './QuickActionPalette'
import { registerAction, clearActions } from '../../../../lib/quickActions'
import type { QuickAction } from '../../../../lib/quickActions'

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}))

function makeAction(overrides: Partial<QuickAction> = {}): QuickAction {
  return {
    id: 'test-action',
    label: 'Test Action',
    description: 'A test action',
    icon: 'home',
    module: 'App',
    keywords: ['test'],
    handler: vi.fn(),
    ...overrides,
  }
}

describe('QuickActionPalette', () => {
  beforeEach(() => {
    clearActions()
    localStorage.clear()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <QuickActionPalette isOpen={false} onClose={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog when open', () => {
    registerAction(makeAction({ id: 'a1', label: 'Action One' }))
    render(<QuickActionPalette isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument()
  })

  it('displays registered actions', () => {
    registerAction(makeAction({ id: 'a1', label: 'Go to Home' }))
    registerAction(makeAction({ id: 'a2', label: 'New Document' }))
    render(<QuickActionPalette isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('Go to Home')).toBeInTheDocument()
    expect(screen.getByText('New Document')).toBeInTheDocument()
  })

  it('filters actions when typing', async () => {
    const user = userEvent.setup()
    registerAction(makeAction({ id: 'a1', label: 'Go to Home' }))
    registerAction(makeAction({ id: 'a2', label: 'New Document' }))
    registerAction(makeAction({ id: 'a3', label: 'Toggle Dark Mode' }))

    render(<QuickActionPalette isOpen={true} onClose={vi.fn()} />)

    const input = screen.getByPlaceholderText('Type a command...')
    await user.type(input, 'dark')

    // Text may be split across elements due to highlight marks, so use a custom matcher
    const label = document.querySelector('.quick-action-item__label')
    expect(label).not.toBeNull()
    expect(label?.textContent).toContain('Toggle Dark Mode')
  })

  it('executes action on Enter key', async () => {
    const user = userEvent.setup()
    const handler = vi.fn()
    const onClose = vi.fn()
    registerAction(makeAction({ id: 'a1', label: 'Execute Me', handler }))

    render(<QuickActionPalette isOpen={true} onClose={onClose} />)

    const input = screen.getByPlaceholderText('Type a command...')
    await user.type(input, '{Enter}')

    expect(handler).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    registerAction(makeAction({ id: 'a1', label: 'Action One' }))

    render(<QuickActionPalette isOpen={true} onClose={onClose} />)

    const input = screen.getByPlaceholderText('Type a command...')
    await user.type(input, '{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup()
    registerAction(makeAction({ id: 'a1', label: 'First Action' }))
    registerAction(makeAction({ id: 'a2', label: 'Second Action' }))

    render(<QuickActionPalette isOpen={true} onClose={vi.fn()} />)

    const input = screen.getByPlaceholderText('Type a command...')

    // Move down to second item
    await user.type(input, '{ArrowDown}')

    // Verify the second item has selected class
    const items = document.querySelectorAll('.quick-action-item')
    expect(items.length).toBeGreaterThanOrEqual(2)
    expect(items[1]?.classList.contains('quick-action-item--selected')).toBe(true)
  })

  it('executes action on click', async () => {
    const user = userEvent.setup()
    const handler = vi.fn()
    const onClose = vi.fn()
    registerAction(makeAction({ id: 'a1', label: 'Click Me', handler }))

    render(<QuickActionPalette isOpen={true} onClose={onClose} />)

    await user.click(screen.getByText('Click Me'))

    expect(handler).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows action count in footer', () => {
    registerAction(makeAction({ id: 'a1', label: 'Action One' }))
    registerAction(makeAction({ id: 'a2', label: 'Action Two' }))
    registerAction(makeAction({ id: 'a3', label: 'Action Three' }))

    render(<QuickActionPalette isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('3 actions')).toBeInTheDocument()
  })

  it('shows empty state when no actions match', async () => {
    const user = userEvent.setup()
    registerAction(makeAction({ id: 'a1', label: 'Go to Home' }))

    render(<QuickActionPalette isOpen={true} onClose={vi.fn()} />)

    const input = screen.getByPlaceholderText('Type a command...')
    await user.type(input, 'zzzznothing')

    expect(screen.getByText('No actions found')).toBeInTheDocument()
  })

  it('closes when clicking overlay', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    registerAction(makeAction({ id: 'a1', label: 'Action One' }))

    render(<QuickActionPalette isOpen={true} onClose={onClose} />)

    // Click the overlay (the outermost element)
    const overlay = document.querySelector('.quick-action-palette__overlay')
    if (overlay) {
      await user.click(overlay)
    }

    expect(onClose).toHaveBeenCalled()
  })

  it('displays module badge for each action', () => {
    registerAction(makeAction({ id: 'a1', label: 'Action One', module: 'Documents' }))

    render(<QuickActionPalette isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('Documents')).toBeInTheDocument()
  })

  it('displays shortcut hint when action has shortcut', () => {
    registerAction(makeAction({ id: 'a1', label: 'Action One', shortcut: 'mod+1' }))

    render(<QuickActionPalette isOpen={true} onClose={vi.fn()} />)

    // The shortcut should be rendered (formatted for current platform)
    const kbds = document.querySelectorAll('.quick-action-item__shortcut')
    expect(kbds.length).toBeGreaterThan(0)
  })
})
