import { useState, useCallback, useMemo, useEffect } from 'react'
import { useGatewayStore } from '../stores/useGatewayStore'
import { useMessageStore } from '../stores/useMessageStore'
import { GatewayStatus } from '../types'
import SessionPanel from '../components/SessionPanel/SessionPanel'
import MessageThread from '../components/MessageThread/MessageThread'
import MessageComposer from '../components/MessageComposer/MessageComposer'
import './UnifiedInboxPage.css'

export default function UnifiedInboxPage() {
  const { activeSessions, gatewayStatus } = useGatewayStore()
  const { messages, sendMessage, markRead, activeSessionId, setActiveSession } = useMessageStore()
  const [showDetails, setShowDetails] = useState(true)

  const selectedSession = useMemo(
    () => activeSessions.find((s) => s.id === activeSessionId) ?? null,
    [activeSessions, activeSessionId]
  )

  const sessionMessages = useMemo(
    () => (activeSessionId ? messages.filter((m) => m.sessionId === activeSessionId) : []),
    [messages, activeSessionId]
  )

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setActiveSession(sessionId)
      markRead(sessionId)
    },
    [setActiveSession, markRead]
  )

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!selectedSession) return
      sendMessage(
        selectedSession.id,
        selectedSession.channelId,
        selectedSession.channelType,
        content
      )
    },
    [selectedSession, sendMessage]
  )

  const handleToggleDetails = useCallback(() => {
    setShowDetails((prev) => !prev)
  }, [])

  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const interval = setInterval(() => { setNow(Date.now()) }, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = useCallback((startedAt: string): string => {
    const start = new Date(startedAt).getTime()
    const diffMs = now - start
    const mins = Math.floor(diffMs / 60000)
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    return `${hours}h ${mins % 60}m`
  }, [now])

  const messageCountForSession = activeSessionId
    ? messages.filter((m) => m.sessionId === activeSessionId).length
    : 0

  const isGatewayOffline = gatewayStatus === GatewayStatus.Offline

  return (
    <div className="unified-inbox">
      <div className="unified-inbox__sessions">
        <SessionPanel
          sessions={activeSessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
        />
      </div>

      <div className="unified-inbox__messages">
        {selectedSession ? (
          <>
            <div className="unified-inbox__messages-header">
              <h3 className="unified-inbox__contact-name">{selectedSession.contactName}</h3>
              <span className="unified-inbox__channel-type">{selectedSession.channelType}</span>
              {isGatewayOffline && (
                <span className="unified-inbox__offline-badge">Gateway Offline</span>
              )}
              <button
                className="btn--ghost unified-inbox__toggle-details"
                onClick={handleToggleDetails}
                aria-label={showDetails ? 'Hide details' : 'Show details'}
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            <MessageThread messages={sessionMessages} sessionId={selectedSession.id} />
            <MessageComposer onSend={handleSendMessage} />
          </>
        ) : (
          <div className="unified-inbox__empty">
            <p>Select a conversation to view messages</p>
          </div>
        )}
      </div>

      {showDetails && selectedSession && (
        <div className="unified-inbox__details">
          <h4 className="unified-inbox__details-title">Session Details</h4>
          <dl className="unified-inbox__details-list">
            <dt>Contact</dt>
            <dd>{selectedSession.contactName}</dd>
            <dt>Channel</dt>
            <dd>{selectedSession.channelType}</dd>
            <dt>Agent</dt>
            <dd>{selectedSession.agentId ?? 'Unassigned'}</dd>
            <dt>Duration</dt>
            <dd>{formatDuration(selectedSession.startedAt)}</dd>
            <dt>Messages</dt>
            <dd>{messageCountForSession}</dd>
          </dl>
        </div>
      )}
    </div>
  )
}
