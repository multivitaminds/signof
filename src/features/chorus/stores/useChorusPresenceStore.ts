import { create } from 'zustand'
import type { TypingUser } from '@features/chorus/types'

interface ChorusPresenceState {
  typingUsers: TypingUser[]

  startTyping: (userId: string, userName: string, conversationId: string) => void
  stopTyping: (userId: string, conversationId: string) => void
  getTypingUsersForConversation: (conversationId: string) => TypingUser[]
  clearStaleTyping: () => void
}

export const useChorusPresenceStore = create<ChorusPresenceState>()(
  (set, get) => ({
    typingUsers: [],

    startTyping: (userId, userName, conversationId) =>
      set((state) => {
        const alreadyTyping = state.typingUsers.some(
          (t) => t.userId === userId && t.conversationId === conversationId
        )
        if (alreadyTyping) {
          return {
            typingUsers: state.typingUsers.map((t) =>
              t.userId === userId && t.conversationId === conversationId
                ? { ...t, startedAt: Date.now() }
                : t
            ),
          }
        }
        return {
          typingUsers: [
            ...state.typingUsers,
            { userId, userName, conversationId, startedAt: Date.now() },
          ],
        }
      }),

    stopTyping: (userId, conversationId) =>
      set((state) => ({
        typingUsers: state.typingUsers.filter(
          (t) => !(t.userId === userId && t.conversationId === conversationId)
        ),
      })),

    getTypingUsersForConversation: (conversationId) => {
      return get().typingUsers.filter((t) => t.conversationId === conversationId)
    },

    clearStaleTyping: () =>
      set((state) => {
        const cutoff = Date.now() - 10_000
        return {
          typingUsers: state.typingUsers.filter((t) => t.startedAt > cutoff),
        }
      }),
  })
)
