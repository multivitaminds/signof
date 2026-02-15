import { useState, useCallback, useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { useBillingStore } from '../../settings/stores/useBillingStore'
import {
  TAX_PLANS,
  getTaxPlansByCategory,
  getTaxPlanPrice,
  getTaxPlanPriceLabel,
  getTaxPlanIndex,
} from '../../settings/lib/taxPlanData'
import type { TaxPlanId, TaxPlanCategory } from '../../settings/types'
import './TaxPricingPage.css'

const TABS: { label: string; category: TaxPlanCategory }[] = [
  { label: 'Individual', category: 'individual' },
  { label: 'Business', category: 'business' },
  { label: 'API', category: 'api' },
]

function TaxPricingPage() {
  const currentTaxPlan = useBillingStore((s) => s.taxPlan)
  const setTaxPlan = useBillingStore((s) => s.setTaxPlan)

  const [activeTab, setActiveTab] = useState<TaxPlanCategory>('individual')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<TaxPlanId | null>(null)

  const visiblePlans = useMemo(
    () => getTaxPlansByCategory(activeTab),
    [activeTab]
  )

  const handleTabClick = useCallback((category: TaxPlanCategory) => {
    setActiveTab(category)
  }, [])

  const handlePlanClick = useCallback(
    (planId: TaxPlanId) => {
      if (planId === currentTaxPlan) return
      setSelectedPlan(planId)
      setShowConfirmModal(true)
    },
    [currentTaxPlan]
  )

  const handleConfirm = useCallback(() => {
    if (!selectedPlan) return
    setTaxPlan(selectedPlan)
    setShowConfirmModal(false)
    setSelectedPlan(null)
  }, [selectedPlan, setTaxPlan])

  const handleCancel = useCallback(() => {
    setShowConfirmModal(false)
    setSelectedPlan(null)
  }, [])

  const getButtonLabel = useCallback(
    (planId: TaxPlanId): string => {
      if (planId === currentTaxPlan) return 'Current Plan'
      const plan = TAX_PLANS.find((p) => p.id === planId)
      if (plan?.priceUnit === 'custom') return 'Contact Sales'
      const currentIdx = getTaxPlanIndex(currentTaxPlan)
      const targetIdx = getTaxPlanIndex(planId)
      return targetIdx > currentIdx ? 'Upgrade' : 'Switch'
    },
    [currentTaxPlan]
  )

  return (
    <div className="tax-pricing">
      <div className="tax-pricing__header">
        <h1 className="tax-pricing__title">Tax Filing Plans</h1>
        <p className="tax-pricing__subtitle">
          Choose the right tax filing tier for your needs.
        </p>
      </div>

      {/* Tabs */}
      <div className="tax-pricing__tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.category}
            className={`tax-pricing__tab ${activeTab === tab.category ? 'tax-pricing__tab--active' : ''}`}
            onClick={() => handleTabClick(tab.category)}
            role="tab"
            aria-selected={activeTab === tab.category}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Plan Cards */}
      <div className="tax-pricing__grid">
        {visiblePlans.map((plan) => {
          const isCurrent = plan.id === currentTaxPlan
          return (
            <div
              key={plan.id}
              className={`tax-pricing__card ${isCurrent ? 'tax-pricing__card--current' : ''} ${plan.popular ? 'tax-pricing__card--popular' : ''}`}
            >
              {isCurrent && (
                <div className="tax-pricing__card-badge">Current</div>
              )}
              {plan.popular && !isCurrent && (
                <div className="tax-pricing__card-badge tax-pricing__card-badge--popular">Popular</div>
              )}
              <div className="tax-pricing__card-header">
                <h3 className="tax-pricing__card-name">{plan.name}</h3>
                <span className="tax-pricing__card-target">{plan.target}</span>
              </div>
              <div className="tax-pricing__card-price">
                <span className="tax-pricing__card-amount">
                  {getTaxPlanPrice(plan)}
                </span>
                <span className="tax-pricing__card-period">
                  {getTaxPlanPriceLabel(plan)}
                </span>
              </div>
              {plan.competitorPrice !== null && (
                <p className="tax-pricing__card-competitor">
                  <span className="tax-pricing__card-competitor-price">
                    ${plan.competitorPrice}
                  </span>
                  {' '}elsewhere
                </p>
              )}
              <p className="tax-pricing__card-description">{plan.description}</p>
              {plan.stateFilingPrice !== null && (
                <p className="tax-pricing__card-state">
                  + ${plan.stateFilingPrice}/state filing
                </p>
              )}
              <button
                className={`tax-pricing__card-cta ${isCurrent ? 'tax-pricing__card-cta--current' : ''}`}
                onClick={() => handlePlanClick(plan.id)}
                disabled={isCurrent}
              >
                {getButtonLabel(plan.id)}
              </button>
              <ul className="tax-pricing__card-features">
                {plan.features.map((feature) => (
                  <li
                    key={feature.text}
                    className={`tax-pricing__feature ${feature.included ? '' : 'tax-pricing__feature--disabled'}`}
                  >
                    {feature.included ? (
                      <Check size={14} className="tax-pricing__feature-icon tax-pricing__feature-icon--check" />
                    ) : (
                      <X size={14} className="tax-pricing__feature-icon tax-pricing__feature-icon--x" />
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
          className="tax-pricing__modal-overlay"
          onClick={handleCancel}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm plan change"
        >
          <div
            className="tax-pricing__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="tax-pricing__modal-title">Confirm Tax Plan Change</h3>
            <p className="tax-pricing__modal-text">
              Switch from{' '}
              <strong>{TAX_PLANS.find((p) => p.id === currentTaxPlan)?.name}</strong>{' '}
              to{' '}
              <strong>{TAX_PLANS.find((p) => p.id === selectedPlan)?.name}</strong>?
            </p>
            <p className="tax-pricing__modal-price">
              New price:{' '}
              <strong>
                {getTaxPlanPrice(TAX_PLANS.find((p) => p.id === selectedPlan)!)}
                {getTaxPlanPriceLabel(TAX_PLANS.find((p) => p.id === selectedPlan)!)}
              </strong>
            </p>
            <div className="tax-pricing__modal-actions">
              <button
                className="tax-pricing__modal-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="tax-pricing__modal-confirm"
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

export default TaxPricingPage
