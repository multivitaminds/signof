import type {
  ExecMetric,
  Callout,
  ArchitectureLayer,
  GTMRow,
  PricingTier,
  RevenueStream,
  FinancialProjection,
  Competitor,
  Moat,
  TechStackRow,
  RiskRow,
  RoadmapPhase,
  FooterPill,
} from '../types'

export const EXEC_METRICS: ExecMetric[] = [
  { metric: 'Total Agent Types', value: '185+ across 12 life domains' },
  { metric: 'Target Users (Year 1)', value: '1 million active users' },
  { metric: 'Target Users (Year 3)', value: '50 million active users' },
  { metric: 'Target Users (Year 5)', value: '500 million active users' },
  { metric: 'Revenue Model', value: 'Freemium: Free / $29 / $99 / $499 per month' },
  { metric: 'Projected ARR (Year 1)', value: '$50M' },
  { metric: 'Projected ARR (Year 3)', value: '$4.7B' },
  { metric: 'Total Addressable Market', value: '$280B+ (sum of all domain TAMs)' },
  { metric: 'Defensible Moat', value: 'Personalization flywheel + creator ecosystem + cross-domain intelligence' },
]

export const FUNDAMENTAL_SHIFT_CALLOUT: Callout = {
  title: 'The Fundamental Shift',
  text: "10x = users BUILD workflows. 100x = users DEPLOY agents like installing apps. SignOf doesn't compete with Zapier or Make. It competes with the concept of doing things yourself. The product isn't a workflow builder — it's your second brain with hands.",
  variant: 'coral',
}

export const WHY_CONNECTORS_CALLOUT: Callout = {
  title: 'Why This Matters',
  text: "Every agent needs to talk to the real world. The Inbox Zero Agent needs Gmail. The Spend Tracker needs Plaid. The Smart Home Orchestrator needs HomeKit. The Universal Connector Fabric is Layer 2 of the Agent OS — the nervous system connecting agents to 739+ platforms. Unlike Zapier (8,700 shallow integrations), SignOf builds deep, bidirectional, real-time connectors optimized for autonomous agent operation.",
  variant: 'green',
}

export const CONNECTOR_GROWTH_CALLOUT: Callout = {
  title: 'Connector Growth Roadmap',
  text: "Launch (739+): All platforms listed above with native connectors. Year 1 (2,000+): Community connectors via open-source SDK. Year 2 (5,000+): Connector marketplace with premium connectors. Year 3 (10,000+): Parity with Zapier's breadth + SignOf's depth (bidirectional, real-time, agent-optimized).",
  variant: 'coral',
}

export const HTTP_NODE_CALLOUT: Callout = {
  title: 'Universal HTTP Node — Connect to Anything',
  text: "Even beyond the 500+ native integrations, SignOf's HTTP Request node can connect to ANY service with a REST API, GraphQL endpoint, or webhook. If it's on the internet, SignOf can talk to it. This means the true integration count is unlimited.",
}

export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    level: 5,
    colorClass: 'l5',
    levelLabel: 'Layer 5 — The Moat',
    name: 'Life Intelligence Layer',
    description: 'Cross-domain awareness. Your Finance Agent tells your Health Agent you can\'t afford the gym → suggests home workouts. Unified user knowledge graph, predictive optimization, conflict resolution between agents, life score dashboard, proactive suggestions, anomaly detection. No competitor can replicate without agents in ALL domains.',
  },
  {
    level: 4,
    colorClass: 'l4',
    levelLabel: 'Layer 4 — The Economy',
    name: 'Agent Store + Creator Economy',
    description: 'Browse → Deploy → Run. One-tap install agents built by the community. Ratings, reviews, revenue sharing (70% creator / 30% SignOf). Creator SDK, certification program, agent bundles, enterprise catalog, white-label distribution. This is the App Store moment for AI agents.',
  },
  {
    level: 3,
    colorClass: 'l3',
    levelLabel: 'Layer 3 — The Brain',
    name: 'Multi-Agent Orchestration',
    description: 'Agent runtime, lifecycle management (create/deploy/pause/retire), configuration, execution queue with priority, health monitoring, versioning, inter-agent message bus, sandboxing, human-in-the-loop (Full Auto / Suggest / Ask First). Each agent = workflow + AI decision layer + memory + personality.',
  },
  {
    level: 2,
    colorClass: 'l2',
    levelLabel: 'Layer 2 — The Fabric',
    name: 'Universal Connector Fabric',
    description: '739+ native integrations at launch across 18 categories (scaling to 10,000+): every SaaS app, API, device, database, IoT sensor, calendar, email, bank, wearable (Apple Health, Oura, Whoop, Garmin), smart home (HomeKit, Alexa, Google Home). Universal HTTP/REST/GraphQL, OAuth, WebSocket, MQTT. Connect to your body AND your home.',
  },
  {
    level: 1,
    colorClass: 'l1',
    levelLabel: 'Layer 1 — The Foundation',
    name: 'Workflow Engine',
    description: 'Node-based execution engine: triggers, actions, logic, branching, error handling, JavaScript/Python code nodes. 400+ app integrations. Open-source, battle-tested at 220+ executions/second. Exists today. The runtime agents execute on.',
  },
]

export const GTM_TABLE: GTMRow[] = [
  { phase: 'Phase 1', timeline: 'Months 1-6', segment: 'Developers & DevOps', size: '28M', entryAgents: 'Work agents', price: '$29-99/mo', channel: 'GitHub, HN, Twitter/X' },
  { phase: 'Phase 1', timeline: 'Months 1-6', segment: 'Solopreneurs', size: '60M', entryAgents: 'Business + Finance', price: '$29-99/mo', channel: 'Indie Hackers, YouTube' },
  { phase: 'Phase 1', timeline: 'Months 1-6', segment: 'Content Creators', size: '50M+', entryAgents: 'Creativity agents', price: '$29-99/mo', channel: 'YouTube, TikTok' },
  { phase: 'Phase 2', timeline: 'Months 6-18', segment: 'Sales Teams', size: '15M', entryAgents: 'Business & Sales', price: '$99/mo/user', channel: 'LinkedIn, G2' },
  { phase: 'Phase 2', timeline: 'Months 6-18', segment: 'SMB Owners', size: '400M', entryAgents: 'Biz + Finance + Legal', price: '$29-99/mo', channel: 'Google Ads, referrals' },
  { phase: 'Phase 2', timeline: 'Months 6-18', segment: 'Families', size: '500M+ households', entryAgents: 'Parenting + Home', price: '$29/mo', channel: 'Social, parenting groups' },
  { phase: 'Phase 3', timeline: 'Months 18-36', segment: 'Gen Z (18-26)', size: '2B', entryAgents: 'Wellness + Learning', price: '$0-29/mo', channel: 'TikTok, peer influence' },
  { phase: 'Phase 3', timeline: 'Months 18-36', segment: 'Enterprise', size: '500K+ cos', entryAgents: 'Full platform', price: '$499/mo+', channel: 'Enterprise sales, Gartner' },
]

export const PRICING_TIERS: PricingTier[] = [
  {
    amount: 'Free',
    tierName: 'Explorer',
    color: '#06D6A0',
    features: ['3 active agents', '100 actions/month', 'No agent memory', 'No agent-to-agent', 'Basic AI model', 'Community support'],
  },
  {
    amount: '$29',
    amountSuffix: '/mo',
    tierName: 'Pro Life',
    color: '#7C5CFC',
    features: ['25 active agents', '5,000 actions/month', '30-day agent memory', 'Agent-to-agent comms', 'Standard AI (GPT-4o, Sonnet)', 'Email support'],
  },
  {
    amount: '$99',
    amountSuffix: '/mo',
    tierName: 'Agent Army',
    color: '#FF4D35',
    featured: true,
    features: ['Unlimited agents', 'Unlimited actions', 'Unlimited memory', 'Full orchestration', 'Premium AI (GPT-5, Opus)', 'Priority support'],
  },
  {
    amount: '$499',
    amountSuffix: '/mo+',
    tierName: 'Enterprise Fleet',
    color: '#FBBF24',
    features: ['Unlimited + per seat', 'Custom agent development', 'Team shared memory', 'Custom routing', 'Any model / on-prem', 'Dedicated CSM'],
  },
]

export const REVENUE_STREAMS: RevenueStream[] = [
  { name: 'Agent Store Commission', description: '30% of all premium agent sales on marketplace', contribution: '15-25% of revenue' },
  { name: 'Agent Bundles', description: 'Pre-configured domain packs (Entrepreneur, Parent, Creator, Student)', contribution: '8-12%' },
  { name: 'Enterprise Licensing', description: 'Custom deployments, white-label, on-premises hosting', contribution: '20-30%' },
  { name: 'API Access', description: 'Third-party developers building on SignOf agent runtime', contribution: '5-8%' },
  { name: 'Certification Program', description: 'SignOf Agent Builder certification ($199-499)', contribution: '1-2%' },
]

export const FINANCIAL_PROJECTIONS: FinancialProjection[] = [
  { metric: 'Total Users', year1: '1M', year2: '8M', year3: '50M', year4: '150M', year5: '500M' },
  { metric: 'Paying Users', year1: '100K', year2: '1.2M', year3: '7.5M', year4: '25M', year5: '75M' },
  { metric: 'Conversion Rate', year1: '10%', year2: '15%', year3: '15%', year4: '17%', year5: '15%' },
  { metric: 'ARPU (Monthly)', year1: '$42', year2: '$48', year3: '$52', year4: '$55', year5: '$58' },
  { metric: 'MRR', year1: '$4.2M', year2: '$57.6M', year3: '$390M', year4: '$1.38B', year5: '$4.35B' },
  { metric: 'ARR', year1: '$50M', year2: '$691M', year3: '$4.7B', year4: '$16.5B', year5: '$52B' },
  { metric: 'Agent Store GMV', year1: '$5M', year2: '$80M', year3: '$500M', year4: '$2B', year5: '$8B' },
  { metric: 'Total Revenue', year1: '$52M', year2: '$715M', year3: '$4.8B', year4: '$17.1B', year5: '$55B' },
  { metric: 'Gross Margin', year1: '72%', year2: '75%', year3: '78%', year4: '80%', year5: '82%' },
  { metric: 'Headcount', year1: '150', year2: '600', year3: '2,500', year4: '6,000', year5: '12,000' },
]

export const COMPETITORS: Competitor[] = [
  { name: 'Zapier', category: 'Workflow', strengths: '8,700+ integrations, ease of use', weakness: 'No AI agents, no cross-domain, no self-host, expensive', threat: 'Medium' },
  { name: 'Make', category: 'Visual Automation', strengths: 'Visual builder, affordable, EU', weakness: 'No agents, no marketplace, limited code', threat: 'Low' },
  { name: 'Lindy AI', category: 'AI Agents', strengths: 'Pre-built agents, good UX', weakness: 'Work only, no life domains, no marketplace', threat: 'Med-High' },
  { name: 'Zapier Agents', category: 'AI Automation', strengths: 'Ecosystem, 7K+ apps', weakness: 'Limited types, no cross-domain, cloud-only', threat: 'High' },
  { name: 'Microsoft Copilot', category: 'AI Assistant', strengths: 'MS ecosystem, enterprise', weakness: 'Locked to MS, not customizable, no open-source', threat: 'High' },
  { name: 'Apple Intelligence', category: 'OS-level AI', strengths: 'Device integration, privacy', weakness: 'Walled garden, no third-party, no marketplace', threat: 'Medium' },
  { name: 'CrewAI', category: 'Multi-Agent', strengths: 'Open-source, dev-friendly', weakness: 'Framework only, no consumer UI, no marketplace', threat: 'Low' },
]

export const MOATS: Moat[] = [
  {
    title: '1. Open-Source Foundation',
    description: 'Core engine is open-source and self-hostable. Trust, transparency, data sovereignty. Enterprises in regulated industries require this. Competitors cannot retroactively become open-source.',
  },
  {
    title: '2. Personalization Flywheel',
    description: 'Every agent learns from every interaction. After 6 months, switching means starting from zero. Users locked in by VALUE, not contracts. Your Inbox Agent knows your email style. Your Finance Agent knows your spending.',
  },
  {
    title: '3. Creator-Built Ecosystem',
    description: '10,000+ creators building and selling agents = distribution army. YouTube tutorials, blog posts, courses. Self-reinforcing flywheel that compounds over time.',
  },
  {
    title: '4. Cross-Domain Intelligence',
    description: 'Agents coordinating across ALL 12 life domains requires the full 5-layer stack. Finance Agent talks to Health Agent, Calendar talks to Meal Agent. Takes years to replicate.',
  },
  {
    title: '5. Triple Network Effects',
    description: 'Data effects (more users = better models) + Marketplace effects (more creators = more agents = more users) + Social effects (family/team agents = viral adoption within households).',
  },
]

export const TECH_STACK: TechStackRow[] = [
  { component: 'Workflow Runtime', technology: 'Node.js (TypeScript), Bull MQ', purpose: 'Execute nodes, job queues. 220+ exec/sec per instance' },
  { component: 'Agent Runtime', technology: 'Python (FastAPI) + Node.js', purpose: 'AI decisions, memory retrieval, action planning. Sub-200ms' },
  { component: 'Agent Memory', technology: 'PostgreSQL + pgvector', purpose: 'Long-term memory, semantic search. 1M+ entries/user' },
  { component: 'Context Store', technology: 'Redis', purpose: 'Task state, session data, real-time coordination. Sub-1ms' },
  { component: 'Message Bus', technology: 'Apache Kafka / NATS', purpose: 'Agent-to-agent communication. 100K+ messages/sec' },
  { component: 'AI Models', technology: 'GPT-5, Claude Opus, Gemini, Llama', purpose: 'Tiered by plan. Self-hosted option for enterprise' },
  { component: 'Vector Search', technology: 'Pinecone / pgvector', purpose: 'Semantic memory retrieval for agent context' },
  { component: 'Frontend', technology: 'React + TypeScript', purpose: 'Web dashboard, agent config, monitoring' },
  { component: 'Mobile', technology: 'React Native', purpose: 'iOS/Android with push notifications' },
  { component: 'Infrastructure', technology: 'Kubernetes, AWS/GCP', purpose: 'Auto-scaling, multi-region, 99.99% uptime' },
  { component: 'Security', technology: 'SOC2, HIPAA, GDPR, E2E encryption', purpose: 'Enterprise-grade security and compliance' },
  { component: 'Observability', technology: 'Datadog, OpenTelemetry', purpose: 'Agent performance monitoring, error tracking' },
]

export const RISKS: RiskRow[] = [
  { risk: 'AI hallucination in actions', severity: 'High', probability: 'Medium', mitigation: 'Human-in-the-loop, sandboxing, confidence thresholds' },
  { risk: 'Data privacy breach', severity: 'Critical', probability: 'Low', mitigation: 'E2E encryption, self-host, SOC2/HIPAA, data isolation' },
  { risk: 'Marketplace quality', severity: 'Medium', probability: 'High', mitigation: 'Certification, reviews, automated testing, quality gates' },
  { risk: 'Competitor copy', severity: 'Medium', probability: 'High', mitigation: 'Open-source moat, personalization flywheel, cross-domain' },
  { risk: 'User overwhelm', severity: 'Medium', probability: 'Medium', mitigation: 'Smart onboarding, bundles, AI recommendations, gradual rollout' },
  { risk: 'LLM cost escalation', severity: 'High', probability: 'Medium', mitigation: 'Tiered models, caching, fine-tuned small models, on-device' },
  { risk: 'Regulatory changes', severity: 'Medium', probability: 'Medium', mitigation: 'Compliance-first design, regional adaptation, legal counsel' },
  { risk: 'Slow creator adoption', severity: 'Medium', probability: 'Medium', mitigation: 'Generous 70% share, creator tools, featured placement, fund' },
]

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: 'phase-1',
    phaseLabel: 'Phase 1',
    timeline: 'Q2-Q3 2026',
    title: 'Agent Runtime + MVP Store',
    color: '#06D6A0',
    headerColor: 'green',
    deliverables: [
      { deliverable: 'Agent Runtime', details: 'Agent abstraction on workflow engine: workflow + AI decision + memory + permissions' },
      { deliverable: 'Agent Memory v1', details: 'Short-term context + long-term memory in vector DB per agent' },
      { deliverable: 'Autonomy Controls', details: 'Full Auto / Suggest / Ask First — configurable per agent' },
      { deliverable: 'Agent Dashboard', details: 'Single screen: all agents, status, recent actions, approval queue' },
      { deliverable: 'Mobile App v1', details: 'iOS + Android with push approvals and daily digest' },
      { deliverable: 'Agent Store MVP', details: '50 curated agents across Work, Finance, Content, Home domains' },
      { deliverable: 'Creator SDK Beta', details: 'Documentation and tools for community agent building' },
      { deliverable: 'Migration Tool', details: 'One-click Zapier/Make import → auto-converted to SignOf agents' },
    ],
  },
  {
    id: 'phase-2',
    phaseLabel: 'Phase 2',
    timeline: 'Q4 2026 - Q1 2027',
    title: 'Full Domains + Creator Economy',
    color: '#7C5CFC',
    headerColor: 'purple',
    deliverables: [
      { deliverable: '8 Remaining Domains', details: 'Health, Learning, Relationships, Business, Travel, Legal, Parenting, Wellness' },
      { deliverable: 'Agent-to-Agent Comms', details: 'Inter-agent message bus for coordination and context sharing' },
      { deliverable: 'Agent Store GA', details: 'Open to all creators with 70/30 revenue share, reviews, analytics' },
      { deliverable: 'Creator Certification', details: 'SignOf Certified Agent Builder — training, testing, LinkedIn badge' },
      { deliverable: 'Agent Memory v2', details: 'Cross-agent shared knowledge + evolving user preference model' },
      { deliverable: 'Enterprise Pilot', details: '50 companies: SSO, RBAC, audit logs, dedicated support' },
      { deliverable: 'Hardware Integrations', details: 'Wearables (Oura, Whoop, Garmin), smart home, banking (Plaid)' },
    ],
  },
  {
    id: 'phase-3',
    phaseLabel: 'Phase 3',
    timeline: 'Q2-Q4 2027',
    title: 'Life Intelligence + Mass Market',
    color: '#FF4D35',
    headerColor: 'coral',
    deliverables: [
      { deliverable: 'Life Intelligence v1', details: 'Cross-domain event bus — agents coordinate across all 12 domains' },
      { deliverable: 'Unified User Model', details: 'Single knowledge graph aggregating all agent data holistically' },
      { deliverable: 'Consumer UI', details: 'Natural language: describe what you want → agents deploy in 30 seconds' },
      { deliverable: 'Life Score Dashboard', details: 'Holistic wellbeing metric from all 12 domains with trends' },
      { deliverable: 'Enterprise GA', details: 'HIPAA, SOC2, GDPR autopilot, on-premises deployment' },
      { deliverable: 'Voice Interface', details: 'Siri, Alexa, Google Assistant + native SignOf voice' },
      { deliverable: 'Global Expansion', details: '20+ languages, regional compliance (EU, APAC, LATAM)' },
    ],
  },
  {
    id: 'phase-4',
    phaseLabel: 'Phase 4',
    timeline: '2028+',
    title: 'Platform Dominance',
    color: '#FBBF24',
    headerColor: 'gold',
    deliverables: [
      { deliverable: 'Full Autonomous Mode', details: 'Agent fleets managing operations with minimal human oversight' },
      { deliverable: 'Agent-Spawning Agents', details: 'Manager agents that decompose goals into sub-agents' },
      { deliverable: 'Hardware Partnerships', details: 'Co-branded devices with embedded SignOf agents' },
      { deliverable: 'Vertical Platforms', details: 'SignOf for Education, Healthcare, Government' },
      { deliverable: 'IPO', details: 'Target $100B+ valuation based on $18B+ ARR' },
    ],
  },
]

export const FOOTER_THESIS = "SignOf's opportunity is not about building a better automation tool. It's about creating the operating system for human life — where every person has a personal army of AI agents handling the tasks they don't want to do, so they can focus on what they were born to do."

export const FOOTER_PILLS: FooterPill[] = [
  { label: '🤖 185 Agent Types' },
  { label: '🌍 12 Life Domains' },
  { label: '🏪 Creator Economy' },
  { label: '🧠 Cross-Domain Intelligence' },
  { label: '📱 Mobile-First' },
  { label: '🔓 Open Source Moat' },
  { label: '💰 $29-499/mo Tiers' },
  { label: '🎯 $280B+ TAM' },
]
