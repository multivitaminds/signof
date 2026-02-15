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
  W2C: 'w2c',
  NEC1099: '1099_nec',
  INT1099: '1099_int',
  DIV1099: '1099_div',
  MISC1099: '1099_misc',
  K1099: '1099_k',
  R1099: '1099_r',
  A1099: '1099_a',
  B1099: '1099_b',
  C1099: '1099_c',
  G1099: '1099_g',
  LTC1099: '1099_ltc',
  OID1099: '1099_oid',
  PATR1099: '1099_patr',
  Q1099: '1099_q',
  S1099: '1099_s',
  SA1099: '1099_sa',
  Mortgage1098: '1098',
  E1098: '1098_e',
  T1098: '1098_t',
  ACA1095A: '1095_a',
  ACA1095C: '1095_c',
  ACA1094C: '1094_c',
  W9: 'w9',
  W8BEN: 'w8_ben',
  W8BENE: 'w8_bene',
  W8ECI: 'w8_eci',
  W8EXP: 'w8_exp',
  W8IMY: 'w8_imy',
  F940: '940',
  F941: '941',
  F943: '943',
  F944: '944',
  F5498: '5498',
  F5498SA: '5498_sa',
  F5498ESA: '5498_esa',
  F1042S: '1042_s',
  F3921: '3921',
  F3922: '3922',
  F8809: '8809',
} as const

export type TaxFormType = (typeof TaxFormType)[keyof typeof TaxFormType]

export const TAX_FORM_LABELS: Record<TaxFormType, string> = {
  [TaxFormType.W2]: 'W-2',
  [TaxFormType.W2C]: 'W-2c',
  [TaxFormType.NEC1099]: '1099-NEC',
  [TaxFormType.INT1099]: '1099-INT',
  [TaxFormType.DIV1099]: '1099-DIV',
  [TaxFormType.MISC1099]: '1099-MISC',
  [TaxFormType.K1099]: '1099-K',
  [TaxFormType.R1099]: '1099-R',
  [TaxFormType.A1099]: '1099-A',
  [TaxFormType.B1099]: '1099-B',
  [TaxFormType.C1099]: '1099-C',
  [TaxFormType.G1099]: '1099-G',
  [TaxFormType.LTC1099]: '1099-LTC',
  [TaxFormType.OID1099]: '1099-OID',
  [TaxFormType.PATR1099]: '1099-PATR',
  [TaxFormType.Q1099]: '1099-Q',
  [TaxFormType.S1099]: '1099-S',
  [TaxFormType.SA1099]: '1099-SA',
  [TaxFormType.Mortgage1098]: '1098',
  [TaxFormType.E1098]: '1098-E',
  [TaxFormType.T1098]: '1098-T',
  [TaxFormType.ACA1095A]: '1095-A',
  [TaxFormType.ACA1095C]: '1095-C',
  [TaxFormType.ACA1094C]: '1094-C',
  [TaxFormType.W9]: 'W-9',
  [TaxFormType.W8BEN]: 'W-8BEN',
  [TaxFormType.W8BENE]: 'W-8BEN-E',
  [TaxFormType.W8ECI]: 'W-8ECI',
  [TaxFormType.W8EXP]: 'W-8EXP',
  [TaxFormType.W8IMY]: 'W-8IMY',
  [TaxFormType.F940]: '940',
  [TaxFormType.F941]: '941',
  [TaxFormType.F943]: '943',
  [TaxFormType.F944]: '944',
  [TaxFormType.F5498]: '5498',
  [TaxFormType.F5498SA]: '5498-SA',
  [TaxFormType.F5498ESA]: '5498-ESA',
  [TaxFormType.F1042S]: '1042-S',
  [TaxFormType.F3921]: '3921',
  [TaxFormType.F3922]: '3922',
  [TaxFormType.F8809]: '8809',
}

export const TAX_FORM_DESCRIPTIONS: Record<TaxFormType, string> = {
  [TaxFormType.W2]: 'Wage and Tax Statement from your employer',
  [TaxFormType.W2C]: 'Corrected Wage and Tax Statement',
  [TaxFormType.NEC1099]: 'Nonemployee Compensation (freelance/contract income)',
  [TaxFormType.INT1099]: 'Interest Income from banks and financial institutions',
  [TaxFormType.DIV1099]: 'Dividends and Distributions from investments',
  [TaxFormType.MISC1099]: 'Miscellaneous Income (rents, royalties, etc.)',
  [TaxFormType.K1099]: 'Payment Card and Third-Party Network Transactions',
  [TaxFormType.R1099]: 'Distributions from Pensions, Annuities, IRAs, etc.',
  [TaxFormType.A1099]: 'Acquisition or Abandonment of Secured Property',
  [TaxFormType.B1099]: 'Proceeds from Broker and Barter Exchange Transactions',
  [TaxFormType.C1099]: 'Cancellation of Debt',
  [TaxFormType.G1099]: 'Certain Government Payments',
  [TaxFormType.LTC1099]: 'Long-Term Care and Accelerated Death Benefits',
  [TaxFormType.OID1099]: 'Original Issue Discount',
  [TaxFormType.PATR1099]: 'Taxable Distributions Received from Cooperatives',
  [TaxFormType.Q1099]: 'Payments from Qualified Education Programs',
  [TaxFormType.S1099]: 'Proceeds from Real Estate Transactions',
  [TaxFormType.SA1099]: 'Distributions from an HSA, Archer MSA, or Medicare Advantage MSA',
  [TaxFormType.Mortgage1098]: 'Mortgage Interest Statement',
  [TaxFormType.E1098]: 'Student Loan Interest Statement',
  [TaxFormType.T1098]: 'Tuition Statement',
  [TaxFormType.ACA1095A]: 'Health Insurance Marketplace Statement',
  [TaxFormType.ACA1095C]: 'Employer-Provided Health Insurance Offer and Coverage',
  [TaxFormType.ACA1094C]: 'Transmittal of Employer-Provided Health Insurance Offer and Coverage',
  [TaxFormType.W9]: 'Request for Taxpayer Identification Number',
  [TaxFormType.W8BEN]: 'Certificate of Foreign Status of Beneficial Owner (Individual)',
  [TaxFormType.W8BENE]: 'Certificate of Foreign Status of Beneficial Owner (Entity)',
  [TaxFormType.W8ECI]: 'Certificate of Foreign Person Claiming Income Effectively Connected',
  [TaxFormType.W8EXP]: 'Certificate of Foreign Government for US Tax Withholding',
  [TaxFormType.W8IMY]: 'Certificate of Foreign Intermediary for US Tax Withholding',
  [TaxFormType.F940]: 'Employer Annual Federal Unemployment (FUTA) Tax Return',
  [TaxFormType.F941]: 'Employer Quarterly Federal Tax Return',
  [TaxFormType.F943]: 'Employer Annual Federal Tax Return for Agricultural Employees',
  [TaxFormType.F944]: 'Employer Annual Federal Tax Return (small employers)',
  [TaxFormType.F5498]: 'IRA Contribution Information',
  [TaxFormType.F5498SA]: 'HSA, Archer MSA, or Medicare Advantage MSA Information',
  [TaxFormType.F5498ESA]: 'Coverdell ESA Contribution Information',
  [TaxFormType.F1042S]: 'Foreign Person US Source Income Subject to Withholding',
  [TaxFormType.F3921]: 'Exercise of an Incentive Stock Option under Section 422(b)',
  [TaxFormType.F3922]: 'Transfer of Stock Acquired through an ESPP under Section 423(c)',
  [TaxFormType.F8809]: 'Application for Extension of Time to File Information Returns',
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

// ─── Form Category ──────────────────────────────────────────────────

export const FormCategory = {
  Series1099: '1099_series',
  W2Employment: 'w2_employment',
  Payroll94x: 'payroll_94x',
  ACAReporting: 'aca_reporting',
  WithholdingCerts: 'withholding_certs',
  Series5498: '5498_series',
  Series1098: '1098_series',
  Extensions: 'extensions',
  Other: 'other',
} as const

export type FormCategory = (typeof FormCategory)[keyof typeof FormCategory]

// ─── TaxBandits Form Paths ──────────────────────────────────────────

export const TAXBANDITS_FORM_PATHS: Partial<Record<TaxFormType, string>> = {
  [TaxFormType.W2]: 'FormW2',
  [TaxFormType.W2C]: 'FormW2C',
  [TaxFormType.NEC1099]: 'Form1099NEC',
  [TaxFormType.INT1099]: 'Form1099INT',
  [TaxFormType.DIV1099]: 'Form1099DIV',
  [TaxFormType.MISC1099]: 'Form1099MISC',
  [TaxFormType.K1099]: 'Form1099K',
  [TaxFormType.R1099]: 'Form1099R',
  [TaxFormType.A1099]: 'Form1099A',
  [TaxFormType.B1099]: 'Form1099B',
  [TaxFormType.C1099]: 'Form1099C',
  [TaxFormType.G1099]: 'Form1099G',
  [TaxFormType.LTC1099]: 'Form1099LTC',
  [TaxFormType.OID1099]: 'Form1099OID',
  [TaxFormType.PATR1099]: 'Form1099PATR',
  [TaxFormType.Q1099]: 'Form1099Q',
  [TaxFormType.S1099]: 'Form1099S',
  [TaxFormType.SA1099]: 'Form1099SA',
  [TaxFormType.Mortgage1098]: 'Form1098',
  [TaxFormType.E1098]: 'Form1098E',
  [TaxFormType.T1098]: 'Form1098T',
  [TaxFormType.ACA1095A]: 'Form1095A',
  [TaxFormType.ACA1095C]: 'Form1095C',
  [TaxFormType.ACA1094C]: 'Form1094C',
  [TaxFormType.W9]: 'FormW9',
  [TaxFormType.W8BEN]: 'FormW8BEN',
  [TaxFormType.W8BENE]: 'FormW8BENE',
  [TaxFormType.W8ECI]: 'FormW8ECI',
  [TaxFormType.W8EXP]: 'FormW8EXP',
  [TaxFormType.W8IMY]: 'FormW8IMY',
  [TaxFormType.F940]: 'Form940',
  [TaxFormType.F941]: 'Form941',
  [TaxFormType.F943]: 'Form943',
  [TaxFormType.F944]: 'Form944',
  [TaxFormType.F5498]: 'Form5498',
  [TaxFormType.F5498SA]: 'Form5498SA',
  [TaxFormType.F5498ESA]: 'Form5498ESA',
  [TaxFormType.F1042S]: 'Form1042S',
  [TaxFormType.F3921]: 'Form3921',
  [TaxFormType.F3922]: 'Form3922',
  [TaxFormType.F8809]: 'Form8809',
}

// ─── Form Category Map ──────────────────────────────────────────────

export const FORM_CATEGORY_MAP: Record<TaxFormType, FormCategory> = {
  [TaxFormType.W2]: FormCategory.W2Employment,
  [TaxFormType.W2C]: FormCategory.W2Employment,
  [TaxFormType.NEC1099]: FormCategory.Series1099,
  [TaxFormType.INT1099]: FormCategory.Series1099,
  [TaxFormType.DIV1099]: FormCategory.Series1099,
  [TaxFormType.MISC1099]: FormCategory.Series1099,
  [TaxFormType.K1099]: FormCategory.Series1099,
  [TaxFormType.R1099]: FormCategory.Series1099,
  [TaxFormType.A1099]: FormCategory.Series1099,
  [TaxFormType.B1099]: FormCategory.Series1099,
  [TaxFormType.C1099]: FormCategory.Series1099,
  [TaxFormType.G1099]: FormCategory.Series1099,
  [TaxFormType.LTC1099]: FormCategory.Series1099,
  [TaxFormType.OID1099]: FormCategory.Series1099,
  [TaxFormType.PATR1099]: FormCategory.Series1099,
  [TaxFormType.Q1099]: FormCategory.Series1099,
  [TaxFormType.S1099]: FormCategory.Series1099,
  [TaxFormType.SA1099]: FormCategory.Series1099,
  [TaxFormType.Mortgage1098]: FormCategory.Series1098,
  [TaxFormType.E1098]: FormCategory.Series1098,
  [TaxFormType.T1098]: FormCategory.Series1098,
  [TaxFormType.ACA1095A]: FormCategory.ACAReporting,
  [TaxFormType.ACA1095C]: FormCategory.ACAReporting,
  [TaxFormType.ACA1094C]: FormCategory.ACAReporting,
  [TaxFormType.W9]: FormCategory.WithholdingCerts,
  [TaxFormType.W8BEN]: FormCategory.WithholdingCerts,
  [TaxFormType.W8BENE]: FormCategory.WithholdingCerts,
  [TaxFormType.W8ECI]: FormCategory.WithholdingCerts,
  [TaxFormType.W8EXP]: FormCategory.WithholdingCerts,
  [TaxFormType.W8IMY]: FormCategory.WithholdingCerts,
  [TaxFormType.F940]: FormCategory.Payroll94x,
  [TaxFormType.F941]: FormCategory.Payroll94x,
  [TaxFormType.F943]: FormCategory.Payroll94x,
  [TaxFormType.F944]: FormCategory.Payroll94x,
  [TaxFormType.F5498]: FormCategory.Series5498,
  [TaxFormType.F5498SA]: FormCategory.Series5498,
  [TaxFormType.F5498ESA]: FormCategory.Series5498,
  [TaxFormType.F1042S]: FormCategory.Other,
  [TaxFormType.F3921]: FormCategory.Other,
  [TaxFormType.F3922]: FormCategory.Other,
  [TaxFormType.F8809]: FormCategory.Extensions,
}

// ─── TaxBandit Submission ───────────────────────────────────────────

export interface TaxBanditSubmission {
  id: string
  formType: TaxFormType
  taxYear: TaxYear
  taxBanditSubmissionId: string | null
  taxBanditRecordId: string | null
  businessId: string | null
  state: FilingState
  payload: Record<string, unknown>
  validationErrors: TaxBanditValidationError[]
  irsErrors: Array<{ code: string; message: string }>
  pdfUrl: string | null
  createdAt: string
  updatedAt: string
  filedAt: string | null
}

// ─── Interview Types ────────────────────────────────────────────────

export const InterviewSectionId = {
  PersonalInfo: 'personal_info',
  FilingStatus: 'filing_status',
  Dependents: 'dependents',
  IncomeW2: 'income_w2',
  Income1099: 'income_1099',
  IncomeInvestments: 'income_investments',
  IncomeBusiness: 'income_business',
  IncomeOther: 'income_other',
  DeductionsStandard: 'deductions_standard',
  DeductionsItemized: 'deductions_itemized',
  Credits: 'credits',
  HealthInsurance: 'health_insurance',
  EstimatedPayments: 'estimated_payments',
  BankInfo: 'bank_info',
  Review: 'review',
} as const

export type InterviewSectionId = (typeof InterviewSectionId)[keyof typeof InterviewSectionId]

export const InterviewSectionStatus = {
  NotStarted: 'not_started',
  InProgress: 'in_progress',
  Completed: 'completed',
  Skipped: 'skipped',
} as const

export type InterviewSectionStatus = (typeof InterviewSectionStatus)[keyof typeof InterviewSectionStatus]

export interface InterviewSection {
  id: InterviewSectionId
  title: string
  description: string
  icon: string
  status: InterviewSectionStatus
}

export const InterviewQuestionType = {
  Text: 'text',
  Currency: 'currency',
  Select: 'select',
  YesNo: 'yesno',
  Tile: 'tile',
  Upload: 'upload',
  Date: 'date',
} as const

export type InterviewQuestionType = (typeof InterviewQuestionType)[keyof typeof InterviewQuestionType]

export interface InterviewQuestion {
  id: string
  section: InterviewSectionId
  text: string
  helpText: string
  inputType: InterviewQuestionType
  fieldKey: string
  options?: Array<{ value: string; label: string }>
  conditional?: { questionId: string; value: string }
}

export interface InterviewAnswer {
  questionId: string
  value: string | number | boolean
  confirmedAt: string
}

// ─── Webhook Events ─────────────────────────────────────────────────

export const WebhookEventType = {
  FormCreated: 'form_created',
  FormValidated: 'form_validated',
  FormTransmitted: 'form_transmitted',
  FormAccepted: 'form_accepted',
  FormRejected: 'form_rejected',
  FormError: 'form_error',
} as const

export type WebhookEventType = (typeof WebhookEventType)[keyof typeof WebhookEventType]

export interface WebhookEvent {
  id: string
  submissionId: string
  eventType: WebhookEventType
  payload: Record<string, unknown>
  receivedAt: string
}

// ─── Extraction Types ───────────────────────────────────────────────

export const ExtractionConfidence = {
  High: 'high',
  Medium: 'medium',
  Low: 'low',
} as const

export type ExtractionConfidence = (typeof ExtractionConfidence)[keyof typeof ExtractionConfidence]

export interface ExtractionField {
  key: string
  value: string
  confidence: ExtractionConfidence
  confirmed: boolean
}

export interface ExtractionResult {
  fields: ExtractionField[]
  overallConfidence: number
  formType: TaxFormType
  warnings: string[]
  extractedAt: string
}
