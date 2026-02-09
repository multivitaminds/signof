export const TOKEN_BUDGET = 1_000_000

export function countTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
