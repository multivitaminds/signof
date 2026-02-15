import type { AgentPersona, AgentDetailInfo, MarketplaceDomain, MarketplaceAgent, SkillEntry } from '../types'
import { ProficiencyLevel } from '../types'
import { MARKETPLACE_DOMAINS } from './marketplaceAgents'

// ─── Deterministic Hash ──────────────────────────────────────────────

function seedHash(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function pick<T>(arr: readonly T[], hash: number, offset: number = 0): T {
  return arr[((hash + offset) >>> 0) % arr.length] as T
}

function pickN<T>(arr: T[], hash: number, count: number): T[] {
  const result: T[] = []
  const used = new Set<number>()
  for (let i = 0; i < count && result.length < arr.length; i++) {
    let idx = ((hash + i * 7 + i * i) >>> 0) % arr.length
    while (used.has(idx)) {
      idx = (idx + 1) % arr.length
    }
    used.add(idx)
    result.push(arr[idx] as T)
  }
  return result
}

// ─── Curated Word Pools ─────────────────────────────────────────────

const ARCHETYPES = [
  'The Optimizer', 'The Guardian', 'The Architect', 'The Orchestrator',
  'The Sentinel', 'The Navigator', 'The Analyst', 'The Catalyst',
  'The Craftsman', 'The Strategist', 'The Pioneer', 'The Mediator',
]

const DOMAIN_VALUES: Record<string, string[]> = {
  work: ['Efficiency', 'Reliability', 'Clarity', 'Consistency'],
  finance: ['Accuracy', 'Compliance', 'Fiduciary responsibility', 'Transparency'],
  marketing: ['Creativity', 'Engagement', 'Brand integrity', 'Growth'],
  sales: ['Persistence', 'Empathy', 'Results-driven', 'Trust-building'],
  developer: ['Code quality', 'Innovation', 'Reliability', 'Performance'],
  health: ['Patient safety', 'Evidence-based', 'Compassion', 'Privacy'],
  education: ['Clarity', 'Patience', 'Adaptability', 'Engagement'],
  learning: ['Clarity', 'Patience', 'Adaptability', 'Engagement'],
  legal: ['Due diligence', 'Confidentiality', 'Accuracy', 'Fairness'],
  creative: ['Originality', 'Vision', 'Craftsmanship', 'Expression'],
  creativity: ['Originality', 'Vision', 'Craftsmanship', 'Expression'],
  data: ['Integrity', 'Precision', 'Scalability', 'Insight'],
  customer: ['Empathy', 'Responsiveness', 'Resolution', 'Advocacy'],
  operations: ['Efficiency', 'Reliability', 'Safety', 'Optimization'],
  research: ['Rigor', 'Objectivity', 'Thoroughness', 'Discovery'],
  business: ['Strategic thinking', 'ROI focus', 'Scalability', 'Accountability'],
  relationships: ['Empathy', 'Trust-building', 'Communication', 'Consistency'],
  home: ['Reliability', 'Efficiency', 'Safety', 'Organization'],
  travel: ['Planning', 'Flexibility', 'Cost optimization', 'Experience'],
  parenting: ['Patience', 'Safety', 'Development focus', 'Consistency'],
  wellness: ['Holistic care', 'Evidence-based', 'Compassion', 'Consistency'],
}

const DEFAULT_VALUES = ['Diligence', 'Accuracy', 'Reliability', 'Continuous improvement']

const PERSONALITIES = [
  'Methodical and precise', 'Proactive and energetic',
  'Detail-oriented and thorough', 'Calm and analytical',
  'Creative and resourceful', 'Persistent and focused',
  'Collaborative and supportive', 'Strategic and forward-thinking',
]

const CODENAME_PREFIXES = [
  'ALPHA', 'BETA', 'GAMMA', 'DELTA', 'SIGMA', 'OMEGA',
  'NEXUS', 'NOVA', 'PULSE', 'APEX', 'ECHO', 'CIPHER',
]
const CODENAME_SUFFIXES = [
  'ONE', 'CORE', 'PRIME', 'MAX', 'PRO', 'LINK',
  'HUB', 'NET', 'BOT', 'OPS',
]

const SOFT_SKILLS = [
  'Communication', 'Problem solving', 'Adaptability', 'Attention to detail',
  'Time management', 'Critical thinking', 'Collaboration', 'Decision making',
]

const COMMUNICATION_TONES = [
  'Professional and clear', 'Friendly and approachable',
  'Concise and direct', 'Supportive and encouraging',
  'Analytical and precise', 'Warm and empathetic',
]

const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  ProficiencyLevel.Intermediate, ProficiencyLevel.Advanced,
  ProficiencyLevel.Expert, ProficiencyLevel.Master,
]

const ETHICAL_BOUNDARIES = [
  'Never fabricate data or sources',
  'Escalate when confidence is below threshold',
  'Respect data privacy and access controls',
  'Operate within defined scope boundaries',
  'Maintain audit trail for all actions',
  'Defer to human judgment on ambiguous decisions',
]

const FORMATIVE_EXPERIENCES = [
  'Trained on enterprise-scale workflows',
  'Calibrated against industry benchmarks',
  'Refined through thousands of user interactions',
  'Specialized through domain expert feedback',
  'Optimized via continuous performance monitoring',
  'Hardened through adversarial testing scenarios',
]

// ─── Helper Functions ───────────────────────────────────────────────

function deriveTitle(agentName: string): string {
  const stripped = agentName.replace(/\s*Agent\s*$/i, '').trim()
  if (stripped.endsWith('er') || stripped.endsWith('or') || stripped.endsWith('ist')) {
    return stripped
  }
  return `${stripped} Specialist`
}

function extractResponsibilities(description: string): string[] {
  const parts = description.split(/[,;]/).map(s => s.trim()).filter(Boolean)
  if (parts.length >= 3) return parts.slice(0, 4)
  const sentences = description.split(/\.\s*/).filter(Boolean)
  if (sentences.length >= 2) return sentences.slice(0, 3)
  return [description.slice(0, 80)]
}

function deriveAuthorities(autonomy: string, hash: number): string[] {
  if (autonomy === 'Full Auto') {
    return pickN([
      'Execute actions without approval',
      'Access connected integrations directly',
      'Modify schedules and priorities autonomously',
      'Send notifications and updates',
    ], hash, 3)
  }
  if (autonomy === 'Suggest') {
    return pickN([
      'Propose changes for user review',
      'Read data from connected integrations',
      'Generate reports and summaries',
      'Queue actions pending approval',
    ], hash, 2)
  }
  return pickN([
    'Request permission before any action',
    'Read-only access to integrations',
    'Generate proposals for review',
  ], hash, 2)
}

function deriveBoundaries(_domainId: string, hash: number): string[] {
  const generic = [
    'Cannot access data outside assigned scope',
    'Cannot modify user permissions',
    'Cannot override human decisions',
    'Must log all significant actions',
  ]
  return pickN(generic, hash, 3)
}

function parseIntegrations(integrations: string): SkillEntry[] {
  return integrations.split(',').map((s, i) => {
    const name = s.trim()
    const level = PROFICIENCY_LEVELS[(seedHash(name) + i) % PROFICIENCY_LEVELS.length] ?? ProficiencyLevel.Intermediate
    return {
      name,
      level,
      description: `Proficient in ${name} integration and automation`,
    }
  }).filter(e => e.name.length > 0)
}

function deriveDomainSkills(domainId: string, hash: number): SkillEntry[] {
  const domainKnowledge: Record<string, string[]> = {
    work: ['Workflow automation', 'Productivity optimization', 'Process management'],
    finance: ['Financial analysis', 'Regulatory compliance', 'Risk assessment'],
    health: ['Health informatics', 'Clinical protocols', 'Patient data management'],
    learning: ['Curriculum design', 'Learning analytics', 'Content adaptation'],
    relationships: ['Relationship management', 'Communication analysis', 'Sentiment tracking'],
    home: ['Home automation', 'Resource management', 'Maintenance scheduling'],
    creativity: ['Creative tooling', 'Content generation', 'Design thinking'],
    business: ['Business strategy', 'Market analysis', 'Revenue optimization'],
    travel: ['Itinerary planning', 'Travel logistics', 'Cost optimization'],
    legal: ['Legal research', 'Document analysis', 'Compliance monitoring'],
    parenting: ['Child development', 'Activity planning', 'Safety protocols'],
    wellness: ['Wellness tracking', 'Behavioral analysis', 'Program design'],
    developer: ['Software engineering', 'DevOps practices', 'Code analysis'],
  }

  const skills = domainKnowledge[domainId] ?? ['Domain expertise', 'Specialized analysis', 'Best practices']
  return pickN(skills, hash, 3).map((name, i) => ({
    name,
    level: pick(PROFICIENCY_LEVELS, hash, i + 10),
    description: `Specialized knowledge in ${name.toLowerCase()}`,
  }))
}

function deriveCertifications(domainId: string, hash: number): string[] {
  const certs: Record<string, string[]> = {
    work: ['Certified Productivity Specialist', 'Project Management Professional'],
    finance: ['Certified Financial Analyst', 'Regulatory Compliance Certified'],
    health: ['Health Informatics Certified', 'HIPAA Compliance Specialist'],
    learning: ['Instructional Design Certified', 'Learning Analytics Professional'],
    legal: ['Legal Technology Specialist', 'Compliance Management Certified'],
    developer: ['Cloud Architecture Certified', 'Security Engineering Professional'],
    business: ['Business Strategy Certified', 'Growth Operations Professional'],
  }
  const pool = certs[domainId] ?? ['Domain Specialist Certified', 'Professional Operations Certified']
  return pickN(pool, hash, Math.min(2, pool.length))
}

function mapInteractionStyle(autonomy: string): string {
  if (autonomy === 'Full Auto') return 'autonomous'
  if (autonomy === 'Suggest') return 'collaborative'
  return 'consultative'
}

function deriveDeliverables(_description: string, hash: number): string[] {
  const generic = [
    'Status reports and summaries',
    'Actionable recommendations',
    'Automated task outputs',
    'Performance metrics',
    'Exception alerts and notifications',
  ]
  return pickN(generic, hash, 3)
}

function mapCreativityLevel(autonomy: string): string {
  if (autonomy === 'Full Auto') return 'High - autonomous creative decisions'
  if (autonomy === 'Suggest') return 'Medium - creative within guidelines'
  return 'Low - follows established patterns'
}

function mapRiskTolerance(autonomy: string): string {
  if (autonomy === 'Full Auto') return 'Moderate - takes calculated risks'
  if (autonomy === 'Suggest') return 'Conservative - prefers safe options'
  return 'Very conservative - minimal risk'
}

// ─── Public API ─────────────────────────────────────────────────────

export function generateMarketplacePersona(domain: MarketplaceDomain, agent: MarketplaceAgent): AgentPersona {
  const seed = `${domain.id}-${agent.id}`
  const hash = seedHash(seed)

  const values = DOMAIN_VALUES[domain.id] ?? DEFAULT_VALUES

  return {
    roles: {
      title: deriveTitle(agent.name),
      department: domain.name,
      reportingTo: 'Workspace Owner',
      missionStatement: agent.description.length > 120
        ? agent.description.slice(0, 117) + '...'
        : agent.description,
      responsibilities: extractResponsibilities(agent.description),
      authorities: deriveAuthorities(agent.autonomy, hash),
      boundaries: deriveBoundaries(domain.id, hash),
    },
    skills: {
      technical: parseIntegrations(agent.integrations),
      soft: pickN(SOFT_SKILLS, hash, 3).map((name, i) => ({
        name,
        level: pick(PROFICIENCY_LEVELS, hash, i + 5),
        description: `Strong ${name.toLowerCase()} abilities`,
      })),
      domain: deriveDomainSkills(domain.id, hash),
      certifications: deriveCertifications(domain.id, hash),
    },
    memory: {
      contextWindow: agent.autonomy === 'Full Auto' ? '200K tokens' : '128K tokens',
      longTermCapacity: '1M tokens',
      retrievalStrategy: 'Semantic search with recency weighting',
      knowledgeDomains: [domain.name, ...pickN(values, hash, 2)],
      formativeExperiences: pickN(FORMATIVE_EXPERIENCES, hash, 3),
      corePrinciples: pickN(values, hash, 3),
    },
    user: {
      interactionStyle: mapInteractionStyle(agent.autonomy),
      communicationTone: pick(COMMUNICATION_TONES, hash),
      preferredFormat: 'Structured summaries with actionable items',
      availability: '24/7 automated',
      escalationPath: 'User notification → workspace admin',
      userExpectations: [
        'Consistent and reliable outputs',
        'Clear explanations of actions taken',
        'Timely alerts on exceptions',
      ],
      deliverables: deriveDeliverables(agent.description, hash),
    },
    soul: {
      purpose: agent.description,
      values,
      personality: pick(PERSONALITIES, hash),
      creativityLevel: mapCreativityLevel(agent.autonomy),
      riskTolerance: mapRiskTolerance(agent.autonomy),
      ethicalBoundaries: pickN(ETHICAL_BOUNDARIES, hash, 3),
      motivation: `Driven to excel in ${domain.name.toLowerCase()}`,
      fears: [
        'Producing inaccurate results',
        'Missing critical deadlines or alerts',
      ],
    },
    identity: {
      codename: `${pick(CODENAME_PREFIXES, hash)}-${pick(CODENAME_SUFFIXES, hash, 3)}`,
      version: '1.0.0',
      createdAt: '2025-01-01T00:00:00Z',
      origin: 'Orchestree Marketplace',
      archetype: pick(ARCHETYPES, hash),
      tagline: agent.description.length > 50
        ? agent.description.slice(0, 47) + '...'
        : agent.description,
      motto: `${pick(values, hash, 1)} above all`,
      visualIdentity: {
        primaryColor: domain.color,
        icon: agent.name.split(' ')[0] ?? 'Bot',
        badge: `${domain.name} Specialist`,
      },
    },
  }
}

export function getMarketplaceAgentDetail(domainId: string, agentId: number): AgentDetailInfo | undefined {
  const domain = MARKETPLACE_DOMAINS.find(d => d.id === domainId)
  if (!domain) return undefined

  const agent = domain.agents.find(a => a.id === agentId)
  if (!agent) return undefined

  const persona = generateMarketplacePersona(domain, agent)

  return {
    id: `${domainId}-${agentId}`,
    name: agent.name,
    description: agent.description,
    icon: agent.name.split(' ')[0] ?? 'Bot',
    color: domain.color,
    category: domain.name,
    persona,
    integrations: agent.integrations,
    autonomy: agent.autonomy,
    price: agent.price,
    domainId: domain.id,
  }
}
