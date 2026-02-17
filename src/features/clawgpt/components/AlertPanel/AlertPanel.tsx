import { useState, useCallback, useMemo } from 'react'
import { useFleetStore } from '../../stores/useFleetStore'
import type { AlertSeverity } from '../../types'
import './AlertPanel.css'

interface AlertPanelProps {
  maxItems?: number
}

const SEVERITY_OPTIONS: { value: AlertSeverity | 'all'; label: string }[] = [
  { value: 'all' as AlertSeverity | 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
]

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AlertPanel({ maxItems = 50 }: AlertPanelProps) {
  const alerts = useFleetStore((s) => s.alerts)
  const acknowledgeAlert = useFleetStore((s) => s.acknowledgeAlert)
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all')

  const filteredAlerts = useMemo(() => {
    const filtered = severityFilter === 'all'
      ? alerts
      : alerts.filter((a) => a.severity === severityFilter)
    return filtered.slice(0, maxItems)
  }, [alerts, severityFilter, maxItems])

  const handleAcknowledge = useCallback(
    (alertId: string) => {
      acknowledgeAlert(alertId)
    },
    [acknowledgeAlert],
  )

  const handleFilterClick = useCallback((value: AlertSeverity | 'all') => {
    setSeverityFilter(value)
  }, [])

  return (
    <div className="alert-panel" role="region" aria-label="Alerts">
      <div className="alert-panel__header">
        <h2 className="alert-panel__title">Alerts</h2>
        <div className="alert-panel__filters">
          {SEVERITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`alert-panel__filter-btn${severityFilter === opt.value ? ' alert-panel__filter-btn--active' : ''}`}
              onClick={() => handleFilterClick(opt.value)}
              aria-pressed={severityFilter === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="alert-panel__empty">No alerts</div>
      ) : (
        <ul className="alert-panel__list">
          {filteredAlerts.map((alert) => (
            <li
              key={alert.id}
              className={`alert-panel__item${alert.acknowledged ? ' alert-panel__item--acknowledged' : ''}`}
            >
              <span
                className={`alert-panel__severity-badge alert-panel__severity-badge--${alert.severity}`}
              >
                {alert.severity}
              </span>
              <div className="alert-panel__item-body">
                <p className="alert-panel__message">{alert.message}</p>
                <span className="alert-panel__timestamp">
                  {formatTimestamp(alert.timestamp)}
                </span>
              </div>
              {!alert.acknowledged && (
                <button
                  className="alert-panel__ack-btn btn--ghost"
                  onClick={() => handleAcknowledge(alert.id)}
                  aria-label={`Acknowledge alert: ${alert.message}`}
                >
                  Ack
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
