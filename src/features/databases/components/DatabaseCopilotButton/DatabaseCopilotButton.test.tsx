import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatabaseCopilotButton from './DatabaseCopilotButton'

const mockTogglePanel = vi.fn()
let mockIsOpen = false
let mockSuggestions: Array<{ id: string; dismissed: boolean }> = []

vi.mock('../../stores/useDatabaseCopilotStore', () => ({
  useDatabaseCopilotStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      isOpen: mockIsOpen,
      togglePanel: mockTogglePanel,
      suggestions: mockSuggestions,
    }),
}))

describe('DatabaseCopilotButton', () => {
  beforeEach(() => {
    mockTogglePanel.mockClear()
    mockIsOpen = false
    mockSuggestions = []
  })

  it('renders a button', () => {
    render(<DatabaseCopilotButton />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows "Open Databases Copilot" label when closed', () => {
    mockIsOpen = false
    render(<DatabaseCopilotButton />)
    expect(screen.getByLabelText('Open Databases Copilot')).toBeInTheDocument()
  })

  it('shows "Close Databases Copilot" label when open', () => {
    mockIsOpen = true
    render(<DatabaseCopilotButton />)
    expect(screen.getByLabelText('Close Databases Copilot')).toBeInTheDocument()
  })

  it('calls togglePanel when clicked', async () => {
    const user = userEvent.setup()
    render(<DatabaseCopilotButton />)
    await user.click(screen.getByRole('button'))
    expect(mockTogglePanel).toHaveBeenCalledTimes(1)
  })

  it('shows badge count for undismissed suggestions', () => {
    mockSuggestions = [
      { id: '1', dismissed: false },
      { id: '2', dismissed: false },
      { id: '3', dismissed: true },
    ]
    render(<DatabaseCopilotButton />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not show badge when all suggestions dismissed', () => {
    mockSuggestions = [
      { id: '1', dismissed: true },
    ]
    render(<DatabaseCopilotButton />)
    expect(screen.queryByLabelText(/suggestions/)).not.toBeInTheDocument()
  })

  it('does not show badge when panel is open', () => {
    mockIsOpen = true
    mockSuggestions = [
      { id: '1', dismissed: false },
    ]
    render(<DatabaseCopilotButton />)
    expect(screen.queryByLabelText(/suggestions/)).not.toBeInTheDocument()
  })

  it('has pulse class when undismissed suggestions exist and panel is closed', () => {
    mockSuggestions = [{ id: '1', dismissed: false }]
    render(<DatabaseCopilotButton />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('database-copilot-btn--pulse')
  })

  it('does not have pulse class when no undismissed suggestions', () => {
    mockSuggestions = []
    render(<DatabaseCopilotButton />)
    const button = screen.getByRole('button')
    expect(button.className).not.toContain('database-copilot-btn--pulse')
  })
})
