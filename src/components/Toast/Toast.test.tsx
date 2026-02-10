import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToastProvider from './ToastProvider'
import { useToast } from './useToast'

// Helper component that triggers toasts via buttons
function ToastTrigger() {
  const { toast, dismiss, dismissAll } = useToast()

  return (
    <div>
      <button
        onClick={() => toast({ title: 'Success toast', variant: 'success' })}
      >
        Add Success
      </button>
      <button
        onClick={() =>
          toast({
            title: 'Error toast',
            description: 'Something went wrong',
            variant: 'error',
          })
        }
      >
        Add Error
      </button>
      <button
        onClick={() => toast({ title: 'Warning toast', variant: 'warning' })}
      >
        Add Warning
      </button>
      <button
        onClick={() => toast({ title: 'Info toast', variant: 'info' })}
      >
        Add Info
      </button>
      <button
        onClick={() => {
          const id = toast({ title: 'Dismissable', variant: 'info', duration: 0 })
          // Store id in data attribute so tests can access it
          const btn = document.querySelector('[data-testid="dismiss-btn"]')
          if (btn) btn.setAttribute('data-toast-id', id)
        }}
      >
        Add Persistent
      </button>
      <button data-testid="dismiss-btn" onClick={(e) => {
        const id = (e.target as HTMLElement).getAttribute('data-toast-id')
        if (id) dismiss(id)
      }}>
        Dismiss By ID
      </button>
      <button onClick={dismissAll}>
        Dismiss All
      </button>
      <button
        onClick={() =>
          toast({ title: 'Quick toast', variant: 'success', duration: 100 })
        }
      >
        Add Quick
      </button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <ToastTrigger />
    </ToastProvider>
  )
}

describe('Toast System', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a success toast', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProvider()

    await user.click(screen.getByText('Add Success'))

    expect(screen.getByText('Success toast')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('toast-item--success')
  })

  it('renders an error toast with description', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProvider()

    await user.click(screen.getByText('Add Error'))

    expect(screen.getByText('Error toast')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('toast-item--error')
  })

  it('renders warning variant', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProvider()

    await user.click(screen.getByText('Add Warning'))

    expect(screen.getByText('Warning toast')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('toast-item--warning')
  })

  it('renders info variant', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProvider()

    await user.click(screen.getByText('Add Info'))

    expect(screen.getByText('Info toast')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('toast-item--info')
  })

  it('auto-dismisses after default duration (4s)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProvider()

    await user.click(screen.getByText('Add Success'))
    expect(screen.getByText('Success toast')).toBeInTheDocument()

    // Advance past default 4s + 200ms exit animation
    act(() => {
      vi.advanceTimersByTime(4200)
    })

    expect(screen.queryByText('Success toast')).not.toBeInTheDocument()
  })

  it('auto-dismisses after custom duration', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProvider()

    await user.click(screen.getByText('Add Quick'))
    expect(screen.getByText('Quick toast')).toBeInTheDocument()

    // Advance past 100ms + 200ms exit animation
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(screen.queryByText('Quick toast')).not.toBeInTheDocument()
  })

  it('manually dismisses when X button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProvider()

    await user.click(screen.getByText('Add Success'))
    expect(screen.getByText('Success toast')).toBeInTheDocument()

    const dismissBtn = screen.getByLabelText('Dismiss notification')
    await user.click(dismissBtn)

    // Wait for exit animation
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.queryByText('Success toast')).not.toBeInTheDocument()
  })

  it('stacks multiple toasts', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProvider()

    await user.click(screen.getByText('Add Success'))
    await user.click(screen.getByText('Add Error'))
    await user.click(screen.getByText('Add Warning'))

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(3)
  })

  it('limits to 5 toasts, removing oldest when exceeded', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProvider()

    // Add 6 toasts - persistent so they don't auto-dismiss
    for (let i = 0; i < 6; i++) {
      await user.click(screen.getByText('Add Persistent'))
    }

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(5)
  })

  it('dismissAll removes all toasts', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProvider()

    await user.click(screen.getByText('Add Success'))
    await user.click(screen.getByText('Add Error'))
    expect(screen.getAllByRole('alert')).toHaveLength(2)

    await user.click(screen.getByText('Dismiss All'))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders toast container with proper aria label', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithProvider()

    await user.click(screen.getByText('Add Success'))

    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
  })

  it('does not render toast container when there are no toasts', () => {
    renderWithProvider()
    expect(screen.queryByLabelText('Notifications')).not.toBeInTheDocument()
  })
})

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function BadComponent() {
      useToast()
      return null
    }

    expect(() => render(<BadComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    )

    spy.mockRestore()
  })
})
