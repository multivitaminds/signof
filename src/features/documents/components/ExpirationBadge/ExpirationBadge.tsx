import { useState, useCallback, useMemo } from 'react'
import { Clock, Calendar, AlertTriangle, X } from 'lucide-react'
import './ExpirationBadge.css'

// ─── Types ────────────────────────────────────────────────────────────

interface ExpirationBadgeProps {
  expiresAt: string | null
  onSetExpiration?: (date: string | null) => void
  compact?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────

function getExpirationInfo(expiresAt: string | null): {
  label: string
  variant: 'none' | 'safe' | 'warning' | 'danger' | 'expired'
} {
  if (!expiresAt) {
    return { label: 'No expiration', variant: 'none' }
  }

  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / 86400000)

  if (diffMs <= 0) {
    return { label: 'Expired', variant: 'expired' }
  }

  if (diffDays <= 1) {
    return { label: 'Expires today', variant: 'danger' }
  }

  if (diffDays <= 3) {
    return { label: `Expires in ${diffDays} days`, variant: 'warning' }
  }

  if (diffDays <= 7) {
    return { label: `Expires in ${diffDays} days`, variant: 'safe' }
  }

  return {
    label: `Expires ${expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    variant: 'safe',
  }
}

// ─── Component ────────────────────────────────────────────────────────

function ExpirationBadge({ expiresAt, onSetExpiration, compact = false }: ExpirationBadgeProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [dateValue, setDateValue] = useState(() => {
    if (expiresAt) {
      return expiresAt.split('T')[0] ?? ''
    }
    return ''
  })

  const info = useMemo(() => getExpirationInfo(expiresAt), [expiresAt])

  const handleTogglePicker = useCallback(() => {
    setShowPicker((prev) => !prev)
  }, [])

  const handleSetDate = useCallback(() => {
    if (onSetExpiration && dateValue) {
      onSetExpiration(new Date(dateValue + 'T23:59:59Z').toISOString())
      setShowPicker(false)
    }
  }, [onSetExpiration, dateValue])

  const handleClearExpiration = useCallback(() => {
    if (onSetExpiration) {
      onSetExpiration(null)
      setDateValue('')
      setShowPicker(false)
    }
  }, [onSetExpiration])

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDateValue(e.target.value)
  }, [])

  const Icon = info.variant === 'expired' || info.variant === 'danger'
    ? AlertTriangle
    : info.variant === 'warning'
      ? Clock
      : Calendar

  if (compact && info.variant === 'none') {
    return null
  }

  return (
    <div className="expiration-badge">
      <button
        type="button"
        className={`expiration-badge__badge expiration-badge__badge--${info.variant}`}
        onClick={onSetExpiration ? handleTogglePicker : undefined}
        aria-label={info.label}
        title={expiresAt ? `Expires: ${new Date(expiresAt).toLocaleString()}` : 'No expiration set'}
      >
        <Icon className="expiration-badge__icon" />
        {!compact && <span className="expiration-badge__label">{info.label}</span>}
      </button>

      {showPicker && onSetExpiration && (
        <div className="expiration-badge__picker" role="dialog" aria-label="Set expiration date">
          <div className="expiration-badge__picker-header">
            <span className="expiration-badge__picker-title">Set Expiration</span>
            <button
              type="button"
              className="expiration-badge__picker-close"
              onClick={handleTogglePicker}
              aria-label="Close date picker"
            >
              <X size={14} />
            </button>
          </div>
          <div className="expiration-badge__picker-body">
            <input
              type="date"
              className="expiration-badge__date-input"
              value={dateValue}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              aria-label="Expiration date"
            />
            <div className="expiration-badge__picker-actions">
              {expiresAt && (
                <button
                  type="button"
                  className="expiration-badge__clear-btn"
                  onClick={handleClearExpiration}
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                className="expiration-badge__set-btn"
                onClick={handleSetDate}
                disabled={!dateValue}
              >
                Set Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpirationBadge
