import CollapsibleSection from '../components/CollapsibleSection'
import DataTable from '../components/DataTable'
import { AGENT_DOMAINS } from '../data/agents'
import type { HeaderColor } from '../types'
import './AgentCatalogPage.css'

function AgentCatalogPage() {
  return (
    <div className="agent-catalog-page">
      <div className="agent-catalog-page__hero">
        <h2 className="agent-catalog-page__title">Complete Agent Catalog</h2>
        <p className="agent-catalog-page__subtitle">
          185 Agents Across 12 Life Domains — every agent with detailed task description,
          required integrations, autonomy level, key performance metric, and pricing.
        </p>
      </div>

      {AGENT_DOMAINS.map(domain => (
        <CollapsibleSection
          key={domain.id}
          title={`${domain.emoji} ${domain.name}`}
          badge={`${domain.agentCount} agents`}
          defaultOpen={false}
        >
          <div className="agent-catalog-page__domain-info">
            <p className="agent-catalog-page__domain-desc">{domain.description}</p>
            <div className="agent-catalog-page__domain-meta">
              <span>🤖 <strong>{domain.agentCount} Agents</strong></span>
              <span>🎯 {domain.targetAudience}</span>
              <span>📊 TAM: {domain.tam}</span>
            </div>
          </div>

          <DataTable
            headers={['#', 'Agent Name', 'Task Description', 'Integrations', 'Autonomy', 'Key Metric', 'Price']}
            rows={domain.agents.map(agent => [
              String(agent.id),
              agent.name,
              agent.description,
              agent.integrations,
              agent.autonomy,
              agent.keyMetric,
              agent.price,
            ])}
            headerColor={domain.headerColor as HeaderColor}
          />
        </CollapsibleSection>
      ))}
    </div>
  )
}

export default AgentCatalogPage
