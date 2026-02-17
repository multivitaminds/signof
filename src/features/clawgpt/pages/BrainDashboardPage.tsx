import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGatewayStore } from '../stores/useGatewayStore'
import { useChannelStore } from '../stores/useChannelStore'
import { useMessageStore } from '../stores/useMessageStore'
import { useSkillStore } from '../stores/useSkillStore'
import GatewayStatus from '../components/GatewayStatus/GatewayStatus'
import ActivityFeed from '../components/ActivityFeed/ActivityFeed'
import './BrainDashboardPage.css'

export default function BrainDashboardPage() {
  const navigate = useNavigate()
  const { activeSessions, totalMessagesToday } = useGatewayStore()
  const { channels } = useChannelStore()
  const { messages } = useMessageStore()
  const { skills } = useSkillStore()

  const activeSessionCount = activeSessions.filter((s) => s.isActive).length
  const connectedChannelCount = channels.filter((ch) => ch.status === 'connected').length
  const installedSkillCount = skills.filter((sk) => sk.installed).length
  const recentMessages = messages.slice(-20)

  const handleNavigateInbox = useCallback(() => {
    navigate('/brain/inbox')
  }, [navigate])

  const handleNavigateChannels = useCallback(() => {
    navigate('/brain/channels')
  }, [navigate])

  const handleNavigateSkills = useCallback(() => {
    navigate('/brain/skills')
  }, [navigate])

  const handleStatKeyDown = useCallback(
    (handler: () => void) => (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handler()
      }
    },
    []
  )

  return (
    <div className="brain-dashboard">
      <GatewayStatus />

      <div className="brain-dashboard__stats">
        <div
          className="brain-dashboard__stat-card"
          role="button"
          tabIndex={0}
          onClick={handleNavigateInbox}
          onKeyDown={handleStatKeyDown(handleNavigateInbox)}
          aria-label="Active Sessions — go to Inbox"
        >
          <span className="brain-dashboard__stat-value">{activeSessionCount}</span>
          <span className="brain-dashboard__stat-label">Active Sessions</span>
        </div>
        <div
          className="brain-dashboard__stat-card"
          role="button"
          tabIndex={0}
          onClick={handleNavigateInbox}
          onKeyDown={handleStatKeyDown(handleNavigateInbox)}
          aria-label="Messages Today — go to Inbox"
        >
          <span className="brain-dashboard__stat-value">{totalMessagesToday}</span>
          <span className="brain-dashboard__stat-label">Messages Today</span>
        </div>
        <div
          className="brain-dashboard__stat-card"
          role="button"
          tabIndex={0}
          onClick={handleNavigateChannels}
          onKeyDown={handleStatKeyDown(handleNavigateChannels)}
          aria-label="Channels Connected — go to Channels"
        >
          <span className="brain-dashboard__stat-value">{connectedChannelCount}</span>
          <span className="brain-dashboard__stat-label">Channels Connected</span>
        </div>
        <div
          className="brain-dashboard__stat-card"
          role="button"
          tabIndex={0}
          onClick={handleNavigateSkills}
          onKeyDown={handleStatKeyDown(handleNavigateSkills)}
          aria-label="Skills Installed — go to Skills"
        >
          <span className="brain-dashboard__stat-value">{installedSkillCount}</span>
          <span className="brain-dashboard__stat-label">Skills Installed</span>
        </div>
      </div>

      <div className="brain-dashboard__activity">
        <h3 className="brain-dashboard__activity-title">Recent Activity</h3>
        <ActivityFeed messages={recentMessages} />
      </div>

      <div className="brain-dashboard__quick-actions">
        <button
          className="btn--primary brain-dashboard__action-btn"
          onClick={handleNavigateChannels}
        >
          Connect a Channel
        </button>
        <button
          className="btn--secondary brain-dashboard__action-btn"
          onClick={handleNavigateInbox}
        >
          Go to Inbox
        </button>
        <button
          className="btn--secondary brain-dashboard__action-btn"
          onClick={handleNavigateSkills}
        >
          Browse Skills
        </button>
      </div>
    </div>
  )
}
