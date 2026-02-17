import type { SkillHandler } from '../index.js';

export const webSearchHandler: SkillHandler = {
  async execute(input: Record<string, unknown>): Promise<string> {
    const query = typeof input.input === 'string' ? input.input : typeof input.query === 'string' ? input.query : '';
    if (!query) return 'Error: No search query provided';

    // Check for search API key
    if (!process.env.SEARCH_API_KEY) {
      return `Web search not configured — set SEARCH_API_KEY in environment. Query was: "${query}"`;
    }

    // Placeholder for real search API integration
    return `Search results for "${query}" would appear here when SEARCH_API_KEY is configured with a search provider.`;
  },
};
