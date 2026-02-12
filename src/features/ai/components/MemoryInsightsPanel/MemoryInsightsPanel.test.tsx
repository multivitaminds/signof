import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MemoryInsightsPanel from './MemoryInsightsPanel'
import type { MemoryCategory, MemoryInsight } from '../../types'

const makeCategoryStats = (): Array<{ category: MemoryCategory; count: number; tokenCount: number }> => [
  { category: 'decisions', count: 5, tokenCount: 1200 },
  { category: 'workflows', count: 3, tokenCount: 800 },
  { category: 'preferences', count: 2, tokenCount: 400 },
  { category: 'people', count: 0, tokenCount: 0 },
  { category: 'projects', count: 4, tokenCount: 950 },
  { category: 'facts', count: 1, tokenCount: 200 },
]

const makeInsights = (): MemoryInsight[] => [
  {
    type: 'suggestion',
    title: 'Add People memories',
    description: 'You don\'t have any people stored yet.',
    action: { label: 'Add Team Member', templateId: 'tpl-team-member' },
  },
  {
    type: 'coverage',
    title: 'Great workflow coverage',
    description: 'Your workflow documentation is comprehensive.',
  },
]

describe('MemoryInsightsPanel', () => {
  const onActionClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Insights title', () => {
    render(<MemoryInsightsPanel categoryStats={makeCategoryStats()} insights={[]} />)
    expect(screen.getByText('Insights')).toBeInTheDocument()
  })

  it('renders 6 coverage bars', () => {
    render(<MemoryInsightsPanel categoryStats={makeCategoryStats()} insights={[]} />)
    expect(screen.getByText('Decisions')).toBeInTheDocument()
    expect(screen.getByText('Workflows')).toBeInTheDocument()
    expect(screen.getByText('Preferences')).toBeInTheDocument()
    expect(screen.getByText('People')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Facts')).toBeInTheDocument()
  })

  it('shows correct count on coverage bars', () => {
    render(<MemoryInsightsPanel categoryStats={makeCategoryStats()} insights={[]} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders suggestion cards with titles and descriptions', () => {
    render(
      <MemoryInsightsPanel
        categoryStats={makeCategoryStats()}
        insights={makeInsights()}
        onActionClick={onActionClick}
      />
    )
    expect(screen.getByText('Add People memories')).toBeInTheDocument()
    expect(screen.getByText(/You don't have any people/)).toBeInTheDocument()
    expect(screen.getByText('Great workflow coverage')).toBeInTheDocument()
    expect(screen.getByText(/Your workflow documentation/)).toBeInTheDocument()
  })

  it('renders CTA button for insights with action', () => {
    render(
      <MemoryInsightsPanel
        categoryStats={makeCategoryStats()}
        insights={makeInsights()}
        onActionClick={onActionClick}
      />
    )
    expect(screen.getByRole('button', { name: /Add Team Member/i })).toBeInTheDocument()
  })

  it('calls onActionClick when CTA button is clicked', async () => {
    const user = userEvent.setup()
    const insights = makeInsights()
    render(
      <MemoryInsightsPanel
        categoryStats={makeCategoryStats()}
        insights={insights}
        onActionClick={onActionClick}
      />
    )
    await user.click(screen.getByRole('button', { name: /Add Team Member/i }))
    expect(onActionClick).toHaveBeenCalledWith(insights[0])
  })

  it('handles empty insights array gracefully', () => {
    render(<MemoryInsightsPanel categoryStats={makeCategoryStats()} insights={[]} />)
    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.queryByText('Suggestions')).not.toBeInTheDocument()
  })

  it('does not render suggestions section when insights is empty', () => {
    const { container } = render(
      <MemoryInsightsPanel categoryStats={makeCategoryStats()} insights={[]} />
    )
    expect(container.querySelector('.memory-insights__suggestions')).not.toBeInTheDocument()
  })

  it('does not render CTA button for insights without action', () => {
    const insights: MemoryInsight[] = [
      {
        type: 'coverage',
        title: 'Good coverage',
        description: 'Looking good.',
      },
    ]
    render(
      <MemoryInsightsPanel
        categoryStats={makeCategoryStats()}
        insights={insights}
        onActionClick={onActionClick}
      />
    )
    expect(screen.getByText('Good coverage')).toBeInTheDocument()
    // No buttons beyond coverage bars
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
