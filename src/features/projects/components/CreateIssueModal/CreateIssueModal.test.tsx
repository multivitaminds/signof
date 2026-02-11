import { render, screen } from '@testing-library/react'
import CreateIssueModal from './CreateIssueModal'

vi.mock('../../stores/useProjectStore', () => ({
  useProjectStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      createIssue: vi.fn(() => ({
        id: 'new-issue',
        projectId: 'proj-1',
        identifier: 'SO-1',
        title: 'New Issue',
        description: '',
        status: 'todo',
        priority: 'none',
        assigneeId: null,
        labelIds: [],
        estimate: null,
        dueDate: null,
        parentIssueId: null,
        cycleId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      projects: {
        'proj-1': {
          id: 'proj-1',
          name: 'Test Project',
          prefix: 'SO',
          labels: [{ id: 'label-1', name: 'Bug', color: '#EF4444' }],
        },
      },
      members: [
        { id: 'm-1', name: 'Alice', email: 'alice@test.com', avatarUrl: '' },
      ],
    }),
}))

vi.mock('../../../../hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(),
}))

describe('CreateIssueModal', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <CreateIssueModal projectId="proj-1" open={false} onClose={vi.fn()} />
    )
    expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument()
  })

  it('renders modal when open', () => {
    render(
      <CreateIssueModal projectId="proj-1" open={true} onClose={vi.fn()} />
    )
    expect(screen.getByText('New Issue')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders form fields', () => {
    render(
      <CreateIssueModal projectId="proj-1" open={true} onClose={vi.fn()} />
    )
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('renders property selectors', () => {
    render(
      <CreateIssueModal projectId="proj-1" open={true} onClose={vi.fn()} />
    )
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Assignee')).toBeInTheDocument()
    expect(screen.getByText('Labels')).toBeInTheDocument()
  })

  it('renders Cancel and Create Issue buttons', () => {
    render(
      <CreateIssueModal projectId="proj-1" open={true} onClose={vi.fn()} />
    )
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Create Issue')).toBeInTheDocument()
  })

  it('disables submit when title is empty', () => {
    render(
      <CreateIssueModal projectId="proj-1" open={true} onClose={vi.fn()} />
    )
    const submitBtn = screen.getByText('Create Issue')
    expect(submitBtn).toBeDisabled()
  })

  it('renders close button', () => {
    render(
      <CreateIssueModal projectId="proj-1" open={true} onClose={vi.fn()} />
    )
    expect(screen.getByLabelText('Close')).toBeInTheDocument()
  })
})
