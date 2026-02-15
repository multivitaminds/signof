import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play } from 'lucide-react'
import { getIcon } from '../../lib/agentIcons'
import { lookupAgent } from '../../lib/agentLookup'
import { PersonaTab } from '../../types'
import type { PersonaTab as PersonaTabType } from '../../types'
import PersonaDocument from '../../components/PersonaDocument/PersonaDocument'
import './AgentDetailPage.css'

const TABS: { key: PersonaTabType; label: string }[] = [
  { key: PersonaTab.Roles, label: 'ROLES' },
  { key: PersonaTab.Skills, label: 'SKILLS' },
  { key: PersonaTab.Memory, label: 'MEMORY' },
  { key: PersonaTab.User, label: 'USER' },
  { key: PersonaTab.Soul, label: 'SOUL' },
  { key: PersonaTab.Identity, label: 'IDENTITY' },
]

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<PersonaTabType>(PersonaTab.Roles)

  const agent = agentId ? lookupAgent(agentId) : undefined

  if (!agent) {
    return (
      <div className="agent-detail agent-detail--not-found">
        <button className="agent-detail__back" onClick={() => navigate('/copilot/agents')}>
          <ArrowLeft size={16} /> Back to Agents
        </button>
        <div className="agent-detail__empty">
          <h2>Agent Not Found</h2>
          <p>The agent you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const IconComp = getIcon(agent.icon)

  return (
    <div className="agent-detail">
      {/* Header bar */}
      <div className="agent-detail__header-bar">
        <button className="agent-detail__back" onClick={() => navigate('/copilot/agents')}>
          <ArrowLeft size={16} /> Back to Agents
        </button>
        <div className="agent-detail__header-title">
          {agent.name} Agent
        </div>
        <button className="agent-detail__run-btn btn--primary">
          <Play size={14} /> Run
        </button>
      </div>

      {/* Hero section */}
      <div className="agent-detail__hero" style={{ '--agent-color': agent.color } as React.CSSProperties}>
        <div className="agent-detail__hero-icon">
          <IconComp size={48} />
        </div>
        <div className="agent-detail__hero-info">
          <h1 className="agent-detail__hero-name">{agent.name} Agent</h1>
          <p className="agent-detail__hero-tagline">{agent.persona.identity.tagline}</p>
          <div className="agent-detail__hero-badges">
            <span className="agent-detail__badge agent-detail__badge--category">{agent.category}</span>
            <span className="agent-detail__badge agent-detail__badge--archetype">{agent.persona.identity.archetype}</span>
            {agent.persona.identity.codename && (
              <span className="agent-detail__badge agent-detail__badge--codename">{agent.persona.identity.codename}</span>
            )}
          </div>
        </div>
      </div>

      {/* Agent meta info */}
      {(agent.useCases || agent.capabilities || agent.integrations) && (
        <div className="agent-detail__meta">
          {agent.useCases && agent.useCases.length > 0 && (
            <div className="agent-detail__meta-section">
              <h3 className="agent-detail__meta-label">Use Cases</h3>
              <ul className="agent-detail__meta-list">
                {agent.useCases.map((uc, i) => <li key={i}>{uc}</li>)}
              </ul>
            </div>
          )}
          {agent.capabilities && agent.capabilities.length > 0 && (
            <div className="agent-detail__meta-section">
              <h3 className="agent-detail__meta-label">Capabilities</h3>
              <div className="agent-detail__meta-tags">
                {agent.capabilities.map((cap, i) => (
                  <span key={i} className="agent-detail__meta-tag">{cap}</span>
                ))}
              </div>
            </div>
          )}
          {agent.integrations && (
            <div className="agent-detail__meta-section">
              <h3 className="agent-detail__meta-label">Integrations</h3>
              <p className="agent-detail__meta-text">{agent.integrations}</p>
            </div>
          )}
          {agent.autonomy && (
            <div className="agent-detail__meta-section">
              <h3 className="agent-detail__meta-label">Autonomy</h3>
              <span className="agent-detail__meta-tag">{agent.autonomy}</span>
            </div>
          )}
          {agent.price && (
            <div className="agent-detail__meta-section">
              <h3 className="agent-detail__meta-label">Price</h3>
              <span className="agent-detail__meta-price">{agent.price}</span>
            </div>
          )}
        </div>
      )}

      {/* Persona tabs */}
      <div className="agent-detail__tabs" role="tablist" aria-label="Persona documents">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`agent-detail__tab${activeTab === tab.key ? ' agent-detail__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Persona document content */}
      <div className="agent-detail__content" role="tabpanel">
        <PersonaDocument
          tab={activeTab}
          persona={agent.persona}
          agentColor={agent.color}
        />
      </div>
    </div>
  )
}
