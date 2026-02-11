import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import type { Toast, ToastInput } from './types'
import { ToastContext } from './ToastContext'
import './ToastProvider.css'

// ─── Constants ─────────────────────────────────────────────────────────

const DEFAULT_DURATION = 4000
const MAX_TOASTS = 5

const VARIANT_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const

// ─── Single Toast Component ────────────────────────────────────────────

interface ToastItemProps {
  data: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ data, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const Icon = VARIANT_ICONS[data.variant]
  const duration = data.duration ?? DEFAULT_DURATION

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onDismiss(data.id), 200)
  }, [data.id, onDismiss])

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(handleDismiss, duration)
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
      }
    }
  }, [duration, handleDismiss])

  return (
    <div
      className={`toast-item toast-item--${data.variant}${isExiting ? ' toast-item--exiting' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <Icon size={20} className="toast-item__icon" aria-hidden="true" />
      <div className="toast-item__content">
        <p className="toast-item__title">{data.title}</p>
        {data.description && (
          <p className="toast-item__description">{data.description}</p>
        )}
      </div>
      <button
        className="toast-item__close"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// ─── Provider ──────────────────────────────────────────────────────────

interface ToastProviderProps {
  children: React.ReactNode
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  const toast = useCallback((input: ToastInput): string => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    const newToast: Toast = { ...input, id }

    setToasts((prev) => {
      const next = [...prev, newToast]
      // If exceeding max, remove oldest
      if (next.length > MAX_TOASTS) {
        return next.slice(next.length - MAX_TOASTS)
      }
      return next
    })

    // Announce toast to screen readers via ARIA live region
    const liveRegion = document.querySelector('.app-layout__live-region')
    if (liveRegion) {
      const message = input.description
        ? `${input.title}: ${input.description}`
        : input.title
      liveRegion.textContent = message
    }

    return id
  }, [])

  const contextValue = useMemo(
    () => ({ toast, dismiss, dismissAll }),
    [toast, dismiss, dismissAll]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-container" aria-label="Notifications" role="region">
          {toasts.map((t) => (
            <ToastItem key={t.id} data={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}
