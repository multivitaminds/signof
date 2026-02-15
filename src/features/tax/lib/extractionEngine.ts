import type { ExtractionResult, TaxFormType, ExtractionField } from '../types'
import { ExtractionConfidence, TaxFormType as TaxFormTypeValues } from '../types'

// ─── Extraction Steps ───────────────────────────────────────────────────
//
// Simulated extraction pipeline that runs through each step with delays
// to give the user visual feedback during document processing.

export interface ExtractionStep {
  label: string
  duration: number
}

export const EXTRACTION_STEPS: ExtractionStep[] = [
  { label: 'Analyzing document format...', duration: 500 },
  { label: 'Identifying form type...', duration: 400 },
  { label: 'Reading field values...', duration: 800 },
  { label: 'Validating extracted data...', duration: 300 },
]

// ─── Field Templates ────────────────────────────────────────────────────
//
// Form-type-specific field templates that define what data can be
// extracted from each tax form type.

interface FieldTemplate {
  key: string
  defaultValue: string
}

const FIELD_TEMPLATES: Partial<Record<TaxFormType, FieldTemplate[]>> = {
  [TaxFormTypeValues.W2]: [
    { key: 'Employer Name', defaultValue: '' },
    { key: 'Employer EIN', defaultValue: '' },
    { key: 'Wages (Box 1)', defaultValue: '0.00' },
    { key: 'Federal Tax Withheld (Box 2)', defaultValue: '0.00' },
    { key: 'Social Security Wages (Box 3)', defaultValue: '0.00' },
    { key: 'Social Security Tax (Box 4)', defaultValue: '0.00' },
    { key: 'Medicare Wages (Box 5)', defaultValue: '0.00' },
    { key: 'Medicare Tax (Box 6)', defaultValue: '0.00' },
    { key: 'State (Box 15)', defaultValue: '' },
    { key: 'State Income (Box 16)', defaultValue: '0.00' },
    { key: 'State Tax Withheld (Box 17)', defaultValue: '0.00' },
  ],
  [TaxFormTypeValues.NEC1099]: [
    { key: 'Payer Name', defaultValue: '' },
    { key: 'Payer TIN', defaultValue: '' },
    { key: 'Nonemployee Compensation (Box 1)', defaultValue: '0.00' },
    { key: 'Federal Tax Withheld (Box 4)', defaultValue: '0.00' },
  ],
  [TaxFormTypeValues.MISC1099]: [
    { key: 'Payer Name', defaultValue: '' },
    { key: 'Payer TIN', defaultValue: '' },
    { key: 'Rents (Box 1)', defaultValue: '0.00' },
    { key: 'Royalties (Box 2)', defaultValue: '0.00' },
    { key: 'Other Income (Box 3)', defaultValue: '0.00' },
    { key: 'Federal Tax Withheld (Box 4)', defaultValue: '0.00' },
  ],
  [TaxFormTypeValues.INT1099]: [
    { key: 'Payer Name', defaultValue: '' },
    { key: 'Interest Income (Box 1)', defaultValue: '0.00' },
    { key: 'Early Withdrawal Penalty (Box 2)', defaultValue: '0.00' },
    { key: 'Interest on US Savings Bonds (Box 3)', defaultValue: '0.00' },
    { key: 'Federal Tax Withheld (Box 4)', defaultValue: '0.00' },
  ],
  [TaxFormTypeValues.DIV1099]: [
    { key: 'Payer Name', defaultValue: '' },
    { key: 'Total Ordinary Dividends (Box 1a)', defaultValue: '0.00' },
    { key: 'Qualified Dividends (Box 1b)', defaultValue: '0.00' },
    { key: 'Total Capital Gain Distributions (Box 2a)', defaultValue: '0.00' },
    { key: 'Federal Tax Withheld (Box 4)', defaultValue: '0.00' },
  ],
  [TaxFormTypeValues.Mortgage1098]: [
    { key: 'Lender Name', defaultValue: '' },
    { key: 'Mortgage Interest Received (Box 1)', defaultValue: '0.00' },
    { key: 'Points Paid (Box 2)', defaultValue: '0.00' },
    { key: 'Mortgage Insurance Premiums (Box 5)', defaultValue: '0.00' },
  ],
  [TaxFormTypeValues.ACA1095A]: [
    { key: 'Marketplace Identifier', defaultValue: '' },
    { key: 'Policy Number', defaultValue: '' },
    { key: 'Monthly Premium (Column A)', defaultValue: '0.00' },
    { key: 'Monthly SLCSP Premium (Column B)', defaultValue: '0.00' },
    { key: 'Monthly APTC (Column C)', defaultValue: '0.00' },
  ],
  [TaxFormTypeValues.R1099]: [
    { key: 'Payer Name', defaultValue: '' },
    { key: 'Gross Distribution (Box 1)', defaultValue: '0.00' },
    { key: 'Taxable Amount (Box 2a)', defaultValue: '0.00' },
    { key: 'Federal Tax Withheld (Box 4)', defaultValue: '0.00' },
    { key: 'Distribution Code (Box 7)', defaultValue: '' },
  ],
  [TaxFormTypeValues.K1099]: [
    { key: 'Filer Name', defaultValue: '' },
    { key: 'Gross Amount (Box 1a)', defaultValue: '0.00' },
    { key: 'Card Not Present Transactions (Box 1b)', defaultValue: '0.00' },
    { key: 'Federal Tax Withheld (Box 4)', defaultValue: '0.00' },
  ],
  [TaxFormTypeValues.E1098]: [
    { key: 'Lender Name', defaultValue: '' },
    { key: 'Student Loan Interest (Box 1)', defaultValue: '0.00' },
  ],
  [TaxFormTypeValues.T1098]: [
    { key: 'Institution Name', defaultValue: '' },
    { key: 'Payments Received for Tuition (Box 1)', defaultValue: '0.00' },
    { key: 'Scholarships or Grants (Box 5)', defaultValue: '0.00' },
  ],
}

// ─── Helpers ────────────────────────────────────────────────────────────

function randomConfidence(): ExtractionConfidence {
  const roll = Math.random()
  if (roll < 0.6) return ExtractionConfidence.High
  if (roll < 0.9) return ExtractionConfidence.Medium
  return ExtractionConfidence.Low
}

function calculateOverallConfidence(fields: ExtractionField[]): number {
  if (fields.length === 0) return 0
  const weights: Record<ExtractionConfidence, number> = {
    [ExtractionConfidence.High]: 1.0,
    [ExtractionConfidence.Medium]: 0.7,
    [ExtractionConfidence.Low]: 0.3,
  }
  const total = fields.reduce((sum, f) => sum + weights[f.confidence], 0)
  return Math.round((total / fields.length) * 100)
}

function generateWarnings(fields: ExtractionField[]): string[] {
  const warnings: string[] = []
  const lowConfidenceFields = fields.filter(
    (f) => f.confidence === ExtractionConfidence.Low
  )
  if (lowConfidenceFields.length > 0) {
    warnings.push(
      `${lowConfidenceFields.length} field${lowConfidenceFields.length > 1 ? 's have' : ' has'} low confidence and may need manual review.`
    )
  }
  const emptyFields = fields.filter((f) => f.value === '' || f.value === '0.00')
  if (emptyFields.length > 0) {
    warnings.push(
      `${emptyFields.length} field${emptyFields.length > 1 ? 's were' : ' was'} not detected. Please fill in manually.`
    )
  }
  return warnings
}

// ─── Main Extraction Function ───────────────────────────────────────────

/**
 * Simulate extracting data from a tax document.
 * Runs through visual steps and generates fields from the form template.
 */
export async function extractDocument(
  formType: TaxFormType,
  onStep?: (step: ExtractionStep, index: number) => void
): Promise<ExtractionResult> {
  // Run through each step with delays
  for (let i = 0; i < EXTRACTION_STEPS.length; i++) {
    const step = EXTRACTION_STEPS[i]!
    onStep?.(step, i)
    await new Promise((resolve) => setTimeout(resolve, step.duration))
  }

  // Generate fields from template
  const template = FIELD_TEMPLATES[formType] ?? []
  const fields: ExtractionField[] = template.map((t) => ({
    key: t.key,
    value: t.defaultValue,
    confidence: randomConfidence(),
    confirmed: false,
  }))

  return {
    fields,
    overallConfidence: calculateOverallConfidence(fields),
    formType,
    warnings: generateWarnings(fields),
    extractedAt: new Date().toISOString(),
  }
}

/**
 * Get the list of form types that have extraction templates.
 */
export function getSupportedExtractionTypes(): TaxFormType[] {
  return Object.keys(FIELD_TEMPLATES) as TaxFormType[]
}
