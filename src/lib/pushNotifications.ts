export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

/** Check if push notifications are supported */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/** Get current push notification permission state */
export function getPushPermission(): PushPermissionState {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission as PushPermissionState
}

/** Request push notification permission from the user */
export async function requestPushPermission(): Promise<PushPermissionState> {
  if (!isPushSupported()) return 'unsupported'
  const result = await Notification.requestPermission()
  return result as PushPermissionState
}

/** Send a local browser notification (for in-app events, no server needed) */
export function sendLocalNotification(title: string, options?: NotificationOptions): void {
  if (getPushPermission() !== 'granted') return

  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-192x192.svg',
        ...options,
      })
    })
  } else {
    new Notification(title, {
      icon: '/icons/icon-192x192.svg',
      ...options,
    })
  }
}
