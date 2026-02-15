import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaxCopilotButton from './TaxCopilotButton'

const mockTogglePanel = vi.fn()
let mockIsOpen = false
let mockSuggestions: Array<{ id: string; dismissed: boolean }> = []

vi.mock('../../stores/useTaxCopilotStore', () => ({
  useTaxCopilotStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      isOpen: mockIsOpen,
      togglePanel: mockTogglePanel,
      suggestions: mockSuggestions,
    }),
}))

describe('TaxCopilotButton', () => {
  beforeEach(() => {
    mockTogglePanel.mockClear()
    mockIsOpen = false
    mockSuggestions = []
  })

  it('renders a button', () => {
    render(<TaxCopilotButton />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows "Open Tax Copilot" label when closed', () => {
    mockIsOpen = false
    render(<TaxCopilotButton />)
    expect(screen.getByLabelText('Open Tax Copilot')).toBeInTheDocument()
  })

  it('shows "Close Tax Copilot" label when open', () => {
    mockIsOpen = true
    render(<TaxCopilotButton />)
    expect(screen.getByLabelText('Close Tax Copilot')).toBeInTheDocument()
  })

  it('calls togglePanel when clicked', async () => {
    const user = userEvent.setup()
    render(<TaxCopilotButton />)
    await user.click(screen.getByRole('button'))
    expect(mockTogglePanel).toHaveBeenCalledTimes(1)
  })

  it('shows badge count for undismissed suggestions', () => {
    mockSuggestions = [
      { id: '1', dismissed: false },
      { id: '2', dismissed: false },
      { id: '3', dismissed: true },
    ]
    render(<TaxCopilotButton />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not show badge when all suggestions dismissed', () => {
    mockSuggestions = [
      { id: '1', dismissed: true },
    ]
    render(<TaxCopilotButton />)
    expect(screen.queryByLabelText(/suggestions/)).not.toBeInTheDocument()
  })

  it('does not show badge when panel is open', () => {
    mockIsOpen = true
    mockSuggestions = [
      { id: '1', dismissed: false },
    ]
    render(<TaxCopilotButton />)
    expect(screen.queryByLabelText(/suggestions/)).not.toBeInTheDocument()
  })

  it('has pulse class when undismissed suggestions exist and panel is closed', () => {
    mockSuggestions = [{ id: '1', dismissed: false }]
    render(<TaxCopilotButton />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('tax-copilot-button--pulse')
  })

  it('does not have pulse class when no undismissed suggestions', () => {
    mockSuggestions = []
    render(<TaxCopilotButton />)
    const button = screen.getByRole('button')
    expect(button.className).not.toContain('tax-copilot-button--pulse')
  })
})
