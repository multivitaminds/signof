export interface FuzzyMatchResult {
  score: number
  matchedIndices: number[]
}

export interface HighlightSegment {
  text: string
  highlight: boolean
}

/**
 * Fuzzy-match a query against a target string.
 * Returns a score and matched character indices, or null if no match.
 *
 * Scoring:
 * - Base: +1 per matched character
 * - Consecutive bonus: +3 per consecutive match
 * - Word-boundary bonus: +5 when match is at start of a word
 * - Start-of-string bonus: +7 when first match is at index 0
 */
export function fuzzyMatch(
  query: string,
  target: string
): FuzzyMatchResult | null {
  if (!query) return { score: 0, matchedIndices: [] }

  const queryLower = query.toLowerCase()
  const targetLower = target.toLowerCase()
  const matchedIndices: number[] = []

  let queryIdx = 0
  let targetIdx = 0

  while (queryIdx < queryLower.length && targetIdx < targetLower.length) {
    if (queryLower[queryIdx] === targetLower[targetIdx]) {
      matchedIndices.push(targetIdx)
      queryIdx++
    }
    targetIdx++
  }

  // All query chars must match
  if (queryIdx !== queryLower.length) return null

  // Calculate score
  let score = matchedIndices.length

  for (let i = 0; i < matchedIndices.length; i++) {
    const idx = matchedIndices[i]!

    // Consecutive bonus
    const prevIdx = matchedIndices[i - 1]
    if (i > 0 && prevIdx !== undefined && idx === prevIdx + 1) {
      score += 3
    }

    // Word-boundary bonus (start of string or preceded by space/punctuation)
    const prevChar = idx > 0 ? target[idx - 1] : undefined
    if (idx === 0 || (prevChar !== undefined && /[\s\-_./]/.test(prevChar))) {
      score += 5
    }
  }

  // Start-of-string bonus
  if (matchedIndices.length > 0 && matchedIndices[0] === 0) {
    score += 7
  }

  return { score, matchedIndices }
}

/**
 * Split text into segments with highlight info based on matched indices.
 */
export function highlightMatches(
  text: string,
  indices: number[]
): HighlightSegment[] {
  if (indices.length === 0) {
    return [{ text, highlight: false }]
  }

  const segments: HighlightSegment[] = []
  const indexSet = new Set(indices)
  let current = ''
  let currentHighlight = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]!
    const isMatch = indexSet.has(i)
    if (i === 0) {
      currentHighlight = isMatch
      current = char
    } else if (isMatch === currentHighlight) {
      current += char
    } else {
      segments.push({ text: current, highlight: currentHighlight })
      current = char
      currentHighlight = isMatch
    }
  }

  if (current) {
    segments.push({ text: current, highlight: currentHighlight })
  }

  return segments
}
