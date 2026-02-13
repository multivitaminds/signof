import CollapsibleSection from '../components/CollapsibleSection'
import DataTable from '../components/DataTable'
import { ROADMAP_PHASES, FOOTER_THESIS, FOOTER_PILLS } from '../data/businessPlan'
import type { HeaderColor } from '../types'
import './RoadmapPage.css'

function RoadmapPage() {
  return (
    <div className="roadmap-page">
      <div className="roadmap-page__hero">
        <h2 className="roadmap-page__title">Implementation Roadmap</h2>
        <p className="roadmap-page__subtitle">
          4 phases over 24+ months — each building on the previous.
        </p>
      </div>

      <div className="roadmap-page__timeline">
        {ROADMAP_PHASES.map(phase => (
          <div key={phase.id} className="roadmap-page__phase">
            <div className="roadmap-page__phase-dot" style={{ borderColor: phase.color }} />
            <CollapsibleSection
              title={phase.title}
              subtitle={phase.timeline}
              badge={phase.phaseLabel}
              defaultOpen={phase.id === 'phase-1'}
            >
              <DataTable
                headers={['Deliverable', 'Details']}
                rows={phase.deliverables.map(d => [d.deliverable, d.details])}
                headerColor={phase.headerColor as HeaderColor}
              />
            </CollapsibleSection>
          </div>
        ))}
      </div>

      {/* Footer / Thesis */}
      <div className="roadmap-page__thesis">
        <h2 className="roadmap-page__thesis-title">The 100x Thesis</h2>
        <p className="roadmap-page__thesis-text">{FOOTER_THESIS}</p>
        <p className="roadmap-page__thesis-tagline">
          185 agents. 12 life domains. 1 platform. Infinite potential.
        </p>
        <div className="roadmap-page__pills">
          {FOOTER_PILLS.map(pill => (
            <span key={pill.label} className="roadmap-page__pill">{pill.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoadmapPage
