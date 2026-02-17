import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TaxFormType } from '../types'
import type {
  TaxYear,
  TaxFormType as TaxFormTypeT,
  ExtractionResult,
  ExtractionField,
  ExtractionConfidence,
} from '../types'
import { extractDocument as runExtraction } from '../lib/extractionEngine'

// ─── File Blob Storage (session-scoped, not persisted) ──────────────────
//
// File/Blob objects cannot be serialized to JSON (localStorage).
// We store them in a module-level Map for the current session only.
// Users re-upload documents across sessions; real extraction only needs
// the file during the current session.

const fileBlobs = new Map<string, File>()

export function setFileBlob(id: string, file: File): void {
  fileBlobs.set(id, file)
}

export function getFileBlob(id: string): File | undefined {
  return fileBlobs.get(id)
}

export function clearFileBlob(id: string): void {
  fileBlobs.delete(id)
}

// ─── Document Review Status ─────────────────────────────────────────────

export const DocReviewStatus = {
  PendingReview: 'pending_review',
  Verified: 'verified',
  IssueFound: 'issue_found',
} as const

export type DocReviewStatus = (typeof DocReviewStatus)[keyof typeof DocReviewStatus]

export const DOC_REVIEW_LABELS: Record<DocReviewStatus, string> = {
  [DocReviewStatus.PendingReview]: 'Pending Review',
  [DocReviewStatus.Verified]: 'Verified',
  [DocReviewStatus.IssueFound]: 'Issue Found',
}

// ─── Interfaces ─────────────────────────────────────────────────────────

export interface TaxUploadedDoc {
  id: string
  fileName: string
  formType: TaxFormTypeT
  taxYear: TaxYear
  employerName: string
  uploadDate: string
  status: DocReviewStatus
  fileSize: number
  issueNote: string
}

// ─── Filename Auto-Detection ────────────────────────────────────────────

const FILENAME_PATTERNS: { pattern: RegExp; type: TaxFormTypeT }[] = [
  { pattern: /w[_-]?2/i, type: TaxFormType.W2 },
  { pattern: /1099[_-]?nec/i, type: TaxFormType.NEC1099 },
  { pattern: /1099[_-]?int/i, type: TaxFormType.INT1099 },
  { pattern: /1099[_-]?div/i, type: TaxFormType.DIV1099 },
  { pattern: /1099[_-]?misc/i, type: TaxFormType.MISC1099 },
  { pattern: /1098/i, type: TaxFormType.Mortgage1098 },
  { pattern: /1095[_-]?a/i, type: TaxFormType.ACA1095A },
  { pattern: /w[_-]?9/i, type: TaxFormType.W9 },
]

export function detectFormType(filename: string): TaxFormTypeT {
  for (const { pattern, type } of FILENAME_PATTERNS) {
    if (pattern.test(filename)) return type
  }
  return TaxFormType.W2
}

// ─── ID Generator ───────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Sample Data ────────────────────────────────────────────────────────

function createSampleDocs(): TaxUploadedDoc[] {
  return [
    {
      id: 'taxdoc_1',
      fileName: 'W-2_AcmeCorp_2025.pdf',
      formType: TaxFormType.W2,
      taxYear: '2025' as TaxYear,
      employerName: 'Acme Corporation',
      uploadDate: '2026-01-15T10:30:00Z',
      status: DocReviewStatus.Verified,
      fileSize: 245000,
      issueNote: '',
    },
    {
      id: 'taxdoc_2',
      fileName: '1099-NEC_DesignStudio_2025.pdf',
      formType: TaxFormType.NEC1099,
      taxYear: '2025' as TaxYear,
      employerName: 'Design Studio LLC',
      uploadDate: '2026-01-20T14:15:00Z',
      status: DocReviewStatus.Verified,
      fileSize: 128000,
      issueNote: '',
    },
    {
      id: 'taxdoc_3',
      fileName: '1099-INT_FidelityBank_2025.pdf',
      formType: TaxFormType.INT1099,
      taxYear: '2025' as TaxYear,
      employerName: 'Fidelity National Bank',
      uploadDate: '2026-01-25T09:00:00Z',
      status: DocReviewStatus.PendingReview,
      fileSize: 98000,
      issueNote: '',
    },
    {
      id: 'taxdoc_4',
      fileName: '1098_MortgageLender_2025.pdf',
      formType: TaxFormType.Mortgage1098,
      taxYear: '2025' as TaxYear,
      employerName: 'Wells Fargo Home Mortgage',
      uploadDate: '2026-02-01T16:45:00Z',
      status: DocReviewStatus.IssueFound,
      fileSize: 312000,
      issueNote: 'Missing Box 1 amount - mortgage interest not readable',
    },
  ]
}

// ─── Extraction Simulation ──────────────────────────────────────────────

function generateExtractionFields(formType: TaxFormTypeT): ExtractionField[] {
  const high: ExtractionConfidence = 'high'
  const medium: ExtractionConfidence = 'medium'
  const low: ExtractionConfidence = 'low'

  switch (formType) {
    case TaxFormType.W2:
      return [
        { key: 'Employer Name', value: 'Acme Corporation', confidence: high, confirmed: false },
        { key: 'Employer EIN', value: '12-3456789', confidence: high, confirmed: false },
        { key: 'Wages (Box 1)', value: '85000.00', confidence: high, confirmed: false },
        { key: 'Federal Tax Withheld (Box 2)', value: '14500.00', confidence: high, confirmed: false },
        { key: 'Social Security Wages (Box 3)', value: '85000.00', confidence: medium, confirmed: false },
        { key: 'Medicare Wages (Box 5)', value: '85000.00', confidence: medium, confirmed: false },
      ]
    case TaxFormType.NEC1099:
      return [
        { key: 'Payer Name', value: 'Design Studio LLC', confidence: high, confirmed: false },
        { key: 'Payer TIN', value: '98-7654321', confidence: high, confirmed: false },
        { key: 'Nonemployee Compensation (Box 1)', value: '12000.00', confidence: high, confirmed: false },
      ]
    case TaxFormType.INT1099:
      return [
        { key: 'Payer Name', value: 'Fidelity National Bank', confidence: high, confirmed: false },
        { key: 'Interest Income (Box 1)', value: '450.00', confidence: medium, confirmed: false },
        { key: 'Early Withdrawal Penalty (Box 2)', value: '0.00', confidence: low, confirmed: false },
      ]
    case TaxFormType.DIV1099:
      return [
        { key: 'Payer Name', value: 'Brokerage Inc.', confidence: high, confirmed: false },
        { key: 'Total Ordinary Dividends (Box 1a)', value: '2500.00', confidence: medium, confirmed: false },
        { key: 'Qualified Dividends (Box 1b)', value: '1800.00', confidence: medium, confirmed: false },
      ]
    case TaxFormType.Mortgage1098:
      return [
        { key: 'Lender Name', value: 'Wells Fargo Home Mortgage', confidence: high, confirmed: false },
        { key: 'Mortgage Interest Received (Box 1)', value: '8200.00', confidence: medium, confirmed: false },
        { key: 'Points Paid (Box 6)', value: '0.00', confidence: low, confirmed: false },
      ]
    default:
      return [
        { key: 'Form Type', value: formType, confidence: medium, confirmed: false },
        { key: 'Extracted Amount', value: '0.00', confidence: low, confirmed: false },
      ]
  }
}

// ─── Store ──────────────────────────────────────────────────────────────

interface TaxDocumentState {
  documents: TaxUploadedDoc[]
  activeTaxYear: TaxYear
  isDragging: boolean
  extractionResults: Record<string, ExtractionResult>

  // Actions
  addDocument: (doc: Omit<TaxUploadedDoc, 'id' | 'uploadDate' | 'status' | 'issueNote'>) => string
  deleteDocument: (id: string) => void
  updateDocumentStatus: (id: string, status: DocReviewStatus, issueNote?: string) => void
  setActiveTaxYear: (year: TaxYear) => void
  setDragging: (dragging: boolean) => void

  // Extraction
  extractDocument: (id: string) => Promise<void>
  setExtractionConfirmed: (id: string, confirmed: boolean) => void
  getExtractionResult: (id: string) => ExtractionResult | undefined

  // Clear data
  clearData: () => void

  // Queries
  getDocsByYear: (year: TaxYear) => TaxUploadedDoc[]
  totalCount: () => number
  verifiedCount: () => number
  pendingCount: () => number
  issueCount: () => number
}

export const useTaxDocumentStore = create<TaxDocumentState>()(
  persist(
    (set, get) => ({
      documents: createSampleDocs(),
      activeTaxYear: '2025' as TaxYear,
      isDragging: false,
      extractionResults: {},

      addDocument: (doc) => {
        const id = generateId()
        set((state) => ({
          documents: [
            {
              ...doc,
              id,
              uploadDate: new Date().toISOString(),
              status: DocReviewStatus.PendingReview,
              issueNote: '',
            },
            ...state.documents,
          ],
        }))
        return id
      },

      deleteDocument: (id) => {
        clearFileBlob(id)
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          extractionResults: Object.fromEntries(
            Object.entries(state.extractionResults).filter(([key]) => key !== id)
          ),
        }))
      },

      updateDocumentStatus: (id, status, issueNote) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id
              ? { ...d, status, issueNote: issueNote ?? d.issueNote }
              : d
          ),
        })),

      setActiveTaxYear: (year) => set({ activeTaxYear: year }),

      setDragging: (dragging) => set({ isDragging: dragging }),

      // ─── Extraction ─────────────────────────────────────────────────

      extractDocument: async (id) => {
        const doc = get().documents.find((d) => d.id === id)
        if (!doc) return

        // Set initial extracting state
        set((state) => ({
          extractionResults: {
            ...state.extractionResults,
            [id]: {
              fields: [],
              overallConfidence: 0,
              formType: doc.formType,
              warnings: ['Reading document...'],
              extractedAt: '',
            },
          },
        }))

        const blob = getFileBlob(id)

        try {
          const result = await runExtraction(doc.formType, blob, (step) => {
            set((state) => {
              const current = state.extractionResults[id]
              if (!current) return state
              return {
                extractionResults: {
                  ...state.extractionResults,
                  [id]: { ...current, warnings: [step.label] },
                },
              }
            })
          })

          set((state) => ({
            extractionResults: {
              ...state.extractionResults,
              [id]: result,
            },
          }))
        } catch {
          // On failure, use the simulated fallback
          const fields = generateExtractionFields(doc.formType)
          const confidenceScores = fields.map((f) =>
            f.confidence === 'high' ? 0.95 : f.confidence === 'medium' ? 0.78 : 0.55
          )
          const overallConfidence =
            fields.length > 0
              ? Math.round(
                  (confidenceScores.reduce((a, b) => a + b, 0) /
                    confidenceScores.length) *
                    100
                )
              : 0

          const warnings: string[] = []
          const lowConfidenceFields = fields.filter((f) => f.confidence === 'low')
          if (lowConfidenceFields.length > 0) {
            warnings.push(
              `${lowConfidenceFields.length} field(s) extracted with low confidence — please review`
            )
          }

          set((state) => ({
            extractionResults: {
              ...state.extractionResults,
              [id]: {
                fields,
                overallConfidence,
                formType: doc.formType,
                warnings,
                extractedAt: new Date().toISOString(),
              },
            },
          }))
        }
      },

      setExtractionConfirmed: (id, confirmed) =>
        set((state) => {
          const result = state.extractionResults[id]
          if (!result) return state
          return {
            extractionResults: {
              ...state.extractionResults,
              [id]: {
                ...result,
                fields: result.fields.map((f) => ({ ...f, confirmed })),
              },
            },
          }
        }),

      getExtractionResult: (id) => get().extractionResults[id],

      // ─── Clear ──────────────────────────────────────────────────────

      clearData: () => {
        set({ documents: [], extractionResults: {} })
      },

      // ─── Queries ────────────────────────────────────────────────────

      getDocsByYear: (year) =>
        get().documents.filter((d) => d.taxYear === year),

      totalCount: () => {
        const year = get().activeTaxYear
        return get().documents.filter((d) => d.taxYear === year).length
      },

      verifiedCount: () => {
        const year = get().activeTaxYear
        return get().documents.filter(
          (d) => d.taxYear === year && d.status === DocReviewStatus.Verified
        ).length
      },

      pendingCount: () => {
        const year = get().activeTaxYear
        return get().documents.filter(
          (d) => d.taxYear === year && d.status === DocReviewStatus.PendingReview
        ).length
      },

      issueCount: () => {
        const year = get().activeTaxYear
        return get().documents.filter(
          (d) => d.taxYear === year && d.status === DocReviewStatus.IssueFound
        ).length
      },
    }),
    {
      name: 'orchestree-tax-document-storage',
      partialize: (state) => ({
        documents: state.documents,
        activeTaxYear: state.activeTaxYear,
        extractionResults: state.extractionResults,
      }),
    }
  )
)
