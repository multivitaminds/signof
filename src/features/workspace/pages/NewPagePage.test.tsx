import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NewPagePage from './NewPagePage'

// Mock the workspace store
vi.mock('../stores/useWorkspaceStore', () => ({
  useWorkspaceStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const mockState = {
      addPage: vi.fn(() => 'new-page-id'),
      addPageWithBlocks: vi.fn(() => 'new-page-id'),
    }
    return selector(mockState)
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('NewPagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title', () => {
    render(
      <MemoryRouter>
        <NewPagePage />
      </MemoryRouter>
    )
    expect(screen.getByText('Create a new page')).toBeInTheDocument()
  })

  it('renders template picker', () => {
    render(
      <MemoryRouter>
        <NewPagePage />
      </MemoryRouter>
    )
    expect(screen.getByText('Blank')).toBeInTheDocument()
    expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
  })
})
