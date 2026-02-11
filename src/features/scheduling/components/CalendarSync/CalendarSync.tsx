import { useCallback } from 'react'
import { RefreshCw, Link2, Unlink } from 'lucide-react'
import { useSchedulingStore } from '../../stores/useSchedulingStore'
import type { CalendarConnection, SyncDirection } from '../../types'
import {
  SyncDirection as SyncDirectionEnum,
  CALENDAR_PROVIDER_LABELS,
  SYNC_DIRECTION_LABELS,
  CalendarProvider,
} from '../../types'
import './CalendarSync.css'

function getProviderIcon(provider: string): string {
  switch (provider) {
    case CalendarProvider.Google:
      return 'G'
    case CalendarProvider.Outlook:
      return 'O'
    case CalendarProvider.Apple:
      return 'A'
    default:
      return '?'
  }
}

function getProviderColor(provider: string): string {
  switch (provider) {
    case CalendarProvider.Google:
      return '#4285F4'
    case CalendarProvider.Outlook:
      return '#0078D4'
    case CalendarProvider.Apple:
      return '#333333'
    default:
      return '#6B7280'
  }
}

function formatLastSynced(iso: string | null): string {
  if (!iso) return 'Never synced'
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export default function CalendarSync() {
  const calendarConnections = useSchedulingStore((s) => s.calendarConnections)
  const connectCalendar = useSchedulingStore((s) => s.connectCalendar)
  const disconnectCalendar = useSchedulingStore((s) => s.disconnectCalendar)
  const updateCalendarSync = useSchedulingStore((s) => s.updateCalendarSync)
  const syncCalendar = useSchedulingStore((s) => s.syncCalendar)

  const handleConnect = useCallback(
    (id: string) => {
      connectCalendar(id)
    },
    [connectCalendar]
  )

  const handleDisconnect = useCallback(
    (id: string) => {
      disconnectCalendar(id)
    },
    [disconnectCalendar]
  )

  const handleSyncDirectionChange = useCallback(
    (id: string, direction: SyncDirection) => {
      updateCalendarSync(id, { syncDirection: direction })
    },
    [updateCalendarSync]
  )

  const handleConflictToggle = useCallback(
    (conn: CalendarConnection) => {
      updateCalendarSync(conn.id, { checkConflicts: !conn.checkConflicts })
    },
    [updateCalendarSync]
  )

  const handleSync = useCallback(
    (id: string) => {
      syncCalendar(id)
    },
    [syncCalendar]
  )

  return (
    <div className="calendar-sync">
      <div className="calendar-sync__header">
        <h2 className="calendar-sync__title">Connected Calendars</h2>
        <p className="calendar-sync__description">
          Sync your calendars to check for conflicts and block busy times automatically.
        </p>
      </div>

      <div className="calendar-sync__list">
        {calendarConnections.map((conn) => (
          <div
            key={conn.id}
            className={`calendar-sync__item ${conn.connected ? 'calendar-sync__item--connected' : ''}`}
          >
            <div className="calendar-sync__item-header">
              <div
                className="calendar-sync__item-icon"
                style={{ backgroundColor: getProviderColor(conn.provider) }}
                aria-hidden="true"
              >
                {getProviderIcon(conn.provider)}
              </div>

              <div className="calendar-sync__item-info">
                <span className="calendar-sync__item-name">
                  {CALENDAR_PROVIDER_LABELS[conn.provider]}
                </span>
                <span className="calendar-sync__item-email">{conn.email}</span>
              </div>

              <div className="calendar-sync__item-status">
                {conn.connected ? (
                  <span className="calendar-sync__badge calendar-sync__badge--connected">
                    Connected
                  </span>
                ) : (
                  <span className="calendar-sync__badge calendar-sync__badge--disconnected">
                    Not connected
                  </span>
                )}
              </div>

              <div className="calendar-sync__item-actions">
                {conn.connected ? (
                  <>
                    <button
                      className="calendar-sync__sync-btn"
                      onClick={() => handleSync(conn.id)}
                      title="Sync now"
                      aria-label={`Sync ${CALENDAR_PROVIDER_LABELS[conn.provider]}`}
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      className="calendar-sync__disconnect-btn"
                      onClick={() => handleDisconnect(conn.id)}
                      aria-label={`Disconnect ${CALENDAR_PROVIDER_LABELS[conn.provider]}`}
                    >
                      <Unlink size={14} />
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-primary calendar-sync__connect-btn"
                    onClick={() => handleConnect(conn.id)}
                    aria-label={`Connect ${CALENDAR_PROVIDER_LABELS[conn.provider]}`}
                  >
                    <Link2 size={14} />
                    Connect
                  </button>
                )}
              </div>
            </div>

            {conn.connected && (
              <div className="calendar-sync__item-settings">
                <div className="calendar-sync__setting">
                  <label
                    className="calendar-sync__setting-label"
                    htmlFor={`sync-dir-${conn.id}`}
                  >
                    Sync direction
                  </label>
                  <select
                    id={`sync-dir-${conn.id}`}
                    className="calendar-sync__setting-select"
                    value={conn.syncDirection}
                    onChange={(e) =>
                      handleSyncDirectionChange(
                        conn.id,
                        e.target.value as SyncDirection
                      )
                    }
                  >
                    {(Object.keys(SYNC_DIRECTION_LABELS) as SyncDirection[]).map(
                      (dir) => (
                        <option key={dir} value={dir}>
                          {SYNC_DIRECTION_LABELS[dir]}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="calendar-sync__setting">
                  <label className="calendar-sync__setting-label">
                    Check for conflicts
                  </label>
                  <button
                    className={`calendar-sync__toggle ${conn.checkConflicts ? 'calendar-sync__toggle--on' : ''}`}
                    role="switch"
                    aria-checked={conn.checkConflicts}
                    aria-label="Check for conflicts"
                    onClick={() => handleConflictToggle(conn)}
                  >
                    <span className="calendar-sync__toggle-thumb" />
                  </button>
                </div>

                <div className="calendar-sync__setting">
                  <span className="calendar-sync__setting-label">Last synced</span>
                  <span className="calendar-sync__last-synced">
                    {formatLastSynced(conn.lastSyncedAt)}
                  </span>
                </div>

                {conn.syncDirection === SyncDirectionEnum.TwoWay && (
                  <p className="calendar-sync__setting-hint">
                    New bookings will automatically appear in your{' '}
                    {CALENDAR_PROVIDER_LABELS[conn.provider]}.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
