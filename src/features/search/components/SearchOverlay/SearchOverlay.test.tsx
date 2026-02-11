import { render, screen } from '@testing-library/react'
import SearchOverlay from './SearchOverlay'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../../hooks/useGlobalSearch', () => ({
  useGlobalSearch: () => ({
    query: '',
    results: [],
    isSearching: false,
    selectedIndex: -1,
    search: vi.fn(),
    clear: vi.fn(),
    selectNext: vi.fn(),
    selectPrev: vi.fn(),
    getSelected: () => null,
  }),
}))

describe('SearchOverlay', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <SearchOverlay isOpen={false} onClose={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the search dialog when isOpen is true', () => {
    render(<SearchOverlay isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument()
  })

  it('renders the search input', () => {
    render(<SearchOverlay isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByLabelText('Search input')).toBeInTheDocument()
  })

  it('renders the placeholder text', () => {
    render(<SearchOverlay isOpen={true} onClose={vi.fn()} />)
    expect(
      screen.getByPlaceholderText('Type to search across your workspace')
    ).toBeInTheDocument()
  })

  it('renders close button', () => {
    render(<SearchOverlay isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByLabelText('Close search')).toBeInTheDocument()
  })

  it('renders empty state hint', () => {
    render(<SearchOverlay isOpen={true} onClose={vi.fn()} />)
    expect(
      screen.getByText('Type to search across your workspace')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Search pages, issues, documents, bookings, and databases')
    ).toBeInTheDocument()
  })

  it('renders keyboard navigation footer', () => {
    render(<SearchOverlay isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('navigate')).toBeInTheDocument()
    expect(screen.getByText('open')).toBeInTheDocument()
    expect(screen.getByText('close')).toBeInTheDocument()
  })
})
