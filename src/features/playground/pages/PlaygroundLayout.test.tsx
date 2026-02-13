import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlaygroundLayout from './PlaygroundLayout'
import usePlaygroundStore from '../stores/usePlaygroundStore'

vi.mock('../components/ConversationSidebar/ConversationSidebar', () => ({
  default: () => <div data-testid="conversation-sidebar">New Chat</div>,
}))

vi.mock('../components/PlaygroundTopBar/PlaygroundTopBar', () => ({
  default: () => <div data-testid="playground-top-bar">TopBar</div>,
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
  usePlaygroundStore.setState({
    conversations: [],
    activeConversationId: null,
    isTyping: false,
    searchQuery: '',
    settingsPanelOpen: false,
  })
}

describe('PlaygroundLayout', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders the layout with sidebar and main area', () => {
    render(<PlaygroundLayout />)
    expect(screen.getByTestId('conversation-sidebar')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Send a message...')).toBeInTheDocument()
  })

  it('auto-creates a conversation on mount if none exist', () => {
    render(<PlaygroundLayout />)
    const state = usePlaygroundStore.getState()
    expect(state.conversations.length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when no messages', () => {
    render(<PlaygroundLayout />)
    expect(screen.getByText('Start a conversation')).toBeInTheDocument()
  })
})
