import { countTokens, formatTokenCount, TOKEN_BUDGET } from './tokenCount'

describe('tokenCount', () => {
  describe('TOKEN_BUDGET', () => {
    it('is 1 million', () => {
      expect(TOKEN_BUDGET).toBe(1_000_000)
    })
  })

  describe('countTokens', () => {
    it('returns 0 for empty string', () => {
      expect(countTokens('')).toBe(0)
    })

    it('returns ceil(length / 4) for short text', () => {
      expect(countTokens('hi')).toBe(1) // ceil(2/4) = 1
      expect(countTokens('hello')).toBe(2) // ceil(5/4) = 2
    })

    it('returns exact quarter for multiples of 4', () => {
      expect(countTokens('abcd')).toBe(1) // ceil(4/4) = 1
      expect(countTokens('abcdefgh')).toBe(2) // ceil(8/4) = 2
    })

    it('handles longer text', () => {
      const text = 'a'.repeat(1000)
      expect(countTokens(text)).toBe(250)
    })
  })

  describe('formatTokenCount', () => {
    it('formats small numbers as-is', () => {
      expect(formatTokenCount(0)).toBe('0')
      expect(formatTokenCount(42)).toBe('42')
      expect(formatTokenCount(999)).toBe('999')
    })

    it('formats thousands with K suffix', () => {
      expect(formatTokenCount(1_000)).toBe('1.0K')
      expect(formatTokenCount(1_500)).toBe('1.5K')
      expect(formatTokenCount(50_000)).toBe('50.0K')
      expect(formatTokenCount(999_999)).toBe('1000.0K')
    })

    it('formats millions with M suffix', () => {
      expect(formatTokenCount(1_000_000)).toBe('1.0M')
      expect(formatTokenCount(1_500_000)).toBe('1.5M')
    })
  })
})
