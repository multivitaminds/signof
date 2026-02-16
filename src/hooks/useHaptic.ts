/** Trigger haptic feedback if supported by the device */
export function haptic(pattern: 'light' | 'medium' | 'heavy' = 'light'): void {
  if (!navigator.vibrate) return
  switch (pattern) {
    case 'light':
      navigator.vibrate(10)
      break
    case 'medium':
      navigator.vibrate(25)
      break
    case 'heavy':
      navigator.vibrate([25, 50, 25])
      break
  }
}

/** Hook that returns a haptic feedback function */
export function useHaptic() {
  return haptic
}
