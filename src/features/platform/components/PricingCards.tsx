import type { PricingTier } from '../types'
import './PricingCards.css'

interface PricingCardsProps {
  tiers: PricingTier[]
}

function PricingCards({ tiers }: PricingCardsProps) {
  return (
    <div className="pricing-cards">
      <div className="pricing-cards__grid">
        {tiers.map((tier) => (
          <div
            key={tier.tierName}
            className={`pricing-card${tier.featured ? ' pricing-card--featured' : ''}`}
          >
            <div className="pricing-card__amount" style={{ color: tier.color }}>
              {tier.amount}
              {tier.amountSuffix && (
                <span className="pricing-card__suffix">{tier.amountSuffix}</span>
              )}
            </div>
            <div className="pricing-card__tier">{tier.tierName}</div>
            <ul className="pricing-card__features">
              {tier.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PricingCards
