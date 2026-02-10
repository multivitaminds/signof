import useAIAgentStore from './useAIAgentStore'
import { RunStatus, StepStatus, AgentType } from '../types'

describe('useAIAgentStore', () => {
  beforeEach(() => {
    useAIAgentStore.setState({ runs: [], lastRunByAgent: {} })
  })

  describe('startAgent', () => {
    it('creates a run with steps from agent definitions', () => {
      const { startAgent } = useAIAgentStore.getState()
      const run = startAgent(AgentType.Planner, 'Plan a product launch')

      expect(run.agentType).toBe(AgentType.Planner)
      expect(run.task).toBe('Plan a product launch')
      expect(run.status).toBe(RunStatus.Running)
      expect(run.steps.length).toBeGreaterThan(0)
      expect(run.steps[0]!.status).toBe(StepStatus.Pending)
      expect(run.completedAt).toBeNull()
      expect(run.startedAt).toBeTruthy()

      const { runs, lastRunByAgent } = useAIAgentStore.getState()
      expect(runs).toHaveLength(1)
      expect(lastRunByAgent[AgentType.Planner]).toBeTruthy()
    })

    it('adds run to the beginning of runs array', () => {
      const { startAgent } = useAIAgentStore.getState()
      startAgent(AgentType.Researcher, 'First task')
      startAgent(AgentType.Writer, 'Second task')

      const { runs } = useAIAgentStore.getState()
      expect(runs).toHaveLength(2)
      expect(runs[0]!.task).toBe('Second task')
      expect(runs[1]!.task).toBe('First task')
    })
  })

  describe('updateRunStep', () => {
    it('updates a specific step status', () => {
      const { startAgent } = useAIAgentStore.getState()
      const run = startAgent(AgentType.Planner, 'Test')

      useAIAgentStore.getState().updateRunStep(run.id, 0, StepStatus.Running as typeof StepStatus.Running)

      const updated = useAIAgentStore.getState().runs.find(r => r.id === run.id)!
      expect(updated.steps[0]!.status).toBe(StepStatus.Running)
    })

    it('auto-completes run when all steps are completed', () => {
      const { startAgent } = useAIAgentStore.getState()
      const run = startAgent(AgentType.Planner, 'Test')

      // Complete all steps
      for (let i = 0; i < run.steps.length; i++) {
        useAIAgentStore.getState().updateRunStep(run.id, i, StepStatus.Completed as typeof StepStatus.Completed)
      }

      const updated = useAIAgentStore.getState().runs.find(r => r.id === run.id)!
      expect(updated.status).toBe(RunStatus.Completed)
      expect(updated.completedAt).toBeTruthy()
    })
  })

  describe('cancelRun', () => {
    it('sets run status to cancelled', () => {
      const { startAgent } = useAIAgentStore.getState()
      const run = startAgent(AgentType.Writer, 'Draft document')

      useAIAgentStore.getState().cancelRun(run.id)

      const updated = useAIAgentStore.getState().runs.find(r => r.id === run.id)!
      expect(updated.status).toBe(RunStatus.Cancelled)
      expect(updated.completedAt).toBeTruthy()
    })
  })

  describe('pauseRun', () => {
    it('sets run status to paused', () => {
      const { startAgent } = useAIAgentStore.getState()
      const run = startAgent(AgentType.Developer, 'Write code')

      useAIAgentStore.getState().pauseRun(run.id)

      const updated = useAIAgentStore.getState().runs.find(r => r.id === run.id)!
      expect(updated.status).toBe(RunStatus.Paused)
    })
  })

  describe('resumeRun', () => {
    it('sets run status back to running', () => {
      const { startAgent } = useAIAgentStore.getState()
      const run = startAgent(AgentType.Analyst, 'Analyze data')

      useAIAgentStore.getState().pauseRun(run.id)
      useAIAgentStore.getState().resumeRun(run.id)

      const updated = useAIAgentStore.getState().runs.find(r => r.id === run.id)!
      expect(updated.status).toBe(RunStatus.Running)
    })
  })

  describe('completeRun', () => {
    it('sets run status to completed with completedAt', () => {
      const { startAgent } = useAIAgentStore.getState()
      const run = startAgent(AgentType.Designer, 'Create wireframe')

      useAIAgentStore.getState().completeRun(run.id)

      const updated = useAIAgentStore.getState().runs.find(r => r.id === run.id)!
      expect(updated.status).toBe(RunStatus.Completed)
      expect(updated.completedAt).toBeTruthy()
    })
  })

  describe('failRun', () => {
    it('sets run status to failed', () => {
      const { startAgent } = useAIAgentStore.getState()
      const run = startAgent(AgentType.Reviewer, 'Review code')

      useAIAgentStore.getState().failRun(run.id)

      const updated = useAIAgentStore.getState().runs.find(r => r.id === run.id)!
      expect(updated.status).toBe(RunStatus.Failed)
      expect(updated.completedAt).toBeTruthy()
    })
  })
})
