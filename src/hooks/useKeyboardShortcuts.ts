import { useEffect, useRef } from 'react'

export interface ShortcutConfig {
  key: string
  handler: () => void
  chord?: string
  ignoreInputs?: boolean
}

interface ChordState {
  pendingKey: string | null
  timeoutId: ReturnType<typeof setTimeout> | null
}

const CHORD_TIMEOUT = 1000

function isMac(): boolean {
  // navigator.platform is deprecated but widely supported;
  // fall back to userAgent for newer browsers that remove it.
  if (typeof navigator !== 'undefined') {
    if (navigator.platform) {
      return navigator.platform.toUpperCase().includes('MAC')
    }
    return navigator.userAgent.toUpperCase().includes('MAC')
  }
  return false
}

function isInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true
  if (target.isContentEditable || target.contentEditable === 'true') return true
  return false
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]): void {
  const chordRef = useRef<ChordState>({ pendingKey: null, timeoutId: null })
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    const mac = isMac()

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentShortcuts = shortcutsRef.current
      const chord = chordRef.current

      for (const shortcut of currentShortcuts) {
        const ignore = shortcut.ignoreInputs !== false
        if (ignore && isInputTarget(e.target)) continue

        // Chord sequence: e.g. chord = 'g+h' means press G, then H
        if (shortcut.chord) {
          const parts = shortcut.chord.toLowerCase().split('+')
          if (parts.length !== 2) continue
          const [first, second] = parts as [string, string]

          if (chord.pendingKey === first && e.key.toLowerCase() === second) {
            // Second key of the chord matched
            e.preventDefault()
            shortcut.handler()
            // Reset chord state
            if (chord.timeoutId !== null) clearTimeout(chord.timeoutId)
            chord.pendingKey = null
            chord.timeoutId = null
            return
          }
          continue
        }

        // mod+key: e.g. 'mod+k'
        if (shortcut.key.startsWith('mod+')) {
          const targetKey = shortcut.key.slice(4).toLowerCase()
          const modPressed = mac ? e.metaKey : e.ctrlKey
          if (modPressed && e.key.toLowerCase() === targetKey) {
            e.preventDefault()
            shortcut.handler()
            return
          }
          continue
        }

        // Simple key match
        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.altKey
        ) {
          e.preventDefault()
          shortcut.handler()
          return
        }
      }

      // Check if this key is the first key of any chord sequence
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const pressedKey = e.key.toLowerCase()
        const isChordStart = currentShortcuts.some((s) => {
          if (!s.chord) return false
          const ignore = s.ignoreInputs !== false
          if (ignore && isInputTarget(e.target)) return false
          const parts = s.chord.toLowerCase().split('+')
          return parts[0] === pressedKey
        })

        if (isChordStart) {
          if (chord.timeoutId !== null) clearTimeout(chord.timeoutId)
          chord.pendingKey = pressedKey
          chord.timeoutId = setTimeout(() => {
            chord.pendingKey = null
            chord.timeoutId = null
          }, CHORD_TIMEOUT)
          return
        }
      }

      // If we get here and there's a pending chord that didn't match, reset it
      if (chordRef.current.pendingKey !== null) {
        if (chordRef.current.timeoutId !== null) clearTimeout(chordRef.current.timeoutId)
        chordRef.current.pendingKey = null
        chordRef.current.timeoutId = null
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (chordRef.current.timeoutId !== null) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(chordRef.current.timeoutId)
      }
    }
  }, [])
}
