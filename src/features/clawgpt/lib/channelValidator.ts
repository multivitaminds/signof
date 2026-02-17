import type { ChannelType } from '../types'

interface ValidationResult {
  valid: boolean
  errors: string[]
}

const BOT_TOKEN_REGEX = /^\d+:[A-Za-z0-9_-]+$/
const URL_REGEX = /^https?:\/\/.+/

export function validateChannelConfig(
  channelType: ChannelType,
  config: Record<string, unknown>
): ValidationResult {
  const errors: string[] = []

  switch (channelType) {
    case 'slack': {
      if (!config.clientId) errors.push('Client ID is required')
      if (!config.clientSecret) errors.push('Client Secret is required')
      if (!config.signingSecret) errors.push('Signing Secret is required')
      break
    }
    case 'telegram': {
      if (!config.botToken) errors.push('Bot Token is required')
      if (
        config.botToken &&
        typeof config.botToken === 'string' &&
        !BOT_TOKEN_REGEX.test(config.botToken)
      ) {
        errors.push('Bot Token format is invalid (expected: 123456:ABC...)')
      }
      break
    }
    case 'discord': {
      if (!config.botToken) errors.push('Bot Token is required')
      if (!config.applicationId) errors.push('Application ID is required')
      break
    }
    case 'email': {
      if (!config.smtpHost) errors.push('SMTP Host is required')
      if (!config.smtpPort) errors.push('SMTP Port is required')
      if (!config.username) errors.push('Username is required')
      if (!config.password) errors.push('Password is required')
      break
    }
    case 'whatsapp': {
      if (!config.apiKey) errors.push('API Key is required')
      if (!config.phoneNumberId) errors.push('Phone Number ID is required')
      break
    }
    case 'sms': {
      if (!config.accountSid) errors.push('Account SID is required')
      if (!config.authToken) errors.push('Auth Token is required')
      if (!config.phoneNumber) errors.push('Phone Number is required')
      break
    }
    case 'web_chat': {
      // WebChat doesn't require credentials
      break
    }
    default: {
      // For webhook/custom/etc, check for required URL
      if (
        config.endpointUrl &&
        typeof config.endpointUrl === 'string' &&
        !URL_REGEX.test(config.endpointUrl)
      ) {
        errors.push('Endpoint URL must start with http:// or https://')
      }
    }
  }

  // Check any webhook URLs
  if (
    config.webhookUrl &&
    typeof config.webhookUrl === 'string' &&
    !URL_REGEX.test(config.webhookUrl)
  ) {
    errors.push('Webhook URL must start with http:// or https://')
  }

  return { valid: errors.length === 0, errors }
}

export async function testChannelConnection(
  channelType: ChannelType,
  config: Record<string, unknown>
): Promise<ValidationResult> {
  // First do client-side validation
  const clientResult = validateChannelConfig(channelType, config)
  if (!clientResult.valid) return clientResult

  // Then call server for live validation
  try {
    const res = await fetch('/api/channels/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelType, config }),
    })
    const data = (await res.json()) as ValidationResult
    return data
  } catch {
    return { valid: false, errors: ['Unable to reach server for validation'] }
  }
}
