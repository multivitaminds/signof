// Model pricing table — prices per 1K tokens

interface ModelPricing {
  inputPer1k: number;
  outputPer1k: number;
}

const PRICING: Record<string, Record<string, ModelPricing>> = {
  anthropic: {
    'claude-sonnet-4-20250514': { inputPer1k: 0.003, outputPer1k: 0.015 },
    'claude-haiku-4-20250514': { inputPer1k: 0.00025, outputPer1k: 0.00125 },
  },
  openai: {
    'gpt-4o': { inputPer1k: 0.0025, outputPer1k: 0.01 },
    'gpt-4o-mini': { inputPer1k: 0.00015, outputPer1k: 0.0006 },
  },
  google: {
    'gemini-2.0-flash': { inputPer1k: 0.0001, outputPer1k: 0.0004 },
    'gemini-2.5-pro': { inputPer1k: 0.00125, outputPer1k: 0.01 },
  },
  deepseek: {
    'deepseek-chat': { inputPer1k: 0.00014, outputPer1k: 0.00028 },
    'deepseek-reasoner': { inputPer1k: 0.00055, outputPer1k: 0.00219 },
  },
  mistral: {
    'mistral-large-latest': { inputPer1k: 0.002, outputPer1k: 0.006 },
    'mistral-small-latest': { inputPer1k: 0.0002, outputPer1k: 0.0006 },
  },
  groq: {
    'llama-3.3-70b-versatile': { inputPer1k: 0.00059, outputPer1k: 0.00079 },
    'mixtral-8x7b-32768': { inputPer1k: 0.00024, outputPer1k: 0.00024 },
  },
  xai: {
    'grok-3': { inputPer1k: 0.003, outputPer1k: 0.015 },
    'grok-3-mini': { inputPer1k: 0.0003, outputPer1k: 0.0005 },
  },
  minimax: {
    'minimax-01': { inputPer1k: 0.0007, outputPer1k: 0.0007 },
  },
};

const DEFAULT_PRICING: ModelPricing = { inputPer1k: 0.003, outputPer1k: 0.015 };

export function getModelPrice(provider: string, model: string): ModelPricing {
  const providerPricing = PRICING[provider];
  if (!providerPricing) return DEFAULT_PRICING;

  // Try exact match first
  const exactMatch = providerPricing[model];
  if (exactMatch) return exactMatch;

  // Try partial match (model IDs sometimes have version suffixes)
  for (const [key, pricing] of Object.entries(providerPricing)) {
    if (model.startsWith(key) || key.startsWith(model)) {
      return pricing;
    }
  }

  return DEFAULT_PRICING;
}

export function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = getModelPrice(provider, model);
  return (inputTokens * pricing.inputPer1k + outputTokens * pricing.outputPer1k) / 1000;
}
