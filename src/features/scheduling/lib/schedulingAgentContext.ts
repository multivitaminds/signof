import { useSchedulingStore } from '../stores/useSchedulingStore'
import { LOCATION_LABELS, CALENDAR_PROVIDER_LABELS, SYNC_DIRECTION_LABELS } from '../types'
import type { LocationType, CalendarProvider, SyncDirection } from '../types'

// ─── Event Type Context ─────────────────────────────────────────────

export function buildEventTypeContext(): string {
  const state = useSchedulingStore.getState()
  const { eventTypes } = state

  if (eventTypes.length === 0) {
    return 'Event Types: No event types created yet.'
  }

  const active = eventTypes.filter((et) => et.isActive)
  const lines: string[] = [`Event Types: ${eventTypes.length} total (${active.length} active)`]

  for (const et of eventTypes) {
    const locationLabel = LOCATION_LABELS[et.location as LocationType] ?? et.location
    lines.push(`  - ${et.name}: ${et.durationMinutes}min, ${et.category}, ${locationLabel}, ${et.isActive ? 'active' : 'inactive'}`)
  }

  return lines.join('\n')
}

// ─── Booking Context ────────────────────────────────────────────────

export function buildBookingContext(): string {
  const state = useSchedulingStore.getState()
  const { bookings } = state

  if (bookings.length === 0) {
    return 'Bookings: No bookings yet.'
  }

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const upcoming = bookings.filter((b) => b.date >= todayStr && b.status !== 'cancelled')
  const past = bookings.filter((b) => b.date < todayStr)

  const lines: string[] = [`Bookings: ${bookings.length} total, ${upcoming.length} upcoming, ${past.length} past`]

  // Status breakdown
  const byStatus: Record<string, number> = {}
  for (const b of bookings) {
    byStatus[b.status] = (byStatus[b.status] ?? 0) + 1
  }
  for (const [status, count] of Object.entries(byStatus)) {
    lines.push(`  ${status}: ${count}`)
  }

  // No-show rate
  const noShowRate = state.getNoShowRate()
  lines.push(`  No-show rate: ${noShowRate}%`)

  // Upcoming bookings (first 5)
  if (upcoming.length > 0) {
    lines.push('  Upcoming:')
    for (const b of upcoming.slice(0, 5)) {
      const attendeeNames = b.attendees.map((a) => a.name).join(', ')
      lines.push(`    - ${b.date} ${b.startTime}-${b.endTime}: ${attendeeNames} (${b.status})`)
    }
  }

  return lines.join('\n')
}

// ─── Calendar Sync Context ──────────────────────────────────────────

export function buildCalendarSyncContext(): string {
  const state = useSchedulingStore.getState()
  const { calendarConnections } = state

  if (calendarConnections.length === 0) {
    return 'Calendar Sync: No calendar connections configured.'
  }

  const connected = calendarConnections.filter((c) => c.connected)
  const lines: string[] = [`Calendar Sync: ${calendarConnections.length} configured, ${connected.length} connected`]

  for (const conn of calendarConnections) {
    const providerLabel = CALENDAR_PROVIDER_LABELS[conn.provider as CalendarProvider] ?? conn.provider
    const directionLabel = SYNC_DIRECTION_LABELS[conn.syncDirection as SyncDirection] ?? conn.syncDirection
    const syncInfo = conn.lastSyncedAt
      ? `last synced ${conn.lastSyncedAt}`
      : 'never synced'
    lines.push(`  - ${providerLabel} (${conn.email}): ${conn.connected ? 'connected' : 'disconnected'}, ${directionLabel}, ${syncInfo}`)
  }

  return lines.join('\n')
}

// ─── Full Scheduling Context ────────────────────────────────────────

export function buildFullSchedulingContext(): string {
  const lines: string[] = [
    '=== Scheduling Context ===',
    '',
    buildEventTypeContext(),
    '',
    buildBookingContext(),
    '',
    buildCalendarSyncContext(),
    '',
    '=== End Scheduling Context ===',
  ]

  return lines.join('\n')
}
