import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Project, Issue, Cycle, Member, Goal, Milestone,
  IssueActivity, IssueRelation, SubTask, TimeTracking, SavedView,
  IssueFilters, RelationType,
} from '../types'
import { IssueStatus, IssuePriority, ViewType, GoalStatus, ActivityAction } from '../types'
import { generateIdentifier } from '../lib/issueIdentifier'
import {
  createSampleProjects,
  createSampleIssues,
  createSampleCycles,
  createSampleMembers,
} from '../lib/sampleData'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now(): string {
  return new Date().toISOString()
}

interface ProjectState {
  // Data
  projects: Record<string, Project>
  issues: Record<string, Issue>
  cycles: Record<string, Cycle>
  members: Member[]
  goals: Goal[]
  milestones: Milestone[]
  activities: IssueActivity[]
  relations: IssueRelation[]
  subTasks: SubTask[]
  timeTracking: Record<string, TimeTracking>
  savedViews: SavedView[]

  // UI state
  selectedProjectId: string | null
  selectedIssueId: string | null
  focusedIssueIndex: number
  createModalOpen: boolean
  selectedIssueIds: Set<string>

  // Project CRUD
  createProject: (data: {
    name: string
    description: string
    prefix: string
    color: string
  }) => string
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Issue CRUD
  createIssue: (data: {
    projectId: string
    title: string
    description?: string
    status?: IssueStatus
    priority?: IssuePriority
    assigneeId?: string | null
    labelIds?: string[]
    estimate?: number | null
    dueDate?: string | null
    parentIssueId?: string | null
    cycleId?: string | null
  }) => Issue
  updateIssue: (id: string, updates: Partial<Issue>) => void
  deleteIssue: (id: string) => void

  // Issue with activity tracking
  updateIssueWithActivity: (id: string, updates: Partial<Issue>, userId?: string) => void

  // Activity CRUD
  addActivity: (activity: Omit<IssueActivity, 'id' | 'timestamp'>) => void
  getActivitiesForIssue: (issueId: string) => IssueActivity[]

  // Relation CRUD
  addRelation: (data: { issueId: string; type: RelationType; targetIssueId: string }) => void
  removeRelation: (relationId: string) => void
  getRelationsForIssue: (issueId: string) => IssueRelation[]

  // SubTask CRUD
  addSubTask: (issueId: string, title: string) => void
  toggleSubTask: (subTaskId: string) => void
  removeSubTask: (subTaskId: string) => void
  getSubTasksForIssue: (issueId: string) => SubTask[]

  // Time Tracking
  setTimeEstimate: (issueId: string, minutes: number | null) => void
  logTime: (issueId: string, minutes: number) => void
  getTimeTracking: (issueId: string) => TimeTracking

  // Saved Views
  saveView: (data: { projectId: string; name: string; filters: IssueFilters }) => string
  deleteSavedView: (viewId: string) => void
  getSavedViewsForProject: (projectId: string) => SavedView[]

  // Bulk Actions
  toggleIssueSelection: (issueId: string) => void
  selectAllIssues: (issueIds: string[]) => void
  clearSelection: () => void
  bulkUpdateIssues: (updates: Partial<Issue>) => void
  bulkDeleteIssues: () => void

  // Cycle CRUD
  createCycle: (data: {
    projectId: string
    name: string
    startDate: string
    endDate: string
  }) => string
  updateCycle: (id: string, updates: Partial<Cycle>) => void
  deleteCycle: (id: string) => void

  // Goal CRUD
  createGoal: (data: {
    projectId: string
    title: string
    description?: string
    targetDate?: string | null
  }) => string
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  linkIssueToGoal: (goalId: string, issueId: string) => void
  unlinkIssueFromGoal: (goalId: string, issueId: string) => void

  // Milestone CRUD
  createMilestone: (data: {
    projectId: string
    title: string
    dueDate: string
  }) => string
  updateMilestone: (id: string, updates: Partial<Milestone>) => void
  deleteMilestone: (id: string) => void
  linkIssueToMilestone: (milestoneId: string, issueId: string) => void
  unlinkIssueFromMilestone: (milestoneId: string, issueId: string) => void

  // UI actions
  setSelectedProject: (id: string | null) => void
  setSelectedIssue: (id: string | null) => void
  setFocusedIndex: (index: number) => void
  toggleCreateModal: () => void
  setProjectView: (projectId: string, view: ViewType) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Data (initialized with sample data)
      projects: createSampleProjects(),
      issues: createSampleIssues(),
      cycles: createSampleCycles(),
      members: createSampleMembers(),
      goals: [],
      milestones: [],
      activities: [],
      relations: [],
      subTasks: [],
      timeTracking: {},
      savedViews: [],

      // UI state
      selectedProjectId: null,
      selectedIssueId: null,
      focusedIssueIndex: 0,
      createModalOpen: false,
      selectedIssueIds: new Set<string>(),

      // Project CRUD
      createProject: (data) => {
        const id = generateId()
        const project: Project = {
          id,
          name: data.name,
          description: data.description,
          prefix: data.prefix,
          color: data.color,
          memberIds: [],
          labels: [],
          nextIssueNumber: 1,
          currentView: ViewType.Board,
          createdAt: now(),
          updatedAt: now(),
        }
        set((state) => ({
          projects: { ...state.projects, [id]: project },
        }))
        return id
      },

      updateProject: (id, updates) => {
        set((state) => {
          const project = state.projects[id]
          if (!project) return state
          return {
            projects: {
              ...state.projects,
              [id]: { ...project, ...updates, updatedAt: now() },
            },
          }
        })
      },

      deleteProject: (id) => {
        set((state) => {
          const { [id]: _removed, ...rest } = state.projects
          // Also remove issues and cycles for this project
          const issues: Record<string, Issue> = {}
          for (const [issueId, issue] of Object.entries(state.issues)) {
            if (issue.projectId !== id) {
              issues[issueId] = issue
            }
          }
          const cycles: Record<string, Cycle> = {}
          for (const [cycleId, cycle] of Object.entries(state.cycles)) {
            if (cycle.projectId !== id) {
              cycles[cycleId] = cycle
            }
          }
          return { projects: rest, issues, cycles }
        })
      },

      // Issue CRUD
      createIssue: (data) => {
        const state = get()
        const project = state.projects[data.projectId]
        if (!project) {
          throw new Error(`Project ${data.projectId} not found`)
        }

        const id = generateId()
        const identifier = generateIdentifier(project.prefix, project.nextIssueNumber)

        const issue: Issue = {
          id,
          projectId: data.projectId,
          identifier,
          title: data.title,
          description: data.description ?? '',
          status: data.status ?? IssueStatus.Todo,
          priority: data.priority ?? IssuePriority.None,
          assigneeId: data.assigneeId ?? null,
          labelIds: data.labelIds ?? [],
          estimate: data.estimate ?? null,
          dueDate: data.dueDate ?? null,
          parentIssueId: data.parentIssueId ?? null,
          cycleId: data.cycleId ?? null,
          createdAt: now(),
          updatedAt: now(),
        }

        const activity: IssueActivity = {
          id: generateId(),
          issueId: id,
          userId: null,
          action: ActivityAction.Created,
          timestamp: now(),
        }

        set((state) => ({
          issues: { ...state.issues, [id]: issue },
          projects: {
            ...state.projects,
            [data.projectId]: {
              ...state.projects[data.projectId]!,
              nextIssueNumber: state.projects[data.projectId]!.nextIssueNumber + 1,
              updatedAt: now(),
            },
          },
          activities: [...state.activities, activity],
        }))

        return issue
      },

      updateIssue: (id, updates) => {
        set((state) => {
          const issue = state.issues[id]
          if (!issue) return state
          return {
            issues: {
              ...state.issues,
              [id]: { ...issue, ...updates, updatedAt: now() },
            },
          }
        })
      },

      updateIssueWithActivity: (id, updates, userId) => {
        const state = get()
        const issue = state.issues[id]
        if (!issue) return

        const newActivities: IssueActivity[] = []

        if (updates.status !== undefined && updates.status !== issue.status) {
          newActivities.push({
            id: generateId(),
            issueId: id,
            userId: userId ?? null,
            action: ActivityAction.StatusChanged,
            field: 'status',
            oldValue: issue.status,
            newValue: updates.status,
            timestamp: now(),
          })
        }
        if (updates.priority !== undefined && updates.priority !== issue.priority) {
          newActivities.push({
            id: generateId(),
            issueId: id,
            userId: userId ?? null,
            action: ActivityAction.PriorityChanged,
            field: 'priority',
            oldValue: issue.priority,
            newValue: updates.priority,
            timestamp: now(),
          })
        }
        if (updates.assigneeId !== undefined && updates.assigneeId !== issue.assigneeId) {
          newActivities.push({
            id: generateId(),
            issueId: id,
            userId: userId ?? null,
            action: ActivityAction.AssigneeChanged,
            field: 'assignee',
            oldValue: issue.assigneeId ?? 'unassigned',
            newValue: updates.assigneeId ?? 'unassigned',
            timestamp: now(),
          })
        }
        if (updates.labelIds !== undefined) {
          const oldLabels = [...issue.labelIds].sort().join(',')
          const newLabels = [...updates.labelIds].sort().join(',')
          if (oldLabels !== newLabels) {
            newActivities.push({
              id: generateId(),
              issueId: id,
              userId: userId ?? null,
              action: ActivityAction.LabelsChanged,
              field: 'labels',
              oldValue: oldLabels,
              newValue: newLabels,
              timestamp: now(),
            })
          }
        }
        if (updates.dueDate !== undefined && updates.dueDate !== issue.dueDate) {
          newActivities.push({
            id: generateId(),
            issueId: id,
            userId: userId ?? null,
            action: ActivityAction.DueDateChanged,
            field: 'dueDate',
            oldValue: issue.dueDate ?? 'none',
            newValue: updates.dueDate ?? 'none',
            timestamp: now(),
          })
        }

        set((state) => ({
          issues: {
            ...state.issues,
            [id]: { ...state.issues[id]!, ...updates, updatedAt: now() },
          },
          activities: [...state.activities, ...newActivities],
        }))
      },

      deleteIssue: (id) => {
        set((state) => {
          const { [id]: _removed, ...rest } = state.issues
          return {
            issues: rest,
            relations: state.relations.filter(
              (r) => r.issueId !== id && r.targetIssueId !== id
            ),
            subTasks: state.subTasks.filter((st) => st.issueId !== id),
          }
        })
      },

      // Activity CRUD
      addActivity: (data) => {
        const activity: IssueActivity = {
          ...data,
          id: generateId(),
          timestamp: now(),
        }
        set((state) => ({
          activities: [...state.activities, activity],
        }))
      },

      getActivitiesForIssue: (issueId) => {
        return get().activities.filter((a) => a.issueId === issueId)
      },

      // Relation CRUD
      addRelation: (data) => {
        const relation: IssueRelation = {
          id: generateId(),
          issueId: data.issueId,
          type: data.type,
          targetIssueId: data.targetIssueId,
          createdAt: now(),
        }
        const activity: IssueActivity = {
          id: generateId(),
          issueId: data.issueId,
          userId: null,
          action: ActivityAction.RelationAdded,
          field: 'relation',
          newValue: `${data.type}:${data.targetIssueId}`,
          timestamp: now(),
        }
        set((state) => ({
          relations: [...state.relations, relation],
          activities: [...state.activities, activity],
        }))
      },

      removeRelation: (relationId) => {
        set((state) => {
          const rel = state.relations.find((r) => r.id === relationId)
          const newActivities = rel
            ? [
                ...state.activities,
                {
                  id: generateId(),
                  issueId: rel.issueId,
                  userId: null,
                  action: ActivityAction.RelationRemoved as ActivityAction,
                  field: 'relation',
                  oldValue: `${rel.type}:${rel.targetIssueId}`,
                  timestamp: now(),
                },
              ]
            : state.activities
          return {
            relations: state.relations.filter((r) => r.id !== relationId),
            activities: newActivities,
          }
        })
      },

      getRelationsForIssue: (issueId) => {
        return get().relations.filter(
          (r) => r.issueId === issueId || r.targetIssueId === issueId
        )
      },

      // SubTask CRUD
      addSubTask: (issueId, title) => {
        const subTask: SubTask = {
          id: generateId(),
          issueId,
          title,
          completed: false,
          createdAt: now(),
        }
        const activity: IssueActivity = {
          id: generateId(),
          issueId,
          userId: null,
          action: ActivityAction.SubTaskAdded,
          newValue: title,
          timestamp: now(),
        }
        set((state) => ({
          subTasks: [...state.subTasks, subTask],
          activities: [...state.activities, activity],
        }))
      },

      toggleSubTask: (subTaskId) => {
        set((state) => {
          const st = state.subTasks.find((s) => s.id === subTaskId)
          if (!st) return state
          const activity: IssueActivity = {
            id: generateId(),
            issueId: st.issueId,
            userId: null,
            action: ActivityAction.SubTaskToggled,
            field: st.title,
            oldValue: st.completed ? 'completed' : 'incomplete',
            newValue: st.completed ? 'incomplete' : 'completed',
            timestamp: now(),
          }
          return {
            subTasks: state.subTasks.map((s) =>
              s.id === subTaskId ? { ...s, completed: !s.completed } : s
            ),
            activities: [...state.activities, activity],
          }
        })
      },

      removeSubTask: (subTaskId) => {
        set((state) => {
          const st = state.subTasks.find((s) => s.id === subTaskId)
          if (!st) return state
          return {
            subTasks: state.subTasks.filter((s) => s.id !== subTaskId),
            activities: [
              ...state.activities,
              {
                id: generateId(),
                issueId: st.issueId,
                userId: null,
                action: ActivityAction.SubTaskRemoved as ActivityAction,
                oldValue: st.title,
                timestamp: now(),
              },
            ],
          }
        })
      },

      getSubTasksForIssue: (issueId) => {
        return get().subTasks.filter((st) => st.issueId === issueId)
      },

      // Time Tracking
      setTimeEstimate: (issueId, minutes) => {
        set((state) => {
          const existing = state.timeTracking[issueId] ?? { estimateMinutes: null, loggedMinutes: 0 }
          return {
            timeTracking: {
              ...state.timeTracking,
              [issueId]: { ...existing, estimateMinutes: minutes },
            },
            activities: [
              ...state.activities,
              {
                id: generateId(),
                issueId,
                userId: null,
                action: ActivityAction.EstimateChanged as ActivityAction,
                field: 'estimate',
                newValue: minutes !== null ? String(minutes) : 'none',
                timestamp: now(),
              },
            ],
          }
        })
      },

      logTime: (issueId, minutes) => {
        set((state) => {
          const existing = state.timeTracking[issueId] ?? { estimateMinutes: null, loggedMinutes: 0 }
          return {
            timeTracking: {
              ...state.timeTracking,
              [issueId]: { ...existing, loggedMinutes: existing.loggedMinutes + minutes },
            },
            activities: [
              ...state.activities,
              {
                id: generateId(),
                issueId,
                userId: null,
                action: ActivityAction.TimeLogged as ActivityAction,
                field: 'time',
                newValue: String(minutes),
                timestamp: now(),
              },
            ],
          }
        })
      },

      getTimeTracking: (issueId) => {
        return get().timeTracking[issueId] ?? { estimateMinutes: null, loggedMinutes: 0 }
      },

      // Saved Views
      saveView: (data) => {
        const id = generateId()
        const view: SavedView = {
          id,
          projectId: data.projectId,
          name: data.name,
          filters: data.filters,
          createdAt: now(),
        }
        set((state) => ({
          savedViews: [...state.savedViews, view],
        }))
        return id
      },

      deleteSavedView: (viewId) => {
        set((state) => ({
          savedViews: state.savedViews.filter((v) => v.id !== viewId),
        }))
      },

      getSavedViewsForProject: (projectId) => {
        return get().savedViews.filter((v) => v.projectId === projectId)
      },

      // Bulk Actions
      toggleIssueSelection: (issueId) => {
        set((state) => {
          const next = new Set(state.selectedIssueIds)
          if (next.has(issueId)) {
            next.delete(issueId)
          } else {
            next.add(issueId)
          }
          return { selectedIssueIds: next }
        })
      },

      selectAllIssues: (issueIds) => {
        set({ selectedIssueIds: new Set(issueIds) })
      },

      clearSelection: () => {
        set({ selectedIssueIds: new Set<string>() })
      },

      bulkUpdateIssues: (updates) => {
        set((state) => {
          const newIssues = { ...state.issues }
          const newActivities = [...state.activities]
          for (const issueId of state.selectedIssueIds) {
            const issue = newIssues[issueId]
            if (!issue) continue

            if (updates.status !== undefined && updates.status !== issue.status) {
              newActivities.push({
                id: generateId(),
                issueId,
                userId: null,
                action: ActivityAction.StatusChanged,
                field: 'status',
                oldValue: issue.status,
                newValue: updates.status,
                timestamp: now(),
              })
            }
            if (updates.priority !== undefined && updates.priority !== issue.priority) {
              newActivities.push({
                id: generateId(),
                issueId,
                userId: null,
                action: ActivityAction.PriorityChanged,
                field: 'priority',
                oldValue: issue.priority,
                newValue: updates.priority,
                timestamp: now(),
              })
            }

            newIssues[issueId] = { ...issue, ...updates, updatedAt: now() }
          }
          return { issues: newIssues, activities: newActivities, selectedIssueIds: new Set<string>() }
        })
      },

      bulkDeleteIssues: () => {
        set((state) => {
          const newIssues = { ...state.issues }
          for (const issueId of state.selectedIssueIds) {
            delete newIssues[issueId]
          }
          return {
            issues: newIssues,
            selectedIssueIds: new Set<string>(),
            relations: state.relations.filter(
              (r) => !state.selectedIssueIds.has(r.issueId) && !state.selectedIssueIds.has(r.targetIssueId)
            ),
            subTasks: state.subTasks.filter(
              (st) => !state.selectedIssueIds.has(st.issueId)
            ),
          }
        })
      },

      // Cycle CRUD
      createCycle: (data) => {
        const id = generateId()
        const cycle: Cycle = {
          id,
          projectId: data.projectId,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'upcoming',
        }
        set((state) => ({
          cycles: { ...state.cycles, [id]: cycle },
        }))
        return id
      },

      updateCycle: (id, updates) => {
        set((state) => {
          const cycle = state.cycles[id]
          if (!cycle) return state
          return {
            cycles: {
              ...state.cycles,
              [id]: { ...cycle, ...updates },
            },
          }
        })
      },

      deleteCycle: (id) => {
        set((state) => {
          const { [id]: _removed, ...rest } = state.cycles
          // Unassign issues from this cycle
          const issues: Record<string, Issue> = {}
          for (const [issueId, issue] of Object.entries(state.issues)) {
            if (issue.cycleId === id) {
              issues[issueId] = { ...issue, cycleId: null }
            } else {
              issues[issueId] = issue
            }
          }
          return { cycles: rest, issues }
        })
      },

      // Goal CRUD
      createGoal: (data) => {
        const id = generateId()
        const goal: Goal = {
          id,
          projectId: data.projectId,
          title: data.title,
          description: data.description ?? '',
          targetDate: data.targetDate ?? null,
          status: GoalStatus.NotStarted,
          progress: 0,
          issueIds: [],
          createdAt: now(),
          updatedAt: now(),
        }
        set((state) => ({
          goals: [...state.goals, goal],
        }))
        return id
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: now() } : g
          ),
        }))
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }))
      },

      linkIssueToGoal: (goalId, issueId) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId && !g.issueIds.includes(issueId)
              ? { ...g, issueIds: [...g.issueIds, issueId], updatedAt: now() }
              : g
          ),
        }))
      },

      unlinkIssueFromGoal: (goalId, issueId) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? { ...g, issueIds: g.issueIds.filter((iid) => iid !== issueId), updatedAt: now() }
              : g
          ),
        }))
      },

      // Milestone CRUD
      createMilestone: (data) => {
        const id = generateId()
        const milestone: Milestone = {
          id,
          projectId: data.projectId,
          title: data.title,
          dueDate: data.dueDate,
          completed: false,
          issueIds: [],
          createdAt: now(),
        }
        set((state) => ({
          milestones: [...state.milestones, milestone],
        }))
        return id
      },

      updateMilestone: (id, updates) => {
        set((state) => ({
          milestones: state.milestones.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }))
      },

      deleteMilestone: (id) => {
        set((state) => ({
          milestones: state.milestones.filter((m) => m.id !== id),
        }))
      },

      linkIssueToMilestone: (milestoneId, issueId) => {
        set((state) => ({
          milestones: state.milestones.map((m) =>
            m.id === milestoneId && !m.issueIds.includes(issueId)
              ? { ...m, issueIds: [...m.issueIds, issueId] }
              : m
          ),
        }))
      },

      unlinkIssueFromMilestone: (milestoneId, issueId) => {
        set((state) => ({
          milestones: state.milestones.map((m) =>
            m.id === milestoneId
              ? { ...m, issueIds: m.issueIds.filter((iid) => iid !== issueId) }
              : m
          ),
        }))
      },

      // UI actions
      setSelectedProject: (id) => set({ selectedProjectId: id }),
      setSelectedIssue: (id) => set({ selectedIssueId: id }),
      setFocusedIndex: (index) => set({ focusedIssueIndex: index }),
      toggleCreateModal: () =>
        set((state) => ({ createModalOpen: !state.createModalOpen })),

      setProjectView: (projectId, view) => {
        set((state) => {
          const project = state.projects[projectId]
          if (!project) return state
          return {
            projects: {
              ...state.projects,
              [projectId]: { ...project, currentView: view },
            },
          }
        })
      },
    }),
    {
      name: 'signof-projects-storage',
      partialize: (state) => ({
        projects: state.projects,
        issues: state.issues,
        cycles: state.cycles,
        members: state.members,
        goals: state.goals,
        milestones: state.milestones,
        activities: state.activities,
        relations: state.relations,
        subTasks: state.subTasks,
        timeTracking: state.timeTracking,
        savedViews: state.savedViews,
      }),
    }
  )
)
