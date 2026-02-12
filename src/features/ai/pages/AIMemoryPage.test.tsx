import { render, screen } from '@testing-library/react'
import AIMemoryPage from './AIMemoryPage'

// Mock indexedDB for memory store
const mockGetAllEntries = vi.fn().mockResolvedValue([])
vi.mock('../lib/indexedDB', () => ({
  getAllEntries: () => mockGetAllEntries(),
  putEntry: vi.fn().mockResolvedValue(undefined),
  deleteEntry: vi.fn().mockResolvedValue(undefined),
  clearEntries: vi.fn().mockResolvedValue(undefined),
  exportAllEntries: vi.fn().mockResolvedValue([]),
  importEntries: vi.fn().mockResolvedValue(undefined),
}))

describe('AIMemoryPage', () => {
  it('renders the MemoryHero title', () => {
    render(<AIMemoryPage />)
    expect(screen.getByText('Context Memory')).toBeInTheDocument()
  })

  it('renders the hero headline', () => {
    render(<AIMemoryPage />)
    expect(screen.getByText(/living knowledge base/i)).toBeInTheDocument()
  })

  it('renders the MemoryCategoryBar with All tab', () => {
    render(<AIMemoryPage />)
    expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument()
  })

  it('renders Quick Start section when few entries', () => {
    render(<AIMemoryPage />)
    expect(screen.getByText(/quick start/i)).toBeInTheDocument()
  })

  it('renders the insights panel', () => {
    render(<AIMemoryPage />)
    expect(screen.getByText('Insights')).toBeInTheDocument()
  })

  it('does not render old subtitle', () => {
    render(<AIMemoryPage />)
    expect(screen.queryByText('1M token organizational memory')).not.toBeInTheDocument()
  })

  it('does not render old progressbar', () => {
    render(<AIMemoryPage />)
    expect(screen.queryByRole('progressbar', { name: 'Token usage' })).not.toBeInTheDocument()
  })
})
