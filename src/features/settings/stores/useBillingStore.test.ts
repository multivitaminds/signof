import { useBillingStore } from './useBillingStore'

describe('useBillingStore', () => {
  beforeEach(() => {
    useBillingStore.setState({
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
        { id: 'inv-001', date: '2026-02-01', description: 'Starter Plan', amount: '$0.00', status: 'paid', invoiceUrl: '#' },
      ],
    })
  })

  it('has correct default plan', () => {
    const state = useBillingStore.getState()
    expect(state.currentPlan).toBe('starter')
  })

  it('has correct default billing cycle', () => {
    const state = useBillingStore.getState()
    expect(state.billingCycle).toBe('monthly')
  })

  it('setPlan changes the current plan', () => {
    useBillingStore.getState().setPlan('pro')
    expect(useBillingStore.getState().currentPlan).toBe('pro')
  })

  it('setBillingCycle changes the billing cycle', () => {
    useBillingStore.getState().setBillingCycle('yearly')
    expect(useBillingStore.getState().billingCycle).toBe('yearly')
  })

  it('setUsage updates usage metrics', () => {
    useBillingStore.getState().setUsage({
      documents: { used: 100, limit: 500 },
      storage: { used: 5, limit: 50 },
      members: { used: 5, limit: 15 },
    })
    const { usage } = useBillingStore.getState()
    expect(usage.documents.used).toBe(100)
    expect(usage.documents.limit).toBe(500)
    expect(usage.storage.limit).toBe(50)
    expect(usage.members.limit).toBe(15)
  })

  it('setPaymentMethod updates payment info', () => {
    useBillingStore.getState().setPaymentMethod({
      brand: 'Mastercard',
      last4: '8888',
      expiry: '06/28',
    })
    const { paymentMethod } = useBillingStore.getState()
    expect(paymentMethod.brand).toBe('Mastercard')
    expect(paymentMethod.last4).toBe('8888')
    expect(paymentMethod.expiry).toBe('06/28')
  })

  it('has billing history records', () => {
    const { billingHistory } = useBillingStore.getState()
    expect(billingHistory.length).toBeGreaterThan(0)
    expect(billingHistory[0]?.status).toBe('paid')
  })
})
