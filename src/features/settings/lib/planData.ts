import type { PlanId, BillingCycle } from '../types'

// ─── Interfaces ──────────────────────────────────────────────────────

export interface PlanFeature {
  text: string
  included: boolean
}

export interface FeatureCategory {
  name: string
  features: PlanFeature[]
}

export interface PricingPlan {
  id: PlanId
  name: string
  description: string
  monthlyPrice: number | null
  yearlyPrice: number | null
  features: FeatureCategory[]
  popular: boolean
  documentLimit: number | null
  storageLimit: number | null
  memberLimit: number | null
}

// ─── Plan Definitions ────────────────────────────────────────────────

export const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals getting started with digital signatures.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    popular: false,
    documentLimit: 50,
    storageLimit: 1,
    memberLimit: 3,
    features: [
      {
        name: 'Core',
        features: [
          { text: 'Up to 50 documents/month', included: true },
          { text: '1 GB storage', included: true },
          { text: 'Up to 3 team members', included: true },
          { text: 'Basic templates', included: true },
        ],
      },
      {
        name: 'Collaboration',
        features: [
          { text: 'Email notifications', included: true },
          { text: 'Shared workspaces', included: false },
          { text: 'Real-time collaboration', included: false },
        ],
      },
      {
        name: 'Security',
        features: [
          { text: 'SSL encryption', included: true },
          { text: 'Audit trail', included: false },
          { text: 'SSO / SAML', included: false },
        ],
      },
      {
        name: 'Support',
        features: [
          { text: 'Community support', included: true },
          { text: 'Priority support', included: false },
          { text: 'Dedicated account manager', included: false },
        ],
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals who need more power and flexibility.',
    monthlyPrice: 12,
    yearlyPrice: 10,
    popular: true,
    documentLimit: 500,
    storageLimit: 50,
    memberLimit: 15,
    features: [
      {
        name: 'Core',
        features: [
          { text: 'Up to 500 documents/month', included: true },
          { text: '50 GB storage', included: true },
          { text: 'Up to 15 team members', included: true },
          { text: 'Advanced templates', included: true },
          { text: 'Custom branding', included: true },
        ],
      },
      {
        name: 'Collaboration',
        features: [
          { text: 'Email notifications', included: true },
          { text: 'Shared workspaces', included: true },
          { text: 'Real-time collaboration', included: true },
          { text: 'Comments & mentions', included: true },
        ],
      },
      {
        name: 'Security',
        features: [
          { text: 'SSL encryption', included: true },
          { text: 'Audit trail', included: true },
          { text: 'Two-factor auth', included: true },
          { text: 'SSO / SAML', included: false },
        ],
      },
      {
        name: 'Support',
        features: [
          { text: 'Priority email support', included: true },
          { text: '24/7 chat support', included: false },
          { text: 'Dedicated account manager', included: false },
        ],
      },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For teams that need advanced controls and integrations.',
    monthlyPrice: 29,
    yearlyPrice: 24,
    popular: false,
    documentLimit: 2000,
    storageLimit: 200,
    memberLimit: 50,
    features: [
      {
        name: 'Core',
        features: [
          { text: 'Up to 2,000 documents/month', included: true },
          { text: '200 GB storage', included: true },
          { text: 'Up to 50 team members', included: true },
          { text: 'Advanced templates', included: true },
          { text: 'Custom branding', included: true },
          { text: 'API access', included: true },
        ],
      },
      {
        name: 'Collaboration',
        features: [
          { text: 'Email notifications', included: true },
          { text: 'Shared workspaces', included: true },
          { text: 'Real-time collaboration', included: true },
          { text: 'Comments & mentions', included: true },
          { text: 'Guest access', included: true },
        ],
      },
      {
        name: 'Security',
        features: [
          { text: 'SSL encryption', included: true },
          { text: 'Audit trail', included: true },
          { text: 'Two-factor auth', included: true },
          { text: 'SSO / SAML', included: true },
          { text: 'Advanced permissions', included: true },
        ],
      },
      {
        name: 'Support',
        features: [
          { text: 'Priority email support', included: true },
          { text: '24/7 chat support', included: true },
          { text: 'Dedicated account manager', included: false },
        ],
      },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For organizations with complex needs and compliance requirements.',
    monthlyPrice: null,
    yearlyPrice: null,
    popular: false,
    documentLimit: null,
    storageLimit: null,
    memberLimit: null,
    features: [
      {
        name: 'Core',
        features: [
          { text: 'Unlimited documents', included: true },
          { text: 'Unlimited storage', included: true },
          { text: 'Unlimited team members', included: true },
          { text: 'Advanced templates', included: true },
          { text: 'Custom branding', included: true },
          { text: 'API access', included: true },
          { text: 'Custom integrations', included: true },
        ],
      },
      {
        name: 'Collaboration',
        features: [
          { text: 'Email notifications', included: true },
          { text: 'Shared workspaces', included: true },
          { text: 'Real-time collaboration', included: true },
          { text: 'Comments & mentions', included: true },
          { text: 'Guest access', included: true },
          { text: 'Cross-org sharing', included: true },
        ],
      },
      {
        name: 'Security',
        features: [
          { text: 'SSL encryption', included: true },
          { text: 'Audit trail', included: true },
          { text: 'Two-factor auth', included: true },
          { text: 'SSO / SAML', included: true },
          { text: 'Advanced permissions', included: true },
          { text: 'HIPAA compliance', included: true },
          { text: 'Data residency', included: true },
        ],
      },
      {
        name: 'Support',
        features: [
          { text: 'Priority email support', included: true },
          { text: '24/7 chat support', included: true },
          { text: 'Dedicated account manager', included: true },
          { text: 'Custom SLA', included: true },
        ],
      },
    ],
  },
]

export const PLAN_ORDER: PlanId[] = ['starter', 'pro', 'business', 'enterprise']

// ─── Helpers ─────────────────────────────────────────────────────────

export function getPrice(plan: PricingPlan, billingCycle: BillingCycle): string {
  if (plan.monthlyPrice === null) return 'Custom'
  if (plan.monthlyPrice === 0) return '$0'
  return billingCycle === 'monthly'
    ? `$${plan.monthlyPrice}`
    : `$${plan.yearlyPrice}`
}

export function getPlanIndex(planId: PlanId): number {
  return PLAN_ORDER.indexOf(planId)
}
