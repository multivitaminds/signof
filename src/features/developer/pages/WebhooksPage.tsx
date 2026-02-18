import { useState, useCallback } from 'react'
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Send,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
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
    createWebhook,
    toggleWebhook,
    deleteWebhook,
    testWebhook,
    getDeliveries,
  } = useDeveloperStore()

  const [showCreate, setShowCreate] = useState(false)
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedWebhookId, setExpandedWebhookId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleCreate = useCallback(
    (url: string, description: string, events: WebhookEvent[]) => {
      createWebhook(url, description, events)
      setShowCreate(false)
    },
    [createWebhook]
  )

  const handleToggleActive = useCallback(
    (id: string) => {
      toggleWebhook(id)
    },
    [toggleWebhook]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (confirmDeleteId === id) {
        deleteWebhook(id)
        setConfirmDeleteId(null)
        if (expandedWebhookId === id) {
          setExpandedWebhookId(null)
        }
      } else {
        setConfirmDeleteId(id)
        setTimeout(() => setConfirmDeleteId(null), 3000)
      }
    },
    [confirmDeleteId, deleteWebhook, expandedWebhookId]
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

  const handleCopySecret = useCallback((secret: string, id: string) => {
    navigator.clipboard.writeText(secret).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }).catch(() => { /* clipboard unavailable */ })
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
          const deliveries = getDeliveries(wh.id)

          return (
            <div
              key={wh.id}
              className={`webhooks-page__card ${wh.status === 'disabled' ? 'webhooks-page__card--inactive' : ''}`}
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
                        wh.status === 'active'
                          ? 'webhooks-page__status-dot--active'
                          : 'webhooks-page__status-dot--inactive'
                      }`}
                    />
                    <code className="webhooks-page__card-url">{wh.url}</code>
                  </div>
                  {wh.description && (
                    <p className="webhooks-page__card-description">{wh.description}</p>
                  )}
                  <div className="webhooks-page__card-meta">
                    <span>{wh.events.length} events</span>
                    <span className="webhooks-page__separator">|</span>
                    <span>Created {formatDate(wh.createdAt)}</span>
                    {wh.lastDeliveryAt && (
                      <>
                        <span className="webhooks-page__separator">|</span>
                        <span>Last delivery {formatDate(wh.lastDeliveryAt)}</span>
                      </>
                    )}
                    {wh.failureCount > 0 && (
                      <>
                        <span className="webhooks-page__separator">|</span>
                        <span className="webhooks-page__failures">
                          <AlertTriangle size={12} />
                          {wh.failureCount} failure{wh.failureCount !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="webhooks-page__card-actions">
                  <button
                    className="webhooks-page__action-btn"
                    onClick={() => handleToggleActive(wh.id)}
                    type="button"
                    title={wh.status === 'active' ? 'Disable' : 'Enable'}
                    aria-label={wh.status === 'active' ? 'Disable webhook' : 'Enable webhook'}
                  >
                    {wh.status === 'active' ? (
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
                    <Send size={16} />
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
                  {/* Signing Secret */}
                  <div className="webhooks-page__detail-section">
                    <h4 className="webhooks-page__detail-title">Signing Secret</h4>
                    <div className="webhooks-page__secret-row">
                      <code className="webhooks-page__secret-value">
                        {revealedSecrets.has(wh.id)
                          ? wh.secret
                          : '\u2022'.repeat(20) + '...'}
                      </code>
                      <button
                        className="webhooks-page__secret-toggle"
                        onClick={() => handleToggleSecret(wh.id)}
                        type="button"
                        aria-label={revealedSecrets.has(wh.id) ? 'Hide secret' : 'Reveal secret'}
                      >
                        {revealedSecrets.has(wh.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        className="webhooks-page__secret-toggle"
                        onClick={() => handleCopySecret(wh.secret, wh.id)}
                        type="button"
                        aria-label="Copy secret"
                      >
                        {copiedId === wh.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Subscribed Events */}
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

                  {/* Recent Deliveries */}
                  <div className="webhooks-page__detail-section">
                    <div className="webhooks-page__deliveries-header">
                      <h4 className="webhooks-page__detail-title">
                        Recent Deliveries ({deliveries.length})
                      </h4>
                      <button
                        className="btn-secondary webhooks-page__test-btn"
                        onClick={() => handleTest(wh.id)}
                        type="button"
                      >
                        <Send size={14} />
                        Send Test
                      </button>
                    </div>

                    {deliveries.length === 0 ? (
                      <p className="webhooks-page__no-deliveries">No deliveries yet.</p>
                    ) : (
                      <table className="webhooks-page__logs-table">
                        <thead>
                          <tr>
                            <th>Status</th>
                            <th>Event</th>
                            <th>Response</th>
                            <th>Timestamp</th>
                            <th>Payload</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deliveries.slice(0, 10).map(delivery => (
                            <tr key={delivery.id}>
                              <td>
                                {delivery.success ? (
                                  <CheckCircle size={16} className="webhooks-page__delivery-icon--success" />
                                ) : (
                                  <XCircle size={16} className="webhooks-page__delivery-icon--failure" />
                                )}
                              </td>
                              <td>
                                <code className="webhooks-page__log-event">{delivery.event}</code>
                              </td>
                              <td>
                                <span
                                  className="webhooks-page__log-status"
                                  style={{
                                    backgroundColor: delivery.statusCode !== null && delivery.statusCode < 400
                                      ? 'var(--color-success)'
                                      : 'var(--color-danger)',
                                  }}
                                >
                                  {delivery.statusCode ?? '---'}
                                </span>
                              </td>
                              <td className="webhooks-page__log-time">
                                {formatDate(delivery.deliveredAt)}
                              </td>
                              <td>
                                <code className="webhooks-page__log-payload">
                                  {delivery.payload.length > 50
                                    ? delivery.payload.slice(0, 50) + '...'
                                    : delivery.payload}
                                </code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
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
