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
      currentRoute: '/',
      isTyping: false,
    })
  })

  it('renders nothing when isOpen is false', () => {
    useAIChatStore.setState({ isOpen: false })
    const { container } = render(<AIChatSidebar />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the sidebar when isOpen is true', () => {
    render(<AIChatSidebar />)
    expect(screen.getByRole('complementary', { name: /copilot chat/i })).toBeInTheDocument()
  })

  it('renders the Copilot title', () => {
    render(<AIChatSidebar />)
    expect(screen.getByText('Copilot')).toBeInTheDocument()
  })

  it('shows the context label', () => {
    useAIChatStore.setState({ contextLabel: 'Documents' })
    render(<AIChatSidebar />)
    expect(screen.getByText(/Reading: Documents/)).toBeInTheDocument()
  })

  it('shows empty state when no messages', () => {
    render(<AIChatSidebar />)
    expect(screen.getByText(/get insights across your workspace/i)).toBeInTheDocument()
  })

  it('shows slash command hint in empty state', () => {
    render(<AIChatSidebar />)
    expect(screen.getByText(/Use commands/)).toBeInTheDocument()
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

  it('has a message input field with slash command hint', () => {
    render(<AIChatSidebar />)
    expect(screen.getByPlaceholderText(/Ask Copilot anything/)).toBeInTheDocument()
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

    await user.type(screen.getByPlaceholderText(/Ask Copilot anything/), 'Hello')
    expect(screen.getByRole('button', { name: /send message/i })).not.toBeDisabled()
  })

  it('sends a message when send button is clicked', async () => {
    const user = userEvent.setup()
    render(<AIChatSidebar />)

    const input = screen.getByPlaceholderText(/Ask Copilot anything/)
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

    const input = screen.getByPlaceholderText(/Ask Copilot anything/)
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
    expect(screen.getByRole('button', { name: /close copilot chat/i })).toBeInTheDocument()
  })

  it('closes sidebar when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<AIChatSidebar />)

    await user.click(screen.getByRole('button', { name: /close copilot chat/i }))

    // isOpen should now be false, so sidebar won't render
    expect(useAIChatStore.getState().isOpen).toBe(false)
  })

  // ─── Context-aware hint tests ──────────────────────────────────────

  it('shows context hint for /pages route', () => {
    useAIChatStore.setState({ currentRoute: '/pages/my-page' })
    render(<AIChatSidebar />)
    expect(screen.getByText(/I can help with this page/)).toBeInTheDocument()
  })

  it('shows context hint for /projects route', () => {
    useAIChatStore.setState({ currentRoute: '/projects/proj-1' })
    render(<AIChatSidebar />)
    expect(screen.getByText(/I can help with this project/)).toBeInTheDocument()
  })

  it('shows context hint for /data route', () => {
    useAIChatStore.setState({ currentRoute: '/data/db-1' })
    render(<AIChatSidebar />)
    expect(screen.getByText(/I can help with this database/)).toBeInTheDocument()
  })

  it('shows context hint for /calendar route', () => {
    useAIChatStore.setState({ currentRoute: '/calendar' })
    render(<AIChatSidebar />)
    expect(screen.getByText(/I can help with scheduling/)).toBeInTheDocument()
  })

  it('does not show context hint for unknown routes', () => {
    useAIChatStore.setState({ currentRoute: '/' })
    render(<AIChatSidebar />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  // ─── Typing indicator tests ────────────────────────────────────────

  it('shows typing indicator when isTyping is true', () => {
    useAIChatStore.setState({ isTyping: true })
    render(<AIChatSidebar />)
    expect(screen.getByLabelText('Copilot is typing')).toBeInTheDocument()
  })

  it('does not show typing indicator when isTyping is false', () => {
    useAIChatStore.setState({ isTyping: false })
    render(<AIChatSidebar />)
    expect(screen.queryByLabelText('Copilot is typing')).not.toBeInTheDocument()
  })

  // ─── Slash command tests ───────────────────────────────────────────

  it('shows slash command menu when typing /', async () => {
    const user = userEvent.setup()
    render(<AIChatSidebar />)

    const input = screen.getByPlaceholderText(/Ask Copilot anything/)
    await user.type(input, '/')

    expect(screen.getByRole('listbox', { name: /slash commands/i })).toBeInTheDocument()
  })

  it('shows slash command options when typing /', async () => {
    const user = userEvent.setup()
    render(<AIChatSidebar />)

    const input = screen.getByPlaceholderText(/Ask Copilot anything/)
    await user.type(input, '/')

    expect(screen.getByText('/summarize')).toBeInTheDocument()
    expect(screen.getByText('/translate')).toBeInTheDocument()
    expect(screen.getByText('/simplify')).toBeInTheDocument()
  })

  it('filters slash commands as user types', async () => {
    const user = userEvent.setup()
    render(<AIChatSidebar />)

    const input = screen.getByPlaceholderText(/Ask Copilot anything/)
    await user.type(input, '/su')

    expect(screen.getByText('/summarize')).toBeInTheDocument()
    expect(screen.queryByText('/translate')).not.toBeInTheDocument()
  })

  it('selects a slash command from the menu', async () => {
    const user = userEvent.setup()
    render(<AIChatSidebar />)

    const input = screen.getByPlaceholderText(/Ask Copilot anything/)
    await user.type(input, '/')
    await user.click(screen.getByText('/summarize'))

    expect(input).toHaveValue('/summarize ')
  })

  it('shows command badge on slash command messages', () => {
    useAIChatStore.setState({
      messages: [
        { id: '1', role: 'user', content: '/summarize', timestamp: new Date().toISOString() },
      ],
    })
    render(<AIChatSidebar />)
    expect(screen.getByText('command')).toBeInTheDocument()
  })
})
