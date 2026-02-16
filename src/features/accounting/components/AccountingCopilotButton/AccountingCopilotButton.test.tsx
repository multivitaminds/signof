import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountingCopilotButton from './AccountingCopilotButton'

const mockTogglePanel = vi.fn()
let mockIsOpen = false
let mockSuggestions: Array<{ id: string; dismissed: boolean }> = []

vi.mock('../../stores/useAccountingCopilotStore', () => ({
  useAccountingCopilotStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      isOpen: mockIsOpen,
      togglePanel: mockTogglePanel,
      suggestions: mockSuggestions,
    }),
}))

describe('AccountingCopilotButton', () => {
  beforeEach(() => {
    mockTogglePanel.mockClear()
    mockIsOpen = false
    mockSuggestions = []
  })

  it('renders a button', () => {
    render(<AccountingCopilotButton />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows "Open Accounting Copilot" label when closed', () => {
    mockIsOpen = false
    render(<AccountingCopilotButton />)
    expect(screen.getByLabelText('Open Accounting Copilot')).toBeInTheDocument()
  })

  it('shows "Close Accounting Copilot" label when open', () => {
    mockIsOpen = true
    render(<AccountingCopilotButton />)
    expect(screen.getByLabelText('Close Accounting Copilot')).toBeInTheDocument()
  })

  it('calls togglePanel when clicked', async () => {
    const user = userEvent.setup()
    render(<AccountingCopilotButton />)
    await user.click(screen.getByRole('button'))
    expect(mockTogglePanel).toHaveBeenCalledTimes(1)
  })

  it('shows badge count for undismissed suggestions', () => {
    mockSuggestions = [
      { id: '1', dismissed: false },
      { id: '2', dismissed: false },
      { id: '3', dismissed: true },
    ]
    render(<AccountingCopilotButton />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not show badge when all suggestions dismissed', () => {
    mockSuggestions = [
      { id: '1', dismissed: true },
    ]
    render(<AccountingCopilotButton />)
    expect(screen.queryByLabelText(/suggestions/)).not.toBeInTheDocument()
  })

  it('does not show badge when panel is open', () => {
    mockIsOpen = true
    mockSuggestions = [
      { id: '1', dismissed: false },
    ]
    render(<AccountingCopilotButton />)
    expect(screen.queryByLabelText(/suggestions/)).not.toBeInTheDocument()
  })

  it('has pulse class when undismissed suggestions exist and panel is closed', () => {
    mockSuggestions = [{ id: '1', dismissed: false }]
    render(<AccountingCopilotButton />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('accounting-copilot-button--pulse')
  })

  it('does not have pulse class when no undismissed suggestions', () => {
    mockSuggestions = []
    render(<AccountingCopilotButton />)
    const button = screen.getByRole('button')
    expect(button.className).not.toContain('accounting-copilot-button--pulse')
  })
})
