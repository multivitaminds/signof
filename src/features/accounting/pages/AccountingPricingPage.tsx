import { useState, useCallback } from 'react'
import { Check, X } from 'lucide-react'
import { useBillingStore } from '../../settings/stores/useBillingStore'
import { ACCOUNTING_PLANS, getAccountingPlanPrice, getAccountingPlanIndex } from '../../settings/lib/accountingPlanData'
import type { AccountingPlanId } from '../../settings/types'
import './AccountingPricingPage.css'

function AccountingPricingPage() {
  const currentAccountingPlan = useBillingStore((s) => s.accountingPlan)
  const setAccountingPlan = useBillingStore((s) => s.setAccountingPlan)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<AccountingPlanId | null>(null)

  const handlePlanClick = useCallback(
    (planId: AccountingPlanId) => {
      if (planId === currentAccountingPlan) return
      setSelectedPlan(planId)
      setShowConfirmModal(true)
    },
    [currentAccountingPlan]
  )

  const handleConfirm = useCallback(() => {
    if (!selectedPlan) return
    setAccountingPlan(selectedPlan)
    setShowConfirmModal(false)
    setSelectedPlan(null)
  }, [selectedPlan, setAccountingPlan])

  const handleCancel = useCallback(() => {
    setShowConfirmModal(false)
    setSelectedPlan(null)
  }, [])

  const getButtonLabel = useCallback(
    (planId: AccountingPlanId): string => {
      if (planId === currentAccountingPlan) return 'Current Plan'
      const currentIdx = getAccountingPlanIndex(currentAccountingPlan)
      const targetIdx = getAccountingPlanIndex(planId)
      return targetIdx > currentIdx ? 'Upgrade' : 'Switch'
    },
    [currentAccountingPlan]
  )

  return (
    <div className="acct-pricing">
      <div className="acct-pricing__header">
        <h1 className="acct-pricing__title">Accounting Plans</h1>
        <p className="acct-pricing__subtitle">
          Choose the right accounting tier for your business. Billed monthly.
        </p>
      </div>

      <div className="acct-pricing__grid">
        {ACCOUNTING_PLANS.map((plan) => {
          const isCurrent = plan.id === currentAccountingPlan
          return (
            <div
              key={plan.id}
              className={`acct-pricing__card ${isCurrent ? 'acct-pricing__card--current' : ''}`}
            >
              {isCurrent && (
                <div className="acct-pricing__card-badge">Current</div>
              )}
              <div className="acct-pricing__card-header">
                <h3 className="acct-pricing__card-name">{plan.name}</h3>
                <span className="acct-pricing__card-target">{plan.target}</span>
              </div>
              <div className="acct-pricing__card-price">
                <span className="acct-pricing__card-amount">
                  {getAccountingPlanPrice(plan)}
                </span>
                {plan.price > 0 && (
                  <span className="acct-pricing__card-period">/mo</span>
                )}
                {plan.price === 0 && (
                  <span className="acct-pricing__card-period">Free forever</span>
                )}
              </div>
              <p className="acct-pricing__card-description">{plan.description}</p>
              <button
                className={`acct-pricing__card-cta ${isCurrent ? 'acct-pricing__card-cta--current' : ''}`}
                onClick={() => handlePlanClick(plan.id)}
                disabled={isCurrent}
              >
                {getButtonLabel(plan.id)}
              </button>
              <ul className="acct-pricing__card-features">
                {plan.features.map((feature) => (
                  <li
                    key={feature.text}
                    className={`acct-pricing__feature ${feature.included ? '' : 'acct-pricing__feature--disabled'}`}
                  >
                    {feature.included ? (
                      <Check size={14} className="acct-pricing__feature-icon acct-pricing__feature-icon--check" />
                    ) : (
                      <X size={14} className="acct-pricing__feature-icon acct-pricing__feature-icon--x" />
                    )}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedPlan && (
        <div
          className="acct-pricing__modal-overlay"
          onClick={handleCancel}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm plan change"
        >
          <div
            className="acct-pricing__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="acct-pricing__modal-title">Confirm Accounting Plan Change</h3>
            <p className="acct-pricing__modal-text">
              Switch from{' '}
              <strong>{ACCOUNTING_PLANS.find((p) => p.id === currentAccountingPlan)?.name}</strong>{' '}
              to{' '}
              <strong>{ACCOUNTING_PLANS.find((p) => p.id === selectedPlan)?.name}</strong>?
            </p>
            <p className="acct-pricing__modal-price">
              New price:{' '}
              <strong>
                {getAccountingPlanPrice(ACCOUNTING_PLANS.find((p) => p.id === selectedPlan)!)}
                {ACCOUNTING_PLANS.find((p) => p.id === selectedPlan)!.price > 0
                  ? '/mo'
                  : ''}
              </strong>
            </p>
            <div className="acct-pricing__modal-actions">
              <button
                className="acct-pricing__modal-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="acct-pricing__modal-confirm"
                onClick={handleConfirm}
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

export default AccountingPricingPage
