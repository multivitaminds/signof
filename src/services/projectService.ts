import { api } from '../lib/api'
import { useProjectStore } from '../features/projects/stores/useProjectStore'
import type { Issue, Project, Cycle, Goal, Milestone } from '../features/projects/types'
import type { IssueStatus, IssuePriority } from '../features/projects/types'

function isApiEnabled(): boolean {
  return Boolean(import.meta.env.VITE_API_URL)
}

export const projectService = {
  // ─── Project CRUD ──────────────────────────────────────────────────

  async listProjects(): Promise<Project[]> {
    if (!isApiEnabled()) {
      return Object.values(useProjectStore.getState().projects)
    }
    const res = await api.get<Project[]>('/projects')
    return res.data
  },

  async createProject(data: {
    name: string
    description: string
    prefix: string
    color: string
  }): Promise<string> {
    if (!isApiEnabled()) {
      return useProjectStore.getState().createProject(data)
    }
    const res = await api.post<{ id: string }>('/projects', data)
    return res.data.id
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().updateProject(id, updates)
      return
    }
    await api.put(`/projects/${id}`, updates)
  },

  async deleteProject(id: string): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().deleteProject(id)
      return
    }
    await api.del(`/projects/${id}`)
  },

  // ─── Issue CRUD ────────────────────────────────────────────────────

  async listIssues(projectId: string): Promise<Issue[]> {
    if (!isApiEnabled()) {
      const issues = useProjectStore.getState().issues
      return Object.values(issues).filter((i) => i.projectId === projectId)
    }
    const res = await api.get<Issue[]>(`/projects/${projectId}/issues`)
    return res.data
  },

  async createIssue(data: {
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
  }): Promise<Issue> {
    if (!isApiEnabled()) {
      return useProjectStore.getState().createIssue(data)
    }
    const res = await api.post<Issue>(`/projects/${data.projectId}/issues`, data)
    return res.data
  },

  async updateIssue(id: string, updates: Partial<Issue>): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().updateIssue(id, updates)
      return
    }
    await api.put(`/issues/${id}`, updates)
  },

  async deleteIssue(id: string): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().deleteIssue(id)
      return
    }
    await api.del(`/issues/${id}`)
  },

  // ─── Cycle CRUD ────────────────────────────────────────────────────

  async listCycles(projectId: string): Promise<Cycle[]> {
    if (!isApiEnabled()) {
      const cycles = useProjectStore.getState().cycles
      return Object.values(cycles).filter((c) => c.projectId === projectId)
    }
    const res = await api.get<Cycle[]>(`/projects/${projectId}/cycles`)
    return res.data
  },

  async createCycle(data: {
    projectId: string
    name: string
    startDate: string
    endDate: string
  }): Promise<string> {
    if (!isApiEnabled()) {
      return useProjectStore.getState().createCycle(data)
    }
    const res = await api.post<{ id: string }>(`/projects/${data.projectId}/cycles`, data)
    return res.data.id
  },

  async updateCycle(id: string, updates: Partial<Cycle>): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().updateCycle(id, updates)
      return
    }
    await api.put(`/cycles/${id}`, updates)
  },

  async deleteCycle(id: string): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().deleteCycle(id)
      return
    }
    await api.del(`/cycles/${id}`)
  },

  // ─── Goal CRUD ─────────────────────────────────────────────────────

  async createGoal(data: {
    projectId: string
    title: string
    description?: string
    targetDate?: string | null
  }): Promise<string> {
    if (!isApiEnabled()) {
      return useProjectStore.getState().createGoal(data)
    }
    const res = await api.post<{ id: string }>(`/projects/${data.projectId}/goals`, data)
    return res.data.id
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().updateGoal(id, updates)
      return
    }
    await api.put(`/goals/${id}`, updates)
  },

  async deleteGoal(id: string): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().deleteGoal(id)
      return
    }
    await api.del(`/goals/${id}`)
  },

  async linkIssueToGoal(goalId: string, issueId: string): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().linkIssueToGoal(goalId, issueId)
      return
    }
    await api.post(`/goals/${goalId}/issues/${issueId}`)
  },

  async unlinkIssueFromGoal(goalId: string, issueId: string): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().unlinkIssueFromGoal(goalId, issueId)
      return
    }
    await api.del(`/goals/${goalId}/issues/${issueId}`)
  },

  // ─── Milestone CRUD ────────────────────────────────────────────────

  async createMilestone(data: {
    projectId: string
    title: string
    dueDate: string
  }): Promise<string> {
    if (!isApiEnabled()) {
      return useProjectStore.getState().createMilestone(data)
    }
    const res = await api.post<{ id: string }>(`/projects/${data.projectId}/milestones`, data)
    return res.data.id
  },

  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().updateMilestone(id, updates)
      return
    }
    await api.put(`/milestones/${id}`, updates)
  },

  async deleteMilestone(id: string): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().deleteMilestone(id)
      return
    }
    await api.del(`/milestones/${id}`)
  },

  async linkIssueToMilestone(milestoneId: string, issueId: string): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().linkIssueToMilestone(milestoneId, issueId)
      return
    }
    await api.post(`/milestones/${milestoneId}/issues/${issueId}`)
  },

  async unlinkIssueFromMilestone(milestoneId: string, issueId: string): Promise<void> {
    if (!isApiEnabled()) {
      useProjectStore.getState().unlinkIssueFromMilestone(milestoneId, issueId)
      return
    }
    await api.del(`/milestones/${milestoneId}/issues/${issueId}`)
  },
}
