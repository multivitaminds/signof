import CollapsibleSection from '../components/CollapsibleSection'
import DataTable from '../components/DataTable'
import MetricCard from '../components/MetricCard'
import ConnectorChip from '../components/ConnectorChip'
import { INTEGRATION_CATEGORIES, AGENT_CONNECTOR_MAPPINGS, CONNECTOR_ARCHITECTURE_LEVELS } from '../data/integrations'
import { CONNECTOR_CATEGORIES, CONNECTOR_STATS } from '../data/connectors'
import { WHY_CONNECTORS_CALLOUT, CONNECTOR_GROWTH_CALLOUT, HTTP_NODE_CALLOUT } from '../data/businessPlan'
import './IntegrationsPage.css'

function IntegrationsPage() {
  return (
    <div className="integrations-page">
      {/* Integration Map Section */}
      <div className="integrations-page__hero">
        <h2 className="integrations-page__title">Universal Connector Fabric</h2>
        <p className="integrations-page__subtitle">
          SignOf connects to every SaaS platform, API, device, wearable, and data source
          your agents need.
        </p>
      </div>

      <div className="integrations-page__metrics">
        <MetricCard value="739+" label="Platform Integrations" color="#7C5CFC" />
        <MetricCard value="18" label="Categories" color="#FF4D35" />
        <MetricCard value="Bi-Dir" label="Read + Write + Stream" color="#06D6A0" />
        <MetricCard value="OAuth" label="Secure Auth for All" color="#FBBF24" />
      </div>

      <div className="integrations-page__callout integrations-page__callout--green">
        <h4>{WHY_CONNECTORS_CALLOUT.title}</h4>
        <p>{WHY_CONNECTORS_CALLOUT.text}</p>
      </div>

      <CollapsibleSection title="Complete Integration Map by Category" badge={`${INTEGRATION_CATEGORIES.length} categories`} defaultOpen>
        {INTEGRATION_CATEGORIES.map(category => (
          <CollapsibleSection
            key={category.name}
            title={`${category.emoji} ${category.name}`}
            badge={`${category.count} integrations`}
          >
            <div className="integrations-page__pills">
              {category.items.map(item => (
                <span key={item} className="integrations-page__pill">{item}</span>
              ))}
            </div>
          </CollapsibleSection>
        ))}
      </CollapsibleSection>

      <CollapsibleSection title="How Agents Use Connectors" subtitle="Each domain's agents leverage specific connectors from the fabric">
        <DataTable
          headers={['Life Domain', 'Agents', 'Primary Connector Categories', 'Key Platforms', 'Connection Type']}
          rows={AGENT_CONNECTOR_MAPPINGS.map(m => [m.domain, String(m.agents), m.primaryCategories, m.keyPlatforms, m.connectionType])}
          headerColor="purple"
        />
      </CollapsibleSection>

      <CollapsibleSection title="Connector Architecture" subtitle="How It Works">
        <div className="integrations-page__architecture">
          {CONNECTOR_ARCHITECTURE_LEVELS.map((level, i) => (
            <p key={i} className="integrations-page__arch-level">
              <strong style={{ color: level.color }}>{level.label}:</strong> {level.text}
            </p>
          ))}
        </div>
        <div className="integrations-page__callout integrations-page__callout--gold">
          <h4>Universal Fallback — HTTP Node</h4>
          <p>{CONNECTOR_ARCHITECTURE_LEVELS.find(l => l.label.includes('Fallback'))?.text ?? 'For any platform not in the native catalog, the Universal HTTP connector calls any REST, GraphQL, SOAP, or WebSocket API.'}</p>
        </div>
      </CollapsibleSection>

      <div className="integrations-page__callout integrations-page__callout--coral">
        <h4>{CONNECTOR_GROWTH_CALLOUT.title}</h4>
        <p>{CONNECTOR_GROWTH_CALLOUT.text}</p>
      </div>

      {/* Connectors Section */}
      <div className="integrations-page__divider" />

      <div className="integrations-page__connector-hero">
        <div className="integrations-page__big-num">500+</div>
        <p className="integrations-page__connector-subtitle">
          Plug AI into your own data &amp; over 500 integrations — with a roadmap to 10,000+.
          Every connector is a doorway for agents to act on your behalf.
        </p>
      </div>

      {CONNECTOR_CATEGORIES.map(category => (
        <CollapsibleSection
          key={category.name}
          title={category.name}
          badge={`${category.connectors.length} connectors`}
        >
          <div className="integrations-page__connector-grid">
            {category.connectors.map(conn => (
              <ConnectorChip
                key={conn.name}
                name={conn.name}
                initial={conn.initial}
                color={conn.color}
              />
            ))}
          </div>
        </CollapsibleSection>
      ))}

      <div className="integrations-page__connector-stats">
        {CONNECTOR_STATS.map(stat => (
          <MetricCard
            key={stat.label}
            value={stat.value}
            label={stat.label}
            color={stat.color}
          />
        ))}
      </div>

      <div className="integrations-page__callout">
        <h4>{HTTP_NODE_CALLOUT.title}</h4>
        <p>{HTTP_NODE_CALLOUT.text}</p>
      </div>
    </div>
  )
}

export default IntegrationsPage
