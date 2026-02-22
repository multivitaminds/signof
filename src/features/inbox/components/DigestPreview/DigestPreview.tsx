import { useState, useMemo, useCallback } from 'react'
import {
  Mail, ChevronDown, ChevronRight, FileSignature, Layout,
  Calendar, FolderOpen, Settings, Send, Check,
} from 'lucide-react'
import { useInboxStore } from '../../stores/useInboxStore'
import { NotificationCategory, DigestFrequency } from '../../types'
import './DigestPreview.css'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const CATEGORY_CONFIG: {
  key: NotificationCategory
  label: string
  icon: React.ComponentType<{ size?: number }>
  color: string
}[] = [
  { key: NotificationCategory.Documents, label: 'Documents', icon: FileSignature, color: '#EF4444' },
  { key: NotificationCategory.Projects, label: 'Projects', icon: Layout, color: '#F59E0B' },
  { key: NotificationCategory.Scheduling, label: 'Scheduling', icon: Calendar, color: '#06B6D4' },
  { key: NotificationCategory.Workspace, label: 'Workspace', icon: FolderOpen, color: '#4F46E5' },
  { key: NotificationCategory.System, label: 'System', icon: Settings, color: '#94A3B8' },
]

const FREQUENCY_OPTIONS: { value: DigestFrequency; label: string }[] = [
  { value: DigestFrequency.Daily, label: 'Daily' },
  { value: DigestFrequency.Weekly, label: 'Weekly' },
  { value: DigestFrequency.Never, label: 'Never' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function DigestPreview() {
  const notifications = useInboxStore((s) => s.notifications)
  const digestFrequency = useInboxStore((s) => s.digestFrequency)
  const setDigestFrequency = useInboxStore((s) => s.setDigestFrequency)

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  /* Compute digest stats */
  const digestStats = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentNotifs = notifications.filter(
      (n) => new Date(n.createdAt) >= weekAgo
    )

    const byCategory: Record<string, typeof recentNotifs> = {}
    for (const n of recentNotifs) {
      if (!byCategory[n.category]) byCategory[n.category] = []
      byCategory[n.category]!.push(n)
    }

    const docsSigned = recentNotifs.filter(
      (n) => n.type === 'document_signed'
    ).length

    const bookings = recentNotifs.filter(
      (n) => n.type === 'booking'
    ).length

    const issuesCompleted = recentNotifs.filter(
      (n) => n.type === 'status_change'
    ).length

    return {
      total: recentNotifs.length,
      docsSigned,
      bookings,
      issuesCompleted,
      byCategory,
    }
  }, [notifications])

  const handleToggleCategory = useCallback((key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const handleSendTestDigest = useCallback(() => {
    setSendStatus('sending')
    setTimeout(() => {
      setSendStatus('sent')
      setTimeout(() => setSendStatus('idle'), 2000)
    }, 1500)
  }, [])

  const handleFrequencyChange = useCallback((freq: DigestFrequency) => {
    setDigestFrequency(freq)
  }, [setDigestFrequency])

  return (
    <div className="digest-preview">
      <div className="digest-preview__header">
        <div className="digest-preview__header-icon">
          <Mail size={20} />
        </div>
        <div>
          <h2 className="digest-preview__title">Email Digest Preview</h2>
          <p className="digest-preview__subtitle">
            Preview of your {digestFrequency === 'daily' ? 'daily' : 'weekly'} email digest
          </p>
        </div>
      </div>

      {/* Frequency selector */}
      <div className="digest-preview__frequency">
        <span className="digest-preview__frequency-label">Digest Frequency</span>
        <div className="digest-preview__frequency-options" role="radiogroup" aria-label="Digest frequency">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="radio"
              aria-checked={digestFrequency === opt.value}
              className={`digest-preview__frequency-btn ${digestFrequency === opt.value ? 'digest-preview__frequency-btn--active' : ''}`}
              onClick={() => handleFrequencyChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {digestFrequency === 'never' ? (
        <div className="digest-preview__disabled">
          <Mail size={32} />
          <p>Email digests are disabled. Select Daily or Weekly to preview.</p>
        </div>
      ) : (
        <>
          {/* Email preview card */}
          <div className="digest-preview__email">
            <div className="digest-preview__email-header">
              <div className="digest-preview__email-from">
                <strong>From:</strong> OriginA Notifications &lt;notifications@origina.app&gt;
              </div>
              <div className="digest-preview__email-subject">
                <strong>Subject:</strong> Your {digestFrequency === 'daily' ? 'Daily' : 'Weekly'} OriginA Digest
              </div>
            </div>

            <div className="digest-preview__email-body">
              {/* Summary section */}
              <div className="digest-preview__summary">
                <h3 className="digest-preview__summary-title">This Week at a Glance</h3>
                <div className="digest-preview__summary-stats">
                  <div className="digest-preview__stat">
                    <span className="digest-preview__stat-value">{digestStats.docsSigned}</span>
                    <span className="digest-preview__stat-label">Documents Signed</span>
                  </div>
                  <div className="digest-preview__stat">
                    <span className="digest-preview__stat-value">{digestStats.bookings}</span>
                    <span className="digest-preview__stat-label">Bookings This Week</span>
                  </div>
                  <div className="digest-preview__stat">
                    <span className="digest-preview__stat-value">{digestStats.issuesCompleted}</span>
                    <span className="digest-preview__stat-label">Issues Completed</span>
                  </div>
                </div>
              </div>

              {/* Category sections */}
              <div className="digest-preview__categories">
                {CATEGORY_CONFIG.map((cat) => {
                  const items = digestStats.byCategory[cat.key] ?? []
                  const isExpanded = expandedCategories.has(cat.key)
                  const CatIcon = cat.icon

                  return (
                    <div key={cat.key} className="digest-preview__category">
                      <button
                        className="digest-preview__category-header"
                        onClick={() => handleToggleCategory(cat.key)}
                        aria-expanded={isExpanded}
                      >
                        <div className="digest-preview__category-left">
                          <div
                            className="digest-preview__category-icon"
                            style={{ '--cat-color': cat.color } as React.CSSProperties}
                          >
                            <CatIcon size={14} />
                          </div>
                          <span className="digest-preview__category-name">{cat.label}</span>
                          <span className="digest-preview__category-count">{items.length}</span>
                        </div>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      {isExpanded && (
                        <div className="digest-preview__category-items">
                          {items.length === 0 ? (
                            <p className="digest-preview__category-empty">No activity this week</p>
                          ) : (
                            items.slice(0, 5).map((n) => (
                              <div key={n.id} className="digest-preview__category-item">
                                <span className="digest-preview__category-item-title">{n.title}</span>
                                <span className="digest-preview__category-item-time">
                                  {new Date(n.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            ))
                          )}
                          {items.length > 5 && (
                            <p className="digest-preview__category-more">
                              +{items.length - 5} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Send test digest button */}
          <div className="digest-preview__actions">
            <button
              className="digest-preview__send-btn"
              onClick={handleSendTestDigest}
              disabled={sendStatus !== 'idle'}
            >
              {sendStatus === 'idle' && <><Send size={14} /> Send Test Digest</>}
              {sendStatus === 'sending' && 'Sending...'}
              {sendStatus === 'sent' && <><Check size={14} /> Test Digest Sent!</>}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
