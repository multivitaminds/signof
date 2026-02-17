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

  const handleConnectChannel = useCallback(() => {
    navigate('/brain/channels')
  }, [navigate])

  const handleSendMessage = useCallback(() => {
    navigate('/brain/inbox')
  }, [navigate])

  const handleInstallSkill = useCallback(() => {
    navigate('/brain/skills')
  }, [navigate])

  return (
    <div className="brain-dashboard">
      <GatewayStatus />

      <div className="brain-dashboard__stats">
        <div className="brain-dashboard__stat-card">
          <span className="brain-dashboard__stat-value">{activeSessionCount}</span>
          <span className="brain-dashboard__stat-label">Active Sessions</span>
        </div>
        <div className="brain-dashboard__stat-card">
          <span className="brain-dashboard__stat-value">{totalMessagesToday}</span>
          <span className="brain-dashboard__stat-label">Messages Today</span>
        </div>
        <div className="brain-dashboard__stat-card">
          <span className="brain-dashboard__stat-value">{connectedChannelCount}</span>
          <span className="brain-dashboard__stat-label">Channels Connected</span>
        </div>
        <div className="brain-dashboard__stat-card">
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
          onClick={handleConnectChannel}
        >
          Connect Channel
        </button>
        <button
          className="btn--secondary brain-dashboard__action-btn"
          onClick={handleSendMessage}
        >
          Send Message
        </button>
        <button
          className="btn--secondary brain-dashboard__action-btn"
          onClick={handleInstallSkill}
        >
          Install Skill
        </button>
      </div>
    </div>
  )
}
