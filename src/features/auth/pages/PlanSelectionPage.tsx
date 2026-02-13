import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Star, Zap, Building2, Crown } from 'lucide-react'
import { useAuthStore } from '../stores/useAuthStore'
import { useBillingStore } from '../../settings/stores/useBillingStore'
import { PLANS, getPrice, type PricingPlan } from '../../settings/lib/planData'
import { TAX_PLANS, getTaxPlanPrice, type TaxPricingPlan } from '../../settings/lib/taxPlanData'
import type { BillingCycle, TaxPlanId } from '../../settings/types'
import './PlanSelectionPage.css'

const PLAN_ICONS: Record<string, typeof Star> = {
  starter: Star,
  pro: Zap,
  business: Building2,
  enterprise: Crown,
}

export default function PlanSelectionPage() {
  const navigate = useNavigate()
  const setRegistrationStep = useAuthStore((s) => s.setRegistrationStep)
  const setPlan = useBillingStore((s) => s.setPlan)
  const storeBillingCycle = useBillingStore((s) => s.setBillingCycle)
  const setTaxPlan = useBillingStore((s) => s.setTaxPlan)

  const [billingCycle, setLocalBillingCycle] = useState<BillingCycle>('monthly')
  const [showTaxAddon, setShowTaxAddon] = useState(false)
  const [selectedTaxPlan, setSelectedTaxPlan] = useState<TaxPlanId>('tax_free')

  const handleToggleBillingCycle = useCallback(() => {
    setLocalBillingCycle((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'))
  }, [])

  const handleToggleTaxAddon = useCallback(() => {
    setShowTaxAddon((prev) => !prev)
  }, [])

  const handleSelectTaxPlan = useCallback((planId: TaxPlanId) => {
    setSelectedTaxPlan(planId)
    setTaxPlan(planId)
  }, [setTaxPlan])

  const handleSelectPlan = useCallback((plan: PricingPlan) => {
    if (plan.id === 'enterprise') return

    setPlan(plan.id)
    storeBillingCycle(billingCycle)

    if (plan.id === 'starter') {
      setRegistrationStep('onboarding')
      navigate('/onboarding')
    } else {
      setRegistrationStep('payment')
      navigate('/signup/payment')
    }
  }, [billingCycle, setPlan, storeBillingCycle, setRegistrationStep, navigate])

  const getButtonLabel = useCallback((plan: PricingPlan): string => {
    if (plan.id === 'starter') return 'Get Started Free'
    if (plan.id === 'enterprise') return 'Contact Sales'
    return `Choose ${plan.name}`
  }, [])

  const getCoreFeatures = useCallback((plan: PricingPlan): string[] => {
    const coreCategory = plan.features.find((c) => c.name === 'Core')
    if (!coreCategory) return []
    return coreCategory.features
      .filter((f) => f.included)
      .map((f) => f.text)
  }, [])

  return (
    <div className="plan-selection">
      <div className="plan-selection__container">
        <div className="plan-selection__header">
          <div className="plan-selection__logo">
            <span className="plan-selection__logo-text">Orchestree</span>
          </div>
          <h1 className="plan-selection__title">Choose your plan</h1>
          <p className="plan-selection__subtitle">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        <div className="plan-selection__toggle-wrapper">
          <div className="plan-selection__toggle">
            <span
              className={`plan-selection__toggle-label ${billingCycle === 'monthly' ? 'plan-selection__toggle-label--active' : ''}`}
            >
              Monthly
            </span>
            <button
              className={`plan-selection__toggle-switch ${billingCycle === 'yearly' ? 'plan-selection__toggle-switch--yearly' : ''}`}
              onClick={handleToggleBillingCycle}
              aria-label={`Switch to ${billingCycle === 'monthly' ? 'yearly' : 'monthly'} billing`}
              role="switch"
              aria-checked={billingCycle === 'yearly'}
            >
              <span className="plan-selection__toggle-thumb" />
            </button>
            <span
              className={`plan-selection__toggle-label ${billingCycle === 'yearly' ? 'plan-selection__toggle-label--active' : ''}`}
            >
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="plan-selection__toggle-discount">Save 20%</span>
            )}
          </div>
        </div>

        <div className="plan-selection__grid">
          {PLANS.map((plan) => {
            const IconComponent = PLAN_ICONS[plan.id] ?? Star
            const isPopular = plan.popular
            const isEnterprise = plan.id === 'enterprise'
            const coreFeatures = getCoreFeatures(plan)
            const priceLabel = getPrice(plan, billingCycle)

            return (
              <div
                key={plan.id}
                className={`plan-selection__card ${isPopular ? 'plan-selection__card--popular' : ''}`}
              >
                {isPopular && (
                  <div className="plan-selection__card-badge">Most Popular</div>
                )}
                <div className="plan-selection__card-icon">
                  <IconComponent size={20} />
                </div>
                <h3 className="plan-selection__card-name">{plan.name}</h3>
                <p className="plan-selection__card-description">{plan.description}</p>

                <div className="plan-selection__card-pricing">
                  <span className="plan-selection__card-price">{priceLabel}</span>
                  {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                    <span className="plan-selection__card-period">/mo</span>
                  )}
                </div>
                {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && billingCycle === 'yearly' && (
                  <div className="plan-selection__card-yearly-note">
                    per user, billed annually
                  </div>
                )}
                {plan.monthlyPrice === 0 && (
                  <div className="plan-selection__card-yearly-note">Free forever</div>
                )}
                {plan.monthlyPrice === null && (
                  <div className="plan-selection__card-yearly-note">Tailored to your needs</div>
                )}

                <button
                  className={`plan-selection__card-cta ${isPopular ? 'plan-selection__card-cta--popular' : ''} ${isEnterprise ? 'plan-selection__card-cta--enterprise' : ''}`}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isEnterprise}
                >
                  {getButtonLabel(plan)}
                </button>

                <ul className="plan-selection__card-features">
                  {coreFeatures.map((feature) => (
                    <li key={feature} className="plan-selection__card-feature">
                      <Check size={14} className="plan-selection__card-check" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="plan-selection__tax-section">
          <div className="plan-selection__tax-header">
            <div className="plan-selection__tax-info">
              <h3 className="plan-selection__tax-title">Add Tax Filing</h3>
              <p className="plan-selection__tax-subtitle">
                Optional: bundle tax preparation with your Orchestree plan.
              </p>
            </div>
            <button
              className={`plan-selection__tax-toggle ${showTaxAddon ? 'plan-selection__tax-toggle--active' : ''}`}
              onClick={handleToggleTaxAddon}
              role="switch"
              aria-checked={showTaxAddon}
              aria-label="Toggle tax add-on"
            >
              <span className="plan-selection__tax-toggle-thumb" />
            </button>
          </div>

          {showTaxAddon && (
            <div className="plan-selection__tax-grid">
              {TAX_PLANS.map((taxPlan: TaxPricingPlan) => {
                const isSelected = selectedTaxPlan === taxPlan.id
                return (
                  <button
                    key={taxPlan.id}
                    className={`plan-selection__tax-card ${isSelected ? 'plan-selection__tax-card--selected' : ''}`}
                    onClick={() => handleSelectTaxPlan(taxPlan.id)}
                    type="button"
                  >
                    <div className="plan-selection__tax-card-name">{taxPlan.name}</div>
                    <div className="plan-selection__tax-card-price">
                      {getTaxPlanPrice(taxPlan)}
                      {taxPlan.price > 0 && <span className="plan-selection__tax-card-period">/yr</span>}
                    </div>
                    <div className="plan-selection__tax-card-target">{taxPlan.target}</div>
                    {isSelected && (
                      <div className="plan-selection__tax-card-check-icon">
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
