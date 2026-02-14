import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RunStatus, StepStatus } from '../types'
import type { AgentType, AgentRun, RunStep } from '../types'
import { AGENT_DEFINITIONS } from '../lib/agentDefinitions'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Step output generator ─────────────────────────────────────────────

const STEP_OUTPUTS: Record<string, string[]> = {
  researcher: [
    'Identified 12 relevant data sources across workspace',
    'Collected 847 data points from documents and databases',
    'Found 3 significant patterns in the dataset',
    'Cross-referenced findings with 5 external benchmarks',
    'Generated comprehensive research brief with key findings',
  ],
  writer: [
    'Created detailed outline with 5 main sections',
    'Draft completed: 1,247 words with supporting evidence',
    'Refined language: improved clarity and reduced jargon',
    'Added 3 examples and 2 data visualizations',
    'Final polish complete: readability score 78/100',
  ],
  developer: [
    'Project structure initialized with 4 modules',
    'Core logic implemented: 312 lines of TypeScript',
    'Written 8 unit tests with 100% branch coverage',
    'All components integrated and communicating correctly',
    'Build passed with 0 errors, 0 warnings',
    'Removed unused imports and formatted code',
  ],
  designer: [
    'Reviewed 6 design requirements and user stories',
    'Created 3 wireframe variations for key screens',
    'High-fidelity mockups ready: 8 screens at 2x',
    'Defined 24 design tokens (colors, spacing, typography)',
    'Design handoff package ready with specs and assets',
  ],
  analyst: [
    'Collected 2,340 data points from 4 data sources',
    'Completed regression analysis and trend detection',
    'Identified 3 upward trends and 1 anomaly',
    'Generated 4 charts: bar, line, pie, and scatter',
    'Insights report ready with 5 actionable recommendations',
  ],
  planner: [
    'Analyzed 8 requirements and identified 3 dependencies',
    'Mapped 5 cross-team dependencies and 2 blockers',
    'Created breakdown: 14 tasks across 3 phases',
    'Set 4 milestones with delivery dates',
    'Plan finalized and ready for team review',
  ],
  coordinator: [
    'Assessed readiness: 6 team members available',
    'Distributed 8 tasks based on capacity and skill',
    'Monitoring: 5 tasks in progress, 3 pending',
    'Resolved 2 blockers by reassigning resources',
    'Team report compiled with velocity metrics',
  ],
  reviewer: [
    'Requirements compliance: 95% coverage',
    'Code quality: A rating, 2 minor suggestions',
    'Tested 12 edge cases, found 1 potential issue',
    'Review comments added: 3 suggestions, 1 optimization',
  ],
  sales: [
    'Qualified 24 leads: 8 hot, 10 warm, 6 cold',
    'Built detailed profiles for top 8 prospects',
    'Crafted 3 outreach sequence variants per segment',
    'Generated tailored proposal with ROI projections',
    'Pipeline scored: $420K weighted, 68% win probability',
  ],
  marketing: [
    'Analyzed audience: 3 segments, 12 personas identified',
    'Core messaging framework created with 5 value props',
    'Campaign built: 4 channels, 6-week timeline',
    'Created 8 ad variants across 3 platforms',
    'KPI targets set: 15% CTR, 3.2% conversion goal',
  ],
  finance: [
    'Collected Q4 data: 1,847 transactions processed',
    'Categorized expenses: 12 categories, 98% accuracy',
    'Forecast models built: 3 scenarios (base, bull, bear)',
    'Budget model complete: $2.4M projected with 12% margin',
    'Financial report generated with executive summary',
  ],
  legal: [
    'Parsed 42-page contract into 156 clauses',
    'Extracted 23 key clauses: liability, IP, termination',
    'Flagged 4 high-risk clauses requiring negotiation',
    'Compliance check: 2 items need regulatory review',
    'Legal summary prepared with risk matrix',
  ],
  compliance: [
    'Scanned 8 applicable regulations (GDPR, SOC2, etc.)',
    'Mapped 34 requirements to current controls',
    'Adherence check: 91% compliant, 3 gaps identified',
    'Flagged 2 violations requiring immediate attention',
    'Audit report generated with remediation timeline',
  ],
  hr: [
    'Analyzed role: Senior Engineer, 5 core competencies',
    'Job description drafted: responsibilities, requirements, benefits',
    'Screening criteria defined: 8 must-haves, 5 nice-to-haves',
    'Onboarding plan built: 30/60/90 day milestones',
    'Employee survey created: 15 questions, 4 categories',
  ],
  customerSuccess: [
    'Triaged 47 tickets: 12 urgent, 20 normal, 15 low',
    'Sentiment analysis: 72% positive, 18% neutral, 10% negative',
    'Drafted responses for top 12 urgent tickets',
    'NPS computed: 42 (up 3 points from last month)',
    'Churn risk: 8 accounts flagged, 3 require intervention',
  ],
  translation: [
    'Source language detected: English (confidence 99.2%)',
    'Content translated: 2,400 words into target language',
    'Localized 14 idioms and cultural references',
    'Adapted formatting: dates, currency, measurements',
    'Quality score: 96/100, 2 items flagged for review',
  ],
  seo: [
    'Researched 120 keywords: 15 high-value targets identified',
    'Competitor analysis: 5 competitors, 340 ranking keywords',
    'Content optimized: keyword density 2.1%, LSI terms added',
    'Meta tags built: title, description, OG tags for 8 pages',
    'Tracking configured: 15 keywords monitored daily',
  ],
  socialMedia: [
    'Analyzed trending topics: 8 relevant trends identified',
    'Content calendar generated: 30 posts over 4 weeks',
    'Crafted 30 posts with platform-specific formatting',
    'Optimized hashtag sets: 5 per post, reach potential 45K',
    'Engagement projected: 12% increase over baseline',
  ],
  security: [
    'Attack surface scanned: 24 endpoints, 3 external services',
    'Identified 7 vulnerabilities: 2 critical, 3 medium, 2 low',
    'Access controls reviewed: 12 roles, 3 over-privileged',
    'Risk levels assessed: overall score 7.2/10',
    'Remediation plan built: 14 actions prioritized by severity',
  ],
  devops: [
    'Infrastructure audited: 8 services, 3 databases, 2 caches',
    'CI/CD pipeline configured: build, test, deploy stages',
    'Monitoring setup: 24 metrics, 8 alerts, 3 dashboards',
    'Runbooks created: 6 incident response procedures',
    'Deployment validated: zero-downtime rollout confirmed',
  ],
}

function getStepOutput(agentType: string, stepIndex: number): string {
  const outputs = STEP_OUTPUTS[agentType] ?? STEP_OUTPUTS['researcher']!
  return outputs[stepIndex] ?? `Step ${stepIndex + 1} completed successfully`
}

// ─── Final result generator ────────────────────────────────────────────

const RUN_RESULTS: Record<string, string> = {
  researcher: 'Research complete. Key findings:\n\n1. Document processing efficiency improved 23% over last quarter\n2. Team collaboration metrics show strong engagement (85th percentile)\n3. Three areas identified for optimization: workflow automation, template standardization, and approval pipeline\n\nRecommendation: Implement automated workflows for recurring document types to save an estimated 4 hours/week.',
  writer: 'Document draft complete.\n\nTitle: Quarterly Business Review\nWord count: 1,247\nSections: Executive Summary, Performance Metrics, Key Achievements, Challenges, Next Steps\n\nThe document is structured for clarity and includes supporting data visualizations. Ready for stakeholder review.',
  developer: 'Implementation complete.\n\nFiles modified: 8\nLines added: 312\nTests: 8 passing (100% coverage)\nBuild: Successful\n\nAll acceptance criteria met. The feature includes proper error handling, TypeScript types, and follows existing code patterns.',
  designer: 'Design deliverables ready.\n\nScreens designed: 8\nComponents created: 12\nDesign tokens: 24\nAccessibility: WCAG 2.1 AA compliant\n\nAll mockups include responsive variants (mobile, tablet, desktop). Design handoff package includes Figma links and CSS specifications.',
  analyst: 'Analysis report generated.\n\nData points analyzed: 2,340\nKey trends: 3 upward, 1 anomaly detected\nCharts: 4 visualizations\n\nTop insight: Weekend document signing rates are 40% lower than weekday rates. Consider scheduling reminders for Monday mornings to capture pending signatures.',
  planner: 'Project plan finalized.\n\nTotal tasks: 14\nPhases: 3 (Foundation, Development, Launch)\nMilestones: 4\nEstimated duration: 6 weeks\n\nCritical path identified through Phase 2. Two parallel workstreams can reduce timeline by 1 week if additional resources are allocated.',
  coordinator: 'Team coordination report.\n\nTeam members: 6\nTasks assigned: 8\nBlockers resolved: 2\nVelocity: 12 points/sprint (above average)\n\nTeam is performing well. Recommended: schedule mid-sprint check-in to maintain momentum on the two newly unblocked items.',
  reviewer: 'Review complete.\n\nCompliance: 95%\nCode quality: A rating\nIssues found: 1 minor\nSuggestions: 3\n\nOverall quality is high. One edge case in date handling should be addressed before deployment. Three optimization suggestions have been added as inline comments.',
  sales: 'Sales pipeline report complete.\n\nLeads qualified: 24\nHot leads: 8 (ready for outreach)\nProposals generated: 3\nWeighted pipeline: $420K\nWin probability: 68%\n\nTop opportunity: Enterprise deal with Acme Corp ($180K). Recommended next step: schedule demo with VP of Engineering this week.',
  marketing: 'Campaign ready for launch.\n\nChannels: Email, LinkedIn, Google Ads, Content\nAudience segments: 3 (Enterprise, Mid-market, Startup)\nAd variants: 8 across 3 platforms\nTimeline: 6 weeks\nProjected ROI: 3.2x\n\nA/B tests configured for subject lines and CTA buttons. Campaign dashboard ready for real-time monitoring.',
  finance: 'Financial report complete.\n\nRevenue: $2.4M (Q4)\nExpenses: $2.1M (12% margin)\nForecast: $2.8M next quarter (base case)\nBudget variance: -3.2% (within tolerance)\n\nKey insight: SaaS subscription revenue grew 18% QoQ. Recommend increasing investment in customer acquisition by 15% to accelerate growth trajectory.',
  legal: 'Legal review complete.\n\nContract: Master Services Agreement\nClauses analyzed: 156\nHigh-risk items: 4\nCompliance status: 2 items need review\n\nCritical findings:\n1. Indemnification clause is one-sided — negotiate mutual indemnity\n2. IP assignment scope is overly broad — limit to deliverables only\n3. Termination notice period (90 days) is excessive — propose 30 days\n4. Liability cap missing — add cap at 12 months of fees',
  compliance: 'Compliance audit report ready.\n\nRegulations checked: 8\nRequirements mapped: 34\nCompliance rate: 91%\nGaps identified: 3\nViolations: 2\n\nImmediate actions required:\n1. Update data retention policy for GDPR Article 17 compliance\n2. Implement access logging for SOC2 CC6.1 control\n\nTimeline: Both items can be remediated within 2 weeks.',
  hr: 'Hiring package complete.\n\nRole: Senior Software Engineer\nJob description: Published-ready\nScreening criteria: 8 must-haves defined\nOnboarding plan: 30/60/90 day milestones set\n\nRecommendation: Post to LinkedIn, Greenhouse, and internal referral channel simultaneously. Expected time-to-fill: 4-6 weeks based on market data.',
  customerSuccess: 'Customer success report complete.\n\nTickets triaged: 47\nUrgent resolved: 8/12\nNPS score: 42 (+3 MoM)\nAt-risk accounts: 8\nChurn risk: 3 accounts need immediate intervention\n\nTop action items:\n1. Schedule check-in calls with 3 high-churn-risk accounts\n2. Escalate billing issue pattern (5 tickets this week)\n3. Update knowledge base with top 10 FAQ answers.',
  translation: 'Translation complete.\n\nSource: English\nTarget: Specified language\nWords translated: 2,400\nIdioms localized: 14\nQuality score: 96/100\n\nAll content has been adapted for cultural context. Date formats, currency symbols, and measurement units updated. Two items flagged for human review: industry-specific terminology.',
  seo: 'SEO optimization complete.\n\nKeywords targeted: 15 high-value\nCompetitors analyzed: 5\nContent pages optimized: 8\nMeta tags created: 8 complete sets\n\nProjected impact:\n- Organic traffic increase: 25-35% over 3 months\n- 3 keywords expected to reach page 1 within 6 weeks\n- Content gap analysis reveals 4 untapped topic clusters.',
  socialMedia: 'Social media plan complete.\n\nPosts created: 30 across 4 weeks\nPlatforms: LinkedIn, Twitter, Instagram\nHashtag sets: 5 optimized per post\nContent mix: 40% educational, 30% promotional, 30% engagement\n\nProjected engagement: +12% increase over baseline. Best posting times identified per platform. Content calendar exported and ready for scheduling.',
  security: 'Security assessment complete.\n\nEndpoints scanned: 24\nVulnerabilities found: 7 (2 critical, 3 medium, 2 low)\nAccess control issues: 3 over-privileged roles\nOverall risk score: 7.2/10\n\nCritical actions:\n1. Patch CVE-2024-XXXX on API gateway (critical)\n2. Rotate exposed service account credentials (critical)\n3. Implement least-privilege on 3 admin roles (medium)\n\nFull remediation plan with 14 prioritized actions attached.',
  devops: 'DevOps setup complete.\n\nServices audited: 8\nCI/CD pipeline: Configured (build → test → staging → production)\nMonitoring: 24 metrics, 8 alerts, 3 dashboards\nRunbooks: 6 incident response procedures\n\nDeployment strategy: Blue-green with automatic rollback on health check failure. Average deploy time: 4 minutes. Zero-downtime rollout validated in staging environment.',
}

function getRunResult(agentType: string): string {
  return RUN_RESULTS[agentType] ?? 'Run completed successfully. All steps executed without errors.'
}

// ─── Store ─────────────────────────────────────────────────────────────

export interface AIAgentState {
  runs: AgentRun[]
  lastRunByAgent: Record<string, string>
  favorites: string[]
  streamingOutputs: Record<string, string>

  startAgent: (agentType: AgentType, task: string) => AgentRun
  updateRunStep: (runId: string, stepIndex: number, status: StepStatus, output?: string) => void
  setRunResult: (runId: string, result: string) => void
  cancelRun: (runId: string) => void
  pauseRun: (runId: string) => void
  resumeRun: (runId: string) => void
  completeRun: (runId: string) => void
  failRun: (runId: string) => void
  getRunResult: (runId: string) => string | null
  toggleFavorite: (agentType: AgentType) => void
  updateStreamingOutput: (runId: string, stepIndex: number, text: string) => void
  clearStreamingOutput: (runId: string) => void
}

const useAIAgentStore = create<AIAgentState>()(
  persist(
    (set, get) => ({
      runs: [],
      lastRunByAgent: {},
      favorites: [],
      streamingOutputs: {},

      startAgent: (agentType, task) => {
        const definition = AGENT_DEFINITIONS.find(d => d.type === agentType)
        const steps: RunStep[] = (definition?.defaultSteps ?? []).map((s, i) => ({
          id: generateId(),
          label: s.label,
          description: `${s.label} for: ${task}`,
          status: StepStatus.Pending as typeof StepStatus.Pending,
          output: undefined,
          _stepIndex: i,
        }))

        const now = new Date().toISOString()
        const run: AgentRun = {
          id: generateId(),
          agentType,
          task,
          steps,
          status: RunStatus.Running as typeof RunStatus.Running,
          startedAt: now,
          completedAt: null,
          lastRunAt: now,
          result: undefined,
        }

        set(state => ({
          runs: [run, ...state.runs],
          lastRunByAgent: {
            ...state.lastRunByAgent,
            [agentType]: now,
          },
        }))

        return run
      },

      updateRunStep: (runId, stepIndex, status, output) => {
        set(state => ({
          runs: state.runs.map(run => {
            if (run.id !== runId) return run
            return {
              ...run,
              steps: run.steps.map((step, i) =>
                i === stepIndex
                  ? { ...step, status, output: output ?? step.output }
                  : step
              ),
            }
          }),
        }))

        // Auto-complete run if all steps completed
        const { runs } = get()
        const run = runs.find(r => r.id === runId)
        if (run && status === StepStatus.Completed) {
          const allDone = run.steps.every((s, i) =>
            i === stepIndex ? true : s.status === StepStatus.Completed
          )
          if (allDone) {
            const result = getRunResult(run.agentType)
            get().setRunResult(runId, result)
            get().completeRun(runId)
          }
        }
      },

      setRunResult: (runId, result) => {
        set(state => ({
          runs: state.runs.map(run =>
            run.id === runId ? { ...run, result } : run
          ),
        }))
      },

      cancelRun: (runId) => {
        set(state => ({
          runs: state.runs.map(run =>
            run.id === runId
              ? { ...run, status: RunStatus.Cancelled as typeof RunStatus.Cancelled, completedAt: new Date().toISOString() }
              : run
          ),
        }))
      },

      pauseRun: (runId) => {
        set(state => ({
          runs: state.runs.map(run =>
            run.id === runId
              ? { ...run, status: RunStatus.Paused as typeof RunStatus.Paused }
              : run
          ),
        }))
      },

      resumeRun: (runId) => {
        set(state => ({
          runs: state.runs.map(run =>
            run.id === runId
              ? { ...run, status: RunStatus.Running as typeof RunStatus.Running }
              : run
          ),
        }))
      },

      completeRun: (runId) => {
        set(state => ({
          runs: state.runs.map(run =>
            run.id === runId
              ? { ...run, status: RunStatus.Completed as typeof RunStatus.Completed, completedAt: new Date().toISOString() }
              : run
          ),
        }))
      },

      failRun: (runId) => {
        set(state => ({
          runs: state.runs.map(run =>
            run.id === runId
              ? { ...run, status: RunStatus.Failed as typeof RunStatus.Failed, completedAt: new Date().toISOString() }
              : run
          ),
        }))
      },

      getRunResult: (runId) => {
        const run = get().runs.find(r => r.id === runId)
        return run?.result ?? null
      },

      toggleFavorite: (agentType) => {
        set(state => ({
          favorites: state.favorites.includes(agentType)
            ? state.favorites.filter(f => f !== agentType)
            : [...state.favorites, agentType],
        }))
      },

      updateStreamingOutput: (runId, stepIndex, text) => {
        set(state => ({
          streamingOutputs: {
            ...state.streamingOutputs,
            [`${runId}-${stepIndex}`]: text,
          },
        }))
      },

      clearStreamingOutput: (runId) => {
        set(state => {
          const next = { ...state.streamingOutputs }
          for (const key of Object.keys(next)) {
            if (key.startsWith(runId)) delete next[key]
          }
          return { streamingOutputs: next }
        })
      },
    }),
    {
      name: 'orchestree-ai-agent-runs',
      partialize: (state) => ({
        runs: state.runs,
        lastRunByAgent: state.lastRunByAgent,
        favorites: state.favorites,
      }),
    }
  )
)

export { getStepOutput }
export default useAIAgentStore
