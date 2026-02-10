import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RunStatus, StepStatus } from '../types'
import type { AgentType, AgentRun, RunStep } from '../types'
import { AGENT_DEFINITIONS } from '../lib/agentDefinitions'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export interface AIAgentState {
  runs: AgentRun[]
  lastRunByAgent: Record<string, string>

  startAgent: (agentType: AgentType, task: string) => AgentRun
  updateRunStep: (runId: string, stepIndex: number, status: StepStatus) => void
  cancelRun: (runId: string) => void
  pauseRun: (runId: string) => void
  resumeRun: (runId: string) => void
  completeRun: (runId: string) => void
  failRun: (runId: string) => void
}

const useAIAgentStore = create<AIAgentState>()(
  persist(
    (set, get) => ({
      runs: [],
      lastRunByAgent: {},

      startAgent: (agentType, task) => {
        const definition = AGENT_DEFINITIONS.find(d => d.type === agentType)
        const steps: RunStep[] = (definition?.defaultSteps ?? []).map(s => ({
          id: generateId(),
          label: s.label,
          description: `${s.label} for: ${task}`,
          status: StepStatus.Pending as typeof StepStatus.Pending,
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

      updateRunStep: (runId, stepIndex, status) => {
        set(state => ({
          runs: state.runs.map(run => {
            if (run.id !== runId) return run
            return {
              ...run,
              steps: run.steps.map((step, i) =>
                i === stepIndex ? { ...step, status } : step
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
            get().completeRun(runId)
          }
        }
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

export default useAIAgentStore
