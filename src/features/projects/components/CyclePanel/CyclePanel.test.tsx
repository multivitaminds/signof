import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useProjectStore } from '../../stores/useProjectStore'
import CyclePanel from './CyclePanel'

function seedStore() {
  const store = useProjectStore.getState()

  // Ensure a project exists
  store.projects['proj-test'] = {
    id: 'proj-test',
    name: 'Test Project',
    description: '',
    prefix: 'TP',
    color: '#4F46E5',
    memberIds: [],
    labels: [],
    nextIssueNumber: 1,
    currentView: 'board',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }

  // Add a cycle
  store.cycles['cycle-1'] = {
    id: 'cycle-1',
    projectId: 'proj-test',
    name: 'Sprint 1',
    startDate: '2026-02-03',
    endDate: '2026-02-14',
    status: 'active',
  }

  store.cycles['cycle-2'] = {
    id: 'cycle-2',
    projectId: 'proj-test',
    name: 'Sprint 2',
    startDate: '2026-02-17',
    endDate: '2026-02-28',
    status: 'upcoming',
  }

  store.cycles['cycle-other'] = {
    id: 'cycle-other',
    projectId: 'proj-other',
    name: 'Other Cycle',
    startDate: '2026-03-01',
    endDate: '2026-03-14',
    status: 'completed',
  }

  // Add issues for cycle-1
  store.issues['issue-1'] = {
    id: 'issue-1',
    projectId: 'proj-test',
    identifier: 'TP-1',
    title: 'Issue 1',
    description: '',
    status: 'done',
    priority: 'high',
    assigneeId: null,
    labelIds: [],
    estimate: null,
    dueDate: null,
    parentIssueId: null,
    cycleId: 'cycle-1',
    createdAt: '2026-02-03T10:00:00Z',
    updatedAt: '2026-02-05T10:00:00Z',
  }

  store.issues['issue-2'] = {
    id: 'issue-2',
    projectId: 'proj-test',
    identifier: 'TP-2',
    title: 'Issue 2',
    description: '',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: null,
    labelIds: [],
    estimate: null,
    dueDate: null,
    parentIssueId: null,
    cycleId: 'cycle-1',
    createdAt: '2026-02-03T10:00:00Z',
    updatedAt: '2026-02-08T10:00:00Z',
  }

  store.issues['issue-3'] = {
    id: 'issue-3',
    projectId: 'proj-test',
    identifier: 'TP-3',
    title: 'Issue 3',
    description: '',
    status: 'todo',
    priority: 'low',
    assigneeId: null,
    labelIds: [],
    estimate: null,
    dueDate: null,
    parentIssueId: null,
    cycleId: 'cycle-1',
    createdAt: '2026-02-03T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
  }

  // Force a re-render trigger
  useProjectStore.setState({
    projects: { ...store.projects },
    cycles: { ...store.cycles },
    issues: { ...store.issues },
  })
}

beforeEach(() => {
  useProjectStore.setState({
    projects: {},
    cycles: {},
    issues: {},
    members: [],
    selectedProjectId: null,
    selectedIssueId: null,
    focusedIssueIndex: 0,
    createModalOpen: false,
  })
})

describe('CyclePanel', () => {
  it('renders cycle list for the given project', () => {
    seedStore()
    render(<CyclePanel projectId="proj-test" />)

    expect(screen.getByText('Sprint 1')).toBeInTheDocument()
    expect(screen.getByText('Sprint 2')).toBeInTheDocument()
    // Should not show cycle from other project
    expect(screen.queryByText('Other Cycle')).not.toBeInTheDocument()
  })

  it('shows correct status badges', () => {
    seedStore()
    render(<CyclePanel projectId="proj-test" />)

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
  })

  it('shows progress counts', () => {
    seedStore()
    render(<CyclePanel projectId="proj-test" />)

    // cycle-1 has 3 issues, 1 done
    expect(screen.getByText('1/3 done')).toBeInTheDocument()
    // cycle-2 has 0 issues
    expect(screen.getByText('0/0 done')).toBeInTheDocument()
  })

  it('clicking cycle calls onCycleSelect', async () => {
    seedStore()
    const user = userEvent.setup()
    const onCycleSelect = vi.fn()

    render(<CyclePanel projectId="proj-test" onCycleSelect={onCycleSelect} />)

    await user.click(screen.getByText('Sprint 1'))
    expect(onCycleSelect).toHaveBeenCalledWith('cycle-1')
  })

  it('clicking selected cycle deselects it', async () => {
    seedStore()
    const user = userEvent.setup()
    const onCycleSelect = vi.fn()

    render(
      <CyclePanel projectId="proj-test" activeCycleId="cycle-1" onCycleSelect={onCycleSelect} />,
    )

    await user.click(screen.getByText('Sprint 1'))
    expect(onCycleSelect).toHaveBeenCalledWith(null)
  })

  it('shows empty message when no cycles exist', () => {
    render(<CyclePanel projectId="proj-empty" />)

    expect(screen.getByText('No cycles yet')).toBeInTheDocument()
  })

  it('clicking "New Cycle" opens the form', async () => {
    const user = userEvent.setup()
    render(<CyclePanel projectId="proj-test" />)

    await user.click(screen.getByText('+ New Cycle'))

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Start date')).toBeInTheDocument()
    expect(screen.getByLabelText('End date')).toBeInTheDocument()
  })

  it('filling form and submitting creates a cycle', async () => {
    seedStore()
    const user = userEvent.setup()
    render(<CyclePanel projectId="proj-test" />)

    await user.click(screen.getByText('+ New Cycle'))

    await user.type(screen.getByLabelText('Name'), 'Sprint 3')
    await user.type(screen.getByLabelText('Start date'), '2026-03-01')
    await user.type(screen.getByLabelText('End date'), '2026-03-14')

    await user.click(screen.getByRole('button', { name: 'Create' }))

    // The new cycle should now exist in the store
    const cycles = Object.values(useProjectStore.getState().cycles)
    const newCycle = cycles.find((c) => c.name === 'Sprint 3')
    expect(newCycle).toBeDefined()
    expect(newCycle!.projectId).toBe('proj-test')
    expect(newCycle!.startDate).toBe('2026-03-01')
    expect(newCycle!.endDate).toBe('2026-03-14')
  })

  it('cancel button hides the form', async () => {
    const user = userEvent.setup()
    render(<CyclePanel projectId="proj-test" />)

    await user.click(screen.getByText('+ New Cycle'))
    expect(screen.getByLabelText('Name')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
  })

  it('create button is disabled when form is empty', async () => {
    const user = userEvent.setup()
    render(<CyclePanel projectId="proj-test" />)

    await user.click(screen.getByText('+ New Cycle'))

    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  })
})
