import { useState, useCallback, useMemo } from 'react'
import { useDeviceStore } from '../stores/useDeviceStore'
import DeviceNodeCard from '../components/DeviceNode/DeviceNode'
import DevicePairingFlow from '../components/DevicePairingFlow/DevicePairingFlow'
import './DevicesPage.css'

type DeviceFilter = 'all' | 'online' | 'offline'

export default function DevicesPage() {
  const { devices, unpairDevice, pairingCode, pairingExpiry, generatePairingCode } = useDeviceStore()
  const [filter, setFilter] = useState<DeviceFilter>('all')
  const [showPairing, setShowPairing] = useState(false)

  const filteredDevices = useMemo(() => {
    if (filter === 'online') return devices.filter((d) => d.status === 'online')
    if (filter === 'offline') return devices.filter((d) => d.status === 'offline')
    return devices
  }, [devices, filter])

  const handleStartPairing = useCallback(() => {
    setShowPairing(true)
    generatePairingCode()
  }, [generatePairingCode])

  const handleClosePairing = useCallback(() => {
    setShowPairing(false)
  }, [])

  const handleGenerate = useCallback(() => {
    generatePairingCode()
  }, [generatePairingCode])

  return (
    <div className="devices-page">
      <div className="devices-page__actions">
        <button className="btn--primary" onClick={handleStartPairing}>
          Pair New Device
        </button>
      </div>

      {showPairing && (
        <DevicePairingFlow
          pairingCode={pairingCode}
          pairingExpiry={pairingExpiry}
          onGenerate={handleGenerate}
          onCancel={handleClosePairing}
        />
      )}

      <div className="devices-page__filters" role="group" aria-label="Device filters">
        <button
          className={`devices-page__filter${filter === 'all' ? ' devices-page__filter--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`devices-page__filter${filter === 'online' ? ' devices-page__filter--active' : ''}`}
          onClick={() => setFilter('online')}
        >
          Online
        </button>
        <button
          className={`devices-page__filter${filter === 'offline' ? ' devices-page__filter--active' : ''}`}
          onClick={() => setFilter('offline')}
        >
          Offline
        </button>
      </div>

      {filteredDevices.length > 0 ? (
        <div className="devices-page__grid">
          {filteredDevices.map((device) => (
            <DeviceNodeCard
              key={device.id}
              device={device}
              onUnpair={unpairDevice}
            />
          ))}
        </div>
      ) : (
        <div className="devices-page__empty">
          <p>No devices paired yet</p>
        </div>
      )}
    </div>
  )
}
