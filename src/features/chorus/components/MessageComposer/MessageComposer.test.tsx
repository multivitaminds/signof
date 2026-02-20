import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageComposer from './MessageComposer'

describe('MessageComposer', () => {
  it('renders textarea with default placeholder', () => {
    render(<MessageComposer onSend={vi.fn()} />)
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<MessageComposer onSend={vi.fn()} placeholder="Reply..." />)
    expect(screen.getByPlaceholderText('Reply...')).toBeInTheDocument()
  })

  it('disables send button when empty', () => {
    render(<MessageComposer onSend={vi.fn()} />)
    expect(screen.getByLabelText('Send message')).toBeDisabled()
  })

  it('enables send button when content entered', async () => {
    const user = userEvent.setup()
    render(<MessageComposer onSend={vi.fn()} />)

    await user.type(screen.getByLabelText('Message input'), 'Hello')
    expect(screen.getByLabelText('Send message')).toBeEnabled()
  })

  it('calls onSend and clears input on Enter', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<MessageComposer onSend={onSend} />)

    const textarea = screen.getByLabelText('Message input')
    await user.type(textarea, 'Hello world{Enter}')

    expect(onSend).toHaveBeenCalledWith('Hello world')
    expect(textarea).toHaveValue('')
  })

  it('does not send on Shift+Enter', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<MessageComposer onSend={onSend} />)

    await user.type(screen.getByLabelText('Message input'), 'line one{Shift>}{Enter}{/Shift}line two')
    expect(onSend).not.toHaveBeenCalled()
  })

  it('calls onSend when clicking send button', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<MessageComposer onSend={onSend} />)

    await user.type(screen.getByLabelText('Message input'), 'Test message')
    await user.click(screen.getByLabelText('Send message'))

    expect(onSend).toHaveBeenCalledWith('Test message')
  })

  it('does not send empty/whitespace content', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<MessageComposer onSend={onSend} />)

    await user.type(screen.getByLabelText('Message input'), '   {Enter}')
    expect(onSend).not.toHaveBeenCalled()
  })

  it('shows character count warning at 4000+ characters', async () => {
    render(<MessageComposer onSend={vi.fn()} />)

    const textarea = screen.getByLabelText('Message input') as HTMLTextAreaElement
    // Set value directly for performance (typing 4000 chars is too slow)
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set
    nativeInputValueSetter?.call(textarea, 'a'.repeat(4001))
    textarea.dispatchEvent(new Event('change', { bubbles: true }))

    expect(screen.getByText(/4,001 characters/)).toBeInTheDocument()
  })

  it('applies compact class when compact prop is true', () => {
    const { container } = render(<MessageComposer onSend={vi.fn()} compact />)
    expect(container.querySelector('.chorus-composer--compact')).toBeInTheDocument()
  })
})
