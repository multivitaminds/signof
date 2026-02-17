import { useTaxDocumentStore, DocReviewStatus, detectFormType, setFileBlob, getFileBlob, clearFileBlob } from './useTaxDocumentStore'
import { TaxFormType, ExtractionConfidence } from '../types'
import type { TaxYear, ExtractionResult } from '../types'

// Mock the extraction engine
vi.mock('../lib/extractionEngine', () => ({
  extractDocument: vi.fn(),
}))

import { extractDocument as mockRunExtraction } from '../lib/extractionEngine'

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
    vi.clearAllMocks()
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

    it('returns the generated document id', () => {
      const id = useTaxDocumentStore.getState().addDocument({
        fileName: 'W-2_Test.pdf',
        formType: TaxFormType.W2,
        taxYear: '2025' as TaxYear,
        employerName: 'Test Corp',
        fileSize: 100000,
      })

      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
      const { documents } = useTaxDocumentStore.getState()
      expect(documents[0]!.id).toBe(id)
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

  describe('file blob storage', () => {
    it('stores and retrieves file blobs', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      setFileBlob('doc-1', file)
      expect(getFileBlob('doc-1')).toBe(file)
    })

    it('returns undefined for unknown ids', () => {
      expect(getFileBlob('nonexistent')).toBeUndefined()
    })

    it('clears file blobs', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      setFileBlob('doc-1', file)
      clearFileBlob('doc-1')
      expect(getFileBlob('doc-1')).toBeUndefined()
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

    it('clears file blob on delete', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      setFileBlob('doc-1', file)

      useTaxDocumentStore.setState({
        documents: [
          { id: 'doc-1', fileName: 'test.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: 'Corp', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
        ],
      })

      useTaxDocumentStore.getState().deleteDocument('doc-1')
      expect(getFileBlob('doc-1')).toBeUndefined()
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
    const mockResult: ExtractionResult = {
      fields: [
        { key: 'Employer Name', value: 'Acme Corp', confidence: ExtractionConfidence.High, confirmed: false },
        { key: 'Wages (Box 1)', value: '85000.00', confidence: ExtractionConfidence.High, confirmed: false },
      ],
      overallConfidence: 100,
      formType: TaxFormType.W2,
      warnings: [],
      extractedAt: '2026-01-01T00:00:00Z',
    }

    it('calls extraction engine and stores result', async () => {
      vi.mocked(mockRunExtraction).mockResolvedValue(mockResult)

      useTaxDocumentStore.setState({
        documents: [
          { id: 'doc-1', fileName: 'W-2_Test.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: 'Corp', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
        ],
      })

      await useTaxDocumentStore.getState().extractDocument('doc-1')

      const result = useTaxDocumentStore.getState().extractionResults['doc-1']
      expect(result).toBeDefined()
      expect(result!.fields).toHaveLength(2)
      expect(result!.fields[0]!.value).toBe('Acme Corp')
      expect(result!.extractedAt).toBeTruthy()
    })

    it('sets initial extracting state before extraction completes', async () => {
      let capturedWarnings: string[] = []
      vi.mocked(mockRunExtraction).mockImplementation(async (_formType, _file, onStep) => {
        // Capture the store state after initial set but before completion
        capturedWarnings = [...(useTaxDocumentStore.getState().extractionResults['doc-1']?.warnings ?? [])]
        onStep?.({ label: 'Reading document...', duration: 0 }, 0)
        return mockResult
      })

      useTaxDocumentStore.setState({
        documents: [
          { id: 'doc-1', fileName: 'test.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: 'Corp', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
        ],
      })

      await useTaxDocumentStore.getState().extractDocument('doc-1')
      expect(capturedWarnings).toContain('Reading document...')
    })

    it('passes file blob to extraction engine when available', async () => {
      vi.mocked(mockRunExtraction).mockResolvedValue(mockResult)

      const file = new File(['pdf-content'], 'w2.pdf', { type: 'application/pdf' })
      setFileBlob('doc-1', file)

      useTaxDocumentStore.setState({
        documents: [
          { id: 'doc-1', fileName: 'w2.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: 'Corp', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
        ],
      })

      await useTaxDocumentStore.getState().extractDocument('doc-1')

      expect(mockRunExtraction).toHaveBeenCalledWith(
        TaxFormType.W2,
        file,
        expect.any(Function)
      )

      // Clean up
      clearFileBlob('doc-1')
    })

    it('passes undefined file when no blob stored', async () => {
      vi.mocked(mockRunExtraction).mockResolvedValue(mockResult)

      useTaxDocumentStore.setState({
        documents: [
          { id: 'doc-1', fileName: 'test.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: 'Corp', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
        ],
      })

      await useTaxDocumentStore.getState().extractDocument('doc-1')

      expect(mockRunExtraction).toHaveBeenCalledWith(
        TaxFormType.W2,
        undefined,
        expect.any(Function)
      )
    })

    it('does nothing for unknown document id', async () => {
      await useTaxDocumentStore.getState().extractDocument('nonexistent')
      expect(useTaxDocumentStore.getState().extractionResults).toEqual({})
      expect(mockRunExtraction).not.toHaveBeenCalled()
    })

    it('falls back to simulated data on extraction error', async () => {
      vi.mocked(mockRunExtraction).mockRejectedValue(new Error('Extraction failed'))

      useTaxDocumentStore.setState({
        documents: [
          { id: 'doc-1', fileName: 'test.pdf', formType: TaxFormType.W2, taxYear: '2025' as TaxYear, employerName: 'Corp', uploadDate: '', status: DocReviewStatus.PendingReview, fileSize: 100, issueNote: '' },
        ],
      })

      await useTaxDocumentStore.getState().extractDocument('doc-1')

      const result = useTaxDocumentStore.getState().extractionResults['doc-1']
      expect(result).toBeDefined()
      expect(result!.fields.length).toBeGreaterThan(0)
      expect(result!.extractedAt).toBeTruthy()
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
