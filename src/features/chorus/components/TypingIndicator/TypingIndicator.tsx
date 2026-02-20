import { useMemo } from 'react'
import { useChorusPresenceStore } from '../../stores/useChorusPresenceStore'
import './TypingIndicator.css'

interface TypingIndicatorProps {
  conversationId: string
}

function formatTypingText(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return `${names[0]} is typing`
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing`
  return `${names.length} people are typing`
}

export default function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const allTypingUsers = useChorusPresenceStore((s) => s.typingUsers)

  const typingUsers = useMemo(
    () => allTypingUsers.filter((t) => t.conversationId === conversationId),
    [allTypingUsers, conversationId]
  )

  if (typingUsers.length === 0) return null

  const names = typingUsers.map((t) => t.userName)
  const text = formatTypingText(names)

  return (
    <div className="typing-indicator" role="status" aria-live="polite">
      <span className="typing-indicator__dots" aria-hidden="true">
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
      </span>
      <span className="typing-indicator__text">{text}</span>
    </div>
  )
}
