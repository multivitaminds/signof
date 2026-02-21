import './SmartComposeChip.css'

interface SmartComposeChipProps {
  suggestion: string
  onAccept: () => void
  onDismiss: () => void
}

export default function SmartComposeChip({
  suggestion,
  onAccept,
  onDismiss,
}: SmartComposeChipProps) {
  return (
    <div className="chorus-smart-chip" role="status" aria-label="Smart compose suggestion">
      <span className="chorus-smart-chip__text">{suggestion}</span>
      <span className="chorus-smart-chip__hint">
        <kbd className="chorus-smart-chip__key">Tab</kbd> to accept
        <span className="chorus-smart-chip__separator" aria-hidden="true">·</span>
        <kbd className="chorus-smart-chip__key">Esc</kbd> to dismiss
      </span>
      <button
        className="chorus-smart-chip__accept"
        onClick={onAccept}
        aria-label="Accept suggestion"
        type="button"
      >
        Accept
      </button>
      <button
        className="chorus-smart-chip__dismiss"
        onClick={onDismiss}
        aria-label="Dismiss suggestion"
        type="button"
      >
        ×
      </button>
    </div>
  )
}
