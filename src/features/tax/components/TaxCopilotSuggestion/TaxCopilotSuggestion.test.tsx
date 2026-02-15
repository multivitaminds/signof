import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaxCopilotSuggestion from './TaxCopilotSuggestion'
import type { CopilotSuggestion } from '../../stores/useTaxCopilotStore'

describe('TaxCopilotSuggestion', () => {
  const baseSuggestion: CopilotSuggestion = {
    id: 'sug-1',
    type: 'tip',
    title: 'Tax Tip',
    description: 'This is a helpful tax tip.',
    dismissed: false,
  }

  const mockOnDismiss = vi.fn()

  beforeEach(() => {
    mockOnDismiss.mockClear()
  })

  it('renders the suggestion title', () => {
    render(<TaxCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('Tax Tip')).toBeInTheDocument()
  })

  it('renders the suggestion description', () => {
    render(<TaxCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('This is a helpful tax tip.')).toBeInTheDocument()
  })

  it('renders action button when action is provided', () => {
    const withAction: CopilotSuggestion = {
      ...baseSuggestion,
      action: { label: 'Learn More', route: '/tax/interview' },
    }
    render(<TaxCopilotSuggestion suggestion={withAction} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })

  it('does not render action button when no action', () => {
    render(<TaxCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.queryByText('Learn More')).not.toBeInTheDocument()
  })

  it('calls onDismiss with suggestion id when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaxCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    const dismissBtn = screen.getByLabelText('Dismiss Tax Tip')
    await user.click(dismissBtn)
    expect(mockOnDismiss).toHaveBeenCalledWith('sug-1')
  })

  it('renders correct type class for tip', () => {
    render(<TaxCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('tax-copilot-suggestion--tip')
  })

  it('renders correct type class for warning', () => {
    const warnSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'warning', title: 'Warning' }
    render(<TaxCopilotSuggestion suggestion={warnSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('tax-copilot-suggestion--warning')
  })

  it('renders correct type class for deduction', () => {
    const dedSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'deduction', title: 'Deduction' }
    render(<TaxCopilotSuggestion suggestion={dedSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('tax-copilot-suggestion--deduction')
  })

  it('renders correct type class for missing_info', () => {
    const miSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'missing_info', title: 'Missing' }
    render(<TaxCopilotSuggestion suggestion={miSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('tax-copilot-suggestion--missing_info')
  })

  it('renders correct type class for review', () => {
    const revSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'review', title: 'Review' }
    render(<TaxCopilotSuggestion suggestion={revSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('tax-copilot-suggestion--review')
  })

  it('renders as an alert role for accessibility', () => {
    render(<TaxCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
