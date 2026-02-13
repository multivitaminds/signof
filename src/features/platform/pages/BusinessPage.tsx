import CollapsibleSection from '../components/CollapsibleSection'
import DataTable from '../components/DataTable'
import PricingCards from '../components/PricingCards'
import {
  PRICING_TIERS,
  REVENUE_STREAMS,
  FINANCIAL_PROJECTIONS,
  COMPETITORS,
  MOATS,
  TECH_STACK,
  RISKS,
} from '../data/businessPlan'
import './BusinessPage.css'

function BusinessPage() {
  return (
    <div className="business-page">
      <div className="business-page__hero">
        <h2 className="business-page__title">Business Model & Financials</h2>
        <p className="business-page__subtitle">
          Revenue strategy, pricing, financial projections, competitive positioning, and risk analysis.
        </p>
      </div>

      <CollapsibleSection title="Revenue Model & Pricing" defaultOpen>
        <PricingCards tiers={PRICING_TIERS} />

        <h3 className="business-page__sub-heading">Revenue Streams</h3>
        <DataTable
          headers={['Revenue Stream', 'Description', 'Est. Contribution']}
          rows={REVENUE_STREAMS.map(r => [r.name, r.description, r.contribution])}
          headerColor="purple"
        />
      </CollapsibleSection>

      <CollapsibleSection title="Financial Projections" subtitle="5-year growth trajectory" badge="5 years">
        <DataTable
          headers={['Metric', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']}
          rows={FINANCIAL_PROJECTIONS.map(f => [f.metric, f.year1, f.year2, f.year3, f.year4, f.year5])}
          headerColor="green"
        />
      </CollapsibleSection>

      <CollapsibleSection title="Competitive Analysis & Moat">
        <DataTable
          headers={['Competitor', 'Category', 'Strengths', 'Weakness vs SignOf', 'Threat']}
          rows={COMPETITORS.map(c => [c.name, c.category, c.strengths, c.weakness, c.threat])}
          headerColor="coral"
        />

        <h3 className="business-page__sub-heading">The 5 Unassailable Moats</h3>
        <div className="business-page__moats">
          {MOATS.map((moat, i) => (
            <div key={i} className="business-page__moat">
              <h4 className="business-page__moat-title">{moat.title}</h4>
              <p className="business-page__moat-desc">{moat.description}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Technology Stack" subtitle="Enterprise-grade infrastructure">
        <DataTable
          headers={['Component', 'Technology', 'Purpose']}
          rows={TECH_STACK.map(t => [t.component, t.technology, t.purpose])}
          headerColor="blue"
        />
      </CollapsibleSection>

      <CollapsibleSection title="Risk Analysis" subtitle="Key risks with mitigation strategies">
        <DataTable
          headers={['Risk', 'Severity', 'Probability', 'Mitigation']}
          rows={RISKS.map(r => [r.risk, r.severity, r.probability, r.mitigation])}
          headerColor="coral"
        />
      </CollapsibleSection>
    </div>
  )
}

export default BusinessPage
