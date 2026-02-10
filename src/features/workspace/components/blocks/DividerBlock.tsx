import { useCallback } from 'react'

interface DividerBlockProps {
  onBackspace: () => void
  autoFocus?: boolean
}

export default function DividerBlock({ onBackspace, autoFocus }: DividerBlockProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        onBackspace()
      }
    },
    [onBackspace]
  )

  return (
    <div
      className="block-divider"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="separator"
      aria-label="Divider"
      autoFocus={autoFocus}
    >
      <hr className="block-divider__line" />
    </div>
  )
}
