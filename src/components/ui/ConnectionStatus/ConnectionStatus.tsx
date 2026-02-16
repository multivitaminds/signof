import { useState, useEffect } from 'react'
import './ConnectionStatus.css'

interface ConnectionStatusProps {
  mode: 'websocket' | 'simulated'
  isConnected: boolean
}

function ConnectionStatus({ mode, isConnected }: ConnectionStatusProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show after initial render delay
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  const status = mode === 'simulated' ? 'offline' : isConnected ? 'connected' : 'reconnecting'

  return (
    <div
      className={`connection-status connection-status--${status}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role="status"
      aria-label={`Connection: ${status}`}
    >
      <span className="connection-status__dot" />
      {showTooltip && (
        <div className="connection-status__tooltip">
          {status === 'connected' && 'Connected (live)'}
          {status === 'offline' && 'Offline mode'}
          {status === 'reconnecting' && 'Reconnecting...'}
        </div>
      )}
    </div>
  )
}

export default ConnectionStatus
