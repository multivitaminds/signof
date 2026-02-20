import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ChorusChannel,
  ChorusChannelType,
  ChorusDirectMessage,
  ChorusPresenceStatus,
  ChorusUser,
  ConversationType,
} from '@features/chorus/types'

interface ChorusState {
  // Data
  channels: ChorusChannel[]
  directMessages: ChorusDirectMessage[]
  users: ChorusUser[]
  currentUserId: string

  // Navigation
  activeConversationId: string | null
  activeConversationType: ConversationType | null
  activeThreadId: string | null
  threadPanelOpen: boolean
  membersPanelOpen: boolean

  // Actions — Data loading
  initializeData: (
    channels: ChorusChannel[],
    dms: ChorusDirectMessage[],
    users: ChorusUser[]
  ) => void

  // Actions — Channels
  createChannel: (
    name: string,
    description: string,
    type: ChorusChannelType,
    createdBy: string
  ) => void
  archiveChannel: (id: string) => void
  joinChannel: (channelId: string, userId: string) => void
  leaveChannel: (channelId: string, userId: string) => void
  starChannel: (channelId: string) => void
  unstarChannel: (channelId: string) => void
  muteChannel: (channelId: string) => void
  unmuteChannel: (channelId: string) => void
  setChannelTopic: (channelId: string, topic: string) => void

  // Actions — DMs
  createDM: (participantIds: string[], name: string) => void
  starDM: (dmId: string) => void
  unstarDM: (dmId: string) => void

  // Actions — Navigation
  setActiveConversation: (id: string, type: ConversationType) => void
  openThread: (threadId: string) => void
  closeThread: () => void
  toggleMembersPanel: () => void

  // Actions — Users
  setUserPresence: (userId: string, presence: ChorusPresenceStatus) => void
  setUserCustomStatus: (userId: string, status: string, emoji: string) => void

  // Actions — Unread
  clearUnreadCount: (conversationId: string) => void
  incrementUnreadCount: (conversationId: string) => void
  updateLastMessageAt: (conversationId: string, timestamp: string) => void

  // Computed
  getChannel: (id: string) => ChorusChannel | undefined
  getDM: (id: string) => ChorusDirectMessage | undefined
  getUser: (id: string) => ChorusUser | undefined
  getCurrentUser: () => ChorusUser | undefined
  getStarredItems: () => (ChorusChannel | ChorusDirectMessage)[]
  getTotalUnreadCount: () => number
  getTotalMentionCount: () => number
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const useChorusStore = create<ChorusState>()(
  persist(
    (set, get) => ({
      // Data
      channels: [],
      directMessages: [],
      users: [],
      currentUserId: 'user-you',

      // Navigation
      activeConversationId: null,
      activeConversationType: null,
      activeThreadId: null,
      threadPanelOpen: false,
      membersPanelOpen: false,

      // Actions — Data loading
      initializeData: (channels, dms, users) =>
        set({ channels, directMessages: dms, users }),

      // Actions — Channels
      createChannel: (name, description, type, createdBy) =>
        set((state) => ({
          channels: [
            ...state.channels,
            {
              id: generateId(),
              name,
              displayName: name,
              type,
              topic: '',
              description,
              createdBy,
              createdAt: new Date().toISOString(),
              memberIds: [createdBy],
              pinnedMessageIds: [],
              isStarred: false,
              isMuted: false,
              lastMessageAt: new Date().toISOString(),
              unreadCount: 0,
              mentionCount: 0,
            },
          ],
        })),

      archiveChannel: (id) =>
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === id ? { ...ch, type: 'archived' as const } : ch
          ),
        })),

      joinChannel: (channelId, userId) =>
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === channelId && !ch.memberIds.includes(userId)
              ? { ...ch, memberIds: [...ch.memberIds, userId] }
              : ch
          ),
        })),

      leaveChannel: (channelId, userId) =>
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === channelId
              ? { ...ch, memberIds: ch.memberIds.filter((id) => id !== userId) }
              : ch
          ),
        })),

      starChannel: (channelId) =>
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === channelId ? { ...ch, isStarred: true } : ch
          ),
        })),

      unstarChannel: (channelId) =>
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === channelId ? { ...ch, isStarred: false } : ch
          ),
        })),

      muteChannel: (channelId) =>
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === channelId ? { ...ch, isMuted: true } : ch
          ),
        })),

      unmuteChannel: (channelId) =>
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === channelId ? { ...ch, isMuted: false } : ch
          ),
        })),

      setChannelTopic: (channelId, topic) =>
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === channelId ? { ...ch, topic } : ch
          ),
        })),

      // Actions — DMs
      createDM: (participantIds, name) =>
        set((state) => ({
          directMessages: [
            ...state.directMessages,
            {
              id: generateId(),
              type: participantIds.length > 2 ? ('group_dm' as const) : ('dm' as const),
              participantIds,
              name,
              lastMessageAt: new Date().toISOString(),
              unreadCount: 0,
              isStarred: false,
              isMuted: false,
            },
          ],
        })),

      starDM: (dmId) =>
        set((state) => ({
          directMessages: state.directMessages.map((dm) =>
            dm.id === dmId ? { ...dm, isStarred: true } : dm
          ),
        })),

      unstarDM: (dmId) =>
        set((state) => ({
          directMessages: state.directMessages.map((dm) =>
            dm.id === dmId ? { ...dm, isStarred: false } : dm
          ),
        })),

      // Actions — Navigation
      setActiveConversation: (id, type) =>
        set({
          activeConversationId: id,
          activeConversationType: type,
        }),

      openThread: (threadId) =>
        set({ activeThreadId: threadId, threadPanelOpen: true }),

      closeThread: () =>
        set({ activeThreadId: null, threadPanelOpen: false }),

      toggleMembersPanel: () =>
        set((state) => ({ membersPanelOpen: !state.membersPanelOpen })),

      // Actions — Users
      setUserPresence: (userId, presence) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, presence } : u
          ),
        })),

      setUserCustomStatus: (userId, status, emoji) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId
              ? { ...u, customStatus: status, customStatusEmoji: emoji }
              : u
          ),
        })),

      // Actions — Unread
      clearUnreadCount: (conversationId) =>
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === conversationId ? { ...ch, unreadCount: 0, mentionCount: 0 } : ch
          ),
          directMessages: state.directMessages.map((dm) =>
            dm.id === conversationId ? { ...dm, unreadCount: 0 } : dm
          ),
        })),

      incrementUnreadCount: (conversationId) =>
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === conversationId ? { ...ch, unreadCount: ch.unreadCount + 1 } : ch
          ),
          directMessages: state.directMessages.map((dm) =>
            dm.id === conversationId ? { ...dm, unreadCount: dm.unreadCount + 1 } : dm
          ),
        })),

      updateLastMessageAt: (conversationId, timestamp) =>
        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === conversationId ? { ...ch, lastMessageAt: timestamp } : ch
          ),
          directMessages: state.directMessages.map((dm) =>
            dm.id === conversationId ? { ...dm, lastMessageAt: timestamp } : dm
          ),
        })),

      // Computed
      getChannel: (id) => get().channels.find((ch) => ch.id === id),

      getDM: (id) => get().directMessages.find((dm) => dm.id === id),

      getUser: (id) => get().users.find((u) => u.id === id),

      getCurrentUser: () => {
        const state = get()
        return state.users.find((u) => u.id === state.currentUserId)
      },

      getStarredItems: () => {
        const state = get()
        const starredChannels = state.channels.filter((ch) => ch.isStarred)
        const starredDMs = state.directMessages.filter((dm) => dm.isStarred)
        return [...starredChannels, ...starredDMs]
      },

      getTotalUnreadCount: () => {
        const state = get()
        const channelUnread = state.channels.reduce(
          (sum, ch) => sum + ch.unreadCount,
          0
        )
        const dmUnread = state.directMessages.reduce(
          (sum, dm) => sum + dm.unreadCount,
          0
        )
        return channelUnread + dmUnread
      },

      getTotalMentionCount: () => {
        const state = get()
        return state.channels.reduce((sum, ch) => sum + ch.mentionCount, 0)
      },
    }),
    {
      name: 'orchestree-chorus-storage',
      partialize: (state) => ({
        activeConversationId: state.activeConversationId,
        channels: state.channels.map((ch) => ({
          id: ch.id,
          isStarred: ch.isStarred,
          isMuted: ch.isMuted,
        })),
        directMessages: state.directMessages.map((dm) => ({
          id: dm.id,
          isStarred: dm.isStarred,
          isMuted: dm.isMuted,
        })),
      }),
      merge: (persisted, current) => {
        const p = persisted as {
          activeConversationId?: string | null
          channels?: { id: string; isStarred: boolean; isMuted: boolean }[]
          directMessages?: { id: string; isStarred: boolean; isMuted: boolean }[]
        } | undefined

        if (!p) return current

        const merged = { ...current }

        if (p.activeConversationId !== undefined) {
          merged.activeConversationId = p.activeConversationId
        }

        if (p.channels) {
          const starredMap = new Map(
            p.channels.map((ch) => [ch.id, { isStarred: ch.isStarred, isMuted: ch.isMuted }])
          )
          merged.channels = merged.channels.map((ch) => {
            const saved = starredMap.get(ch.id)
            return saved ? { ...ch, isStarred: saved.isStarred, isMuted: saved.isMuted } : ch
          })
        }

        if (p.directMessages) {
          const dmMap = new Map(
            p.directMessages.map((dm) => [dm.id, { isStarred: dm.isStarred, isMuted: dm.isMuted }])
          )
          merged.directMessages = merged.directMessages.map((dm) => {
            const saved = dmMap.get(dm.id)
            return saved ? { ...dm, isStarred: saved.isStarred, isMuted: saved.isMuted } : dm
          })
        }

        return merged
      },
    }
  )
)
