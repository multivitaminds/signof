import { create } from 'zustand'
import { useProjectStore } from './useProjectStore'

// ─── ID Generator ────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Types ──────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: string
}

// ─── Response Generator ─────────────────────────────────────────────

function generateResponse(userMessage: string, context?: string): string {
  const msg = userMessage.toLowerCase()
  const ps = useProjectStore.getState()
  const projects = Object.values(ps.projects)
  const issues = Object.values(ps.issues)

  if (msg.includes('sprint') || msg.includes('cycle')) {
    const cycles = Object.values(ps.cycles)
    const activeCycle = cycles.find((c) => c.status === 'active')
    if (activeCycle) {
      const cycleIssues = issues.filter((i) => i.cycleId === activeCycle.id)
      const done = cycleIssues.filter((i) => i.status === 'done').length
      const total = cycleIssues.length
      const pct = total > 0 ? Math.round((done / total) * 100) : 0
      return `Active sprint: "${activeCycle.name}"\n- ${done}/${total} issues completed (${pct}%)\n- ${cycleIssues.filter((i) => i.status === 'in_progress').length} in progress\n- ${cycleIssues.filter((i) => i.status === 'todo').length} to do\n\nTips for a healthy sprint:\n- Keep WIP (work in progress) under 3 items per person\n- Address blockers daily\n- Scope creep? Move new items to the backlog`
    }
    return 'No active sprint found. Create a new cycle in your project to start sprint planning. Group related issues into a time-boxed cycle (typically 1-2 weeks) for focused delivery.'
  }

  if (msg.includes('bug') || msg.includes('defect')) {
    const openIssues = issues.filter((i) => i.status !== 'done' && i.status !== 'cancelled')
    const criticalIssues = openIssues.filter((i) => i.priority === 'urgent' || i.priority === 'high')
    return `Open issues: ${openIssues.length} total.\n${criticalIssues.length > 0 ? `⚠ ${criticalIssues.length} high/urgent priority issue(s) need attention.` : 'No critical issues — looking good!'}\n\nBug triage best practices:\n- Label bugs with a "Bug" label for easy filtering\n- Classify severity: critical > major > minor > trivial\n- Assign a responsible owner within 24 hours\n- Include reproduction steps in the description\n- Link related issues with "blocks" or "related to" relations`
  }

  if (msg.includes('priority') || msg.includes('prioriti')) {
    const urgent = issues.filter((i) => i.priority === 'urgent' && i.status !== 'done').length
    const high = issues.filter((i) => i.priority === 'high' && i.status !== 'done').length
    const medium = issues.filter((i) => i.priority === 'medium' && i.status !== 'done').length
    const low = issues.filter((i) => i.priority === 'low' && i.status !== 'done').length
    return `Open issues by priority:\n- 🔴 Urgent: ${urgent}\n- 🟠 High: ${high}\n- 🟡 Medium: ${medium}\n- 🟢 Low: ${low}\n\nPrioritization tips:\n- Urgent = blocking others or customer-facing\n- High = important for current sprint goal\n- Medium = planned for near future\n- Low = nice-to-have, do when capacity allows`
  }

  if (msg.includes('milestone') || msg.includes('goal') || msg.includes('okr')) {
    const goals = ps.goals
    const milestones = ps.milestones
    const completedGoals = goals.filter((g) => g.progress >= 100).length
    const completedMilestones = milestones.filter((m) => m.completed).length
    return `Goals & Milestones:\n- ${goals.length} goal(s), ${completedGoals} completed\n- ${milestones.length} milestone(s), ${completedMilestones} completed\n\nGoal-setting tips:\n- Use OKRs: Objectives (what) + Key Results (measurable how)\n- Review goals weekly\n- Milestones should mark meaningful delivery points\n- Link issues to goals to track contribution`
  }

  if (msg.includes('assign') || msg.includes('team') || msg.includes('member') || msg.includes('workload')) {
    const members = ps.members
    const assignmentCounts = members.map((m) => ({
      name: m.name,
      open: issues.filter((i) => i.assigneeId === m.id && i.status !== 'done').length,
    }))
    const busiest = assignmentCounts.sort((a, b) => b.open - a.open)[0]
    const idle = assignmentCounts.filter((m) => m.open === 0)
    return `Team workload (${members.length} members):\n${assignmentCounts.map((m) => `- ${m.name}: ${m.open} open issue(s)`).join('\n')}\n\n${busiest && busiest.open > 5 ? `⚠ ${busiest.name} has ${busiest.open} open issues — consider rebalancing.` : 'Workload looks balanced.'}\n${idle.length > 0 ? `${idle.length} member(s) with no assignments — available for new work.` : ''}`
  }

  if (msg.includes('backlog') || msg.includes('unassigned')) {
    const backlog = issues.filter((i) => i.status === 'backlog' || (!i.cycleId && i.status === 'todo'))
    const unassigned = issues.filter((i) => !i.assigneeId && i.status !== 'done')
    return `Backlog health:\n- ${backlog.length} issue(s) in backlog\n- ${unassigned.length} unassigned issue(s)\n\nBacklog grooming tips:\n- Review and prioritize backlog weekly\n- Remove stale issues older than 90 days\n- Break down large items into smaller actionable tasks\n- Assign owners to high-priority backlog items`
  }

  if (msg.includes('deadline') || msg.includes('overdue') || msg.includes('due')) {
    const now = new Date()
    const overdue = issues.filter((i) => i.dueDate && new Date(i.dueDate) < now && i.status !== 'done')
    const upcoming = issues.filter((i) => {
      if (!i.dueDate || i.status === 'done') return false
      const due = new Date(i.dueDate)
      const daysLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      return daysLeft >= 0 && daysLeft <= 7
    })
    return `Deadline tracker:\n- 🔴 ${overdue.length} overdue issue(s)${overdue.length > 0 ? `: ${overdue.slice(0, 3).map((i) => `"${i.title}"`).join(', ')}` : ''}\n- 🟡 ${upcoming.length} issue(s) due within 7 days\n\nTips:\n- Address overdue items first — rescope or reassign\n- Set realistic deadlines based on team velocity\n- Use milestones for group deadlines`
  }

  if (context) {
    const project = ps.projects[context]
    if (project) {
      const projectIssues = issues.filter((i) => i.projectId === context)
      const done = projectIssues.filter((i) => i.status === 'done').length
      return `Project "${project.name}": ${projectIssues.length} issue(s), ${done} done, ${projectIssues.length - done} remaining. ${project.description || ''}`
    }
  }

  const openIssues = issues.filter((i) => i.status !== 'done' && i.status !== 'cancelled').length
  return `I'm your Projects Copilot — here to help you ship faster. You have ${projects.length} project(s) with ${openIssues} open issue(s).\n\nI can help with:\n- Sprint health and progress tracking\n- Bug triage and priority management\n- Team workload distribution\n- Goal and milestone tracking\n- Backlog grooming and deadline management\n\nWhat would you like to know?`
}

// ─── Store Interface ────────────────────────────────────────────────

interface ProjectCopilotState {
  isOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void

  messages: CopilotMessage[]
  isTyping: boolean
  sendMessage: (content: string, context?: string) => void
  clearMessages: () => void

  isAnalyzing: boolean
  lastAnalysis: {
    type: 'sprint' | 'backlog' | 'goals'
    summary: string
    items: string[]
    timestamp: string
  } | null
  analyzeSprintHealth: () => void
  reviewBacklog: () => void
  trackGoals: () => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useProjectCopilotStore = create<ProjectCopilotState>()(
  (set) => ({
    isOpen: false,
    messages: [],
    isTyping: false,
    isAnalyzing: false,
    lastAnalysis: null,

    openPanel: () => set({ isOpen: true }),
    closePanel: () => set({ isOpen: false }),
    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

    sendMessage: (content, context) => {
      const userMessage: CopilotMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        context,
      }

      set((state) => ({
        messages: [...state.messages, userMessage],
        isTyping: true,
      }))

      const delay = 500 + Math.random() * 1000
      setTimeout(() => {
        const responseContent = generateResponse(content, context)
        const assistantMessage: CopilotMessage = {
          id: generateId(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString(),
        }

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isTyping: false,
        }))
      }, delay)
    },

    clearMessages: () => set({ messages: [], isTyping: false }),

    analyzeSprintHealth: () => {
      set({ isAnalyzing: true })
      setTimeout(() => {
        const ps = useProjectStore.getState()
        const cycles = Object.values(ps.cycles)
        const issues = Object.values(ps.issues)
        const items: string[] = []

        const activeCycle = cycles.find((c) => c.status === 'active')
        if (activeCycle) {
          const cycleIssues = issues.filter((i) => i.cycleId === activeCycle.id)
          const done = cycleIssues.filter((i) => i.status === 'done').length
          const inProgress = cycleIssues.filter((i) => i.status === 'in_progress').length
          const inReview = cycleIssues.filter((i) => i.status === 'in_review').length
          items.push(`Sprint "${activeCycle.name}": ${done}/${cycleIssues.length} completed`)
          if (inProgress > 0) items.push(`${inProgress} issue(s) in progress`)
          if (inReview > 0) items.push(`${inReview} issue(s) in review`)
          if (inProgress > 5) items.push('⚠ High WIP count — consider finishing before starting new work')
        } else {
          items.push('No active sprint — consider starting one')
        }

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'sprint',
            summary: activeCycle ? `Sprint health check for "${activeCycle.name}".` : 'No active sprint found.',
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 800)
    },

    reviewBacklog: () => {
      set({ isAnalyzing: true })
      setTimeout(() => {
        const ps = useProjectStore.getState()
        const issues = Object.values(ps.issues)
        const items: string[] = []

        const backlog = issues.filter((i) => i.status === 'backlog' || (!i.cycleId && i.status === 'todo'))
        const unassigned = issues.filter((i) => !i.assigneeId && i.status !== 'done')
        const noPriority = issues.filter((i) => !i.priority || i.priority === 'none')

        items.push(`${backlog.length} issue(s) in backlog`)
        if (unassigned.length > 0) items.push(`${unassigned.length} unassigned issue(s)`)
        if (noPriority.length > 0) items.push(`${noPriority.length} issue(s) without priority`)

        const now = new Date()
        const overdue = issues.filter((i) => i.dueDate && new Date(i.dueDate) < now && i.status !== 'done')
        if (overdue.length > 0) items.push(`🔴 ${overdue.length} overdue issue(s)`)

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'backlog',
            summary: `Backlog review: ${items.length} insight(s) found.`,
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 700)
    },

    trackGoals: () => {
      set({ isAnalyzing: true })
      setTimeout(() => {
        const ps = useProjectStore.getState()
        const items: string[] = []

        const goals = ps.goals
        if (goals.length > 0) {
          const avgProgress = Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
          items.push(`${goals.length} goal(s) at ${avgProgress}% average progress`)
          const atRisk = goals.filter((g) => g.progress < 30)
          if (atRisk.length > 0) items.push(`⚠ ${atRisk.length} goal(s) below 30% — may need attention`)
        } else {
          items.push('No goals defined — set OKRs to align team efforts')
        }

        const milestones = ps.milestones
        if (milestones.length > 0) {
          const completed = milestones.filter((m) => m.completed).length
          items.push(`${completed}/${milestones.length} milestone(s) completed`)
        }

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'goals',
            summary: `Goal tracking: ${goals.length} goal(s), ${ps.milestones.length} milestone(s).`,
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 600)
    },
  })
)
