import { useMemo, useCallback, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { useDashboardStore, WidgetType } from '../../stores/useDashboardStore'
import QuickStatsWidget from '../widgets/QuickStatsWidget'
import RecentDocumentsWidget from '../widgets/RecentDocumentsWidget'
import ActiveProjectsWidget from '../widgets/ActiveProjectsWidget'
import UpcomingEventsWidget from '../widgets/UpcomingEventsWidget'
import RecentActivityWidget from '../widgets/RecentActivityWidget'
import AgentStatusWidget from '../widgets/AgentStatusWidget'
import TasksTodayWidget from '../widgets/TasksTodayWidget'
import InboxPreviewWidget from '../widgets/InboxPreviewWidget'
import WidgetTogglePanel from '../WidgetTogglePanel/WidgetTogglePanel'
import './DashboardGrid.css'

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  [WidgetType.QuickStats]: QuickStatsWidget,
  [WidgetType.RecentDocuments]: RecentDocumentsWidget,
  [WidgetType.ActiveProjects]: ActiveProjectsWidget,
  [WidgetType.UpcomingEvents]: UpcomingEventsWidget,
  [WidgetType.RecentActivity]: RecentActivityWidget,
  [WidgetType.AgentStatus]: AgentStatusWidget,
  [WidgetType.TasksToday]: TasksTodayWidget,
  [WidgetType.InboxPreview]: InboxPreviewWidget,
}

export default function DashboardGrid() {
  const widgets = useDashboardStore((s) => s.widgets)
  const [showPanel, setShowPanel] = useState(false)

  const visibleWidgets = useMemo(
    () =>
      [...widgets]
        .filter((w) => w.visible)
        .sort((a, b) => a.order - b.order),
    [widgets]
  )

  const handleTogglePanel = useCallback(() => {
    setShowPanel((prev) => !prev)
  }, [])

  const handleClosePanel = useCallback(() => {
    setShowPanel(false)
  }, [])

  return (
    <div className="dashboard-grid">
      <div className="dashboard-grid__header">
        <h2 className="dashboard-grid__title">Dashboard</h2>
        <button
          type="button"
          className="btn--ghost dashboard-grid__customize-btn"
          onClick={handleTogglePanel}
          aria-label="Customize dashboard"
        >
          <Settings2 size={16} />
          Customize
        </button>
      </div>

      {showPanel && <WidgetTogglePanel onClose={handleClosePanel} />}

      <div className="dashboard-grid__grid">
        {visibleWidgets.map((widget) => {
          const Component = WIDGET_COMPONENTS[widget.type]
          if (!Component) return null
          const isFullWidth = widget.type === WidgetType.QuickStats
          return (
            <div
              key={widget.id}
              className={`dashboard-grid__cell ${isFullWidth ? 'dashboard-grid__cell--full' : ''}`}
              data-testid={`widget-${widget.type}`}
            >
              <Component />
            </div>
          )
        })}
      </div>

      {visibleWidgets.length === 0 && (
        <div className="dashboard-grid__empty">
          <p>No widgets visible. Click Customize to add some.</p>
        </div>
      )}
    </div>
  )
}
