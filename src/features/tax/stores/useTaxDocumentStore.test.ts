import { useTaxDocumentStore, DocReviewStatus, detectFormType } from './useTaxDocumentStore'
import { TaxFormType } from '../types'
import type { TaxYear } from '../types'

function resetStore() {
  useTaxDocumentStore.setState({
    documents: [],
    activeTaxYear: '2025' as TaxYear,
    isDragging: false,
    extractionResults: {},
  })
}

describe('useTaxDocumentStore', () => {
  beforeEach(() => {
    resetStore()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('addDocument', () => {
    it('adds a document with auto-generated id, upload date, and pending status', () => {
      useTaxDocumentStore.getState().addDocument({
        fileName: 'W-2_Test.pdf',
        formType: TaxFormType.W2,
        taxYear: '2025' as TaxYear,
        employerName: 'Test Corp',
        fileSize: 100000,
      })

      const { documents } = useTaxDocumentStore.getState()
      expect(documents).toHaveLength(1)
      expect(documents[0]!.fileName).toBe('W-2_Test.pdf')
      expect(documents[0]!.id).toBeTruthy()
      expect(documents[0]!.uploadDate).toBeTruthy()
      expect(documents[0]!.status).toBe(DocReviewStatus.PendingReview)
      expect(documents[0]!.issueNote).toBe('')
    })

    it('prepends new documents to the beginning of the list', () => {
      useTaxDocumentStore.getState().addDocument({
        fileName: 'first.pdf',
        formType: TaxFormType.W2,
        taxYear: '2025' as TaxYear,
        employerName: 'First',
        fileSize: 100,
      })
      useTaxDocumentStore.getState().addDocument({
        fileName: 'second.pdf',
        formType: TaxFormType.NEC1099,
        taxYear: '2025' as TaxYear,
        employerName: 'Second',
        fileSize: 200,
      })

      const { documents } = useTaxDocumentStore.getState()
      expect(documents[0]!.fileName).toBe('second.pdf')
      expect(documents[1]!.fileName).toBe('first.pdf')
    })
  })

  describe('deleteDocument', () => {
    it('removes a document by id', () => {
      useTaxDocumentStore.setState({
        documents: [
          { id: 'doc-1', fileName: 'test.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: 'Corp', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
        ],
      })

      useTaxDocumentStore.getState().deleteDocument('doc-1')
      expect(useTaxDocumentStore.getState().documents).toHaveLength(0)
    })

    it('also removes associated extraction results', () => {
      useTaxDocumentStore.setState({
        documents: [
          { id: 'doc-1', fileName: 'test.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: 'Corp', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
        ],
        extractionResults: {
          'doc-1': { fields: [], overallConfidence: 90, formType: TaxFormType.W2, warnings: [], extractedAt: '' },
        },
      })

      useTaxDocumentStore.getState().deleteDocument('doc-1')
      expect(useTaxDocumentStore.getState().extractionResults).toEqual({})
    })
  })

  describe('updateDocumentStatus', () => {
    it('updates the status of a document', () => {
      useTaxDocumentStore.setState({
        documents: [
          { id: 'doc-1', fileName: 'test.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: 'Corp', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
        ],
      })

      useTaxDocumentStore.getState().updateDocumentStatus('doc-1', DocReviewStatus.Verified)
      expect(useTaxDocumentStore.getState().documents[0]!.status).toBe(DocReviewStatus.Verified)
    })

    it('updates issue note when provided', () => {
      useTaxDocumentStore.setState({
        documents: [
          { id: 'doc-1', fileName: 'test.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: 'Corp', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
        ],
      })

      useTaxDocumentStore.getState().updateDocumentStatus('doc-1', DocReviewStatus.IssueFound, 'Missing Box 1')
      const doc = useTaxDocumentStore.getState().documents[0]!
      expect(doc.status).toBe(DocReviewStatus.IssueFound)
      expect(doc.issueNote).toBe('Missing Box 1')
    })
  })

  describe('setDragging', () => {
    it('sets dragging state', () => {
      useTaxDocumentStore.getState().setDragging(true)
      expect(useTaxDocumentStore.getState().isDragging).toBe(true)

      useTaxDocumentStore.getState().setDragging(false)
      expect(useTaxDocumentStore.getState().isDragging).toBe(false)
    })
  })

  describe('extractDocument', () => {
    it('runs extraction pipeline with intermediate steps and final result', () => {
      useTaxDocumentStore.setState({
        documents: [
          { id: 'doc-1', fileName: 'W-2_Test.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: 'Corp', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
        ],
      })

      useTaxDocumentStore.getState().extractDocument('doc-1')

      // Step 1: initial state set immediately
      let result = useTaxDocumentStore.getState().extractionResults['doc-1']
      expect(result).toBeDefined()
      expect(result!.warnings).toContain('Analyzing document format...')

      // Step 2: advance 500ms
      vi.advanceTimersByTime(500)
      result = useTaxDocumentStore.getState().extractionResults['doc-1']
      expect(result!.warnings).toContain('Identifying form type...')

      // Final: advance to 2000ms total
      vi.advanceTimersByTime(1500)
      result = useTaxDocumentStore.getState().extractionResults['doc-1']
      expect(result!.fields.length).toBeGreaterThan(0)
      expect(result!.extractedAt).toBeTruthy()
      expect(result!.formType).toBe(TaxFormType.W2)
    })

    it('does nothing for unknown document id', () => {
      useTaxDocumentStore.getState().extractDocument('nonexistent')
      expect(useTaxDocumentStore.getState().extractionResults).toEqual({})
    })
  })

  describe('setExtractionConfirmed', () => {
    it('sets confirmed flag on all extraction fields', () => {
      useTaxDocumentStore.setState({
        extractionResults: {
          'doc-1': {
            fields: [
              { key: 'Employer Name', value: 'Test', confidence: 'high', confirmed: false },
              { key: 'Wages', value: '50000', confidence: 'medium', confirmed: false },
            ],
            overallConfidence: 90,
            formType: TaxFormType.W2,
            warnings: [],
            extractedAt: '2026-01-01',
          },
        },
      })

      useTaxDocumentStore.getState().setExtractionConfirmed('doc-1', true)

      const fields = useTaxDocumentStore.getState().extractionResults['doc-1']!.fields
      expect(fields.every((f) => f.confirmed)).toBe(true)
    })
  })

  describe('Query methods', () => {
    beforeEach(() => {
      useTaxDocumentStore.setState({
        activeTaxYear: '2025' as TaxYear,
        documents: [
          { id: 'd1', fileName: 'a.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: '', uploadDate: '', status: DocReviewStatus.Verified, fileSize: 100, issueNote: '' },
          { id: 'd2', fileName: 'b.pdf', formType: TaxFormType.NEC1099, taxYear: '2025' as TaxYear, employerName: '', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
          { id: 'd3', fileName: 'c.pdf', formType: TaxFormType.INT1099, taxYear: '2025' as TaxYear, employerName: '', uploadDate: '', status: DocReviewStatus.IssueFound, fileSize: 100, issueNote: 'problem' },
          { id: 'd4', fileName: 'd.pdf', formType: TaxFormType.W2, taxYear: '2024' as TaxYear, employerName: '', uploadDate: '', status: DocReviewStatus.Verified, fileSize: 100, issueNote: '' },
        ],
      })
    })

    it('totalCount returns count for active tax year only', () => {
      expect(useTaxDocumentStore.getState().totalCount()).toBe(3)
    })

    it('verifiedCount returns verified documents for active year', () => {
      expect(useTaxDocumentStore.getState().verifiedCount()).toBe(1)
    })

    it('pendingCount returns pending documents for active year', () => {
      expect(useTaxDocumentStore.getState().pendingCount()).toBe(1)
    })

    it('issueCount returns issue documents for active year', () => {
      expect(useTaxDocumentStore.getState().issueCount()).toBe(1)
    })

    it('getDocsByYear filters documents by year', () => {
      const docs2024 = useTaxDocumentStore.getState().getDocsByYear('2024' as TaxYear)
      expect(docs2024).toHaveLength(1)
      expect(docs2024[0]!.id).toBe('d4')
    })
  })

  describe('detectFormType', () => {
    it('detects W-2 from filename', () => {
      expect(detectFormType('W-2_AcmeCorp.pdf')).toBe(TaxFormType.W2)
      expect(detectFormType('w2_test.pdf')).toBe(TaxFormType.W2)
    })

    it('detects 1099-NEC from filename', () => {
      expect(detectFormType('1099-NEC_Freelance.pdf')).toBe(TaxFormType.NEC1099)
      expect(detectFormType('1099_nec.pdf')).toBe(TaxFormType.NEC1099)
    })

    it('detects 1099-INT from filename', () => {
      expect(detectFormType('1099-INT_Bank.pdf')).toBe(TaxFormType.INT1099)
    })

    it('detects 1098 mortgage from filename', () => {
      expect(detectFormType('1098_Mortgage.pdf')).toBe(TaxFormType.Mortgage1098)
    })

    it('defaults to W2 for unrecognized filenames', () => {
      expect(detectFormType('random_document.pdf')).toBe(TaxFormType.W2)
    })
  })

  describe('clearData', () => {
    it('clears all documents and extraction results', () => {
      useTaxDocumentStore.setState({
        documents: [
          { id: 'd1', fileName: 'test.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: '', uploadDate: '', status: DocReviewStatus.Verified, fileSize: 100, issueNote: '' },
        ],
        extractionResults: {
          'd1': { fields: [], overallConfidence: 0, formType: TaxFormType.W2, warnings: [], extractedAt: '' },
        },
      })

      useTaxDocumentStore.getState().clearData()
      expect(useTaxDocumentStore.getState().documents).toHaveLength(0)
      expect(useTaxDocumentStore.getState().extractionResults).toEqual({})
    })
  })
})
