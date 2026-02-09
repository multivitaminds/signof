import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AgentStatus, TeamStatus, StepStatus } from '../types'
import type { AgentTeam, AgentInstance, ChatMessage, SimulationStep, AgentType } from '../types'
import { AGENT_DEFINITIONS } from '../lib/agentDefinitions'
import { runSimulation } from '../lib/simulationEngine'
import type { SimulationController } from '../lib/simulationEngine'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const controllers = new Map<string, SimulationController>()

const MOCK_AGENT_RESPONSES = [
  "I'm working on it. Making good progress.",
  "Sure, I'll adjust my approach.",
  'Understood. Moving to the next phase.',
  'Processing your request now.',
  "Got it. I'll incorporate that feedback.",
]

function getMockAgentResponse(): string {
  const index = Math.floor(Math.random() * MOCK_AGENT_RESPONSES.length)
  return MOCK_AGENT_RESPONSES[index]!
}

interface AgentConfig {
  name: string
  type: AgentType
  instructions: string
  memoryAllocation: number
}

export interface AgentState {
  teams: AgentTeam[]
  activeTeamId: string | null

  createTeam: (name: string, agents: AgentConfig[]) => AgentTeam
  deleteTeam: (teamId: string) => void
  setActiveTeam: (teamId: string | null) => void

  startTeam: (teamId: string) => void
  pauseTeam: (teamId: string) => void
  resumeTeam: (teamId: string) => void
  cancelTeam: (teamId: string) => void

  pauseAgent: (teamId: string, agentId: string) => void
  resumeAgent: (teamId: string, agentId: string) => void

  sendMessage: (teamId: string, agentId: string, content: string) => void
}

function buildAgentInstance(config: AgentConfig): AgentInstance {
  const definition = AGENT_DEFINITIONS.find(d => d.type === config.type)
  const steps: SimulationStep[] = (definition?.defaultSteps ?? []).map(s => ({
    id: generateId(),
    label: s.label,
    status: StepStatus.Pending as typeof StepStatus.Pending,
    durationMs: s.durationMs,
  }))

  return {
    id: generateId(),
    name: config.name,
    type: config.type,
    status: AgentStatus.Idle as typeof AgentStatus.Idle,
    instructions: config.instructions,
    memoryAllocation: config.memoryAllocation,
    steps,
    currentStepIndex: 0,
  }
}

function updateAgent(
  teams: AgentTeam[],
  teamId: string,
  agentId: string,
  updater: (agent: AgentInstance) => AgentInstance
): AgentTeam[] {
  return teams.map(team => {
    if (team.id !== teamId) return team
    return {
      ...team,
      updatedAt: new Date().toISOString(),
      agents: team.agents.map(agent =>
        agent.id === agentId ? updater(agent) : agent
      ),
    }
  })
}

function updateTeam(
  teams: AgentTeam[],
  teamId: string,
  updater: (team: AgentTeam) => AgentTeam
): AgentTeam[] {
  return teams.map(team =>
    team.id === teamId ? updater(team) : team
  )
}

const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      teams: [],
      activeTeamId: null,

      createTeam: (name, agentConfigs) => {
        const team: AgentTeam = {
          id: generateId(),
          name,
          status: TeamStatus.Draft as typeof TeamStatus.Draft,
          agents: agentConfigs.map(buildAgentInstance),
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set(state => ({ teams: [...state.teams, team] }))
        return team
      },

      deleteTeam: (teamId) => {
        const { teams } = get()
        const team = teams.find(t => t.id === teamId)
        if (team) {
          for (const agent of team.agents) {
            const ctrl = controllers.get(agent.id)
            if (ctrl) {
              ctrl.cancel()
              controllers.delete(agent.id)
            }
          }
        }
        set(state => ({
          teams: state.teams.filter(t => t.id !== teamId),
          activeTeamId: state.activeTeamId === teamId ? null : state.activeTeamId,
        }))
      },

      setActiveTeam: (teamId) => {
        set({ activeTeamId: teamId })
      },

      startTeam: (teamId) => {
        const { teams } = get()
        const team = teams.find(t => t.id === teamId)
        if (!team) return

        set(state => ({
          teams: updateTeam(state.teams, teamId, t => ({
            ...t,
            status: TeamStatus.Running as typeof TeamStatus.Running,
            updatedAt: new Date().toISOString(),
            agents: t.agents.map(agent => ({
              ...agent,
              status: AgentStatus.Running as typeof AgentStatus.Running,
            })),
          })),
        }))

        for (const agent of team.agents) {
          const startIdx = agent.currentStepIndex
          const ctrl = runSimulation(agent.steps, {
            onStepStart: (stepIndex) => {
              set(state => ({
                teams: updateAgent(state.teams, teamId, agent.id, a => ({
                  ...a,
                  currentStepIndex: stepIndex,
                  steps: a.steps.map((s, i) =>
                    i === stepIndex
                      ? { ...s, status: StepStatus.Running as typeof StepStatus.Running }
                      : s
                  ),
                })),
              }))
            },
            onStepComplete: (stepIndex, output) => {
              set(state => ({
                teams: updateAgent(state.teams, teamId, agent.id, a => ({
                  ...a,
                  steps: a.steps.map((s, i) =>
                    i === stepIndex
                      ? { ...s, status: StepStatus.Completed as typeof StepStatus.Completed, output }
                      : s
                  ),
                })),
              }))
            },
            onAllComplete: () => {
              set(state => ({
                teams: updateAgent(state.teams, teamId, agent.id, a => ({
                  ...a,
                  status: AgentStatus.Completed as typeof AgentStatus.Completed,
                })),
              }))
              // Check if all agents in team are completed
              const currentTeams = get().teams
              const currentTeam = currentTeams.find(t => t.id === teamId)
              if (currentTeam) {
                const allDone = currentTeam.agents.every(
                  a => a.status === AgentStatus.Completed || a.id === agent.id
                )
                if (allDone) {
                  set(state => ({
                    teams: updateTeam(state.teams, teamId, t => ({
                      ...t,
                      status: TeamStatus.Completed as typeof TeamStatus.Completed,
                      updatedAt: new Date().toISOString(),
                    })),
                  }))
                }
              }
              controllers.delete(agent.id)
            },
            onError: (stepIndex, error) => {
              set(state => ({
                teams: updateAgent(state.teams, teamId, agent.id, a => ({
                  ...a,
                  status: AgentStatus.Error as typeof AgentStatus.Error,
                  steps: a.steps.map((s, i) =>
                    i === stepIndex
                      ? { ...s, status: StepStatus.Error as typeof StepStatus.Error, output: error }
                      : s
                  ),
                })),
              }))
              controllers.delete(agent.id)
            },
          }, startIdx)

          controllers.set(agent.id, ctrl)
        }
      },

      pauseTeam: (teamId) => {
        const { teams } = get()
        const team = teams.find(t => t.id === teamId)
        if (!team) return

        for (const agent of team.agents) {
          if (agent.status === AgentStatus.Running) {
            const ctrl = controllers.get(agent.id)
            if (ctrl) ctrl.pause()
          }
        }

        set(state => ({
          teams: updateTeam(state.teams, teamId, t => ({
            ...t,
            status: TeamStatus.Paused as typeof TeamStatus.Paused,
            updatedAt: new Date().toISOString(),
            agents: t.agents.map(agent =>
              agent.status === AgentStatus.Running
                ? { ...agent, status: AgentStatus.Paused as typeof AgentStatus.Paused }
                : agent
            ),
          })),
        }))
      },

      resumeTeam: (teamId) => {
        const { teams } = get()
        const team = teams.find(t => t.id === teamId)
        if (!team) return

        for (const agent of team.agents) {
          if (agent.status === AgentStatus.Paused) {
            const ctrl = controllers.get(agent.id)
            if (ctrl) ctrl.resume()
          }
        }

        set(state => ({
          teams: updateTeam(state.teams, teamId, t => ({
            ...t,
            status: TeamStatus.Running as typeof TeamStatus.Running,
            updatedAt: new Date().toISOString(),
            agents: t.agents.map(agent =>
              agent.status === AgentStatus.Paused
                ? { ...agent, status: AgentStatus.Running as typeof AgentStatus.Running }
                : agent
            ),
          })),
        }))
      },

      cancelTeam: (teamId) => {
        const { teams } = get()
        const team = teams.find(t => t.id === teamId)
        if (!team) return

        for (const agent of team.agents) {
          const ctrl = controllers.get(agent.id)
          if (ctrl) {
            ctrl.cancel()
            controllers.delete(agent.id)
          }
        }

        set(state => ({
          teams: updateTeam(state.teams, teamId, t => ({
            ...t,
            status: TeamStatus.Completed as typeof TeamStatus.Completed,
            updatedAt: new Date().toISOString(),
            agents: t.agents.map(agent =>
              agent.status === AgentStatus.Running || agent.status === AgentStatus.Paused
                ? { ...agent, status: AgentStatus.Idle as typeof AgentStatus.Idle }
                : agent
            ),
          })),
        }))
      },

      pauseAgent: (teamId, agentId) => {
        const ctrl = controllers.get(agentId)
        if (ctrl) ctrl.pause()

        set(state => ({
          teams: updateAgent(state.teams, teamId, agentId, a => ({
            ...a,
            status: AgentStatus.Paused as typeof AgentStatus.Paused,
          })),
        }))
      },

      resumeAgent: (teamId, agentId) => {
        const ctrl = controllers.get(agentId)
        if (ctrl) ctrl.resume()

        set(state => ({
          teams: updateAgent(state.teams, teamId, agentId, a => ({
            ...a,
            status: AgentStatus.Running as typeof AgentStatus.Running,
          })),
        }))
      },

      sendMessage: (teamId, agentId, content) => {
        const userMsg: ChatMessage = {
          id: generateId(),
          agentId,
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        }

        set(state => ({
          teams: updateTeam(state.teams, teamId, t => ({
            ...t,
            messages: [...t.messages, userMsg],
            updatedAt: new Date().toISOString(),
          })),
        }))

        const delay = 500 + Math.random() * 1000
        setTimeout(() => {
          const agentMsg: ChatMessage = {
            id: generateId(),
            agentId,
            role: 'agent',
            content: getMockAgentResponse(),
            timestamp: new Date().toISOString(),
          }
          set(state => ({
            teams: updateTeam(state.teams, teamId, t => ({
              ...t,
              messages: [...t.messages, agentMsg],
              updatedAt: new Date().toISOString(),
            })),
          }))
        }, delay)
      },
    }),
    {
      name: 'signof-agent-storage',
      partialize: (state) => ({
        teams: state.teams,
        activeTeamId: state.activeTeamId,
      }),
      onRehydrateStorage: () => {
        return (state: AgentState | undefined) => {
          if (!state) return
          state.teams = state.teams.map((team) => ({
            ...team,
            status: team.status === TeamStatus.Running
              ? (TeamStatus.Paused as typeof TeamStatus.Paused)
              : team.status,
            agents: team.agents.map((agent) => ({
              ...agent,
              status: agent.status === AgentStatus.Running
                ? (AgentStatus.Paused as typeof AgentStatus.Paused)
                : agent.status,
            })),
          }))
        }
      },
    }
  )
)

export default useAgentStore
