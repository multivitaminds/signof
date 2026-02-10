import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type TaxFiling,
  type TaxYear,
  FilingState,
  FilingStatus,
  STANDARD_DEDUCTION_2025,
  TAX_BRACKETS_2025,
} from '../types'

// ─── Pre-Filing Checklist ───────────────────────────────────────────────

export const ChecklistItemId = {
  PersonalInfo: 'personal_info',
  AllW2s: 'all_w2s',
  All1099s: 'all_1099s',
  DeductionChoice: 'deduction_choice',
  BankInfo: 'bank_info',
  ReviewTotals: 'review_totals',
} as const

export type ChecklistItemId = (typeof ChecklistItemId)[keyof typeof ChecklistItemId]

export interface ChecklistItem {
  id: ChecklistItemId
  label: string
  description: string
  completed: boolean
}

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: ChecklistItemId.PersonalInfo, label: 'Personal Information', description: 'Name, SSN, filing status, and address are complete', completed: false },
  { id: ChecklistItemId.AllW2s, label: 'All W-2s Uploaded', description: 'Upload W-2 forms from all employers', completed: false },
  { id: ChecklistItemId.All1099s, label: 'All 1099s Uploaded', description: 'Upload 1099s for freelance, interest, dividends, etc.', completed: false },
  { id: ChecklistItemId.DeductionChoice, label: 'Deduction Method Selected', description: 'Choose standard or itemized deductions', completed: false },
  { id: ChecklistItemId.BankInfo, label: 'Bank Information', description: 'Routing and account number for direct deposit refund', completed: false },
  { id: ChecklistItemId.ReviewTotals, label: 'Review Tax Totals', description: 'Verify income, deductions, and calculated tax amounts', completed: false },
]

// ─── Filing Confirmation ────────────────────────────────────────────────

export interface FilingConfirmation {
  referenceNumber: string
  filedAt: string
  estimatedRefund: number | null
  estimatedOwed: number | null
  isAmendment: boolean
  amendmentReason: string
}

// ─── Tax Calculation ────────────────────────────────────────────────────

function computeFederalTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0
  let tax = 0
  let remaining = taxableIncome

  for (const bracket of TAX_BRACKETS_2025) {
    const bracketWidth = bracket.max === Infinity
      ? remaining
      : bracket.max - bracket.min + 1
    const taxableInBracket = Math.min(remaining, bracketWidth)
    if (taxableInBracket <= 0) break
    tax += taxableInBracket * bracket.rate
    remaining -= taxableInBracket
  }

  return Math.round(tax * 100) / 100
}

// ─── Reference Number Generator ─────────────────────────────────────────

function generateReferenceNumber(): string {
  const prefix = 'SF'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// ─── ID Generator ───────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Sample Data ────────────────────────────────────────────────────────

function createSampleFiling(): TaxFiling {
  return {
    id: 'filing_sample_1',
    taxYear: '2025',
    state: FilingState.InProgress,
    filingStatus: FilingStatus.Single,
    firstName: 'Alex',
    lastName: 'Johnson',
    ssn: '***-**-4589',
    email: 'alex.johnson@email.com',
    phone: '(555) 123-4567',
    address: {
      street: '742 Evergreen Terrace',
      apt: '',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
    },
    wages: 85000,
    otherIncome: 12000,
    totalIncome: 97000,
    useStandardDeduction: true,
    standardDeduction: STANDARD_DEDUCTION_2025,
    itemizedDeductions: 0,
    effectiveDeduction: STANDARD_DEDUCTION_2025,
    taxableIncome: 82000,
    federalTax: 13124,
    estimatedPayments: 0,
    withheld: 14500,
    refundOrOwed: -1376,
    createdAt: '2026-01-28T16:00:00Z',
    updatedAt: '2026-02-01T11:30:00Z',
    filedAt: null,
  }
}

// ─── Store ──────────────────────────────────────────────────────────────

interface TaxFilingState {
  filings: TaxFiling[]
  checklist: ChecklistItem[]
  confirmation: FilingConfirmation | null
  isAmendmentMode: boolean
  amendmentReason: string

  // Actions
  createFiling: (taxYear: TaxYear) => void
  updateFiling: (id: string, updates: Partial<TaxFiling>) => void
  calculateTax: (filingId: string) => void
  submitFiling: (filingId: string) => void
  deleteFiling: (filingId: string) => void

  // Checklist
  toggleChecklistItem: (itemId: ChecklistItemId) => void
  resetChecklist: () => void
  checklistProgress: () => number

  // Amendment
  setAmendmentMode: (enabled: boolean) => void
  setAmendmentReason: (reason: string) => void
  submitAmendment: (filingId: string) => void

  // Confirmation
  clearConfirmation: () => void

  // Queries
  getFilingByYear: (year: TaxYear) => TaxFiling | undefined
  isChecklistComplete: () => boolean
}

export const useTaxFilingStore = create<TaxFilingState>()(
  persist(
    (set, get) => ({
      filings: [createSampleFiling()],
      checklist: DEFAULT_CHECKLIST.map((item) => ({ ...item })),
      confirmation: null,
      isAmendmentMode: false,
      amendmentReason: '',

      createFiling: (taxYear) =>
        set((state) => {
          if (state.filings.some((f) => f.taxYear === taxYear)) return state
          const now = new Date().toISOString()
          const newFiling: TaxFiling = {
            id: generateId(),
            taxYear,
            state: FilingState.InProgress,
            filingStatus: FilingStatus.Single,
            firstName: '',
            lastName: '',
            ssn: '',
            email: '',
            phone: '',
            address: { street: '', apt: '', city: '', state: '', zip: '' },
            wages: 0,
            otherIncome: 0,
            totalIncome: 0,
            useStandardDeduction: true,
            standardDeduction: STANDARD_DEDUCTION_2025,
            itemizedDeductions: 0,
            effectiveDeduction: STANDARD_DEDUCTION_2025,
            taxableIncome: 0,
            federalTax: 0,
            estimatedPayments: 0,
            withheld: 0,
            refundOrOwed: 0,
            createdAt: now,
            updatedAt: now,
            filedAt: null,
          }
          return { filings: [...state.filings, newFiling] }
        }),

      updateFiling: (id, updates) =>
        set((state) => ({
          filings: state.filings.map((f) =>
            f.id === id
              ? { ...f, ...updates, updatedAt: new Date().toISOString() }
              : f
          ),
        })),

      calculateTax: (filingId) =>
        set((state) => ({
          filings: state.filings.map((f) => {
            if (f.id !== filingId) return f
            const totalIncome = f.wages + f.otherIncome
            const effectiveDeduction = f.useStandardDeduction
              ? f.standardDeduction
              : f.itemizedDeductions
            const taxableIncome = Math.max(0, totalIncome - effectiveDeduction)
            const federalTax = computeFederalTax(taxableIncome)
            const refundOrOwed = federalTax - f.withheld - f.estimatedPayments
            return {
              ...f,
              totalIncome,
              effectiveDeduction,
              taxableIncome,
              federalTax,
              refundOrOwed,
              updatedAt: new Date().toISOString(),
            }
          }),
        })),

      submitFiling: (filingId) => {
        get().calculateTax(filingId)
        const filing = get().filings.find((f) => f.id === filingId)
        if (!filing) return

        const refNumber = generateReferenceNumber()
        const filedAt = new Date().toISOString()

        set((state) => ({
          filings: state.filings.map((f) =>
            f.id === filingId
              ? {
                  ...f,
                  state: FilingState.Filed,
                  filedAt,
                  updatedAt: filedAt,
                }
              : f
          ),
          confirmation: {
            referenceNumber: refNumber,
            filedAt,
            estimatedRefund: filing.refundOrOwed < 0 ? Math.abs(filing.refundOrOwed) : null,
            estimatedOwed: filing.refundOrOwed >= 0 ? filing.refundOrOwed : null,
            isAmendment: false,
            amendmentReason: '',
          },
        }))

        // Simulate IRS acceptance after delay
        setTimeout(() => {
          set((state) => ({
            filings: state.filings.map((f) =>
              f.id === filingId
                ? {
                    ...f,
                    state: FilingState.Accepted,
                    updatedAt: new Date().toISOString(),
                  }
                : f
            ),
          }))
        }, 3000)
      },

      deleteFiling: (filingId) =>
        set((state) => ({
          filings: state.filings.filter((f) => f.id !== filingId),
        })),

      toggleChecklistItem: (itemId) =>
        set((state) => ({
          checklist: state.checklist.map((item) =>
            item.id === itemId
              ? { ...item, completed: !item.completed }
              : item
          ),
        })),

      resetChecklist: () =>
        set({
          checklist: DEFAULT_CHECKLIST.map((item) => ({ ...item })),
        }),

      checklistProgress: () => {
        const { checklist } = get()
        if (checklist.length === 0) return 0
        const completed = checklist.filter((i) => i.completed).length
        return Math.round((completed / checklist.length) * 100)
      },

      setAmendmentMode: (enabled) =>
        set({ isAmendmentMode: enabled }),

      setAmendmentReason: (reason) =>
        set({ amendmentReason: reason }),

      submitAmendment: (filingId) => {
        get().calculateTax(filingId)
        const filing = get().filings.find((f) => f.id === filingId)
        if (!filing) return

        const refNumber = generateReferenceNumber()
        const filedAt = new Date().toISOString()
        const reason = get().amendmentReason

        set((state) => ({
          filings: state.filings.map((f) =>
            f.id === filingId
              ? {
                  ...f,
                  state: FilingState.Filed,
                  filedAt,
                  updatedAt: filedAt,
                }
              : f
          ),
          confirmation: {
            referenceNumber: refNumber,
            filedAt,
            estimatedRefund: filing.refundOrOwed < 0 ? Math.abs(filing.refundOrOwed) : null,
            estimatedOwed: filing.refundOrOwed >= 0 ? filing.refundOrOwed : null,
            isAmendment: true,
            amendmentReason: reason,
          },
          isAmendmentMode: false,
          amendmentReason: '',
        }))

        setTimeout(() => {
          set((state) => ({
            filings: state.filings.map((f) =>
              f.id === filingId
                ? {
                    ...f,
                    state: FilingState.Accepted,
                    updatedAt: new Date().toISOString(),
                  }
                : f
            ),
          }))
        }, 3000)
      },

      clearConfirmation: () =>
        set({ confirmation: null }),

      getFilingByYear: (year) =>
        get().filings.find((f) => f.taxYear === year),

      isChecklistComplete: () =>
        get().checklist.every((item) => item.completed),
    }),
    {
      name: 'signof-tax-filing-storage',
      partialize: (state) => ({
        filings: state.filings,
        checklist: state.checklist,
        confirmation: state.confirmation,
      }),
    }
  )
)
