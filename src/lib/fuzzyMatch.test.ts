import { fuzzyMatch, highlightMatches } from './fuzzyMatch'

describe('fuzzyMatch', () => {
  it('returns null when query does not match target', () => {
    expect(fuzzyMatch('xyz', 'hello')).toBeNull()
  })

  it('returns a result for empty query', () => {
    const result = fuzzyMatch('', 'anything')
    expect(result).toEqual({ score: 0, matchedIndices: [] })
  })

  it('matches exact substring', () => {
    const result = fuzzyMatch('doc', 'Documents')
    expect(result).not.toBeNull()
    expect(result!.matchedIndices).toEqual([0, 1, 2])
  })

  it('matches non-consecutive characters', () => {
    const result = fuzzyMatch('dmt', 'Documents')
    expect(result).not.toBeNull()
    expect(result!.matchedIndices).toEqual([0, 4, 7])
  })

  it('is case insensitive', () => {
    const result = fuzzyMatch('DOC', 'documents')
    expect(result).not.toBeNull()
    expect(result!.matchedIndices).toEqual([0, 1, 2])
  })

  it('scores consecutive matches higher', () => {
    const consecutive = fuzzyMatch('doc', 'Documents')!
    const spread = fuzzyMatch('dmt', 'Documents')!
    expect(consecutive.score).toBeGreaterThan(spread.score)
  })

  it('gives word-boundary bonus', () => {
    const boundary = fuzzyMatch('np', 'New Page')!
    const interior = fuzzyMatch('np', 'snappy')!
    expect(boundary.score).toBeGreaterThan(interior.score)
  })

  it('gives start-of-string bonus', () => {
    const atStart = fuzzyMatch('h', 'Home')!
    const notStart = fuzzyMatch('h', 'oh')!
    expect(atStart.score).toBeGreaterThan(notStart.score)
  })

  it('returns null when not all chars match', () => {
    expect(fuzzyMatch('abcz', 'abc')).toBeNull()
  })
})

describe('highlightMatches', () => {
  it('returns single non-highlighted segment when no indices', () => {
    const result = highlightMatches('hello', [])
    expect(result).toEqual([{ text: 'hello', highlight: false }])
  })

  it('highlights consecutive matched chars', () => {
    const result = highlightMatches('Documents', [0, 1, 2])
    expect(result).toEqual([
      { text: 'Doc', highlight: true },
      { text: 'uments', highlight: false },
    ])
  })

  it('splits correctly for non-consecutive matches', () => {
    const result = highlightMatches('Documents', [0, 4, 7])
    expect(result).toEqual([
      { text: 'D', highlight: true },
      { text: 'ocu', highlight: false },
      { text: 'm', highlight: true },
      { text: 'en', highlight: false },
      { text: 't', highlight: true },
      { text: 's', highlight: false },
    ])
  })

  it('handles all characters highlighted', () => {
    const result = highlightMatches('ab', [0, 1])
    expect(result).toEqual([{ text: 'ab', highlight: true }])
  })
})
