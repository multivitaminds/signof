import type { GatewayEvent, GatewayEventType } from '../types'

/**
 * Create a GatewayEvent with a timestamp.
 */
export function createGatewayEvent(
  type: GatewayEventType,
  payload: Record<string, unknown>
): GatewayEvent {
  return {
    type,
    payload,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Parse a JSON string into a GatewayEvent.
 * Returns null if the string is not valid JSON or missing required fields.
 */
export function parseGatewayEvent(data: string): GatewayEvent | null {
  try {
    const parsed: unknown = JSON.parse(data)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('type' in parsed) ||
      !('payload' in parsed) ||
      !('timestamp' in parsed)
    ) {
      return null
    }

    const obj = parsed as Record<string, unknown>

    if (
      typeof obj.type !== 'string' ||
      typeof obj.payload !== 'object' ||
      obj.payload === null ||
      typeof obj.timestamp !== 'string'
    ) {
      return null
    }

    return {
      type: obj.type as GatewayEventType,
      payload: obj.payload as Record<string, unknown>,
      timestamp: obj.timestamp,
    }
  } catch {
    return null
  }
}
