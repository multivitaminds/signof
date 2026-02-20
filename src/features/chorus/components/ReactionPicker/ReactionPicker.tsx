import { useCallback, useRef, useEffect } from 'react'
import './ReactionPicker.css'

const POPULAR_EMOJIS = [
  '\uD83D\uDC4D', '\uD83D\uDC4E', '\u2764\uFE0F', '\uD83D\uDE02', '\uD83D\uDE2E',
  '\uD83D\uDE22', '\uD83D\uDE21', '\uD83C\uDF89', '\uD83D\uDE80', '\uD83D\uDD25',
  '\uD83D\uDC40', '\uD83D\uDE4F', '\uD83D\uDCAF', '\u2705', '\u274C',
  '\uD83D\uDCA1', '\uD83D\uDCDA', '\uD83C\uDFC6', '\uD83C\uDF1F', '\uD83D\uDC9C',
  '\uD83D\uDE0E', '\uD83E\uDD14', '\uD83D\uDCAA', '\uD83C\uDF5C', '\u2615',
  '\uD83C\uDF1E', '\uD83C\uDF08', '\uD83D\uDCE3', '\uD83D\uDD14', '\uD83C\uDFA8',
  '\uD83D\uDCDD', '\uD83E\uDD16',
]

interface ReactionPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (emoji: string) => void
}

export default function ReactionPicker({ isOpen, onClose, onSelect }: ReactionPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSelect = useCallback(
    (emoji: string) => {
      onSelect(emoji)
      onClose()
    },
    [onSelect, onClose]
  )

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className="reaction-picker"
      role="dialog"
      aria-label="Pick a reaction"
    >
      <div className="reaction-picker__grid">
        {POPULAR_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            className="reaction-picker__emoji"
            onClick={() => handleSelect(emoji)}
            aria-label={`React with ${emoji}`}
            type="button"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
