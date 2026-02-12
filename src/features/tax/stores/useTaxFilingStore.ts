import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type TaxFiling,
  type TaxYear,
  type TaxBanditConfig,
  type TaxBanditValidationError,
  type TransmissionStatus,
  FilingState,
  FilingStatus,
  STANDARD_DEDUCTION_2025,
  TAX_BRACKETS_2025,
} from '../types'
import {
  getAccessToken,
  createBusiness,
  create1040Return,
  validateReturn,
  transmitReturn,
  getFilingStatus,
  getReturnPdf,
  mapTaxBanditStatusToFilingState,
  TaxBanditError,
} from '../lib/taxBanditApi'

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

// ─── Default TaxBandit Config ───────────────────────────────────────────

const DEFAULT_TAXBANDIT_CONFIG: TaxBanditConfig = {
  clientId: '',
  clientSecret: '',
  userToken: '',
  useSandbox: true,
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

// ─── Helper: check if TaxBandit credentials are configured ──────────────

function hasCredentials(config: TaxBanditConfig): boolean {
  return (
    config.clientId.length > 0 &&
    config.clientSecret.length > 0 &&
    config.userToken.length > 0
  )
}

// ─── Store ──────────────────────────────────────────────────────────────

interface TaxFilingState {
  filings: TaxFiling[]
  checklist: ChecklistItem[]
  confirmation: FilingConfirmation | null
  isAmendmentMode: boolean
  amendmentReason: string

  // TaxBandit integration
  taxBanditConfig: TaxBanditConfig
  accessToken: string | null
  accessTokenExpiry: string | null
  submissionId: string | null
  recordId: string | null
  validationErrors: TaxBanditValidationError[]
  transmissionStatus: TransmissionStatus
  transmissionError: string | null
  returnPdfUrl: string | null

  // Actions
  createFiling: (taxYear: TaxYear) => void
  updateFiling: (id: string, updates: Partial<TaxFiling>) => void
  calculateTax: (filingId: string) => void
  submitFiling: (filingId: string) => void
  deleteFiling: (filingId: string) => void

  // TaxBandit actions
  setTaxBanditConfig: (config: Partial<TaxBanditConfig>) => void
  authenticateWithTaxBandit: () => Promise<boolean>
  validateAndTransmit: (filingId: string) => Promise<void>
  pollFilingStatus: (filingId: string) => Promise<void>
  downloadReturnPdf: () => Promise<void>
  isTaxBanditConnected: () => boolean

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

  // Clear data
  clearData: () => void

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

      // TaxBandit state
      taxBanditConfig: { ...DEFAULT_TAXBANDIT_CONFIG },
      accessToken: null,
      accessTokenExpiry: null,
      submissionId: null,
      recordId: null,
      validationErrors: [],
      transmissionStatus: 'idle' as TransmissionStatus,
      transmissionError: null,
      returnPdfUrl: null,

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
        const state = get()
        state.calculateTax(filingId)
        const filing = get().filings.find((f) => f.id === filingId)
        if (!filing) return

        // If TaxBandit is configured, use API flow
        if (hasCredentials(state.taxBanditConfig) && state.accessToken) {
          // The API flow is handled by validateAndTransmit — here we just
          // kick it off asynchronously
          void state.validateAndTransmit(filingId)
          return
        }

        // Fallback: simulated flow (no API credentials)
        const refNumber = generateReferenceNumber()
        const filedAt = new Date().toISOString()

        set((s) => ({
          filings: s.filings.map((f) =>
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
          set((s) => ({
            filings: s.filings.map((f) =>
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

      // ─── TaxBandit Actions ──────────────────────────────────────────────

      setTaxBanditConfig: (config) =>
        set((state) => ({
          taxBanditConfig: { ...state.taxBanditConfig, ...config },
          // Reset connection state when credentials change
          accessToken: null,
          accessTokenExpiry: null,
        })),

      authenticateWithTaxBandit: async () => {
        const { taxBanditConfig } = get()
        if (!hasCredentials(taxBanditConfig)) return false

        try {
          const { token, expiresIn } = await getAccessToken(taxBanditConfig)
          const expiry = new Date(Date.now() + expiresIn * 1000).toISOString()
          set({
            accessToken: token,
            accessTokenExpiry: expiry,
          })
          return true
        } catch (err) {
          set({ accessToken: null, accessTokenExpiry: null })
          if (err instanceof TaxBanditError) {
            set({ transmissionError: err.message })
          }
          return false
        }
      },

      validateAndTransmit: async (filingId) => {
        const state = get()
        const filing = state.filings.find((f) => f.id === filingId)
        if (!filing) return

        const config = state.taxBanditConfig
        let token = state.accessToken

        // Authenticate if needed
        if (!token) {
          set({ transmissionStatus: 'validating', transmissionError: null, validationErrors: [] })
          try {
            const authResult = await getAccessToken(config)
            token = authResult.token
            const expiry = new Date(Date.now() + authResult.expiresIn * 1000).toISOString()
            set({ accessToken: token, accessTokenExpiry: expiry })
          } catch (err) {
            set({
              transmissionStatus: 'error',
              transmissionError: err instanceof TaxBanditError ? err.message : 'Authentication failed',
            })
            return
          }
        }

        try {
          // Step 1: Validating
          set({ transmissionStatus: 'validating', transmissionError: null, validationErrors: [] })

          // Create business record
          const businessId = await createBusiness(config, token, filing)

          // Create 1040 return
          const { submissionId, recordId } = await create1040Return(
            config,
            token,
            businessId,
            filing
          )
          set({ submissionId, recordId })

          // Validate
          const errors = await validateReturn(config, token, submissionId)
          if (errors.length > 0) {
            set({
              validationErrors: errors,
              transmissionStatus: 'error',
              transmissionError: `Validation failed with ${errors.length} error(s)`,
            })
            return
          }

          // Step 2: Transmitting
          set({ transmissionStatus: 'transmitting' })
          await transmitReturn(config, token, submissionId, [recordId])

          // Update filing state
          const filedAt = new Date().toISOString()
          set((s) => ({
            filings: s.filings.map((f) =>
              f.id === filingId
                ? { ...f, state: FilingState.Filed, filedAt, updatedAt: filedAt }
                : f
            ),
          }))

          // Step 3: Poll status
          set({ transmissionStatus: 'polling' })
          const refNumber = generateReferenceNumber()

          // Poll up to 3 times with 5s intervals
          for (let attempt = 0; attempt < 3; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 5000))
            const statusResult = await getFilingStatus(config, token, submissionId)
            const mappedState = mapTaxBanditStatusToFilingState(statusResult.acknowledgementStatus)

            if (mappedState === 'accepted' || mappedState === 'rejected') {
              const filingState = mappedState === 'accepted'
                ? FilingState.Accepted
                : FilingState.Rejected

              set((s) => ({
                filings: s.filings.map((f) =>
                  f.id === filingId
                    ? { ...f, state: filingState, updatedAt: new Date().toISOString() }
                    : f
                ),
                transmissionStatus: 'complete',
                confirmation: {
                  referenceNumber: refNumber,
                  filedAt,
                  estimatedRefund: filing.refundOrOwed < 0 ? Math.abs(filing.refundOrOwed) : null,
                  estimatedOwed: filing.refundOrOwed >= 0 ? filing.refundOrOwed : null,
                  isAmendment: false,
                  amendmentReason: '',
                },
              }))

              if (statusResult.irsErrors.length > 0) {
                set({
                  transmissionError: statusResult.irsErrors
                    .map((e) => `${e.code}: ${e.message}`)
                    .join('; '),
                })
              }
              return
            }
          }

          // If polling didn't resolve, mark as complete with Filed status
          set({
            transmissionStatus: 'complete',
            confirmation: {
              referenceNumber: refNumber,
              filedAt,
              estimatedRefund: filing.refundOrOwed < 0 ? Math.abs(filing.refundOrOwed) : null,
              estimatedOwed: filing.refundOrOwed >= 0 ? filing.refundOrOwed : null,
              isAmendment: false,
              amendmentReason: '',
            },
          })
        } catch (err) {
          set({
            transmissionStatus: 'error',
            transmissionError:
              err instanceof TaxBanditError
                ? err.errors.map((e) => e.message).join('; ') || err.message
                : err instanceof Error
                  ? err.message
                  : 'An unexpected error occurred',
          })
        }
      },

      pollFilingStatus: async (filingId) => {
        const { taxBanditConfig, accessToken, submissionId } = get()
        if (!accessToken || !submissionId) return

        try {
          const statusResult = await getFilingStatus(taxBanditConfig, accessToken, submissionId)
          const mappedState = mapTaxBanditStatusToFilingState(statusResult.acknowledgementStatus)

          if (mappedState === 'accepted' || mappedState === 'rejected') {
            const filingState = mappedState === 'accepted'
              ? FilingState.Accepted
              : FilingState.Rejected

            set((s) => ({
              filings: s.filings.map((f) =>
                f.id === filingId
                  ? { ...f, state: filingState, updatedAt: new Date().toISOString() }
                  : f
              ),
            }))
          }
        } catch {
          // Silently fail — user can retry
        }
      },

      downloadReturnPdf: async () => {
        const { taxBanditConfig, accessToken, submissionId } = get()
        if (!accessToken || !submissionId) return

        try {
          const pdfUrl = await getReturnPdf(taxBanditConfig, accessToken, submissionId)
          set({ returnPdfUrl: pdfUrl })
        } catch (err) {
          set({
            transmissionError:
              err instanceof Error ? err.message : 'Failed to get PDF URL',
          })
        }
      },

      isTaxBanditConnected: () => {
        const { accessToken, accessTokenExpiry } = get()
        if (!accessToken || !accessTokenExpiry) return false
        return new Date(accessTokenExpiry) > new Date()
      },

      // ─── Checklist ──────────────────────────────────────────────────────

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

      // ─── Amendment ──────────────────────────────────────────────────────

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

      // ─── Confirmation / Clear ───────────────────────────────────────────

      clearConfirmation: () =>
        set({ confirmation: null }),

      clearData: () => {
        set({
          filings: [],
          checklist: DEFAULT_CHECKLIST.map((item) => ({ ...item })),
          confirmation: null,
          taxBanditConfig: { ...DEFAULT_TAXBANDIT_CONFIG },
          accessToken: null,
          accessTokenExpiry: null,
          submissionId: null,
          recordId: null,
          validationErrors: [],
          transmissionStatus: 'idle',
          transmissionError: null,
          returnPdfUrl: null,
        })
      },

      // ─── Queries ────────────────────────────────────────────────────────

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
        taxBanditConfig: state.taxBanditConfig,
      }),
    }
  )
)
