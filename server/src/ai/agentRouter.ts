// Agent Router — maps user intent to agent type

const AGENT_PATTERNS: Array<{ type: string; patterns: RegExp[] }> = [
  {
    type: 'researcher',
    patterns: [
      /\b(research|investigate|find out|look up|what is|who is|explain|analyze|compare)\b/i,
      /\b(search|find|discover|explore|study)\b/i,
    ],
  },
  {
    type: 'writer',
    patterns: [
      /\b(write|draft|compose|create.*(?:post|article|email|document|report|summary))\b/i,
      /\b(rewrite|edit|proofread|rephrase|paraphrase)\b/i,
    ],
  },
  {
    type: 'coder',
    patterns: [
      /\b(code|program|implement|debug|fix.*bug|refactor|build.*(?:function|component|api|feature))\b/i,
      /\b(typescript|javascript|python|react|sql|html|css|regex)\b/i,
    ],
  },
  {
    type: 'analyst',
    patterns: [
      /\b(analyz|data|metric|chart|graph|trend|forecast|predict|statistic)\b/i,
      /\b(calculate|compute|measure|benchmark|report.*(?:on|about))\b/i,
    ],
  },
  {
    type: 'scheduler',
    patterns: [
      /\b(schedule|calendar|meeting|appointment|remind|reminder|availability|book|reschedule)\b/i,
      /\b(free time|busy|when.*(?:can|should|available))\b/i,
    ],
  },
  {
    type: 'coordinator',
    patterns: [
      /\b(coordinate|orchestrate|delegate|assign|manage.*team|multi.*step|workflow|pipeline)\b/i,
      /\b(plan.*project|break.*down|organize.*tasks)\b/i,
    ],
  },
];

/**
 * Route a user message to the most appropriate agent type.
 * Uses pattern matching with priority scoring.
 */
export function routeToAgent(message: string): string {
  let bestType = 'general';
  let bestScore = 0;

  for (const { type, patterns } of AGENT_PATTERNS) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }

  return bestType;
}

/**
 * Get all available agent types.
 */
export function getAgentTypes(): string[] {
  return ['general', ...AGENT_PATTERNS.map(p => p.type)];
}
