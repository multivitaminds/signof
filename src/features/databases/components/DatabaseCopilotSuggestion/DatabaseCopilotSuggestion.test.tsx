import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatabaseCopilotSuggestion from './DatabaseCopilotSuggestion'
import type { CopilotSuggestion } from '../../stores/useDatabaseCopilotStore'

describe('DatabaseCopilotSuggestion', () => {
  const baseSuggestion: CopilotSuggestion = {
    id: 'sug-1',
    type: 'tip',
    title: 'Schema Tip',
    description: 'This is a helpful database tip.',
    dismissed: false,
  }

  const mockOnDismiss = vi.fn()

  beforeEach(() => {
    mockOnDismiss.mockClear()
  })

  it('renders the suggestion title', () => {
    render(<DatabaseCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('Schema Tip')).toBeInTheDocument()
  })

  it('renders the suggestion description', () => {
    render(<DatabaseCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('This is a helpful database tip.')).toBeInTheDocument()
  })

  it('renders action button when action is provided', () => {
    const withAction: CopilotSuggestion = {
      ...baseSuggestion,
      action: { label: 'View Schema', route: '/databases' },
    }
    render(<DatabaseCopilotSuggestion suggestion={withAction} onDismiss={mockOnDismiss} />)
    expect(screen.getByText('View Schema')).toBeInTheDocument()
  })

  it('does not render action button when no action', () => {
    render(<DatabaseCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.queryByText('View Schema')).not.toBeInTheDocument()
  })

  it('calls onDismiss with suggestion id when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    render(<DatabaseCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    const dismissBtn = screen.getByLabelText('Dismiss Schema Tip')
    await user.click(dismissBtn)
    expect(mockOnDismiss).toHaveBeenCalledWith('sug-1')
  })

  it('renders correct type class for tip', () => {
    render(<DatabaseCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('database-copilot-suggestion--tip')
  })

  it('renders correct type class for warning', () => {
    const warnSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'warning', title: 'Warning' }
    render(<DatabaseCopilotSuggestion suggestion={warnSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('database-copilot-suggestion--warning')
  })

  it('renders correct type class for optimization', () => {
    const optSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'optimization', title: 'Optimization' }
    render(<DatabaseCopilotSuggestion suggestion={optSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('database-copilot-suggestion--optimization')
  })

  it('renders correct type class for missing_info', () => {
    const miSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'missing_info', title: 'Missing' }
    render(<DatabaseCopilotSuggestion suggestion={miSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('database-copilot-suggestion--missing_info')
  })

  it('renders correct type class for review', () => {
    const revSuggestion: CopilotSuggestion = { ...baseSuggestion, type: 'review', title: 'Review' }
    render(<DatabaseCopilotSuggestion suggestion={revSuggestion} onDismiss={mockOnDismiss} />)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('database-copilot-suggestion--review')
  })

  it('renders as an alert role for accessibility', () => {
    render(<DatabaseCopilotSuggestion suggestion={baseSuggestion} onDismiss={mockOnDismiss} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
