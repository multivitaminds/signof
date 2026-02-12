import type { AccountingPlanId } from '../types'

// ─── Interfaces ──────────────────────────────────────────────────────

export interface AccountingPlanFeature {
  text: string
  included: boolean
}

export interface AccountingPricingPlan {
  id: AccountingPlanId
  name: string
  description: string
  price: number
  target: string
  features: AccountingPlanFeature[]
}

// ─── Accounting Plan Definitions ────────────────────────────────────

export const ACCOUNTING_PLANS: AccountingPricingPlan[] = [
  {
    id: 'acct_free',
    name: 'Accounting Free',
    description: 'Basic accounting for freelancers and solopreneurs.',
    price: 0,
    target: 'Freelancers',
    features: [
      { text: '20 invoices/month', included: true },
      { text: 'Basic P&L report', included: true },
      { text: 'Expense tracking', included: true },
      { text: '1 bank account', included: true },
      { text: 'Unlimited invoices', included: false },
      { text: 'All reports', included: false },
      { text: 'Recurring transactions', included: false },
      { text: 'Multi-currency', included: false },
    ],
  },
  {
    id: 'acct_plus',
    name: 'Accounting Plus',
    description: 'Full-featured accounting for small businesses.',
    price: 15,
    target: 'Small biz',
    features: [
      { text: 'Unlimited invoices', included: true },
      { text: 'All reports', included: true },
      { text: 'Recurring transactions', included: true },
      { text: 'CSV import', included: true },
      { text: 'Bank reconciliation', included: true },
      { text: 'Multi-currency', included: false },
      { text: 'Receipt scanning', included: false },
      { text: 'Payroll', included: false },
    ],
  },
  {
    id: 'acct_premium',
    name: 'Accounting Premium',
    description: 'Advanced accounting for established businesses.',
    price: 30,
    target: 'Established biz',
    features: [
      { text: 'Unlimited invoices', included: true },
      { text: 'All reports', included: true },
      { text: 'Recurring transactions', included: true },
      { text: 'CSV import', included: true },
      { text: 'Multi-currency', included: true },
      { text: 'Receipt scanning', included: true },
      { text: 'Batch invoicing', included: true },
      { text: 'Payroll', included: false },
    ],
  },
  {
    id: 'acct_advanced',
    name: 'Accounting Advanced',
    description: 'Enterprise accounting with payroll and automation.',
    price: 50,
    target: 'Teams',
    features: [
      { text: 'Unlimited invoices', included: true },
      { text: 'All reports', included: true },
      { text: 'Custom reports', included: true },
      { text: 'Workflow automation', included: true },
      { text: 'Multi-currency', included: true },
      { text: 'Payroll', included: true },
      { text: 'API access', included: true },
      { text: 'Priority support', included: true },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────

export function getAccountingPlanPrice(plan: AccountingPricingPlan): string {
  if (plan.price === 0) return '$0'
  return `$${plan.price}`
}

export function getAccountingPlanIndex(planId: AccountingPlanId): number {
  return ACCOUNTING_PLANS.findIndex((p) => p.id === planId)
}
