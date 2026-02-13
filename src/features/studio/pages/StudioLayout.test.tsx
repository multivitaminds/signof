import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import StudioLayout from './StudioLayout'
import useStudioStore from '../stores/useStudioStore'

vi.mock('../components/ConversationSidebar/ConversationSidebar', () => ({
  default: () => <div data-testid="conversation-sidebar">New Chat</div>,
}))

vi.mock('../components/StudioTopBar/StudioTopBar', () => ({
  default: () => <div data-testid="studio-top-bar">TopBar</div>,
}))

vi.mock('../components/ChatArea/ChatArea', () => ({
  default: ({ messages }: { messages: unknown[] }) => (
    <div data-testid="chat-area">
      {messages.length === 0 && <span>Start a conversation</span>}
    </div>
  ),
}))

vi.mock('../components/ChatInput/ChatInput', () => ({
  default: () => <input placeholder="Send a message..." data-testid="chat-input" />,
}))

vi.mock('../components/SettingsPanel/SettingsPanel', () => ({
  default: () => <div data-testid="settings-panel">Settings</div>,
}))

function resetStore() {
  useStudioStore.setState({
    conversations: [],
    activeConversationId: null,
    isTyping: false,
    searchQuery: '',
    settingsPanelOpen: false,
  })
}

describe('StudioLayout', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders the layout with sidebar and main area', () => {
    render(<StudioLayout />)
    expect(screen.getByTestId('conversation-sidebar')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Send a message...')).toBeInTheDocument()
  })

  it('auto-creates a conversation on mount if none exist', () => {
    render(<StudioLayout />)
    const state = useStudioStore.getState()
    expect(state.conversations.length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when no messages', () => {
    render(<StudioLayout />)
    expect(screen.getByText('Start a conversation')).toBeInTheDocument()
  })
})
