import { render, screen } from '@testing-library/react'
import PlaygroundTopBar from './PlaygroundTopBar'
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

describe('PlaygroundTopBar', () => {
  beforeEach(() => {
    resetStore()
  })

  it('shows empty message when no conversation', () => {
    render(<PlaygroundTopBar />)
    expect(screen.getByText('No conversation selected')).toBeInTheDocument()
  })

  it('renders model selector and title when conversation exists', () => {
    usePlaygroundStore.getState().createConversation()
    render(<PlaygroundTopBar />)
    expect(screen.getByText('Claude Sonnet')).toBeInTheDocument()
    expect(screen.getByText('New Chat')).toBeInTheDocument()
  })

  it('renders agent mode toggle', () => {
    usePlaygroundStore.getState().createConversation()
    render(<PlaygroundTopBar />)
    expect(screen.getByText('Agent')).toBeInTheDocument()
  })

  it('renders settings button', () => {
    usePlaygroundStore.getState().createConversation()
    render(<PlaygroundTopBar />)
    expect(screen.getByRole('button', { name: 'Toggle settings' })).toBeInTheDocument()
  })
})
