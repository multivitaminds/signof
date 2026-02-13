import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RunStatus, PipelineStatus } from '../types'
import type { AgentType, AgentPipeline, PipelineStage } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export interface PipelineState {
  pipelines: AgentPipeline[]
  createPipeline: (name: string, description: string, stages: Array<{ agentType: AgentType; task: string }>, templateId?: string) => AgentPipeline
  runPipeline: (id: string) => void
  advanceStage: (pipelineId: string, stageId: string, output: string) => void
  pausePipeline: (id: string) => void
  resumePipeline: (id: string) => void
  cancelPipeline: (id: string) => void
  completePipeline: (id: string) => void
  failPipeline: (id: string) => void
  deletePipeline: (id: string) => void
  updateStageStatus: (pipelineId: string, stageId: string, status: RunStatus, runId?: string, output?: string) => void
}

const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      pipelines: [],

      createPipeline: (name, description, stages, templateId) => {
        const pipelineStages: PipelineStage[] = stages.map(s => ({
          id: generateId(),
          agentType: s.agentType,
          task: s.task,
          status: RunStatus.Cancelled as typeof RunStatus.Cancelled,
          runId: null,
          output: null,
        }))

        const pipeline: AgentPipeline = {
          id: generateId(),
          name,
          description,
          stages: pipelineStages,
          status: PipelineStatus.Draft as typeof PipelineStatus.Draft,
          createdAt: new Date().toISOString(),
          completedAt: null,
          templateId: templateId ?? null,
        }

        set(state => ({
          pipelines: [pipeline, ...state.pipelines],
        }))

        return pipeline
      },

      runPipeline: (id) => {
        set(state => ({
          pipelines: state.pipelines.map(p => {
            if (p.id !== id) return p
            const updatedStages = p.stages.map((stage, i) =>
              i === 0
                ? { ...stage, status: RunStatus.Running as typeof RunStatus.Running }
                : stage
            )
            return {
              ...p,
              status: PipelineStatus.Running as typeof PipelineStatus.Running,
              stages: updatedStages,
            }
          }),
        }))
      },

      advanceStage: (pipelineId, stageId, output) => {
        const pipeline = get().pipelines.find(p => p.id === pipelineId)
        if (!pipeline) return

        const stageIndex = pipeline.stages.findIndex(s => s.id === stageId)
        if (stageIndex === -1) return

        const hasNextStage = stageIndex < pipeline.stages.length - 1

        set(state => ({
          pipelines: state.pipelines.map(p => {
            if (p.id !== pipelineId) return p
            const updatedStages = p.stages.map((stage, i) => {
              if (i === stageIndex) {
                return { ...stage, status: RunStatus.Completed as typeof RunStatus.Completed, output }
              }
              if (hasNextStage && i === stageIndex + 1) {
                return { ...stage, status: RunStatus.Running as typeof RunStatus.Running }
              }
              return stage
            })
            return { ...p, stages: updatedStages }
          }),
        }))

        if (!hasNextStage) {
          get().completePipeline(pipelineId)
        }
      },

      pausePipeline: (id) => {
        set(state => ({
          pipelines: state.pipelines.map(p =>
            p.id === id
              ? { ...p, status: PipelineStatus.Paused as typeof PipelineStatus.Paused }
              : p
          ),
        }))
      },

      resumePipeline: (id) => {
        set(state => ({
          pipelines: state.pipelines.map(p =>
            p.id === id
              ? { ...p, status: PipelineStatus.Running as typeof PipelineStatus.Running }
              : p
          ),
        }))
      },

      cancelPipeline: (id) => {
        set(state => ({
          pipelines: state.pipelines.map(p =>
            p.id === id
              ? { ...p, status: PipelineStatus.Failed as typeof PipelineStatus.Failed, completedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      completePipeline: (id) => {
        set(state => ({
          pipelines: state.pipelines.map(p =>
            p.id === id
              ? { ...p, status: PipelineStatus.Completed as typeof PipelineStatus.Completed, completedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      failPipeline: (id) => {
        set(state => ({
          pipelines: state.pipelines.map(p =>
            p.id === id
              ? { ...p, status: PipelineStatus.Failed as typeof PipelineStatus.Failed, completedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      deletePipeline: (id) => {
        set(state => ({
          pipelines: state.pipelines.filter(p => p.id !== id),
        }))
      },

      updateStageStatus: (pipelineId, stageId, status, runId, output) => {
        set(state => ({
          pipelines: state.pipelines.map(p => {
            if (p.id !== pipelineId) return p
            return {
              ...p,
              stages: p.stages.map(stage =>
                stage.id === stageId
                  ? {
                      ...stage,
                      status,
                      runId: runId ?? stage.runId,
                      output: output ?? stage.output,
                    }
                  : stage
              ),
            }
          }),
        }))
      },
    }),
    {
      name: 'orchestree-ai-pipelines',
      partialize: (state) => ({
        pipelines: state.pipelines,
      }),
    }
  )
)

export default usePipelineStore
