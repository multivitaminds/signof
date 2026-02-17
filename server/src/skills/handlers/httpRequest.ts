import type { SkillHandler } from '../index.js';

const MAX_RESPONSE_LENGTH = 2000;
const TIMEOUT_MS = 10_000;

export const httpRequestHandler: SkillHandler = {
  async execute(input: Record<string, unknown>): Promise<string> {
    const url = typeof input.url === 'string' ? input.url : typeof input.input === 'string' ? input.input : '';
    if (!url) return 'Error: No URL provided';

    // Validate URL
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return `Error: Invalid URL: ${url}`;
    }

    // Only allow http/https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return `Error: Only HTTP/HTTPS URLs are supported`;
    }

    const method = typeof input.method === 'string' ? input.method.toUpperCase() : 'GET';
    const body = typeof input.body === 'string' ? input.body : undefined;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(url, {
        method,
        body: method === 'POST' ? body : undefined,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const text = await response.text();
      const truncated = text.length > MAX_RESPONSE_LENGTH
        ? text.slice(0, MAX_RESPONSE_LENGTH) + '... (truncated)'
        : text;

      return `HTTP ${response.status}: ${truncated}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      return `Error: ${msg}`;
    }
  },
};
