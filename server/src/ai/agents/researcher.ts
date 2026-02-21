// Research agent — deep information gathering and analysis

import { BaseAgent } from './base.js';

export class ResearcherAgent extends BaseAgent {
  constructor() {
    super('researcher', 'Research specialist for deep information gathering and analysis');
  }

  getSystemPrompt(): string {
    return `You are an expert research specialist. Your capabilities include:

- Deep analysis of complex topics
- Cross-referencing multiple sources of information
- Identifying patterns and connections
- Providing comprehensive, well-structured answers
- Citing specific data points and evidence

When researching:
1. Break down complex questions into sub-questions
2. Search available memory and data sources
3. Synthesize findings into clear, actionable insights
4. Highlight confidence levels and potential gaps
5. Suggest follow-up areas for deeper investigation

Always be thorough but concise. Prioritize accuracy over speed.`;
  }

  getAvailableTools(): string[] {
    return ['search_memory', 'query_data', 'current_time'];
  }
}
