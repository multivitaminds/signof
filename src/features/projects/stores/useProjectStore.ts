import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, Issue, Cycle, Member } from '../types'
import { IssueStatus, IssuePriority, ViewType } from '../types'
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

  // UI state
  selectedProjectId: string | null
  selectedIssueId: string | null
  focusedIssueIndex: number
  createModalOpen: boolean

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

  // Cycle CRUD
  createCycle: (data: {
    projectId: string
    name: string
    startDate: string
    endDate: string
  }) => string
  updateCycle: (id: string, updates: Partial<Cycle>) => void
  deleteCycle: (id: string) => void

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

      // UI state
      selectedProjectId: null,
      selectedIssueId: null,
      focusedIssueIndex: 0,
      createModalOpen: false,

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

      deleteIssue: (id) => {
        set((state) => {
          const { [id]: _removed, ...rest } = state.issues
          return { issues: rest }
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
      }),
    }
  )
)
