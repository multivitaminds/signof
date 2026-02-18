import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createEncryptedStorage } from '../lib/encryptedStorage'
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
  TaxFormType as TaxFormTypeValues,
  TAXBANDITS_FORM_PATHS,
} from '../types'
import { TaxBanditClient, TaxBanditError } from '../lib/taxBanditClient'
import {
  createBusinessService,
  createFormW2Service,
  createForm1099NecService,
  createForm1099MiscService,
  createForm1099IntService,
  createForm1099DivService,
  createForm1099RService,
  createForm1099KService,
  createForm1098Service,
  createForm1098EService,
  createForm1098TService,
  createForm941Service,
  createForm940Service,
  createForm1095cService,
  buildFormW2Payload,
  buildForm1099NecPayload,
  buildForm1099MiscPayload,
  buildForm1099IntPayload,
  buildForm1099DivPayload,
  buildForm1099RPayload,
  buildForm1099KPayload,
  buildForm1098Payload,
  buildForm1098EPayload,
  buildForm1098TPayload,
  type FormService,
} from '../lib/api'
import type { FormW2Payload } from '../lib/api/formW2Service'
import type { Form1099NecPayload } from '../lib/api/form1099NecService'
import type { Form1099MiscPayload } from '../lib/api/form1099MiscService'
import type { Form1099IntPayload } from '../lib/api/form1099IntService'
import type { Form1099DivPayload } from '../lib/api/form1099DivService'
import type { Form1099RPayload } from '../lib/api/form1099RService'
import type { Form1099KPayload } from '../lib/api/form1099KService'
import type { Form1098Payload } from '../lib/api/form1098Service'
import type { Form1098EPayload } from '../lib/api/form1098EService'
import type { Form1098TPayload } from '../lib/api/form1098TService'
import type { Form941Payload } from '../lib/api/form941Service'
import type { Form940Payload } from '../lib/api/form940Service'
import type { Form1095cPayload } from '../lib/api/form1095cService'
import {
  filingToBusinessData,
  extractionToW2Employee,
  extractionTo1099NecRecipient,
  extractionTo1099MiscRecipient,
  extractionTo1099IntRecipient,
  extractionTo1099DivRecipient,
  extractionTo1099RRecipient,
  extractionTo1099KRecipient,
  extractionTo1098Recipient,
} from '../lib/extractionToPayload'
import type { ExtractionField } from '../types'
import { useTaxDocumentStore } from './useTaxDocumentStore'

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

// ─── Form Pipeline Router ───────────────────────────────────────────────
//
// Selects the right service factory and payload builder based on form type.

type FormPipelineService =
  | FormService<FormW2Payload>
  | FormService<Form1099NecPayload>
  | FormService<Form1099MiscPayload>
  | FormService<Form1099IntPayload>
  | FormService<Form1099DivPayload>
  | FormService<Form1099RPayload>
  | FormService<Form1099KPayload>
  | FormService<Form1098Payload>
  | FormService<Form1098EPayload>
  | FormService<Form1098TPayload>
  | FormService<Form941Payload>
  | FormService<Form940Payload>
  | FormService<Form1095cPayload>

interface FormPipeline {
  service: FormPipelineService
  formPath: string
}

function getFormPipeline(
  client: TaxBanditClient,
  formType: TaxFormType
): FormPipeline | null {
  switch (formType) {
    case TaxFormTypeValues.W2:
      return { service: createFormW2Service(client), formPath: 'FormW2' }
    case TaxFormTypeValues.NEC1099:
      return { service: createForm1099NecService(client), formPath: 'Form1099NEC' }
    case TaxFormTypeValues.MISC1099:
      return { service: createForm1099MiscService(client), formPath: 'Form1099MISC' }
    case TaxFormTypeValues.INT1099:
      return { service: createForm1099IntService(client), formPath: 'Form1099INT' }
    case TaxFormTypeValues.DIV1099:
      return { service: createForm1099DivService(client), formPath: 'Form1099DIV' }
    case TaxFormTypeValues.R1099:
      return { service: createForm1099RService(client), formPath: 'Form1099R' }
    case TaxFormTypeValues.K1099:
      return { service: createForm1099KService(client), formPath: 'Form1099K' }
    case TaxFormTypeValues.Mortgage1098:
      return { service: createForm1098Service(client), formPath: 'Form1098' }
    case TaxFormTypeValues.E1098:
      return { service: createForm1098EService(client), formPath: 'Form1098E' }
    case TaxFormTypeValues.T1098:
      return { service: createForm1098TService(client), formPath: 'Form1098T' }
    case TaxFormTypeValues.F941:
      return { service: createForm941Service(client), formPath: 'Form941' }
    case TaxFormTypeValues.F940:
      return { service: createForm940Service(client), formPath: 'Form940' }
    case TaxFormTypeValues.ACA1095C:
      return { service: createForm1095cService(client), formPath: 'Form1095C' }
    default:
      return null
  }
}

function buildPayloadForType(
  formType: TaxFormType,
  fields: ExtractionField[],
  filing: TaxFiling,
  businessId: string
): unknown | null {
  const year = filing.taxYear
  switch (formType) {
    case TaxFormTypeValues.W2:
      return buildFormW2Payload({
        taxYear: year,
        businessId,
        employees: [extractionToW2Employee(fields, filing)],
      })
    case TaxFormTypeValues.NEC1099:
      return buildForm1099NecPayload({
        taxYear: year,
        businessId,
        recipients: [extractionTo1099NecRecipient(fields, filing)],
      })
    case TaxFormTypeValues.MISC1099:
      return buildForm1099MiscPayload({
        taxYear: year,
        businessId,
        recipients: [extractionTo1099MiscRecipient(fields, filing)],
      })
    case TaxFormTypeValues.INT1099:
      return buildForm1099IntPayload({
        taxYear: year,
        businessId,
        recipients: [extractionTo1099IntRecipient(fields, filing)],
      })
    case TaxFormTypeValues.DIV1099:
      return buildForm1099DivPayload({
        taxYear: year,
        businessId,
        recipients: [extractionTo1099DivRecipient(fields, filing)],
      })
    case TaxFormTypeValues.R1099:
      return buildForm1099RPayload({
        taxYear: year,
        businessId,
        recipients: [extractionTo1099RRecipient(fields, filing)],
      })
    case TaxFormTypeValues.K1099:
      return buildForm1099KPayload({
        taxYear: year,
        businessId,
        recipients: [extractionTo1099KRecipient(fields, filing)],
      })
    case TaxFormTypeValues.Mortgage1098:
      return buildForm1098Payload({
        taxYear: year,
        businessId,
        recipients: [extractionTo1098Recipient(fields, filing)],
      })
    case TaxFormTypeValues.E1098:
      return buildForm1098EPayload({
        taxYear: year,
        businessId,
        recipients: [{
          tin: filing.ssn.replace(/[^\d]/g, ''),
          name: `${filing.firstName} ${filing.lastName}`.trim(),
          address1: filing.address.street,
          address2: filing.address.apt || undefined,
          city: filing.address.city,
          state: filing.address.state,
          zip: filing.address.zip,
          studentLoanInterest: filing.otherIncome,
        }],
      })
    case TaxFormTypeValues.T1098:
      return buildForm1098TPayload({
        taxYear: year,
        businessId,
        recipients: [{
          tin: filing.ssn.replace(/[^\d]/g, ''),
          name: `${filing.firstName} ${filing.lastName}`.trim(),
          address1: filing.address.street,
          address2: filing.address.apt || undefined,
          city: filing.address.city,
          state: filing.address.state,
          zip: filing.address.zip,
        }],
      })
    default:
      return null
  }
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
  lastFormType: TaxFormType | null
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

  // Bulk filing
  bulkSubmitForms: (formType: TaxFormType, documentIds: string[]) => Promise<{ submitted: number; errors: string[] }>

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
      lastFormType: null,
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
        const effectiveFormType = formType ?? TaxFormTypeValues.W2

        // Authenticate
        set({ transmissionStatus: 'validating', transmissionError: null, validationErrors: [], lastFormType: effectiveFormType })

        try {
          await client.authenticate()
        } catch (err) {
          set({
            transmissionStatus: 'error',
            transmissionError: err instanceof TaxBanditError ? err.message : 'Authentication failed',
          })
          return
        }

        // Create a local submission record
        const localSubmissionId = get().createSubmission(effectiveFormType, {
          filingId,
          firstName: filing.firstName,
          lastName: filing.lastName,
        })

        try {
          // Step 1: Create business via businessService
          set({ transmissionStatus: 'validating' })
          const businessService = createBusinessService(client)
          const businessData = filingToBusinessData(filing)
          const businessId = await businessService.create(businessData)

          set((s) => ({
            submissions: s.submissions.map((sub) =>
              sub.id === localSubmissionId
                ? { ...sub, businessId, updatedAt: new Date().toISOString() }
                : sub
            ),
          }))

          // Step 2: Build payload using form-specific builders + extraction data
          const pipeline = getFormPipeline(client, effectiveFormType)

          // Gather extraction data from document store
          const docStore = useTaxDocumentStore.getState()
          const yearDocs = docStore.documents.filter((d) => d.taxYear === filing.taxYear)
          const formDocs = yearDocs.filter((d) => d.formType === effectiveFormType)
          const extractionFields = formDocs.flatMap((doc) => {
            const extraction = docStore.extractionResults[doc.id]
            if (!extraction?.extractedAt) return []
            return extraction.fields
          })

          let tbSubmissionId: string
          let tbRecordId: string

          const payload = buildPayloadForType(effectiveFormType, extractionFields, filing, businessId)

          if (pipeline && payload) {
            // Use form-specific pipeline with typed payload
            const service = pipeline.service as FormService<unknown>
            const result = await service.create(payload)
            tbSubmissionId = result.submissionId
            tbRecordId = result.recordId
          } else {
            // Unsupported form type — use generic form service
            const genericFormPath = TAXBANDITS_FORM_PATHS[effectiveFormType] ?? 'FormW2'
            const result = await client.fetch<{ SubmissionId: string; Records: Array<{ RecordId: string }> }>(
              `${genericFormPath}/Create`,
              {
                method: 'POST',
                body: {
                  SubmissionManifest: { TaxYear: filing.taxYear, IsFederalFiling: true, IsStateFiling: false },
                  ReturnHeader: { Business: { BusinessId: businessId } },
                },
              }
            )
            tbSubmissionId = result.SubmissionId
            tbRecordId = result.Records?.[0]?.RecordId ?? ''
          }

          set({ submissionId: tbSubmissionId, recordId: tbRecordId })
          get().setSubmissionTaxBanditIds(localSubmissionId, tbSubmissionId, tbRecordId)

          // Step 3: Validate via form service
          const formPath = TAXBANDITS_FORM_PATHS[effectiveFormType]
          let errors: TaxBanditValidationError[]

          if (pipeline) {
            errors = await pipeline.service.validate(tbSubmissionId)
          } else {
            const validatePath = formPath
              ? `${formPath}/Validate?SubmissionId=${encodeURIComponent(tbSubmissionId)}`
              : `FormW2/Validate?SubmissionId=${encodeURIComponent(tbSubmissionId)}`
            const validateResult = await client.fetch<{ Errors: Array<{ Id?: string; Field?: string; Message?: string; Code?: string }> | null }>(validatePath)
            errors = validateResult.Errors
              ? validateResult.Errors.map((e) => ({
                  id: e.Id ?? generateId(),
                  field: e.Field ?? '',
                  message: e.Message ?? 'Unknown validation error',
                  code: e.Code ?? '',
                }))
              : []
          }

          if (errors.length > 0) {
            set({
              validationErrors: errors,
              transmissionStatus: 'error',
              transmissionError: `Validation failed with ${errors.length} error(s)`,
            })
            get().setSubmissionErrors(localSubmissionId, errors)
            get().updateSubmissionState(localSubmissionId, FilingState.Rejected)
            return
          }

          // Step 4: Transmit via form service
          set({ transmissionStatus: 'transmitting' })

          if (pipeline) {
            await pipeline.service.transmit(tbSubmissionId, [tbRecordId])
          } else {
            const transmitPath = formPath ? `${formPath}/Transmit` : 'FormW2/Transmit'
            await client.fetch(transmitPath, {
              method: 'POST',
              body: { SubmissionId: tbSubmissionId, RecordIds: [tbRecordId] },
            })
          }

          // Update filing state
          const filedAt = new Date().toISOString()
          set((s) => ({
            filings: s.filings.map((f) =>
              f.id === filingId
                ? { ...f, state: FilingState.Filed, filedAt, updatedAt: filedAt }
                : f
            ),
          }))
          get().updateSubmissionState(localSubmissionId, FilingState.Filed)

          // Step 5: Poll status via form service
          set({ transmissionStatus: 'polling' })
          const refNumber = generateReferenceNumber()

          for (let attempt = 0; attempt < 3; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 5000))

            let statusResult: { status: string; acknowledgementStatus: string; irsErrors: Array<{ code: string; message: string }> }

            if (pipeline) {
              statusResult = await pipeline.service.getStatus(tbSubmissionId)
            } else {
              const statusPath = formPath
                ? `${formPath}/Status?SubmissionId=${encodeURIComponent(tbSubmissionId)}`
                : `FormW2/Status?SubmissionId=${encodeURIComponent(tbSubmissionId)}`
              const raw = await client.fetch<{
                Records: Array<{
                  Status: string
                  AcknowledgementStatus: string
                  IRSErrors: Array<{ ErrorCode: string; ErrorMessage: string }> | null
                }>
              }>(statusPath)
              const record = raw.Records?.[0]
              statusResult = {
                status: record?.Status ?? 'Unknown',
                acknowledgementStatus: record?.AcknowledgementStatus ?? 'Pending',
                irsErrors: record?.IRSErrors?.map((e) => ({ code: e.ErrorCode, message: e.ErrorMessage })) ?? [],
              }
            }

            const ackStatus = statusResult.acknowledgementStatus.toLowerCase()

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

              get().updateSubmissionState(localSubmissionId, filingState)
              if (statusResult.irsErrors.length > 0) {
                get().setSubmissionErrors(localSubmissionId, [], statusResult.irsErrors)
                set({
                  transmissionError: statusResult.irsErrors
                    .map((e) => `${e.code}: ${e.message}`)
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

          get().updateSubmissionState(localSubmissionId, FilingState.Rejected)
        }
      },

      pollFilingStatus: async (filingId) => {
        const { taxBanditConfig, submissionId: tbSubmissionId, lastFormType } = get()
        if (!tbSubmissionId) return

        const client = new TaxBanditClient(taxBanditConfig)
        try {
          await client.authenticate()

          const pipeline = lastFormType ? getFormPipeline(client, lastFormType) : null

          if (pipeline) {
            const statusResult = await pipeline.service.getStatus(tbSubmissionId)
            const ackStatus = statusResult.acknowledgementStatus.toLowerCase()

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
          } else {
            const formPath = lastFormType ? TAXBANDITS_FORM_PATHS[lastFormType] : null
            const statusPath = formPath
              ? `${formPath}/Status?SubmissionId=${encodeURIComponent(tbSubmissionId)}`
              : `FormW2/Status?SubmissionId=${encodeURIComponent(tbSubmissionId)}`

            const statusResult = await client.fetch<{
              Records: Array<{ Status: string; AcknowledgementStatus: string }>
            }>(statusPath)
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
          }
        } catch {
          // Silently fail — user can retry
        }
      },

      downloadReturnPdf: async () => {
        const { taxBanditConfig, submissionId: tbSubmissionId, lastFormType } = get()
        if (!tbSubmissionId) return

        const client = new TaxBanditClient(taxBanditConfig)
        try {
          await client.authenticate()

          const pipeline = lastFormType ? getFormPipeline(client, lastFormType) : null

          if (pipeline) {
            const pdfUrl = await pipeline.service.getPdf(tbSubmissionId)
            set({ returnPdfUrl: pdfUrl })
          } else {
            const formPath = lastFormType ? TAXBANDITS_FORM_PATHS[lastFormType] : null
            const pdfPath = formPath
              ? `${formPath}/RequestPDFURL?SubmissionId=${encodeURIComponent(tbSubmissionId)}`
              : `FormW2/RequestPDFURL?SubmissionId=${encodeURIComponent(tbSubmissionId)}`

            const result = await client.fetch<{ PDFURL: string }>(pdfPath)
            set({ returnPdfUrl: result.PDFURL })
          }
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

      // ─── Bulk Filing ────────────────────────────────────────────────────

      bulkSubmitForms: async (formType, documentIds) => {
        const state = get()
        const config = state.taxBanditConfig
        const errors: string[] = []
        let submitted = 0

        // Get the active filing for context (personal info, tax year)
        const filing = state.filings[0]
        if (!filing) {
          return { submitted: 0, errors: ['No filing found. Create a filing first.'] }
        }

        // If TaxBandit credentials are available, use API
        if (hasCredentials(config) && state.accessToken) {
          const client = new TaxBanditClient(config)

          try {
            await client.authenticate()
            const businessService = createBusinessService(client)
            const businessData = filingToBusinessData(filing)
            const businessId = await businessService.create(businessData)
            const pipeline = getFormPipeline(client, formType)

            if (!pipeline) {
              return { submitted: 0, errors: [`Unsupported form type: ${formType}`] }
            }

            const docStore = useTaxDocumentStore.getState()

            for (const docId of documentIds) {
              try {
                const doc = docStore.documents.find((d) => d.id === docId)
                if (!doc) {
                  errors.push(`Document ${docId} not found`)
                  continue
                }

                const extraction = docStore.extractionResults[docId]
                if (!extraction?.extractedAt) {
                  errors.push(`Document ${doc.fileName} has no extraction data`)
                  continue
                }

                const payload = buildPayloadForType(formType, extraction.fields, filing, businessId)
                if (!payload) {
                  errors.push(`Could not build payload for ${doc.fileName}`)
                  continue
                }

                const localSubId = get().createSubmission(formType, { documentId: docId, fileName: doc.fileName })
                const service = pipeline.service as FormService<unknown>
                const result = await service.create(payload)
                get().setSubmissionTaxBanditIds(localSubId, result.submissionId, result.recordId)

                const valErrors = await pipeline.service.validate(result.submissionId)
                if (valErrors.length > 0) {
                  get().setSubmissionErrors(localSubId, valErrors)
                  errors.push(`${doc.fileName}: ${valErrors.length} validation error(s)`)
                  continue
                }

                await pipeline.service.transmit(result.submissionId, [result.recordId])
                get().updateSubmissionState(localSubId, FilingState.Filed)
                submitted++
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error'
                errors.push(`${docId}: ${msg}`)
              }
            }
          } catch (err) {
            const msg = err instanceof TaxBanditError ? err.message : 'Authentication failed'
            return { submitted: 0, errors: [msg] }
          }
        } else {
          // Simulated bulk filing (no API credentials)
          for (const docId of documentIds) {
            const docStore = useTaxDocumentStore.getState()
            const doc = docStore.documents.find((d) => d.id === docId)
            if (!doc) {
              errors.push(`Document ${docId} not found`)
              continue
            }

            const localSubId = get().createSubmission(formType, { documentId: docId, fileName: doc.fileName })

            // Simulate success
            setTimeout(() => {
              get().updateSubmissionState(localSubId, FilingState.Filed)
              setTimeout(() => {
                get().updateSubmissionState(localSubId, FilingState.Accepted)
              }, 3000)
            }, 1000)

            submitted++
          }
        }

        return { submitted, errors }
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
          lastFormType: null,
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
      storage: createJSONStorage(() => createEncryptedStorage()),
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
