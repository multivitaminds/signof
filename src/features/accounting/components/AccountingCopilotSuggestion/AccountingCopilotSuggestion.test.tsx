import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountingCopilotSuggestion from './AccountingCopilotSuggestion'
import type { CopilotSuggestion } from '../../stores/useAccountingCopilotStore'

describe('AccountingCopilotSuggestion', () => {
  const baseSuggestion: CopilotSuggestion = {
    id: 'sug-1',
    type: 'tip',
    title: 'Expense Tip',
    description: 'This is a helpful accounting tip.',
    dismissed: false,
  }

  const mockOnDismiss = vi.fn()

  beforeEach(() => {
    mockOnDismiss.mockClear()
  })

  it('renders the suggestion title', () => {
    render(<AccountingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('Expense Tip')).toBeInTheDocument()
  })

  it('renders the suggestion description', () => {
    render(<AccountingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('This is a helpful accounting tip.')).toBeInTheDocument()
  })

  it('renders action button when action is provided', () => {
    const withAction: CopilotSuggestion = {
      ...baseSuggestion,
      action: { label: 'View Expenses', route: '/accounting/expenses' },
    }
    render(<AccountingCopilotSuggestion suggestion={withAction} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('View Expenses')).toBeInTheDocument()
  })

  it('does not render action button when no action', () => {
    render(<AccountingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.queryByText('View Expenses')).not.toBeInTheDocument()
  })

  it('calls onDismiss with suggestion id when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    render(<AccountingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    const dismissBtn = screen.getByLabelText('Dismiss Expense Tip')
    await user.click(dismissBtn)
    expect(mockOnDismiss).toHaveBeenCalledWith('sug-1')
  })

  it('renders correct type class for tip', () => {
    render(<AccountingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('accounting-copilot-suggestion--tip')
  })

  it('renders correct type class for warning', () => {
    const warnSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'warning', title: 'Warning' }
    render(<AccountingCopilotSuggestion suggestion={warnSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('accounting-copilot-suggestion--warning')
  })

  it('renders correct type class for deduction', () => {
    const dedSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'deduction', title: 'Deduction' }
    render(<AccountingCopilotSuggestion suggestion={dedSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('accounting-copilot-suggestion--deduction')
  })

  it('renders correct type class for missing_info', () => {
    const miSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'missing_info', title: 'Missing' }
    render(<AccountingCopilotSuggestion suggestion={miSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('accounting-copilot-suggestion--missing_info')
  })

  it('renders correct type class for review', () => {
    const revSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'review', title: 'Review' }
    render(<AccountingCopilotSuggestion suggestion={revSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('accounting-copilot-suggestion--review')
  })

  it('renders as an alert role for accessibility', () => {
    render(<AccountingCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
