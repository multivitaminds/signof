import CollapsibleSection from '../components/CollapsibleSection'
import DataTable from '../components/DataTable'
import MetricCard from '../components/MetricCard'
import LayerStack from '../components/LayerStack'
import {
  EXEC_METRICS,
  FUNDAMENTAL_SHIFT_CALLOUT,
  ARCHITECTURE_LAYERS,
  GTM_TABLE,
} from '../data/businessPlan'
import './OverviewPage.css'

function OverviewPage() {
  return (
    <div className="overview-page">
      <div className="overview-page__hero">
        <p className="overview-page__overline">Beyond Automation — The 100x Vision</p>
        <h1 className="overview-page__title">
          <span className="overview-page__title-w1">SignOf</span>
          <br />
          <span className="overview-page__title-w2">Agent OS for Life</span>
        </h1>
        <p className="overview-page__subtitle">
          Deploy AI agents across every domain of human life — work, finance, health,
          learning, relationships, home, creativity, business, travel, legal, parenting,
          and wellness. One platform. <strong>185 agents</strong>. Infinite potential.
        </p>
      </div>

      <div className="overview-page__metrics">
        <MetricCard value="185" label="AI Agent Types" color="#FF4D35" />
        <MetricCard value="12" label="Life Domains" color="#7C5CFC" />
        <MetricCard value="$280B+" label="Total TAM" color="#06D6A0" />
        <MetricCard value="739+" label="Platform Connectors" color="#FBBF24" />
      </div>

      <CollapsibleSection title="Executive Summary" defaultOpen>
        <p className="overview-page__section-intro">
          SignOf is a next-generation Agent Operating System that enables individuals
          and organizations to deploy specialized AI agents across every domain of human life.
        </p>

        <div className="overview-page__callout overview-page__callout--coral">
          <h4>{FUNDAMENTAL_SHIFT_CALLOUT.title}</h4>
          <p>{FUNDAMENTAL_SHIFT_CALLOUT.text}</p>
        </div>

        <DataTable
          headers={['Metric', 'Value']}
          rows={EXEC_METRICS.map(m => [m.metric, m.value])}
          headerColor="purple"
        />
      </CollapsibleSection>

      <CollapsibleSection title="Platform Architecture" subtitle="The 5-Layer Agent OS" defaultOpen>
        <p className="overview-page__section-intro">
          Each layer builds on the one below. The bottom is what exists today.
          The top is what makes SignOf 100x.
        </p>
        <LayerStack layers={ARCHITECTURE_LAYERS} />
      </CollapsibleSection>

      <CollapsibleSection title="Target Markets & Go-to-Market Strategy" badge="8 segments">
        <p className="overview-page__section-intro">
          Three concentric expansion phases from technical early adopters to mass consumer.
        </p>
        <DataTable
          headers={['Phase', 'Timeline', 'Segment', 'Size', 'Entry Agents', 'Price', 'Channel']}
          rows={GTM_TABLE.map(r => [r.phase, r.timeline, r.segment, r.size, r.entryAgents, r.price, r.channel])}
          headerColor="purple"
        />
      </CollapsibleSection>
    </div>
  )
}

export default OverviewPage
