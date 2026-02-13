import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GoalsPanel from './GoalsPanel'
import { useProjectStore } from '../../stores/useProjectStore'

beforeEach(() => {
  useProjectStore.setState({
    goals: [],
    milestones: [],
    issues: useProjectStore.getState().issues,
  })
})

describe('GoalsPanel', () => {
  it('renders with empty state', () => {
    render(<GoalsPanel projectId="proj-orchestree" />)
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('No goals yet. Create one to track progress.')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument() // count badge
  })

  it('shows add goal form on button click', async () => {
    const user = userEvent.setup()
    render(<GoalsPanel projectId="proj-orchestree" />)

    await user.click(screen.getByLabelText('Add goal'))
    expect(screen.getByPlaceholderText('Goal title')).toBeInTheDocument()
  })

  it('creates a goal', async () => {
    const user = userEvent.setup()
    render(<GoalsPanel projectId="proj-orchestree" />)

    await user.click(screen.getByLabelText('Add goal'))
    await user.type(screen.getByPlaceholderText('Goal title'), 'Ship V1')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByText('Ship V1')).toBeInTheDocument()
    const goals = useProjectStore.getState().goals
    expect(goals).toHaveLength(1)
    expect(goals[0]!.title).toBe('Ship V1')
  })

  it('shows progress bar at 0% for goal with no issues', async () => {
    const user = userEvent.setup()
    render(<GoalsPanel projectId="proj-orchestree" />)

    await user.click(screen.getByLabelText('Add goal'))
    await user.type(screen.getByPlaceholderText('Goal title'), 'Test Goal')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByText('0% complete')).toBeInTheDocument()
  })

  it('deletes a goal', async () => {
    const user = userEvent.setup()
    // Pre-populate a goal
    useProjectStore.getState().createGoal({
      projectId: 'proj-orchestree',
      title: 'To Delete',
    })

    render(<GoalsPanel projectId="proj-orchestree" />)
    expect(screen.getByText('To Delete')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Delete goal'))

    expect(screen.queryByText('To Delete')).not.toBeInTheDocument()
    expect(useProjectStore.getState().goals).toHaveLength(0)
  })

  it('toggles collapse', async () => {
    const user = userEvent.setup()
    render(<GoalsPanel projectId="proj-orchestree" />)

    // Should be expanded by default
    expect(screen.getByText('No goals yet. Create one to track progress.')).toBeInTheDocument()

    // Collapse
    await user.click(screen.getByLabelText('Toggle goals'))

    // Empty message should be hidden
    expect(screen.queryByText('No goals yet. Create one to track progress.')).not.toBeInTheDocument()
  })

  it('only shows goals for the given project', () => {
    useProjectStore.getState().createGoal({
      projectId: 'proj-orchestree',
      title: 'Correct Project Goal',
    })
    useProjectStore.getState().createGoal({
      projectId: 'proj-other',
      title: 'Other Project Goal',
    })

    render(<GoalsPanel projectId="proj-orchestree" />)

    expect(screen.getByText('Correct Project Goal')).toBeInTheDocument()
    expect(screen.queryByText('Other Project Goal')).not.toBeInTheDocument()
  })

  it('opens edit form and saves changes', async () => {
    const user = userEvent.setup()
    useProjectStore.getState().createGoal({
      projectId: 'proj-orchestree',
      title: 'Original Title',
    })

    render(<GoalsPanel projectId="proj-orchestree" />)

    await user.click(screen.getByLabelText('Edit goal'))
    const titleInput = screen.getByDisplayValue('Original Title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Title')
    await user.click(screen.getByLabelText('Save'))

    expect(screen.getByText('Updated Title')).toBeInTheDocument()
    expect(useProjectStore.getState().goals[0]!.title).toBe('Updated Title')
  })
})
