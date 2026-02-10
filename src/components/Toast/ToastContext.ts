import { createContext } from 'react'
import type { ToastInput } from './types'

export interface ToastContextValue {
  toast: (input: ToastInput) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
