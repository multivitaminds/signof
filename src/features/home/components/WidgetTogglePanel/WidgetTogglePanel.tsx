import { useCallback } from 'react'
import { RotateCcw, X } from 'lucide-react'
import { useDashboardStore, WidgetType } from '../../stores/useDashboardStore'
import './WidgetTogglePanel.css'

const WIDGET_LABELS: Record<string, string> = {
  [WidgetType.QuickStats]: 'Quick Stats',
  [WidgetType.RecentDocuments]: 'Recent Documents',
  [WidgetType.ActiveProjects]: 'Active Projects',
  [WidgetType.UpcomingEvents]: 'Upcoming Events',
  [WidgetType.RecentActivity]: 'Recent Activity',
  [WidgetType.AgentStatus]: 'Agent Status',
  [WidgetType.TasksToday]: 'Tasks Today',
  [WidgetType.InboxPreview]: 'Inbox Preview',
}

interface WidgetTogglePanelProps {
  onClose: () => void
}

export default function WidgetTogglePanel({ onClose }: WidgetTogglePanelProps) {
  const widgets = useDashboardStore((s) => s.widgets)
  const toggleWidget = useDashboardStore((s) => s.toggleWidget)
  const resetLayout = useDashboardStore((s) => s.resetLayout)

  const handleReset = useCallback(() => {
    resetLayout()
  }, [resetLayout])

  return (
    <div className="widget-toggle-panel" role="region" aria-label="Widget settings">
      <div className="widget-toggle-panel__header">
        <h3 className="widget-toggle-panel__title">Customize Widgets</h3>
        <button
          type="button"
          className="btn--ghost widget-toggle-panel__close"
          onClick={onClose}
          aria-label="Close customize panel"
        >
          <X size={16} />
        </button>
      </div>
      <ul className="widget-toggle-panel__list">
        {widgets.map((widget) => (
          <li key={widget.id} className="widget-toggle-panel__item">
            <label className="widget-toggle-panel__label">
              <input
                type="checkbox"
                checked={widget.visible}
                onChange={() => toggleWidget(widget.id)}
                className="widget-toggle-panel__checkbox"
              />
              <span className="widget-toggle-panel__switch" />
              <span className="widget-toggle-panel__text">
                {WIDGET_LABELS[widget.type] ?? widget.type}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn--ghost widget-toggle-panel__reset"
        onClick={handleReset}
      >
        <RotateCcw size={14} />
        Reset to default
      </button>
    </div>
  )
}
