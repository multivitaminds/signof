import { describe, it, expect, beforeEach } from 'vitest'
import { useDeviceStore } from './useDeviceStore'
import type { DeviceNode } from '../types'

const SAMPLE_DEVICES: DeviceNode[] = [
  {
    id: 'device-1',
    name: 'MacBook Pro',
    platform: 'macos',
    capabilities: ['shell', 'screen', 'notifications'],
    status: 'online',
    pairedAt: '2025-01-10T14:00:00Z',
    lastSeen: '2025-06-15T10:30:00Z',
  },
  {
    id: 'device-2',
    name: 'iPhone 16 Pro',
    platform: 'ios',
    capabilities: ['notifications', 'camera'],
    status: 'offline',
    pairedAt: '2025-02-20T09:00:00Z',
    lastSeen: '2025-06-14T22:15:00Z',
  },
]

describe('useDeviceStore', () => {
  beforeEach(() => {
    useDeviceStore.setState({
      devices: SAMPLE_DEVICES.map((d) => ({ ...d, capabilities: [...d.capabilities] })),
      pairingCode: null,
      pairingExpiry: null,
    })
  })

  it('initializes with sample devices', () => {
    const state = useDeviceStore.getState()
    expect(state.devices).toHaveLength(2)
    expect(state.pairingCode).toBeNull()
    expect(state.pairingExpiry).toBeNull()
  })

  describe('generatePairingCode', () => {
    it('generates a 6-digit code and sets expiry', () => {
      const code = useDeviceStore.getState().generatePairingCode()
      expect(code).toMatch(/^\d{6}$/)
      const state = useDeviceStore.getState()
      expect(state.pairingCode).toBe(code)
      expect(state.pairingExpiry).toBeTruthy()
      const expiry = new Date(state.pairingExpiry!)
      expect(expiry.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('pairDevice', () => {
    it('pairs a device with valid code', () => {
      const code = useDeviceStore.getState().generatePairingCode()
      const id = useDeviceStore.getState().pairDevice(code, {
        name: 'New iPad',
        platform: 'ios',
        capabilities: ['notifications'],
        status: 'online',
      })
      expect(id).toBeTruthy()
      const state = useDeviceStore.getState()
      expect(state.devices).toHaveLength(3)
      const newDevice = state.devices.find((d) => d.id === id)
      expect(newDevice!.name).toBe('New iPad')
      expect(newDevice!.pairedAt).toBeTruthy()
      expect(state.pairingCode).toBeNull()
      expect(state.pairingExpiry).toBeNull()
    })

    it('returns null for wrong code', () => {
      useDeviceStore.getState().generatePairingCode()
      const id = useDeviceStore.getState().pairDevice('000000', {
        name: 'Bad Device',
        platform: 'android',
        capabilities: [],
        status: 'online',
      })
      expect(id).toBeNull()
      expect(useDeviceStore.getState().devices).toHaveLength(2)
    })

    it('returns null when no code has been generated', () => {
      const id = useDeviceStore.getState().pairDevice('123456', {
        name: 'Device',
        platform: 'web',
        capabilities: [],
        status: 'online',
      })
      expect(id).toBeNull()
    })

    it('returns null for expired code', () => {
      useDeviceStore.getState().generatePairingCode()
      const code = useDeviceStore.getState().pairingCode!
      useDeviceStore.setState({
        pairingExpiry: new Date(Date.now() - 1000).toISOString(),
      })
      const id = useDeviceStore.getState().pairDevice(code, {
        name: 'Late Device',
        platform: 'web',
        capabilities: [],
        status: 'online',
      })
      expect(id).toBeNull()
    })
  })

  describe('unpairDevice', () => {
    it('removes a device by id', () => {
      useDeviceStore.getState().unpairDevice('device-2')
      const state = useDeviceStore.getState()
      expect(state.devices).toHaveLength(1)
      expect(state.devices.find((d) => d.id === 'device-2')).toBeUndefined()
    })
  })

  describe('updateDeviceStatus', () => {
    it('updates the status and lastSeen', () => {
      const before = useDeviceStore.getState().devices.find((d) => d.id === 'device-2')!.lastSeen
      useDeviceStore.getState().updateDeviceStatus('device-2', 'online')
      const device = useDeviceStore.getState().devices.find((d) => d.id === 'device-2')
      expect(device!.status).toBe('online')
      expect(device!.lastSeen).not.toBe(before)
    })
  })

  describe('getOnlineDevices', () => {
    it('returns only online devices', () => {
      const online = useDeviceStore.getState().getOnlineDevices()
      expect(online).toHaveLength(1)
      expect(online[0]!.id).toBe('device-1')
    })

    it('updates when device status changes', () => {
      useDeviceStore.getState().updateDeviceStatus('device-2', 'online')
      const online = useDeviceStore.getState().getOnlineDevices()
      expect(online).toHaveLength(2)
    })
  })

  describe('sendCommand', () => {
    it('returns true for an online device', () => {
      const result = useDeviceStore.getState().sendCommand('device-1', 'lock-screen')
      expect(result).toBe(true)
    })

    it('returns false for an offline device', () => {
      const result = useDeviceStore.getState().sendCommand('device-2', 'lock-screen')
      expect(result).toBe(false)
    })

    it('returns false for unknown device', () => {
      const result = useDeviceStore.getState().sendCommand('nonexistent', 'test')
      expect(result).toBe(false)
    })

    it('updates lastSeen on successful command', () => {
      const before = useDeviceStore.getState().devices.find((d) => d.id === 'device-1')!.lastSeen
      useDeviceStore.getState().sendCommand('device-1', 'ping')
      const after = useDeviceStore.getState().devices.find((d) => d.id === 'device-1')!.lastSeen
      expect(after).not.toBe(before)
    })
  })
})
