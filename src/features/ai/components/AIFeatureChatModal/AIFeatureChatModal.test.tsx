import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIFeatureChatModal from './AIFeatureChatModal'

// Track messages added via the mock store
const mockAddMessage = vi.fn()
const mockMessages: Array<{ id: string; role: string; content: string; timestamp: string }> = []

vi.mock('../../stores/useAIFeatureChatStore', () => ({
  default: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      sessions: {
        workspace: { messages: mockMessages, isOpen: true },
        home: { messages: [], isOpen: false },
        projects: { messages: [], isOpen: false },
        documents: { messages: [], isOpen: false },
        scheduling: { messages: [], isOpen: false },
        databases: { messages: [], isOpen: false },
        inbox: { messages: [], isOpen: false },
      },
      addMessage: mockAddMessage,
    }),
}))

// Mock intent engine
vi.mock('../../lib/intentEngine', () => ({
  parseIntent: () => ({
    action: 'create_page',
    params: { title: 'Test' },
    featureKey: 'workspace',
    confidence: 'high',
    response: 'Created a new page "Test".',
  }),
  executeIntent: vi.fn(() => true),
}))

// Mock VoiceInputButton (SpeechRecognition not available in jsdom)
vi.mock('../VoiceInputButton/VoiceInputButton', () => ({
  default: ({ onTranscript }: { onTranscript: (text: string) => void }) => (
    <button data-testid="voice-btn" onClick={() => onTranscript('voice test')}>
      Mic
    </button>
  ),
}))

describe('AIFeatureChatModal', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockMessages.length = 0
  })

  it('renders when isOpen is true', () => {
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={true} onClose={onClose} />
    )
    expect(screen.getByText('Workspace')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={false} onClose={onClose} />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows feature-specific quick action chips', () => {
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={true} onClose={onClose} />
    )
    expect(screen.getByText('Create a new page')).toBeInTheDocument()
    expect(screen.getByText('Write meeting notes')).toBeInTheDocument()
  })

  it('shows input field with feature placeholder', () => {
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={true} onClose={onClose} />
    )
    expect(screen.getByPlaceholderText(/ask about pages/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={true} onClose={onClose} />
    )
    await user.click(screen.getByLabelText('Close AI chat'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={true} onClose={onClose} />
    )
    await user.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalled()
  })

  it('sends a message when typing and pressing Enter', async () => {
    const user = userEvent.setup()
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={true} onClose={onClose} />
    )
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'create a new page{Enter}')
    expect(mockAddMessage).toHaveBeenCalledWith('workspace', 'user', 'create a new page')
  })

  it('sends a message when clicking the send button', async () => {
    const user = userEvent.setup()
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={true} onClose={onClose} />
    )
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Hello AI')
    await user.click(screen.getByLabelText('Send message'))
    expect(mockAddMessage).toHaveBeenCalledWith('workspace', 'user', 'Hello AI')
  })

  it('adds AI response after simulated delay', async () => {
    const user = userEvent.setup()
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={true} onClose={onClose} />
    )
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'create a new page{Enter}')

    await waitFor(
      () => {
        expect(mockAddMessage).toHaveBeenCalledWith(
          'workspace',
          'assistant',
          expect.stringContaining('Created a new page')
        )
      },
      { timeout: 3000 }
    )
  })

  it('sends quick action prompt on chip click', async () => {
    const user = userEvent.setup()
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={true} onClose={onClose} />
    )
    await user.click(screen.getByText('Create a new page'))
    expect(mockAddMessage).toHaveBeenCalledWith('workspace', 'user', 'Create a new page')
  })

  it('sets input value from voice transcript', async () => {
    const user = userEvent.setup()
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={true} onClose={onClose} />
    )
    await user.click(screen.getByTestId('voice-btn'))
    const input = screen.getByLabelText('Message input') as HTMLInputElement
    expect(input.value).toBe('voice test')
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    render(
      <AIFeatureChatModal featureKey="workspace" isOpen={true} onClose={onClose} />
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
