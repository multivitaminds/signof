import { useProjectStore } from './useProjectStore'
import { IssueStatus, IssuePriority, ActivityAction, RelationType } from '../types'

// Helper to get a clean store for each test
function resetStore() {
  const state = useProjectStore.getState()
  useProjectStore.setState({
    activities: [],
    relations: [],
    subTasks: [],
    timeTracking: {},
    savedViews: [],
    selectedIssueIds: new Set<string>(),
    // Keep projects and issues for creating test issues
    projects: state.projects,
    issues: state.issues,
    cycles: state.cycles,
    members: state.members,
  })
}

describe('useProjectStore - Activity Tracking', () => {
  beforeEach(resetStore)

  it('creates an activity when an issue is created', () => {
    const store = useProjectStore.getState()
    // Get first project id
    const projectId = Object.keys(store.projects)[0]!
    const issue = store.createIssue({ projectId, title: 'Test issue' })

    const activities = useProjectStore.getState().activities
    const createActivity = activities.find(
      (a) => a.issueId === issue.id && a.action === ActivityAction.Created
    )
    expect(createActivity).toBeDefined()
  })

  it('tracks status changes with updateIssueWithActivity', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue = store.createIssue({ projectId, title: 'Status test' })

    useProjectStore.getState().updateIssueWithActivity(issue.id, {
      status: IssueStatus.InProgress,
    })

    const activities = useProjectStore.getState().activities
    const statusActivity = activities.find(
      (a) => a.issueId === issue.id && a.action === ActivityAction.StatusChanged
    )
    expect(statusActivity).toBeDefined()
    expect(statusActivity?.oldValue).toBe(IssueStatus.Todo)
    expect(statusActivity?.newValue).toBe(IssueStatus.InProgress)
  })

  it('tracks priority changes', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue = store.createIssue({
      projectId,
      title: 'Priority test',
      priority: IssuePriority.Low,
    })

    useProjectStore.getState().updateIssueWithActivity(issue.id, {
      priority: IssuePriority.High,
    })

    const activities = useProjectStore.getState().activities
    const priorityActivity = activities.find(
      (a) => a.issueId === issue.id && a.action === ActivityAction.PriorityChanged
    )
    expect(priorityActivity).toBeDefined()
    expect(priorityActivity?.oldValue).toBe(IssuePriority.Low)
    expect(priorityActivity?.newValue).toBe(IssuePriority.High)
  })

  it('tracks assignee changes', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue = store.createIssue({ projectId, title: 'Assignee test' })

    useProjectStore.getState().updateIssueWithActivity(issue.id, {
      assigneeId: 'user-1',
    })

    const activities = useProjectStore.getState().activities
    const assigneeActivity = activities.find(
      (a) => a.issueId === issue.id && a.action === ActivityAction.AssigneeChanged
    )
    expect(assigneeActivity).toBeDefined()
    expect(assigneeActivity?.oldValue).toBe('unassigned')
    expect(assigneeActivity?.newValue).toBe('user-1')
  })

  it('tracks due date changes', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue = store.createIssue({ projectId, title: 'Due date test' })

    useProjectStore.getState().updateIssueWithActivity(issue.id, {
      dueDate: '2025-06-15',
    })

    const activities = useProjectStore.getState().activities
    const dueDateActivity = activities.find(
      (a) => a.issueId === issue.id && a.action === ActivityAction.DueDateChanged
    )
    expect(dueDateActivity).toBeDefined()
    expect(dueDateActivity?.newValue).toBe('2025-06-15')
  })

  it('does not create activity when value is unchanged', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue = store.createIssue({
      projectId,
      title: 'No change test',
      status: IssueStatus.Todo,
    })

    const beforeCount = useProjectStore.getState().activities.length
    useProjectStore.getState().updateIssueWithActivity(issue.id, {
      status: IssueStatus.Todo, // Same status
    })
    const afterCount = useProjectStore.getState().activities.length

    expect(afterCount).toBe(beforeCount)
  })

  it('addActivity creates a manual activity entry', () => {
    useProjectStore.getState().addActivity({
      issueId: 'test-issue',
      userId: 'user-1',
      action: ActivityAction.Created,
    })

    const activities = useProjectStore.getState().activities
    const manual = activities.find(
      (a) => a.issueId === 'test-issue' && a.userId === 'user-1'
    )
    expect(manual).toBeDefined()
    expect(manual?.id).toBeDefined()
    expect(manual?.timestamp).toBeDefined()
  })
})

describe('useProjectStore - Relations', () => {
  beforeEach(resetStore)

  it('adds a relation between two issues', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue1 = store.createIssue({ projectId, title: 'Issue 1' })
    const issue2 = useProjectStore.getState().createIssue({ projectId, title: 'Issue 2' })

    useProjectStore.getState().addRelation({
      issueId: issue1.id,
      type: RelationType.Blocks,
      targetIssueId: issue2.id,
    })

    const relations = useProjectStore.getState().relations
    expect(relations).toHaveLength(1)
    expect(relations[0]?.issueId).toBe(issue1.id)
    expect(relations[0]?.targetIssueId).toBe(issue2.id)
    expect(relations[0]?.type).toBe(RelationType.Blocks)
  })

  it('creates an activity when a relation is added', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue1 = store.createIssue({ projectId, title: 'Issue 1' })
    const issue2 = useProjectStore.getState().createIssue({ projectId, title: 'Issue 2' })

    useProjectStore.getState().addRelation({
      issueId: issue1.id,
      type: RelationType.Blocks,
      targetIssueId: issue2.id,
    })

    const activities = useProjectStore.getState().activities
    const relActivity = activities.find(
      (a) => a.issueId === issue1.id && a.action === ActivityAction.RelationAdded
    )
    expect(relActivity).toBeDefined()
  })

  it('removes a relation', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue1 = store.createIssue({ projectId, title: 'Issue 1' })
    const issue2 = useProjectStore.getState().createIssue({ projectId, title: 'Issue 2' })

    useProjectStore.getState().addRelation({
      issueId: issue1.id,
      type: RelationType.Related,
      targetIssueId: issue2.id,
    })

    const relationId = useProjectStore.getState().relations[0]!.id
    useProjectStore.getState().removeRelation(relationId)

    expect(useProjectStore.getState().relations).toHaveLength(0)
  })

  it('creates an activity when a relation is removed', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue1 = store.createIssue({ projectId, title: 'Issue 1' })
    const issue2 = useProjectStore.getState().createIssue({ projectId, title: 'Issue 2' })

    useProjectStore.getState().addRelation({
      issueId: issue1.id,
      type: RelationType.Related,
      targetIssueId: issue2.id,
    })

    const relationId = useProjectStore.getState().relations[0]!.id
    useProjectStore.getState().removeRelation(relationId)

    const activities = useProjectStore.getState().activities
    const removeActivity = activities.find(
      (a) => a.action === ActivityAction.RelationRemoved
    )
    expect(removeActivity).toBeDefined()
  })

  it('getRelationsForIssue returns both source and target relations', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue1 = store.createIssue({ projectId, title: 'Issue 1' })
    const issue2 = useProjectStore.getState().createIssue({ projectId, title: 'Issue 2' })

    useProjectStore.getState().addRelation({
      issueId: issue1.id,
      type: RelationType.Blocks,
      targetIssueId: issue2.id,
    })

    // issue1 is the source
    expect(useProjectStore.getState().getRelationsForIssue(issue1.id)).toHaveLength(1)
    // issue2 is the target
    expect(useProjectStore.getState().getRelationsForIssue(issue2.id)).toHaveLength(1)
  })

  it('deleting an issue removes its relations', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue1 = store.createIssue({ projectId, title: 'Issue 1' })
    const issue2 = useProjectStore.getState().createIssue({ projectId, title: 'Issue 2' })

    useProjectStore.getState().addRelation({
      issueId: issue1.id,
      type: RelationType.Blocks,
      targetIssueId: issue2.id,
    })

    useProjectStore.getState().deleteIssue(issue1.id)
    expect(useProjectStore.getState().relations).toHaveLength(0)
  })
})

describe('useProjectStore - SubTasks', () => {
  beforeEach(resetStore)

  it('adds a sub-task to an issue', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue = store.createIssue({ projectId, title: 'Parent' })

    useProjectStore.getState().addSubTask(issue.id, 'Write tests')

    const subTasks = useProjectStore.getState().subTasks
    expect(subTasks).toHaveLength(1)
    expect(subTasks[0]?.title).toBe('Write tests')
    expect(subTasks[0]?.completed).toBe(false)
    expect(subTasks[0]?.issueId).toBe(issue.id)
  })

  it('creates activity when sub-task is added', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue = store.createIssue({ projectId, title: 'Parent' })

    useProjectStore.getState().addSubTask(issue.id, 'Do thing')

    const activities = useProjectStore.getState().activities
    const addActivity = activities.find(
      (a) => a.issueId === issue.id && a.action === ActivityAction.SubTaskAdded
    )
    expect(addActivity).toBeDefined()
    expect(addActivity?.newValue).toBe('Do thing')
  })

  it('toggles a sub-task completion', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue = store.createIssue({ projectId, title: 'Parent' })

    useProjectStore.getState().addSubTask(issue.id, 'Toggle me')

    const subTaskId = useProjectStore.getState().subTasks[0]!.id
    useProjectStore.getState().toggleSubTask(subTaskId)

    expect(useProjectStore.getState().subTasks[0]?.completed).toBe(true)

    useProjectStore.getState().toggleSubTask(subTaskId)
    expect(useProjectStore.getState().subTasks[0]?.completed).toBe(false)
  })

  it('removes a sub-task', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue = store.createIssue({ projectId, title: 'Parent' })

    useProjectStore.getState().addSubTask(issue.id, 'Remove me')
    const subTaskId = useProjectStore.getState().subTasks[0]!.id
    useProjectStore.getState().removeSubTask(subTaskId)

    expect(useProjectStore.getState().subTasks).toHaveLength(0)
  })

  it('deleting an issue removes its sub-tasks', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue = store.createIssue({ projectId, title: 'Parent' })

    useProjectStore.getState().addSubTask(issue.id, 'Sub 1')
    useProjectStore.getState().addSubTask(issue.id, 'Sub 2')
    expect(useProjectStore.getState().subTasks).toHaveLength(2)

    useProjectStore.getState().deleteIssue(issue.id)
    expect(useProjectStore.getState().subTasks).toHaveLength(0)
  })

  it('getSubTasksForIssue returns only that issue sub-tasks', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue1 = store.createIssue({ projectId, title: 'Issue 1' })
    const issue2 = useProjectStore.getState().createIssue({ projectId, title: 'Issue 2' })

    useProjectStore.getState().addSubTask(issue1.id, 'Sub 1a')
    useProjectStore.getState().addSubTask(issue1.id, 'Sub 1b')
    useProjectStore.getState().addSubTask(issue2.id, 'Sub 2a')

    expect(useProjectStore.getState().getSubTasksForIssue(issue1.id)).toHaveLength(2)
    expect(useProjectStore.getState().getSubTasksForIssue(issue2.id)).toHaveLength(1)
  })
})

describe('useProjectStore - Time Tracking', () => {
  beforeEach(resetStore)

  it('sets time estimate', () => {
    useProjectStore.getState().setTimeEstimate('issue-x', 120)

    const tracking = useProjectStore.getState().getTimeTracking('issue-x')
    expect(tracking.estimateMinutes).toBe(120)
    expect(tracking.loggedMinutes).toBe(0)
  })

  it('logs time', () => {
    useProjectStore.getState().logTime('issue-x', 30)
    useProjectStore.getState().logTime('issue-x', 45)

    const tracking = useProjectStore.getState().getTimeTracking('issue-x')
    expect(tracking.loggedMinutes).toBe(75)
  })

  it('creates activity when estimate is set', () => {
    useProjectStore.getState().setTimeEstimate('issue-x', 60)

    const activities = useProjectStore.getState().activities
    const estimateActivity = activities.find(
      (a) => a.issueId === 'issue-x' && a.action === ActivityAction.EstimateChanged
    )
    expect(estimateActivity).toBeDefined()
    expect(estimateActivity?.newValue).toBe('60')
  })

  it('creates activity when time is logged', () => {
    useProjectStore.getState().logTime('issue-x', 45)

    const activities = useProjectStore.getState().activities
    const logActivity = activities.find(
      (a) => a.issueId === 'issue-x' && a.action === ActivityAction.TimeLogged
    )
    expect(logActivity).toBeDefined()
    expect(logActivity?.newValue).toBe('45')
  })

  it('returns default tracking for unknown issue', () => {
    const tracking = useProjectStore.getState().getTimeTracking('unknown')
    expect(tracking.estimateMinutes).toBeNull()
    expect(tracking.loggedMinutes).toBe(0)
  })
})

describe('useProjectStore - Saved Views', () => {
  beforeEach(resetStore)

  it('saves a view', () => {
    const id = useProjectStore.getState().saveView({
      projectId: 'proj-1',
      name: 'My Bugs',
      filters: { status: [IssueStatus.Todo] },
    })

    expect(id).toBeDefined()
    const views = useProjectStore.getState().savedViews
    expect(views).toHaveLength(1)
    expect(views[0]?.name).toBe('My Bugs')
    expect(views[0]?.filters.status).toEqual([IssueStatus.Todo])
  })

  it('deletes a saved view', () => {
    const id = useProjectStore.getState().saveView({
      projectId: 'proj-1',
      name: 'Delete me',
      filters: {},
    })

    useProjectStore.getState().deleteSavedView(id)
    expect(useProjectStore.getState().savedViews).toHaveLength(0)
  })

  it('gets saved views for a project', () => {
    useProjectStore.getState().saveView({
      projectId: 'proj-1',
      name: 'View 1',
      filters: {},
    })
    useProjectStore.getState().saveView({
      projectId: 'proj-2',
      name: 'View 2',
      filters: {},
    })
    useProjectStore.getState().saveView({
      projectId: 'proj-1',
      name: 'View 3',
      filters: {},
    })

    const views = useProjectStore.getState().getSavedViewsForProject('proj-1')
    expect(views).toHaveLength(2)
  })
})

describe('useProjectStore - Bulk Actions', () => {
  beforeEach(resetStore)

  it('toggles issue selection', () => {
    useProjectStore.getState().toggleIssueSelection('issue-1')
    expect(useProjectStore.getState().selectedIssueIds.has('issue-1')).toBe(true)

    useProjectStore.getState().toggleIssueSelection('issue-1')
    expect(useProjectStore.getState().selectedIssueIds.has('issue-1')).toBe(false)
  })

  it('selects all issues', () => {
    useProjectStore.getState().selectAllIssues(['a', 'b', 'c'])
    const selected = useProjectStore.getState().selectedIssueIds
    expect(selected.size).toBe(3)
    expect(selected.has('a')).toBe(true)
    expect(selected.has('b')).toBe(true)
    expect(selected.has('c')).toBe(true)
  })

  it('clears selection', () => {
    useProjectStore.getState().selectAllIssues(['a', 'b'])
    useProjectStore.getState().clearSelection()
    expect(useProjectStore.getState().selectedIssueIds.size).toBe(0)
  })

  it('bulk updates issues and creates activities', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue1 = store.createIssue({ projectId, title: 'Bulk 1' })
    const issue2 = useProjectStore.getState().createIssue({ projectId, title: 'Bulk 2' })

    useProjectStore.getState().selectAllIssues([issue1.id, issue2.id])
    useProjectStore.getState().bulkUpdateIssues({ status: IssueStatus.Done })

    const state = useProjectStore.getState()
    expect(state.issues[issue1.id]?.status).toBe(IssueStatus.Done)
    expect(state.issues[issue2.id]?.status).toBe(IssueStatus.Done)
    // Selection should be cleared
    expect(state.selectedIssueIds.size).toBe(0)
    // Activities should be generated for status changes
    const statusActivities = state.activities.filter(
      (a) => a.action === ActivityAction.StatusChanged
    )
    expect(statusActivities.length).toBeGreaterThanOrEqual(2)
  })

  it('bulk deletes issues and cleans up relations/subtasks', () => {
    const store = useProjectStore.getState()
    const projectId = Object.keys(store.projects)[0]!
    const issue1 = store.createIssue({ projectId, title: 'Delete 1' })
    const issue2 = useProjectStore.getState().createIssue({ projectId, title: 'Delete 2' })
    const issue3 = useProjectStore.getState().createIssue({ projectId, title: 'Keep' })

    // Add relation from issue1 to issue3
    useProjectStore.getState().addRelation({
      issueId: issue1.id,
      type: RelationType.Related,
      targetIssueId: issue3.id,
    })
    // Add subtask to issue2
    useProjectStore.getState().addSubTask(issue2.id, 'Sub')

    useProjectStore.getState().selectAllIssues([issue1.id, issue2.id])
    useProjectStore.getState().bulkDeleteIssues()

    const state = useProjectStore.getState()
    expect(state.issues[issue1.id]).toBeUndefined()
    expect(state.issues[issue2.id]).toBeUndefined()
    expect(state.issues[issue3.id]).toBeDefined()
    // Relations involving deleted issues should be gone
    expect(state.relations).toHaveLength(0)
    // Subtasks for deleted issues should be gone
    expect(state.subTasks).toHaveLength(0)
    expect(state.selectedIssueIds.size).toBe(0)
  })
})
