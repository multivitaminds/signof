import { useProjectStore } from './useProjectStore'
import { GoalStatus } from '../types'

// Reset store before each test
beforeEach(() => {
  useProjectStore.setState({
    goals: [],
    milestones: [],
  })
})

describe('Goal CRUD', () => {
  it('creates a goal', () => {
    const { createGoal } = useProjectStore.getState()
    const id = createGoal({
      projectId: 'proj-signof',
      title: 'Ship MVP',
      description: 'Launch first version',
      targetDate: '2026-03-01',
    })

    const goals = useProjectStore.getState().goals
    expect(goals).toHaveLength(1)
    expect(goals[0]!.id).toBe(id)
    expect(goals[0]!.title).toBe('Ship MVP')
    expect(goals[0]!.description).toBe('Launch first version')
    expect(goals[0]!.targetDate).toBe('2026-03-01')
    expect(goals[0]!.status).toBe(GoalStatus.NotStarted)
    expect(goals[0]!.progress).toBe(0)
    expect(goals[0]!.issueIds).toEqual([])
    expect(goals[0]!.projectId).toBe('proj-signof')
  })

  it('creates a goal with defaults', () => {
    const { createGoal } = useProjectStore.getState()
    createGoal({
      projectId: 'proj-signof',
      title: 'Simple Goal',
    })

    const goals = useProjectStore.getState().goals
    expect(goals).toHaveLength(1)
    expect(goals[0]!.description).toBe('')
    expect(goals[0]!.targetDate).toBeNull()
  })

  it('updates a goal', () => {
    const { createGoal, updateGoal } = useProjectStore.getState()
    const id = createGoal({ projectId: 'proj-signof', title: 'Old Title' })

    updateGoal(id, { title: 'New Title', status: GoalStatus.InProgress })

    const goals = useProjectStore.getState().goals
    expect(goals[0]!.title).toBe('New Title')
    expect(goals[0]!.status).toBe(GoalStatus.InProgress)
  })

  it('deletes a goal', () => {
    const { createGoal, deleteGoal } = useProjectStore.getState()
    const id = createGoal({ projectId: 'proj-signof', title: 'To Delete' })

    expect(useProjectStore.getState().goals).toHaveLength(1)
    deleteGoal(id)
    expect(useProjectStore.getState().goals).toHaveLength(0)
  })

  it('links an issue to a goal', () => {
    const { createGoal, linkIssueToGoal } = useProjectStore.getState()
    const goalId = createGoal({ projectId: 'proj-signof', title: 'Goal' })

    linkIssueToGoal(goalId, 'issue-so-1')

    const goals = useProjectStore.getState().goals
    expect(goals[0]!.issueIds).toEqual(['issue-so-1'])
  })

  it('does not duplicate linked issues', () => {
    const { createGoal, linkIssueToGoal } = useProjectStore.getState()
    const goalId = createGoal({ projectId: 'proj-signof', title: 'Goal' })

    linkIssueToGoal(goalId, 'issue-so-1')
    linkIssueToGoal(goalId, 'issue-so-1')

    const goals = useProjectStore.getState().goals
    expect(goals[0]!.issueIds).toEqual(['issue-so-1'])
  })

  it('unlinks an issue from a goal', () => {
    const { createGoal, linkIssueToGoal, unlinkIssueFromGoal } = useProjectStore.getState()
    const goalId = createGoal({ projectId: 'proj-signof', title: 'Goal' })

    linkIssueToGoal(goalId, 'issue-so-1')
    linkIssueToGoal(goalId, 'issue-so-2')
    unlinkIssueFromGoal(goalId, 'issue-so-1')

    const goals = useProjectStore.getState().goals
    expect(goals[0]!.issueIds).toEqual(['issue-so-2'])
  })
})

describe('Milestone CRUD', () => {
  it('creates a milestone', () => {
    const { createMilestone } = useProjectStore.getState()
    const id = createMilestone({
      projectId: 'proj-signof',
      title: 'Beta Release',
      dueDate: '2026-03-15',
    })

    const milestones = useProjectStore.getState().milestones
    expect(milestones).toHaveLength(1)
    expect(milestones[0]!.id).toBe(id)
    expect(milestones[0]!.title).toBe('Beta Release')
    expect(milestones[0]!.dueDate).toBe('2026-03-15')
    expect(milestones[0]!.completed).toBe(false)
    expect(milestones[0]!.issueIds).toEqual([])
  })

  it('updates a milestone', () => {
    const { createMilestone, updateMilestone } = useProjectStore.getState()
    const id = createMilestone({
      projectId: 'proj-signof',
      title: 'Beta',
      dueDate: '2026-03-15',
    })

    updateMilestone(id, { completed: true })

    const milestones = useProjectStore.getState().milestones
    expect(milestones[0]!.completed).toBe(true)
  })

  it('deletes a milestone', () => {
    const { createMilestone, deleteMilestone } = useProjectStore.getState()
    const id = createMilestone({
      projectId: 'proj-signof',
      title: 'To Remove',
      dueDate: '2026-04-01',
    })

    expect(useProjectStore.getState().milestones).toHaveLength(1)
    deleteMilestone(id)
    expect(useProjectStore.getState().milestones).toHaveLength(0)
  })

  it('links and unlinks issues to milestone', () => {
    const { createMilestone, linkIssueToMilestone, unlinkIssueFromMilestone } = useProjectStore.getState()
    const milestoneId = createMilestone({
      projectId: 'proj-signof',
      title: 'Milestone',
      dueDate: '2026-05-01',
    })

    linkIssueToMilestone(milestoneId, 'issue-so-1')
    linkIssueToMilestone(milestoneId, 'issue-so-2')

    let milestones = useProjectStore.getState().milestones
    expect(milestones[0]!.issueIds).toEqual(['issue-so-1', 'issue-so-2'])

    unlinkIssueFromMilestone(milestoneId, 'issue-so-1')
    milestones = useProjectStore.getState().milestones
    expect(milestones[0]!.issueIds).toEqual(['issue-so-2'])
  })

  it('does not duplicate linked issues', () => {
    const { createMilestone, linkIssueToMilestone } = useProjectStore.getState()
    const milestoneId = createMilestone({
      projectId: 'proj-signof',
      title: 'Milestone',
      dueDate: '2026-05-01',
    })

    linkIssueToMilestone(milestoneId, 'issue-so-1')
    linkIssueToMilestone(milestoneId, 'issue-so-1')

    const milestones = useProjectStore.getState().milestones
    expect(milestones[0]!.issueIds).toEqual(['issue-so-1'])
  })
})
