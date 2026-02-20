import type { ChorusMessage, MessageGroup } from '../types'

const GROUP_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Determines whether two dates fall on different calendar days.
 */
function isDifferentDay(a: string, b: string): boolean {
  const dateA = new Date(a)
  const dateB = new Date(b)
  return (
    dateA.getUTCFullYear() !== dateB.getUTCFullYear() ||
    dateA.getUTCMonth() !== dateB.getUTCMonth() ||
    dateA.getUTCDate() !== dateB.getUTCDate()
  )
}

/**
 * Groups consecutive messages from the same sender within a 5-minute window.
 *
 * Messages are expected to be sorted chronologically (oldest first).
 * A new group starts when:
 * - The sender changes
 * - More than 5 minutes pass between consecutive messages
 * - The message is a system message
 * - A date boundary is crossed
 */
export function groupMessages(messages: ChorusMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = []

  for (const msg of messages) {
    if (msg.isDeleted) continue

    const lastGroup = groups[groups.length - 1]
    const lastMsg = lastGroup?.messages[lastGroup.messages.length - 1]

    const lastGroupIsSystem = lastMsg?.messageType === 'system'

    const shouldStartNewGroup =
      !lastGroup ||
      lastGroup.senderId !== msg.senderId ||
      msg.messageType === 'system' ||
      lastGroupIsSystem ||
      (lastMsg && Math.abs(new Date(msg.timestamp).getTime() - new Date(lastMsg.timestamp).getTime()) > GROUP_THRESHOLD_MS) ||
      (lastMsg && isDifferentDay(lastMsg.timestamp, msg.timestamp))

    if (shouldStartNewGroup) {
      groups.push({
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderAvatarUrl: msg.senderAvatarUrl,
        messages: [msg],
        timestamp: msg.timestamp,
      })
    } else {
      lastGroup.messages.push(msg)
    }
  }

  return groups
}

/**
 * Extracts unique date strings (YYYY-MM-DD) from an array of messages,
 * in the order they first appear. Used to insert date dividers.
 */
export function getDateBoundaries(messages: ChorusMessage[]): string[] {
  const seen = new Set<string>()
  const dates: string[] = []

  for (const msg of messages) {
    const day = new Date(msg.timestamp).toISOString().slice(0, 10)
    if (!seen.has(day)) {
      seen.add(day)
      dates.push(msg.timestamp)
    }
  }

  return dates
}
