import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TiptapPageLinkMenu from './TiptapPageLinkMenu'

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
  const editor = createMockEditor('[[')
  const result = render(<TiptapPageLinkMenu editor={editor as never} />)

  editor._triggerInput()

  return { editor, ...result }
}

// ─── Tests ───────────────────────────────────────────────────────

describe('TiptapPageLinkMenu', () => {
  it('renders nothing when menu is not triggered', () => {
    const editor = createMockEditor('')
    const { container } = render(<TiptapPageLinkMenu editor={editor as never} />)
    expect(container.innerHTML).toBe('')
  })

  it('opens and shows pages when "[[" is typed', () => {
    openMenu()

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByText('Link to page')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
    expect(screen.getByText('Project Ideas')).toBeInTheDocument()
  })

  it('shows page icons', () => {
    openMenu()

    const items = screen.getAllByRole('option')
    expect(items.length).toBeGreaterThan(0)
  })

  it('shows "Updated" date for each page', () => {
    openMenu()

    const dateTexts = screen.getAllByText(/^Updated/)
    expect(dateTexts.length).toBeGreaterThan(0)
  })

  it('filters pages by query via transaction', () => {
    // Open menu with just "[["
    const editor = createMockEditor('[[')
    render(<TiptapPageLinkMenu editor={editor as never} />)
    editor._triggerInput()

    // Simulate user typing "meet" after "[["
    editor.state.doc.resolve = vi.fn().mockReturnValue({
      parent: { textBetween: vi.fn().mockReturnValue('[[meet') },
      parentOffset: 6,
      start: vi.fn().mockReturnValue(1),
    })
    editor.state.selection = { from: 7 } as never
    editor._triggerTransaction()

    expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
    expect(screen.queryByText('Getting Started')).not.toBeInTheDocument()
  })

  it('shows empty state when no pages match', () => {
    // Open menu with just "[["
    const editor = createMockEditor('[[')
    render(<TiptapPageLinkMenu editor={editor as never} />)
    editor._triggerInput()

    // Simulate user typing "zzzxxx" after "[["
    editor.state.doc.resolve = vi.fn().mockReturnValue({
      parent: { textBetween: vi.fn().mockReturnValue('[[zzzxxx') },
      parentOffset: 8,
      start: vi.fn().mockReturnValue(1),
    })
    editor.state.selection = { from: 9 } as never
    editor._triggerTransaction()

    expect(screen.getByText('No pages found')).toBeInTheDocument()
  })

  it('limits results to 8 items', () => {
    openMenu()

    const items = screen.getAllByRole('option')
    expect(items.length).toBeLessThanOrEqual(8)
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

  it('calls editor chain on Enter to insert page link', async () => {
    const user = userEvent.setup()
    const { editor } = openMenu()

    await user.keyboard('{Enter}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(editor.chain).toHaveBeenCalled()
  })

  it('has correct accessibility attributes', () => {
    openMenu()

    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveAttribute('aria-label', 'Link to a page')

    const options = screen.getAllByRole('option')
    expect(options.length).toBeGreaterThan(0)
  })
})
