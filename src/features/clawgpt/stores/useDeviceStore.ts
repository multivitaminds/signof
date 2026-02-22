import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DeviceNode } from '../types'
import { DevicePlatform, DeviceCapability, DeviceStatus } from '../types'
import type { DeviceStatus as DeviceStatusT } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const SAMPLE_DEVICES: DeviceNode[] = [
  {
    id: 'device-1',
    name: 'MacBook Pro - Work',
    platform: DevicePlatform.MacOS,
    capabilities: [
      DeviceCapability.Shell,
      DeviceCapability.Screen,
      DeviceCapability.Notifications,
      DeviceCapability.Clipboard,
      DeviceCapability.Browser,
      DeviceCapability.Camera,
    ],
    status: DeviceStatus.Online,
    pairedAt: '2025-01-10T14:00:00Z',
    lastSeen: '2025-06-15T10:30:00Z',
  },
  {
    id: 'device-2',
    name: 'iPhone 16 Pro',
    platform: DevicePlatform.IOS,
    capabilities: [
      DeviceCapability.Notifications,
      DeviceCapability.Camera,
    ],
    status: DeviceStatus.Offline,
    pairedAt: '2025-02-20T09:00:00Z',
    lastSeen: '2025-06-14T22:15:00Z',
  },
]

interface DeviceState {
  devices: DeviceNode[]
  pairingCode: string | null
  pairingExpiry: string | null

  generatePairingCode: () => string
  pairDevice: (code: string, deviceInfo: Omit<DeviceNode, 'id' | 'pairedAt' | 'lastSeen'>) => string | null
  unpairDevice: (id: string) => void
  updateDeviceStatus: (id: string, status: DeviceStatusT) => void
  getOnlineDevices: () => DeviceNode[]
  sendCommand: (deviceId: string, command: string) => boolean
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (_set, get) => ({
      devices: SAMPLE_DEVICES,
      pairingCode: null,
      pairingExpiry: null,

      generatePairingCode: () => {
        const code = String(Math.floor(100000 + Math.random() * 900000))
        const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString()
        _set({
          pairingCode: code,
          pairingExpiry: expiry,
        })
        return code
      },

      pairDevice: (code, deviceInfo) => {
        const state = get()
        if (
          !state.pairingCode ||
          state.pairingCode !== code ||
          !state.pairingExpiry ||
          new Date(state.pairingExpiry) < new Date()
        ) {
          return null
        }

        const id = rid()
        const now = new Date().toISOString()
        const device: DeviceNode = {
          ...deviceInfo,
          id,
          pairedAt: now,
          lastSeen: now,
        }

        _set((s) => ({
          devices: [...s.devices, device],
          pairingCode: null,
          pairingExpiry: null,
        }))

        return id
      },

      unpairDevice: (id) => {
        _set((s) => ({
          devices: s.devices.filter((d) => d.id !== id),
        }))
      },

      updateDeviceStatus: (id, status) => {
        _set((s) => ({
          devices: s.devices.map((d) =>
            d.id === id
              ? { ...d, status, lastSeen: new Date().toISOString() }
              : d
          ),
        }))
      },

      getOnlineDevices: () => {
        return get().devices.filter((d) => d.status === DeviceStatus.Online)
      },

      sendCommand: (deviceId, _command) => {
        const device = get().devices.find((d) => d.id === deviceId)
        if (!device || device.status !== DeviceStatus.Online) {
          return false
        }
        _set((s) => ({
          devices: s.devices.map((d) =>
            d.id === deviceId ? { ...d, lastSeen: new Date().toISOString() } : d
          ),
        }))
        return true
      },
    }),
    { name: 'origina-device-storage' }
  )
)
