import type { PlaygroundMessage } from '../types'

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function estimateConversationTokens(messages: PlaygroundMessage[]): number {
  return messages.reduce((sum, msg) => sum + msg.tokenCount, 0)
}
