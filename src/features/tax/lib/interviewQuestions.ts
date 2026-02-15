import type { InterviewQuestion, InterviewSectionId } from '../types'
import { InterviewSectionId as SectionId, InterviewQuestionType } from '../types'

// ─── Interview Questions ────────────────────────────────────────────────
//
// 3-5 questions per section, covering the full TurboTax-style interview
// flow. Each question has a unique id prefixed with its section for
// easy filtering and answer lookup.

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // ─── Personal Information ───────────────────────────────────────────
  {
    id: 'personal_info_first_name',
    section: SectionId.PersonalInfo,
    text: 'What is your first name?',
    helpText: 'Enter your legal first name as it appears on your Social Security card.',
    inputType: InterviewQuestionType.Text,
    fieldKey: 'firstName',
  },
  {
    id: 'personal_info_last_name',
    section: SectionId.PersonalInfo,
    text: 'What is your last name?',
    helpText: 'Enter your legal last name as it appears on your Social Security card.',
    inputType: InterviewQuestionType.Text,
    fieldKey: 'lastName',
  },
  {
    id: 'personal_info_ssn',
    section: SectionId.PersonalInfo,
    text: 'What is your Social Security Number?',
    helpText: 'We encrypt your SSN and only store the last 4 digits for display.',
    inputType: InterviewQuestionType.Text,
    fieldKey: 'ssn',
  },
  {
    id: 'personal_info_email',
    section: SectionId.PersonalInfo,
    text: 'What is your email address?',
    helpText: 'We will send your filing confirmation and any IRS notices to this email.',
    inputType: InterviewQuestionType.Text,
    fieldKey: 'email',
  },
  {
    id: 'personal_info_phone',
    section: SectionId.PersonalInfo,
    text: 'What is your phone number?',
    helpText: 'Used for identity verification and IRS contact if needed.',
    inputType: InterviewQuestionType.Text,
    fieldKey: 'phone',
  },

  // ─── Filing Status ──────────────────────────────────────────────────
  {
    id: 'filing_status_status',
    section: SectionId.FilingStatus,
    text: 'What is your filing status?',
    helpText: 'Your filing status determines your tax bracket and standard deduction amount.',
    inputType: InterviewQuestionType.Select,
    fieldKey: 'filingStatus',
    options: [
      { value: 'single', label: 'Single' },
      { value: 'married_joint', label: 'Married Filing Jointly' },
      { value: 'married_separate', label: 'Married Filing Separately' },
      { value: 'head_of_household', label: 'Head of Household' },
      { value: 'qualifying_widow', label: 'Qualifying Surviving Spouse' },
    ],
  },

  // ─── Dependents ─────────────────────────────────────────────────────
  {
    id: 'dependents_has_dependents',
    section: SectionId.Dependents,
    text: 'Do you have any dependents?',
    helpText: 'Dependents include children under 19, full-time students under 24, or qualifying relatives.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'hasDependents',
  },
  {
    id: 'dependents_count',
    section: SectionId.Dependents,
    text: 'How many dependents do you have?',
    helpText: 'Enter the total number of qualifying dependents you will claim.',
    inputType: InterviewQuestionType.Text,
    fieldKey: 'dependentCount',
    conditional: { questionId: 'dependents_has_dependents', value: 'true' },
  },
  {
    id: 'dependents_child_credit',
    section: SectionId.Dependents,
    text: 'Are any of your dependents under 17?',
    helpText: 'Children under 17 may qualify for the Child Tax Credit of up to $2,000 per child.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'hasChildCredit',
    conditional: { questionId: 'dependents_has_dependents', value: 'true' },
  },

  // ─── W-2 Income ─────────────────────────────────────────────────────
  {
    id: 'income_w2_received',
    section: SectionId.IncomeW2,
    text: 'Did you receive any W-2 forms this year?',
    helpText: 'W-2 forms report wages earned from an employer.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'hasW2',
  },
  {
    id: 'income_w2_wages',
    section: SectionId.IncomeW2,
    text: 'What were your total wages from all W-2s?',
    helpText: 'This is Box 1 on your W-2. Add up all W-2 forms if you have more than one.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'wages',
    conditional: { questionId: 'income_w2_received', value: 'true' },
  },
  {
    id: 'income_w2_withheld',
    section: SectionId.IncomeW2,
    text: 'How much federal tax was withheld?',
    helpText: 'This is Box 2 on your W-2. Add all W-2 withholding amounts together.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'withheld',
    conditional: { questionId: 'income_w2_received', value: 'true' },
  },
  {
    id: 'income_w2_upload',
    section: SectionId.IncomeW2,
    text: 'Would you like to upload your W-2?',
    helpText: 'Upload a photo or PDF of your W-2 and we will auto-fill the numbers for you.',
    inputType: InterviewQuestionType.Upload,
    fieldKey: 'w2Upload',
    conditional: { questionId: 'income_w2_received', value: 'true' },
  },

  // ─── 1099 Income ────────────────────────────────────────────────────
  {
    id: 'income_1099_received',
    section: SectionId.Income1099,
    text: 'Did you receive any 1099 forms?',
    helpText: '1099 forms report freelance income, contract work, interest, dividends, etc.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'has1099',
  },
  {
    id: 'income_1099_total',
    section: SectionId.Income1099,
    text: 'What was your total 1099 income?',
    helpText: 'Add up all 1099-NEC, 1099-MISC, and other 1099 income amounts.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'otherIncome',
    conditional: { questionId: 'income_1099_received', value: 'true' },
  },
  {
    id: 'income_1099_upload',
    section: SectionId.Income1099,
    text: 'Would you like to upload your 1099 forms?',
    helpText: 'Upload a photo or PDF and we will extract the data automatically.',
    inputType: InterviewQuestionType.Upload,
    fieldKey: '1099Upload',
    conditional: { questionId: 'income_1099_received', value: 'true' },
  },

  // ─── Investment Income ──────────────────────────────────────────────
  {
    id: 'income_investments_has',
    section: SectionId.IncomeInvestments,
    text: 'Did you have any investment income this year?',
    helpText: 'This includes interest, dividends, and capital gains from stocks, bonds, or mutual funds.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'hasInvestmentIncome',
  },
  {
    id: 'income_investments_interest',
    section: SectionId.IncomeInvestments,
    text: 'What was your total interest income?',
    helpText: 'This is from 1099-INT forms from banks and financial institutions.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'interestIncome',
    conditional: { questionId: 'income_investments_has', value: 'true' },
  },
  {
    id: 'income_investments_dividends',
    section: SectionId.IncomeInvestments,
    text: 'What was your total dividend income?',
    helpText: 'This is from 1099-DIV forms from your brokerage or investment accounts.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'dividendIncome',
    conditional: { questionId: 'income_investments_has', value: 'true' },
  },
  {
    id: 'income_investments_capital_gains',
    section: SectionId.IncomeInvestments,
    text: 'What was your net capital gain or loss?',
    helpText: 'Enter total from 1099-B. Use a negative number for a net capital loss.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'capitalGains',
    conditional: { questionId: 'income_investments_has', value: 'true' },
  },

  // ─── Business Income ────────────────────────────────────────────────
  {
    id: 'income_business_has',
    section: SectionId.IncomeBusiness,
    text: 'Did you have any self-employment or business income?',
    helpText: 'This includes sole proprietorship, LLC, freelance, or gig economy income.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'hasBusinessIncome',
  },
  {
    id: 'income_business_type',
    section: SectionId.IncomeBusiness,
    text: 'What type of business do you operate?',
    helpText: 'Select the category that best describes your business activity.',
    inputType: InterviewQuestionType.Select,
    fieldKey: 'businessType',
    conditional: { questionId: 'income_business_has', value: 'true' },
    options: [
      { value: 'freelance', label: 'Freelance / Independent Contractor' },
      { value: 'sole_prop', label: 'Sole Proprietorship' },
      { value: 'llc', label: 'LLC (Single Member)' },
      { value: 'gig', label: 'Gig Economy (Uber, DoorDash, etc.)' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'income_business_gross',
    section: SectionId.IncomeBusiness,
    text: 'What was your gross business income?',
    helpText: 'Total revenue before subtracting expenses.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'grossBusinessIncome',
    conditional: { questionId: 'income_business_has', value: 'true' },
  },
  {
    id: 'income_business_expenses',
    section: SectionId.IncomeBusiness,
    text: 'What were your total business expenses?',
    helpText: 'Include office supplies, travel, equipment, software, and other deductible costs.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'businessExpenses',
    conditional: { questionId: 'income_business_has', value: 'true' },
  },
  {
    id: 'income_business_home_office',
    section: SectionId.IncomeBusiness,
    text: 'Did you use part of your home for business?',
    helpText: 'You may qualify for the home office deduction if you regularly use a dedicated space.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'hasHomeOffice',
    conditional: { questionId: 'income_business_has', value: 'true' },
  },

  // ─── Other Income ───────────────────────────────────────────────────
  {
    id: 'income_other_has',
    section: SectionId.IncomeOther,
    text: 'Did you receive any other income?',
    helpText: 'This includes rental income, alimony, Social Security benefits, gambling winnings, etc.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'hasOtherIncome',
  },
  {
    id: 'income_other_rental',
    section: SectionId.IncomeOther,
    text: 'What was your net rental income?',
    helpText: 'Gross rental income minus expenses (repairs, insurance, depreciation).',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'rentalIncome',
    conditional: { questionId: 'income_other_has', value: 'true' },
  },
  {
    id: 'income_other_social_security',
    section: SectionId.IncomeOther,
    text: 'Did you receive Social Security benefits?',
    helpText: 'Enter the total from Box 5 of your SSA-1099.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'socialSecurityBenefits',
    conditional: { questionId: 'income_other_has', value: 'true' },
  },

  // ─── Standard Deduction ─────────────────────────────────────────────
  {
    id: 'deductions_standard_use',
    section: SectionId.DeductionsStandard,
    text: 'Would you like to take the standard deduction?',
    helpText: 'The 2025 standard deduction is $15,000 for single filers. Most taxpayers benefit from the standard deduction.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'useStandardDeduction',
  },

  // ─── Itemized Deductions ────────────────────────────────────────────
  {
    id: 'deductions_itemized_mortgage',
    section: SectionId.DeductionsItemized,
    text: 'How much mortgage interest did you pay?',
    helpText: 'This is from Form 1098 from your mortgage lender.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'mortgageInterest',
  },
  {
    id: 'deductions_itemized_salt',
    section: SectionId.DeductionsItemized,
    text: 'How much state and local tax (SALT) did you pay?',
    helpText: 'Includes state income tax and property tax. The SALT deduction is capped at $10,000.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'saltTaxes',
  },
  {
    id: 'deductions_itemized_charitable',
    section: SectionId.DeductionsItemized,
    text: 'How much did you donate to charity?',
    helpText: 'Cash and non-cash donations to qualified charitable organizations.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'charitableDonations',
  },
  {
    id: 'deductions_itemized_medical',
    section: SectionId.DeductionsItemized,
    text: 'What were your total medical expenses?',
    helpText: 'Only the amount exceeding 7.5% of your adjusted gross income is deductible.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'medicalExpenses',
  },
  {
    id: 'deductions_itemized_student_loan',
    section: SectionId.DeductionsItemized,
    text: 'How much student loan interest did you pay?',
    helpText: 'Deductible up to $2,500 from Form 1098-E.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'studentLoanInterest',
  },

  // ─── Tax Credits ────────────────────────────────────────────────────
  {
    id: 'credits_child',
    section: SectionId.Credits,
    text: 'Do you qualify for the Child Tax Credit?',
    helpText: 'Up to $2,000 per qualifying child under age 17.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'hasChildTaxCredit',
  },
  {
    id: 'credits_education',
    section: SectionId.Credits,
    text: 'Did you pay for higher education expenses?',
    helpText: 'You may qualify for the American Opportunity or Lifetime Learning Credit.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'hasEducationCredit',
  },
  {
    id: 'credits_education_amount',
    section: SectionId.Credits,
    text: 'How much did you pay in tuition and fees?',
    helpText: 'Enter the amount from Form 1098-T from your educational institution.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'educationExpenses',
    conditional: { questionId: 'credits_education', value: 'true' },
  },
  {
    id: 'credits_energy',
    section: SectionId.Credits,
    text: 'Did you make energy-efficient home improvements?',
    helpText: 'Solar panels, heat pumps, and other qualifying improvements may earn a tax credit.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'hasEnergyCredit',
  },

  // ─── Health Insurance ───────────────────────────────────────────────
  {
    id: 'health_insurance_type',
    section: SectionId.HealthInsurance,
    text: 'How did you get health insurance this year?',
    helpText: 'Select your primary source of health coverage.',
    inputType: InterviewQuestionType.Select,
    fieldKey: 'healthInsuranceType',
    options: [
      { value: 'employer', label: 'Through my employer' },
      { value: 'marketplace', label: 'ACA Marketplace (Healthcare.gov)' },
      { value: 'medicare', label: 'Medicare' },
      { value: 'medicaid', label: 'Medicaid' },
      { value: 'none', label: 'I did not have coverage' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'health_insurance_1095a',
    section: SectionId.HealthInsurance,
    text: 'Would you like to upload your Form 1095-A?',
    helpText: 'If you had Marketplace coverage, upload your 1095-A to reconcile premium tax credits.',
    inputType: InterviewQuestionType.Upload,
    fieldKey: '1095aUpload',
    conditional: { questionId: 'health_insurance_type', value: 'marketplace' },
  },

  // ─── Estimated Payments ─────────────────────────────────────────────
  {
    id: 'estimated_payments_made',
    section: SectionId.EstimatedPayments,
    text: 'Did you make any estimated tax payments?',
    helpText: 'Quarterly payments made to the IRS using Form 1040-ES.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'madeEstimatedPayments',
  },
  {
    id: 'estimated_payments_amount',
    section: SectionId.EstimatedPayments,
    text: 'What was the total amount of estimated payments?',
    helpText: 'Add up all quarterly estimated tax payments made for the tax year.',
    inputType: InterviewQuestionType.Currency,
    fieldKey: 'estimatedPayments',
    conditional: { questionId: 'estimated_payments_made', value: 'true' },
  },

  // ─── Bank Information ───────────────────────────────────────────────
  {
    id: 'bank_info_direct_deposit',
    section: SectionId.BankInfo,
    text: 'Would you like your refund via direct deposit?',
    helpText: 'Direct deposit is the fastest way to receive your refund (typically 1-3 weeks).',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'wantDirectDeposit',
  },
  {
    id: 'bank_info_routing',
    section: SectionId.BankInfo,
    text: 'What is your bank routing number?',
    helpText: 'The 9-digit number at the bottom left of your check.',
    inputType: InterviewQuestionType.Text,
    fieldKey: 'routingNumber',
    conditional: { questionId: 'bank_info_direct_deposit', value: 'true' },
  },
  {
    id: 'bank_info_account',
    section: SectionId.BankInfo,
    text: 'What is your bank account number?',
    helpText: 'Your account number, found on your check or bank statement.',
    inputType: InterviewQuestionType.Text,
    fieldKey: 'accountNumber',
    conditional: { questionId: 'bank_info_direct_deposit', value: 'true' },
  },

  // ─── Review ─────────────────────────────────────────────────────────
  {
    id: 'review_confirm',
    section: SectionId.Review,
    text: 'Have you reviewed all your information?',
    helpText: 'Confirm that all entries are accurate before filing. You can go back to edit any section.',
    inputType: InterviewQuestionType.YesNo,
    fieldKey: 'reviewConfirmed',
  },
]

/**
 * Get questions for a specific interview section.
 */
export function getQuestionsForSection(sectionId: InterviewSectionId): InterviewQuestion[] {
  return INTERVIEW_QUESTIONS.filter((q) => q.section === sectionId)
}

/**
 * Get a single question by its ID.
 */
export function getQuestionById(questionId: string): InterviewQuestion | undefined {
  return INTERVIEW_QUESTIONS.find((q) => q.id === questionId)
}

/**
 * Tax topics used by the TopicTileGrid for topic selection phase.
 */
export const TAX_TOPICS = [
  { id: 'w2_income', label: 'W-2 Income', description: 'Wages from an employer', icon: 'briefcase' },
  { id: '1099_income', label: '1099 Income', description: 'Freelance or contract work', icon: 'file-text' },
  { id: 'investments', label: 'Investments', description: 'Stocks, bonds, crypto', icon: 'trending-up' },
  { id: 'business', label: 'Business Income', description: 'Self-employed or small business', icon: 'building' },
  { id: 'rental', label: 'Rental Income', description: 'Income from rental properties', icon: 'home' },
  { id: 'retirement', label: 'Retirement Income', description: 'Pensions, IRA, Social Security', icon: 'clock' },
  { id: 'education', label: 'Education', description: 'Student loans, tuition credits', icon: 'graduation-cap' },
  { id: 'health', label: 'Health Insurance', description: 'ACA marketplace coverage', icon: 'heart' },
  { id: 'deductions', label: 'Itemized Deductions', description: 'Mortgage, charity, medical', icon: 'dollar-sign' },
] as const
