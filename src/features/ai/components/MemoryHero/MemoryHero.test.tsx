import { render, screen } from '@testing-library/react'
import type { MemoryCategory } from '../../types'
import MemoryHero from './MemoryHero'

const mockStats: Array<{ category: MemoryCategory; count: number; tokenCount: number }> = [
  { category: 'decisions', count: 5, tokenCount: 5000 },
  { category: 'workflows', count: 3, tokenCount: 3000 },
  { category: 'preferences', count: 2, tokenCount: 1500 },
  { category: 'people', count: 4, tokenCount: 2000 },
  { category: 'projects', count: 6, tokenCount: 4000 },
  { category: 'facts', count: 4, tokenCount: 2500 },
]

const defaultProps = {
  totalTokens: 18000,
  entryCount: 24,
  categoryStats: mockStats,
}

describe('MemoryHero', () => {
  it('renders the Context Memory title', () => {
    render(<MemoryHero {...defaultProps} />)
    expect(screen.getByText('Context Memory')).toBeInTheDocument()
  })

  it('renders the headline', () => {
    render(<MemoryHero {...defaultProps} />)
    expect(
      screen.getByText("Your organization's living knowledge base")
    ).toBeInTheDocument()
  })

  it('renders all 3 value proposition texts', () => {
    render(<MemoryHero {...defaultProps} />)
    expect(
      screen.getByText('Stores decisions, workflows, and team knowledge')
    ).toBeInTheDocument()
    expect(
      screen.getByText('AI agents read memory to give contextual answers')
    ).toBeInTheDocument()
    expect(
      screen.getByText('1M tokens of persistent, encrypted context')
    ).toBeInTheDocument()
  })

  it('renders SVG usage ring with correct aria-label', () => {
    render(<MemoryHero {...defaultProps} />)
    const ring = screen.getByRole('img')
    expect(ring).toHaveAttribute(
      'aria-label',
      'Memory usage: 2% of 1.0M tokens'
    )
  })

  it('displays formatted token count', () => {
    render(<MemoryHero {...defaultProps} />)
    expect(screen.getByText('18.0K')).toBeInTheDocument()
  })

  it('displays entry count', () => {
    render(<MemoryHero {...defaultProps} />)
    expect(screen.getByText('24 entries')).toBeInTheDocument()
  })

  it('shows singular entry text for 1 entry', () => {
    render(<MemoryHero {...defaultProps} entryCount={1} />)
    expect(screen.getByText('1 entry')).toBeInTheDocument()
  })
})
