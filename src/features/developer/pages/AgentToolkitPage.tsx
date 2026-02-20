import { useState, useCallback, useMemo } from 'react'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import {
  AgentCategory,
  AGENT_CATEGORY_LABELS,
  MarketplaceDomain,
  MARKETPLACE_DOMAIN_LABELS,
} from '../types'
import type { AgentEntry, MarketplaceAgent } from '../types'
import CodeBlock from '../components/CodeBlock/CodeBlock'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import './AgentToolkitPage.css'

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatInstalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

// ─── Base Agents ─────────────────────────────────────────────────────────

const BASE_AGENTS: AgentEntry[] = [
  // Core
  { id: 'agent-1', name: 'Planner', type: 'planner', category: AgentCategory.Core, color: '#4F46E5', description: 'Breaks down complex goals into structured execution plans with dependencies and milestones.', capabilities: ['Goal decomposition', 'Dependency mapping', 'Timeline estimation', 'Risk identification'], useCases: ['Sprint planning', 'Product roadmap creation', 'Migration planning'], constraints: { costTier: 'medium', latency: 'moderate', concurrency: 5, tokenBudget: 50000 } },
  { id: 'agent-2', name: 'Researcher', type: 'researcher', category: AgentCategory.Core, color: '#4F46E5', description: 'Gathers, synthesizes, and validates information from multiple sources.', capabilities: ['Multi-source search', 'Fact verification', 'Summary generation', 'Citation tracking'], useCases: ['Competitive analysis', 'Market research', 'Technical deep dives'], constraints: { costTier: 'medium', latency: 'slow', concurrency: 3, tokenBudget: 100000 } },
  { id: 'agent-3', name: 'Analyst', type: 'analyst', category: AgentCategory.Core, color: '#4F46E5', description: 'Analyzes data sets, identifies trends, and produces insights with visualizations.', capabilities: ['Data processing', 'Trend detection', 'Statistical analysis', 'Report generation'], useCases: ['Revenue analysis', 'User behavior insights', 'Performance benchmarking'], constraints: { costTier: 'high', latency: 'slow', concurrency: 2, tokenBudget: 80000 } },
  { id: 'agent-4', name: 'Reviewer', type: 'reviewer', category: AgentCategory.Core, color: '#4F46E5', description: 'Reviews content, code, or documents against quality standards and checklists.', capabilities: ['Quality assessment', 'Checklist validation', 'Feedback generation', 'Style compliance'], useCases: ['Code review', 'Document approval', 'Brand guideline checks'], constraints: { costTier: 'low', latency: 'fast', concurrency: 10, tokenBudget: 30000 } },
  { id: 'agent-5', name: 'Coordinator', type: 'coordinator', category: AgentCategory.Core, color: '#4F46E5', description: 'Orchestrates multi-agent workflows, manages hand-offs, and tracks overall progress.', capabilities: ['Workflow orchestration', 'Agent delegation', 'Progress tracking', 'Conflict resolution'], useCases: ['Cross-team projects', 'Multi-step automations', 'Release coordination'], constraints: { costTier: 'medium', latency: 'fast', concurrency: 8, tokenBudget: 40000 } },
  // Creative
  { id: 'agent-6', name: 'Writer', type: 'writer', category: AgentCategory.Creative, color: '#7C3AED', description: 'Produces long-form content, copy, and documentation in your brand voice.', capabilities: ['Long-form writing', 'Tone adaptation', 'SEO optimization', 'Multi-format output'], useCases: ['Blog posts', 'Product documentation', 'Email campaigns'], constraints: { costTier: 'medium', latency: 'moderate', concurrency: 5, tokenBudget: 60000 } },
  { id: 'agent-7', name: 'Designer', type: 'designer', category: AgentCategory.Creative, color: '#7C3AED', description: 'Generates design briefs, UI specifications, and visual asset descriptions.', capabilities: ['Design system adherence', 'Layout composition', 'Color theory', 'Responsive specs'], useCases: ['UI mockup specs', 'Brand asset briefs', 'Presentation layouts'], constraints: { costTier: 'high', latency: 'slow', concurrency: 2, tokenBudget: 70000 } },
  { id: 'agent-8', name: 'Translation', type: 'translation', category: AgentCategory.Creative, color: '#7C3AED', description: 'Translates content across languages while preserving tone and context.', capabilities: ['Multi-language translation', 'Context preservation', 'Glossary management', 'Cultural adaptation'], useCases: ['Product localization', 'Support documentation', 'Marketing content'], constraints: { costTier: 'low', latency: 'fast', concurrency: 10, tokenBudget: 25000 } },
  { id: 'agent-9', name: 'SEO', type: 'seo', category: AgentCategory.Creative, color: '#7C3AED', description: 'Optimizes content for search engines with keyword analysis and meta tags.', capabilities: ['Keyword research', 'Meta tag generation', 'Content scoring', 'Competitor gap analysis'], useCases: ['Blog optimization', 'Landing page SEO', 'Content audits'], constraints: { costTier: 'low', latency: 'fast', concurrency: 8, tokenBudget: 20000 } },
  { id: 'agent-10', name: 'Social Media', type: 'social-media', category: AgentCategory.Creative, color: '#7C3AED', description: 'Creates platform-specific social content with hashtags and scheduling suggestions.', capabilities: ['Platform-specific formatting', 'Hashtag research', 'Engagement optimization', 'Content calendar'], useCases: ['Social campaigns', 'Community engagement', 'Product launches'], constraints: { costTier: 'low', latency: 'fast', concurrency: 10, tokenBudget: 15000 } },
  // Technical
  { id: 'agent-11', name: 'Developer', type: 'developer', category: AgentCategory.Technical, color: '#059669', description: 'Writes, refactors, and reviews code across multiple languages and frameworks.', capabilities: ['Code generation', 'Bug fixing', 'Refactoring', 'Test writing'], useCases: ['Feature implementation', 'Code migration', 'API development'], constraints: { costTier: 'high', latency: 'moderate', concurrency: 3, tokenBudget: 120000 } },
  { id: 'agent-12', name: 'Security', type: 'security', category: AgentCategory.Technical, color: '#059669', description: 'Audits code and infrastructure for vulnerabilities, compliance, and best practices.', capabilities: ['Vulnerability scanning', 'Compliance checking', 'Penetration testing', 'Security hardening'], useCases: ['Security audits', 'SOC 2 prep', 'Dependency review'], constraints: { costTier: 'high', latency: 'slow', concurrency: 2, tokenBudget: 90000 } },
  { id: 'agent-13', name: 'DevOps', type: 'devops', category: AgentCategory.Technical, color: '#059669', description: 'Manages CI/CD pipelines, infrastructure-as-code, and deployment workflows.', capabilities: ['Pipeline configuration', 'Infrastructure provisioning', 'Monitoring setup', 'Incident response'], useCases: ['CI/CD setup', 'Cloud migration', 'Auto-scaling configuration'], constraints: { costTier: 'medium', latency: 'moderate', concurrency: 4, tokenBudget: 60000 } },
  // Business
  { id: 'agent-14', name: 'Sales', type: 'sales', category: AgentCategory.Business, color: '#D97706', description: 'Qualifies leads, drafts proposals, and generates personalized outreach sequences.', capabilities: ['Lead scoring', 'Proposal generation', 'Outreach sequencing', 'CRM integration'], useCases: ['Pipeline management', 'Deal room setup', 'Follow-up automation'], constraints: { costTier: 'medium', latency: 'fast', concurrency: 8, tokenBudget: 35000 } },
  { id: 'agent-15', name: 'Marketing', type: 'marketing', category: AgentCategory.Business, color: '#D97706', description: 'Plans campaigns, analyzes performance metrics, and generates creative briefs.', capabilities: ['Campaign planning', 'A/B test design', 'Funnel analysis', 'Creative briefs'], useCases: ['Product launches', 'Email marketing', 'Performance reporting'], constraints: { costTier: 'medium', latency: 'moderate', concurrency: 5, tokenBudget: 45000 } },
  { id: 'agent-16', name: 'Finance', type: 'finance', category: AgentCategory.Business, color: '#D97706', description: 'Analyzes financial data, generates reports, and assists with budgeting and forecasting.', capabilities: ['Financial modeling', 'Budget analysis', 'Cash flow forecasting', 'Expense categorization'], useCases: ['Monthly close', 'Budget planning', 'Investor reporting'], constraints: { costTier: 'high', latency: 'slow', concurrency: 2, tokenBudget: 80000 } },
  // Legal
  { id: 'agent-17', name: 'Legal', type: 'legal', category: AgentCategory.Legal, color: '#DC2626', description: 'Reviews contracts, identifies risk clauses, and suggests redlines.', capabilities: ['Contract analysis', 'Risk identification', 'Redline suggestions', 'Clause library'], useCases: ['Contract review', 'NDA generation', 'Terms of service drafts'], constraints: { costTier: 'high', latency: 'slow', concurrency: 2, tokenBudget: 100000 } },
  { id: 'agent-18', name: 'Compliance', type: 'compliance', category: AgentCategory.Legal, color: '#DC2626', description: 'Monitors regulatory requirements and ensures organizational compliance.', capabilities: ['Regulation tracking', 'Policy generation', 'Audit preparation', 'Gap analysis'], useCases: ['GDPR compliance', 'SOX audits', 'Policy updates'], constraints: { costTier: 'medium', latency: 'moderate', concurrency: 3, tokenBudget: 70000 } },
  // People
  { id: 'agent-19', name: 'HR', type: 'hr', category: AgentCategory.People, color: '#0891B2', description: 'Manages job descriptions, screening criteria, and employee handbook updates.', capabilities: ['Job description writing', 'Screening criteria', 'Policy drafting', 'Onboarding plans'], useCases: ['Hiring workflows', 'Policy reviews', 'Onboarding automation'], constraints: { costTier: 'low', latency: 'fast', concurrency: 6, tokenBudget: 30000 } },
  { id: 'agent-20', name: 'Customer Success', type: 'customer-success', category: AgentCategory.People, color: '#0891B2', description: 'Manages customer health scores, generates QBR decks, and drafts responses.', capabilities: ['Health scoring', 'QBR generation', 'Response drafting', 'Churn prediction'], useCases: ['Customer onboarding', 'Renewal preparation', 'Support escalation'], constraints: { costTier: 'low', latency: 'fast', concurrency: 8, tokenBudget: 25000 } },
]

// ─── Framework Integrations ──────────────────────────────────────────────

const FRAMEWORK_INTEGRATIONS = [
  { id: 'openai', label: 'OpenAI Agents SDK', language: 'python', code: `from agents import Agent, Runner
from orchestree import OrchestreeToolkit

toolkit = OrchestreeToolkit(api_key="sk_live_...")

agent = Agent(
    name="document-processor",
    instructions="Process and send documents for signing.",
    tools=toolkit.get_tools(["documents", "projects"]),
)

result = Runner.run_sync(agent, "Send the NDA to john@example.com")
print(result.final_output)` },
  { id: 'langchain', label: 'LangChain', language: 'python', code: `from langchain.agents import initialize_agent, AgentType
from orchestree.langchain import OrchestreeTools

tools = OrchestreeTools(api_key="sk_live_...").as_tools()

agent = initialize_agent(
    tools=tools,
    llm=ChatOpenAI(model="gpt-4"),
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True,
)

agent.run("List all pending documents and summarize their status")` },
  { id: 'crewai', label: 'CrewAI', language: 'python', code: `from crewai import Agent, Task, Crew
from orchestree.crewai import OrchestreeTools

tools = OrchestreeTools(api_key="sk_live_...")

researcher = Agent(
    role="Document Analyst",
    goal="Analyze signing patterns",
    tools=tools.get_tools(),
)

task = Task(description="Analyze last month's signing metrics", agent=researcher)
crew = Crew(agents=[researcher], tasks=[task])
crew.kickoff()` },
  { id: 'autogen', label: 'AutoGen', language: 'python', code: `import autogen
from orchestree.autogen import OrchestreeTools

tools = OrchestreeTools(api_key="sk_live_...")

assistant = autogen.AssistantAgent(
    name="orchestree_assistant",
    llm_config={"model": "gpt-4"},
)

user_proxy = autogen.UserProxyAgent(name="user", code_execution_config=False)
tools.register(assistant, user_proxy)

user_proxy.initiate_chat(assistant, message="Create a new project board")` },
]

// ─── Team Example ────────────────────────────────────────────────────────

const TEAM_EXAMPLE_CODE = `import { AgentTeam, Planner, Researcher, Writer } from '@orchestree/agent-toolkit'

const team = new AgentTeam({
  name: 'Content Pipeline',
  agents: [
    new Planner({ tokenBudget: 30000 }),
    new Researcher({ sources: ['web', 'internal'] }),
    new Writer({ tone: 'technical', format: 'blog' }),
  ],
  workflow: 'sequential',
})

const result = await team.run({
  task: 'Research and write a blog post about AI agents in enterprise',
  context: { audience: 'developers', wordCount: 1500 },
})

console.log(result.output)
console.log('Tokens used:', result.usage.totalTokens)`

// ─── Marketplace Agents ─────────────────────────────────────────────────

const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  // Work & Productivity
  { id: 'mp-1', name: 'Meeting Summarizer', domain: MarketplaceDomain.WorkProductivity, description: 'Automatically summarizes meetings and extracts action items.', icon: '\u{1F4CB}', author: 'ProductivityAI', installs: 24500, rating: 4.8 },
  { id: 'mp-2', name: 'Email Triager', domain: MarketplaceDomain.WorkProductivity, description: 'Categorizes and prioritizes incoming emails by urgency.', icon: '\u{1F4E7}', author: 'InboxZero', installs: 18200, rating: 4.6 },
  { id: 'mp-3', name: 'Task Estimator', domain: MarketplaceDomain.WorkProductivity, description: 'Estimates task duration based on historical data and complexity.', icon: '\u23F1\uFE0F', author: 'AgileTools', installs: 9800, rating: 4.3 },
  { id: 'mp-4', name: 'Standup Reporter', domain: MarketplaceDomain.WorkProductivity, description: 'Generates daily standup reports from git commits and task updates.', icon: '\u{1F4CA}', author: 'DevFlow', installs: 15600, rating: 4.7 },
  // Finance & Money
  { id: 'mp-5', name: 'Invoice Processor', domain: MarketplaceDomain.FinanceMoney, description: 'Extracts data from invoices and auto-categorizes expenses.', icon: '\u{1F9FE}', author: 'FinanceAI', installs: 12400, rating: 4.8 },
  { id: 'mp-6', name: 'Expense Tracker', domain: MarketplaceDomain.FinanceMoney, description: 'Monitors spending patterns and flags anomalies.', icon: '\u{1F4B0}', author: 'BudgetBot', installs: 8900, rating: 4.5 },
  { id: 'mp-7', name: 'Tax Preparer', domain: MarketplaceDomain.FinanceMoney, description: 'Organizes tax documents and estimates quarterly payments.', icon: '\u{1F4D1}', author: 'TaxEase', installs: 7200, rating: 4.4 },
  { id: 'mp-8', name: 'Revenue Forecaster', domain: MarketplaceDomain.FinanceMoney, description: 'Projects revenue using ML models on historical sales data.', icon: '\u{1F4C8}', author: 'DataPredict', installs: 5600, rating: 4.2 },
  // Health & Fitness
  { id: 'mp-9', name: 'Wellness Scheduler', domain: MarketplaceDomain.HealthFitness, description: 'Schedules breaks, workouts, and mindfulness sessions into your calendar.', icon: '\u{1F9D8}', author: 'WellnessLab', installs: 11300, rating: 4.7 },
  { id: 'mp-10', name: 'Nutrition Planner', domain: MarketplaceDomain.HealthFitness, description: 'Creates meal plans based on dietary preferences and goals.', icon: '\u{1F957}', author: 'NutriAI', installs: 8700, rating: 4.5 },
  { id: 'mp-11', name: 'Habit Tracker', domain: MarketplaceDomain.HealthFitness, description: 'Tracks daily habits and provides streak analytics.', icon: '\u2705', author: 'HabitFlow', installs: 14200, rating: 4.6 },
  { id: 'mp-12', name: 'Sleep Optimizer', domain: MarketplaceDomain.HealthFitness, description: 'Analyzes sleep patterns and suggests schedule adjustments.', icon: '\u{1F634}', author: 'SleepWell', installs: 6800, rating: 4.3 },
  // Learning & Education
  { id: 'mp-13', name: 'Study Planner', domain: MarketplaceDomain.LearningEducation, description: 'Creates spaced-repetition study schedules from course material.', icon: '\u{1F4DA}', author: 'LearnSmart', installs: 19800, rating: 4.9 },
  { id: 'mp-14', name: 'Quiz Generator', domain: MarketplaceDomain.LearningEducation, description: 'Generates practice quizzes from documents and notes.', icon: '\u2753', author: 'QuizMaster', installs: 16400, rating: 4.7 },
  { id: 'mp-15', name: 'Language Tutor', domain: MarketplaceDomain.LearningEducation, description: 'Conversational language practice with grammar corrections.', icon: '\u{1F5E3}\uFE0F', author: 'LingoPal', installs: 22100, rating: 4.8 },
  { id: 'mp-16', name: 'Research Assistant', domain: MarketplaceDomain.LearningEducation, description: 'Finds and summarizes academic papers on any topic.', icon: '\u{1F52C}', author: 'ScholarAI', installs: 13500, rating: 4.6 },
  // Relationships & Social
  { id: 'mp-17', name: 'Gift Recommender', domain: MarketplaceDomain.RelationshipsSocial, description: 'Suggests personalized gifts based on recipient interests and budget.', icon: '\u{1F381}', author: 'GiftGenius', installs: 7600, rating: 4.4 },
  { id: 'mp-18', name: 'Event Planner', domain: MarketplaceDomain.RelationshipsSocial, description: 'Plans social events with venue suggestions and guest management.', icon: '\u{1F389}', author: 'PartyPro', installs: 5200, rating: 4.3 },
  { id: 'mp-19', name: 'Networking Coach', domain: MarketplaceDomain.RelationshipsSocial, description: 'Prepares conversation starters and follow-up templates for networking.', icon: '\u{1F91D}', author: 'ConnectAI', installs: 4100, rating: 4.1 },
  { id: 'mp-20', name: 'Birthday Reminder', domain: MarketplaceDomain.RelationshipsSocial, description: 'Tracks important dates and drafts personalized messages.', icon: '\u{1F382}', author: 'RememberMe', installs: 9400, rating: 4.5 },
  // Home & Household
  { id: 'mp-21', name: 'Grocery Planner', domain: MarketplaceDomain.HomeHousehold, description: 'Creates optimized grocery lists from meal plans and recipes.', icon: '\u{1F6D2}', author: 'HomeChef', installs: 10800, rating: 4.6 },
  { id: 'mp-22', name: 'Home Maintenance', domain: MarketplaceDomain.HomeHousehold, description: 'Schedules and tracks home maintenance tasks by season.', icon: '\u{1F3E0}', author: 'HomeKeep', installs: 6300, rating: 4.4 },
  { id: 'mp-23', name: 'Budget Manager', domain: MarketplaceDomain.HomeHousehold, description: 'Tracks household expenses and suggests savings opportunities.', icon: '\u{1F4B5}', author: 'SaveSmart', installs: 8100, rating: 4.5 },
  { id: 'mp-24', name: 'Chore Scheduler', domain: MarketplaceDomain.HomeHousehold, description: 'Distributes household chores fairly among family members.', icon: '\u{1F9F9}', author: 'FairShare', installs: 5700, rating: 4.2 },
  // Creativity & Content
  { id: 'mp-25', name: 'Blog Writer', domain: MarketplaceDomain.CreativityContent, description: 'Drafts SEO-optimized blog posts from outlines or topics.', icon: '\u270D\uFE0F', author: 'ContentForge', installs: 21300, rating: 4.7 },
  { id: 'mp-26', name: 'Video Scripter', domain: MarketplaceDomain.CreativityContent, description: 'Writes video scripts with hooks, timestamps, and CTAs.', icon: '\u{1F3AC}', author: 'ScriptAI', installs: 11900, rating: 4.5 },
  { id: 'mp-27', name: 'Social Scheduler', domain: MarketplaceDomain.CreativityContent, description: 'Creates content calendars with platform-specific post variants.', icon: '\u{1F4C5}', author: 'SocialPlan', installs: 16800, rating: 4.6 },
  { id: 'mp-28', name: 'Podcast Producer', domain: MarketplaceDomain.CreativityContent, description: 'Generates show notes, episode summaries, and promotional clips.', icon: '\u{1F399}\uFE0F', author: 'PodcastPro', installs: 7400, rating: 4.4 },
  { id: 'mp-29', name: 'Thumbnail Creator', domain: MarketplaceDomain.CreativityContent, description: 'Designs thumbnail concepts with text overlay suggestions.', icon: '\u{1F5BC}\uFE0F', author: 'ThumbCraft', installs: 9200, rating: 4.3 },
]

// ─── Category Colors ─────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<AgentCategory, string> = {
  [AgentCategory.Core]: '#4F46E5',
  [AgentCategory.Creative]: '#7C3AED',
  [AgentCategory.Technical]: '#059669',
  [AgentCategory.Business]: '#D97706',
  [AgentCategory.Legal]: '#DC2626',
  [AgentCategory.People]: '#0891B2',
}

// ─── Component ───────────────────────────────────────────────────────────

function AgentToolkitPage() {
  const [activeCategory, setActiveCategory] = useState<AgentCategory | null>(null)
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null)
  const [activeFramework, setActiveFramework] = useState('openai')
  const [marketplaceFilter, setMarketplaceFilter] = useState<MarketplaceDomain | null>(null)
  const [marketplaceSearch, setMarketplaceSearch] = useState('')

  // Derived state
  const filteredAgents = useMemo(() => {
    if (!activeCategory) return BASE_AGENTS
    return BASE_AGENTS.filter(a => a.category === activeCategory)
  }, [activeCategory])

  const debouncedSearch = useDebouncedValue(marketplaceSearch, 200)

  const filteredMarketplace = useMemo(() => {
    let results = MARKETPLACE_AGENTS as MarketplaceAgent[]
    if (marketplaceFilter) results = results.filter(a => a.domain === marketplaceFilter)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim()
      results = results.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
    }
    return results
  }, [marketplaceFilter, debouncedSearch])

  const activeFrameworkConfig = useMemo(
    () => FRAMEWORK_INTEGRATIONS.find(f => f.id === activeFramework) ?? FRAMEWORK_INTEGRATIONS[0]!,
    [activeFramework],
  )

  // Callbacks
  const handleCategoryChange = useCallback((category: AgentCategory | null) => {
    setActiveCategory(category)
  }, [])

  const handleAgentToggle = useCallback((agentId: string) => {
    setExpandedAgentId(prev => prev === agentId ? null : agentId)
  }, [])

  const handleFrameworkChange = useCallback((framework: string) => {
    setActiveFramework(framework)
  }, [])

  const handleMarketplaceFilterChange = useCallback((domain: MarketplaceDomain | null) => {
    setMarketplaceFilter(domain)
  }, [])

  const handleMarketplaceSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMarketplaceSearch(e.target.value)
  }, [])

  return (
    <div className="agent-toolkit">
      {/* Header */}
      <div className="agent-toolkit__header">
        <h1 className="agent-toolkit__title">Agent Toolkit</h1>
        <p className="agent-toolkit__subtitle">
          Build, deploy, and orchestrate autonomous AI agents that work across your entire Orchestree workspace.
        </p>
      </div>

      {/* Quick Start */}
      <div className="agent-toolkit__quick-start">
        <h2 className="agent-toolkit__section-title">Quick Start</h2>
        <CodeBlock code="npm install @orchestree/agent-toolkit" language="bash" />
        <p className="agent-toolkit__quick-start-subtitle">Get started with a single agent:</p>
        <CodeBlock code={`import { Researcher } from '@orchestree/agent-toolkit'\n\nconst agent = new Researcher({ apiKey: 'sk_live_...' })\nconst result = await agent.run('Summarize our Q4 revenue trends')\nconsole.log(result.output)`} language="javascript" />
      </div>

      {/* Agent Categories */}
      <div className="agent-toolkit__section">
        <h2 className="agent-toolkit__section-title">Agent Categories</h2>
        <div className="agent-toolkit__category-pills">
          <button
            className={`agent-toolkit__category-pill ${activeCategory === null ? 'agent-toolkit__category-pill--active' : ''}`}
            onClick={() => handleCategoryChange(null)}
            type="button"
          >
            All
          </button>
          {(Object.values(AgentCategory) as AgentCategory[]).map(cat => (
            <button
              key={cat}
              className={`agent-toolkit__category-pill ${activeCategory === cat ? 'agent-toolkit__category-pill--active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
              type="button"
              style={activeCategory === cat ? { backgroundColor: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] } : undefined}
            >
              <span
                className="agent-toolkit__category-dot"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              {AGENT_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="agent-toolkit__agents-grid">
          {filteredAgents.map(agent => {
            const isExpanded = expandedAgentId === agent.id
            return (
              <div
                key={agent.id}
                className="agent-toolkit__agent-card"
                style={{ borderLeftColor: agent.color }}
              >
                <div className="agent-toolkit__agent-header">
                  <span className="agent-toolkit__agent-name">{agent.name}</span>
                  <span className="agent-toolkit__agent-type">{agent.type}</span>
                </div>
                <p className="agent-toolkit__agent-desc">{agent.description}</p>
                <button
                  className="agent-toolkit__agent-toggle"
                  onClick={() => handleAgentToggle(agent.id)}
                  type="button"
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? 'Hide details' : 'Show details'}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {isExpanded ? 'Hide details' : 'Show details'}
                </button>
                {isExpanded && (
                  <div className="agent-toolkit__agent-details">
                    <div>
                      <h4 className="agent-toolkit__detail-title">Capabilities</h4>
                      <ul className="agent-toolkit__detail-list">
                        {agent.capabilities.map(cap => (
                          <li key={cap}>{cap}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="agent-toolkit__detail-title">Use Cases</h4>
                      <ul className="agent-toolkit__detail-list">
                        {agent.useCases.map(uc => (
                          <li key={uc}>{uc}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="agent-toolkit__detail-title">Constraints</h4>
                      <div className="agent-toolkit__constraints">
                        <div className="agent-toolkit__constraint">
                          <span className="agent-toolkit__constraint-label">Cost Tier</span>
                          <span className="agent-toolkit__constraint-value">{agent.constraints.costTier}</span>
                        </div>
                        <div className="agent-toolkit__constraint">
                          <span className="agent-toolkit__constraint-label">Latency</span>
                          <span className="agent-toolkit__constraint-value">{agent.constraints.latency}</span>
                        </div>
                        <div className="agent-toolkit__constraint">
                          <span className="agent-toolkit__constraint-label">Concurrency</span>
                          <span className="agent-toolkit__constraint-value">{agent.constraints.concurrency}</span>
                        </div>
                        <div className="agent-toolkit__constraint">
                          <span className="agent-toolkit__constraint-label">Token Budget</span>
                          <span className="agent-toolkit__constraint-value">{agent.constraints.tokenBudget.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Framework Integration */}
      <div className="agent-toolkit__section">
        <h2 className="agent-toolkit__section-title">Framework Integration</h2>
        <div className="agent-toolkit__framework-tabs">
          {FRAMEWORK_INTEGRATIONS.map(fw => (
            <button
              key={fw.id}
              className={`agent-toolkit__framework-tab ${activeFramework === fw.id ? 'agent-toolkit__framework-tab--active' : ''}`}
              onClick={() => handleFrameworkChange(fw.id)}
              type="button"
            >
              {fw.label}
            </button>
          ))}
        </div>
        <CodeBlock code={activeFrameworkConfig.code} language={activeFrameworkConfig.language} />
      </div>

      {/* Team Orchestration */}
      <div className="agent-toolkit__section">
        <h2 className="agent-toolkit__section-title">Team Orchestration</h2>
        <p className="agent-toolkit__team-desc">
          Combine multiple agents into teams that collaborate on complex tasks. Define workflows as sequential pipelines or parallel fan-outs with automatic hand-off and progress tracking.
        </p>
        <CodeBlock code={TEAM_EXAMPLE_CODE} language="javascript" />
      </div>

      {/* Marketplace */}
      <div className="agent-toolkit__section">
        <h2 className="agent-toolkit__section-title">Agent Marketplace</h2>
        <p className="agent-toolkit__marketplace-subtitle">
          Discover and install community-built agents for every domain.
        </p>

        <div className="agent-toolkit__marketplace-header">
          <div className="agent-toolkit__marketplace-pills">
            <button
              className={`agent-toolkit__marketplace-pill ${marketplaceFilter === null ? 'agent-toolkit__marketplace-pill--active' : ''}`}
              onClick={() => handleMarketplaceFilterChange(null)}
              type="button"
            >
              All
            </button>
            {(Object.values(MarketplaceDomain) as MarketplaceDomain[]).map(domain => (
              <button
                key={domain}
                className={`agent-toolkit__marketplace-pill ${marketplaceFilter === domain ? 'agent-toolkit__marketplace-pill--active' : ''}`}
                onClick={() => handleMarketplaceFilterChange(domain)}
                type="button"
              >
                {MARKETPLACE_DOMAIN_LABELS[domain]}
              </button>
            ))}
          </div>
        </div>

        <div className="agent-toolkit__marketplace-search">
          <Search size={16} className="agent-toolkit__marketplace-search-icon" />
          <input
            type="text"
            placeholder="Search agents..."
            value={marketplaceSearch}
            onChange={handleMarketplaceSearchChange}
            className="agent-toolkit__marketplace-search-input"
            aria-label="Search marketplace agents"
          />
        </div>

        <p className="agent-toolkit__marketplace-count">
          {filteredMarketplace.length} agent{filteredMarketplace.length !== 1 ? 's' : ''}
        </p>

        <div className="agent-toolkit__marketplace-grid">
          {filteredMarketplace.map(agent => (
            <div key={agent.id} className="agent-toolkit__marketplace-card">
              <span className="agent-toolkit__marketplace-icon">{agent.icon}</span>
              <h3 className="agent-toolkit__marketplace-name">{agent.name}</h3>
              <span className="agent-toolkit__marketplace-domain">
                {MARKETPLACE_DOMAIN_LABELS[agent.domain]}
              </span>
              <p className="agent-toolkit__marketplace-desc">{agent.description}</p>
              <div className="agent-toolkit__marketplace-footer">
                <span>{agent.author}</span>
                <span>{formatInstalls(agent.installs)} installs</span>
                <span className="agent-toolkit__marketplace-rating">
                  {agent.rating} ★
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AgentToolkitPage
