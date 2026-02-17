import type { BrainMessage, Channel, Session } from '../types'

/**
 * Route a message to an agent. Resolution order:
 * 1. Session already has an assigned agent → return that agentId
 * 2. Channel has an assigned agent → return that agentId
 * 3. No agent found → return null (manual routing required)
 */
export function routeMessage(
  message: BrainMessage,
  channels: Channel[],
  sessions: Session[]
): string | null {
  // 1. Check if the message's session already has an agent assigned
  const session = sessions.find(s => s.id === message.sessionId)
  if (session?.agentId) {
    return session.agentId
  }

  // 2. Check if the channel has a default agent assigned
  const channel = channels.find(c => c.id === message.channelId)
  if (channel?.assignedAgentId) {
    return channel.assignedAgentId
  }

  // 3. No agent found — requires manual routing
  return null
}

/**
 * Find the channel associated with a given session.
 */
export function getChannelForSession(
  sessionId: string,
  channels: Channel[],
  sessions: Session[]
): Channel | null {
  const session = sessions.find(s => s.id === sessionId)
  if (!session) {
    return null
  }

  const channel = channels.find(c => c.id === session.channelId)
  return channel ?? null
}
