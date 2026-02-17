// REST routes for channel validation

import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

interface ChannelValidation {
  channelType: string;
  config: Record<string, unknown>;
}

function isValidUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const BOT_TOKEN_PATTERN = /^\d+:[A-Za-z0-9_-]+$/;

function validateChannelConfig(channelType: string, config: Record<string, unknown>): string[] {
  const errors: string[] = [];

  switch (channelType) {
    case 'telegram': {
      if (!config.botToken || typeof config.botToken !== 'string') {
        errors.push('botToken is required');
      } else if (!BOT_TOKEN_PATTERN.test(config.botToken)) {
        errors.push('botToken format is invalid. Expected format: 123456:ABC-DEF...');
      }
      break;
    }

    case 'discord': {
      if (!config.botToken || typeof config.botToken !== 'string') {
        errors.push('botToken is required');
      }
      if (config.webhookUrl !== undefined && !isValidUrl(config.webhookUrl)) {
        errors.push('webhookUrl must be a valid URL');
      }
      break;
    }

    case 'slack': {
      if (!config.botToken || typeof config.botToken !== 'string') {
        errors.push('botToken is required');
      }
      if (!config.signingSecret || typeof config.signingSecret !== 'string') {
        errors.push('signingSecret is required');
      }
      break;
    }

    case 'whatsapp': {
      if (!config.accessToken || typeof config.accessToken !== 'string') {
        errors.push('accessToken is required');
      }
      if (!config.phoneNumberId || typeof config.phoneNumberId !== 'string') {
        errors.push('phoneNumberId is required');
      }
      break;
    }

    case 'webchat': {
      // Webchat has no external credentials to validate
      break;
    }

    case 'email': {
      if (!config.smtpHost || typeof config.smtpHost !== 'string') {
        errors.push('smtpHost is required');
      }
      if (!config.smtpPort || typeof config.smtpPort !== 'number') {
        errors.push('smtpPort is required and must be a number');
      }
      break;
    }

    case 'api': {
      if (config.webhookUrl !== undefined && !isValidUrl(config.webhookUrl)) {
        errors.push('webhookUrl must be a valid URL');
      }
      break;
    }

    default: {
      errors.push(`Unknown channel type: ${channelType}`);
    }
  }

  return errors;
}

// POST /api/channels/validate — Validate channel credentials format
router.post('/channels/validate', (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;

  if (!body.channelType || typeof body.channelType !== 'string') {
    res.status(400).json({ valid: false, errors: ['channelType is required'] });
    return;
  }

  const input: ChannelValidation = {
    channelType: body.channelType,
    config: (body.config && typeof body.config === 'object' ? body.config : {}) as Record<string, unknown>,
  };

  const errors = validateChannelConfig(input.channelType, input.config);
  res.json({ valid: errors.length === 0, errors });
});

export default router;
