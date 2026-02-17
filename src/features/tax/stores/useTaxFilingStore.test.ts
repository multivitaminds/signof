import { useTaxFilingStore, ChecklistItemId, DEFAULT_CHECKLIST } from './useTaxFilingStore'
import { FilingState, TaxYear, TaxFormType } from '../types'
import { useTaxDocumentStore } from './useTaxDocumentStore'

// ─── Mock the TaxBandit API modules ──────────────────────────────────────

const mockAuthenticate = vi.fn()
const mockFetch = vi.fn()
const mockHasCredentials = vi.fn(() => true)

vi.mock('../lib/taxBanditClient', () => {
  class MockTaxBanditClient {
    authenticate = mockAuthenticate
    fetch = mockFetch
    hasCredentials = mockHasCredentials
  }

  class MockTaxBanditError extends Error {
    statusCode: number
    statusName: string
    errors: Array<{ id: string; name: string; message: string }>
    constructor(statusCode: number, statusName: string, errors: Array<{ id: string; name: string; message: string }> = []) {
      super(`TaxBandit API error: ${statusName} (${statusCode})`)
      this.name = 'TaxBanditError'
      this.statusCode = statusCode
      this.statusName = statusName
      this.errors = errors
    }
  }

  return {
    TaxBanditClient: MockTaxBanditClient,
    TaxBanditError: MockTaxBanditError,
  }
})

const mockBusinessCreate = vi.fn()
const mockFormCreate = vi.fn()
const mockFormValidate = vi.fn()
const mockFormTransmit = vi.fn()
const mockFormGetStatus = vi.fn()
const mockFormGetPdf = vi.fn()

vi.mock('../lib/api', () => ({
  createBusinessService: vi.fn(() => ({
    create: mockBusinessCreate,
  })),
  createFormW2Service: vi.fn(() => ({
    create: mockFormCreate,
    validate: mockFormValidate,
    transmit: mockFormTransmit,
    getStatus: mockFormGetStatus,
    getPdf: mockFormGetPdf,
  })),
  createForm1099NecService: vi.fn(() => ({
    create: mockFormCreate,
    validate: mockFormValidate,
    transmit: mockFormTransmit,
    getStatus: mockFormGetStatus,
    getPdf: mockFormGetPdf,
  })),
  buildFormW2Payload: vi.fn((data: unknown) => data),
  buildForm1099NecPayload: vi.fn((data: unknown) => data),
  FormService: {},
}))

vi.mock('../lib/extractionToPayload', () => ({
  filingToBusinessData: vi.fn((filing: Record<string, unknown>) => ({
    businessName: `${filing.firstName} ${filing.lastName}`,
    taxIdType: 'SSN',
    tin: '123456789',
    isEIN: false,
    contactName: `${filing.firstName} ${filing.lastName}`,
    phone: '5551234567',
    email: 'test@example.com',
    address1: '100 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
  })),
  extractionToW2Employee: vi.fn(() => ({
    ssn: '123456789',
    firstName: 'Jane',
    lastName: 'Doe',
    address1: '100 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    wages: 85000,
    federalTaxWithheld: 14500,
    socialSecurityWages: 85000,
    socialSecurityTax: 5270,
    medicareWages: 85000,
    medicareTax: 1232.5,
  })),
  extractionTo1099NecRecipient: vi.fn(() => ({
    tin: '123456789',
    name: 'Jane Doe',
    address1: '100 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    nonemployeeCompensation: 12000,
  })),
}))

function resetStore() {
  useTaxFilingStore.setState({
    filings: [],
    submissions: [],
    checklist: DEFAULT_CHECKLIST.map((item) => ({ ...item })),
    confirmation: null,
    isAmendmentMode: false,
    amendmentReason: '',
    taxBanditConfig: { clientId: '', clientSecret: '', userToken: '', useSandbox: true },
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
}

function resetDocumentStore() {
  useTaxDocumentStore.setState({
    documents: [],
    extractionResults: {},
    activeTaxYear: '2025',
    isDragging: false,
  })
}

describe('useTaxFilingStore', () => {
  beforeEach(() => {
    resetStore()
    resetDocumentStore()
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Filing CRUD', () => {
    it('creates a new filing for a tax year', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2024)

      const { filings } = useTaxFilingStore.getState()
      expect(filings).toHaveLength(1)

      const filing = filings[0]!
      expect(filing.taxYear).toBe('2024')
      expect(filing.state).toBe(FilingState.InProgress)
      expect(filing.wages).toBe(0)
      expect(filing.filedAt).toBeNull()
    })

    it('prevents duplicate filings for the same tax year', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2024)
      useTaxFilingStore.getState().createFiling(TaxYear.Y2024)

      expect(useTaxFilingStore.getState().filings).toHaveLength(1)
    })

    it('updates a filing with partial data', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const filingId = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().updateFiling(filingId, {
        firstName: 'Jane',
        lastName: 'Doe',
        wages: 100000,
      })

      const updated = useTaxFilingStore.getState().filings[0]!
      expect(updated.firstName).toBe('Jane')
      expect(updated.lastName).toBe('Doe')
      expect(updated.wages).toBe(100000)
    })

    it('deletes a filing', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const filingId = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().deleteFiling(filingId)
      expect(useTaxFilingStore.getState().filings).toHaveLength(0)
    })

    it('retrieves a filing by year', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2024)
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)

      const filing2024 = useTaxFilingStore.getState().getFilingByYear(TaxYear.Y2024)
      expect(filing2024).toBeDefined()
      expect(filing2024!.taxYear).toBe('2024')

      const filing2023 = useTaxFilingStore.getState().getFilingByYear(TaxYear.Y2023)
      expect(filing2023).toBeUndefined()
    })
  })

  describe('Tax Calculation', () => {
    it('calculates total income from wages and other income', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const id = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().updateFiling(id, {
        wages: 80000,
        otherIncome: 15000,
      })
      useTaxFilingStore.getState().calculateTax(id)

      const filing = useTaxFilingStore.getState().filings[0]!
      expect(filing.totalIncome).toBe(95000)
      expect(filing.taxableIncome).toBeGreaterThan(0)
      expect(filing.federalTax).toBeGreaterThan(0)
    })

    it('applies standard deduction when selected', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const id = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().updateFiling(id, {
        wages: 60000,
        useStandardDeduction: true,
      })
      useTaxFilingStore.getState().calculateTax(id)

      const filing = useTaxFilingStore.getState().filings[0]!
      expect(filing.effectiveDeduction).toBe(filing.standardDeduction)
      expect(filing.taxableIncome).toBe(60000 - filing.standardDeduction)
    })

    it('applies itemized deductions when selected', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const id = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().updateFiling(id, {
        wages: 100000,
        useStandardDeduction: false,
        itemizedDeductions: 25000,
      })
      useTaxFilingStore.getState().calculateTax(id)

      const filing = useTaxFilingStore.getState().filings[0]!
      expect(filing.effectiveDeduction).toBe(25000)
      expect(filing.taxableIncome).toBe(75000)
    })

    it('calculates refund when withheld exceeds tax', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const id = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().updateFiling(id, {
        wages: 50000,
        withheld: 20000,
      })
      useTaxFilingStore.getState().calculateTax(id)

      const filing = useTaxFilingStore.getState().filings[0]!
      // With standard deduction, taxable income is low, so withheld should exceed tax
      expect(filing.refundOrOwed).toBeLessThan(0) // Negative means refund
    })

    it('handles zero income correctly', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const id = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().calculateTax(id)

      const filing = useTaxFilingStore.getState().filings[0]!
      expect(filing.totalIncome).toBe(0)
      expect(filing.taxableIncome).toBe(0)
      expect(filing.federalTax).toBe(0)
    })
  })

  describe('Filing Submission', () => {
    it('submits a filing and creates a confirmation', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const id = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().updateFiling(id, {
        wages: 70000,
        withheld: 15000,
      })
      useTaxFilingStore.getState().submitFiling(id)

      const { filings, confirmation } = useTaxFilingStore.getState()
      expect(filings[0]!.state).toBe(FilingState.Filed)
      expect(filings[0]!.filedAt).not.toBeNull()

      expect(confirmation).not.toBeNull()
      expect(confirmation!.referenceNumber).toMatch(/^SF-/)
      expect(confirmation!.isAmendment).toBe(false)
    })

    it('sets estimated refund in confirmation when withheld exceeds tax', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const id = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().updateFiling(id, {
        wages: 30000,
        withheld: 10000,
      })
      useTaxFilingStore.getState().submitFiling(id)

      const { confirmation } = useTaxFilingStore.getState()
      expect(confirmation!.estimatedRefund).not.toBeNull()
      expect(confirmation!.estimatedRefund).toBeGreaterThan(0)
      expect(confirmation!.estimatedOwed).toBeNull()
    })

    it('clears confirmation', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const id = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().submitFiling(id)
      expect(useTaxFilingStore.getState().confirmation).not.toBeNull()

      useTaxFilingStore.getState().clearConfirmation()
      expect(useTaxFilingStore.getState().confirmation).toBeNull()
    })

    it('transitions to Accepted state after timeout', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const id = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().submitFiling(id)
      expect(useTaxFilingStore.getState().filings[0]!.state).toBe(FilingState.Filed)

      vi.advanceTimersByTime(3500)

      expect(useTaxFilingStore.getState().filings[0]!.state).toBe(FilingState.Accepted)
    })
  })

  describe('Pre-Filing Checklist', () => {
    it('initializes with all items unchecked', () => {
      const { checklist } = useTaxFilingStore.getState()
      expect(checklist).toHaveLength(DEFAULT_CHECKLIST.length)
      expect(checklist.every((item) => !item.completed)).toBe(true)
    })

    it('toggles a checklist item', () => {
      useTaxFilingStore.getState().toggleChecklistItem(ChecklistItemId.PersonalInfo)

      const { checklist } = useTaxFilingStore.getState()
      const item = checklist.find((i) => i.id === ChecklistItemId.PersonalInfo)
      expect(item!.completed).toBe(true)

      // Toggle back
      useTaxFilingStore.getState().toggleChecklistItem(ChecklistItemId.PersonalInfo)
      const updated = useTaxFilingStore.getState().checklist.find(
        (i) => i.id === ChecklistItemId.PersonalInfo
      )
      expect(updated!.completed).toBe(false)
    })

    it('reports correct progress percentage', () => {
      expect(useTaxFilingStore.getState().checklistProgress()).toBe(0)

      // Complete 3 out of 6 items
      useTaxFilingStore.getState().toggleChecklistItem(ChecklistItemId.PersonalInfo)
      useTaxFilingStore.getState().toggleChecklistItem(ChecklistItemId.AllW2s)
      useTaxFilingStore.getState().toggleChecklistItem(ChecklistItemId.BankInfo)

      expect(useTaxFilingStore.getState().checklistProgress()).toBe(50)
    })

    it('correctly reports when checklist is complete', () => {
      expect(useTaxFilingStore.getState().isChecklistComplete()).toBe(false)

      // Complete all items
      for (const item of DEFAULT_CHECKLIST) {
        useTaxFilingStore.getState().toggleChecklistItem(item.id)
      }

      expect(useTaxFilingStore.getState().isChecklistComplete()).toBe(true)
    })

    it('resets checklist to all unchecked', () => {
      useTaxFilingStore.getState().toggleChecklistItem(ChecklistItemId.PersonalInfo)
      useTaxFilingStore.getState().toggleChecklistItem(ChecklistItemId.AllW2s)

      useTaxFilingStore.getState().resetChecklist()

      const { checklist } = useTaxFilingStore.getState()
      expect(checklist.every((item) => !item.completed)).toBe(true)
    })
  })

  describe('Amendment', () => {
    it('sets amendment mode and reason', () => {
      useTaxFilingStore.getState().setAmendmentMode(true)
      expect(useTaxFilingStore.getState().isAmendmentMode).toBe(true)

      useTaxFilingStore.getState().setAmendmentReason('Missed 1099-INT income')
      expect(useTaxFilingStore.getState().amendmentReason).toBe('Missed 1099-INT income')
    })

    it('submits an amendment with correct confirmation flags', () => {
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const id = useTaxFilingStore.getState().filings[0]!.id

      useTaxFilingStore.getState().updateFiling(id, {
        wages: 60000,
        withheld: 12000,
      })

      useTaxFilingStore.getState().setAmendmentMode(true)
      useTaxFilingStore.getState().setAmendmentReason('Corrected wages')
      useTaxFilingStore.getState().submitAmendment(id)

      const { confirmation, isAmendmentMode, amendmentReason } = useTaxFilingStore.getState()
      expect(confirmation).not.toBeNull()
      expect(confirmation!.isAmendment).toBe(true)
      expect(confirmation!.amendmentReason).toBe('Corrected wages')

      // Amendment mode and reason should be cleared after submission
      expect(isAmendmentMode).toBe(false)
      expect(amendmentReason).toBe('')
    })
  })

  // ─── TaxBandits API Integration Tests ────────────────────────────────────

  describe('TaxBandits API Integration', () => {
    function setupFilingWithCredentials() {
      // Set up credentials
      useTaxFilingStore.getState().setTaxBanditConfig({
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
        userToken: 'test-token',
        useSandbox: true,
      })

      // Create and configure a filing
      useTaxFilingStore.getState().createFiling(TaxYear.Y2025)
      const id = useTaxFilingStore.getState().filings[0]!.id
      useTaxFilingStore.getState().updateFiling(id, {
        firstName: 'Jane',
        lastName: 'Doe',
        ssn: '123-45-6789',
        email: 'jane@example.com',
        phone: '5551234567',
        wages: 85000,
        otherIncome: 5000,
        withheld: 14500,
        address: { street: '100 Main St', apt: '', city: 'Springfield', state: 'IL', zip: '62704' },
      })

      return id
    }

    describe('authenticateWithTaxBandit', () => {
      it('authenticates and stores token', async () => {
        useTaxFilingStore.getState().setTaxBanditConfig({
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          userToken: 'test-token',
        })

        mockAuthenticate.mockResolvedValueOnce('jwt-token-abc')

        const result = await useTaxFilingStore.getState().authenticateWithTaxBandit()

        expect(result).toBe(true)
        expect(mockAuthenticate).toHaveBeenCalledOnce()
        expect(useTaxFilingStore.getState().accessToken).toBe('jwt-token-abc')
        expect(useTaxFilingStore.getState().accessTokenExpiry).not.toBeNull()
      })

      it('returns false without credentials', async () => {
        const result = await useTaxFilingStore.getState().authenticateWithTaxBandit()

        expect(result).toBe(false)
        expect(mockAuthenticate).not.toHaveBeenCalled()
      })
    })

    describe('validateAndTransmit — W-2 flow', () => {
      it('creates business via businessService, builds W-2 payload, creates/validates/transmits', async () => {
        const filingId = setupFilingWithCredentials()

        mockAuthenticate.mockResolvedValueOnce('jwt-token')
        mockBusinessCreate.mockResolvedValueOnce('BIZ-001')
        mockFormCreate.mockResolvedValueOnce({ submissionId: 'SUB-001', recordId: 'REC-001' })
        mockFormValidate.mockResolvedValueOnce([]) // No validation errors
        mockFormTransmit.mockResolvedValueOnce(undefined)
        mockFormGetStatus.mockResolvedValueOnce({
          status: 'Transmitted',
          acknowledgementStatus: 'Accepted',
          irsErrors: [],
        })

        const promise = useTaxFilingStore.getState().validateAndTransmit(filingId, TaxFormType.W2)

        // Advance past the polling delay
        await vi.advanceTimersByTimeAsync(6000)
        await promise

        // Business was created via businessService
        expect(mockBusinessCreate).toHaveBeenCalledOnce()

        // Form was created via formW2Service
        expect(mockFormCreate).toHaveBeenCalledOnce()

        // Validation was called
        expect(mockFormValidate).toHaveBeenCalledWith('SUB-001')

        // Transmit was called
        expect(mockFormTransmit).toHaveBeenCalledWith('SUB-001', ['REC-001'])

        // Status was polled
        expect(mockFormGetStatus).toHaveBeenCalledWith('SUB-001')

        // Filing state updated
        const filing = useTaxFilingStore.getState().filings[0]!
        expect(filing.state).toBe(FilingState.Accepted)

        // Confirmation created
        const { confirmation } = useTaxFilingStore.getState()
        expect(confirmation).not.toBeNull()
        expect(confirmation!.referenceNumber).toMatch(/^SF-/)

        // Submission IDs stored
        expect(useTaxFilingStore.getState().submissionId).toBe('SUB-001')
        expect(useTaxFilingStore.getState().recordId).toBe('REC-001')
        expect(useTaxFilingStore.getState().lastFormType).toBe(TaxFormType.W2)
      })

      it('handles validation errors — sets error state, does not transmit', async () => {
        const filingId = setupFilingWithCredentials()

        mockAuthenticate.mockResolvedValueOnce('jwt-token')
        mockBusinessCreate.mockResolvedValueOnce('BIZ-001')
        mockFormCreate.mockResolvedValueOnce({ submissionId: 'SUB-002', recordId: 'REC-002' })
        mockFormValidate.mockResolvedValueOnce([
          { id: 'err-1', field: 'SSN', message: 'Invalid SSN format', code: 'V001' },
        ])

        await useTaxFilingStore.getState().validateAndTransmit(filingId, TaxFormType.W2)

        expect(mockFormTransmit).not.toHaveBeenCalled()
        expect(useTaxFilingStore.getState().transmissionStatus).toBe('error')
        expect(useTaxFilingStore.getState().transmissionError).toContain('1 error(s)')
        expect(useTaxFilingStore.getState().validationErrors).toHaveLength(1)
        expect(useTaxFilingStore.getState().validationErrors[0]!.field).toBe('SSN')

        // Submission should be rejected
        const submission = useTaxFilingStore.getState().submissions[0]!
        expect(submission.state).toBe(FilingState.Rejected)
      })

      it('handles authentication failure', async () => {
        const filingId = setupFilingWithCredentials()

        const { TaxBanditError } = await import('../lib/taxBanditClient')
        mockAuthenticate.mockRejectedValueOnce(new TaxBanditError(401, 'Unauthorized'))

        await useTaxFilingStore.getState().validateAndTransmit(filingId, TaxFormType.W2)

        expect(mockBusinessCreate).not.toHaveBeenCalled()
        expect(useTaxFilingStore.getState().transmissionStatus).toBe('error')
        expect(useTaxFilingStore.getState().transmissionError).toContain('Unauthorized')
      })
    })

    describe('validateAndTransmit — 1099-NEC flow', () => {
      it('creates business and builds 1099-NEC payload', async () => {
        const filingId = setupFilingWithCredentials()

        mockAuthenticate.mockResolvedValueOnce('jwt-token')
        mockBusinessCreate.mockResolvedValueOnce('BIZ-002')
        mockFormCreate.mockResolvedValueOnce({ submissionId: 'SUB-003', recordId: 'REC-003' })
        mockFormValidate.mockResolvedValueOnce([])
        mockFormTransmit.mockResolvedValueOnce(undefined)
        mockFormGetStatus.mockResolvedValueOnce({
          status: 'Transmitted',
          acknowledgementStatus: 'Accepted',
          irsErrors: [],
        })

        const promise = useTaxFilingStore.getState().validateAndTransmit(filingId, TaxFormType.NEC1099)

        await vi.advanceTimersByTimeAsync(6000)
        await promise

        expect(mockBusinessCreate).toHaveBeenCalledOnce()
        expect(mockFormCreate).toHaveBeenCalledOnce()
        expect(useTaxFilingStore.getState().lastFormType).toBe(TaxFormType.NEC1099)
      })
    })

    describe('validateAndTransmit with extraction data', () => {
      it('populates payload from extraction fields when available', async () => {
        const filingId = setupFilingWithCredentials()

        // Add a W-2 document with extraction results to the document store
        useTaxDocumentStore.setState({
          documents: [{
            id: 'doc-w2',
            fileName: 'W-2_2025.pdf',
            formType: TaxFormType.W2,
            taxYear: '2025',
            employerName: 'Acme Corp',
            uploadDate: '2026-01-15T10:00:00Z',
            status: 'verified',
            fileSize: 100000,
            issueNote: '',
          }],
          extractionResults: {
            'doc-w2': {
              fields: [
                { key: 'Wages (Box 1)', value: '92000.00', confidence: 'high', confirmed: true },
                { key: 'Federal Tax Withheld (Box 2)', value: '16000.00', confidence: 'high', confirmed: true },
              ],
              overallConfidence: 95,
              formType: TaxFormType.W2,
              warnings: [],
              extractedAt: '2026-01-15T10:05:00Z',
            },
          },
        })

        mockAuthenticate.mockResolvedValueOnce('jwt-token')
        mockBusinessCreate.mockResolvedValueOnce('BIZ-003')
        mockFormCreate.mockResolvedValueOnce({ submissionId: 'SUB-004', recordId: 'REC-004' })
        mockFormValidate.mockResolvedValueOnce([])
        mockFormTransmit.mockResolvedValueOnce(undefined)
        mockFormGetStatus.mockResolvedValueOnce({
          status: 'Transmitted',
          acknowledgementStatus: 'Accepted',
          irsErrors: [],
        })

        const promise = useTaxFilingStore.getState().validateAndTransmit(filingId, TaxFormType.W2)
        await vi.advanceTimersByTimeAsync(6000)
        await promise

        // The extraction bridge was called (mocked, but verifies the wiring)
        const { extractionToW2Employee } = await import('../lib/extractionToPayload')
        expect(extractionToW2Employee).toHaveBeenCalled()
      })
    })

    describe('pollFilingStatus', () => {
      it('uses form service to poll status', async () => {
        const filingId = setupFilingWithCredentials()

        // Set up as if we already have a submission
        useTaxFilingStore.setState({
          submissionId: 'SUB-POLL',
          lastFormType: TaxFormType.W2,
          accessToken: 'jwt-token',
        })

        mockAuthenticate.mockResolvedValueOnce('jwt-token')
        mockFormGetStatus.mockResolvedValueOnce({
          status: 'Transmitted',
          acknowledgementStatus: 'Accepted',
          irsErrors: [],
        })

        await useTaxFilingStore.getState().pollFilingStatus(filingId)

        expect(mockFormGetStatus).toHaveBeenCalledWith('SUB-POLL')
        expect(useTaxFilingStore.getState().filings[0]!.state).toBe(FilingState.Accepted)
      })

      it('does nothing without a submission ID', async () => {
        const filingId = setupFilingWithCredentials()

        await useTaxFilingStore.getState().pollFilingStatus(filingId)

        expect(mockAuthenticate).not.toHaveBeenCalled()
      })
    })

    describe('downloadReturnPdf', () => {
      it('uses form service to get PDF URL', async () => {
        useTaxFilingStore.setState({
          submissionId: 'SUB-PDF',
          lastFormType: TaxFormType.W2,
          taxBanditConfig: {
            clientId: 'test-id',
            clientSecret: 'test-secret',
            userToken: 'test-token',
            useSandbox: true,
          },
        })

        mockAuthenticate.mockResolvedValueOnce('jwt-token')
        mockFormGetPdf.mockResolvedValueOnce('https://taxbandits.com/pdf/return.pdf')

        await useTaxFilingStore.getState().downloadReturnPdf()

        expect(mockFormGetPdf).toHaveBeenCalledWith('SUB-PDF')
        expect(useTaxFilingStore.getState().returnPdfUrl).toBe('https://taxbandits.com/pdf/return.pdf')
      })
    })

    describe('submission CRUD', () => {
      it('creates and tracks a submission', () => {
        const id = useTaxFilingStore.getState().createSubmission(TaxFormType.W2, { test: true })

        const submission = useTaxFilingStore.getState().getSubmission(id)
        expect(submission).toBeDefined()
        expect(submission!.formType).toBe(TaxFormType.W2)
        expect(submission!.state).toBe(FilingState.InProgress)
      })

      it('updates submission TaxBandit IDs', () => {
        const id = useTaxFilingStore.getState().createSubmission(TaxFormType.W2, {})

        useTaxFilingStore.getState().setSubmissionTaxBanditIds(id, 'TB-SUB-1', 'TB-REC-1')

        const submission = useTaxFilingStore.getState().getSubmission(id)
        expect(submission!.taxBanditSubmissionId).toBe('TB-SUB-1')
        expect(submission!.taxBanditRecordId).toBe('TB-REC-1')
      })

      it('queries submissions by form type', () => {
        useTaxFilingStore.getState().createSubmission(TaxFormType.W2, {})
        useTaxFilingStore.getState().createSubmission(TaxFormType.NEC1099, {})
        useTaxFilingStore.getState().createSubmission(TaxFormType.W2, {})

        const w2Submissions = useTaxFilingStore.getState().getSubmissionsByFormType(TaxFormType.W2)
        expect(w2Submissions).toHaveLength(2)

        const necSubmissions = useTaxFilingStore.getState().getSubmissionsByFormType(TaxFormType.NEC1099)
        expect(necSubmissions).toHaveLength(1)
      })
    })
  })
})
