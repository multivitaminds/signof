import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConversationSidebar from './ConversationSidebar'
import usePlaygroundStore from '../../stores/usePlaygroundStore'

function resetStore() {
  usePlaygroundStore.setState({
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
    usePlaygroundStore.getState().createConversation()
    render(<ConversationSidebar />)
    expect(screen.getAllByText('New Chat').length).toBeGreaterThanOrEqual(2)
  })

  it('creates conversation on new chat click', async () => {
    const user = userEvent.setup()
    render(<ConversationSidebar />)
    await user.click(screen.getByText('New Chat'))
    expect(usePlaygroundStore.getState().conversations).toHaveLength(1)
  })

  it('filters conversations by search', () => {
    usePlaygroundStore.getState().createConversation()
    usePlaygroundStore.getState().renameConversation(
      usePlaygroundStore.getState().conversations[0]!.id,
      'Test Conversation'
    )
    usePlaygroundStore.setState({ searchQuery: 'xyz' })
    render(<ConversationSidebar />)
    expect(screen.queryByText('Test Conversation')).not.toBeInTheDocument()
  })
})
