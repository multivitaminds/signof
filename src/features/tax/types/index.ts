// ─── Tax Year ────────────────────────────────────────────────────────

export const TaxYear = {
  Y2025: '2025',
  Y2024: '2024',
  Y2023: '2023',
} as const

export type TaxYear = (typeof TaxYear)[keyof typeof TaxYear]

// ─── Filing Status ───────────────────────────────────────────────────

export const FilingStatus = {
  Single: 'single',
  MarriedJoint: 'married_joint',
  MarriedSeparate: 'married_separate',
  HeadOfHousehold: 'head_of_household',
  QualifyingWidow: 'qualifying_widow',
} as const

export type FilingStatus = (typeof FilingStatus)[keyof typeof FilingStatus]

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  [FilingStatus.Single]: 'Single',
  [FilingStatus.MarriedJoint]: 'Married Filing Jointly',
  [FilingStatus.MarriedSeparate]: 'Married Filing Separately',
  [FilingStatus.HeadOfHousehold]: 'Head of Household',
  [FilingStatus.QualifyingWidow]: 'Qualifying Surviving Spouse',
}

// ─── Tax Form Type ───────────────────────────────────────────────────

export const TaxFormType = {
  W2: 'w2',
  NEC1099: '1099_nec',
  INT1099: '1099_int',
  DIV1099: '1099_div',
  MISC1099: '1099_misc',
  Mortgage1098: '1098',
  ACA1095A: '1095_a',
  W9: 'w9',
} as const

export type TaxFormType = (typeof TaxFormType)[keyof typeof TaxFormType]

export const TAX_FORM_LABELS: Record<TaxFormType, string> = {
  [TaxFormType.W2]: 'W-2',
  [TaxFormType.NEC1099]: '1099-NEC',
  [TaxFormType.INT1099]: '1099-INT',
  [TaxFormType.DIV1099]: '1099-DIV',
  [TaxFormType.MISC1099]: '1099-MISC',
  [TaxFormType.Mortgage1098]: '1098',
  [TaxFormType.ACA1095A]: '1095-A',
  [TaxFormType.W9]: 'W-9',
}

export const TAX_FORM_DESCRIPTIONS: Record<TaxFormType, string> = {
  [TaxFormType.W2]: 'Wage and Tax Statement from your employer',
  [TaxFormType.NEC1099]: 'Nonemployee Compensation (freelance/contract income)',
  [TaxFormType.INT1099]: 'Interest Income from banks and financial institutions',
  [TaxFormType.DIV1099]: 'Dividends and Distributions from investments',
  [TaxFormType.MISC1099]: 'Miscellaneous Income (rents, royalties, etc.)',
  [TaxFormType.Mortgage1098]: 'Mortgage Interest Statement',
  [TaxFormType.ACA1095A]: 'Health Insurance Marketplace Statement',
  [TaxFormType.W9]: 'Request for Taxpayer Identification Number',
}

// ─── Filing State ────────────────────────────────────────────────────

export const FilingState = {
  NotStarted: 'not_started',
  InProgress: 'in_progress',
  Review: 'review',
  ReadyToFile: 'ready_to_file',
  Filed: 'filed',
  Accepted: 'accepted',
  Rejected: 'rejected',
} as const

export type FilingState = (typeof FilingState)[keyof typeof FilingState]

export const FILING_STATE_LABELS: Record<FilingState, string> = {
  [FilingState.NotStarted]: 'Not Started',
  [FilingState.InProgress]: 'In Progress',
  [FilingState.Review]: 'Under Review',
  [FilingState.ReadyToFile]: 'Ready to File',
  [FilingState.Filed]: 'Filed',
  [FilingState.Accepted]: 'Accepted',
  [FilingState.Rejected]: 'Rejected',
}

// ─── Interfaces ──────────────────────────────────────────────────────

export interface ExtractedField {
  key: string
  value: string
}

export interface TaxDocument {
  id: string
  name: string
  type: TaxFormType
  taxYear: TaxYear
  uploadedAt: string
  extractionStatus: 'pending' | 'extracting' | 'completed' | 'failed'
  extractedData: ExtractedField[]
}

export interface TaxAddress {
  street: string
  apt: string
  city: string
  state: string
  zip: string
}

export interface TaxFiling {
  id: string
  taxYear: TaxYear
  state: FilingState
  filingStatus: FilingStatus
  // Personal info
  firstName: string
  lastName: string
  ssn: string
  email: string
  phone: string
  address: TaxAddress
  // Income
  wages: number
  otherIncome: number
  totalIncome: number
  // Deductions
  useStandardDeduction: boolean
  standardDeduction: number
  itemizedDeductions: number
  effectiveDeduction: number
  // Tax calculations
  taxableIncome: number
  federalTax: number
  estimatedPayments: number
  withheld: number
  refundOrOwed: number
  // Timestamps
  createdAt: string
  updatedAt: string
  filedAt: string | null
}

export interface TaxDeadline {
  id: string
  title: string
  description: string
  date: string
  completed: boolean
  taxYear: TaxYear
}

// ─── TaxBandit Integration ──────────────────────────────────────────

export interface TaxBanditConfig {
  clientId: string
  clientSecret: string
  userToken: string
  useSandbox: boolean
}

export interface TaxBanditValidationError {
  id: string
  field: string
  message: string
  code: string
}

export const TransmissionStatus = {
  Idle: 'idle',
  Validating: 'validating',
  Transmitting: 'transmitting',
  Polling: 'polling',
  Complete: 'complete',
  Error: 'error',
} as const

export type TransmissionStatus =
  (typeof TransmissionStatus)[keyof typeof TransmissionStatus]

// ─── Helpers ─────────────────────────────────────────────────────────

export const TAX_YEARS: TaxYear[] = [TaxYear.Y2025, TaxYear.Y2024, TaxYear.Y2023]

/** 2025 standard deduction for single filers */
export const STANDARD_DEDUCTION_2025 = 15000

/** Simplified 2025 federal tax brackets (single filer) */
export const TAX_BRACKETS_2025 = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11601, max: 47150, rate: 0.12 },
  { min: 47151, max: 100525, rate: 0.22 },
  { min: 100526, max: 191950, rate: 0.24 },
  { min: 191951, max: 243725, rate: 0.32 },
  { min: 243726, max: 609350, rate: 0.35 },
  { min: 609351, max: Infinity, rate: 0.37 },
] as const
