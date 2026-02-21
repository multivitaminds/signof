import { generateLocalSuggestion, getSmartSuggestion } from './smartComposeEngine'
import type { SmartComposeContext } from './smartComposeEngine'

vi.mock('../../ai/lib/copilotLLM', () => ({
  copilotChat: (_mod: string, _msg: string, _ctx: string, fallback: () => string) =>
    Promise.resolve(fallback()),
}))

describe('smartComposeEngine', () => {
  describe('generateLocalSuggestion', () => {
    it('returns null for short input', () => {
      expect(generateLocalSuggestion({ draft: 'hi' })).toBeNull()
    })

    it('returns null for unrecognized patterns', () => {
      expect(generateLocalSuggestion({ draft: 'the quick brown fox' })).toBeNull()
    })

    it('suggests completion for "thanks"', () => {
      expect(generateLocalSuggestion({ draft: 'thanks' })).toBe('thanks for the update!')
    })

    it('suggests completion for "can we"', () => {
      expect(generateLocalSuggestion({ draft: 'can we' })).toBe('can we schedule a time to discuss?')
    })

    it('suggests completion for "i think"', () => {
      expect(generateLocalSuggestion({ draft: 'i think' })).toBe('I think we should move forward with this approach.')
    })

    it('suggests completion for "sounds"', () => {
      expect(generateLocalSuggestion({ draft: 'sounds' })).toBe('sounds good, let me know if you need anything else.')
    })

    it('suggests completion for "lgtm"', () => {
      expect(generateLocalSuggestion({ draft: 'lgtm' })).toBe('LGTM! Ship it.')
    })

    it('is case insensitive', () => {
      expect(generateLocalSuggestion({ draft: 'Thanks' })).toBe('thanks for the update!')
    })
  })

  describe('getSmartSuggestion', () => {
    it('returns null for short input', async () => {
      const result = await getSmartSuggestion({ draft: 'hi' })
      expect(result).toBeNull()
    })

    it('returns local suggestion when LLM falls back', async () => {
      const ctx: SmartComposeContext = {
        draft: 'thanks',
        channelName: 'general',
      }
      const result = await getSmartSuggestion(ctx)
      expect(result).toBe('thanks for the update!')
    })

    it('returns null when no suggestion available', async () => {
      const ctx: SmartComposeContext = {
        draft: 'the quick brown fox',
        channelName: 'general',
      }
      const result = await getSmartSuggestion(ctx)
      expect(result).toBeNull()
    })
  })
})
