export const TimeRange = {
  Week: '7d',
  Month: '30d',
  Quarter: '90d',
  All: 'all',
} as const
export type TimeRange = (typeof TimeRange)[keyof typeof TimeRange]

export const MetricType = {
  DocumentsSigned: 'documents_signed',
  IssuesCompleted: 'issues_completed',
  BookingsCreated: 'bookings_created',
  AgentTasksDone: 'agent_tasks_done',
  PagesCreated: 'pages_created',
  RevenueTracked: 'revenue_tracked',
} as const
export type MetricType = (typeof MetricType)[keyof typeof MetricType]

export interface MetricDataPoint {
  date: string
  value: number
}

export interface MetricSummary {
  type: MetricType
  current: number
  previous: number
  trend: 'up' | 'down' | 'flat'
  data: MetricDataPoint[]
}
