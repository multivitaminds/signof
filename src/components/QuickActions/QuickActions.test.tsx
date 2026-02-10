import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import QuickActions from './QuickActions'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderQuickActions() {
  return render(
    <MemoryRouter>
      <QuickActions />
    </MemoryRouter>
  )
}

describe('QuickActions', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders the quick actions section', () => {
    renderQuickActions()
    expect(screen.getByLabelText('Quick actions')).toBeInTheDocument()
  })

  it('renders section title', () => {
    renderQuickActions()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('renders all six action buttons', () => {
    renderQuickActions()
    expect(screen.getByText('New Document')).toBeInTheDocument()
    expect(screen.getByText('New Page')).toBeInTheDocument()
    expect(screen.getByText('New Issue')).toBeInTheDocument()
    expect(screen.getByText('New Event')).toBeInTheDocument()
    expect(screen.getByText('New Database')).toBeInTheDocument()
    expect(screen.getByText('Upload File')).toBeInTheDocument()
  })

  it('renders keyboard shortcut hints', () => {
    renderQuickActions()
    expect(screen.getByText('D')).toBeInTheDocument()
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('navigates when New Document is clicked', async () => {
    const user = userEvent.setup()
    renderQuickActions()

    await user.click(screen.getByText('New Document'))
    expect(mockNavigate).toHaveBeenCalledWith('/documents')
  })

  it('navigates when New Page is clicked', async () => {
    const user = userEvent.setup()
    renderQuickActions()

    await user.click(screen.getByText('New Page'))
    expect(mockNavigate).toHaveBeenCalledWith('/pages/new')
  })

  it('navigates when New Issue is clicked', async () => {
    const user = userEvent.setup()
    renderQuickActions()

    await user.click(screen.getByText('New Issue'))
    expect(mockNavigate).toHaveBeenCalledWith('/projects')
  })

  it('navigates when Upload File is clicked', async () => {
    const user = userEvent.setup()
    renderQuickActions()

    await user.click(screen.getByText('Upload File'))
    expect(mockNavigate).toHaveBeenCalledWith('/documents?action=upload')
  })

  it('renders the grid container', () => {
    const { container } = renderQuickActions()
    expect(container.querySelector('.quick-actions__grid')).toBeInTheDocument()
  })

  it('renders action cards as buttons', () => {
    renderQuickActions()
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(6)
  })
})
