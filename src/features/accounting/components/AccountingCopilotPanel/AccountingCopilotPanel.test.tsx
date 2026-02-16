import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountingCopilotPanel from './AccountingCopilotPanel'
import type { CopilotMessage } from '../../stores/useAccountingCopilotStore'

const mockClosePanel = vi.fn()
const mockSendMessage = vi.fn()
const mockAnalyzeExpenses = vi.fn()
const mockReviewInvoices = vi.fn()
const mockForecastCashFlow = vi.fn()

let mockIsOpen = true
let mockMessages: CopilotMessage[] = []
let mockIsTyping = false
let mockIsAnalyzing = false
let mockLastAnalysis: { summary: string; items: string[]; timestamp: string } | null = null

vi.mock('../../stores/useAccountingCopilotStore', () => ({
  useAccountingCopilotStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      isOpen: mockIsOpen,
      closePanel: mockClosePanel,
      messages: mockMessages,
      isTyping: mockIsTyping,
      sendMessage: mockSendMessage,
      isAnalyzing: mockIsAnalyzing,
      analyzeExpenses: mockAnalyzeExpenses,
      reviewInvoices: mockReviewInvoices,
      forecastCashFlow: mockForecastCashFlow,
      lastAnalysis: mockLastAnalysis,
    }),
}))

describe('AccountingCopilotPanel', () => {
  beforeEach(() => {
    mockClosePanel.mockClear()
    mockSendMessage.mockClear()
    mockAnalyzeExpenses.mockClear()
    mockReviewInvoices.mockClear()
    mockForecastCashFlow.mockClear()
    mockIsOpen = true
    mockMessages = []
    mockIsTyping = false
    mockIsAnalyzing = false
    mockLastAnalysis = null
  })

  it('renders the panel title', () => {
    render(<AccountingCopilotPanel />)
    expect(screen.getByText('Accounting Copilot')).toBeInTheDocument()
  })

  it('shows empty state when no messages', () => {
    render(<AccountingCopilotPanel />)
    expect(
      screen.getByText(/I'm your Accounting Copilot/)
    ).toBeInTheDocument()
  })

  it('renders user and assistant messages', () => {
    mockMessages = [
      { id: '1', role: 'user', content: 'What are my outstanding invoices?', timestamp: '2026-01-01T00:00:00Z' },
      { id: '2', role: 'assistant', content: 'You have 3 outstanding invoices.', timestamp: '2026-01-01T00:01:00Z' },
    ]
    render(<AccountingCopilotPanel />)
    expect(screen.getByText('What are my outstanding invoices?')).toBeInTheDocument()
    expect(screen.getByText('You have 3 outstanding invoices.')).toBeInTheDocument()
  })

  it('shows typing indicator when isTyping', () => {
    mockIsTyping = true
    render(<AccountingCopilotPanel />)
    expect(screen.getByLabelText('Assistant is typing')).toBeInTheDocument()
  })

  it('does not show typing indicator when not typing', () => {
    mockIsTyping = false
    render(<AccountingCopilotPanel />)
    expect(screen.queryByLabelText('Assistant is typing')).not.toBeInTheDocument()
  })

  it('calls sendMessage when send button is clicked', async () => {
    const user = userEvent.setup()
    render(<AccountingCopilotPanel />)
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Test message')
    const sendBtn = screen.getByLabelText('Send message')
    await user.click(sendBtn)
    expect(mockSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('calls sendMessage on Enter key', async () => {
    const user = userEvent.setup()
    render(<AccountingCopilotPanel />)
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Enter test{Enter}')
    expect(mockSendMessage).toHaveBeenCalledWith('Enter test')
  })

  it('does not send on Shift+Enter', async () => {
    const user = userEvent.setup()
    render(<AccountingCopilotPanel />)
    const input = screen.getByLabelText('Message input')
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2')
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('disables send button when input is empty', () => {
    render(<AccountingCopilotPanel />)
    const sendBtn = screen.getByLabelText('Send message')
    expect(sendBtn).toBeDisabled()
  })

  it('disables send button when isTyping', () => {
    mockIsTyping = true
    render(<AccountingCopilotPanel />)
    const sendBtn = screen.getByLabelText('Send message')
    expect(sendBtn).toBeDisabled()
  })

  it('calls closePanel when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<AccountingCopilotPanel />)
    const closeBtn = screen.getByLabelText('Close panel')
    await user.click(closeBtn)
    expect(mockClosePanel).toHaveBeenCalledTimes(1)
  })

  it('renders action buttons', () => {
    render(<AccountingCopilotPanel />)
    expect(screen.getByText('Analyze Expenses')).toBeInTheDocument()
    expect(screen.getByText('Review Invoices')).toBeInTheDocument()
    expect(screen.getByText('Forecast Cash Flow')).toBeInTheDocument()
  })

  it('disables action buttons when isAnalyzing', () => {
    mockIsAnalyzing = true
    render(<AccountingCopilotPanel />)
    expect(screen.getByText('Analyze Expenses').closest('button')).toBeDisabled()
    expect(screen.getByText('Review Invoices').closest('button')).toBeDisabled()
    expect(screen.getByText('Forecast Cash Flow').closest('button')).toBeDisabled()
  })

  it('calls analyzeExpenses when Analyze Expenses is clicked', async () => {
    const user = userEvent.setup()
    render(<AccountingCopilotPanel />)
    await user.click(screen.getByText('Analyze Expenses'))
    expect(mockAnalyzeExpenses).toHaveBeenCalledTimes(1)
  })

  it('calls reviewInvoices when Review Invoices is clicked', async () => {
    const user = userEvent.setup()
    render(<AccountingCopilotPanel />)
    await user.click(screen.getByText('Review Invoices'))
    expect(mockReviewInvoices).toHaveBeenCalledTimes(1)
  })

  it('calls forecastCashFlow when Forecast Cash Flow is clicked', async () => {
    const user = userEvent.setup()
    render(<AccountingCopilotPanel />)
    await user.click(screen.getByText('Forecast Cash Flow'))
    expect(mockForecastCashFlow).toHaveBeenCalledTimes(1)
  })

  it('renders analysis card when lastAnalysis exists', () => {
    mockLastAnalysis = {
      summary: 'Analysis done',
      items: ['Found 2 expenses', 'All categorized'],
      timestamp: '2026-01-01T00:00:00Z',
    }
    render(<AccountingCopilotPanel />)
    expect(screen.getByTestId('analysis-card')).toBeInTheDocument()
    expect(screen.getByText('Analysis done')).toBeInTheDocument()
    expect(screen.getByText('Found 2 expenses')).toBeInTheDocument()
    expect(screen.getByText('All categorized')).toBeInTheDocument()
  })

  it('does not render analysis card when lastAnalysis is null', () => {
    mockLastAnalysis = null
    render(<AccountingCopilotPanel />)
    expect(screen.queryByTestId('analysis-card')).not.toBeInTheDocument()
  })

  it('has open class when isOpen is true', () => {
    mockIsOpen = true
    render(<AccountingCopilotPanel />)
    const panel = screen.getByLabelText('Accounting Copilot')
    expect(panel.className).toContain('accounting-copilot-panel--open')
  })

  it('does not have open class when isOpen is false', () => {
    mockIsOpen = false
    render(<AccountingCopilotPanel />)
    const panel = screen.getByLabelText('Accounting Copilot')
    expect(panel.className).not.toContain('accounting-copilot-panel--open')
  })
})
