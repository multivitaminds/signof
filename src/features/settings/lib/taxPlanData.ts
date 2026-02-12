import type { TaxPlanId } from '../types'

// ─── Interfaces ──────────────────────────────────────────────────────

export interface TaxPlanFeature {
  text: string
  included: boolean
}

export interface TaxPricingPlan {
  id: TaxPlanId
  name: string
  description: string
  price: number
  target: string
  features: TaxPlanFeature[]
  stateFilingPrice: number | null
}

// ─── Tax Plan Definitions ────────────────────────────────────────────

export const TAX_PLANS: TaxPricingPlan[] = [
  {
    id: 'tax_free',
    name: 'Tax Free',
    description: 'Simple tax filing for W-2 employees.',
    price: 0,
    target: 'Simple W-2',
    stateFilingPrice: null,
    features: [
      { text: '1 federal filing', included: true },
      { text: 'W-2 & 1099-INT only', included: true },
      { text: 'Standard deduction', included: true },
      { text: 'Basic error check', included: true },
      { text: 'Unlimited filings', included: false },
      { text: 'All 1099 forms', included: false },
      { text: 'Auto data extraction', included: false },
      { text: 'Audit defense', included: false },
    ],
  },
  {
    id: 'tax_plus',
    name: 'Tax Plus',
    description: 'For freelancers and side hustlers.',
    price: 29,
    target: 'Freelancers',
    stateFilingPrice: 15,
    features: [
      { text: 'Unlimited federal filings', included: true },
      { text: 'All 1099 forms', included: true },
      { text: 'Auto data extraction', included: true },
      { text: 'Itemized deductions', included: true },
      { text: 'Priority support', included: true },
      { text: 'Schedule D / AMT', included: false },
      { text: 'Prior-year import', included: false },
      { text: 'CPA review', included: false },
    ],
  },
  {
    id: 'tax_premium',
    name: 'Tax Premium',
    description: 'For investors and complex returns.',
    price: 59,
    target: 'Investors',
    stateFilingPrice: 15,
    features: [
      { text: 'Unlimited federal filings', included: true },
      { text: 'All 1099 forms', included: true },
      { text: 'Auto data extraction', included: true },
      { text: 'Schedule D & AMT', included: true },
      { text: 'Prior-year import', included: true },
      { text: 'Audit defense', included: true },
      { text: 'Priority support', included: true },
      { text: 'CPA review', included: false },
    ],
  },
  {
    id: 'tax_business',
    name: 'Tax Business',
    description: 'For small businesses and self-employed.',
    price: 99,
    target: 'Small biz',
    stateFilingPrice: 15,
    features: [
      { text: 'Unlimited federal filings', included: true },
      { text: 'Schedule C & 1120-S', included: true },
      { text: 'Payroll forms', included: true },
      { text: 'Auto data extraction', included: true },
      { text: 'Prior-year import', included: true },
      { text: 'Audit defense', included: true },
      { text: 'CPA review', included: true },
      { text: 'Dedicated support', included: true },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────

export function getTaxPlanPrice(plan: TaxPricingPlan): string {
  if (plan.price === 0) return '$0'
  return `$${plan.price}`
}

export function getTaxPlanIndex(planId: TaxPlanId): number {
  return TAX_PLANS.findIndex((p) => p.id === planId)
}
