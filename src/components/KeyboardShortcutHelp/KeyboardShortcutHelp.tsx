import { useEffect, useCallback } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import './KeyboardShortcutHelp.css'

interface ShortcutEntry {
  keys: string[]
  description: string
}

interface ShortcutSection {
  title: string
  shortcuts: ShortcutEntry[]
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['\u2318', 'K'], description: 'Open command palette' },
      { keys: ['?'], description: 'Keyboard shortcuts' },
      { keys: ['['], description: 'Toggle sidebar' },
    ],
  },
  {
    title: 'Navigation (G + ...)',
    shortcuts: [
      { keys: ['G', 'H'], description: 'Go to Home' },
      { keys: ['G', 'D'], description: 'Go to Documents' },
      { keys: ['G', 'P'], description: 'Go to Projects' },
      { keys: ['G', 'A'], description: 'Go to Pages' },
      { keys: ['G', 'S'], description: 'Go to Calendar' },
      { keys: ['G', 'I'], description: 'Go to Inbox' },
      { keys: ['G', 'C'], description: 'Go to Databases' },
      { keys: ['G', 'B'], description: 'Go to AI' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['C'], description: 'Create new' },
      { keys: ['N'], description: 'New document' },
    ],
  },
]

export default function KeyboardShortcutHelp() {
  const shortcutHelpOpen = useAppStore((s) => s.shortcutHelpOpen)
  const closeShortcutHelp = useAppStore((s) => s.closeShortcutHelp)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeShortcutHelp()
      }
    },
    [closeShortcutHelp]
  )

  useEffect(() => {
    if (!shortcutHelpOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcutHelpOpen, handleKeyDown])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeShortcutHelp()
      }
    },
    [closeShortcutHelp]
  )

  if (!shortcutHelpOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div className="modal-content shortcut-help">
        <div className="modal-header">
          <h2>Keyboard Shortcuts</h2>
          <button
            className="modal-close"
            onClick={closeShortcutHelp}
            aria-label="Close keyboard shortcuts"
          >
            &times;
          </button>
        </div>

        <div className="shortcut-help__body">
          {SHORTCUT_SECTIONS.map((section) => (
            <div key={section.title} className="shortcut-help__section">
              <h3 className="shortcut-help__section-title">{section.title}</h3>
              <ul className="shortcut-help__list">
                {section.shortcuts.map((shortcut) => (
                  <li key={shortcut.description} className="shortcut-help__item">
                    <span className="shortcut-help__keys">
                      {shortcut.keys.map((key, i) => (
                        <kbd key={i} className="shortcut-help__key">
                          {key}
                        </kbd>
                      ))}
                    </span>
                    <span className="shortcut-help__desc">{shortcut.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
