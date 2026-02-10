import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NewProjectPage from './NewProjectPage'

const mockCreateProject = vi.fn(() => 'new-project-id')
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../stores/useProjectStore', () => ({
  useProjectStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const mockState = {
      createProject: mockCreateProject,
    }
    return selector(mockState)
  },
}))

describe('NewProjectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form', () => {
    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    expect(screen.getByText('New Project')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Prefix')).toBeInTheDocument()
    expect(screen.getByText('Color')).toBeInTheDocument()
  })

  it('auto-generates prefix from name', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Name'), 'Alpha Beta')
    expect(screen.getByLabelText('Prefix')).toHaveValue('AB')
  })

  it('auto-generates 3-letter prefix from single word', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Name'), 'Testing')
    expect(screen.getByLabelText('Prefix')).toHaveValue('TES')
  })

  it('disables submit when name is empty', () => {
    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: 'Create Project' })).toBeDisabled()
  })

  it('creates project and navigates on submit', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Name'), 'My Project')
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    expect(mockCreateProject).toHaveBeenCalledWith({
      name: 'My Project',
      description: '',
      prefix: 'MP',
      color: '#4F46E5',
    })
    expect(mockNavigate).toHaveBeenCalledWith('/projects/new-project-id')
  })

  it('navigates back on cancel', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockNavigate).toHaveBeenCalledWith('/projects')
  })

  it('renders 8 color options', () => {
    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    const colorButtons = screen.getAllByRole('radio')
    expect(colorButtons).toHaveLength(8)
  })

  it('selects a color on click', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    const greenColor = screen.getByRole('radio', { name: 'Color #059669' })
    await user.click(greenColor)
    expect(greenColor).toHaveAttribute('aria-checked', 'true')
  })
})
