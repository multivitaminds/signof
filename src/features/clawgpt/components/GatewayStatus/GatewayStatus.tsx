import { useCallback } from 'react'
import { useGatewayStore } from '../../stores/useGatewayStore'
import './GatewayStatus.css'

function formatUptime(since: string | null): string {
  if (!since) return ''
  const diff = Date.now() - new Date(since).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m`
  return `${seconds}s`
}

export default function GatewayStatus() {
  const { gatewayStatus, uptimeSince, startGateway, stopGateway } =
    useGatewayStore()

  const isOnline = gatewayStatus === 'online'
  const isDegraded = gatewayStatus === 'degraded'

  const handleToggle = useCallback(() => {
    if (isOnline || isDegraded) {
      stopGateway()
    } else {
      startGateway()
    }
  }, [isOnline, isDegraded, startGateway, stopGateway])

  return (
    <div className="gateway-status">
      <span
        className={`gateway-status__dot gateway-status__dot--${gatewayStatus}`}
        aria-hidden="true"
      />
      <span className="gateway-status__label">
        Gateway: {gatewayStatus.charAt(0).toUpperCase() + gatewayStatus.slice(1)}
      </span>
      {uptimeSince && (
        <span className="gateway-status__uptime">
          Uptime: {formatUptime(uptimeSince)}
        </span>
      )}
      <button
        className="gateway-status__action btn--ghost"
        onClick={handleToggle}
        aria-label={isOnline || isDegraded ? 'Stop gateway' : 'Start gateway'}
      >
        {isOnline || isDegraded ? 'Stop' : 'Start'}
      </button>
    </div>
  )
}
