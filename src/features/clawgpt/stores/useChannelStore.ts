import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Channel, ChannelConfig } from '../types'
import { ChannelType, ChannelStatus, ChannelAuthType } from '../types'
import type { ChannelType as ChannelTypeT } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const DEFAULT_CONFIG: ChannelConfig = {
  autoReply: true,
  replyDelay: 500,
  maxConcurrentSessions: 10,
  businessHoursOnly: false,
  language: 'en',
  authType: ChannelAuthType.OAuth2,
}

const CHANNEL_DEFINITIONS: Omit<Channel, 'status' | 'unreadCount' | 'lastActivity' | 'assignedAgentId'>[] = [
  { id: 'ch-slack', name: 'Slack', type: ChannelType.Slack, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.OAuth2 }, icon: 'slack', description: 'Connect to Slack workspaces', authType: ChannelAuthType.OAuth2, capabilities: ['text', 'media', 'reactions', 'threads'] },
  { id: 'ch-email', name: 'Email', type: ChannelType.Email, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.Smtp, replyDelay: 1000 }, icon: 'mail', description: 'Handle email conversations', authType: ChannelAuthType.Smtp, capabilities: ['text', 'media'] },
  { id: 'ch-webchat', name: 'Web Chat', type: ChannelType.WebChat, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.None, replyDelay: 200 }, icon: 'message-circle', description: 'Embedded website chat widget', authType: ChannelAuthType.None, capabilities: ['text', 'media'] },
  { id: 'ch-sms', name: 'SMS', type: ChannelType.Sms, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.ApiKey }, icon: 'smartphone', description: 'SMS text messaging via Twilio', authType: ChannelAuthType.ApiKey, capabilities: ['text'] },
  { id: 'ch-whatsapp', name: 'WhatsApp', type: ChannelType.WhatsApp, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.ApiKey }, icon: 'phone', description: 'WhatsApp Business API', authType: ChannelAuthType.ApiKey, capabilities: ['text', 'media'] },
  { id: 'ch-discord', name: 'Discord', type: ChannelType.Discord, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.BotToken }, icon: 'hash', description: 'Discord bot integration', authType: ChannelAuthType.BotToken, capabilities: ['text', 'media', 'reactions'] },
  { id: 'ch-teams', name: 'Microsoft Teams', type: ChannelType.Teams, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.OAuth2 }, icon: 'users', description: 'Microsoft Teams connector', authType: ChannelAuthType.OAuth2, capabilities: ['text', 'media', 'threads'] },
  { id: 'ch-telegram', name: 'Telegram', type: ChannelType.Telegram, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.BotToken }, icon: 'send', description: 'Telegram Bot API', authType: ChannelAuthType.BotToken, capabilities: ['text', 'media'] },
  { id: 'ch-signal', name: 'Signal', type: ChannelType.Signal, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.ApiKey }, icon: 'lock', description: 'Signal encrypted messaging', authType: ChannelAuthType.ApiKey, capabilities: ['text', 'media'] },
  { id: 'ch-matrix', name: 'Matrix', type: ChannelType.Matrix, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.ApiKey }, icon: 'grid', description: 'Matrix protocol bridge', authType: ChannelAuthType.ApiKey, capabilities: ['text', 'media', 'threads'] },
  { id: 'ch-irc', name: 'IRC', type: ChannelType.Irc, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.None }, icon: 'terminal', description: 'IRC channel bridge', authType: ChannelAuthType.None, capabilities: ['text'] },
  { id: 'ch-webhook', name: 'Webhook', type: ChannelType.Webhook, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.Webhook }, icon: 'link', description: 'Incoming webhook integration', authType: ChannelAuthType.Webhook, capabilities: ['text'] },
  { id: 'ch-api', name: 'Custom API', type: ChannelType.Custom, config: { ...DEFAULT_CONFIG, authType: ChannelAuthType.Webhook }, icon: 'code', description: 'REST API endpoint for custom integrations', authType: ChannelAuthType.Webhook, capabilities: ['text'] },
]

const PRE_CONNECTED = new Set(['ch-webchat'])

const INITIAL_CHANNELS: Channel[] = CHANNEL_DEFINITIONS.map((def) => ({
  ...def,
  status: PRE_CONNECTED.has(def.id) ? ChannelStatus.Connected : ChannelStatus.Disconnected,
  unreadCount: 0,
  lastActivity: PRE_CONNECTED.has(def.id) ? new Date().toISOString() : null,
  assignedAgentId: null,
}))

interface ChannelState {
  channels: Channel[]
  validationErrors: Record<string, string[]>

  connectChannel: (id: string) => void
  disconnectChannel: (id: string) => void
  pauseChannel: (id: string) => void
  updateChannelConfig: (id: string, config: Partial<ChannelConfig>) => void
  addCustomChannel: (name: string, config: ChannelConfig) => string
  removeCustomChannel: (id: string) => void
  getConnectedChannels: () => Channel[]
  getChannelsByType: (type: ChannelTypeT) => Channel[]
  updateUnreadCount: (id: string, count: number) => void
  setValidationErrors: (channelId: string, errors: string[]) => void
  clearValidationErrors: (channelId: string) => void
}

export const useChannelStore = create<ChannelState>()(
  persist(
    (_set, get) => ({
      channels: INITIAL_CHANNELS,
      validationErrors: {},

      connectChannel: (id) => {
        const channel = get().channels.find((ch) => ch.id === id)
        if (!channel) return

        // WebChat auto-connects without validation
        if (channel.type === ChannelType.WebChat) {
          _set((s) => ({
            channels: s.channels.map((ch) =>
              ch.id === id
                ? { ...ch, status: ChannelStatus.Connected as ChannelStatus, lastActivity: new Date().toISOString() }
                : ch
            ),
            validationErrors: { ...s.validationErrors, [id]: [] },
          }))
          return
        }

        // Set connecting state
        _set((s) => ({
          channels: s.channels.map((ch) =>
            ch.id === id ? { ...ch, status: ChannelStatus.Connecting as ChannelStatus } : ch
          ),
        }))

        // Validate then connect
        import('../lib/channelValidator').then(({ validateChannelConfig }) => {
          const result = validateChannelConfig(channel.type, channel.config)
          if (result.valid) {
            _set((s) => ({
              channels: s.channels.map((ch) =>
                ch.id === id
                  ? { ...ch, status: ChannelStatus.Connected as ChannelStatus, lastActivity: new Date().toISOString() }
                  : ch
              ),
              validationErrors: { ...s.validationErrors, [id]: [] },
            }))
          } else {
            _set((s) => ({
              channels: s.channels.map((ch) =>
                ch.id === id ? { ...ch, status: ChannelStatus.Error as ChannelStatus } : ch
              ),
              validationErrors: { ...s.validationErrors, [id]: result.errors },
            }))
          }
        })
      },

      disconnectChannel: (id) => {
        _set((s) => ({
          channels: s.channels.map((ch) =>
            ch.id === id ? { ...ch, status: ChannelStatus.Disconnected as ChannelStatus } : ch
          ),
        }))
      },

      pauseChannel: (id) => {
        _set((s) => ({
          channels: s.channels.map((ch) =>
            ch.id === id ? { ...ch, status: ChannelStatus.Paused as ChannelStatus } : ch
          ),
        }))
      },

      updateChannelConfig: (id, config) => {
        _set((s) => ({
          channels: s.channels.map((ch) =>
            ch.id === id ? { ...ch, config: { ...ch.config, ...config } } : ch
          ),
        }))
      },

      addCustomChannel: (name, config) => {
        const id = rid()
        const channel: Channel = {
          id,
          name,
          type: ChannelType.Custom,
          status: ChannelStatus.Disconnected,
          config,
          unreadCount: 0,
          lastActivity: null,
          icon: 'code',
          description: `Custom channel: ${name}`,
          authType: config.authType,
          capabilities: ['text'],
          assignedAgentId: null,
        }
        _set((s) => ({
          channels: [...s.channels, channel],
        }))
        return id
      },

      removeCustomChannel: (id) => {
        _set((s) => ({
          channels: s.channels.filter((ch) => ch.id !== id),
        }))
      },

      getConnectedChannels: () => {
        return get().channels.filter((ch) => ch.status === ChannelStatus.Connected)
      },

      getChannelsByType: (type) => {
        return get().channels.filter((ch) => ch.type === type)
      },

      updateUnreadCount: (id, count) => {
        _set((s) => ({
          channels: s.channels.map((ch) =>
            ch.id === id ? { ...ch, unreadCount: count } : ch
          ),
        }))
      },

      setValidationErrors: (channelId, errors) => {
        _set((s) => ({
          validationErrors: { ...s.validationErrors, [channelId]: errors },
        }))
      },

      clearValidationErrors: (channelId) => {
        _set((s) => ({
          validationErrors: { ...s.validationErrors, [channelId]: [] },
        }))
      },
    }),
    {
      name: 'origina-channel-storage',
      partialize: (state) => ({
        channels: state.channels,
      }),
    }
  )
)
