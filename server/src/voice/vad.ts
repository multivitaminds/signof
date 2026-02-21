// Voice Activity Detection — silence detection for turn-taking

/**
 * Simple energy-based Voice Activity Detection.
 * Detects silence in audio buffers to determine when the user has stopped speaking.
 */
export interface VADConfig {
  /** RMS threshold below which audio is considered silence (0-1) */
  silenceThreshold: number;
  /** Duration of silence (ms) before triggering speech end */
  silenceDurationMs: number;
  /** Minimum speech duration (ms) to avoid false positives */
  minSpeechDurationMs: number;
  /** Sample rate of the audio */
  sampleRate: number;
}

const DEFAULT_CONFIG: VADConfig = {
  silenceThreshold: 0.01,
  silenceDurationMs: 800,
  minSpeechDurationMs: 300,
  sampleRate: 16000,
};

export class VoiceActivityDetector {
  private config: VADConfig;
  private isSpeaking = false;
  private speechStartTime = 0;
  private lastSpeechTime = 0;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;

  constructor(config: Partial<VADConfig> = {}, callbacks?: { onSpeechStart?: () => void; onSpeechEnd?: () => void }) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.onSpeechStart = callbacks?.onSpeechStart;
    this.onSpeechEnd = callbacks?.onSpeechEnd;
  }

  /**
   * Process an audio chunk and detect voice activity.
   * Expects 16-bit PCM audio data.
   */
  processChunk(audioData: Buffer): boolean {
    const rms = calculateRMS(audioData);
    const now = Date.now();
    const hasVoice = rms > this.config.silenceThreshold;

    if (hasVoice) {
      if (!this.isSpeaking) {
        this.isSpeaking = true;
        this.speechStartTime = now;
        this.onSpeechStart?.();
      }
      this.lastSpeechTime = now;
    } else if (this.isSpeaking) {
      const silenceDuration = now - this.lastSpeechTime;
      const speechDuration = this.lastSpeechTime - this.speechStartTime;

      if (
        silenceDuration >= this.config.silenceDurationMs &&
        speechDuration >= this.config.minSpeechDurationMs
      ) {
        this.isSpeaking = false;
        this.onSpeechEnd?.();
      }
    }

    return this.isSpeaking;
  }

  /**
   * Reset the detector state.
   */
  reset(): void {
    this.isSpeaking = false;
    this.speechStartTime = 0;
    this.lastSpeechTime = 0;
  }

  /**
   * Check if currently detecting speech.
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

/**
 * Calculate Root Mean Square (RMS) energy of 16-bit PCM audio.
 */
function calculateRMS(buffer: Buffer): number {
  let sum = 0;
  const samples = buffer.length / 2; // 16-bit = 2 bytes per sample

  for (let i = 0; i < buffer.length; i += 2) {
    const sample = buffer.readInt16LE(i) / 32768; // Normalize to -1...1
    sum += sample * sample;
  }

  return Math.sqrt(sum / samples);
}
