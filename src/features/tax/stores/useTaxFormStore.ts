import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createEncryptedStorage } from '../lib/encryptedStorage'
import {
  type TaxFormType,
  type FormCategory,
  TaxFormType as TaxFormTypeValues,
  FormCategory as FormCategoryValues,
  TAXBANDITS_FORM_PATHS,
  TAX_FORM_LABELS,
  TAX_FORM_DESCRIPTIONS,
  FORM_CATEGORY_MAP,
} from '../types'

// ─── Form Completion Status ─────────────────────────────────────────────

export const FormCompletionStatus = {
  NotStarted: 'not_started',
  InProgress: 'in_progress',
  Completed: 'completed',
} as const

export type FormCompletionStatus = (typeof FormCompletionStatus)[keyof typeof FormCompletionStatus]

// ─── TaxBandits Form Definition ─────────────────────────────────────────

export interface TaxBanditsFormDefinition {
  id: TaxFormType
  name: string
  fullName: string
  description: string
  category: FormCategory
  taxBanditsPath: string | null
}

// ─── Build definitions from types ───────────────────────────────────────

function buildFormDefinitions(): TaxBanditsFormDefinition[] {
  return Object.values(TaxFormTypeValues).map((formType) => ({
    id: formType,
    name: TAX_FORM_LABELS[formType],
    fullName: TAX_FORM_DESCRIPTIONS[formType],
    description: TAX_FORM_DESCRIPTIONS[formType],
    category: FORM_CATEGORY_MAP[formType],
    taxBanditsPath: TAXBANDITS_FORM_PATHS[formType] ?? null,
  }))
}

export const TAXBANDITS_FORM_DEFINITIONS: TaxBanditsFormDefinition[] = buildFormDefinitions()

// ─── Form Category Labels ───────────────────────────────────────────────

export const FORM_CATEGORY_LABELS: Record<FormCategory, string> = {
  [FormCategoryValues.Series1099]: '1099 Series',
  [FormCategoryValues.W2Employment]: 'W-2 Employment',
  [FormCategoryValues.Payroll94x]: 'Payroll (94x)',
  [FormCategoryValues.ACAReporting]: 'ACA Reporting',
  [FormCategoryValues.WithholdingCerts]: 'Withholding Certificates',
  [FormCategoryValues.Series5498]: '5498 Series',
  [FormCategoryValues.Series1098]: '1098 Series',
  [FormCategoryValues.Extensions]: 'Extensions',
  [FormCategoryValues.Other]: 'Other',
}

// ─── Wizard Steps ───────────────────────────────────────────────────────

export const WIZARD_STEPS = ['Payer Info', 'Recipient Info', 'Amounts', 'State Info', 'Review'] as const

export type WizardStep = (typeof WIZARD_STEPS)[number]

// ─── Form Entry Data ────────────────────────────────────────────────────

export interface FormEntryData {
  // Payer / Employer info
  payerName: string
  payerTin: string
  payerAddress: string
  payerCity: string
  payerState: string
  payerZip: string
  // Recipient / Employee info
  recipientName: string
  recipientTin: string
  recipientAddress: string
  recipientCity: string
  recipientState: string
  recipientZip: string
  // Amounts — generic fields that map to different boxes by form type
  amount1: number
  amount2: number
  amount3: number
  amount4: number
  amount5: number
  amount6: number
  // State info
  stateCode: string
  stateTaxId: string
  stateIncome: number
  stateTaxWithheld: number
  // Additional
  accountNumber: string
  notes: string
}

const EMPTY_ENTRY_DATA: FormEntryData = {
  payerName: '',
  payerTin: '',
  payerAddress: '',
  payerCity: '',
  payerState: '',
  payerZip: '',
  recipientName: '',
  recipientTin: '',
  recipientAddress: '',
  recipientCity: '',
  recipientState: '',
  recipientZip: '',
  amount1: 0,
  amount2: 0,
  amount3: 0,
  amount4: 0,
  amount5: 0,
  amount6: 0,
  stateCode: '',
  stateTaxId: '',
  stateIncome: 0,
  stateTaxWithheld: 0,
  accountNumber: '',
  notes: '',
}

// ─── Form Entry ─────────────────────────────────────────────────────────

export interface FormEntry {
  id: string
  formId: TaxFormType
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
      formId: TaxFormTypeValues.NEC1099,
      taxYear: '2025',
      currentStep: 2,
      completedSteps: [0, 1],
      status: FormCompletionStatus.InProgress,
      data: {
        ...EMPTY_ENTRY_DATA,
        payerName: 'Acme Corporation',
        payerTin: '12-3456789',
        recipientName: 'Alex Johnson',
        recipientTin: '***-**-4589',
        amount1: 12000,
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
  startForm: (formId: TaxFormType, taxYear: string) => string
  updateFormData: (entryId: string, data: Partial<FormEntryData>) => void
  setCurrentStep: (entryId: string, step: number) => void
  completeStep: (entryId: string, step: number) => void
  completeForm: (entryId: string) => void
  deleteEntry: (entryId: string) => void

  // Clear data
  clearData: () => void

  // Queries
  getEntry: (entryId: string) => FormEntry | undefined
  getEntryByForm: (formId: TaxFormType, taxYear: string) => FormEntry | undefined
  getFormStatus: (formId: TaxFormType, taxYear: string) => FormCompletionStatus
  getProgressPercent: (entryId: string) => number
  getFormsByCategory: (category: FormCategory) => TaxBanditsFormDefinition[]
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

      clearData: () => {
        set({ entries: [] })
      },

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

      getFormsByCategory: (category) =>
        TAXBANDITS_FORM_DEFINITIONS.filter((f) => f.category === category),
    }),
    {
      name: 'origina-tax-form-storage',
      storage: createJSONStorage(() => createEncryptedStorage()),
      partialize: (state) => ({
        entries: state.entries,
      }),
    }
  )
)
