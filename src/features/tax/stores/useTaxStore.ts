import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TaxDeadline, TaxYear } from '../types'

// ─── ID Generator ────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Sample Deadlines ───────────────────────────────────────────────

function createSampleDeadlines(): TaxDeadline[] {
  return [
    {
      id: generateId(),
      title: 'W-2 Forms Due',
      description: 'Employers must provide W-2 forms to employees by this date.',
      date: '2026-01-31',
      completed: true,
      taxYear: '2025',
    },
    {
      id: generateId(),
      title: '1099 Forms Due',
      description: 'Payers must send 1099 forms to recipients.',
      date: '2026-01-31',
      completed: true,
      taxYear: '2025',
    },
    {
      id: generateId(),
      title: 'Tax Filing Deadline',
      description: 'Federal income tax return (Form 1040) due for most taxpayers.',
      date: '2026-04-15',
      completed: false,
      taxYear: '2025',
    },
    {
      id: generateId(),
      title: 'Extension Deadline',
      description: 'Deadline for extended returns (Form 4868 must have been filed by April 15).',
      date: '2026-10-15',
      completed: false,
      taxYear: '2025',
    },
  ]
}

// ─── Store Interface ─────────────────────────────────────────────────

interface TaxState {
  // Global state
  activeTaxYear: TaxYear
  environment: 'sandbox' | 'production'
  deadlines: TaxDeadline[]

  // Actions
  setActiveTaxYear: (year: TaxYear) => void
  setEnvironment: (env: 'sandbox' | 'production') => void
  toggleDeadline: (id: string) => void
  clearData: () => void
}

// ─── Store ───────────────────────────────────────────────────────────

export const useTaxStore = create<TaxState>()(
  persist(
    (set) => ({
      activeTaxYear: '2025' as TaxYear,
      environment: 'sandbox' as const,
      deadlines: createSampleDeadlines(),

      setActiveTaxYear: (year) => set({ activeTaxYear: year }),

      setEnvironment: (env) => set({ environment: env }),

      toggleDeadline: (id) =>
        set((state) => ({
          deadlines: state.deadlines.map((d) =>
            d.id === id ? { ...d, completed: !d.completed } : d
          ),
        })),

      clearData: () => {
        set({
          deadlines: [],
          activeTaxYear: '2025' as TaxYear,
          environment: 'sandbox',
        })
      },
    }),
    {
      name: 'orchestree-tax-storage',
      partialize: (state) => ({
        deadlines: state.deadlines,
        activeTaxYear: state.activeTaxYear,
        environment: state.environment,
      }),
    }
  )
)
