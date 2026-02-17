import './ShortcutHint.css'

interface ShortcutHintProps {
  keys: string
}

function isMac(): boolean {
  if (typeof navigator !== 'undefined') {
    if (navigator.platform) {
      return navigator.platform.toUpperCase().includes('MAC')
    }
    return navigator.userAgent.toUpperCase().includes('MAC')
  }
  return false
}

/**
 * Formats a shortcut string for display.
 * Converts 'mod' to platform-appropriate modifier (Cmd on Mac, Ctrl elsewhere).
 * Input format: 'mod+k', 'mod+shift+p', 'mod+1', '?', 'g+h'
 */
function formatKeys(keys: string): string {
  const mac = isMac()
  return keys
    .split('+')
    .map((part) => {
      const lower = part.toLowerCase()
      if (lower === 'mod') return mac ? '\u2318' : 'Ctrl'
      if (lower === 'shift') return mac ? '\u21E7' : 'Shift'
      if (lower === 'alt') return mac ? '\u2325' : 'Alt'
      // Capitalize single letter keys
      if (part.length === 1) return part.toUpperCase()
      return part
    })
    .join('')
}

export default function ShortcutHint({ keys }: ShortcutHintProps) {
  const display = formatKeys(keys)

  return (
    <kbd className="shortcut-hint" aria-label={`Keyboard shortcut: ${keys}`}>
      {display}
    </kbd>
  )
}
