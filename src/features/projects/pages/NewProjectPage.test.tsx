import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NewProjectPage from './NewProjectPage'

const mockCreateProject = vi.fn(() => 'new-project-id')
const mockUpdateProject = vi.fn()
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
      updateProject: mockUpdateProject,
    }
    return selector(mockState)
  },
}))

/** Navigate to the form step by clicking "Start from Scratch" */
async function goToFormStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Start from Scratch' }))
}

describe('NewProjectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Template Step ────────────────────────────────────────────────

  it('renders template selection step initially', () => {
    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    expect(screen.getByText('New Project')).toBeInTheDocument()
    expect(screen.getByText(/Choose a template/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start from Scratch' })).toBeInTheDocument()
  })

  it('shows 8 template cards', () => {
    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    const templates = screen.getAllByRole('listitem')
    expect(templates).toHaveLength(8)
  })

  it('shows expected template names', () => {
    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    expect(screen.getByLabelText('Template: Software Development')).toBeInTheDocument()
    expect(screen.getByLabelText('Template: Marketing Campaign')).toBeInTheDocument()
    expect(screen.getByLabelText('Template: Bug Tracking')).toBeInTheDocument()
    expect(screen.getByLabelText('Template: Sprint')).toBeInTheDocument()
    expect(screen.getByLabelText('Template: Event Planning')).toBeInTheDocument()
  })

  it('navigates to form step when template is selected', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await user.click(screen.getByLabelText('Template: Software Development'))

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    // The badge shows the template name
    const badge = document.querySelector('.new-project__template-badge')
    expect(badge).not.toBeNull()
    expect(badge!.textContent).toContain('Software Development')
  })

  it('navigates to form step with Start from Scratch', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await goToFormStep(user)

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByText('Color')).toBeInTheDocument()
  })

  it('navigates back on Cancel from template step', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockNavigate).toHaveBeenCalledWith('/projects')
  })

  // ─── Form Step (same tests as before, but after navigating to form) ─────

  it('renders the form', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await goToFormStep(user)

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

    await goToFormStep(user)
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

    await goToFormStep(user)
    await user.type(screen.getByLabelText('Name'), 'Testing')
    expect(screen.getByLabelText('Prefix')).toHaveValue('TES')
  })

  it('disables submit when name is empty', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await goToFormStep(user)
    expect(screen.getByRole('button', { name: 'Create Project' })).toBeDisabled()
  })

  it('creates project and navigates on submit', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await goToFormStep(user)
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

  it('navigates back on cancel from form step', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await goToFormStep(user)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockNavigate).toHaveBeenCalledWith('/projects')
  })

  it('renders 8 color options', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await goToFormStep(user)
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

    await goToFormStep(user)
    const greenColor = screen.getByRole('radio', { name: 'Color #059669' })
    await user.click(greenColor)
    expect(greenColor).toHaveAttribute('aria-checked', 'true')
  })

  it('shows template statuses and labels when template is selected', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await user.click(screen.getByLabelText('Template: Bug Tracking'))

    expect(screen.getByText('Template Statuses')).toBeInTheDocument()
    expect(screen.getByText('Triaged')).toBeInTheDocument()
    expect(screen.getByText('Template Labels')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('applies template labels when creating project from template', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await user.click(screen.getByLabelText('Template: Sprint'))
    await user.type(screen.getByLabelText('Name'), 'Sprint Project')
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    expect(mockCreateProject).toHaveBeenCalled()
    expect(mockUpdateProject).toHaveBeenCalledWith(
      'new-project-id',
      expect.objectContaining({
        labels: expect.arrayContaining([
          expect.objectContaining({ name: 'Story' }),
          expect.objectContaining({ name: 'Task' }),
          expect.objectContaining({ name: 'Spike' }),
        ]),
      })
    )
  })

  it('back button goes to template step from form step', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <NewProjectPage />
      </MemoryRouter>
    )

    await goToFormStep(user)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Back to templates'))

    // Should be back at templates
    expect(screen.getByText(/Choose a template/)).toBeInTheDocument()
  })
})
