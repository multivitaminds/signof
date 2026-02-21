// Text-to-Speech using ElevenLabs API

import { logger } from '../lib/logger.js';

interface SynthesizeOptions {
  voiceId?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
}

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (ElevenLabs default)

/**
 * Synthesize text to audio using ElevenLabs.
 */
export async function synthesize(
  text: string,
  options: SynthesizeOptions = {}
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  const voiceId = options.voiceId ?? DEFAULT_VOICE_ID;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: options.model ?? 'eleven_turbo_v2_5',
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    logger.error('ElevenLabs synthesis failed', { error: (err as Error).message });
    throw err;
  }
}

/**
 * Check if TTS is available.
 */
export function isTTSAvailable(): boolean {
  return !!process.env.ELEVENLABS_API_KEY;
}
