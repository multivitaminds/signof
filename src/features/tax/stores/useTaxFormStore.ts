import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Tax Form ID ────────────────────────────────────────────────────────

export const TaxFormId = {
  F1040: 'f1040',
  F1040SR: 'f1040sr',
  F1040NR: 'f1040nr',
  ScheduleA: 'schedule_a',
  ScheduleB: 'schedule_b',
  ScheduleC: 'schedule_c',
  ScheduleD: 'schedule_d',
  ScheduleE: 'schedule_e',
  Form8949: 'form_8949',
} as const

export type TaxFormId = (typeof TaxFormId)[keyof typeof TaxFormId]

// ─── Form Completion Status ─────────────────────────────────────────────

export const FormCompletionStatus = {
  NotStarted: 'not_started',
  InProgress: 'in_progress',
  Completed: 'completed',
} as const

export type FormCompletionStatus = (typeof FormCompletionStatus)[keyof typeof FormCompletionStatus]

// ─── Form Definitions ──────────────────────────────────────────────────

export interface TaxFormDefinition {
  id: TaxFormId
  name: string
  fullName: string
  description: string
  category: string
}

export const TAX_FORM_DEFINITIONS: TaxFormDefinition[] = [
  { id: TaxFormId.F1040, name: 'Form 1040', fullName: 'U.S. Individual Income Tax Return', description: 'The main federal income tax form for individuals.', category: 'Primary' },
  { id: TaxFormId.F1040SR, name: 'Form 1040-SR', fullName: 'U.S. Tax Return for Seniors', description: 'Simplified tax form for taxpayers age 65 and older.', category: 'Primary' },
  { id: TaxFormId.F1040NR, name: 'Form 1040-NR', fullName: 'U.S. Nonresident Alien Income Tax Return', description: 'Tax return for nonresident aliens.', category: 'Primary' },
  { id: TaxFormId.ScheduleA, name: 'Schedule A', fullName: 'Itemized Deductions', description: 'Medical expenses, taxes, interest, gifts, casualty losses, and other deductions.', category: 'Schedules' },
  { id: TaxFormId.ScheduleB, name: 'Schedule B', fullName: 'Interest and Ordinary Dividends', description: 'Report interest and dividend income over $1,500.', category: 'Schedules' },
  { id: TaxFormId.ScheduleC, name: 'Schedule C', fullName: 'Profit or Loss from Business', description: 'Report income or loss from a sole proprietorship.', category: 'Schedules' },
  { id: TaxFormId.ScheduleD, name: 'Schedule D', fullName: 'Capital Gains and Losses', description: 'Report sale of stocks, bonds, real estate, and other capital assets.', category: 'Schedules' },
  { id: TaxFormId.ScheduleE, name: 'Schedule E', fullName: 'Supplemental Income and Loss', description: 'Rental real estate, royalties, partnerships, S corps, estates, trusts.', category: 'Schedules' },
  { id: TaxFormId.Form8949, name: 'Form 8949', fullName: 'Sales and Dispositions of Capital Assets', description: 'Report individual capital asset transactions.', category: 'Additional Forms' },
]

// ─── Wizard Steps ───────────────────────────────────────────────────────

export const WIZARD_STEPS = ['Personal Info', 'Income', 'Deductions', 'Credits', 'Review'] as const

export type WizardStep = (typeof WIZARD_STEPS)[number]

// ─── Form Entry Data ────────────────────────────────────────────────────

export interface FormEntryData {
  // Personal Info
  firstName: string
  lastName: string
  ssn: string
  filingStatus: string
  // Income
  wagesIncome: number
  interestIncome: number
  dividendIncome: number
  businessIncome: number
  capitalGains: number
  otherIncome: number
  // Deductions
  useStandardDeduction: boolean
  medicalExpenses: number
  stateLocalTaxes: number
  mortgageInterest: number
  charitableContributions: number
  otherDeductions: number
  // Credits
  childTaxCredit: number
  educationCredit: number
  energyCredit: number
  otherCredits: number
}

const EMPTY_ENTRY_DATA: FormEntryData = {
  firstName: '',
  lastName: '',
  ssn: '',
  filingStatus: 'single',
  wagesIncome: 0,
  interestIncome: 0,
  dividendIncome: 0,
  businessIncome: 0,
  capitalGains: 0,
  otherIncome: 0,
  useStandardDeduction: true,
  medicalExpenses: 0,
  stateLocalTaxes: 0,
  mortgageInterest: 0,
  charitableContributions: 0,
  otherDeductions: 0,
  childTaxCredit: 0,
  educationCredit: 0,
  energyCredit: 0,
  otherCredits: 0,
}

// ─── Form Entry ─────────────────────────────────────────────────────────

export interface FormEntry {
  id: string
  formId: TaxFormId
  taxYear: string
  currentStep: number
  completedSteps: number[]
  status: FormCompletionStatus
  data: FormEntryData
  createdAt: string
  updatedAt: string
}

// ─── ID Generator ───────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Sample Data ────────────────────────────────────────────────────────

function createSampleEntries(): FormEntry[] {
  return [
    {
      id: 'entry_1',
      formId: TaxFormId.F1040,
      taxYear: '2025',
      currentStep: 2,
      completedSteps: [0, 1],
      status: FormCompletionStatus.InProgress,
      data: {
        ...EMPTY_ENTRY_DATA,
        firstName: 'Alex',
        lastName: 'Johnson',
        ssn: '***-**-4589',
        filingStatus: 'single',
        wagesIncome: 85000,
        interestIncome: 450,
      },
      createdAt: '2026-01-28T16:00:00Z',
      updatedAt: '2026-02-05T11:30:00Z',
    },
  ]
}

// ─── Store ──────────────────────────────────────────────────────────────

interface TaxFormState {
  entries: FormEntry[]

  // Actions
  startForm: (formId: TaxFormId, taxYear: string) => string
  updateFormData: (entryId: string, data: Partial<FormEntryData>) => void
  setCurrentStep: (entryId: string, step: number) => void
  completeStep: (entryId: string, step: number) => void
  completeForm: (entryId: string) => void
  deleteEntry: (entryId: string) => void

  // Queries
  getEntry: (entryId: string) => FormEntry | undefined
  getEntryByForm: (formId: TaxFormId, taxYear: string) => FormEntry | undefined
  getFormStatus: (formId: TaxFormId, taxYear: string) => FormCompletionStatus
  getProgressPercent: (entryId: string) => number
}

export const useTaxFormStore = create<TaxFormState>()(
  persist(
    (set, get) => ({
      entries: createSampleEntries(),

      startForm: (formId, taxYear) => {
        const existing = get().entries.find(
          (e) => e.formId === formId && e.taxYear === taxYear
        )
        if (existing) return existing.id

        const id = generateId()
        const now = new Date().toISOString()
        const entry: FormEntry = {
          id,
          formId,
          taxYear,
          currentStep: 0,
          completedSteps: [],
          status: FormCompletionStatus.InProgress,
          data: { ...EMPTY_ENTRY_DATA },
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ entries: [...state.entries, entry] }))
        return id
      },

      updateFormData: (entryId, data) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  data: { ...e.data, ...data },
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        })),

      setCurrentStep: (entryId, step) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? { ...e, currentStep: step, updatedAt: new Date().toISOString() }
              : e
          ),
        })),

      completeStep: (entryId, step) =>
        set((state) => ({
          entries: state.entries.map((e) => {
            if (e.id !== entryId) return e
            const completedSteps = e.completedSteps.includes(step)
              ? e.completedSteps
              : [...e.completedSteps, step]
            return {
              ...e,
              completedSteps,
              updatedAt: new Date().toISOString(),
            }
          }),
        })),

      completeForm: (entryId) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  status: FormCompletionStatus.Completed,
                  completedSteps: [0, 1, 2, 3, 4],
                  updatedAt: new Date().toISOString(),
                }
              : e
          ),
        })),

      deleteEntry: (entryId) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entryId),
        })),

      getEntry: (entryId) => get().entries.find((e) => e.id === entryId),

      getEntryByForm: (formId, taxYear) =>
        get().entries.find(
          (e) => e.formId === formId && e.taxYear === taxYear
        ),

      getFormStatus: (formId, taxYear) => {
        const entry = get().entries.find(
          (e) => e.formId === formId && e.taxYear === taxYear
        )
        return entry?.status ?? FormCompletionStatus.NotStarted
      },

      getProgressPercent: (entryId) => {
        const entry = get().entries.find((e) => e.id === entryId)
        if (!entry) return 0
        return Math.round(
          (entry.completedSteps.length / WIZARD_STEPS.length) * 100
        )
      },
    }),
    {
      name: 'signof-tax-form-storage',
      partialize: (state) => ({
        entries: state.entries,
      }),
    }
  )
)
