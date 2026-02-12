import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIFeatureWidget from './AIFeatureWidget'

// Mock the store
const mockOpenChat = vi.fn()
const mockCloseChat = vi.fn()

vi.mock('../../stores/useAIFeatureChatStore', () => ({
  default: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      sessions: {
        home: { messages: [], isOpen: false },
        workspace: { messages: [], isOpen: false },
        projects: { messages: [], isOpen: false },
        documents: { messages: [], isOpen: false },
        scheduling: { messages: [], isOpen: false },
        databases: { messages: [], isOpen: false },
        inbox: { messages: [], isOpen: false },
      },
      openChat: mockOpenChat,
      closeChat: mockCloseChat,
    }),
}))

// Mock the chat modal to avoid deep rendering
vi.mock('../AIFeatureChatModal/AIFeatureChatModal', () => ({
  default: () => null,
}))

describe('AIFeatureWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the floating button', () => {
    render(<AIFeatureWidget featureKey="home" />)
    expect(screen.getByRole('button', { name: /ask ai about home/i })).toBeInTheDocument()
  })

  it('renders the wand icon in the button', () => {
    render(<AIFeatureWidget featureKey="workspace" />)
    expect(screen.getByRole('button', { name: /ask ai about workspace/i })).toBeInTheDocument()
  })

  it('shows tooltip text for the feature', () => {
    render(<AIFeatureWidget featureKey="projects" />)
    expect(screen.getByText('Ask AI about Projects')).toBeInTheDocument()
  })

  it('calls openChat when clicked', async () => {
    const user = userEvent.setup()
    render(<AIFeatureWidget featureKey="documents" />)
    await user.click(screen.getByRole('button', { name: /ask ai about documents/i }))
    expect(mockOpenChat).toHaveBeenCalledWith('documents')
  })

  it('renders correctly for different feature keys', () => {
    const { rerender } = render(<AIFeatureWidget featureKey="scheduling" />)
    expect(screen.getByText('Ask AI about Scheduling')).toBeInTheDocument()

    rerender(<AIFeatureWidget featureKey="databases" />)
    expect(screen.getByText('Ask AI about Databases')).toBeInTheDocument()

    rerender(<AIFeatureWidget featureKey="inbox" />)
    expect(screen.getByText('Ask AI about Inbox')).toBeInTheDocument()
  })
})
