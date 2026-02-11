import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import './Toast.css'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastData {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number
}

interface ToastProps extends ToastData {
  onClose: (id: string) => void
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

function Toast({ id, variant, title, description, duration = 5000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const Icon = ICONS[variant]

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 200)
  }, [id, onClose])

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, handleClose])

  return (
    <div
      className={`toast toast--${variant} ${isExiting ? 'toast--exiting' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <Icon size={20} className="toast__icon" />
      <div className="toast__content">
        <p className="toast__title">{title}</p>
        {description && <p className="toast__description">{description}</p>}
      </div>
      <button
        className="toast__close"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// Toast Container
interface ToastContainerProps {
  toasts: ToastData[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}

export default Toast
