import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MemoryCategory } from '../../types'
import MemoryCategoryBar from './MemoryCategoryBar'

const mockStats: Array<{ category: MemoryCategory; count: number; tokenCount: number }> = [
  { category: 'decisions', count: 5, tokenCount: 5000 },
  { category: 'workflows', count: 3, tokenCount: 3000 },
  { category: 'preferences', count: 2, tokenCount: 1500 },
  { category: 'people', count: 4, tokenCount: 2000 },
  { category: 'projects', count: 6, tokenCount: 4000 },
  { category: 'facts', count: 4, tokenCount: 2500 },
]

const defaultProps = {
  activeTab: 'all' as const,
  categoryStats: mockStats,
  totalEntries: 24,
  onTabChange: vi.fn(),
}

describe('MemoryCategoryBar', () => {
  it('renders All tab plus 6 category tabs (7 total)', () => {
    render(<MemoryCategoryBar {...defaultProps} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(7)
  })

  it('shows correct entry counts on each tab', () => {
    render(<MemoryCategoryBar {...defaultProps} />)

    const tabs = screen.getAllByRole('tab')

    // All tab: 24
    expect(tabs[0]).toHaveTextContent('All')
    expect(tabs[0]).toHaveTextContent('24')

    // Decisions: 5
    expect(tabs[1]).toHaveTextContent('Decisions')
    expect(tabs[1]).toHaveTextContent('5')

    // Workflows: 3
    expect(tabs[2]).toHaveTextContent('Workflows')
    expect(tabs[2]).toHaveTextContent('3')

    // Preferences: 2
    expect(tabs[3]).toHaveTextContent('Preferences')
    expect(tabs[3]).toHaveTextContent('2')

    // People: 4
    expect(tabs[4]).toHaveTextContent('People')
    expect(tabs[4]).toHaveTextContent('4')

    // Projects: 6
    expect(tabs[5]).toHaveTextContent('Projects')
    expect(tabs[5]).toHaveTextContent('6')

    // Facts: 4
    expect(tabs[6]).toHaveTextContent('Facts')
    expect(tabs[6]).toHaveTextContent('4')
  })

  it('calls onTabChange with correct category when clicking a tab', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()

    render(<MemoryCategoryBar {...defaultProps} onTabChange={onTabChange} />)

    await user.click(screen.getByText('Decisions'))
    expect(onTabChange).toHaveBeenCalledWith('decisions')
  })

  it('calls onTabChange with "all" when clicking the active tab', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()

    render(
      <MemoryCategoryBar
        {...defaultProps}
        activeTab="decisions"
        onTabChange={onTabChange}
      />
    )

    await user.click(screen.getByText('Decisions'))
    expect(onTabChange).toHaveBeenCalledWith('all')
  })

  it('active tab has active styling class', () => {
    const { container } = render(
      <MemoryCategoryBar {...defaultProps} activeTab="workflows" />
    )

    const activeCards = container.querySelectorAll(
      '.memory-category-bar__card--active'
    )
    expect(activeCards).toHaveLength(1)
  })
})
