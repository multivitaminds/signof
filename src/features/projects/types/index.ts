// ─── Issue Status ────────────────────────────────────────────────────

export const IssueStatus = {
  Backlog: 'backlog',
  Todo: 'todo',
  InProgress: 'in_progress',
  InReview: 'in_review',
  Done: 'done',
  Cancelled: 'cancelled',
} as const

export type IssueStatus = (typeof IssueStatus)[keyof typeof IssueStatus]

// ─── Issue Priority ──────────────────────────────────────────────────

export const IssuePriority = {
  None: 'none',
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Urgent: 'urgent',
} as const

export type IssuePriority = (typeof IssuePriority)[keyof typeof IssuePriority]

// ─── Cycle Status ────────────────────────────────────────────────────

export const CycleStatus = {
  Upcoming: 'upcoming',
  Active: 'active',
  Completed: 'completed',
} as const

export type CycleStatus = (typeof CycleStatus)[keyof typeof CycleStatus]

// ─── View Type ───────────────────────────────────────────────────────

export const ViewType = {
  Board: 'board',
  List: 'list',
} as const

export type ViewType = (typeof ViewType)[keyof typeof ViewType]

// ─── Core Interfaces ────────────────────────────────────────────────

export interface Label {
  id: string
  name: string
  color: string
}

export interface Member {
  id: string
  name: string
  email: string
  avatarUrl: string
}

export interface Issue {
  id: string
  projectId: string
  identifier: string
  title: string
  description: string
  status: IssueStatus
  priority: IssuePriority
  assigneeId: string | null
  labelIds: string[]
  estimate: number | null
  dueDate: string | null
  parentIssueId: string | null
  cycleId: string | null
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  prefix: string
  color: string
  memberIds: string[]
  labels: Label[]
  nextIssueNumber: number
  currentView: ViewType
  createdAt: string
  updatedAt: string
}

export interface Cycle {
  id: string
  projectId: string
  name: string
  startDate: string
  endDate: string
  status: CycleStatus
}

// ─── Config Maps ────────────────────────────────────────────────────

export interface StatusConfig {
  label: string
  color: string
  icon: string
}

export const STATUS_CONFIG: Record<IssueStatus, StatusConfig> = {
  [IssueStatus.Backlog]: { label: 'Backlog', color: '#94A3B8', icon: 'circle-dashed' },
  [IssueStatus.Todo]: { label: 'Todo', color: '#64748B', icon: 'circle' },
  [IssueStatus.InProgress]: { label: 'In Progress', color: '#F59E0B', icon: 'loader' },
  [IssueStatus.InReview]: { label: 'In Review', color: '#8B5CF6', icon: 'eye' },
  [IssueStatus.Done]: { label: 'Done', color: '#22C55E', icon: 'check-circle' },
  [IssueStatus.Cancelled]: { label: 'Cancelled', color: '#EF4444', icon: 'x-circle' },
}

export interface PriorityConfig {
  label: string
  color: string
  icon: string
}

export const PRIORITY_CONFIG: Record<IssuePriority, PriorityConfig> = {
  [IssuePriority.None]: { label: 'No priority', color: '#94A3B8', icon: 'minus' },
  [IssuePriority.Low]: { label: 'Low', color: '#3B82F6', icon: 'arrow-down' },
  [IssuePriority.Medium]: { label: 'Medium', color: '#F59E0B', icon: 'arrow-up' },
  [IssuePriority.High]: { label: 'High', color: '#F97316', icon: 'arrow-up' },
  [IssuePriority.Urgent]: { label: 'Urgent', color: '#EF4444', icon: 'alert-triangle' },
}

/** Ordered statuses for board columns (excludes cancelled) */
export const BOARD_STATUSES: IssueStatus[] = [
  IssueStatus.Backlog,
  IssueStatus.Todo,
  IssueStatus.InProgress,
  IssueStatus.InReview,
  IssueStatus.Done,
]

/** Priority sort order (highest first) */
export const PRIORITY_ORDER: IssuePriority[] = [
  IssuePriority.Urgent,
  IssuePriority.High,
  IssuePriority.Medium,
  IssuePriority.Low,
  IssuePriority.None,
]

/** Status sort order */
export const STATUS_ORDER: IssueStatus[] = [
  IssueStatus.Backlog,
  IssueStatus.Todo,
  IssueStatus.InProgress,
  IssueStatus.InReview,
  IssueStatus.Done,
  IssueStatus.Cancelled,
]

// ─── Goal Status ────────────────────────────────────────────────────

export const GoalStatus = {
  NotStarted: 'not_started',
  InProgress: 'in_progress',
  Achieved: 'achieved',
  AtRisk: 'at_risk',
  Cancelled: 'cancelled',
} as const

export type GoalStatus = (typeof GoalStatus)[keyof typeof GoalStatus]

// ─── Goal & Milestone Interfaces ────────────────────────────────────

export interface Goal {
  id: string
  projectId: string
  title: string
  description: string
  targetDate: string | null
  status: GoalStatus
  progress: number
  issueIds: string[]
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  projectId: string
  title: string
  dueDate: string
  completed: boolean
  issueIds: string[]
  createdAt: string
}

// ─── Goal Status Config ─────────────────────────────────────────────

export interface GoalStatusConfig {
  label: string
  color: string
}

export const GOAL_STATUS_CONFIG: Record<GoalStatus, GoalStatusConfig> = {
  [GoalStatus.NotStarted]: { label: 'Not Started', color: '#94A3B8' },
  [GoalStatus.InProgress]: { label: 'In Progress', color: '#F59E0B' },
  [GoalStatus.Achieved]: { label: 'Achieved', color: '#22C55E' },
  [GoalStatus.AtRisk]: { label: 'At Risk', color: '#EF4444' },
  [GoalStatus.Cancelled]: { label: 'Cancelled', color: '#64748B' },
}

// ─── Filter/Sort Types ──────────────────────────────────────────────

export interface IssueFilters {
  status?: IssueStatus[]
  priority?: IssuePriority[]
  assigneeId?: string[]
  labelIds?: string[]
  search?: string
}

export type IssueSortField = 'created' | 'updated' | 'priority' | 'status' | 'title'

export interface IssueSort {
  field: IssueSortField
  direction: 'asc' | 'desc'
}

export type GroupByOption = 'none' | 'status' | 'priority' | 'assignee'
