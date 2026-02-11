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
}

function getRunResult(agentType: string): string {
  return RUN_RESULTS[agentType] ?? 'Run completed successfully. All steps executed without errors.'
}

// ─── Store ─────────────────────────────────────────────────────────────

export interface AIAgentState {
  runs: AgentRun[]
  lastRunByAgent: Record<string, string>

  startAgent: (agentType: AgentType, task: string) => AgentRun
  updateRunStep: (runId: string, stepIndex: number, status: StepStatus, output?: string) => void
  setRunResult: (runId: string, result: string) => void
  cancelRun: (runId: string) => void
  pauseRun: (runId: string) => void
  resumeRun: (runId: string) => void
  completeRun: (runId: string) => void
  failRun: (runId: string) => void
  getRunResult: (runId: string) => string | null
}

const useAIAgentStore = create<AIAgentState>()(
  persist(
    (set, get) => ({
      runs: [],
      lastRunByAgent: {},

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
    }),
    {
      name: 'signof-ai-agent-runs',
      partialize: (state) => ({
        runs: state.runs,
        lastRunByAgent: state.lastRunByAgent,
      }),
    }
  )
)

export { getStepOutput }
export default useAIAgentStore
