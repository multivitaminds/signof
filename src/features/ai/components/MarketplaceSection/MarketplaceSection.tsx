import { ChevronRight, Circle, Play } from 'lucide-react'
import { DOMAIN_ICON } from '../../lib/agentIcons'
import { TOTAL_MARKETPLACE_AGENTS } from '../../data/marketplaceAgents'
import type { MarketplaceDomain } from '../../types'
import './MarketplaceSection.css'

interface MarketplaceSectionProps {
  domains: MarketplaceDomain[]
  expandedDomains: Set<string>
  onToggleDomain: (id: string) => void
  onMarketplaceRun: (domainId: string, agentName: string) => void
}

export default function MarketplaceSection({
  domains,
  expandedDomains,
  onToggleDomain,
  onMarketplaceRun,
}: MarketplaceSectionProps) {
  if (domains.length === 0) return null

  return (
    <section className="copilot-agents__marketplace" aria-label="Agent Marketplace">
      <div className="copilot-agents__marketplace-header">
        <h3 className="copilot-agents__marketplace-title">Agent Marketplace</h3>
        <span className="copilot-agents__marketplace-count">
          {TOTAL_MARKETPLACE_AGENTS} browse-only agents
        </span>
      </div>

      {domains.map(domain => {
        const isExpanded = expandedDomains.has(domain.id)
        return (
          <div key={domain.id} className="copilot-agents__domain" style={{ '--domain-color': domain.color } as React.CSSProperties}>
            <button
              className="copilot-agents__domain-toggle"
              onClick={() => onToggleDomain(domain.id)}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${domain.name}`}
            >
              <ChevronRight
                size={16}
                className={`copilot-agents__domain-chevron${isExpanded ? ' copilot-agents__domain-chevron--expanded' : ''}`}
              />
              <span className="copilot-agents__domain-icon-circle">
                {(() => { const DIcon = DOMAIN_ICON[domain.id] ?? Circle; return <DIcon size={18} /> })()}
              </span>
              <div className="copilot-agents__domain-info">
                <p className="copilot-agents__domain-name">{domain.name}</p>
                <p className="copilot-agents__domain-desc">{domain.description}</p>
              </div>
              <span className="copilot-agents__domain-count">
                {domain.agentCount}
              </span>
            </button>

            {isExpanded && (
              <div className="copilot-agents__domain-content">
                <div className="copilot-agents__marketplace-grid">
                  {domain.agents.map(agent => (
                    <div
                      key={`${domain.id}-${agent.id}`}
                      className="copilot-agents__marketplace-card"
                      onClick={() => onMarketplaceRun(domain.id, agent.name)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onMarketplaceRun(domain.id, agent.name) } }}
                    >
                      <div className="copilot-agents__marketplace-card-header">
                        <span className="copilot-agents__marketplace-card-icon">
                          {(() => { const DomainIcon = DOMAIN_ICON[domain.id] ?? Circle; return <DomainIcon size={14} /> })()}
                        </span>
                        <h4 className="copilot-agents__marketplace-card-name">{agent.name}</h4>
                      </div>
                      <p className="copilot-agents__marketplace-card-desc">{agent.description}</p>
                      <div className="copilot-agents__marketplace-card-meta">
                        <span className="copilot-agents__marketplace-card-tag">{agent.integrations}</span>
                        <span className="copilot-agents__marketplace-card-tag">{agent.autonomy}</span>
                        <span className="copilot-agents__marketplace-card-price">{agent.price}</span>
                      </div>
                      <button
                        className="copilot-agents__marketplace-card-run"
                        onClick={(e) => { e.stopPropagation(); onMarketplaceRun(domain.id, agent.name) }}
                        aria-label={`Run ${agent.name}`}
                      >
                        <Play size={12} fill="currentColor" />
                        Run
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}
