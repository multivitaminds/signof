// Model Selector — choose optimal model based on agent type, tenant plan, and availability

import { getAllProviders } from '../providers/index.js';
import { query } from '../db/postgres.js';
import { logger } from '../lib/logger.js';

interface ModelSelection {
  model: string;
  provider: string;
}

// Model tiers: map agent type → preferred model tier
const AGENT_MODEL_TIERS: Record<string, 'fast' | 'balanced' | 'powerful'> = {
  general: 'balanced',
  researcher: 'powerful',
  writer: 'balanced',
  coder: 'powerful',
  analyst: 'balanced',
  scheduler: 'fast',
  coordinator: 'balanced',
};

// Plan-based model limits
const PLAN_MODEL_ACCESS: Record<string, string[]> = {
  free: ['fast', 'balanced'],
  pro: ['fast', 'balanced', 'powerful'],
  enterprise: ['fast', 'balanced', 'powerful'],
};

// Model rankings by tier
const MODEL_RANKINGS: Record<string, Array<{ provider: string; model: string }>> = {
  fast: [
    { provider: 'google', model: 'gemini-2.0-flash' },
    { provider: 'groq', model: 'llama-3.3-70b-versatile' },
    { provider: 'mistral', model: 'mistral-small-latest' },
    { provider: 'deepseek', model: 'deepseek-chat' },
  ],
  balanced: [
    { provider: 'anthropic', model: 'claude-sonnet-4-5-20250929' },
    { provider: 'openai', model: 'gpt-4o' },
    { provider: 'google', model: 'gemini-2.5-pro' },
    { provider: 'mistral', model: 'mistral-large-latest' },
  ],
  powerful: [
    { provider: 'anthropic', model: 'claude-opus-4-6' },
    { provider: 'openai', model: 'gpt-4-turbo' },
    { provider: 'google', model: 'gemini-2.5-pro' },
    { provider: 'anthropic', model: 'claude-sonnet-4-5-20250929' },
  ],
};

/**
 * Select the best model for a given agent type and tenant.
 */
export async function selectModel(
  agentType: string,
  tenantId: string
): Promise<ModelSelection> {
  // 1. Determine desired tier
  const tier = AGENT_MODEL_TIERS[agentType] ?? 'balanced';

  // 2. Check tenant plan
  let plan = 'free';
  try {
    const result = await query<{ plan: string }>(
      'SELECT plan FROM tenants WHERE id = $1',
      [tenantId]
    );
    if (result.rows.length > 0) {
      plan = result.rows[0].plan;
    }
  } catch {
    // Default to free if DB check fails
  }

  // 3. Determine accessible tiers
  const accessibleTiers = PLAN_MODEL_ACCESS[plan] ?? PLAN_MODEL_ACCESS.free;
  const effectiveTier = accessibleTiers.includes(tier)
    ? tier
    : accessibleTiers[accessibleTiers.length - 1]; // Downgrade to best available

  // 4. Find available model from rankings
  const candidates = MODEL_RANKINGS[effectiveTier] ?? MODEL_RANKINGS.balanced;
  const providers = getAllProviders();

  for (const candidate of candidates) {
    const provider = providers.get(candidate.provider);
    if (provider?.isAvailable()) {
      return { model: candidate.model, provider: candidate.provider };
    }
  }

  // 5. Fallback: any available provider
  for (const [providerName, provider] of providers) {
    if (provider.isAvailable()) {
      logger.warn('Falling back to first available provider', { provider: providerName });
      return { model: 'default', provider: providerName };
    }
  }

  throw new Error('No LLM providers available');
}
