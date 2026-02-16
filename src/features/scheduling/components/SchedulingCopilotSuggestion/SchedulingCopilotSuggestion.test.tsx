import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SchedulingCopilotSuggestion from './SchedulingCopilotSuggestion'
import type { CopilotSuggestion } from '../../stores/useSchedulingCopilotStore'

describe('SchedulingCopilotSuggestion', () => {
  const baseSuggestion: CopilotSuggestion = {
    id: 'sug-1',
    type: 'tip',
    title: 'Booking Tip',
    description: 'This is a helpful scheduling tip.',
    dismissed: false,
  }

  const mockOnDismiss = vi.fn()

  beforeEach(() => {
    mockOnDismiss.mockClear()
  })

  it('renders the suggestion title', () => {
    render(<SchedulingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('Booking Tip')).toBeInTheDocument()
  })

  it('renders the suggestion description', () => {
    render(<SchedulingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('This is a helpful scheduling tip.')).toBeInTheDocument()
  })

  it('renders action button when action is provided', () => {
    const withAction: CopilotSuggestion = {
      ...baseSuggestion,
      action: { label: 'View Bookings', route: '/calendar/bookings' },
    }
    render(<SchedulingCopilotSuggestion suggestion={withAction} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('View Bookings')).toBeInTheDocument()
  })

  it('does not render action button when no action', () => {
    render(<SchedulingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.queryByText('View Bookings')).not.toBeInTheDocument()
  })

  it('calls onDismiss with suggestion id when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    render(<SchedulingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    const dismissBtn = screen.getByLabelText('Dismiss Booking Tip')
    await user.click(dismissBtn)
    expect(mockOnDismiss).toHaveBeenCalledWith('sug-1')
  })

  it('renders correct type class for tip', () => {
    render(<SchedulingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('scheduling-copilot-suggestion--tip')
  })

  it('renders correct type class for warning', () => {
    const warnSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'warning', title: 'Warning' }
    render(<SchedulingCopilotSuggestion suggestion={warnSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('scheduling-copilot-suggestion--warning')
  })

  it('renders correct type class for deduction', () => {
    const dedSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'deduction', title: 'Deduction' }
    render(<SchedulingCopilotSuggestion suggestion={dedSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('scheduling-copilot-suggestion--deduction')
  })

  it('renders correct type class for missing_info', () => {
    const miSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'missing_info', title: 'Missing' }
    render(<SchedulingCopilotSuggestion suggestion={miSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('scheduling-copilot-suggestion--missing_info')
  })

  it('renders correct type class for review', () => {
    const revSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'review', title: 'Review' }
    render(<SchedulingCopilotSuggestion suggestion={revSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('scheduling-copilot-suggestion--review')
  })

  it('renders as an alert role for accessibility', () => {
    render(<SchedulingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
