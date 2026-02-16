import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SchedulingCopilotButton from './SchedulingCopilotButton'

const mockTogglePanel = vi.fn()
let mockIsOpen = false
let mockSuggestions: Array<{ id: string; dismissed: boolean }> = []

vi.mock('../../stores/useSchedulingCopilotStore', () => ({
  useSchedulingCopilotStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      isOpen: mockIsOpen,
      togglePanel: mockTogglePanel,
      suggestions: mockSuggestions,
    }),
}))

describe('SchedulingCopilotButton', () => {
  beforeEach(() => {
    mockTogglePanel.mockClear()
    mockIsOpen = false
    mockSuggestions = []
  })

  it('renders a button', () => {
    render(<SchedulingCopilotButton />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows "Open Calendar Copilot" label when closed', () => {
    mockIsOpen = false
    render(<SchedulingCopilotButton />)
    expect(screen.getByLabelText('Open Calendar Copilot')).toBeInTheDocument()
  })

  it('shows "Close Calendar Copilot" label when open', () => {
    mockIsOpen = true
    render(<SchedulingCopilotButton />)
    expect(screen.getByLabelText('Close Calendar Copilot')).toBeInTheDocument()
  })

  it('calls togglePanel when clicked', async () => {
    const user = userEvent.setup()
    render(<SchedulingCopilotButton />)
    await user.click(screen.getByRole('button'))
    expect(mockTogglePanel).toHaveBeenCalledTimes(1)
  })

  it('shows badge count for undismissed suggestions', () => {
    mockSuggestions = [
      { id: '1', dismissed: false },
      { id: '2', dismissed: false },
      { id: '3', dismissed: true },
    ]
    render(<SchedulingCopilotButton />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not show badge when all suggestions dismissed', () => {
    mockSuggestions = [
      { id: '1', dismissed: true },
    ]
    render(<SchedulingCopilotButton />)
    expect(screen.queryByLabelText(/suggestions/)).not.toBeInTheDocument()
  })

  it('does not show badge when panel is open', () => {
    mockIsOpen = true
    mockSuggestions = [
      { id: '1', dismissed: false },
    ]
    render(<SchedulingCopilotButton />)
    expect(screen.queryByLabelText(/suggestions/)).not.toBeInTheDocument()
  })

  it('has pulse class when undismissed suggestions exist and panel is closed', () => {
    mockSuggestions = [{ id: '1', dismissed: false }]
    render(<SchedulingCopilotButton />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('scheduling-copilot-button--pulse')
  })

  it('does not have pulse class when no undismissed suggestions', () => {
    mockSuggestions = []
    render(<SchedulingCopilotButton />)
    const button = screen.getByRole('button')
    expect(button.className).not.toContain('scheduling-copilot-button--pulse')
  })
})
