import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TopicTileGrid from './TopicTileGrid'

const sampleTopics = [
  { id: 'wages', label: 'Wages & Salary', description: 'W-2 employment income', icon: 'dollar-sign' },
  { id: 'freelance', label: 'Freelance Income', description: '1099-NEC self-employment', icon: 'briefcase' },
  { id: 'investments', label: 'Investments', description: 'Stocks, bonds, crypto', icon: 'trending-up' },
  { id: 'rental', label: 'Rental Income', description: 'Property rental revenue', icon: 'home' },
]

describe('TopicTileGrid', () => {
  const defaultProps = {
    topics: sampleTopics,
    selectedTopics: [] as string[],
    onToggle: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onToggle.mockClear()
  })

  it('renders all topic labels', () => {
    render(<TopicTileGrid {...defaultProps} />)
    expect(screen.getByText('Wages & Salary')).toBeInTheDocument()
    expect(screen.getByText('Freelance Income')).toBeInTheDocument()
    expect(screen.getByText('Investments')).toBeInTheDocument()
    expect(screen.getByText('Rental Income')).toBeInTheDocument()
  })

  it('renders all topic descriptions', () => {
    render(<TopicTileGrid {...defaultProps} />)
    expect(screen.getByText('W-2 employment income')).toBeInTheDocument()
    expect(screen.getByText('1099-NEC self-employment')).toBeInTheDocument()
    expect(screen.getByText('Stocks, bonds, crypto')).toBeInTheDocument()
    expect(screen.getByText('Property rental revenue')).toBeInTheDocument()
  })

  it('renders a group with aria-label "Tax topics"', () => {
    render(<TopicTileGrid {...defaultProps} />)
    expect(screen.getByRole('group', { name: 'Tax topics' })).toBeInTheDocument()
  })

  it('renders buttons with aria-pressed="false" when not selected', () => {
    render(<TopicTileGrid {...defaultProps} selectedTopics={[]} />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-pressed', 'false')
    })
  })

  it('renders selected topics with aria-pressed="true"', () => {
    render(<TopicTileGrid {...defaultProps} selectedTopics={['wages', 'investments']} />)
    const wagesBtn = screen.getByText('Wages & Salary').closest('button')!
    const investmentsBtn = screen.getByText('Investments').closest('button')!
    const freelanceBtn = screen.getByText('Freelance Income').closest('button')!

    expect(wagesBtn).toHaveAttribute('aria-pressed', 'true')
    expect(investmentsBtn).toHaveAttribute('aria-pressed', 'true')
    expect(freelanceBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('applies --selected class to selected topics', () => {
    render(<TopicTileGrid {...defaultProps} selectedTopics={['freelance']} />)
    const freelanceBtn = screen.getByText('Freelance Income').closest('button')!
    expect(freelanceBtn.className).toContain('topic-tile-grid__tile--selected')
  })

  it('does not apply --selected class to unselected topics', () => {
    render(<TopicTileGrid {...defaultProps} selectedTopics={['freelance']} />)
    const wagesBtn = screen.getByText('Wages & Salary').closest('button')!
    expect(wagesBtn.className).not.toContain('topic-tile-grid__tile--selected')
  })

  it('calls onToggle with the correct topic id when clicked', async () => {
    const user = userEvent.setup()
    render(<TopicTileGrid {...defaultProps} />)
    await user.click(screen.getByText('Investments').closest('button')!)
    expect(defaultProps.onToggle).toHaveBeenCalledWith('investments')
  })

  it('calls onToggle for an already-selected topic (to deselect)', async () => {
    const user = userEvent.setup()
    render(<TopicTileGrid {...defaultProps} selectedTopics={['rental']} />)
    await user.click(screen.getByText('Rental Income').closest('button')!)
    expect(defaultProps.onToggle).toHaveBeenCalledWith('rental')
  })

  it('renders nothing when topics array is empty', () => {
    render(<TopicTileGrid topics={[]} selectedTopics={[]} onToggle={defaultProps.onToggle} />)
    const group = screen.getByRole('group', { name: 'Tax topics' })
    expect(group.children).toHaveLength(0)
  })

  it('uses fallback icon for unknown icon strings', () => {
    const topicsWithUnknownIcon = [
      { id: 'custom', label: 'Custom Topic', description: 'Some custom thing', icon: 'unknown-icon' },
    ]
    render(<TopicTileGrid topics={topicsWithUnknownIcon} selectedTopics={[]} onToggle={defaultProps.onToggle} />)
    // Should still render without crashing
    expect(screen.getByText('Custom Topic')).toBeInTheDocument()
  })
})
