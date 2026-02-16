import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatabaseCopilotPanel from './DatabaseCopilotPanel'
import type { CopilotMessage } from '../../stores/useDatabaseCopilotStore'

const mockClosePanel = vi.fn()
const mockSendMessage = vi.fn()
const mockAnalyzeSchema = vi.fn()
const mockReviewAutomations = vi.fn()
const mockCheckDataHealth = vi.fn()

let mockIsOpen = true
let mockMessages: CopilotMessage[] = []
let mockIsTyping = false
let mockIsAnalyzing = false
let mockLastAnalysis: { summary: string; items: string[]; timestamp: string } | null = null

vi.mock('../../stores/useDatabaseCopilotStore', () => ({
  useDatabaseCopilotStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      isOpen: mockIsOpen,
      closePanel: mockClosePanel,
      messages: mockMessages,
      isTyping: mockIsTyping,
      sendMessage: mockSendMessage,
      isAnalyzing: mockIsAnalyzing,
      analyzeSchema: mockAnalyzeSchema,
      reviewAutomations: mockReviewAutomations,
      checkDataHealth: mockCheckDataHealth,
      lastAnalysis: mockLastAnalysis,
    }),
}))

describe('DatabaseCopilotPanel', () => {
  beforeEach(() => {
    mockClosePanel.mockClear()
    mockSendMessage.mockClear()
    mockAnalyzeSchema.mockClear()
    mockReviewAutomations.mockClear()
    mockCheckDataHealth.mockClear()
    mockIsOpen = true
    mockMessages = []
    mockIsTyping = false
    mockIsAnalyzing = false
    mockLastAnalysis = null
  })

  it('renders the panel title', () => {
    render(<DatabaseCopilotPanel />)
    expect(screen.getByText('Databases Copilot')).toBeInTheDocument()
  })

  it('shows empty state when no messages', () => {
    render(<DatabaseCopilotPanel />)
    expect(
      screen.getByText(/I'm your Database Copilot/)
    ).toBeInTheDocument()
  })

  it('renders user and assistant messages', () => {
    mockMessages = [
      { id: '1', role: 'user', content: 'How many tables do I have?', timestamp: '2026-01-01T00:00:00Z' },
      { id: '2', role: 'assistant', content: 'You have 3 tables.', timestamp: '2026-01-01T00:01:00Z' },
    ]
    render(<DatabaseCopilotPanel />)
    expect(screen.getByText('How many tables do I have?')).toBeInTheDocument()
    expect(screen.getByText('You have 3 tables.')).toBeInTheDocument()
  })

  it('shows typing indicator when isTyping', () => {
    mockIsTyping = true
    render(<DatabaseCopilotPanel />)
    expect(screen.getByLabelText('Assistant is typing')).toBeInTheDocument()
  })

  it('does not show typing indicator when not typing', () => {
    mockIsTyping = false
    render(<DatabaseCopilotPanel />)
    expect(screen.queryByLabelText('Assistant is typing')).not.toBeInTheDocument()
  })

  it('calls sendMessage when send button is clicked', async () => {
    const user = userEvent.setup()
    render(<DatabaseCopilotPanel />)
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Test message')
    const sendBtn = screen.getByLabelText('Send message')
    await user.click(sendBtn)
    expect(mockSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('calls sendMessage on Enter key', async () => {
    const user = userEvent.setup()
    render(<DatabaseCopilotPanel />)
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Enter test{Enter}')
    expect(mockSendMessage).toHaveBeenCalledWith('Enter test')
  })

  it('does not send on Shift+Enter', async () => {
    const user = userEvent.setup()
    render(<DatabaseCopilotPanel />)
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2')
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('disables send button when input is empty', () => {
    render(<DatabaseCopilotPanel />)
    const sendBtn = screen.getByLabelText('Send message')
    expect(sendBtn).toBeDisabled()
  })

  it('disables send button when isTyping', () => {
    mockIsTyping = true
    render(<DatabaseCopilotPanel />)
    const sendBtn = screen.getByLabelText('Send message')
    expect(sendBtn).toBeDisabled()
  })

  it('calls closePanel when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<DatabaseCopilotPanel />)
    const closeBtn = screen.getByLabelText('Close panel')
    await user.click(closeBtn)
    expect(mockClosePanel).toHaveBeenCalledTimes(1)
  })

  it('renders action buttons', () => {
    render(<DatabaseCopilotPanel />)
    expect(screen.getByText('Analyze Schema')).toBeInTheDocument()
    expect(screen.getByText('Review Automations')).toBeInTheDocument()
    expect(screen.getByText('Data Health')).toBeInTheDocument()
  })

  it('disables action buttons when isAnalyzing', () => {
    mockIsAnalyzing = true
    render(<DatabaseCopilotPanel />)
    expect(screen.getByText('Analyze Schema').closest('button')).toBeDisabled()
    expect(screen.getByText('Review Automations').closest('button')).toBeDisabled()
    expect(screen.getByText('Data Health').closest('button')).toBeDisabled()
  })

  it('calls analyzeSchema when Analyze Schema is clicked', async () => {
    const user = userEvent.setup()
    render(<DatabaseCopilotPanel />)
    await user.click(screen.getByText('Analyze Schema'))
    expect(mockAnalyzeSchema).toHaveBeenCalledTimes(1)
  })

  it('calls reviewAutomations when Review Automations is clicked', async () => {
    const user = userEvent.setup()
    render(<DatabaseCopilotPanel />)
    await user.click(screen.getByText('Review Automations'))
    expect(mockReviewAutomations).toHaveBeenCalledTimes(1)
  })

  it('calls checkDataHealth when Data Health is clicked', async () => {
    const user = userEvent.setup()
    render(<DatabaseCopilotPanel />)
    await user.click(screen.getByText('Data Health'))
    expect(mockCheckDataHealth).toHaveBeenCalledTimes(1)
  })

  it('renders analysis card when lastAnalysis exists', () => {
    mockLastAnalysis = {
      summary: 'Analysis done',
      items: ['Found 2 tables', 'All fields valid'],
      timestamp: '2026-01-01T00:00:00Z',
    }
    render(<DatabaseCopilotPanel />)
    expect(screen.getByTestId('analysis-card')).toBeInTheDocument()
    expect(screen.getByText('Analysis done')).toBeInTheDocument()
    expect(screen.getByText('Found 2 tables')).toBeInTheDocument()
    expect(screen.getByText('All fields valid')).toBeInTheDocument()
  })

  it('does not render analysis card when lastAnalysis is null', () => {
    mockLastAnalysis = null
    render(<DatabaseCopilotPanel />)
    expect(screen.queryByTestId('analysis-card')).not.toBeInTheDocument()
  })

  it('has open class when isOpen is true', () => {
    mockIsOpen = true
    render(<DatabaseCopilotPanel />)
    const panel = screen.getByLabelText('Databases Copilot')
    expect(panel.className).toContain('database-copilot-panel--open')
  })

  it('does not have open class when isOpen is false', () => {
    mockIsOpen = false
    render(<DatabaseCopilotPanel />)
    const panel = screen.getByLabelText('Databases Copilot')
    expect(panel.className).not.toContain('database-copilot-panel--open')
  })
})
