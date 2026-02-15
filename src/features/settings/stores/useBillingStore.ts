import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlanId, BillingCycle, PaymentMethod, BillingRecord, TaxPlanId, AccountingPlanId } from '../types'

interface UsageMetric {
  used: number
  limit: number
}

interface BillingUsage {
  documents: UsageMetric
  storage: UsageMetric
  members: UsageMetric
}

interface BillingState {
  currentPlan: PlanId
  billingCycle: BillingCycle
  usage: BillingUsage
  paymentMethod: PaymentMethod
  billingHistory: BillingRecord[]
  taxPlan: TaxPlanId
  accountingPlan: AccountingPlanId
  activeAddOns: string[]

  setPlan: (plan: PlanId) => void
  setBillingCycle: (cycle: BillingCycle) => void
  setUsage: (usage: BillingUsage) => void
  setPaymentMethod: (method: PaymentMethod) => void
  /** @deprecated Use activeAddOns + activateAddOn/deactivateAddOn instead */
  setTaxPlan: (plan: TaxPlanId) => void
  /** @deprecated Use activeAddOns + activateAddOn/deactivateAddOn instead */
  setAccountingPlan: (plan: AccountingPlanId) => void
  activateAddOn: (addOnId: string) => void
  deactivateAddOn: (addOnId: string) => void
  clearSampleData: () => void
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set) => ({
      currentPlan: 'starter',
      billingCycle: 'monthly',
      usage: {
        documents: { used: 32, limit: 50 },
        storage: { used: 0.6, limit: 1 },
        members: { used: 2, limit: 3 },
      },
      paymentMethod: {
        brand: 'Visa',
        last4: '4242',
        expiry: '12/27',
      },
      billingHistory: [
        {
          id: 'inv-001',
          date: '2026-02-01',
          description: 'Starter Plan - February 2026',
          amount: '$0.00',
          status: 'paid',
          invoiceUrl: '#',
        },
        {
          id: 'inv-002',
          date: '2026-01-01',
          description: 'Starter Plan - January 2026',
          amount: '$0.00',
          status: 'paid',
          invoiceUrl: '#',
        },
        {
          id: 'inv-003',
          date: '2025-12-01',
          description: 'Starter Plan - December 2025',
          amount: '$0.00',
          status: 'paid',
          invoiceUrl: '#',
        },
        {
          id: 'inv-004',
          date: '2025-11-01',
          description: 'Starter Plan - November 2025',
          amount: '$0.00',
          status: 'paid',
          invoiceUrl: '#',
        },
      ],
      taxPlan: 'individual_basic',
      accountingPlan: 'acct_free',
      activeAddOns: [],

      setPlan: (plan) => set({ currentPlan: plan }),
      setBillingCycle: (cycle) => set({ billingCycle: cycle }),
      setUsage: (usage) => set({ usage }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setTaxPlan: (plan) => set({ taxPlan: plan }),
      setAccountingPlan: (plan) => set({ accountingPlan: plan }),
      activateAddOn: (addOnId) =>
        set((state) => ({
          activeAddOns: state.activeAddOns.includes(addOnId)
            ? state.activeAddOns
            : [...state.activeAddOns, addOnId],
        })),
      deactivateAddOn: (addOnId) =>
        set((state) => ({
          activeAddOns: state.activeAddOns.filter((id) => id !== addOnId),
        })),
      clearSampleData: () =>
        set({
          usage: {
            documents: { used: 0, limit: 50 },
            storage: { used: 0, limit: 1 },
            members: { used: 1, limit: 3 },
          },
          billingHistory: [],
          activeAddOns: [],
        }),
    }),
    { name: 'orchestree-billing-storage' }
  )
)
