import { useMemo } from 'react'
import type { ChorusChannel } from '../types'

export const NotificationPriority = {
  Urgent: 'urgent',
  Important: 'important',
  Normal: 'normal',
  Low: 'low',
} as const

export type NotificationPriority = (typeof NotificationPriority)[keyof typeof NotificationPriority]

export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  [NotificationPriority.Urgent]: 'Urgent',
  [NotificationPriority.Important]: 'Important',
  [NotificationPriority.Normal]: 'Normal',
  [NotificationPriority.Low]: 'Low',
}

export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  [NotificationPriority.Urgent]: '#DC2626',
  [NotificationPriority.Important]: '#D97706',
  [NotificationPriority.Normal]: '#4F46E5',
  [NotificationPriority.Low]: '#6B7280',
}

export interface ChannelPriority {
  channelId: string
  channelName: string
  priority: NotificationPriority
  reason: string
}

export function classifyChannel(channel: ChorusChannel): ChannelPriority {
  const hasMentions = channel.mentionCount > 0
  const hasUnread = channel.unreadCount > 0
  const isMuted = channel.isMuted

  if (isMuted || (!hasUnread && !hasMentions)) {
    return {
      channelId: channel.id,
      channelName: channel.name,
      priority: NotificationPriority.Low,
      reason: isMuted ? 'Muted channel' : 'No unread messages',
    }
  }

  if (hasMentions && channel.unreadCount > 5) {
    return {
      channelId: channel.id,
      channelName: channel.name,
      priority: NotificationPriority.Urgent,
      reason: `${channel.mentionCount} mention(s) and ${channel.unreadCount} unread`,
    }
  }

  if (hasMentions) {
    return {
      channelId: channel.id,
      channelName: channel.name,
      priority: NotificationPriority.Important,
      reason: `${channel.mentionCount} mention(s)`,
    }
  }

  return {
    channelId: channel.id,
    channelName: channel.name,
    priority: NotificationPriority.Normal,
    reason: `${channel.unreadCount} unread message(s)`,
  }
}

export function useSmartNotifications(channels: ChorusChannel[]): ChannelPriority[] {
  return useMemo(() => {
    const priorityOrder: Record<NotificationPriority, number> = {
      [NotificationPriority.Urgent]: 0,
      [NotificationPriority.Important]: 1,
      [NotificationPriority.Normal]: 2,
      [NotificationPriority.Low]: 3,
    }

    return channels
      .map(classifyChannel)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }, [channels])
}
