import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIWritingAssistant from './AIWritingAssistant'

describe('AIWritingAssistant', () => {
  const defaultProps = {
    selectedText: 'This is a very good and really important text.',
    position: { top: 100, left: 200 },
    onAccept: vi.fn(),
    onDismiss: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the toolbar with all action buttons', () => {
    render(<AIWritingAssistant {...defaultProps} />)
    expect(screen.getByRole('toolbar', { name: /copilot writing assistant/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /improve writing/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fix grammar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /make shorter/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /make longer/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /change tone/i })).toBeInTheDocument()
  })

  it('shows processing state when action is clicked', async () => {
    const user = userEvent.setup()
    render(<AIWritingAssistant {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /improve writing/i }))

    expect(screen.getByLabelText('Processing')).toBeInTheDocument()
    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })

  it('shows suggestion with diff view after processing', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<AIWritingAssistant {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /fix grammar/i }))

    // Advance timers to resolve the processing delay
    vi.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(screen.getByLabelText('Original text')).toBeInTheDocument()
      expect(screen.getByLabelText('Improved text')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /accept suggestion/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dismiss suggestion/i })).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('calls onAccept with improved text when Accept is clicked', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<AIWritingAssistant {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /fix grammar/i }))
    vi.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /accept suggestion/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /accept suggestion/i }))
    expect(defaultProps.onAccept).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('calls onDismiss when Dismiss is clicked', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<AIWritingAssistant {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /fix grammar/i }))
    vi.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /dismiss suggestion/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /dismiss suggestion/i }))
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('shows tone dropdown when Tone button is clicked', async () => {
    const user = userEvent.setup()
    render(<AIWritingAssistant {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /change tone/i }))

    expect(screen.getByRole('menu', { name: /tone options/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /professional/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /casual/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /friendly/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /formal/i })).toBeInTheDocument()
  })

  it('processes tone change when tone option is selected', async () => {
    const user = userEvent.setup()
    render(<AIWritingAssistant {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /change tone/i }))
    await user.click(screen.getByRole('menuitem', { name: /professional/i }))

    expect(screen.getByLabelText('Processing')).toBeInTheDocument()
  })

  it('positions the toolbar at the given position', () => {
    render(<AIWritingAssistant {...defaultProps} />)
    const toolbar = screen.getByRole('toolbar')
    expect(toolbar).toHaveStyle({ top: '100px', left: '200px' })
  })
})
