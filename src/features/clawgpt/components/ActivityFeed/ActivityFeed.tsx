import { useState, useCallback, useEffect } from 'react'
import type { BrainMessage } from '../../types'
import { eventBus, EVENT_TYPES } from '../../../../lib/eventBus'
import './ActivityFeed.css'

interface ActivityItem {
  id: string
  type: 'message' | 'session' | 'skill' | 'gateway' | 'fleet_agent' | 'fleet_task' | 'fleet_alert'
  content: string
  senderName: string
  channelType: string
  sessionId: string
  timestamp: string
}

interface ActivityFeedProps {
  messages: BrainMessage[]
  maxItems?: number
  onMessageClick?: (sessionId: string) => void
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '...'
}

function messageToActivity(msg: BrainMessage): ActivityItem {
  return {
    id: msg.id,
    type: 'message',
    content: msg.content,
    senderName: msg.senderName,
    channelType: msg.channelType,
    sessionId: msg.sessionId,
    timestamp: msg.timestamp,
  }
}

function getActivityIcon(item: ActivityItem): string {
  switch (item.type) {
    case 'session': return 'S'
    case 'skill': return 'K'
    case 'gateway': return 'G'
    case 'fleet_agent': return 'A'
    case 'fleet_task': return 'T'
    case 'fleet_alert': return '!'
    default: return item.channelType.charAt(0).toUpperCase()
  }
}

export default function ActivityFeed({
  messages,
  maxItems = 20,
  onMessageClick,
}: ActivityFeedProps) {
  const [eventItems, setEventItems] = useState<ActivityItem[]>([])

  useEffect(() => {
    const unsubs = [
      eventBus.on(EVENT_TYPES.BRAIN_SESSION_CREATED, (...args: unknown[]) => {
        const data = args[0] as { sessionId?: string; contactName?: string } | undefined
        const item: ActivityItem = {
          id: `event-${Date.now()}`,
          type: 'session',
          content: `New session started${data?.contactName ? ` with ${data.contactName}` : ''}`,
          senderName: 'System',
          channelType: 'system',
          sessionId: data?.sessionId ?? '',
          timestamp: new Date().toISOString(),
        }
        setEventItems((prev) => [item, ...prev].slice(0, 50))
      }),
      eventBus.on(EVENT_TYPES.BRAIN_SKILL_EXECUTED, (...args: unknown[]) => {
        const data = args[0] as { skillName?: string; sessionId?: string } | undefined
        const item: ActivityItem = {
          id: `event-${Date.now()}`,
          type: 'skill',
          content: `Skill executed: ${data?.skillName ?? 'unknown'}`,
          senderName: 'System',
          channelType: 'system',
          sessionId: data?.sessionId ?? '',
          timestamp: new Date().toISOString(),
        }
        setEventItems((prev) => [item, ...prev].slice(0, 50))
      }),
      eventBus.on(EVENT_TYPES.BRAIN_GATEWAY_STATUS, (...args: unknown[]) => {
        const data = args[0] as { status?: string } | undefined
        const item: ActivityItem = {
          id: `event-${Date.now()}`,
          type: 'gateway',
          content: `Gateway status: ${data?.status ?? 'unknown'}`,
          senderName: 'System',
          channelType: 'system',
          sessionId: '',
          timestamp: new Date().toISOString(),
        }
        setEventItems((prev) => [item, ...prev].slice(0, 50))
      }),
      eventBus.on(EVENT_TYPES.FLEET_AGENT_SPAWNED, (...args: unknown[]) => {
        const data = args[0] as { displayName?: string; domain?: string; task?: string } | undefined
        const item: ActivityItem = {
          id: `event-${Date.now()}-spawn`,
          type: 'fleet_agent',
          content: `Agent spawned: ${data?.displayName ?? 'Unknown'} (${data?.domain ?? ''}) — ${data?.task?.slice(0, 60) ?? ''}`,
          senderName: 'Fleet',
          channelType: 'fleet',
          sessionId: '',
          timestamp: new Date().toISOString(),
        }
        setEventItems((prev) => [item, ...prev].slice(0, 50))
      }),
      eventBus.on(EVENT_TYPES.FLEET_AGENT_RETIRED, (...args: unknown[]) => {
        const data = args[0] as { registryId?: string; domain?: string } | undefined
        const item: ActivityItem = {
          id: `event-${Date.now()}-retire`,
          type: 'fleet_agent',
          content: `Agent retired: ${data?.registryId ?? 'Unknown'}`,
          senderName: 'Fleet',
          channelType: 'fleet',
          sessionId: '',
          timestamp: new Date().toISOString(),
        }
        setEventItems((prev) => [item, ...prev].slice(0, 50))
      }),
      eventBus.on(EVENT_TYPES.FLEET_TASK_COMPLETED, (...args: unknown[]) => {
        const data = args[0] as { taskId?: string; description?: string } | undefined
        const item: ActivityItem = {
          id: `event-${Date.now()}-task`,
          type: 'fleet_task',
          content: `Task completed: ${data?.description?.slice(0, 80) ?? data?.taskId ?? 'Unknown'}`,
          senderName: 'Fleet',
          channelType: 'fleet',
          sessionId: '',
          timestamp: new Date().toISOString(),
        }
        setEventItems((prev) => [item, ...prev].slice(0, 50))
      }),
      eventBus.on(EVENT_TYPES.FLEET_ALERT, (...args: unknown[]) => {
        const data = args[0] as { severity?: string; message?: string } | undefined
        const item: ActivityItem = {
          id: `event-${Date.now()}-alert`,
          type: 'fleet_alert',
          content: `[${data?.severity ?? 'info'}] ${data?.message ?? 'Alert'}`,
          senderName: 'Fleet',
          channelType: 'fleet',
          sessionId: '',
          timestamp: new Date().toISOString(),
        }
        setEventItems((prev) => [item, ...prev].slice(0, 50))
      }),
    ]

    return () => { unsubs.forEach((fn) => fn()) }
  }, [])

  const allItems = [
    ...messages.map(messageToActivity),
    ...eventItems,
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems)

  const handleClick = useCallback(
    (sessionId: string) => {
      onMessageClick?.(sessionId)
    },
    [onMessageClick]
  )

  if (allItems.length === 0) {
    return (
      <div className="activity-feed activity-feed--empty">
        <p className="activity-feed__empty">No activity yet.</p>
      </div>
    )
  }

  return (
    <div className="activity-feed" role="list">
      {allItems.map((item) => (
        <div
          key={item.id}
          className={`activity-feed__item activity-feed__item--${item.type}`}
          role="listitem"
          onClick={() => handleClick(item.sessionId)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick(item.sessionId)
            }
          }}
          tabIndex={onMessageClick ? 0 : undefined}
          style={onMessageClick ? { cursor: 'pointer' } : undefined}
        >
          <div className="activity-feed__icon" aria-hidden="true">
            {getActivityIcon(item)}
          </div>
          <div className="activity-feed__content">
            <span className="activity-feed__sender">{item.senderName}</span>
            <span className="activity-feed__preview">
              {truncate(item.content, 80)}
            </span>
          </div>
          <span className="activity-feed__time">{timeAgo(item.timestamp)}</span>
        </div>
      ))}
    </div>
  )
}
