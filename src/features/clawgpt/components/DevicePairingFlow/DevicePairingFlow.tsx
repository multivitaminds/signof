import { useState, useEffect, useCallback } from 'react'
import './DevicePairingFlow.css'

interface DevicePairingFlowProps {
  pairingCode: string | null
  pairingExpiry: string | null
  onGenerate: () => void
  onCancel: () => void
}

function formatCountdown(expiryStr: string): string {
  const remaining = new Date(expiryStr).getTime() - Date.now()
  if (remaining <= 0) return 'Expired'
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function DevicePairingFlow({
  pairingCode,
  pairingExpiry,
  onGenerate,
  onCancel,
}: DevicePairingFlowProps) {
  const [countdown, setCountdown] = useState(() =>
    pairingExpiry ? formatCountdown(pairingExpiry) : ''
  )

  useEffect(() => {
    if (!pairingExpiry) return
    const interval = setInterval(() => {
      setCountdown(formatCountdown(pairingExpiry))
    }, 1000)
    return () => clearInterval(interval)
  }, [pairingExpiry])

  const handleGenerate = useCallback(() => {
    onGenerate()
  }, [onGenerate])

  const handleCancel = useCallback(() => {
    onCancel()
  }, [onCancel])

  if (!pairingCode) {
    return (
      <div className="device-pairing">
        <button className="device-pairing__generate btn--primary" onClick={handleGenerate}>
          Pair New Device
        </button>
      </div>
    )
  }

  return (
    <div className="device-pairing device-pairing--active">
      <h3 className="device-pairing__title">Pair Your Device</h3>
      <p className="device-pairing__instructions">
        Enter this code on your device to complete pairing.
      </p>
      <div className="device-pairing__code" aria-label="Pairing code">
        {pairingCode.split('').map((char, i) => (
          <span key={i} className="device-pairing__digit">
            {char}
          </span>
        ))}
      </div>
      {pairingExpiry && (
        <span className="device-pairing__timer" aria-label="Time remaining">
          {countdown}
        </span>
      )}
      <button className="device-pairing__cancel btn--ghost" onClick={handleCancel}>
        Cancel
      </button>
    </div>
  )
}
