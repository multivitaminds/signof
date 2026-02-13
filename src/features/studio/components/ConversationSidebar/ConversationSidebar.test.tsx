import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConversationSidebar from './ConversationSidebar'
import useStudioStore from '../../stores/useStudioStore'

function resetStore() {
  useStudioStore.setState({
    conversations: [],
    activeConversationId: null,
    isTyping: false,
    searchQuery: '',
    settingsPanelOpen: false,
  })
}

describe('ConversationSidebar', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders new chat button', () => {
    render(<ConversationSidebar />)
    expect(screen.getByText('New Chat')).toBeInTheDocument()
  })

  it('renders conversation list after creating one', async () => {
    useStudioStore.getState().createConversation()
    render(<ConversationSidebar />)
    expect(screen.getAllByText('New Chat').length).toBeGreaterThanOrEqual(2)
  })

  it('creates conversation on new chat click', async () => {
    const user = userEvent.setup()
    render(<ConversationSidebar />)
    await user.click(screen.getByText('New Chat'))
    expect(useStudioStore.getState().conversations).toHaveLength(1)
  })

  it('filters conversations by search', () => {
    useStudioStore.getState().createConversation()
    useStudioStore.getState().renameConversation(
      useStudioStore.getState().conversations[0]!.id,
      'Test Conversation'
    )
    useStudioStore.setState({ searchQuery: 'xyz' })
    render(<ConversationSidebar />)
    expect(screen.queryByText('Test Conversation')).not.toBeInTheDocument()
  })
})
