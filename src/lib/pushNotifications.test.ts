import { isPushSupported, getPushPermission, requestPushPermission } from './pushNotifications'

describe('pushNotifications', () => {
  const originalPushManager = Object.getOwnPropertyDescriptor(window, 'PushManager')
  const originalNotification = Object.getOwnPropertyDescriptor(window, 'Notification')

  beforeEach(() => {
    // Ensure serviceWorker is available (not always present in jsdom)
    if (!('serviceWorker' in navigator)) {
      Object.defineProperty(navigator, 'serviceWorker', { value: {}, writable: true, configurable: true })
    }
  })

  afterEach(() => {
    // Restore original state
    if (originalPushManager) {
      Object.defineProperty(window, 'PushManager', originalPushManager)
    } else {
      Reflect.deleteProperty(window, 'PushManager')
    }
    if (originalNotification) {
      Object.defineProperty(window, 'Notification', originalNotification)
    } else {
      Reflect.deleteProperty(window, 'Notification')
    }
  })

  describe('isPushSupported', () => {
    it('returns true when all APIs are available', () => {
      Object.defineProperty(window, 'PushManager', { value: {}, writable: true, configurable: true })
      Object.defineProperty(window, 'Notification', {
        value: { permission: 'default', requestPermission: vi.fn() },
        writable: true,
        configurable: true,
      })

      expect(isPushSupported()).toBe(true)
    })

    it('returns false when PushManager is missing', () => {
      Reflect.deleteProperty(window, 'PushManager')

      expect(isPushSupported()).toBe(false)
    })
  })

  describe('getPushPermission', () => {
    it('returns unsupported when push is not available', () => {
      Reflect.deleteProperty(window, 'PushManager')

      expect(getPushPermission()).toBe('unsupported')
    })

    it('returns current Notification.permission when supported', () => {
      Object.defineProperty(window, 'PushManager', { value: {}, writable: true, configurable: true })
      Object.defineProperty(window, 'Notification', {
        value: { permission: 'granted', requestPermission: vi.fn() },
        writable: true,
        configurable: true,
      })

      expect(getPushPermission()).toBe('granted')
    })
  })

  describe('requestPushPermission', () => {
    it('returns unsupported when push is not available', async () => {
      Reflect.deleteProperty(window, 'PushManager')

      const result = await requestPushPermission()
      expect(result).toBe('unsupported')
    })

    it('calls Notification.requestPermission and returns result', async () => {
      const mockRequest = vi.fn().mockResolvedValue('granted')
      Object.defineProperty(window, 'PushManager', { value: {}, writable: true, configurable: true })
      Object.defineProperty(window, 'Notification', {
        value: { permission: 'default', requestPermission: mockRequest },
        writable: true,
        configurable: true,
      })

      const result = await requestPushPermission()
      expect(mockRequest).toHaveBeenCalled()
      expect(result).toBe('granted')
    })
  })
})
