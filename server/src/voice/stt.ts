// Speech-to-Text using Deepgram API

import { logger } from '../lib/logger.js';

interface TranscribeOptions {
  language?: string;
  model?: string;
  punctuate?: boolean;
}

/**
 * Transcribe audio buffer to text using Deepgram.
 */
export async function transcribe(
  audioBuffer: Buffer,
  options: TranscribeOptions = {}
): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY not configured');
  }

  try {
    const { createClient } = await import('@deepgram/sdk');
    const deepgram = createClient(apiKey);

    const { result } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: options.model ?? 'nova-3',
        language: options.language ?? 'en',
        punctuate: options.punctuate ?? true,
        smart_format: true,
      }
    );

    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';

    if (!transcript) {
      logger.warn('Empty transcription result');
      return '';
    }

    return transcript;
  } catch (err) {
    logger.error('Deepgram transcription failed', { error: (err as Error).message });
    throw err;
  }
}

/**
 * Check if STT is available.
 */
export function isSTTAvailable(): boolean {
  return !!process.env.DEEPGRAM_API_KEY;
}
