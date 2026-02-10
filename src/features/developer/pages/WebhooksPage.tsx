import { useState, useCallback } from 'react'
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  TestTube2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import useDeveloperStore from '../stores/useDeveloperStore'
import { WEBHOOK_EVENT_LABELS } from '../types'
import type { WebhookEvent } from '../types'
import WebhookConfig from '../components/WebhookConfig/WebhookConfig'
import './WebhooksPage.css'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function WebhooksPage() {
  const {
    webhooks,
    webhookLogs,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
  } = useDeveloperStore()

  const [showCreate, setShowCreate] = useState(false)
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set())
  const [expandedWebhookId, setExpandedWebhookId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleCreate = useCallback(
    (url: string, events: WebhookEvent[]) => {
      createWebhook(url, events)
      setShowCreate(false)
    },
    [createWebhook]
  )

  const handleToggleActive = useCallback(
    (id: string, currentActive: boolean) => {
      updateWebhook(id, { active: !currentActive })
    },
    [updateWebhook]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (confirmDeleteId === id) {
        deleteWebhook(id)
        setConfirmDeleteId(null)
      } else {
        setConfirmDeleteId(id)
        setTimeout(() => setConfirmDeleteId(null), 3000)
      }
    },
    [confirmDeleteId, deleteWebhook]
  )

  const handleTest = useCallback(
    (id: string) => {
      testWebhook(id)
    },
    [testWebhook]
  )

  const handleToggleSecret = useCallback((id: string) => {
    setRevealedSecrets(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedWebhookId(prev => (prev === id ? null : id))
  }, [])

  return (
    <div className="webhooks-page">
      <div className="webhooks-page__header">
        <div>
          <h1 className="webhooks-page__title">Webhooks</h1>
          <p className="webhooks-page__subtitle">
            Configure webhook endpoints to receive real-time notifications about events in your workspace.
          </p>
        </div>
        <button
          className="btn-primary webhooks-page__create-btn"
          onClick={() => setShowCreate(!showCreate)}
          type="button"
        >
          <Plus size={16} />
          {showCreate ? 'Cancel' : 'Add Endpoint'}
        </button>
      </div>

      {showCreate && (
        <div className="webhooks-page__create-form">
          <h3 className="webhooks-page__form-title">New Webhook Endpoint</h3>
          <WebhookConfig onSave={handleCreate} />
        </div>
      )}

      <div className="webhooks-page__list">
        {webhooks.length === 0 && (
          <div className="webhooks-page__empty">
            <p>No webhooks configured yet.</p>
            <p className="webhooks-page__empty-hint">
              Add an endpoint to start receiving event notifications.
            </p>
          </div>
        )}

        {webhooks.map(wh => {
          const isExpanded = expandedWebhookId === wh.id
          const logsForWebhook = webhookLogs
            .filter(l => l.webhookId === wh.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

          return (
            <div
              key={wh.id}
              className={`webhooks-page__card ${!wh.active ? 'webhooks-page__card--inactive' : ''}`}
            >
              <div className="webhooks-page__card-header">
                <button
                  className="webhooks-page__expand-btn"
                  onClick={() => handleToggleExpand(wh.id)}
                  type="button"
                  aria-expanded={isExpanded}
                  aria-label="Toggle webhook details"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <div className="webhooks-page__card-info">
                  <div className="webhooks-page__card-url-row">
                    <span
                      className={`webhooks-page__status-dot ${
                        wh.active
                          ? 'webhooks-page__status-dot--active'
                          : 'webhooks-page__status-dot--inactive'
                      }`}
                    />
                    <code className="webhooks-page__card-url">{wh.url}</code>
                  </div>
                  <div className="webhooks-page__card-meta">
                    <span>{wh.events.length} events</span>
                    <span className="webhooks-page__separator">|</span>
                    <span>Created {formatDate(wh.createdAt)}</span>
                    {wh.failureCount > 0 && (
                      <>
                        <span className="webhooks-page__separator">|</span>
                        <span className="webhooks-page__failures">
                          {wh.failureCount} failure{wh.failureCount !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="webhooks-page__card-actions">
                  <button
                    className="webhooks-page__action-btn"
                    onClick={() => handleToggleActive(wh.id, wh.active)}
                    type="button"
                    title={wh.active ? 'Disable' : 'Enable'}
                    aria-label={wh.active ? 'Disable webhook' : 'Enable webhook'}
                  >
                    {wh.active ? (
                      <ToggleRight size={20} className="webhooks-page__toggle--on" />
                    ) : (
                      <ToggleLeft size={20} className="webhooks-page__toggle--off" />
                    )}
                  </button>
                  <button
                    className="webhooks-page__action-btn"
                    onClick={() => handleTest(wh.id)}
                    type="button"
                    title="Send test event"
                    aria-label="Test webhook"
                  >
                    <TestTube2 size={16} />
                  </button>
                  <button
                    className={`webhooks-page__action-btn ${
                      confirmDeleteId === wh.id ? 'webhooks-page__action-btn--danger' : ''
                    }`}
                    onClick={() => handleDelete(wh.id)}
                    type="button"
                    title={confirmDeleteId === wh.id ? 'Click again to confirm' : 'Delete'}
                    aria-label="Delete webhook"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="webhooks-page__card-details">
                  <div className="webhooks-page__detail-section">
                    <h4 className="webhooks-page__detail-title">Signing Secret</h4>
                    <div className="webhooks-page__secret-row">
                      <code className="webhooks-page__secret-value">
                        {revealedSecrets.has(wh.id) ? wh.secret : wh.secret.replace(/./g, '\u2022').slice(0, 20) + '...'}
                      </code>
                      <button
                        className="webhooks-page__secret-toggle"
                        onClick={() => handleToggleSecret(wh.id)}
                        type="button"
                        aria-label={revealedSecrets.has(wh.id) ? 'Hide secret' : 'Reveal secret'}
                      >
                        {revealedSecrets.has(wh.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="webhooks-page__detail-section">
                    <h4 className="webhooks-page__detail-title">Subscribed Events</h4>
                    <div className="webhooks-page__event-tags">
                      {wh.events.map(event => (
                        <span className="webhooks-page__event-tag" key={event}>
                          {WEBHOOK_EVENT_LABELS[event]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {logsForWebhook.length > 0 && (
                    <div className="webhooks-page__detail-section">
                      <h4 className="webhooks-page__detail-title">
                        Recent Deliveries ({logsForWebhook.length})
                      </h4>
                      <table className="webhooks-page__logs-table">
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logsForWebhook.map(log => (
                            <tr key={log.id}>
                              <td>
                                <code className="webhooks-page__log-event">{log.event}</code>
                              </td>
                              <td className="webhooks-page__log-time">{formatDate(log.timestamp)}</td>
                              <td>
                                <span
                                  className="webhooks-page__log-status"
                                  style={{
                                    backgroundColor: log.statusCode < 400
                                      ? 'var(--color-success)'
                                      : 'var(--color-danger)',
                                  }}
                                >
                                  {log.statusCode}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`webhooks-page__log-result ${
                                    log.success
                                      ? 'webhooks-page__log-result--success'
                                      : 'webhooks-page__log-result--failure'
                                  }`}
                                >
                                  {log.success ? 'Success' : 'Failed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WebhooksPage
