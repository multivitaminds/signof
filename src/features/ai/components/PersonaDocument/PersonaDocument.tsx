import { PersonaTab } from '../../types'
import type { PersonaTab as PersonaTabType, AgentPersona, ProficiencyLevel } from '../../types'
import './PersonaDocument.css'

interface PersonaDocumentProps {
  tab: PersonaTabType
  persona: AgentPersona
  agentColor: string
}

const LEVEL_WIDTH: Record<string, number> = {
  beginner: 20,
  intermediate: 40,
  advanced: 60,
  expert: 80,
  master: 100,
}

function SkillBar({ name, level, description }: { name: string; level: ProficiencyLevel; description: string }) {
  const width = LEVEL_WIDTH[level] ?? 50
  return (
    <div className="persona-doc__skill">
      <div className="persona-doc__skill-header">
        <span className="persona-doc__skill-name">{name}</span>
        <span className="persona-doc__skill-level">{level}</span>
      </div>
      <div className="persona-doc__skill-bar-track">
        <div className="persona-doc__skill-bar-fill" style={{ width: `${width}%` }} />
      </div>
      <p className="persona-doc__skill-desc">{description}</p>
    </div>
  )
}

function RolesTab({ roles }: { roles: AgentPersona['roles'] }) {
  return (
    <div className="persona-doc__section">
      <div className="persona-doc__mission">
        <h3 className="persona-doc__section-title">Mission Statement</h3>
        <blockquote className="persona-doc__blockquote">{roles.missionStatement}</blockquote>
      </div>
      <div className="persona-doc__info-grid">
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Title</span>
          <span className="persona-doc__info-value">{roles.title}</span>
        </div>
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Department</span>
          <span className="persona-doc__info-value">{roles.department}</span>
        </div>
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Reports To</span>
          <span className="persona-doc__info-value">{roles.reportingTo}</span>
        </div>
      </div>
      <div className="persona-doc__list-section">
        <h3 className="persona-doc__section-title">Responsibilities</h3>
        <ul className="persona-doc__list">{roles.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </div>
      <div className="persona-doc__list-section">
        <h3 className="persona-doc__section-title">Authorities</h3>
        <ul className="persona-doc__list">{roles.authorities.map((a, i) => <li key={i}>{a}</li>)}</ul>
      </div>
      <div className="persona-doc__list-section">
        <h3 className="persona-doc__section-title">Boundaries</h3>
        <ul className="persona-doc__list persona-doc__list--boundaries">{roles.boundaries.map((b, i) => <li key={i}>{b}</li>)}</ul>
      </div>
    </div>
  )
}

function SkillsTab({ skills }: { skills: AgentPersona['skills'] }) {
  return (
    <div className="persona-doc__section">
      <div className="persona-doc__skills-group">
        <h3 className="persona-doc__section-title">Technical Skills</h3>
        {skills.technical.map((s, i) => <SkillBar key={i} name={s.name} level={s.level} description={s.description} />)}
      </div>
      <div className="persona-doc__skills-group">
        <h3 className="persona-doc__section-title">Soft Skills</h3>
        {skills.soft.map((s, i) => <SkillBar key={i} name={s.name} level={s.level} description={s.description} />)}
      </div>
      <div className="persona-doc__skills-group">
        <h3 className="persona-doc__section-title">Domain Knowledge</h3>
        {skills.domain.map((s, i) => <SkillBar key={i} name={s.name} level={s.level} description={s.description} />)}
      </div>
      {skills.certifications.length > 0 && (
        <div className="persona-doc__list-section">
          <h3 className="persona-doc__section-title">Certifications</h3>
          <div className="persona-doc__tags">
            {skills.certifications.map((c, i) => <span key={i} className="persona-doc__tag">{c}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}

function MemoryTab({ memory }: { memory: AgentPersona['memory'] }) {
  return (
    <div className="persona-doc__section">
      <div className="persona-doc__info-grid">
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Context Window</span>
          <span className="persona-doc__info-value">{memory.contextWindow}</span>
        </div>
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Long-Term Capacity</span>
          <span className="persona-doc__info-value">{memory.longTermCapacity}</span>
        </div>
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Retrieval Strategy</span>
          <span className="persona-doc__info-value persona-doc__info-value--badge">{memory.retrievalStrategy}</span>
        </div>
      </div>
      <div className="persona-doc__list-section">
        <h3 className="persona-doc__section-title">Knowledge Domains</h3>
        <div className="persona-doc__tags">
          {memory.knowledgeDomains.map((d, i) => <span key={i} className="persona-doc__tag">{d}</span>)}
        </div>
      </div>
      <div className="persona-doc__list-section">
        <h3 className="persona-doc__section-title">Formative Experiences</h3>
        <div className="persona-doc__timeline">
          {memory.formativeExperiences.map((e, i) => (
            <div key={i} className="persona-doc__timeline-item">
              <span className="persona-doc__timeline-dot" />
              <p>{e}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="persona-doc__list-section">
        <h3 className="persona-doc__section-title">Core Principles</h3>
        <ol className="persona-doc__ordered-list">
          {memory.corePrinciples.map((p, i) => <li key={i}>{p}</li>)}
        </ol>
      </div>
    </div>
  )
}

function UserTab({ user }: { user: AgentPersona['user'] }) {
  return (
    <div className="persona-doc__section">
      <div className="persona-doc__spec-table">
        <div className="persona-doc__spec-row">
          <span className="persona-doc__spec-label">Interaction Style</span>
          <span className="persona-doc__spec-value">{user.interactionStyle}</span>
        </div>
        <div className="persona-doc__spec-row">
          <span className="persona-doc__spec-label">Communication Tone</span>
          <span className="persona-doc__spec-value">{user.communicationTone}</span>
        </div>
        <div className="persona-doc__spec-row">
          <span className="persona-doc__spec-label">Preferred Format</span>
          <span className="persona-doc__spec-value">{user.preferredFormat}</span>
        </div>
        <div className="persona-doc__spec-row">
          <span className="persona-doc__spec-label">Availability</span>
          <span className="persona-doc__spec-value">{user.availability}</span>
        </div>
        <div className="persona-doc__spec-row">
          <span className="persona-doc__spec-label">Escalation Path</span>
          <span className="persona-doc__spec-value">{user.escalationPath}</span>
        </div>
      </div>
      <div className="persona-doc__list-section">
        <h3 className="persona-doc__section-title">User Expectations</h3>
        <ul className="persona-doc__checklist">
          {user.userExpectations.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>
      <div className="persona-doc__list-section">
        <h3 className="persona-doc__section-title">Deliverables</h3>
        <ul className="persona-doc__list">{user.deliverables.map((d, i) => <li key={i}>{d}</li>)}</ul>
      </div>
    </div>
  )
}

function SoulTab({ soul, agentColor }: { soul: AgentPersona['soul']; agentColor: string }) {
  return (
    <div className="persona-doc__section">
      <div className="persona-doc__purpose" style={{ '--agent-color': agentColor } as React.CSSProperties}>
        <h3 className="persona-doc__section-title">Purpose</h3>
        <p className="persona-doc__purpose-text">{soul.purpose}</p>
      </div>
      <div className="persona-doc__list-section">
        <h3 className="persona-doc__section-title">Values</h3>
        <div className="persona-doc__tags persona-doc__tags--values">
          {soul.values.map((v, i) => <span key={i} className="persona-doc__tag persona-doc__tag--value">{v}</span>)}
        </div>
      </div>
      <div className="persona-doc__info-grid">
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Personality</span>
          <span className="persona-doc__info-value">{soul.personality}</span>
        </div>
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Creativity Level</span>
          <span className="persona-doc__info-value">{soul.creativityLevel}</span>
        </div>
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Risk Tolerance</span>
          <span className="persona-doc__info-value">{soul.riskTolerance}</span>
        </div>
      </div>
      <div className="persona-doc__list-section">
        <h3 className="persona-doc__section-title">Ethical Boundaries</h3>
        <ul className="persona-doc__list persona-doc__list--boundaries">{soul.ethicalBoundaries.map((b, i) => <li key={i}>{b}</li>)}</ul>
      </div>
      <div className="persona-doc__info-grid">
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Motivation</span>
          <span className="persona-doc__info-value">{soul.motivation}</span>
        </div>
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Fears</span>
          <span className="persona-doc__info-value">{soul.fears.join(', ')}</span>
        </div>
      </div>
    </div>
  )
}

function IdentityTab({ identity }: { identity: AgentPersona['identity'] }) {
  return (
    <div className="persona-doc__section">
      <div className="persona-doc__codename-hero">
        <span className="persona-doc__codename">{identity.codename}</span>
        <span className="persona-doc__version">v{identity.version}</span>
      </div>
      <div className="persona-doc__info-grid">
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Archetype</span>
          <span className="persona-doc__info-value persona-doc__info-value--badge">{identity.archetype}</span>
        </div>
        <div className="persona-doc__info-item">
          <span className="persona-doc__info-label">Created</span>
          <span className="persona-doc__info-value">{identity.createdAt}</span>
        </div>
      </div>
      <div className="persona-doc__tagline-block">
        <h3 className="persona-doc__section-title">Tagline</h3>
        <p className="persona-doc__tagline">&ldquo;{identity.tagline}&rdquo;</p>
      </div>
      <div className="persona-doc__tagline-block">
        <h3 className="persona-doc__section-title">Motto</h3>
        <p className="persona-doc__motto">&ldquo;{identity.motto}&rdquo;</p>
      </div>
      <div className="persona-doc__list-section">
        <h3 className="persona-doc__section-title">Origin</h3>
        <p className="persona-doc__origin">{identity.origin}</p>
      </div>
      <div className="persona-doc__visual-identity">
        <h3 className="persona-doc__section-title">Visual Identity</h3>
        <div className="persona-doc__visual-row">
          <div className="persona-doc__color-swatch" style={{ backgroundColor: identity.visualIdentity.primaryColor }} />
          <span className="persona-doc__visual-label">{identity.visualIdentity.primaryColor}</span>
          <span className="persona-doc__visual-badge">{identity.visualIdentity.badge}</span>
        </div>
      </div>
    </div>
  )
}

export default function PersonaDocument({ tab, persona, agentColor }: PersonaDocumentProps) {
  switch (tab) {
    case PersonaTab.Roles:
      return <RolesTab roles={persona.roles} />
    case PersonaTab.Skills:
      return <SkillsTab skills={persona.skills} />
    case PersonaTab.Memory:
      return <MemoryTab memory={persona.memory} />
    case PersonaTab.User:
      return <UserTab user={persona.user} />
    case PersonaTab.Soul:
      return <SoulTab soul={persona.soul} agentColor={agentColor} />
    case PersonaTab.Identity:
      return <IdentityTab identity={persona.identity} />
    default:
      return null
  }
}
