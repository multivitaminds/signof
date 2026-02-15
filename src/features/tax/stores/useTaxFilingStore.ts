import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type TaxFiling,
  type TaxYear,
  type TaxBanditConfig,
  type TaxBanditValidationError,
  type TaxBanditSubmission,
  type TaxFormType,
  type TransmissionStatus,
  FilingState,
  FilingStatus,
  STANDARD_DEDUCTION_2025,
  TAX_BRACKETS_2025,
  TAXBANDITS_FORM_PATHS,
} from '../types'
import { TaxBanditClient, TaxBanditError } from '../lib/taxBanditClient'

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
  submissions: TaxBanditSubmission[]

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

  // Submission CRUD
  createSubmission: (formType: TaxFormType, payload: Record<string, unknown>) => string
  updateSubmissionState: (id: string, state: FilingState) => void
  setSubmissionTaxBanditIds: (id: string, submissionId: string, recordId: string) => void
  setSubmissionErrors: (id: string, errors: TaxBanditValidationError[], irsErrors?: Array<{ code: string; message: string }>) => void
  setSubmissionPdf: (id: string, pdfUrl: string) => void
  getSubmission: (id: string) => TaxBanditSubmission | undefined
  getSubmissionsByFormType: (formType: TaxFormType) => TaxBanditSubmission[]

  // TaxBandit actions
  setTaxBanditConfig: (config: Partial<TaxBanditConfig>) => void
  authenticateWithTaxBandit: () => Promise<boolean>
  validateAndTransmit: (filingId: string, formType?: TaxFormType) => Promise<void>
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
      submissions: [],

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

      // ─── Submission CRUD ──────────────────────────────────────────────

      createSubmission: (formType, payload) => {
        const id = generateId()
        const now = new Date().toISOString()
        const submission: TaxBanditSubmission = {
          id,
          formType,
          taxYear: '2025',
          taxBanditSubmissionId: null,
          taxBanditRecordId: null,
          businessId: null,
          state: FilingState.InProgress,
          payload,
          validationErrors: [],
          irsErrors: [],
          pdfUrl: null,
          createdAt: now,
          updatedAt: now,
          filedAt: null,
        }
        set((state) => ({
          submissions: [...state.submissions, submission],
        }))
        return id
      },

      updateSubmissionState: (id, newState) =>
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  state: newState,
                  updatedAt: new Date().toISOString(),
                  ...(newState === FilingState.Filed ? { filedAt: new Date().toISOString() } : {}),
                }
              : s
          ),
        })),

      setSubmissionTaxBanditIds: (id, tbSubmissionId, tbRecordId) =>
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  taxBanditSubmissionId: tbSubmissionId,
                  taxBanditRecordId: tbRecordId,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        })),

      setSubmissionErrors: (id, errors, irsErrors) =>
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  validationErrors: errors,
                  irsErrors: irsErrors ?? s.irsErrors,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        })),

      setSubmissionPdf: (id, pdfUrl) =>
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id
              ? { ...s, pdfUrl, updatedAt: new Date().toISOString() }
              : s
          ),
        })),

      getSubmission: (id) =>
        get().submissions.find((s) => s.id === id),

      getSubmissionsByFormType: (formType) =>
        get().submissions.filter((s) => s.formType === formType),

      // ─── TaxBandit Actions ──────────────────────────────────────────────

      setTaxBanditConfig: (config) =>
        set((state) => ({
          taxBanditConfig: { ...state.taxBanditConfig, ...config },
          accessToken: null,
          accessTokenExpiry: null,
        })),

      authenticateWithTaxBandit: async () => {
        const { taxBanditConfig } = get()
        if (!hasCredentials(taxBanditConfig)) return false

        try {
          const client = new TaxBanditClient(taxBanditConfig)
          const token = await client.authenticate()
          const expiry = new Date(Date.now() + 3600 * 1000).toISOString()
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

      validateAndTransmit: async (filingId, formType) => {
        const state = get()
        const filing = state.filings.find((f) => f.id === filingId)
        if (!filing) return

        const config = state.taxBanditConfig
        const client = new TaxBanditClient(config)

        // Determine form path
        const effectiveFormType = formType
        const formPath = effectiveFormType
          ? TAXBANDITS_FORM_PATHS[effectiveFormType]
          : null

        // Authenticate if needed
        set({ transmissionStatus: 'validating', transmissionError: null, validationErrors: [] })

        try {
          await client.authenticate()
        } catch (err) {
          set({
            transmissionStatus: 'error',
            transmissionError: err instanceof TaxBanditError ? err.message : 'Authentication failed',
          })
          return
        }

        // Create a submission record if we have a form type
        let localSubmissionId: string | null = null
        if (effectiveFormType) {
          localSubmissionId = get().createSubmission(effectiveFormType, {
            filingId,
            firstName: filing.firstName,
            lastName: filing.lastName,
          })
        }

        try {
          // Step 1: Create business
          set({ transmissionStatus: 'validating' })
          interface BusinessResponse { BusinessId: string }
          const businessResult = await client.fetch<BusinessResponse>('Business/Create', {
            method: 'POST',
            body: {
              BusinessName: `${filing.firstName} ${filing.lastName}`,
              EINOrSSN: filing.ssn,
              BusinessType: 'Individual',
            },
          })
          const businessId = businessResult.BusinessId

          if (localSubmissionId) {
            set((s) => ({
              submissions: s.submissions.map((sub) =>
                sub.id === localSubmissionId
                  ? { ...sub, businessId, updatedAt: new Date().toISOString() }
                  : sub
              ),
            }))
          }

          // Step 2: Create form
          const createPath = formPath ? `${formPath}/Create` : 'Form1040/Create'
          interface CreateFormResponse {
            SubmissionId: string
            Records: Array<{ RecordId: string }>
          }
          const createResult = await client.fetch<CreateFormResponse>(createPath, {
            method: 'POST',
            body: {
              BusinessId: businessId,
              TaxYear: filing.taxYear,
              FirstName: filing.firstName,
              LastName: filing.lastName,
              SSN: filing.ssn,
              FilingStatus: filing.filingStatus,
              Wages: filing.wages,
              OtherIncome: filing.otherIncome,
            },
          })

          const tbSubmissionId = createResult.SubmissionId
          const tbRecordId = createResult.Records?.[0]?.RecordId ?? ''
          set({ submissionId: tbSubmissionId, recordId: tbRecordId })

          if (localSubmissionId) {
            get().setSubmissionTaxBanditIds(localSubmissionId, tbSubmissionId, tbRecordId)
          }

          // Step 3: Validate
          const validatePath = formPath
            ? `${formPath}/Validate?SubmissionId=${encodeURIComponent(tbSubmissionId)}`
            : `Form1040/Validate?SubmissionId=${encodeURIComponent(tbSubmissionId)}`
          interface ValidateResponse {
            Errors: Array<{ Id?: string; Field?: string; Message?: string; Code?: string }> | null
          }
          const validateResult = await client.fetch<ValidateResponse>(validatePath)
          const errors: TaxBanditValidationError[] = validateResult.Errors
            ? validateResult.Errors.map((e) => ({
                id: e.Id ?? generateId(),
                field: e.Field ?? '',
                message: e.Message ?? 'Unknown validation error',
                code: e.Code ?? '',
              }))
            : []

          if (errors.length > 0) {
            set({
              validationErrors: errors,
              transmissionStatus: 'error',
              transmissionError: `Validation failed with ${errors.length} error(s)`,
            })
            if (localSubmissionId) {
              get().setSubmissionErrors(localSubmissionId, errors)
              get().updateSubmissionState(localSubmissionId, FilingState.Rejected)
            }
            return
          }

          // Step 4: Transmit
          set({ transmissionStatus: 'transmitting' })
          const transmitPath = formPath ? `${formPath}/Transmit` : 'Form1040/Transmit'
          await client.fetch(transmitPath, {
            method: 'POST',
            body: { SubmissionId: tbSubmissionId, RecordIds: [tbRecordId] },
          })

          // Update filing state
          const filedAt = new Date().toISOString()
          set((s) => ({
            filings: s.filings.map((f) =>
              f.id === filingId
                ? { ...f, state: FilingState.Filed, filedAt, updatedAt: filedAt }
                : f
            ),
          }))

          if (localSubmissionId) {
            get().updateSubmissionState(localSubmissionId, FilingState.Filed)
          }

          // Step 5: Poll status
          set({ transmissionStatus: 'polling' })
          const refNumber = generateReferenceNumber()
          const statusPath = formPath
            ? `${formPath}/Status?SubmissionId=${encodeURIComponent(tbSubmissionId)}`
            : `Form1040/Status?SubmissionId=${encodeURIComponent(tbSubmissionId)}`

          interface StatusResponse {
            Records: Array<{
              Status: string
              AcknowledgementStatus: string
              IRSErrors: Array<{ ErrorCode: string; ErrorMessage: string }> | null
            }>
          }

          for (let attempt = 0; attempt < 3; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 5000))
            const statusResult = await client.fetch<StatusResponse>(statusPath)
            const record = statusResult.Records?.[0]
            const ackStatus = record?.AcknowledgementStatus?.toLowerCase() ?? ''

            if (ackStatus === 'accepted' || ackStatus === 'rejected') {
              const filingState = ackStatus === 'accepted'
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

              if (localSubmissionId) {
                get().updateSubmissionState(localSubmissionId, filingState)
                const irsErrors = record?.IRSErrors?.map((e) => ({
                  code: e.ErrorCode,
                  message: e.ErrorMessage,
                })) ?? []
                if (irsErrors.length > 0) {
                  get().setSubmissionErrors(localSubmissionId, [], irsErrors)
                }
              }

              if (record?.IRSErrors && record.IRSErrors.length > 0) {
                set({
                  transmissionError: record.IRSErrors
                    .map((e) => `${e.ErrorCode}: ${e.ErrorMessage}`)
                    .join('; '),
                })
              }
              return
            }
          }

          // Polling didn't resolve — mark as complete with Filed status
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
          const errorMessage = err instanceof TaxBanditError
            ? err.errors.map((e) => e.message).join('; ') || err.message
            : err instanceof Error
              ? err.message
              : 'An unexpected error occurred'

          set({
            transmissionStatus: 'error',
            transmissionError: errorMessage,
          })

          if (localSubmissionId) {
            get().updateSubmissionState(localSubmissionId, FilingState.Rejected)
          }
        }
      },

      pollFilingStatus: async (filingId) => {
        const { taxBanditConfig, submissionId: tbSubmissionId } = get()
        if (!tbSubmissionId) return

        const client = new TaxBanditClient(taxBanditConfig)
        try {
          await client.authenticate()
          interface StatusResponse {
            Records: Array<{
              Status: string
              AcknowledgementStatus: string
            }>
          }
          const statusResult = await client.fetch<StatusResponse>(
            `Form1040/Status?SubmissionId=${encodeURIComponent(tbSubmissionId)}`
          )
          const record = statusResult.Records?.[0]
          const ackStatus = record?.AcknowledgementStatus?.toLowerCase() ?? ''

          if (ackStatus === 'accepted' || ackStatus === 'rejected') {
            const filingState = ackStatus === 'accepted'
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
        const { taxBanditConfig, submissionId: tbSubmissionId } = get()
        if (!tbSubmissionId) return

        const client = new TaxBanditClient(taxBanditConfig)
        try {
          await client.authenticate()
          interface PdfResponse { PDFURL: string }
          const result = await client.fetch<PdfResponse>(
            `Form1040/RequestPDFURL?SubmissionId=${encodeURIComponent(tbSubmissionId)}`
          )
          set({ returnPdfUrl: result.PDFURL })
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
            isAmendment: true,
            amendmentReason: reason,
          },
          isAmendmentMode: false,
          amendmentReason: '',
        }))

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

      // ─── Confirmation / Clear ───────────────────────────────────────────

      clearConfirmation: () =>
        set({ confirmation: null }),

      clearData: () => {
        set({
          filings: [],
          submissions: [],
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
      name: 'orchestree-tax-filing-storage',
      partialize: (state) => ({
        filings: state.filings,
        checklist: state.checklist,
        confirmation: state.confirmation,
        taxBanditConfig: state.taxBanditConfig,
        submissions: state.submissions,
      }),
    }
  )
)
