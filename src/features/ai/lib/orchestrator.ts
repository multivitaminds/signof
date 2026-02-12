import type { AgentType } from '../types'

// ─── Types ──────────────────────────────────────────────────────────

export interface OrchestratorResult {
  agents: AgentType[]
  isMultiAgent: boolean
  confidence: number
}

// ─── Keyword Maps ───────────────────────────────────────────────────

const KEYWORD_MAP: Record<string, string[]> = {
  researcher: [
    'research', 'investigate', 'find', 'discover', 'explore',
    'study', 'analyze data sources', 'gather info',
  ],
  writer: [
    'write', 'draft', 'compose', 'author', 'create content',
    'document', 'article', 'blog',
  ],
  developer: [
    'code', 'implement', 'build', 'develop', 'program',
    'fix bug', 'refactor',
  ],
  designer: [
    'design', 'wireframe', 'mockup', 'prototype', 'ui', 'ux', 'layout',
  ],
  analyst: [
    'analyze', 'data', 'metrics', 'statistics', 'trends',
    'numbers', 'chart', 'insights',
  ],
  planner: [
    'plan', 'schedule', 'roadmap', 'timeline', 'milestone',
    'organize', 'break down',
  ],
  reviewer: [
    'review', 'check', 'audit', 'verify', 'proofread',
    'quality', 'test',
  ],
  coordinator: [
    'coordinate', 'communicate', 'manage', 'organize team',
    'delegate', 'meeting',
  ],
  sales: [
    'lead', 'prospect', 'outreach', 'proposal', 'sales',
    'deal', 'pipeline', 'close',
  ],
  marketing: [
    'campaign', 'advertise', 'promote', 'brand', 'audience',
    'target', 'ad',
  ],
  finance: [
    'invoice', 'budget', 'expense', 'financial', 'revenue',
    'forecast', 'accounting',
  ],
  legal: [
    'contract', 'legal', 'clause', 'liability', 'terms',
    'agreement', 'nda',
  ],
  compliance: [
    'compliance', 'regulatory', 'policy', 'regulation',
    'gdpr', 'soc',
  ],
  hr: [
    'hire', 'recruit', 'job description', 'onboard', 'candidate',
    'position',
  ],
  customerSuccess: [
    'support', 'ticket', 'customer', 'nps', 'churn',
    'satisfaction', 'feedback',
  ],
  translation: [
    'translate', 'localize', 'language', 'i18n', 'multilingual',
    'international',
  ],
  seo: [
    'seo', 'keyword', 'search engine', 'ranking', 'meta',
    'organic', 'serp',
  ],
  socialMedia: [
    'social media', 'post', 'hashtag', 'instagram', 'twitter',
    'linkedin', 'facebook', 'content calendar',
  ],
  security: [
    'security', 'vulnerability', 'penetration', 'access control',
    'threat', 'firewall', 'cve',
  ],
  devops: [
    'deploy', 'ci/cd', 'infrastructure', 'docker',
    'kubernetes', 'monitoring', 'server',
  ],
}

// ─── Compound Pipeline Patterns ─────────────────────────────────────

interface CompoundPattern {
  regex: RegExp
  agents: AgentType[]
}

const COMPOUND_PATTERNS: CompoundPattern[] = [
  {
    regex: /research.*write|write.*research/,
    agents: ['researcher', 'analyst', 'writer'],
  },
  {
    regex: /research.*compet/,
    agents: ['researcher', 'seo', 'analyst', 'writer'],
  },
  {
    regex: /blog.*post|write.*article/,
    agents: ['researcher', 'seo', 'writer', 'reviewer'],
  },
  {
    regex: /contract.*review|review.*contract/,
    agents: ['legal', 'compliance', 'writer'],
  },
  {
    regex: /security.*audit|audit.*security/,
    agents: ['security', 'compliance', 'reviewer', 'writer'],
  },
  {
    regex: /product.*launch|launch.*product/,
    agents: ['planner', 'designer', 'marketing', 'socialMedia'],
  },
  {
    regex: /hire|recruit|job.*description/,
    agents: ['hr', 'writer', 'reviewer'],
  },
  {
    regex: /financial.*report|budget.*report/,
    agents: ['finance', 'analyst', 'writer'],
  },
  {
    regex: /customer.*feedback/,
    agents: ['customerSuccess', 'analyst', 'planner', 'coordinator'],
  },
  {
    regex: /translate.*content|localize/,
    agents: ['translation', 'writer', 'reviewer'],
  },
  {
    regex: /deploy|infrastructure.*setup/,
    agents: ['devops', 'security', 'developer', 'reviewer'],
  },
]

// ─── Scoring Helpers ────────────────────────────────────────────────

function scoreAgentKeywords(input: string): Map<AgentType, number> {
  const scores = new Map<AgentType, number>()

  for (const [agentType, keywords] of Object.entries(KEYWORD_MAP)) {
    let matchCount = 0
    for (const keyword of keywords) {
      if (input.includes(keyword.toLowerCase())) {
        matchCount++
      }
    }
    if (matchCount > 0) {
      scores.set(agentType as AgentType, matchCount)
    }
  }

  return scores
}

function computeKeywordConfidence(totalMatches: number, agentCount: number): number {
  if (agentCount === 1) {
    return Math.min(0.7 + totalMatches * 0.05, 0.85)
  }
  return Math.min(0.6 + totalMatches * 0.04, 0.8)
}

// ─── Main Detection Function ────────────────────────────────────────

export function detectPipeline(input: string): OrchestratorResult {
  const lowered = input.toLowerCase()

  // 1. Check compound patterns first (highest confidence)
  for (const pattern of COMPOUND_PATTERNS) {
    if (pattern.regex.test(lowered)) {
      return {
        agents: pattern.agents,
        isMultiAgent: pattern.agents.length > 1,
        confidence: 0.9,
      }
    }
  }

  // 2. Score each agent by keyword matches
  const scores = scoreAgentKeywords(lowered)

  if (scores.size === 0) {
    return {
      agents: [],
      isMultiAgent: false,
      confidence: 0,
    }
  }

  // 3. Sort agents by match score (descending)
  const sorted = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([agentType]) => agentType)

  const totalMatches = [...scores.values()].reduce((sum, n) => sum + n, 0)

  return {
    agents: sorted,
    isMultiAgent: sorted.length > 1,
    confidence: computeKeywordConfidence(totalMatches, sorted.length),
  }
}
