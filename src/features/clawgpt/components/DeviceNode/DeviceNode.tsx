import { useCallback } from 'react'
import type { DeviceNode as DeviceNodeType } from '../../types'
import { DEVICE_PLATFORM_LABELS } from '../../types'
import './DeviceNode.css'

interface DeviceNodeProps {
  device: DeviceNodeType
  onUnpair?: (id: string) => void
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

function platformIcon(platform: string): string {
  const icons: Record<string, string> = {
    macos: 'M',
    windows: 'W',
    linux: 'L',
    ios: 'i',
    android: 'A',
    web: 'G',
  }
  return icons[platform] ?? 'D'
}

export default function DeviceNode({ device, onUnpair }: DeviceNodeProps) {
  const handleUnpair = useCallback(() => {
    onUnpair?.(device.id)
  }, [device.id, onUnpair])

  return (
    <div className="device-node">
      <div className="device-node__header">
        <span className="device-node__icon" aria-hidden="true">
          {platformIcon(device.platform)}
        </span>
        <div className="device-node__title">
          <h3 className="device-node__name">{device.name}</h3>
          <span className="device-node__platform">
            {DEVICE_PLATFORM_LABELS[device.platform]}
          </span>
        </div>
        <span
          className={`device-node__status device-node__status--${device.status}`}
          aria-label={device.status}
        >
          {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
        </span>
      </div>

      <div className="device-node__capabilities">
        {device.capabilities.map((cap) => (
          <span key={cap} className="device-node__capability">
            {cap}
          </span>
        ))}
      </div>

      <div className="device-node__footer">
        <span className="device-node__last-seen">
          Last seen: {timeAgo(device.lastSeen)}
        </span>
        {onUnpair && (
          <button
            className="device-node__unpair btn--danger"
            onClick={handleUnpair}
            aria-label={`Unpair ${device.name}`}
          >
            Unpair
          </button>
        )}
      </div>
    </div>
  )
}
