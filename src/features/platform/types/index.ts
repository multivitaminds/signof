// Autonomy levels for agents
export const AUTONOMY_LEVELS = {
  FULL_AUTO: 'Full Auto',
  SUGGEST: 'Suggest',
  ASK_FIRST: 'Ask First',
} as const

export type AutonomyLevel = (typeof AUTONOMY_LEVELS)[keyof typeof AUTONOMY_LEVELS]

// Table header color variants
export const HEADER_COLORS = {
  PURPLE: 'purple',
  CORAL: 'coral',
  GREEN: 'green',
  BLUE: 'blue',
  GOLD: 'gold',
  PINK: 'pink',
  ORANGE: 'orange',
  RED: 'red',
  DARK: 'dark',
} as const

export type HeaderColor = (typeof HEADER_COLORS)[keyof typeof HEADER_COLORS]

// Agent definition
export interface Agent {
  id: number
  name: string
  description: string
  integrations: string
  autonomy: AutonomyLevel
  keyMetric: string
  price: string
}

// Agent domain (category of agents)
export interface AgentDomain {
  id: string
  emoji: string
  name: string
  description: string
  targetAudience: string
  tam: string
  agentCount: number
  headerColor: HeaderColor
  agents: Agent[]
}

// Integration category
export interface IntegrationCategory {
  emoji: string
  name: string
  count: number
  items: string[]
}

// How agents use connectors row
export interface AgentConnectorMapping {
  domain: string
  agents: number
  primaryCategories: string
  keyPlatforms: string
  connectionType: string
}

// Connector chip
export interface Connector {
  name: string
  initial: string
  color: string
}

// Connector category
export interface ConnectorCategory {
  name: string
  dotColor: string
  connectors: Connector[]
}

// Connector stat
export interface ConnectorStat {
  value: string
  label: string
  color: string
}

// Pricing tier
export interface PricingTier {
  amount: string
  amountSuffix?: string
  tierName: string
  color: string
  featured?: boolean
  features: string[]
}

// Revenue stream
export interface RevenueStream {
  name: string
  description: string
  contribution: string
}

// Financial projection row
export interface FinancialProjection {
  metric: string
  year1: string
  year2: string
  year3: string
  year4: string
  year5: string
}

// Competitor
export interface Competitor {
  name: string
  category: string
  strengths: string
  weakness: string
  threat: string
}

// Moat
export interface Moat {
  title: string
  description: string
}

// Tech stack row
export interface TechStackRow {
  component: string
  technology: string
  purpose: string
}

// Risk row
export interface RiskRow {
  risk: string
  severity: string
  probability: string
  mitigation: string
}

// Architecture layer
export interface ArchitectureLayer {
  level: number
  colorClass: string
  levelLabel: string
  name: string
  description: string
}

// GTM row
export interface GTMRow {
  phase: string
  timeline: string
  segment: string
  size: string
  entryAgents: string
  price: string
  channel: string
}

// Executive summary metric
export interface ExecMetric {
  metric: string
  value: string
}

// Callout block
export interface Callout {
  title: string
  text: string
  variant?: 'default' | 'coral' | 'green'
}

// Roadmap phase
export interface RoadmapPhase {
  id: string
  phaseLabel: string
  timeline: string
  title: string
  color: string
  headerColor: HeaderColor
  deliverables: { deliverable: string; details: string }[]
}

// Footer pill
export interface FooterPill {
  label: string
}

// Platform tab
export const PLATFORM_TABS = {
  OVERVIEW: 'overview',
  AGENTS: 'agents',
  INTEGRATIONS: 'integrations',
  BUSINESS: 'business',
  ROADMAP: 'roadmap',
} as const

export type PlatformTab = (typeof PLATFORM_TABS)[keyof typeof PLATFORM_TABS]
