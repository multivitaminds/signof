import type { ModuleAddOn } from '../types'

export const MODULE_ADD_ONS: ModuleAddOn[] = [
  {
    id: 'tax-filing',
    name: 'Tax Filing',
    description: 'File federal and state tax returns directly from Orchestree.',
    monthlyPrice: 19,
    perUnit: 'per filing',
    includedInPlans: ['business', 'enterprise'],
  },
  {
    id: 'advanced-accounting',
    name: 'Advanced Accounting',
    description: 'Full double-entry bookkeeping, payroll, and financial reporting.',
    monthlyPrice: 10,
    includedInPlans: ['business', 'enterprise'],
  },
  {
    id: 'ai-copilot-pro',
    name: 'AI Copilot Pro',
    description: 'AI agent pipelines, canvas workflows, 1M token memory, and marketplace access.',
    monthlyPrice: 8,
    perUnit: 'per seat',
    includedInPlans: ['business', 'enterprise'],
  },
]
