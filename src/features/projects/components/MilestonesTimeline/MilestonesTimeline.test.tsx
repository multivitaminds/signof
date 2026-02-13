import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MilestonesTimeline from './MilestonesTimeline'
import { useProjectStore } from '../../stores/useProjectStore'

beforeEach(() => {
  useProjectStore.setState({
    goals: [],
    milestones: [],
    issues: useProjectStore.getState().issues,
  })
})

describe('MilestonesTimeline', () => {
  it('renders with empty state', () => {
    render(<MilestonesTimeline projectId="proj-orchestree" />)
    expect(screen.getByText('Milestones')).toBeInTheDocument()
    expect(screen.getByText('No milestones set. Add key dates for your project.')).toBeInTheDocument()
  })

  it('shows add milestone form on button click', async () => {
    const user = userEvent.setup()
    render(<MilestonesTimeline projectId="proj-orchestree" />)

    await user.click(screen.getByLabelText('Add milestone'))
    expect(screen.getByPlaceholderText('Milestone title')).toBeInTheDocument()
    expect(screen.getByLabelText('Due date')).toBeInTheDocument()
  })

  it('creates a milestone', async () => {
    const user = userEvent.setup()
    render(<MilestonesTimeline projectId="proj-orchestree" />)

    await user.click(screen.getByLabelText('Add milestone'))
    await user.type(screen.getByPlaceholderText('Milestone title'), 'Beta Release')
    await user.type(screen.getByLabelText('Due date'), '2026-06-01')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByText('Beta Release')).toBeInTheDocument()
    const milestones = useProjectStore.getState().milestones
    expect(milestones).toHaveLength(1)
    expect(milestones[0]!.title).toBe('Beta Release')
  })

  it('deletes a milestone', async () => {
    const user = userEvent.setup()
    useProjectStore.getState().createMilestone({
      projectId: 'proj-orchestree',
      title: 'To Remove',
      dueDate: '2026-07-01',
    })

    render(<MilestonesTimeline projectId="proj-orchestree" />)
    expect(screen.getByText('To Remove')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Delete milestone'))
    expect(screen.queryByText('To Remove')).not.toBeInTheDocument()
    expect(useProjectStore.getState().milestones).toHaveLength(0)
  })

  it('toggles collapse', async () => {
    const user = userEvent.setup()
    render(<MilestonesTimeline projectId="proj-orchestree" />)

    expect(screen.getByText('No milestones set. Add key dates for your project.')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Toggle milestones'))
    expect(screen.queryByText('No milestones set. Add key dates for your project.')).not.toBeInTheDocument()
  })

  it('only shows milestones for the given project', () => {
    useProjectStore.getState().createMilestone({
      projectId: 'proj-orchestree',
      title: 'Correct',
      dueDate: '2026-08-01',
    })
    useProjectStore.getState().createMilestone({
      projectId: 'proj-other',
      title: 'Other',
      dueDate: '2026-09-01',
    })

    render(<MilestonesTimeline projectId="proj-orchestree" />)
    expect(screen.getByText('Correct')).toBeInTheDocument()
    expect(screen.queryByText('Other')).not.toBeInTheDocument()
  })

  it('shows milestones sorted by due date', () => {
    useProjectStore.getState().createMilestone({
      projectId: 'proj-orchestree',
      title: 'Later',
      dueDate: '2026-12-01',
    })
    useProjectStore.getState().createMilestone({
      projectId: 'proj-orchestree',
      title: 'Earlier',
      dueDate: '2026-06-01',
    })

    render(<MilestonesTimeline projectId="proj-orchestree" />)

    const names = screen.getAllByText(/Earlier|Later/)
    expect(names[0]!.textContent).toBe('Earlier')
    expect(names[1]!.textContent).toBe('Later')
  })

  it('toggles milestone completion', async () => {
    const user = userEvent.setup()
    useProjectStore.getState().createMilestone({
      projectId: 'proj-orchestree',
      title: 'Toggle Me',
      dueDate: '2026-12-01',
    })

    render(<MilestonesTimeline projectId="proj-orchestree" />)

    const markBtn = screen.getByLabelText('Mark complete')
    await user.click(markBtn)

    const milestones = useProjectStore.getState().milestones
    expect(milestones[0]!.completed).toBe(true)
  })
})
