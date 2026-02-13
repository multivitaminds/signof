import { render, screen } from '@testing-library/react'
import StudioTopBar from './StudioTopBar'
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

describe('StudioTopBar', () => {
  beforeEach(() => {
    resetStore()
  })

  it('shows empty message when no conversation', () => {
    render(<StudioTopBar />)
    expect(screen.getByText('No conversation selected')).toBeInTheDocument()
  })

  it('renders model selector and title when conversation exists', () => {
    useStudioStore.getState().createConversation()
    render(<StudioTopBar />)
    expect(screen.getByText('Claude Sonnet')).toBeInTheDocument()
    expect(screen.getByText('New Chat')).toBeInTheDocument()
  })

  it('renders agent mode toggle', () => {
    useStudioStore.getState().createConversation()
    render(<StudioTopBar />)
    expect(screen.getByText('Agent')).toBeInTheDocument()
  })

  it('renders settings button', () => {
    useStudioStore.getState().createConversation()
    render(<StudioTopBar />)
    expect(screen.getByRole('button', { name: 'Toggle settings' })).toBeInTheDocument()
  })
})
