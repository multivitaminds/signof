import { categorizeMessage, MessageCategory, CATEGORY_LABELS, CATEGORY_COLORS } from './messageCategorizer'

describe('messageCategorizer', () => {
  describe('categorizeMessage', () => {
    it('returns null for empty string', () => {
      expect(categorizeMessage('')).toBeNull()
    })

    it('returns null for uncategorizable messages', () => {
      expect(categorizeMessage('Hello everyone!')).toBeNull()
    })

    // Questions
    it('categorizes messages ending with ? as Question', () => {
      expect(categorizeMessage('When is the deadline?')).toBe(MessageCategory.Question)
    })

    it('categorizes "does anyone" as Question', () => {
      expect(categorizeMessage('Does anyone know the password')).toBe(MessageCategory.Question)
    })

    it('categorizes "can someone" as Question', () => {
      expect(categorizeMessage('Can someone review this PR')).toBe(MessageCategory.Question)
    })

    // Decisions
    it('categorizes "decided" as Decision', () => {
      expect(categorizeMessage('We decided to use React')).toBe(MessageCategory.Decision)
    })

    it('categorizes "let\'s go with" as Decision', () => {
      expect(categorizeMessage("Let's go with option B")).toBe(MessageCategory.Decision)
    })

    // Action Items
    it('categorizes "todo" as ActionItem', () => {
      expect(categorizeMessage('TODO: update the docs')).toBe(MessageCategory.ActionItem)
    })

    it('categorizes "needs to" as ActionItem', () => {
      expect(categorizeMessage('Someone needs to fix the build')).toBe(MessageCategory.ActionItem)
    })

    it('categorizes "please" followed by verb as ActionItem', () => {
      expect(categorizeMessage('Please review this by EOD')).toBe(MessageCategory.ActionItem)
    })

    // FYI
    it('categorizes "FYI" as FYI', () => {
      expect(categorizeMessage('FYI the server is down for maintenance')).toBe(MessageCategory.FYI)
    })

    it('categorizes "heads up" as FYI', () => {
      expect(categorizeMessage('Heads up: deploy at 3pm')).toBe(MessageCategory.FYI)
    })

    // Blockers
    it('categorizes "blocked" as Blocker', () => {
      expect(categorizeMessage('I am blocked on the API integration')).toBe(MessageCategory.Blocker)
    })

    it('categorizes "can\'t proceed" as Blocker', () => {
      expect(categorizeMessage("Can't proceed without credentials")).toBe(MessageCategory.Blocker)
    })

    // Priority: blocker > decision > action_item > question > fyi
    it('prioritizes blocker over question', () => {
      expect(categorizeMessage('I am blocked, can you help?')).toBe(MessageCategory.Blocker)
    })
  })

  describe('CATEGORY_LABELS', () => {
    it('has labels for all categories', () => {
      expect(Object.keys(CATEGORY_LABELS)).toHaveLength(5)
      expect(CATEGORY_LABELS[MessageCategory.Question]).toBe('Question')
      expect(CATEGORY_LABELS[MessageCategory.Decision]).toBe('Decision')
      expect(CATEGORY_LABELS[MessageCategory.ActionItem]).toBe('Action Item')
      expect(CATEGORY_LABELS[MessageCategory.FYI]).toBe('FYI')
      expect(CATEGORY_LABELS[MessageCategory.Blocker]).toBe('Blocker')
    })
  })

  describe('CATEGORY_COLORS', () => {
    it('has colors for all categories', () => {
      expect(Object.keys(CATEGORY_COLORS)).toHaveLength(5)
      for (const color of Object.values(CATEGORY_COLORS)) {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    })
  })
})
