import { useState, useCallback } from 'react'
import './AIAgentsPage.css'

export default function AIAgentsPage() {
  const [activeTeamId] = useState<string | null>(null)
  const [showNewTeamWizard, setShowNewTeamWizard] = useState(false)

  const handleNewTeam = useCallback(() => {
    setShowNewTeamWizard(true)
  }, [])

  const handleCloseWizard = useCallback(() => {
    setShowNewTeamWizard(false)
  }, [])

  return (
    <div className="ai-agents-page">
      <div className="ai-agents-page__header">
        <h2 className="ai-agents-page__title">Agent Teams</h2>
        <button className="btn-primary" onClick={handleNewTeam}>
          New Team
        </button>
      </div>

      {activeTeamId ? (
        <div data-testid="team-detail-placeholder">Team Detail</div>
      ) : (
        <div data-testid="team-grid-placeholder">Team Grid</div>
      )}

      {showNewTeamWizard && (
        <div
          className="modal-overlay"
          onClick={handleCloseWizard}
          role="dialog"
          aria-modal="true"
          aria-label="New Team Wizard"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Agent Team</h2>
              <button
                className="modal-close"
                onClick={handleCloseWizard}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div data-testid="new-team-wizard-placeholder">New Team Wizard</div>
          </div>
        </div>
      )}
    </div>
  )
}
