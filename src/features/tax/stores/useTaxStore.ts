import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type TaxDocument,
  type TaxFiling,
  type TaxDeadline,
  type TaxYear,
  type ExtractedField,
  TaxFormType,
  FilingState,
  FilingStatus,
  TAX_BRACKETS_2025,
  STANDARD_DEDUCTION_2025,
} from '../types'

// ─── ID Generator ────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Sample Data ─────────────────────────────────────────────────────

function createSampleDocuments(): TaxDocument[] {
  return [
    {
      id: generateId(),
      name: 'Acme Corp W-2',
      type: TaxFormType.W2,
      taxYear: '2025',
      uploadedAt: '2026-01-15T10:30:00Z',
      extractionStatus: 'completed',
      extractedData: [
        { key: 'Employer Name', value: 'Acme Corporation' },
        { key: 'Employer EIN', value: '12-3456789' },
        { key: 'Wages (Box 1)', value: '85000.00' },
        { key: 'Federal Tax Withheld (Box 2)', value: '14500.00' },
        { key: 'Social Security Wages (Box 3)', value: '85000.00' },
        { key: 'Social Security Tax (Box 4)', value: '5270.00' },
        { key: 'Medicare Wages (Box 5)', value: '85000.00' },
        { key: 'Medicare Tax (Box 6)', value: '1232.50' },
      ],
    },
    {
      id: generateId(),
      name: 'Freelance Design 1099-NEC',
      type: TaxFormType.NEC1099,
      taxYear: '2025',
      uploadedAt: '2026-01-20T14:15:00Z',
      extractionStatus: 'completed',
      extractedData: [
        { key: 'Payer Name', value: 'Design Studio LLC' },
        { key: 'Payer TIN', value: '98-7654321' },
        { key: 'Nonemployee Compensation (Box 1)', value: '12000.00' },
      ],
    },
    {
      id: generateId(),
      name: 'Savings Account 1099-INT',
      type: TaxFormType.INT1099,
      taxYear: '2025',
      uploadedAt: '2026-01-25T09:00:00Z',
      extractionStatus: 'pending',
      extractedData: [],
    },
  ]
}

function createSampleFiling(): TaxFiling {
  return {
    id: generateId(),
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

function createSampleDeadlines(): TaxDeadline[] {
  return [
    {
      id: generateId(),
      title: 'W-2 Forms Due',
      description: 'Employers must provide W-2 forms to employees by this date.',
      date: '2026-01-31',
      completed: true,
      taxYear: '2025',
    },
    {
      id: generateId(),
      title: '1099 Forms Due',
      description: 'Payers must send 1099 forms to recipients.',
      date: '2026-01-31',
      completed: true,
      taxYear: '2025',
    },
    {
      id: generateId(),
      title: 'Tax Filing Deadline',
      description: 'Federal income tax return (Form 1040) due for most taxpayers.',
      date: '2026-04-15',
      completed: false,
      taxYear: '2025',
    },
    {
      id: generateId(),
      title: 'Extension Deadline',
      description: 'Deadline for extended returns (Form 4868 must have been filed by April 15).',
      date: '2026-10-15',
      completed: false,
      taxYear: '2025',
    },
  ]
}

// ─── Store Interface ─────────────────────────────────────────────────

interface TaxState {
  // Data
  documents: TaxDocument[]
  filings: TaxFiling[]
  deadlines: TaxDeadline[]
  activeTaxYear: TaxYear

  // Document actions
  addDocument: (doc: Omit<TaxDocument, 'id' | 'uploadedAt' | 'extractionStatus' | 'extractedData'>) => void
  updateDocument: (id: string, updates: Partial<TaxDocument>) => void
  deleteDocument: (id: string) => void
  extractData: (id: string) => void

  // Filing actions
  createFiling: (taxYear: TaxYear) => void
  updateFiling: (id: string, updates: Partial<TaxFiling>) => void
  calculateTax: (filingId: string) => void
  submitFiling: (filingId: string) => void

  // Deadline actions
  toggleDeadline: (id: string) => void

  // Year selection
  setActiveTaxYear: (year: TaxYear) => void

  // Clear data
  clearData: () => void

  // Queries
  getDocumentsByYear: (year: TaxYear) => TaxDocument[]
  getFilingByYear: (year: TaxYear) => TaxFiling | undefined
}

// ─── Tax Calculation ─────────────────────────────────────────────────

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

// ─── Simulated Extraction Data ───────────────────────────────────────

function simulateExtraction(doc: TaxDocument): ExtractedField[] {
  switch (doc.type) {
    case TaxFormType.W2:
      return [
        { key: 'Employer Name', value: 'Employer Inc.' },
        { key: 'Employer EIN', value: '00-0000000' },
        { key: 'Wages (Box 1)', value: '0.00' },
        { key: 'Federal Tax Withheld (Box 2)', value: '0.00' },
        { key: 'Social Security Wages (Box 3)', value: '0.00' },
        { key: 'Social Security Tax (Box 4)', value: '0.00' },
        { key: 'Medicare Wages (Box 5)', value: '0.00' },
        { key: 'Medicare Tax (Box 6)', value: '0.00' },
      ]
    case TaxFormType.NEC1099:
      return [
        { key: 'Payer Name', value: 'Payer LLC' },
        { key: 'Payer TIN', value: '00-0000000' },
        { key: 'Nonemployee Compensation (Box 1)', value: '0.00' },
      ]
    case TaxFormType.INT1099:
      return [
        { key: 'Payer Name', value: 'Bank Name' },
        { key: 'Interest Income (Box 1)', value: '0.00' },
        { key: 'Early Withdrawal Penalty (Box 2)', value: '0.00' },
        { key: 'Interest on US Savings Bonds (Box 3)', value: '0.00' },
      ]
    case TaxFormType.DIV1099:
      return [
        { key: 'Payer Name', value: 'Brokerage Inc.' },
        { key: 'Total Ordinary Dividends (Box 1a)', value: '0.00' },
        { key: 'Qualified Dividends (Box 1b)', value: '0.00' },
        { key: 'Capital Gain Distributions (Box 2a)', value: '0.00' },
      ]
    case TaxFormType.MISC1099:
      return [
        { key: 'Payer Name', value: 'Payer Name' },
        { key: 'Rents (Box 1)', value: '0.00' },
        { key: 'Royalties (Box 2)', value: '0.00' },
        { key: 'Other Income (Box 3)', value: '0.00' },
      ]
    case TaxFormType.Mortgage1098:
      return [
        { key: 'Lender Name', value: 'Mortgage Lender' },
        { key: 'Mortgage Interest Received (Box 1)', value: '0.00' },
        { key: 'Points Paid (Box 6)', value: '0.00' },
      ]
    case TaxFormType.ACA1095A:
      return [
        { key: 'Marketplace Identifier', value: '' },
        { key: 'Monthly Premium (Jan)', value: '0.00' },
        { key: 'Monthly SLCSP (Jan)', value: '0.00' },
        { key: 'Monthly Advance PTC (Jan)', value: '0.00' },
      ]
    case TaxFormType.W9:
      return [
        { key: 'Name', value: '' },
        { key: 'Business Name', value: '' },
        { key: 'Tax Classification', value: '' },
        { key: 'TIN', value: '' },
      ]
    default:
      return []
  }
}

// ─── Store ───────────────────────────────────────────────────────────

export const useTaxStore = create<TaxState>()(
  persist(
    (set, get) => ({
      // Initial data
      documents: createSampleDocuments(),
      filings: [createSampleFiling()],
      deadlines: createSampleDeadlines(),
      activeTaxYear: '2025' as TaxYear,

      // Document actions
      addDocument: (doc) =>
        set((state) => ({
          documents: [
            ...state.documents,
            {
              ...doc,
              id: generateId(),
              uploadedAt: new Date().toISOString(),
              extractionStatus: 'pending' as const,
              extractedData: [],
            },
          ],
        })),

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

      extractData: (id) => {
        const doc = get().documents.find((d) => d.id === id)
        if (!doc) return

        // Set extracting status
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, extractionStatus: 'extracting' as const } : d
          ),
        }))

        // Simulate async extraction with timeout
        setTimeout(() => {
          const currentDoc = get().documents.find((d) => d.id === id)
          if (!currentDoc) return
          const extractedData = simulateExtraction(currentDoc)
          set((state) => ({
            documents: state.documents.map((d) =>
              d.id === id
                ? { ...d, extractionStatus: 'completed' as const, extractedData }
                : d
            ),
          }))
        }, 1500)
      },

      // Filing actions
      createFiling: (taxYear) =>
        set((state) => {
          // Don't create duplicate filings for the same year
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
        // First recalculate
        get().calculateTax(filingId)
        // Simulate submission
        set((state) => ({
          filings: state.filings.map((f) =>
            f.id === filingId
              ? {
                  ...f,
                  state: FilingState.Filed,
                  filedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }))
        // Simulate acceptance after delay
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

      // Deadline actions
      toggleDeadline: (id) =>
        set((state) => ({
          deadlines: state.deadlines.map((d) =>
            d.id === id ? { ...d, completed: !d.completed } : d
          ),
        })),

      // Clear data (resets documents and filings but keeps deadlines as templates)
      clearData: () => {
        set({
          documents: [],
          filings: [],
        })
      },

      // Year selection
      setActiveTaxYear: (year) => set({ activeTaxYear: year }),

      // Queries (computed from state)
      getDocumentsByYear: (year) =>
        get().documents.filter((d) => d.taxYear === year),

      getFilingByYear: (year) =>
        get().filings.find((f) => f.taxYear === year),
    }),
    {
      name: 'orchestree-tax-storage',
      partialize: (state) => ({
        documents: state.documents,
        filings: state.filings,
        deadlines: state.deadlines,
        activeTaxYear: state.activeTaxYear,
      }),
    }
  )
)
