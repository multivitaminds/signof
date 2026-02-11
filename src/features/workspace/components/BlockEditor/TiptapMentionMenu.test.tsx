import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TiptapMentionMenu from './TiptapMentionMenu'

// ─── Mock Tiptap Editor ──────────────────────────────────────────

function createMockEditor(textBefore = '') {
  const listeners: Record<string, Array<() => void>> = {}
  const dom = document.createElement('div')

  const editor = {
    view: {
      dom,
      coordsAtPos: vi.fn().mockReturnValue({ top: 100, bottom: 120, left: 200, right: 220 }),
    },
    state: {
      selection: { from: textBefore.length + 1 },
      doc: {
        resolve: vi.fn().mockReturnValue({
          parent: {
            textBetween: vi.fn().mockReturnValue(textBefore),
          },
          parentOffset: textBefore.length,
          start: vi.fn().mockReturnValue(1),
        }),
      },
    },
    on: vi.fn((event: string, fn: () => void) => {
      if (!listeners[event]) listeners[event] = []
      listeners[event].push(fn)
    }),
    off: vi.fn((event: string, fn: () => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((f) => f !== fn)
      }
    }),
    chain: vi.fn().mockReturnValue({
      focus: vi.fn().mockReturnValue({
        deleteRange: vi.fn().mockReturnValue({
          insertContentAt: vi.fn().mockReturnValue({
            run: vi.fn(),
          }),
        }),
      }),
    }),
    _listeners: listeners,
    _triggerTransaction() {
      act(() => {
        listeners['transaction']?.forEach((fn) => fn())
      })
    },
    _triggerInput() {
      act(() => {
        dom.dispatchEvent(new Event('input'))
      })
    },
  }

  return editor
}

// ─── Helpers ─────────────────────────────────────────────────────

function openMenu() {
  const editor = createMockEditor('@')
  const result = render(<TiptapMentionMenu editor={editor as never} />)

  editor._triggerInput()

  return { editor, ...result }
}

// ─── Tests ───────────────────────────────────────────────────────

describe('TiptapMentionMenu', () => {
  it('renders nothing when menu is not triggered', () => {
    const editor = createMockEditor('')
    const { container } = render(<TiptapMentionMenu editor={editor as never} />)
    expect(container.innerHTML).toBe('')
  })

  it('opens and shows team members when "@" is typed', () => {
    openMenu()

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Team members')).toBeInTheDocument()
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.getByText('Mike Rivera')).toBeInTheDocument()
    expect(screen.getByText('Emma Davis')).toBeInTheDocument()
  })

  it('shows member emails', () => {
    openMenu()

    expect(screen.getByText('alex@signof.com')).toBeInTheDocument()
    expect(screen.getByText('sarah@signof.com')).toBeInTheDocument()
  })

  it('shows initials as avatar', () => {
    openMenu()

    expect(screen.getByText('AJ')).toBeInTheDocument()
    expect(screen.getByText('SC')).toBeInTheDocument()
  })

  it('filters members by query via transaction', () => {
    // Open menu with just "@"
    const editor = createMockEditor('@')
    render(<TiptapMentionMenu editor={editor as never} />)
    editor._triggerInput()

    // Simulate user typing "sar" after "@"
    editor.state.doc.resolve = vi.fn().mockReturnValue({
      parent: { textBetween: vi.fn().mockReturnValue('@sar') },
      parentOffset: 4,
      start: vi.fn().mockReturnValue(1),
    })
    editor.state.selection = { from: 5 } as never
    editor._triggerTransaction()

    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.queryByText('Alex Johnson')).not.toBeInTheDocument()
  })

  it('shows empty state when no members match', () => {
    // Open menu with just "@"
    const editor = createMockEditor('@')
    render(<TiptapMentionMenu editor={editor as never} />)
    editor._triggerInput()

    // Simulate user typing "xyz" after "@"
    editor.state.doc.resolve = vi.fn().mockReturnValue({
      parent: { textBetween: vi.fn().mockReturnValue('@xyz') },
      parentOffset: 4,
      start: vi.fn().mockReturnValue(1),
    })
    editor.state.selection = { from: 5 } as never
    editor._triggerTransaction()

    expect(screen.getByText('No members found')).toBeInTheDocument()
  })

  it('selects first item by default', () => {
    openMenu()

    const items = screen.getAllByRole('option')
    expect(items[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup()
    openMenu()

    const items = screen.getAllByRole('option')
    expect(items[0]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown}')
    const updatedItems = screen.getAllByRole('option')
    expect(updatedItems[1]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowUp}')
    const reUpdated = screen.getAllByRole('option')
    expect(reUpdated[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    openMenu()

    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('calls editor chain on Enter to insert mention', async () => {
    const user = userEvent.setup()
    const { editor } = openMenu()

    await user.keyboard('{Enter}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(editor.chain).toHaveBeenCalled()
  })

  it('has correct accessibility attributes', () => {
    openMenu()

    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveAttribute('aria-label', 'Mention a team member')

    const options = screen.getAllByRole('option')
    expect(options.length).toBeGreaterThan(0)
  })
})
