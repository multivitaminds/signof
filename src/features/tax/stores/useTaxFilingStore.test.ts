import { useTaxFilingStore, ChecklistItemId, DEFAULT_CHECKLIST } from './useTaxFilingStore'
import { FilingState, TaxYear } from '../types'

function resetStore() {
  useTaxFilingStore.setState({
    filings: [],
    submissions: [],
    checklist: DEFAULT_CHECKLIST.map((item) => ({ ...item })),
    confirmation: null,
    isAmendmentMode: false,
    amendmentReason: '',
  })
}

describe('useTaxFilingStore', () => {
  beforeEach(() => {
    resetStore()
    vi.useFakeTimers()
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
})
