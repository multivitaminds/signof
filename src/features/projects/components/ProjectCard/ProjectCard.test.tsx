import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectCard from './ProjectCard'
import type { Project } from '../../types'
import { ViewType } from '../../types'

const mockProject: Project = {
  id: 'proj-1',
  name: 'Test Project',
  description: 'A test project description',
  prefix: 'TST',
  color: '#4F46E5',
  memberIds: [],
  labels: [],
  nextIssueNumber: 1,
  currentView: ViewType.Board,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

describe('ProjectCard', () => {
  it('renders project name and prefix', () => {
    render(
      <ProjectCard
        project={mockProject}
        issueCount={5}
        completedCount={2}
        onClick={vi.fn()}
      />
    )

    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('TST')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(
      <ProjectCard
        project={mockProject}
        issueCount={0}
        completedCount={0}
        onClick={vi.fn()}
      />
    )

    expect(screen.getByText('A test project description')).toBeInTheDocument()
  })

  it('renders issue stats', () => {
    render(
      <ProjectCard
        project={mockProject}
        issueCount={10}
        completedCount={3}
        onClick={vi.fn()}
      />
    )

    expect(screen.getByText(/10 issues/)).toBeInTheDocument()
    expect(screen.getByText(/3 completed/)).toBeInTheDocument()
  })

  it('uses singular "issue" when count is 1', () => {
    render(
      <ProjectCard
        project={mockProject}
        issueCount={1}
        completedCount={0}
        onClick={vi.fn()}
      />
    )

    expect(screen.getByText(/1 issue/)).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <ProjectCard
        project={mockProject}
        issueCount={0}
        completedCount={0}
        onClick={handleClick}
      />
    )

    await user.click(screen.getByRole('button', { name: /open project test project/i }))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('renders color stripe with project color', () => {
    const { container } = render(
      <ProjectCard
        project={mockProject}
        issueCount={0}
        completedCount={0}
        onClick={vi.fn()}
      />
    )

    const stripe = container.querySelector('.project-card__stripe')
    expect(stripe).toHaveStyle({ backgroundColor: '#4F46E5' })
  })

  it('hides description when empty', () => {
    const projectNoDesc = { ...mockProject, description: '' }

    const { container } = render(
      <ProjectCard
        project={projectNoDesc}
        issueCount={0}
        completedCount={0}
        onClick={vi.fn()}
      />
    )

    expect(container.querySelector('.project-card__description')).not.toBeInTheDocument()
  })
})
