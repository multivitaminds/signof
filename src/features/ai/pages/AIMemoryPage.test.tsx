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
  it('renders the page title', () => {
    render(<AIMemoryPage />)
    expect(screen.getByText('Context Memory')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<AIMemoryPage />)
    expect(screen.getByText('1M token organizational memory')).toBeInTheDocument()
  })

  it('renders the token usage progress bar', () => {
    render(<AIMemoryPage />)
    expect(screen.getByRole('progressbar', { name: 'Token usage' })).toBeInTheDocument()
  })
})
