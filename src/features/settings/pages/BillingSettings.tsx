import { useState, useCallback } from 'react'
import {
  Check,
  CreditCard,
  Download,
  Zap,
  Shield,
  Crown,
  Building2,
  ArrowRight,
} from 'lucide-react'
import './BillingSettings.css'

// ─── Types ──────────────────────────────────────────────────────────

type BillingCycle = 'monthly' | 'yearly'
type PlanId = 'starter' | 'pro' | 'business' | 'enterprise'

interface PlanFeature {
  text: string
  included: boolean
}

interface FeatureCategory {
  name: string
  features: PlanFeature[]
}

interface PricingPlan {
  id: PlanId
  name: string
  description: string
  icon: React.ReactNode
  monthlyPrice: number | null
  yearlyPrice: number | null
  features: FeatureCategory[]
  popular: boolean
  cta: string
  documentLimit: number | null
  storageLimit: number | null
  memberLimit: number | null
}

interface BillingRecord {
  id: string
  date: string
  description: string
  amount: string
  status: 'paid' | 'pending' | 'failed'
  invoiceUrl: string
}

// ─── Plan Data ──────────────────────────────────────────────────────

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals getting started with digital signatures.',
    icon: <Zap size={20} />,
    monthlyPrice: 0,
    yearlyPrice: 0,
    popular: false,
    cta: 'Get Started',
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
    icon: <Crown size={20} />,
    monthlyPrice: 12,
    yearlyPrice: 10,
    popular: true,
    cta: 'Upgrade to Pro',
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
    icon: <Shield size={20} />,
    monthlyPrice: 29,
    yearlyPrice: 24,
    popular: false,
    cta: 'Upgrade to Business',
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
    icon: <Building2 size={20} />,
    monthlyPrice: null,
    yearlyPrice: null,
    popular: false,
    cta: 'Contact Sales',
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

const PLAN_ORDER: PlanId[] = ['starter', 'pro', 'business', 'enterprise']

// ─── Component ──────────────────────────────────────────────────────

export default function BillingSettings() {
  const [currentPlan, setCurrentPlan] = useState<PlanId>('starter')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null)

  // Usage data (in state so it's reactive)
  const [usage, setUsage] = useState({
    documents: { used: 32, limit: 50 },
    storage: { used: 0.6, limit: 1 },
    members: { used: 2, limit: 3 },
  })

  // Payment method in state
  const [paymentMethod, setPaymentMethod] = useState({
    brand: 'Visa',
    last4: '4242',
    expiry: '12/27',
  })

  // Billing history in state
  const [billingHistory] = useState<BillingRecord[]>([
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
  ])

  const currentPlanData = PLANS.find((p) => p.id === currentPlan)!

  const getPrice = useCallback(
    (plan: PricingPlan): string => {
      if (plan.monthlyPrice === null) return 'Custom'
      if (plan.monthlyPrice === 0) return '$0'
      return billingCycle === 'monthly'
        ? `$${plan.monthlyPrice}`
        : `$${plan.yearlyPrice}`
    },
    [billingCycle]
  )

  const getNextBillingDate = useCallback((): string => {
    const now = new Date()
    if (billingCycle === 'monthly') {
      const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      return next.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    }
    const next = new Date(now.getFullYear() + 1, now.getMonth(), 1)
    return next.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }, [billingCycle])

  const getMonthlyEquivalent = useCallback(
    (plan: PricingPlan): string | null => {
      if (plan.monthlyPrice === null || plan.monthlyPrice === 0) return null
      if (billingCycle === 'yearly' && plan.yearlyPrice !== null) {
        return `$${plan.yearlyPrice}/mo billed annually`
      }
      return null
    },
    [billingCycle]
  )

  const getPlanIndex = useCallback(
    (planId: PlanId): number => PLAN_ORDER.indexOf(planId),
    []
  )

  const getButtonLabel = useCallback(
    (plan: PricingPlan): string => {
      if (plan.id === currentPlan) return 'Current Plan'
      if (plan.id === 'enterprise') return 'Contact Sales'
      const currentIdx = getPlanIndex(currentPlan)
      const targetIdx = getPlanIndex(plan.id)
      return targetIdx > currentIdx ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`
    },
    [currentPlan, getPlanIndex]
  )

  const handlePlanClick = useCallback(
    (planId: PlanId) => {
      if (planId === currentPlan) return
      if (planId === 'enterprise') return
      setSelectedPlan(planId)
      setShowConfirmModal(true)
    },
    [currentPlan]
  )

  const handleConfirmChange = useCallback(() => {
    if (!selectedPlan) return
    const newPlanData = PLANS.find((p) => p.id === selectedPlan)!
    setCurrentPlan(selectedPlan)

    // Update usage limits to match the new plan
    setUsage((prev) => ({
      documents: {
        used: prev.documents.used,
        limit: newPlanData.documentLimit ?? 9999,
      },
      storage: {
        used: prev.storage.used,
        limit: newPlanData.storageLimit ?? 9999,
      },
      members: {
        used: prev.members.used,
        limit: newPlanData.memberLimit ?? 9999,
      },
    }))

    // Update payment method card display if upgrading from free
    if (currentPlan === 'starter' && selectedPlan !== 'starter') {
      setPaymentMethod({
        brand: 'Visa',
        last4: '4242',
        expiry: '12/27',
      })
    }

    setShowConfirmModal(false)
    setSelectedPlan(null)
  }, [selectedPlan, currentPlan])

  const handleCancelModal = useCallback(() => {
    setShowConfirmModal(false)
    setSelectedPlan(null)
  }, [])

  const handleToggleBillingCycle = useCallback(() => {
    setBillingCycle((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'))
  }, [])

  const formatStorageUsed = (gb: number): string => {
    if (gb < 1) return `${Math.round(gb * 1000)} MB`
    return `${gb} GB`
  }

  const formatStorageLimit = (gb: number): string => {
    if (gb >= 9999) return 'Unlimited'
    return `${gb} GB`
  }

  const formatDocLimit = (limit: number): string => {
    if (limit >= 9999) return 'Unlimited'
    return limit.toLocaleString()
  }

  const formatMemberLimit = (limit: number): string => {
    if (limit >= 9999) return 'Unlimited'
    return limit.toString()
  }

  const getUsagePercent = (used: number, limit: number): number => {
    if (limit >= 9999) return Math.min((used / 100) * 100, 5)
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageBarModifier = (percent: number): string => {
    if (percent >= 90) return 'billing__usage-fill--danger'
    if (percent >= 70) return 'billing__usage-fill--warning'
    return ''
  }

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="billing">
      {/* ═══ Current Plan Header ═══ */}
      <div className="billing__current-plan">
        <div className="billing__current-plan-content">
          <div className="billing__current-plan-info">
            <div className="billing__current-plan-badge">
              {currentPlanData.icon}
              <span>{currentPlanData.name} Plan</span>
            </div>
            <h1 className="billing__title">Plan &amp; Billing</h1>
            <p className="billing__subtitle">
              Manage your subscription, usage, and payment details.
            </p>
          </div>
          <div className="billing__current-plan-details">
            <div className="billing__current-plan-price">
              <span className="billing__current-plan-amount">
                {currentPlanData.monthlyPrice === null
                  ? 'Custom'
                  : currentPlanData.monthlyPrice === 0
                    ? 'Free'
                    : `${getPrice(currentPlanData)}/mo`}
              </span>
              {currentPlanData.monthlyPrice !== null &&
                currentPlanData.monthlyPrice > 0 && (
                  <span className="billing__current-plan-cycle">
                    billed {billingCycle}
                  </span>
                )}
            </div>
            <div className="billing__current-plan-next">
              Next billing date:{' '}
              <strong>{getNextBillingDate()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Billing Cycle Toggle ═══ */}
      <div className="billing__cycle-section">
        <div className="billing__cycle-toggle">
          <span
            className={`billing__cycle-label ${billingCycle === 'monthly' ? 'billing__cycle-label--active' : ''}`}
          >
            Monthly
          </span>
          <button
            className={`billing__cycle-switch ${billingCycle === 'yearly' ? 'billing__cycle-switch--yearly' : ''}`}
            onClick={handleToggleBillingCycle}
            aria-label={`Switch to ${billingCycle === 'monthly' ? 'yearly' : 'monthly'} billing`}
            role="switch"
            aria-checked={billingCycle === 'yearly'}
          >
            <span className="billing__cycle-switch-thumb" />
          </button>
          <span
            className={`billing__cycle-label ${billingCycle === 'yearly' ? 'billing__cycle-label--active' : ''}`}
          >
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <span className="billing__cycle-discount">Save 20%</span>
          )}
        </div>
      </div>

      {/* ═══ Pricing Plans ═══ */}
      <div className="billing__plans">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan
          const isPopular = plan.popular
          return (
            <div
              key={plan.id}
              className={`billing__plan ${isCurrent ? 'billing__plan--current' : ''} ${isPopular ? 'billing__plan--popular' : ''}`}
            >
              {isPopular && (
                <div className="billing__plan-popular-badge">Most Popular</div>
              )}
              <div className="billing__plan-header">
                <div className="billing__plan-icon">{plan.icon}</div>
                <h3 className="billing__plan-name">{plan.name}</h3>
                <p className="billing__plan-description">{plan.description}</p>
              </div>
              <div className="billing__plan-pricing">
                <div className="billing__plan-price-row">
                  <span className="billing__plan-amount">
                    {getPrice(plan)}
                  </span>
                  {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                    <span className="billing__plan-period">/mo</span>
                  )}
                </div>
                {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && billingCycle === 'yearly' && (
                  <div className="billing__plan-yearly-note">
                    {getMonthlyEquivalent(plan)}
                  </div>
                )}
                {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && billingCycle === 'monthly' && (
                  <div className="billing__plan-yearly-note">
                    per user, billed monthly
                  </div>
                )}
                {plan.monthlyPrice === 0 && (
                  <div className="billing__plan-yearly-note">
                    Free forever
                  </div>
                )}
                {plan.monthlyPrice === null && (
                  <div className="billing__plan-yearly-note">
                    Tailored to your needs
                  </div>
                )}
              </div>
              <button
                className={`billing__plan-cta ${isCurrent ? 'billing__plan-cta--current' : ''} ${isPopular && !isCurrent ? 'billing__plan-cta--popular' : ''}`}
                onClick={() => handlePlanClick(plan.id)}
                disabled={isCurrent}
              >
                {getButtonLabel(plan)}
                {!isCurrent && plan.id !== 'enterprise' && (
                  <ArrowRight size={16} />
                )}
              </button>
              <div className="billing__plan-features">
                {plan.features.map((category) => (
                  <div
                    key={category.name}
                    className="billing__feature-category"
                  >
                    <h4 className="billing__feature-category-name">
                      {category.name}
                    </h4>
                    <ul className="billing__feature-list">
                      {category.features.map((feature) => (
                        <li
                          key={feature.text}
                          className={`billing__feature-item ${feature.included ? '' : 'billing__feature-item--disabled'}`}
                        >
                          <Check
                            size={14}
                            className="billing__feature-check"
                          />
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ═══ Usage Section ═══ */}
      <div className="billing__section">
        <h2 className="billing__section-title">Usage</h2>
        <p className="billing__section-subtitle">
          Your current usage for this billing period.
        </p>
        <div className="billing__usage-grid">
          <div className="billing__usage-card">
            <div className="billing__usage-card-header">
              <span className="billing__usage-label">Documents</span>
              <span className="billing__usage-count">
                {usage.documents.used.toLocaleString()} /{' '}
                {formatDocLimit(usage.documents.limit)}
              </span>
            </div>
            <div className="billing__usage-bar">
              <div
                className={`billing__usage-fill ${getUsageBarModifier(getUsagePercent(usage.documents.used, usage.documents.limit))}`}
                style={{
                  width: `${getUsagePercent(usage.documents.used, usage.documents.limit)}%`,
                }}
              />
            </div>
          </div>
          <div className="billing__usage-card">
            <div className="billing__usage-card-header">
              <span className="billing__usage-label">Storage</span>
              <span className="billing__usage-count">
                {formatStorageUsed(usage.storage.used)} /{' '}
                {formatStorageLimit(usage.storage.limit)}
              </span>
            </div>
            <div className="billing__usage-bar">
              <div
                className={`billing__usage-fill ${getUsageBarModifier(getUsagePercent(usage.storage.used, usage.storage.limit))}`}
                style={{
                  width: `${getUsagePercent(usage.storage.used, usage.storage.limit)}%`,
                }}
              />
            </div>
          </div>
          <div className="billing__usage-card">
            <div className="billing__usage-card-header">
              <span className="billing__usage-label">Team Members</span>
              <span className="billing__usage-count">
                {usage.members.used} /{' '}
                {formatMemberLimit(usage.members.limit)}
              </span>
            </div>
            <div className="billing__usage-bar">
              <div
                className={`billing__usage-fill ${getUsageBarModifier(getUsagePercent(usage.members.used, usage.members.limit))}`}
                style={{
                  width: `${getUsagePercent(usage.members.used, usage.members.limit)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Payment Method ═══ */}
      <div className="billing__section">
        <h2 className="billing__section-title">Payment Method</h2>
        <p className="billing__section-subtitle">
          Manage your payment information.
        </p>
        <div className="billing__payment-card">
          <div className="billing__payment-info">
            <div className="billing__payment-icon">
              <CreditCard size={24} />
            </div>
            <div className="billing__payment-details">
              <span className="billing__payment-brand">
                {paymentMethod.brand} ending in {paymentMethod.last4}
              </span>
              <span className="billing__payment-expiry">
                Expires {paymentMethod.expiry}
              </span>
            </div>
          </div>
          <button
            className="billing__payment-update-btn"
            onClick={() =>
              setPaymentMethod({
                brand: 'Mastercard',
                last4: '8888',
                expiry: '06/28',
              })
            }
          >
            Update
          </button>
        </div>
      </div>

      {/* ═══ Billing History ═══ */}
      <div className="billing__section">
        <h2 className="billing__section-title">Billing History</h2>
        <p className="billing__section-subtitle">
          Download past invoices and receipts.
        </p>
        <div className="billing__history-table-wrapper">
          <table className="billing__history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((record) => (
                <tr key={record.id}>
                  <td className="billing__history-date">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="billing__history-desc">
                    {record.description}
                  </td>
                  <td className="billing__history-amount">{record.amount}</td>
                  <td>
                    <span
                      className={`billing__history-status billing__history-status--${record.status}`}
                    >
                      {record.status.charAt(0).toUpperCase() +
                        record.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="billing__history-download"
                      aria-label={`Download invoice ${record.id}`}
                    >
                      <Download size={14} />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Confirm Plan Change Modal ═══ */}
      {showConfirmModal && selectedPlan && (
        <div
          className="billing__modal-overlay"
          onClick={handleCancelModal}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm plan change"
        >
          <div
            className="billing__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="billing__modal-title">Confirm Plan Change</h3>
            <p className="billing__modal-text">
              You are switching from{' '}
              <strong>{currentPlanData.name}</strong> to{' '}
              <strong>
                {PLANS.find((p) => p.id === selectedPlan)?.name}
              </strong>
              .
            </p>
            {selectedPlan !== 'starter' && (
              <p className="billing__modal-price">
                New price:{' '}
                <strong>
                  {getPrice(PLANS.find((p) => p.id === selectedPlan)!)}
                  /mo
                </strong>{' '}
                per user, billed {billingCycle}.
              </p>
            )}
            <div className="billing__modal-actions">
              <button
                className="billing__modal-cancel"
                onClick={handleCancelModal}
              >
                Cancel
              </button>
              <button
                className="billing__modal-confirm"
                onClick={handleConfirmChange}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
