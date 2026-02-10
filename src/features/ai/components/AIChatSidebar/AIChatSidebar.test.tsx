import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useAIChatStore from '../../stores/useAIChatStore'
import AIChatSidebar from './AIChatSidebar'

describe('AIChatSidebar', () => {
  beforeEach(() => {
    useAIChatStore.setState({
      messages: [],
      isOpen: true,
      contextLabel: 'Home',
    })
  })

  it('renders nothing when isOpen is false', () => {
    useAIChatStore.setState({ isOpen: false })
    const { container } = render(<AIChatSidebar />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the sidebar when isOpen is true', () => {
    render(<AIChatSidebar />)
    expect(screen.getByRole('complementary', { name: /ai chat/i })).toBeInTheDocument()
  })

  it('renders the AI Assistant title', () => {
    render(<AIChatSidebar />)
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
  })

  it('shows the context label', () => {
    useAIChatStore.setState({ contextLabel: 'Documents' })
    render(<AIChatSidebar />)
    expect(screen.getByText(/Reading: Documents/)).toBeInTheDocument()
  })

  it('shows empty state when no messages', () => {
    render(<AIChatSidebar />)
    expect(screen.getByText(/ask me anything about your workspace/i)).toBeInTheDocument()
  })

  it('renders existing messages', () => {
    useAIChatStore.setState({
      messages: [
        { id: '1', role: 'user', content: 'Hello there', timestamp: new Date().toISOString() },
        { id: '2', role: 'assistant', content: 'Hi! How can I help?', timestamp: new Date().toISOString() },
      ],
    })
    render(<AIChatSidebar />)

    expect(screen.getByText('Hello there')).toBeInTheDocument()
    expect(screen.getByText('Hi! How can I help?')).toBeInTheDocument()
  })

  it('renders quick action buttons', () => {
    render(<AIChatSidebar />)
    expect(screen.getByText('Summarize this page')).toBeInTheDocument()
    expect(screen.getByText('Create action items')).toBeInTheDocument()
    expect(screen.getByText('Translate')).toBeInTheDocument()
    expect(screen.getByText('Explain')).toBeInTheDocument()
  })

  it('has a message input field', () => {
    render(<AIChatSidebar />)
    expect(screen.getByPlaceholderText('Ask AI anything...')).toBeInTheDocument()
  })

  it('has a send button', () => {
    render(<AIChatSidebar />)
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('disables send button when input is empty', () => {
    render(<AIChatSidebar />)
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled()
  })

  it('enables send button when input has text', async () => {
    const user = userEvent.setup()
    render(<AIChatSidebar />)

    await user.type(screen.getByPlaceholderText('Ask AI anything...'), 'Hello')
    expect(screen.getByRole('button', { name: /send message/i })).not.toBeDisabled()
  })

  it('sends a message when send button is clicked', async () => {
    const user = userEvent.setup()
    render(<AIChatSidebar />)

    const input = screen.getByPlaceholderText('Ask AI anything...')
    await user.type(input, 'Test message')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    // User message should appear
    expect(screen.getByText('Test message')).toBeInTheDocument()
    // Input should be cleared
    expect(input).toHaveValue('')
  })

  it('sends a message when Enter key is pressed', async () => {
    const user = userEvent.setup()
    render(<AIChatSidebar />)

    const input = screen.getByPlaceholderText('Ask AI anything...')
    await user.type(input, 'Enter test{Enter}')

    expect(screen.getByText('Enter test')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('sends message when quick action chip is clicked', async () => {
    const user = userEvent.setup()
    render(<AIChatSidebar />)

    await user.click(screen.getByText('Summarize this page'))

    // After clicking, a user message is added to the store
    const { messages } = useAIChatStore.getState()
    expect(messages.some(m => m.role === 'user' && m.content === 'Summarize this page')).toBe(true)
  })

  it('has a clear messages button', () => {
    render(<AIChatSidebar />)
    expect(screen.getByRole('button', { name: /clear messages/i })).toBeInTheDocument()
  })

  it('clears messages when clear button is clicked', async () => {
    const user = userEvent.setup()
    useAIChatStore.setState({
      messages: [
        { id: '1', role: 'user', content: 'Old message', timestamp: new Date().toISOString() },
      ],
    })
    render(<AIChatSidebar />)

    expect(screen.getByText('Old message')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /clear messages/i }))

    expect(screen.queryByText('Old message')).not.toBeInTheDocument()
  })

  it('has a close button', () => {
    render(<AIChatSidebar />)
    expect(screen.getByRole('button', { name: /close ai chat/i })).toBeInTheDocument()
  })

  it('closes sidebar when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<AIChatSidebar />)

    await user.click(screen.getByRole('button', { name: /close ai chat/i }))

    // isOpen should now be false, so sidebar won't render
    expect(useAIChatStore.getState().isOpen).toBe(false)
  })
})
