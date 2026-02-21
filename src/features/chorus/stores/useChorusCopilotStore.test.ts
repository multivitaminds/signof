import { act } from 'react'
import { useChorusCopilotStore } from './useChorusCopilotStore'

// ─── Mock copilotLLM (always returns fallback) ──────────────────────

vi.mock('../../ai/lib/copilotLLM', () => ({
  copilotChat: (_mod: string, _msg: string, _ctx: string, fallback: () => string) =>
    Promise.resolve(fallback()),
  copilotAnalysis: (_mod: string, _type: string, _ctx: string, fallback: () => { summary: string; items: string[] }) =>
    Promise.resolve(fallback()),
}))

// ─── Mock Chorus Stores ─────────────────────────────────────────────

vi.mock('./useChorusStore', () => ({
  useChorusStore: {
    getState: () => ({
      channels: [
        {
          id: 'ch-general', name: 'general', displayName: 'General', type: 'public',
          topic: 'General discussion', description: 'Main channel', createdBy: 'user-1',
          createdAt: '2026-01-01T00:00:00Z', memberIds: ['user-1', 'user-2', 'user-3'],
          pinnedMessageIds: [], isStarred: false, isMuted: false,
          lastMessageAt: '2026-02-20T10:00:00Z', unreadCount: 5, mentionCount: 2,
        },
        {
          id: 'ch-random', name: 'random', displayName: 'Random', type: 'public',
          topic: 'Off-topic', description: 'Fun stuff', createdBy: 'user-1',
          createdAt: '2026-01-01T00:00:00Z', memberIds: ['user-1', 'user-2'],
          pinnedMessageIds: [], isStarred: false, isMuted: false,
          lastMessageAt: '2026-02-20T09:00:00Z', unreadCount: 3, mentionCount: 0,
        },
        {
          id: 'ch-private', name: 'secret-project', displayName: 'Secret Project', type: 'private',
          topic: 'Confidential', description: 'Private channel', createdBy: 'user-1',
          createdAt: '2026-01-05T00:00:00Z', memberIds: ['user-1'],
          pinnedMessageIds: [], isStarred: false, isMuted: false,
          lastMessageAt: '2026-02-19T15:00:00Z', unreadCount: 0, mentionCount: 0,
        },
      ],
      users: [
        { id: 'user-1', name: 'Alice', displayName: 'Alice Smith', email: 'alice@example.com', avatarUrl: '', presence: 'online', customStatus: '', customStatusEmoji: '' },
        { id: 'user-2', name: 'Bob', displayName: 'Bob Jones', email: 'bob@example.com', avatarUrl: '', presence: 'away', customStatus: '', customStatusEmoji: '' },
      ],
      getTotalUnreadCount: () => 8,
      getTotalMentionCount: () => 2,
    }),
  },
}))

vi.mock('./useChorusMessageStore', () => ({
  useChorusMessageStore: {
    getState: () => ({
      messages: {
        'ch-general': [
          {
            id: 'msg-1', conversationId: 'ch-general', conversationType: 'channel',
            senderId: 'user-1', senderName: 'Alice', senderAvatarUrl: '',
            content: 'Hello everyone!', messageType: 'text',
            timestamp: '2026-02-20T09:00:00Z', editedAt: null, isEdited: false,
            threadId: null, threadReplyCount: 2, threadParticipantIds: ['user-1', 'user-2'],
            threadLastReplyAt: '2026-02-20T09:30:00Z',
            reactions: [{ emoji: '👍', userIds: ['user-2'], count: 1 }],
            isPinned: true, isBookmarked: false, isDeleted: false,
            attachments: [], mentions: [], pollData: null, crossModuleRef: null,
          },
          {
            id: 'msg-2', conversationId: 'ch-general', conversationType: 'channel',
            senderId: 'user-2', senderName: 'Bob', senderAvatarUrl: '',
            content: 'What is the deadline?', messageType: 'text',
            timestamp: '2026-02-20T09:15:00Z', editedAt: null, isEdited: false,
            threadId: null, threadReplyCount: 0, threadParticipantIds: [],
            threadLastReplyAt: null,
            reactions: [], isPinned: false, isBookmarked: false, isDeleted: false,
            attachments: [], mentions: [], pollData: null, crossModuleRef: null,
          },
          {
            id: 'msg-3', conversationId: 'ch-general', conversationType: 'channel',
            senderId: 'user-1', senderName: 'Alice', senderAvatarUrl: '',
            content: 'Friday is the deadline', messageType: 'text',
            timestamp: '2026-02-20T09:20:00Z', editedAt: null, isEdited: false,
            threadId: 'msg-1', threadReplyCount: 0, threadParticipantIds: [],
            threadLastReplyAt: null,
            reactions: [], isPinned: false, isBookmarked: false, isDeleted: false,
            attachments: [], mentions: [], pollData: null, crossModuleRef: null,
          },
        ],
        'ch-random': [
          {
            id: 'msg-4', conversationId: 'ch-random', conversationType: 'channel',
            senderId: 'user-2', senderName: 'Bob', senderAvatarUrl: '',
            content: 'Check this out!', messageType: 'text',
            timestamp: '2026-02-20T08:00:00Z', editedAt: null, isEdited: false,
            threadId: null, threadReplyCount: 0, threadParticipantIds: [],
            threadLastReplyAt: null,
            reactions: [], isPinned: false, isBookmarked: false, isDeleted: false,
            attachments: [], mentions: [], pollData: null, crossModuleRef: null,
          },
        ],
      },
    }),
  },
}))

// ─── Store Reset ────────────────────────────────────────────────────

function resetStore() {
  useChorusCopilotStore.setState({
    isOpen: false,
    messages: [],
    isTyping: false,
    suggestions: [],
    isAnalyzing: false,
    lastAnalysis: null,
  })
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('useChorusCopilotStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial state', () => {
    it('starts with panel closed, no messages, and no suggestions', () => {
      const state = useChorusCopilotStore.getState()
      expect(state.isOpen).toBe(false)
      expect(state.messages).toHaveLength(0)
      expect(state.suggestions).toHaveLength(0)
      expect(state.isTyping).toBe(false)
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).toBeNull()
    })
  })

  describe('Panel controls', () => {
    it('openPanel sets isOpen to true', () => {
      act(() => {
        useChorusCopilotStore.getState().openPanel()
      })
      expect(useChorusCopilotStore.getState().isOpen).toBe(true)
    })

    it('closePanel sets isOpen to false', () => {
      useChorusCopilotStore.setState({ isOpen: true })
      act(() => {
        useChorusCopilotStore.getState().closePanel()
      })
      expect(useChorusCopilotStore.getState().isOpen).toBe(false)
    })

    it('togglePanel flips isOpen', () => {
      expect(useChorusCopilotStore.getState().isOpen).toBe(false)

      act(() => {
        useChorusCopilotStore.getState().togglePanel()
      })
      expect(useChorusCopilotStore.getState().isOpen).toBe(true)

      act(() => {
        useChorusCopilotStore.getState().togglePanel()
      })
      expect(useChorusCopilotStore.getState().isOpen).toBe(false)
    })
  })

  describe('sendMessage', () => {
    it('adds user message and generates assistant response', async () => {
      act(() => {
        useChorusCopilotStore.getState().sendMessage('Tell me about my channels')
      })

      const stateAfterSend = useChorusCopilotStore.getState()
      expect(stateAfterSend.messages).toHaveLength(1)
      expect(stateAfterSend.messages[0]!.role).toBe('user')
      expect(stateAfterSend.messages[0]!.content).toBe('Tell me about my channels')
      expect(stateAfterSend.isTyping).toBe(true)

      await act(async () => {})

      const stateAfterResponse = useChorusCopilotStore.getState()
      expect(stateAfterResponse.messages).toHaveLength(2)
      expect(stateAfterResponse.messages[1]!.role).toBe('assistant')
      expect(stateAfterResponse.isTyping).toBe(false)
      // Should contain channel-related content
      expect(stateAfterResponse.messages[1]!.content).toContain('channel')
    })

    it('includes context in the user message when provided', () => {
      act(() => {
        useChorusCopilotStore.getState().sendMessage('Help me here', 'channel_list')
      })

      expect(useChorusCopilotStore.getState().messages[0]!.context).toBe('channel_list')
    })
  })

  describe('clearMessages', () => {
    it('empties the messages array and resets isTyping', () => {
      useChorusCopilotStore.setState({
        messages: [
          { id: '1', role: 'user', content: 'Hello', timestamp: '2026-01-01T00:00:00Z' },
          { id: '2', role: 'assistant', content: 'Hi!', timestamp: '2026-01-01T00:00:01Z' },
        ],
        isTyping: true,
      })

      act(() => {
        useChorusCopilotStore.getState().clearMessages()
      })

      const state = useChorusCopilotStore.getState()
      expect(state.messages).toHaveLength(0)
      expect(state.isTyping).toBe(false)
    })
  })

  describe('Suggestions', () => {
    it('addSuggestion adds a suggestion with generated id and dismissed=false', () => {
      act(() => {
        useChorusCopilotStore.getState().addSuggestion({
          type: 'tip',
          title: 'Test Tip',
          description: 'A helpful tip',
          sectionId: 'channel_list',
        })
      })

      const suggestions = useChorusCopilotStore.getState().suggestions
      expect(suggestions).toHaveLength(1)
      expect(suggestions[0]!.type).toBe('tip')
      expect(suggestions[0]!.title).toBe('Test Tip')
      expect(suggestions[0]!.dismissed).toBe(false)
      expect(suggestions[0]!.id).toBeTruthy()
    })

    it('dismissSuggestion marks the specified suggestion as dismissed', () => {
      useChorusCopilotStore.setState({
        suggestions: [
          { id: 'sug1', type: 'tip', title: 'Tip', description: 'A tip', dismissed: false },
          { id: 'sug2', type: 'warning', title: 'Warning', description: 'A warning', dismissed: false },
        ],
      })

      act(() => {
        useChorusCopilotStore.getState().dismissSuggestion('sug1')
      })

      const suggestions = useChorusCopilotStore.getState().suggestions
      expect(suggestions[0]!.dismissed).toBe(true)
      expect(suggestions[1]!.dismissed).toBe(false)
    })

    it('getSuggestionsForSection returns only non-dismissed suggestions for the section', () => {
      useChorusCopilotStore.setState({
        suggestions: [
          { id: 's1', type: 'tip', title: 'Tip 1', description: 'Channel tip', dismissed: false, sectionId: 'channel_list' },
          { id: 's2', type: 'warning', title: 'Warning 1', description: 'Dismissed', dismissed: true, sectionId: 'channel_list' },
          { id: 's3', type: 'review', title: 'Review 1', description: 'DM review', dismissed: false, sectionId: 'dm_list' },
          { id: 's4', type: 'tip', title: 'Tip 2', description: 'Another channel tip', dismissed: false, sectionId: 'channel_list' },
        ],
      })

      const channelSuggestions = useChorusCopilotStore.getState().getSuggestionsForSection('channel_list')
      expect(channelSuggestions).toHaveLength(2)
      expect(channelSuggestions[0]!.id).toBe('s1')
      expect(channelSuggestions[1]!.id).toBe('s4')

      const dmSuggestions = useChorusCopilotStore.getState().getSuggestionsForSection('dm_list')
      expect(dmSuggestions).toHaveLength(1)
      expect(dmSuggestions[0]!.id).toBe('s3')

      const emptySuggestions = useChorusCopilotStore.getState().getSuggestionsForSection('thread_view')
      expect(emptySuggestions).toHaveLength(0)
    })

    it('clearSuggestions removes all suggestions', () => {
      useChorusCopilotStore.setState({
        suggestions: [
          { id: 's1', type: 'tip', title: 'Tip', description: 'A tip', dismissed: false },
          { id: 's2', type: 'warning', title: 'Warning', description: 'A warning', dismissed: false },
        ],
      })

      act(() => {
        useChorusCopilotStore.getState().clearSuggestions()
      })

      expect(useChorusCopilotStore.getState().suggestions).toHaveLength(0)
    })
  })

  describe('summarizeChannel', () => {
    it('produces lastAnalysis with channel_summary type for channel with messages', async () => {
      act(() => {
        useChorusCopilotStore.getState().summarizeChannel('ch-general')
      })

      expect(useChorusCopilotStore.getState().isAnalyzing).toBe(true)
      expect(useChorusCopilotStore.getState().lastAnalysis).toBeNull()

      await act(async () => {})

      const state = useChorusCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('channel_summary')
      expect(state.lastAnalysis!.summary).toContain('3 message(s)')
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
      expect(state.lastAnalysis!.timestamp).toBeTruthy()
    })

    it('handles empty channel gracefully', async () => {
      act(() => {
        useChorusCopilotStore.getState().summarizeChannel('ch-empty')
      })

      await act(async () => {})

      const state = useChorusCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.summary).toContain('No messages')
      expect(state.lastAnalysis!.items).toContain('No messages found')
    })
  })

  describe('summarizeThread', () => {
    it('produces lastAnalysis with thread_summary type for thread with replies', async () => {
      act(() => {
        useChorusCopilotStore.getState().summarizeThread('ch-general', 'msg-1')
      })

      expect(useChorusCopilotStore.getState().isAnalyzing).toBe(true)

      await act(async () => {})

      const state = useChorusCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('thread_summary')
      expect(state.lastAnalysis!.summary).toContain('reply')
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
    })

    it('handles missing parent message', async () => {
      act(() => {
        useChorusCopilotStore.getState().summarizeThread('ch-general', 'msg-nonexistent')
      })

      await act(async () => {})

      const state = useChorusCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.summary).toBe('Thread not found.')
      expect(state.lastAnalysis!.items).toContain('Parent message not found')
    })
  })

  describe('analyzeActivity', () => {
    it('produces lastAnalysis with activity type for channel with messages', async () => {
      act(() => {
        useChorusCopilotStore.getState().analyzeActivity('ch-general')
      })

      expect(useChorusCopilotStore.getState().isAnalyzing).toBe(true)

      await act(async () => {})

      const state = useChorusCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.type).toBe('activity')
      expect(state.lastAnalysis!.summary).toContain('3 message(s)')
      expect(state.lastAnalysis!.items.length).toBeGreaterThan(0)
    })

    it('handles empty channel gracefully', async () => {
      act(() => {
        useChorusCopilotStore.getState().analyzeActivity('ch-empty')
      })

      await act(async () => {})

      const state = useChorusCopilotStore.getState()
      expect(state.isAnalyzing).toBe(false)
      expect(state.lastAnalysis).not.toBeNull()
      expect(state.lastAnalysis!.summary).toContain('No activity')
      expect(state.lastAnalysis!.items).toContain('No messages found')
    })
  })

  describe('generateResponse keyword routing', () => {
    it('responds to summary/summarize keyword', async () => {
      act(() => {
        useChorusCopilotStore.getState().sendMessage('Can you summarize the channels?')
      })

      await act(async () => {})

      const response = useChorusCopilotStore.getState().messages[1]!.content
      expect(response).toContain('channel(s)')
      expect(response).toContain('total message(s)')
    })

    it('responds to thread keyword', async () => {
      act(() => {
        useChorusCopilotStore.getState().sendMessage('Show me active threads')
      })

      await act(async () => {})

      const response = useChorusCopilotStore.getState().messages[1]!.content
      expect(response).toContain('thread(s)')
    })

    it('responds to activity keyword', async () => {
      act(() => {
        useChorusCopilotStore.getState().sendMessage('Show channel activity')
      })

      await act(async () => {})

      const response = useChorusCopilotStore.getState().messages[1]!.content
      expect(response).toContain('Most active channels')
    })

    it('responds to unread keyword', async () => {
      act(() => {
        useChorusCopilotStore.getState().sendMessage('How many unread messages do I have?')
      })

      await act(async () => {})

      const response = useChorusCopilotStore.getState().messages[1]!.content
      expect(response).toContain('8 unread message(s)')
      expect(response).toContain('2 mention(s)')
    })

    it('responds to search/find keyword', async () => {
      act(() => {
        useChorusCopilotStore.getState().sendMessage('Can you find something?')
      })

      await act(async () => {})

      const response = useChorusCopilotStore.getState().messages[1]!.content
      expect(response).toContain('search messages')
    })

    it('responds to mention keyword', async () => {
      act(() => {
        useChorusCopilotStore.getState().sendMessage('Show my mentions')
      })

      await act(async () => {})

      const response = useChorusCopilotStore.getState().messages[1]!.content
      expect(response).toContain('2 mention(s)')
    })

    it('responds to channel keyword', async () => {
      act(() => {
        useChorusCopilotStore.getState().sendMessage('List my channels')
      })

      await act(async () => {})

      const response = useChorusCopilotStore.getState().messages[1]!.content
      expect(response).toContain('3 channel(s)')
      expect(response).toContain('2 public')
      expect(response).toContain('1 private')
    })

    it('responds with context-aware message for known section', async () => {
      act(() => {
        useChorusCopilotStore.getState().sendMessage('Help me', 'channel_view')
      })

      await act(async () => {})

      const response = useChorusCopilotStore.getState().messages[1]!.content
      expect(response).toContain('a channel conversation')
    })

    it('returns fallback response when no keywords match', async () => {
      act(() => {
        useChorusCopilotStore.getState().sendMessage('Hello there')
      })

      await act(async () => {})

      const response = useChorusCopilotStore.getState().messages[1]!.content
      expect(response).toContain('Chorus Copilot')
      expect(response).toContain('3 channel(s)')
      expect(response).toContain('4 message(s)')
      expect(response).toContain('8 unread')
    })
  })
})
