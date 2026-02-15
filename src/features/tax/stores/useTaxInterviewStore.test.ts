import { useTaxInterviewStore } from './useTaxInterviewStore'
import { InterviewSectionStatus, FilingStatus } from '../types'
import type { InterviewSectionId } from '../types'

function resetStore() {
  useTaxInterviewStore.getState().resetInterview()
}

describe('useTaxInterviewStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('Initial state', () => {
    it('starts with 15 sections all not_started', () => {
      const { sections, isStarted, isCompleted } = useTaxInterviewStore.getState()
      expect(sections).toHaveLength(15)
      expect(sections.every((s) => s.status === InterviewSectionStatus.NotStarted)).toBe(true)
      expect(isStarted).toBe(false)
      expect(isCompleted).toBe(false)
    })

    it('starts on personal_info section at question index 0', () => {
      const { currentSectionId, currentQuestionIndex } = useTaxInterviewStore.getState()
      expect(currentSectionId).toBe('personal_info')
      expect(currentQuestionIndex).toBe(0)
    })
  })

  describe('startInterview', () => {
    it('marks isStarted true and sets personal_info to in_progress', () => {
      useTaxInterviewStore.getState().startInterview()

      const { isStarted, sections, currentSectionId } = useTaxInterviewStore.getState()
      expect(isStarted).toBe(true)
      expect(currentSectionId).toBe('personal_info')

      const personalInfo = sections.find((s) => s.id === 'personal_info')
      expect(personalInfo!.status).toBe(InterviewSectionStatus.InProgress)

      const others = sections.filter((s) => s.id !== 'personal_info')
      expect(others.every((s) => s.status === InterviewSectionStatus.NotStarted)).toBe(true)
    })
  })

  describe('Navigation', () => {
    it('goToSection changes current section and resets question index', () => {
      useTaxInterviewStore.getState().startInterview()
      useTaxInterviewStore.getState().goToSection('income_w2' as InterviewSectionId)

      const { currentSectionId, currentQuestionIndex, sections } = useTaxInterviewStore.getState()
      expect(currentSectionId).toBe('income_w2')
      expect(currentQuestionIndex).toBe(0)

      const w2Section = sections.find((s) => s.id === 'income_w2')
      expect(w2Section!.status).toBe(InterviewSectionStatus.InProgress)
    })

    it('nextQuestion increments question index within a section', () => {
      useTaxInterviewStore.getState().startInterview()
      // personal_info has 5 questions
      useTaxInterviewStore.getState().nextQuestion()

      expect(useTaxInterviewStore.getState().currentQuestionIndex).toBe(1)
    })

    it('nextQuestion advances to next section when at last question', () => {
      useTaxInterviewStore.getState().startInterview()
      // personal_info has 5 questions, advance through all
      for (let i = 0; i < 5; i++) {
        useTaxInterviewStore.getState().nextQuestion()
      }

      const { currentSectionId, currentQuestionIndex, sections } = useTaxInterviewStore.getState()
      expect(currentSectionId).toBe('filing_status')
      expect(currentQuestionIndex).toBe(0)

      const personalInfo = sections.find((s) => s.id === 'personal_info')
      expect(personalInfo!.status).toBe(InterviewSectionStatus.Completed)

      const filingStatus = sections.find((s) => s.id === 'filing_status')
      expect(filingStatus!.status).toBe(InterviewSectionStatus.InProgress)
    })

    it('prevQuestion decrements question index within a section', () => {
      useTaxInterviewStore.getState().startInterview()
      useTaxInterviewStore.getState().nextQuestion()
      useTaxInterviewStore.getState().nextQuestion()
      expect(useTaxInterviewStore.getState().currentQuestionIndex).toBe(2)

      useTaxInterviewStore.getState().prevQuestion()
      expect(useTaxInterviewStore.getState().currentQuestionIndex).toBe(1)
    })

    it('prevQuestion goes to previous section last question when at index 0', () => {
      useTaxInterviewStore.getState().startInterview()
      // Go to filing_status section
      for (let i = 0; i < 5; i++) {
        useTaxInterviewStore.getState().nextQuestion()
      }
      expect(useTaxInterviewStore.getState().currentSectionId).toBe('filing_status')
      expect(useTaxInterviewStore.getState().currentQuestionIndex).toBe(0)

      useTaxInterviewStore.getState().prevQuestion()
      // personal_info has 5 questions, should be at last index (4)
      expect(useTaxInterviewStore.getState().currentSectionId).toBe('personal_info')
      expect(useTaxInterviewStore.getState().currentQuestionIndex).toBe(4)
    })

    it('does not go before first section first question', () => {
      useTaxInterviewStore.getState().startInterview()
      useTaxInterviewStore.getState().prevQuestion()

      expect(useTaxInterviewStore.getState().currentSectionId).toBe('personal_info')
      expect(useTaxInterviewStore.getState().currentQuestionIndex).toBe(0)
    })
  })

  describe('answerQuestion', () => {
    it('stores an answer with a timestamp', () => {
      useTaxInterviewStore.getState().answerQuestion('personal_info_first_name', 'John')

      const { answers } = useTaxInterviewStore.getState()
      expect(answers['personal_info_first_name']).toBeDefined()
      expect(answers['personal_info_first_name']!.value).toBe('John')
      expect(answers['personal_info_first_name']!.questionId).toBe('personal_info_first_name')
      expect(answers['personal_info_first_name']!.confirmedAt).toBeTruthy()
    })
  })

  describe('skipSection', () => {
    it('marks section as skipped and advances to next', () => {
      useTaxInterviewStore.getState().startInterview()
      useTaxInterviewStore.getState().skipSection('personal_info' as InterviewSectionId)

      const { sections, currentSectionId } = useTaxInterviewStore.getState()
      const personalInfo = sections.find((s) => s.id === 'personal_info')
      expect(personalInfo!.status).toBe(InterviewSectionStatus.Skipped)
      expect(currentSectionId).toBe('filing_status')
    })
  })

  describe('Topics and filing type', () => {
    it('toggles topics on and off', () => {
      useTaxInterviewStore.getState().toggleTopic('w2_income')
      expect(useTaxInterviewStore.getState().selectedTopics).toContain('w2_income')

      useTaxInterviewStore.getState().toggleTopic('w2_income')
      expect(useTaxInterviewStore.getState().selectedTopics).not.toContain('w2_income')
    })

    it('sets filing type', () => {
      useTaxInterviewStore.getState().setFilingType('individual')
      expect(useTaxInterviewStore.getState().filingType).toBe('individual')

      useTaxInterviewStore.getState().setFilingType('business')
      expect(useTaxInterviewStore.getState().filingType).toBe('business')
    })
  })

  describe('Progress', () => {
    it('getOverallProgress returns 0 when nothing completed', () => {
      expect(useTaxInterviewStore.getState().getOverallProgress()).toBe(0)
    })

    it('getOverallProgress counts completed and skipped sections', () => {
      useTaxInterviewStore.getState().completeSection('personal_info' as InterviewSectionId)
      useTaxInterviewStore.getState().skipSection('filing_status' as InterviewSectionId)
      // 2 out of 15 sections = ~13%
      expect(useTaxInterviewStore.getState().getOverallProgress()).toBe(13)
    })

    it('getSectionProgress counts answers with section prefix', () => {
      // personal_info has 5 questions
      useTaxInterviewStore.getState().answerQuestion('personal_info_first_name', 'John')
      useTaxInterviewStore.getState().answerQuestion('personal_info_last_name', 'Doe')
      // 2 out of 5 = 40%
      expect(useTaxInterviewStore.getState().getSectionProgress('personal_info' as InterviewSectionId)).toBe(40)
    })

    it('getCompletedSections returns only completed section ids', () => {
      useTaxInterviewStore.getState().completeSection('personal_info' as InterviewSectionId)
      useTaxInterviewStore.getState().completeSection('income_w2' as InterviewSectionId)

      const completed = useTaxInterviewStore.getState().getCompletedSections()
      expect(completed).toHaveLength(2)
      expect(completed).toContain('personal_info')
      expect(completed).toContain('income_w2')
    })
  })

  describe('exportToFilingData', () => {
    it('exports answered personal info fields into filing data', () => {
      useTaxInterviewStore.getState().answerQuestion('personal_info_first_name', 'Jane')
      useTaxInterviewStore.getState().answerQuestion('personal_info_last_name', 'Smith')
      useTaxInterviewStore.getState().answerQuestion('personal_info_ssn', '123-45-6789')
      useTaxInterviewStore.getState().answerQuestion('personal_info_email', 'jane@test.com')
      useTaxInterviewStore.getState().answerQuestion('filing_status_status', FilingStatus.Single)

      const data = useTaxInterviewStore.getState().exportToFilingData()
      expect(data.firstName).toBe('Jane')
      expect(data.lastName).toBe('Smith')
      expect(data.ssn).toBe('123-45-6789')
      expect(data.email).toBe('jane@test.com')
      expect(data.filingStatus).toBe('single')
    })

    it('returns empty object when no answers exist', () => {
      const data = useTaxInterviewStore.getState().exportToFilingData()
      expect(Object.keys(data)).toHaveLength(0)
    })
  })

  describe('resetInterview', () => {
    it('resets all state back to initial values', () => {
      useTaxInterviewStore.getState().startInterview()
      useTaxInterviewStore.getState().answerQuestion('personal_info_first_name', 'Test')
      useTaxInterviewStore.getState().toggleTopic('w2_income')
      useTaxInterviewStore.getState().setFilingType('individual')

      useTaxInterviewStore.getState().resetInterview()

      const state = useTaxInterviewStore.getState()
      expect(state.isStarted).toBe(false)
      expect(state.isCompleted).toBe(false)
      expect(state.answers).toEqual({})
      expect(state.selectedTopics).toEqual([])
      expect(state.filingType).toBeNull()
      expect(state.currentSectionId).toBe('personal_info')
      expect(state.currentQuestionIndex).toBe(0)
    })
  })
})
