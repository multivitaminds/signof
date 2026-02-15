import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type InterviewSection,
  type InterviewSectionId,
  type InterviewAnswer,
  type TaxFiling,
  InterviewSectionStatus,
  FilingStatus,
} from '../types'

// ─── Default Sections ───────────────────────────────────────────────

const DEFAULT_SECTIONS: InterviewSection[] = [
  { id: 'personal_info', title: 'Personal Information', description: 'Name, SSN, and contact details', icon: 'User', status: 'not_started' },
  { id: 'filing_status', title: 'Filing Status', description: 'Single, married, head of household', icon: 'Users', status: 'not_started' },
  { id: 'dependents', title: 'Dependents', description: 'Children and other dependents', icon: 'Baby', status: 'not_started' },
  { id: 'income_w2', title: 'W-2 Income', description: 'Employment wages and salaries', icon: 'Briefcase', status: 'not_started' },
  { id: 'income_1099', title: '1099 Income', description: 'Freelance and contract income', icon: 'FileText', status: 'not_started' },
  { id: 'income_investments', title: 'Investment Income', description: 'Dividends, capital gains, interest', icon: 'TrendingUp', status: 'not_started' },
  { id: 'income_business', title: 'Business Income', description: 'Self-employment and business profits', icon: 'Store', status: 'not_started' },
  { id: 'income_other', title: 'Other Income', description: 'Rental, alimony, social security', icon: 'DollarSign', status: 'not_started' },
  { id: 'deductions_standard', title: 'Standard Deduction', description: 'Quick deduction based on filing status', icon: 'Calculator', status: 'not_started' },
  { id: 'deductions_itemized', title: 'Itemized Deductions', description: 'Mortgage, medical, charitable', icon: 'List', status: 'not_started' },
  { id: 'credits', title: 'Tax Credits', description: 'Child, education, energy credits', icon: 'Award', status: 'not_started' },
  { id: 'health_insurance', title: 'Health Insurance', description: 'ACA marketplace or employer', icon: 'Heart', status: 'not_started' },
  { id: 'estimated_payments', title: 'Estimated Payments', description: 'Quarterly tax payments made', icon: 'Calendar', status: 'not_started' },
  { id: 'bank_info', title: 'Bank Information', description: 'For refund direct deposit', icon: 'Landmark', status: 'not_started' },
  { id: 'review', title: 'Review & File', description: 'Final review before filing', icon: 'CheckCircle', status: 'not_started' },
]

// ─── Section Question Counts ────────────────────────────────────────
// Number of questions per section (used for progress calculation)

const SECTION_QUESTION_COUNTS: Record<InterviewSectionId, number> = {
  personal_info: 5,
  filing_status: 1,
  dependents: 3,
  income_w2: 4,
  income_1099: 3,
  income_investments: 4,
  income_business: 5,
  income_other: 3,
  deductions_standard: 1,
  deductions_itemized: 5,
  credits: 4,
  health_insurance: 2,
  estimated_payments: 2,
  bank_info: 3,
  review: 1,
}

// ─── Store Interface ────────────────────────────────────────────────

interface TaxInterviewState {
  sections: InterviewSection[]
  currentSectionId: InterviewSectionId
  currentQuestionIndex: number
  answers: Record<string, InterviewAnswer>
  selectedTopics: string[]
  filingType: 'individual' | 'business' | null
  refundEstimate: number
  isStarted: boolean
  isCompleted: boolean

  // Navigation
  startInterview: () => void
  goToSection: (sectionId: InterviewSectionId) => void
  nextQuestion: () => void
  prevQuestion: () => void
  answerQuestion: (questionId: string, value: string | number | boolean) => void
  skipSection: (sectionId: InterviewSectionId) => void

  // Topics
  toggleTopic: (topicId: string) => void
  setFilingType: (type: 'individual' | 'business') => void

  // Progress
  getOverallProgress: () => number
  getSectionProgress: (sectionId: InterviewSectionId) => number
  getCompletedSections: () => InterviewSectionId[]
  completeSection: (sectionId: InterviewSectionId) => void

  // Export
  exportToFilingData: () => Partial<TaxFiling>

  // Reset
  resetInterview: () => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useTaxInterviewStore = create<TaxInterviewState>()(
  persist(
    (set, get) => ({
      sections: DEFAULT_SECTIONS.map((s) => ({ ...s })),
      currentSectionId: 'personal_info' as InterviewSectionId,
      currentQuestionIndex: 0,
      answers: {},
      selectedTopics: [],
      filingType: null,
      refundEstimate: 0,
      isStarted: false,
      isCompleted: false,

      // ─── Navigation ─────────────────────────────────────────────────

      startInterview: () =>
        set({
          isStarted: true,
          currentSectionId: 'personal_info' as InterviewSectionId,
          currentQuestionIndex: 0,
          sections: DEFAULT_SECTIONS.map((s) =>
            s.id === 'personal_info'
              ? { ...s, status: InterviewSectionStatus.InProgress }
              : { ...s }
          ),
        }),

      goToSection: (sectionId) =>
        set((state) => ({
          currentSectionId: sectionId,
          currentQuestionIndex: 0,
          sections: state.sections.map((s) => {
            if (s.id === sectionId && s.status === InterviewSectionStatus.NotStarted) {
              return { ...s, status: InterviewSectionStatus.InProgress }
            }
            return s
          }),
        })),

      nextQuestion: () => {
        const state = get()
        const questionCount = SECTION_QUESTION_COUNTS[state.currentSectionId] ?? 1

        if (state.currentQuestionIndex < questionCount - 1) {
          set({ currentQuestionIndex: state.currentQuestionIndex + 1 })
        } else {
          // Move to next section
          const currentIdx = state.sections.findIndex(
            (s) => s.id === state.currentSectionId
          )
          if (currentIdx >= 0 && currentIdx < state.sections.length - 1) {
            const nextSection = state.sections[currentIdx + 1]!
            set((s) => ({
              currentSectionId: nextSection.id,
              currentQuestionIndex: 0,
              sections: s.sections.map((sec) => {
                if (sec.id === state.currentSectionId && sec.status === InterviewSectionStatus.InProgress) {
                  return { ...sec, status: InterviewSectionStatus.Completed }
                }
                if (sec.id === nextSection.id && sec.status === InterviewSectionStatus.NotStarted) {
                  return { ...sec, status: InterviewSectionStatus.InProgress }
                }
                return sec
              }),
            }))
          } else {
            // Last section completed
            set((s) => ({
              isCompleted: true,
              sections: s.sections.map((sec) =>
                sec.id === state.currentSectionId
                  ? { ...sec, status: InterviewSectionStatus.Completed }
                  : sec
              ),
            }))
          }
        }
      },

      prevQuestion: () => {
        const state = get()
        if (state.currentQuestionIndex > 0) {
          set({ currentQuestionIndex: state.currentQuestionIndex - 1 })
        } else {
          // Move to previous section
          const currentIdx = state.sections.findIndex(
            (s) => s.id === state.currentSectionId
          )
          if (currentIdx > 0) {
            const prevSection = state.sections[currentIdx - 1]!
            const prevQuestionCount = SECTION_QUESTION_COUNTS[prevSection.id] ?? 1
            set({
              currentSectionId: prevSection.id,
              currentQuestionIndex: prevQuestionCount - 1,
            })
          }
        }
      },

      answerQuestion: (questionId, value) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: {
              questionId,
              value,
              confirmedAt: new Date().toISOString(),
            },
          },
        })),

      skipSection: (sectionId) =>
        set((state) => {
          const currentIdx = state.sections.findIndex((s) => s.id === sectionId)
          const nextSection = currentIdx < state.sections.length - 1
            ? state.sections[currentIdx + 1]
            : null

          return {
            sections: state.sections.map((s) =>
              s.id === sectionId
                ? { ...s, status: InterviewSectionStatus.Skipped }
                : s
            ),
            ...(nextSection
              ? {
                  currentSectionId: nextSection.id,
                  currentQuestionIndex: 0,
                }
              : {}),
          }
        }),

      // ─── Topics ─────────────────────────────────────────────────────

      toggleTopic: (topicId) =>
        set((state) => ({
          selectedTopics: state.selectedTopics.includes(topicId)
            ? state.selectedTopics.filter((t) => t !== topicId)
            : [...state.selectedTopics, topicId],
        })),

      setFilingType: (type) => set({ filingType: type }),

      // ─── Progress ───────────────────────────────────────────────────

      getOverallProgress: () => {
        const { sections } = get()
        const completedOrSkipped = sections.filter(
          (s) =>
            s.status === InterviewSectionStatus.Completed ||
            s.status === InterviewSectionStatus.Skipped
        ).length
        return Math.round((completedOrSkipped / sections.length) * 100)
      },

      getSectionProgress: (sectionId) => {
        const { answers } = get()
        const questionCount = SECTION_QUESTION_COUNTS[sectionId] ?? 1
        const sectionAnswers = Object.keys(answers).filter((key) =>
          key.startsWith(`${sectionId}_`)
        ).length
        return Math.round((sectionAnswers / questionCount) * 100)
      },

      getCompletedSections: () => {
        const { sections } = get()
        return sections
          .filter((s) => s.status === InterviewSectionStatus.Completed)
          .map((s) => s.id)
      },

      completeSection: (sectionId) =>
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId
              ? { ...s, status: InterviewSectionStatus.Completed }
              : s
          ),
        })),

      // ─── Export ─────────────────────────────────────────────────────

      exportToFilingData: () => {
        const { answers } = get()

        const getAnswer = (key: string): string | number | boolean | undefined =>
          answers[key]?.value

        const firstName = getAnswer('personal_info_first_name')
        const lastName = getAnswer('personal_info_last_name')
        const ssn = getAnswer('personal_info_ssn')
        const email = getAnswer('personal_info_email')
        const phone = getAnswer('personal_info_phone')
        const street = getAnswer('personal_info_street')
        const apt = getAnswer('personal_info_apt')
        const city = getAnswer('personal_info_city')
        const addressState = getAnswer('personal_info_state')
        const zip = getAnswer('personal_info_zip')
        const filingStatus = getAnswer('filing_status_status')
        const wages = getAnswer('income_w2_wages')
        const otherIncome = getAnswer('income_1099_total')
        const useStandard = getAnswer('deductions_standard_use')

        const filingData: Partial<TaxFiling> = {}

        if (typeof firstName === 'string') filingData.firstName = firstName
        if (typeof lastName === 'string') filingData.lastName = lastName
        if (typeof ssn === 'string') filingData.ssn = ssn
        if (typeof email === 'string') filingData.email = email
        if (typeof phone === 'string') filingData.phone = phone

        if (typeof street === 'string' || typeof city === 'string') {
          filingData.address = {
            street: typeof street === 'string' ? street : '',
            apt: typeof apt === 'string' ? apt : '',
            city: typeof city === 'string' ? city : '',
            state: typeof addressState === 'string' ? addressState : '',
            zip: typeof zip === 'string' ? zip : '',
          }
        }

        if (typeof filingStatus === 'string') {
          const validStatuses = Object.values(FilingStatus)
          if (validStatuses.includes(filingStatus as typeof validStatuses[number])) {
            filingData.filingStatus = filingStatus as typeof validStatuses[number]
          }
        }

        if (typeof wages === 'number') filingData.wages = wages
        if (typeof otherIncome === 'number') filingData.otherIncome = otherIncome
        if (typeof useStandard === 'boolean') filingData.useStandardDeduction = useStandard

        return filingData
      },

      // ─── Reset ──────────────────────────────────────────────────────

      resetInterview: () =>
        set({
          sections: DEFAULT_SECTIONS.map((s) => ({ ...s })),
          currentSectionId: 'personal_info' as InterviewSectionId,
          currentQuestionIndex: 0,
          answers: {},
          selectedTopics: [],
          filingType: null,
          refundEstimate: 0,
          isStarted: false,
          isCompleted: false,
        }),
    }),
    {
      name: 'orchestree-tax-interview-storage',
      partialize: (state) => ({
        sections: state.sections,
        currentSectionId: state.currentSectionId,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        selectedTopics: state.selectedTopics,
        filingType: state.filingType,
        refundEstimate: state.refundEstimate,
        isStarted: state.isStarted,
        isCompleted: state.isCompleted,
      }),
    }
  )
)
