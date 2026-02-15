import type { TaxPlanId, TaxPlanCategory, PriceUnit } from '../types'

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
  competitorPrice: number | null
  target: string
  category: TaxPlanCategory
  priceUnit: PriceUnit
  popular: boolean
  features: TaxPlanFeature[]
  stateFilingPrice: number | null
}

// ─── Tax Plan Definitions ────────────────────────────────────────────

export const TAX_PLANS: TaxPricingPlan[] = [
  // ── Individual ──
  {
    id: 'individual_basic',
    name: 'Basic',
    description: 'Simple W-2 Returns',
    price: 49,
    competitorPrice: 89,
    target: 'Simple W-2',
    category: 'individual',
    priceUnit: 'one-time',
    popular: false,
    stateFilingPrice: null,
    features: [
      { text: '1 federal filing', included: true },
      { text: 'W-2 & 1099-INT import', included: true },
      { text: 'Standard deduction calc', included: true },
      { text: 'Basic error check', included: true },
      { text: 'Email support', included: true },
      { text: 'Multiple filings', included: false },
      { text: 'All 1099 forms', included: false },
      { text: 'AI extraction', included: false },
      { text: 'Audit defense', included: false },
    ],
  },
  {
    id: 'individual_plus',
    name: 'Plus',
    description: 'Freelancers & Side Hustles',
    price: 99,
    competitorPrice: 169,
    target: 'Freelancers',
    category: 'individual',
    priceUnit: 'one-time',
    popular: true,
    stateFilingPrice: 15,
    features: [
      { text: 'Unlimited federal filings', included: true },
      { text: 'All 1099 forms', included: true },
      { text: 'AI document extraction', included: true },
      { text: 'Itemized deductions', included: true },
      { text: 'Priority support', included: true },
      { text: 'Filing history', included: true },
      { text: 'Schedule D / AMT', included: false },
      { text: 'CPA review', included: false },
    ],
  },
  {
    id: 'individual_self_employed',
    name: 'Self-Employed',
    description: 'Contractors & Gig Workers',
    price: 179,
    competitorPrice: 249,
    target: 'Self-employed',
    category: 'individual',
    priceUnit: 'one-time',
    popular: false,
    stateFilingPrice: 15,
    features: [
      { text: 'Everything in Plus', included: true },
      { text: 'Schedule C & SE', included: true },
      { text: 'Quarterly estimates', included: true },
      { text: 'Business expense tracking', included: true },
      { text: 'Prior-year import', included: true },
      { text: 'Audit defense', included: true },
      { text: 'CPA review', included: false },
    ],
  },
  {
    id: 'individual_cpa',
    name: 'CPA Assisted',
    description: 'Full CPA Review',
    price: 299,
    competitorPrice: 399,
    target: 'Full service',
    category: 'individual',
    priceUnit: 'one-time',
    popular: false,
    stateFilingPrice: 15,
    features: [
      { text: 'Everything in Self-Employed', included: true },
      { text: 'CPA review & sign-off', included: true },
      { text: 'Tax planning consultation', included: true },
      { text: 'Amendment support', included: true },
      { text: 'Dedicated advisor', included: true },
    ],
  },

  // ── Business ──
  {
    id: 'business_basic',
    name: 'Business Starter',
    description: 'Small Business',
    price: 399,
    competitorPrice: 599,
    target: 'Small business',
    category: 'business',
    priceUnit: 'one-time',
    popular: false,
    stateFilingPrice: null,
    features: [
      { text: '1099-NEC/MISC e-filing', included: true },
      { text: 'W-2 employer filing', included: true },
      { text: 'Basic payroll (941)', included: true },
      { text: 'TIN matching', included: true },
      { text: 'API sandbox access', included: true },
      { text: 'Multi-state filing', included: false },
      { text: 'ACA reporting', included: false },
      { text: 'Bulk filing', included: false },
    ],
  },
  {
    id: 'business_pro',
    name: 'Business Pro',
    description: 'Growing Teams',
    price: 799,
    competitorPrice: 1199,
    target: 'Growing teams',
    category: 'business',
    priceUnit: 'one-time',
    popular: true,
    stateFilingPrice: null,
    features: [
      { text: 'All information returns', included: true },
      { text: 'Multi-state filing', included: true },
      { text: 'ACA 1095-C reporting', included: true },
      { text: 'Bulk upload', included: true },
      { text: 'Full API access', included: true },
      { text: 'Webhook notifications', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  {
    id: 'business_enterprise',
    name: 'Enterprise',
    description: 'Large Organizations',
    price: 1499,
    competitorPrice: 2499,
    target: 'Enterprise',
    category: 'business',
    priceUnit: 'one-time',
    popular: false,
    stateFilingPrice: null,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'SSO / SAML', included: true },
      { text: 'Compliance audit trail', included: true },
      { text: 'Custom reporting', included: true },
    ],
  },

  // ── API ──
  {
    id: 'api_platform_free',
    name: 'API Free',
    description: 'Developers',
    price: 0,
    competitorPrice: null,
    target: 'Developers',
    category: 'api',
    priceUnit: 'monthly',
    popular: false,
    stateFilingPrice: null,
    features: [
      { text: 'Sandbox access', included: true },
      { text: '100 test submissions/month', included: true },
      { text: 'Full API docs', included: true },
      { text: 'Community support', included: true },
      { text: 'Production access', included: false },
      { text: 'Webhooks', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    id: 'api_live_usage',
    name: 'API Pay-as-you-go',
    description: 'Small Integrations',
    price: 0,
    competitorPrice: null,
    target: 'Small integrations',
    category: 'api',
    priceUnit: 'monthly',
    popular: false,
    stateFilingPrice: null,
    features: [
      { text: 'Production API access', included: true },
      { text: '$1.50 / 1099 filing', included: true },
      { text: '$2.00 / W-2 filing', included: true },
      { text: '$3.00 / ACA filing', included: true },
      { text: 'Basic webhooks', included: true },
      { text: 'Email support', included: true },
    ],
  },
  {
    id: 'api_platform_pro',
    name: 'API Pro',
    description: 'SaaS Platforms',
    price: 199,
    competitorPrice: 349,
    target: 'SaaS platforms',
    category: 'api',
    priceUnit: 'monthly',
    popular: true,
    stateFilingPrice: null,
    features: [
      { text: '5,000 filings/month included', included: true },
      { text: 'All form types', included: true },
      { text: 'Advanced webhooks', included: true },
      { text: 'Priority support', included: true },
      { text: 'Bulk operations', included: true },
      { text: 'Staging environment', included: true },
    ],
  },
  {
    id: 'api_enterprise',
    name: 'API Enterprise',
    description: 'Enterprise Integrations',
    price: 0,
    competitorPrice: null,
    target: 'Enterprise',
    category: 'api',
    priceUnit: 'custom',
    popular: false,
    stateFilingPrice: null,
    features: [
      { text: 'Unlimited filings', included: true },
      { text: 'Custom endpoints', included: true },
      { text: 'Dedicated infrastructure', included: true },
      { text: '99.9% SLA', included: true },
      { text: 'Phone support', included: true },
      { text: 'Custom contract', included: true },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────

export function getTaxPlansByCategory(category: TaxPlanCategory): TaxPricingPlan[] {
  return TAX_PLANS.filter((p) => p.category === category)
}

export function getTaxPlanPrice(plan: TaxPricingPlan): string {
  if (plan.priceUnit === 'custom') return 'Custom'
  if (plan.price === 0) return '$0'
  return `$${plan.price}`
}

export function getTaxPlanPriceLabel(plan: TaxPricingPlan): string {
  if (plan.priceUnit === 'custom') return 'Custom pricing'
  if (plan.priceUnit === 'monthly') return '/mo'
  return '/season'
}

export function getTaxPlanIndex(planId: TaxPlanId): number {
  return TAX_PLANS.findIndex((p) => p.id === planId)
}
