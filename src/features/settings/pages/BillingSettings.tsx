import { useState, useCallback } from 'react'
import { useBillingStore } from '../stores/useBillingStore'
import { PLANS, PLAN_ORDER, type PricingPlan } from '../lib/planData'
import { MODULE_ADD_ONS } from '../lib/addOnData'
import type { PlanId, BillingCycle } from '../types'
import './BillingSettings.css'

// ─── Component ──────────────────────────────────────────────────────

export default function BillingSettings() {
  const currentPlan = useBillingStore((s) => s.currentPlan)
  const billingCycle = useBillingStore((s) => s.billingCycle)
  const usage = useBillingStore((s) => s.usage)
  const paymentMethod = useBillingStore((s) => s.paymentMethod)
  const billingHistory = useBillingStore((s) => s.billingHistory)
  const setPlan = useBillingStore((s) => s.setPlan)
  const storeBillingCycle = useBillingStore((s) => s.setBillingCycle)
  const setUsage = useBillingStore((s) => s.setUsage)
  const setPaymentMethod = useBillingStore((s) => s.setPaymentMethod)
  const activeAddOns = useBillingStore((s) => s.activeAddOns)
  const activateAddOn = useBillingStore((s) => s.activateAddOn)
  const deactivateAddOn = useBillingStore((s) => s.deactivateAddOn)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null)

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
    setPlan(selectedPlan)

    setUsage({
      documents: {
        used: usage.documents.used,
        limit: newPlanData.documentLimit ?? 9999,
      },
      storage: {
        used: usage.storage.used,
        limit: newPlanData.storageLimit ?? 9999,
      },
      members: {
        used: usage.members.used,
        limit: newPlanData.memberLimit ?? 9999,
      },
    })

    if (currentPlan === 'starter' && selectedPlan !== 'starter') {
      setPaymentMethod({
        brand: 'Visa',
        last4: '4242',
        expiry: '12/27',
      })
    }

    setShowConfirmModal(false)
    setSelectedPlan(null)
  }, [selectedPlan, currentPlan, usage, setPlan, setUsage, setPaymentMethod])

  const handleCancelModal = useCallback(() => {
    setShowConfirmModal(false)
    setSelectedPlan(null)
  }, [])

  const handleToggleBillingCycle = useCallback(() => {
    const newCycle: BillingCycle = billingCycle === 'monthly' ? 'yearly' : 'monthly'
    storeBillingCycle(newCycle)
  }, [billingCycle, storeBillingCycle])

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
      {/* Current Plan Header */}
      <div className="billing__current-plan">
        <div className="billing__current-plan-content">
          <div className="billing__current-plan-info">
            <div className="billing__current-plan-badge">
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

      {/* Billing Cycle Toggle */}
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

      {/* Pricing Plans */}
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
                          <span className="billing__feature-check-icon">{feature.included ? '\u2713' : '\u2013'}</span>
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

      {/* Add-ons Section */}
      <div className="billing__section">
        <h2 className="billing__section-title">Add-ons</h2>
        <p className="billing__section-subtitle">
          Extend your plan with powerful module add-ons.
        </p>
        <div className="billing__addons-grid">
          {MODULE_ADD_ONS.map((addOn) => {
            const isIncluded = addOn.includedInPlans.includes(currentPlan)
            const isActive = activeAddOns.includes(addOn.id)
            return (
              <div
                key={addOn.id}
                className={`billing__addon-card ${isIncluded ? 'billing__addon-card--included' : ''} ${isActive ? 'billing__addon-card--active' : ''}`}
              >
                <div className="billing__addon-header">
                  <h3 className="billing__addon-name">{addOn.name}</h3>
                  {isIncluded && (
                    <span className="billing__addon-included-badge">Included</span>
                  )}
                  {!isIncluded && isActive && (
                    <span className="billing__addon-active-badge">Active</span>
                  )}
                </div>
                <p className="billing__addon-description">{addOn.description}</p>
                <div className="billing__addon-footer">
                  {!isIncluded && (
                    <div className="billing__addon-price">
                      <span className="billing__addon-amount">${addOn.monthlyPrice}</span>
                      <span className="billing__addon-unit">/mo{addOn.perUnit ? ` ${addOn.perUnit}` : ''}</span>
                    </div>
                  )}
                  {isIncluded ? (
                    <span className="billing__addon-included-text">Included in your {currentPlanData.name} plan</span>
                  ) : isActive ? (
                    <button
                      className="billing__addon-btn billing__addon-btn--deactivate"
                      onClick={() => deactivateAddOn(addOn.id)}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      className="billing__addon-btn billing__addon-btn--activate"
                      onClick={() => activateAddOn(addOn.id)}
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Usage Section */}
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

      {/* Payment Method */}
      <div className="billing__section">
        <h2 className="billing__section-title">Payment Method</h2>
        <p className="billing__section-subtitle">
          Manage your payment information.
        </p>
        <div className="billing__payment-card">
          <div className="billing__payment-info">
            <div className="billing__payment-icon">
              <span aria-label="Credit card">&#128179;</span>
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

      {/* Billing History */}
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
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Plan Change Modal */}
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
