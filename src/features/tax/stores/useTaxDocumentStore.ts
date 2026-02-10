import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TaxFormType } from '../types'
import type { TaxYear } from '../types'

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
  formType: TaxFormType
  taxYear: TaxYear
  employerName: string
  uploadDate: string
  status: DocReviewStatus
  fileSize: number
  issueNote: string
}

// ─── Filename Auto-Detection ────────────────────────────────────────────

const FILENAME_PATTERNS: { pattern: RegExp; type: TaxFormType }[] = [
  { pattern: /w[_-]?2/i, type: TaxFormType.W2 },
  { pattern: /1099[_-]?nec/i, type: TaxFormType.NEC1099 },
  { pattern: /1099[_-]?int/i, type: TaxFormType.INT1099 },
  { pattern: /1099[_-]?div/i, type: TaxFormType.DIV1099 },
  { pattern: /1099[_-]?misc/i, type: TaxFormType.MISC1099 },
  { pattern: /1098/i, type: TaxFormType.Mortgage1098 },
  { pattern: /1095[_-]?a/i, type: TaxFormType.ACA1095A },
  { pattern: /w[_-]?9/i, type: TaxFormType.W9 },
]

export function detectFormType(filename: string): TaxFormType {
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

// ─── Store ──────────────────────────────────────────────────────────────

interface TaxDocumentState {
  documents: TaxUploadedDoc[]
  activeTaxYear: TaxYear
  isDragging: boolean

  // Actions
  addDocument: (doc: Omit<TaxUploadedDoc, 'id' | 'uploadDate' | 'status' | 'issueNote'>) => void
  deleteDocument: (id: string) => void
  updateDocumentStatus: (id: string, status: DocReviewStatus, issueNote?: string) => void
  setActiveTaxYear: (year: TaxYear) => void
  setDragging: (dragging: boolean) => void

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

      addDocument: (doc) =>
        set((state) => ({
          documents: [
            {
              ...doc,
              id: generateId(),
              uploadDate: new Date().toISOString(),
              status: DocReviewStatus.PendingReview,
              issueNote: '',
            },
            ...state.documents,
          ],
        })),

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

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
      name: 'signof-tax-document-storage',
      partialize: (state) => ({
        documents: state.documents,
        activeTaxYear: state.activeTaxYear,
      }),
    }
  )
)
