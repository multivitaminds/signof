import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SchedulingCopilotPanel from './SchedulingCopilotPanel'
import type { CopilotMessage } from '../../stores/useSchedulingCopilotStore'

const mockClosePanel = vi.fn()
const mockSendMessage = vi.fn()
const mockAnalyzeBookings = vi.fn()
const mockReviewAvailability = vi.fn()
const mockCheckCalendarHealth = vi.fn()

let mockIsOpen = true
let mockMessages: CopilotMessage[] = []
let mockIsTyping = false
let mockIsAnalyzing = false
let mockLastAnalysis: { summary: string; items: string[]; timestamp: string } | null = null

vi.mock('../../stores/useSchedulingCopilotStore', () => ({
  useSchedulingCopilotStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      isOpen: mockIsOpen,
      closePanel: mockClosePanel,
      messages: mockMessages,
      isTyping: mockIsTyping,
      sendMessage: mockSendMessage,
      isAnalyzing: mockIsAnalyzing,
      analyzeBookings: mockAnalyzeBookings,
      reviewAvailability: mockReviewAvailability,
      checkCalendarHealth: mockCheckCalendarHealth,
      lastAnalysis: mockLastAnalysis,
    }),
}))

describe('SchedulingCopilotPanel', () => {
  beforeEach(() => {
    mockClosePanel.mockClear()
    mockSendMessage.mockClear()
    mockAnalyzeBookings.mockClear()
    mockReviewAvailability.mockClear()
    mockCheckCalendarHealth.mockClear()
    mockIsOpen = true
    mockMessages = []
    mockIsTyping = false
    mockIsAnalyzing = false
    mockLastAnalysis = null
  })

  it('renders the panel title', () => {
    render(<SchedulingCopilotPanel />)
    expect(screen.getByText('Calendar Copilot')).toBeInTheDocument()
  })

  it('shows empty state when no messages', () => {
    render(<SchedulingCopilotPanel />)
    expect(
      screen.getByText(/I'm your Calendar Copilot/)
    ).toBeInTheDocument()
  })

  it('renders user and assistant messages', () => {
    mockMessages = [
      { id: '1', role: 'user', content: 'What are my upcoming bookings?', timestamp: '2026-01-01T00:00:00Z' },
      { id: '2', role: 'assistant', content: 'You have 3 upcoming bookings.', timestamp: '2026-01-01T00:01:00Z' },
    ]
    render(<SchedulingCopilotPanel />)
    expect(screen.getByText('What are my upcoming bookings?')).toBeInTheDocument()
    expect(screen.getByText('You have 3 upcoming bookings.')).toBeInTheDocument()
  })

  it('shows typing indicator when isTyping', () => {
    mockIsTyping = true
    render(<SchedulingCopilotPanel />)
    expect(screen.getByLabelText('Assistant is typing')).toBeInTheDocument()
  })

  it('does not show typing indicator when not typing', () => {
    mockIsTyping = false
    render(<SchedulingCopilotPanel />)
    expect(screen.queryByLabelText('Assistant is typing')).not.toBeInTheDocument()
  })

  it('calls sendMessage when send button is clicked', async () => {
    const user = userEvent.setup()
    render(<SchedulingCopilotPanel />)
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Test message')
    const sendBtn = screen.getByLabelText('Send message')
    await user.click(sendBtn)
    expect(mockSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('calls sendMessage on Enter key', async () => {
    const user = userEvent.setup()
    render(<SchedulingCopilotPanel />)
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Enter test{Enter}')
    expect(mockSendMessage).toHaveBeenCalledWith('Enter test')
  })

  it('does not send on Shift+Enter', async () => {
    const user = userEvent.setup()
    render(<SchedulingCopilotPanel />)
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2')
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('disables send button when input is empty', () => {
    render(<SchedulingCopilotPanel />)
    const sendBtn = screen.getByLabelText('Send message')
    expect(sendBtn).toBeDisabled()
  })

  it('disables send button when isTyping', () => {
    mockIsTyping = true
    render(<SchedulingCopilotPanel />)
    const sendBtn = screen.getByLabelText('Send message')
    expect(sendBtn).toBeDisabled()
  })

  it('calls closePanel when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<SchedulingCopilotPanel />)
    const closeBtn = screen.getByLabelText('Close panel')
    await user.click(closeBtn)
    expect(mockClosePanel).toHaveBeenCalledTimes(1)
  })

  it('renders action buttons', () => {
    render(<SchedulingCopilotPanel />)
    expect(screen.getByText('Analyze Bookings')).toBeInTheDocument()
    expect(screen.getByText('Review Availability')).toBeInTheDocument()
    expect(screen.getByText('Calendar Health')).toBeInTheDocument()
  })

  it('disables action buttons when isAnalyzing', () => {
    mockIsAnalyzing = true
    render(<SchedulingCopilotPanel />)
    expect(screen.getByText('Analyze Bookings').closest('button')).toBeDisabled()
    expect(screen.getByText('Review Availability').closest('button')).toBeDisabled()
    expect(screen.getByText('Calendar Health').closest('button')).toBeDisabled()
  })

  it('calls analyzeBookings when Analyze Bookings is clicked', async () => {
    const user = userEvent.setup()
    render(<SchedulingCopilotPanel />)
    await user.click(screen.getByText('Analyze Bookings'))
    expect(mockAnalyzeBookings).toHaveBeenCalledTimes(1)
  })

  it('calls reviewAvailability when Review Availability is clicked', async () => {
    const user = userEvent.setup()
    render(<SchedulingCopilotPanel />)
    await user.click(screen.getByText('Review Availability'))
    expect(mockReviewAvailability).toHaveBeenCalledTimes(1)
  })

  it('calls checkCalendarHealth when Calendar Health is clicked', async () => {
    const user = userEvent.setup()
    render(<SchedulingCopilotPanel />)
    await user.click(screen.getByText('Calendar Health'))
    expect(mockCheckCalendarHealth).toHaveBeenCalledTimes(1)
  })

  it('renders analysis card when lastAnalysis exists', () => {
    mockLastAnalysis = {
      summary: 'Analysis done',
      items: ['Found 2 bookings', 'All confirmed'],
      timestamp: '2026-01-01T00:00:00Z',
    }
    render(<SchedulingCopilotPanel />)
    expect(screen.getByTestId('analysis-card')).toBeInTheDocument()
    expect(screen.getByText('Analysis done')).toBeInTheDocument()
    expect(screen.getByText('Found 2 bookings')).toBeInTheDocument()
    expect(screen.getByText('All confirmed')).toBeInTheDocument()
  })

  it('does not render analysis card when lastAnalysis is null', () => {
    mockLastAnalysis = null
    render(<SchedulingCopilotPanel />)
    expect(screen.queryByTestId('analysis-card')).not.toBeInTheDocument()
  })

  it('has open class when isOpen is true', () => {
    mockIsOpen = true
    render(<SchedulingCopilotPanel />)
    const panel = screen.getByLabelText('Calendar Copilot')
    expect(panel.className).toContain('scheduling-copilot-panel--open')
  })

  it('does not have open class when isOpen is false', () => {
    mockIsOpen = false
    render(<SchedulingCopilotPanel />)
    const panel = screen.getByLabelText('Calendar Copilot')
    expect(panel.className).not.toContain('scheduling-copilot-panel--open')
  })
})
