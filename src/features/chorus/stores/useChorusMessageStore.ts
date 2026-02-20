import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ChorusMessage,
  ChorusMessageType,
  ChorusSearchFilter,
  ConversationType,
  CrossModuleRef,
} from '@features/chorus/types'

interface SendMessageParams {
  conversationId: string
  conversationType: ConversationType
  senderId: string
  senderName: string
  senderAvatarUrl: string
  content: string
  messageType?: ChorusMessageType
  mentions?: string[]
  crossModuleRef?: CrossModuleRef
  threadId?: string
}

interface ReplyInThreadParams extends SendMessageParams {
  parentMessageId: string
}

interface ChorusMessageState {
  messages: Record<string, ChorusMessage[]>

  // Actions
  loadMessages: (conversationId: string, messages: ChorusMessage[]) => void
  sendMessage: (params: SendMessageParams) => void
  editMessage: (conversationId: string, messageId: string, newContent: string) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  replyInThread: (params: ReplyInThreadParams) => void
  addReaction: (
    conversationId: string,
    messageId: string,
    emoji: string,
    userId: string
  ) => void
  removeReaction: (
    conversationId: string,
    messageId: string,
    emoji: string,
    userId: string
  ) => void
  pinMessage: (conversationId: string, messageId: string) => void
  unpinMessage: (conversationId: string, messageId: string) => void
  bookmarkMessage: (conversationId: string, messageId: string) => void
  votePoll: (
    conversationId: string,
    messageId: string,
    optionId: string,
    userId: string
  ) => void

  // Computed
  getMessagesForConversation: (conversationId: string) => ChorusMessage[]
  getThreadMessages: (conversationId: string, threadId: string) => ChorusMessage[]
  getPinnedMessages: (conversationId: string) => ChorusMessage[]
  searchMessages: (query: string, filter?: ChorusSearchFilter) => ChorusMessage[]
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function createMessage(params: SendMessageParams): ChorusMessage {
  return {
    id: generateId(),
    conversationId: params.conversationId,
    conversationType: params.conversationType,
    senderId: params.senderId,
    senderName: params.senderName,
    senderAvatarUrl: params.senderAvatarUrl,
    content: params.content,
    messageType: params.messageType ?? 'text',
    timestamp: new Date().toISOString(),
    editedAt: null,
    isEdited: false,
    threadId: params.threadId ?? null,
    threadReplyCount: 0,
    threadParticipantIds: [],
    threadLastReplyAt: null,
    reactions: [],
    isPinned: false,
    isBookmarked: false,
    isDeleted: false,
    attachments: [],
    mentions: params.mentions ?? [],
    pollData: null,
    crossModuleRef: params.crossModuleRef ?? null,
  }
}

function updateMessagesInConversation(
  messages: Record<string, ChorusMessage[]>,
  conversationId: string,
  updater: (msgs: ChorusMessage[]) => ChorusMessage[]
): Record<string, ChorusMessage[]> {
  const existing = messages[conversationId] ?? []
  return {
    ...messages,
    [conversationId]: updater(existing),
  }
}

export const useChorusMessageStore = create<ChorusMessageState>()(
  persist(
    (set, get) => ({
      messages: {},

      loadMessages: (conversationId, msgs) =>
        set((state) => ({
          messages: { ...state.messages, [conversationId]: msgs },
        })),

      sendMessage: (params) =>
        set((state) => {
          const msg = createMessage(params)
          const existing = state.messages[params.conversationId] ?? []
          return {
            messages: {
              ...state.messages,
              [params.conversationId]: [...existing, msg],
            },
          }
        }),

      editMessage: (conversationId, messageId, newContent) =>
        set((state) => ({
          messages: updateMessagesInConversation(
            state.messages,
            conversationId,
            (msgs) =>
              msgs.map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      content: newContent,
                      isEdited: true,
                      editedAt: new Date().toISOString(),
                    }
                  : m
              )
          ),
        })),

      deleteMessage: (conversationId, messageId) =>
        set((state) => ({
          messages: updateMessagesInConversation(
            state.messages,
            conversationId,
            (msgs) =>
              msgs.map((m) =>
                m.id === messageId ? { ...m, isDeleted: true } : m
              )
          ),
        })),

      replyInThread: (params) =>
        set((state) => {
          const msg = createMessage({
            ...params,
            threadId: params.parentMessageId,
          })
          const existing = state.messages[params.conversationId] ?? []
          const now = new Date().toISOString()

          const updated = existing.map((m) => {
            if (m.id === params.parentMessageId) {
              const participantIds = m.threadParticipantIds.includes(params.senderId)
                ? m.threadParticipantIds
                : [...m.threadParticipantIds, params.senderId]
              return {
                ...m,
                threadReplyCount: m.threadReplyCount + 1,
                threadParticipantIds: participantIds,
                threadLastReplyAt: now,
              }
            }
            return m
          })

          return {
            messages: {
              ...state.messages,
              [params.conversationId]: [...updated, msg],
            },
          }
        }),

      addReaction: (conversationId, messageId, emoji, userId) =>
        set((state) => ({
          messages: updateMessagesInConversation(
            state.messages,
            conversationId,
            (msgs) =>
              msgs.map((m) => {
                if (m.id !== messageId) return m
                const existingReaction = m.reactions.find((r) => r.emoji === emoji)
                if (existingReaction) {
                  if (existingReaction.userIds.includes(userId)) return m
                  return {
                    ...m,
                    reactions: m.reactions.map((r) =>
                      r.emoji === emoji
                        ? {
                            ...r,
                            userIds: [...r.userIds, userId],
                            count: r.count + 1,
                          }
                        : r
                    ),
                  }
                }
                return {
                  ...m,
                  reactions: [
                    ...m.reactions,
                    { emoji, userIds: [userId], count: 1 },
                  ],
                }
              })
          ),
        })),

      removeReaction: (conversationId, messageId, emoji, userId) =>
        set((state) => ({
          messages: updateMessagesInConversation(
            state.messages,
            conversationId,
            (msgs) =>
              msgs.map((m) => {
                if (m.id !== messageId) return m
                const updatedReactions = m.reactions
                  .map((r) => {
                    if (r.emoji !== emoji) return r
                    const filteredUserIds = r.userIds.filter((id) => id !== userId)
                    return {
                      ...r,
                      userIds: filteredUserIds,
                      count: filteredUserIds.length,
                    }
                  })
                  .filter((r) => r.count > 0)
                return { ...m, reactions: updatedReactions }
              })
          ),
        })),

      pinMessage: (conversationId, messageId) =>
        set((state) => ({
          messages: updateMessagesInConversation(
            state.messages,
            conversationId,
            (msgs) =>
              msgs.map((m) =>
                m.id === messageId ? { ...m, isPinned: true } : m
              )
          ),
        })),

      unpinMessage: (conversationId, messageId) =>
        set((state) => ({
          messages: updateMessagesInConversation(
            state.messages,
            conversationId,
            (msgs) =>
              msgs.map((m) =>
                m.id === messageId ? { ...m, isPinned: false } : m
              )
          ),
        })),

      bookmarkMessage: (conversationId, messageId) =>
        set((state) => ({
          messages: updateMessagesInConversation(
            state.messages,
            conversationId,
            (msgs) =>
              msgs.map((m) =>
                m.id === messageId ? { ...m, isBookmarked: true } : m
              )
          ),
        })),

      votePoll: (conversationId, messageId, optionId, userId) =>
        set((state) => ({
          messages: updateMessagesInConversation(
            state.messages,
            conversationId,
            (msgs) =>
              msgs.map((m) => {
                if (m.id !== messageId || !m.pollData) return m
                return {
                  ...m,
                  pollData: {
                    ...m.pollData,
                    options: m.pollData.options.map((opt) =>
                      opt.id === optionId && !opt.voterIds.includes(userId)
                        ? { ...opt, voterIds: [...opt.voterIds, userId] }
                        : opt
                    ),
                  },
                }
              })
          ),
        })),

      // Computed
      getMessagesForConversation: (conversationId) => {
        return get().messages[conversationId] ?? []
      },

      getThreadMessages: (conversationId, threadId) => {
        const msgs = get().messages[conversationId] ?? []
        return msgs.filter((m) => m.threadId === threadId)
      },

      getPinnedMessages: (conversationId) => {
        const msgs = get().messages[conversationId] ?? []
        return msgs.filter((m) => m.isPinned)
      },

      searchMessages: (query, filter) => {
        const allMessages = get().messages
        const lowerQuery = query.toLowerCase()
        const results: ChorusMessage[] = []

        for (const msgs of Object.values(allMessages)) {
          if (!msgs) continue
          for (const msg of msgs) {
            if (msg.isDeleted) continue
            if (!msg.content.toLowerCase().includes(lowerQuery)) continue

            if (filter?.from && msg.senderId !== filter.from) continue
            if (filter?.in && msg.conversationId !== filter.in) continue
            if (filter?.before && msg.timestamp >= filter.before) continue
            if (filter?.after && msg.timestamp <= filter.after) continue
            if (filter?.has) {
              if (filter.has === 'reaction' && msg.reactions.length === 0) continue
              if (filter.has === 'pin' && !msg.isPinned) continue
              if (filter.has === 'file' && msg.attachments.length === 0) continue
            }

            results.push(msg)
          }
        }

        return results
      },
    }),
    {
      name: 'orchestree-chorus-messages',
    }
  )
)
