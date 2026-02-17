import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageComposer from './MessageComposer'

describe('MessageComposer', () => {
  const defaultProps = {
    onSend: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders textarea and send button', () => {
    render(<MessageComposer {...defaultProps} />)
    expect(screen.getByLabelText('Message input')).toBeInTheDocument()
    expect(screen.getByLabelText('Send message')).toBeInTheDocument()
  })

  it('types message and sends on button click', async () => {
    const user = userEvent.setup()
    render(<MessageComposer {...defaultProps} />)

    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Hello world')
    await user.click(screen.getByLabelText('Send message'))

    expect(defaultProps.onSend).toHaveBeenCalledWith('Hello world')
  })

  it('clears input after sending', async () => {
    const user = userEvent.setup()
    render(<MessageComposer {...defaultProps} />)

    const input = screen.getByLabelText('Message input') as HTMLTextAreaElement
    await user.type(input, 'Hello')
    await user.click(screen.getByLabelText('Send message'))

    expect(input.value).toBe('')
  })

  it('sends on Enter key press', async () => {
    const user = userEvent.setup()
    render(<MessageComposer {...defaultProps} />)

    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Hello{Enter}')

    expect(defaultProps.onSend).toHaveBeenCalledWith('Hello')
  })

  it('does not send on Shift+Enter', async () => {
    const user = userEvent.setup()
    render(<MessageComposer {...defaultProps} />)

    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Hello{Shift>}{Enter}{/Shift}')

    expect(defaultProps.onSend).not.toHaveBeenCalled()
  })

  it('does not send empty messages', async () => {
    const user = userEvent.setup()
    render(<MessageComposer {...defaultProps} />)

    await user.click(screen.getByLabelText('Send message'))
    expect(defaultProps.onSend).not.toHaveBeenCalled()
  })

  it('does not send whitespace-only messages', async () => {
    const user = userEvent.setup()
    render(<MessageComposer {...defaultProps} />)

    const input = screen.getByLabelText('Message input')
    await user.type(input, '   ')
    await user.click(screen.getByLabelText('Send message'))

    expect(defaultProps.onSend).not.toHaveBeenCalled()
  })

  it('shows channel name when provided', () => {
    render(<MessageComposer {...defaultProps} channelName="Slack" />)
    expect(screen.getByText('Replying via Slack')).toBeInTheDocument()
  })

  it('disables input when disabled prop is true', () => {
    render(<MessageComposer {...defaultProps} disabled={true} />)
    expect(screen.getByLabelText('Message input')).toBeDisabled()
    expect(screen.getByLabelText('Send message')).toBeDisabled()
  })

  it('shows disabled placeholder text', () => {
    render(<MessageComposer {...defaultProps} disabled={true} />)
    expect(screen.getByPlaceholderText('Messaging disabled')).toBeInTheDocument()
  })
})
