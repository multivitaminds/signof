import {
  INTERVIEW_QUESTIONS,
  getQuestionsForSection,
  getQuestionById,
  TAX_TOPICS,
} from './interviewQuestions'
import { InterviewSectionId, InterviewQuestionType } from '../types'

describe('interviewQuestions', () => {
  describe('INTERVIEW_QUESTIONS data integrity', () => {
    it('has questions for all 15 interview sections', () => {
      const sectionIds = Object.values(InterviewSectionId)
      for (const sectionId of sectionIds) {
        const questions = INTERVIEW_QUESTIONS.filter((q) => q.section === sectionId)
        expect(questions.length).toBeGreaterThan(0)
      }
    })

    it('all questions have unique ids', () => {
      const ids = INTERVIEW_QUESTIONS.map((q) => q.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('all question ids are prefixed with their section id', () => {
      for (const q of INTERVIEW_QUESTIONS) {
        expect(q.id).toMatch(new RegExp(`^${q.section}_`))
      }
    })

    it('all questions have required fields', () => {
      for (const q of INTERVIEW_QUESTIONS) {
        expect(q.id).toBeTruthy()
        expect(q.section).toBeTruthy()
        expect(q.text).toBeTruthy()
        expect(q.helpText).toBeTruthy()
        expect(q.inputType).toBeTruthy()
        expect(q.fieldKey).toBeTruthy()
      }
    })

    it('select questions have options', () => {
      const selectQuestions = INTERVIEW_QUESTIONS.filter(
        (q) => q.inputType === InterviewQuestionType.Select
      )
      expect(selectQuestions.length).toBeGreaterThan(0)
      for (const q of selectQuestions) {
        expect(q.options).toBeDefined()
        expect(q.options!.length).toBeGreaterThan(0)
        for (const opt of q.options!) {
          expect(opt.value).toBeTruthy()
          expect(opt.label).toBeTruthy()
        }
      }
    })

    it('conditional questions reference valid question ids', () => {
      const allIds = new Set(INTERVIEW_QUESTIONS.map((q) => q.id))
      const conditional = INTERVIEW_QUESTIONS.filter((q) => q.conditional)
      expect(conditional.length).toBeGreaterThan(0)
      for (const q of conditional) {
        expect(allIds.has(q.conditional!.questionId)).toBe(true)
        expect(q.conditional!.value).toBeTruthy()
      }
    })

    it('uses valid input types from InterviewQuestionType', () => {
      const validTypes = Object.values(InterviewQuestionType)
      for (const q of INTERVIEW_QUESTIONS) {
        expect(validTypes).toContain(q.inputType)
      }
    })
  })

  describe('getQuestionsForSection', () => {
    it('returns questions for personal_info section', () => {
      const questions = getQuestionsForSection(InterviewSectionId.PersonalInfo)
      expect(questions.length).toBe(5)
      expect(questions.every((q) => q.section === InterviewSectionId.PersonalInfo)).toBe(true)
    })

    it('returns questions for filing_status section', () => {
      const questions = getQuestionsForSection(InterviewSectionId.FilingStatus)
      expect(questions.length).toBe(1)
    })

    it('returns questions for review section', () => {
      const questions = getQuestionsForSection(InterviewSectionId.Review)
      expect(questions.length).toBe(1)
      expect(questions[0]!.id).toBe('review_confirm')
    })

    it('returns empty array for nonexistent section', () => {
      const questions = getQuestionsForSection('nonexistent' as typeof InterviewSectionId.PersonalInfo)
      expect(questions).toHaveLength(0)
    })
  })

  describe('getQuestionById', () => {
    it('returns a question by its id', () => {
      const q = getQuestionById('personal_info_first_name')
      expect(q).toBeDefined()
      expect(q!.text).toBe('What is your first name?')
      expect(q!.fieldKey).toBe('firstName')
    })

    it('returns undefined for nonexistent id', () => {
      expect(getQuestionById('nonexistent_question')).toBeUndefined()
    })

    it('returns the filing status question with options', () => {
      const q = getQuestionById('filing_status_status')
      expect(q).toBeDefined()
      expect(q!.inputType).toBe(InterviewQuestionType.Select)
      expect(q!.options!.length).toBe(5)
      expect(q!.options!.map((o) => o.value)).toContain('single')
      expect(q!.options!.map((o) => o.value)).toContain('married_joint')
    })
  })

  describe('TAX_TOPICS', () => {
    it('has 9 tax topics', () => {
      expect(TAX_TOPICS).toHaveLength(9)
    })

    it('all topics have unique ids', () => {
      const ids = TAX_TOPICS.map((t) => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('all topics have required fields', () => {
      for (const topic of TAX_TOPICS) {
        expect(topic.id).toBeTruthy()
        expect(topic.label).toBeTruthy()
        expect(topic.description).toBeTruthy()
        expect(topic.icon).toBeTruthy()
      }
    })
  })
})
