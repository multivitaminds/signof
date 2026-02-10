import { useState, useCallback } from 'react'
import useAgentStore from '../stores/useAgentStore'
import type { AgentType } from '../types'
import TeamGrid from '../components/TeamGrid/TeamGrid'
import TeamDetail from '../components/TeamDetail/TeamDetail'
import NewTeamWizard from '../components/NewTeamWizard/NewTeamWizard'
import './AIAgentsPage.css'

interface AgentConfig {
  name: string
  type: AgentType
  instructions: string
  memoryAllocation: number
}

export default function AIAgentsPage() {
  const teams = useAgentStore((s) => s.teams)
  const activeTeamId = useAgentStore((s) => s.activeTeamId)
  const createTeam = useAgentStore((s) => s.createTeam)
  const setActiveTeam = useAgentStore((s) => s.setActiveTeam)
  const startTeam = useAgentStore((s) => s.startTeam)
  const pauseTeam = useAgentStore((s) => s.pauseTeam)
  const resumeTeam = useAgentStore((s) => s.resumeTeam)
  const cancelTeam = useAgentStore((s) => s.cancelTeam)
  const pauseAgent = useAgentStore((s) => s.pauseAgent)
  const resumeAgent = useAgentStore((s) => s.resumeAgent)
  const sendMessage = useAgentStore((s) => s.sendMessage)

  const [showNewTeamWizard, setShowNewTeamWizard] = useState(false)

  const activeTeam = activeTeamId
    ? teams.find((t) => t.id === activeTeamId) ?? null
    : null

  const handleSelectTeam = useCallback(
    (teamId: string) => {
      setActiveTeam(teamId)
    },
    [setActiveTeam],
  )

  const handleNewTeam = useCallback(() => {
    setShowNewTeamWizard(true)
  }, [])

  const handleCloseWizard = useCallback(() => {
    setShowNewTeamWizard(false)
  }, [])

  const handleWizardComplete = useCallback(
    (name: string, agents: AgentConfig[]) => {
      const team = createTeam(name, agents)
      setShowNewTeamWizard(false)
      setActiveTeam(team.id)
    },
    [createTeam, setActiveTeam],
  )

  const handleBack = useCallback(() => {
    setActiveTeam(null)
  }, [setActiveTeam])

  const handleStart = useCallback(() => {
    if (activeTeamId) startTeam(activeTeamId)
  }, [activeTeamId, startTeam])

  const handlePause = useCallback(() => {
    if (activeTeamId) pauseTeam(activeTeamId)
  }, [activeTeamId, pauseTeam])

  const handleResume = useCallback(() => {
    if (activeTeamId) resumeTeam(activeTeamId)
  }, [activeTeamId, resumeTeam])

  const handleCancel = useCallback(() => {
    if (activeTeamId) cancelTeam(activeTeamId)
  }, [activeTeamId, cancelTeam])

  const handlePauseAgent = useCallback(
    (agentId: string) => {
      if (activeTeamId) pauseAgent(activeTeamId, agentId)
    },
    [activeTeamId, pauseAgent],
  )

  const handleResumeAgent = useCallback(
    (agentId: string) => {
      if (activeTeamId) resumeAgent(activeTeamId, agentId)
    },
    [activeTeamId, resumeAgent],
  )

  const handleSendMessage = useCallback(
    (agentId: string, content: string) => {
      if (activeTeamId) sendMessage(activeTeamId, agentId, content)
    },
    [activeTeamId, sendMessage],
  )

  return (
    <div className="ai-agents-page">
      {activeTeam ? (
        <TeamDetail
          team={activeTeam}
          onBack={handleBack}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onCancel={handleCancel}
          onPauseAgent={handlePauseAgent}
          onResumeAgent={handleResumeAgent}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <>
          <div className="ai-agents-page__header">
            <h2 className="ai-agents-page__title">Agent Teams</h2>
            <button className="btn-primary" onClick={handleNewTeam}>
              New Team
            </button>
          </div>
          <TeamGrid
            teams={teams}
            onSelectTeam={handleSelectTeam}
            onNewTeam={handleNewTeam}
          />
        </>
      )}

      {showNewTeamWizard && (
        <NewTeamWizard
          onComplete={handleWizardComplete}
          onCancel={handleCloseWizard}
        />
      )}
    </div>
  )
}
