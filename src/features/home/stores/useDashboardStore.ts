import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const WidgetType = {
  QuickStats: 'quick_stats',
  RecentDocuments: 'recent_documents',
  ActiveProjects: 'active_projects',
  UpcomingEvents: 'upcoming_events',
  RecentActivity: 'recent_activity',
  AgentStatus: 'agent_status',
  TasksToday: 'tasks_today',
  InboxPreview: 'inbox_preview',
} as const

export type WidgetType = (typeof WidgetType)[keyof typeof WidgetType]

export interface DashboardWidget {
  id: string
  type: WidgetType
  visible: boolean
  order: number
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'w-quick-stats', type: WidgetType.QuickStats, visible: true, order: 0 },
  { id: 'w-recent-docs', type: WidgetType.RecentDocuments, visible: true, order: 1 },
  { id: 'w-active-projects', type: WidgetType.ActiveProjects, visible: true, order: 2 },
  { id: 'w-upcoming-events', type: WidgetType.UpcomingEvents, visible: true, order: 3 },
  { id: 'w-recent-activity', type: WidgetType.RecentActivity, visible: true, order: 4 },
  { id: 'w-agent-status', type: WidgetType.AgentStatus, visible: true, order: 5 },
  { id: 'w-tasks-today', type: WidgetType.TasksToday, visible: true, order: 6 },
  { id: 'w-inbox-preview', type: WidgetType.InboxPreview, visible: true, order: 7 },
]

interface DashboardState {
  widgets: DashboardWidget[]
  toggleWidget: (id: string) => void
  reorderWidgets: (fromIndex: number, toIndex: number) => void
  resetLayout: () => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,

      toggleWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, visible: !w.visible } : w
          ),
        })),

      reorderWidgets: (fromIndex, toIndex) =>
        set((state) => {
          const widgets = [...state.widgets]
          const [moved] = widgets.splice(fromIndex, 1)
          if (!moved) return state
          widgets.splice(toIndex, 0, moved)
          return {
            widgets: widgets.map((w, i) => ({ ...w, order: i })),
          }
        }),

      resetLayout: () => set({ widgets: DEFAULT_WIDGETS }),
    }),
    { name: 'origina-dashboard-storage' }
  )
)
