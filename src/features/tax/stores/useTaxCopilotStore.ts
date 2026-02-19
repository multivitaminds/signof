import { create } from 'zustand'
import { useTaxDocumentStore } from './useTaxDocumentStore'
import { useTaxFilingStore } from './useTaxFilingStore'
import { useTaxInterviewStore } from './useTaxInterviewStore'
import { TAX_FORM_LABELS, FILING_STATUS_LABELS, InterviewSectionStatus } from '../types'
import type { TaxFormType } from '../types'
import { copilotChat, copilotAnalysis } from '../../ai/lib/copilotLLM'

// ─── ID Generator ────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Types ──────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: string
}

export interface CopilotSuggestion {
  id: string
  type: 'tip' | 'warning' | 'deduction' | 'missing_info' | 'review'
  title: string
  description: string
  action?: { label: string; route?: string }
  dismissed: boolean
  sectionId?: string
}

// ─── Response Generator ─────────────────────────────────────────────

function generateResponse(userMessage: string, context?: string): string {
  const msg = userMessage.toLowerCase()

  // Read from other stores for context-aware answers
  const docState = useTaxDocumentStore.getState()
  const filingState = useTaxFilingStore.getState()
  const interviewState = useTaxInterviewStore.getState()

  // Keyword: deduction
  if (msg.includes('deduction')) {
    const filing = filingState.filings[0]
    if (filing) {
      if (filing.useStandardDeduction) {
        return `You're currently using the standard deduction of $${filing.standardDeduction.toLocaleString()}. If your itemized deductions (mortgage interest, state taxes, charitable contributions, medical expenses) exceed this amount, you may want to switch to itemized deductions for a larger tax benefit.`
      }
      return `You're currently using itemized deductions of $${filing.itemizedDeductions.toLocaleString()}. Make sure you have documentation for all claimed deductions. Common itemized deductions include mortgage interest (Form 1098), state/local taxes (up to $10,000 SALT cap), and charitable contributions.`
    }
    return 'The standard deduction for 2025 is $15,000 for single filers. If your itemized deductions exceed this amount, consider itemizing instead. Common deductions include mortgage interest, state and local taxes (SALT), charitable contributions, and medical expenses exceeding 7.5% of AGI.'
  }

  // Keyword: deadline
  if (msg.includes('deadline') || msg.includes('due date')) {
    return 'Key tax deadlines for 2025 tax year:\n- January 31, 2026: W-2 and 1099 forms due from employers/payers\n- April 15, 2026: Federal tax return filing deadline (Form 1040)\n- April 15, 2026: Last day to request an automatic 6-month extension (Form 4868)\n- October 15, 2026: Extended return deadline\n\nMake sure to file or request an extension by April 15 to avoid late-filing penalties.'
  }

  // Keyword: W-2
  if (msg.includes('w-2') || msg.includes('w2')) {
    const w2Docs = docState.documents.filter((d) => d.formType === 'w2')
    if (w2Docs.length > 0) {
      return `You have ${w2Docs.length} W-2 form(s) uploaded: ${w2Docs.map((d) => d.employerName).join(', ')}. The W-2 reports your wages, salary, and taxes withheld by your employer. Key boxes to verify: Box 1 (wages), Box 2 (federal tax withheld), Box 3 (Social Security wages), and Box 5 (Medicare wages). Make sure the amounts match your final pay stub.`
    }
    return 'A W-2 form reports wages, salary, and taxes withheld from employment. Your employer should provide this by January 31. Key information includes: Box 1 (total wages), Box 2 (federal income tax withheld), Box 3 (Social Security wages), and Box 5 (Medicare wages). Upload your W-2 in the Documents section to get started.'
  }

  // Keyword: 1099
  if (msg.includes('1099')) {
    const docs1099 = docState.documents.filter((d) => d.formType.startsWith('1099'))
    if (docs1099.length > 0) {
      const formTypes = docs1099.map((d) => TAX_FORM_LABELS[d.formType as TaxFormType] ?? d.formType)
      return `You have ${docs1099.length} 1099 form(s) uploaded: ${formTypes.join(', ')}. Each 1099 reports different types of income. 1099-NEC is for freelance/contract income (you may owe self-employment tax). 1099-INT is for interest income. 1099-DIV is for dividend income. All amounts should be reported on your tax return.`
    }
    return 'The 1099 series covers various types of non-employment income:\n- 1099-NEC: Freelance/contract income ($600+ threshold)\n- 1099-INT: Interest income from banks\n- 1099-DIV: Dividend income from investments\n- 1099-MISC: Miscellaneous income (rents, royalties)\n- 1099-K: Payment card/third-party transactions\n\nUpload any 1099 forms you receive in the Documents section.'
  }

  // Keyword: refund
  if (msg.includes('refund')) {
    const filing = filingState.filings[0]
    if (filing && filing.refundOrOwed !== 0) {
      if (filing.refundOrOwed < 0) {
        return `Based on your current filing, you're estimated to receive a refund of $${Math.abs(filing.refundOrOwed).toLocaleString()}. This is because your withholding ($${filing.withheld.toLocaleString()}) and estimated payments ($${filing.estimatedPayments.toLocaleString()}) exceeded your calculated federal tax of $${filing.federalTax.toLocaleString()}. To receive your refund via direct deposit, make sure your bank information is entered in the Bank Information section.`
      }
      return `Based on your current filing, you owe $${filing.refundOrOwed.toLocaleString()} in federal taxes. Your calculated tax is $${filing.federalTax.toLocaleString()}, but your withholding was only $${filing.withheld.toLocaleString()}. Consider making an estimated payment or adjusting your W-4 withholding for next year.`
    }
    return 'Your refund is calculated as: (Federal Tax Withheld + Estimated Payments) - Calculated Federal Tax. If the result is negative, you get a refund. Complete all income sections and verify your withholding amounts to see your estimated refund. Direct deposit is the fastest way to receive your refund (typically 21 days after e-filing).'
  }

  // Keyword: audit
  if (msg.includes('audit')) {
    return 'Tips to reduce audit risk:\n1. Report ALL income — the IRS receives copies of your W-2s and 1099s\n2. Be accurate with deductions — large charitable deductions relative to income can be a flag\n3. Keep documentation for all deductions and credits claimed\n4. Report crypto and digital asset transactions\n5. If self-employed, track business expenses carefully and separate personal from business\n6. File on time and double-check math\n7. The overall audit rate is about 0.4%, but it increases for higher income levels'
  }

  // Keyword: extension
  if (msg.includes('extension')) {
    return 'Filing an extension (Form 4868) gives you until October 15, 2026 to file your return. Important notes:\n- You must request the extension by April 15, 2026\n- An extension to FILE is NOT an extension to PAY — you must estimate and pay any taxes owed by April 15\n- Late payment penalties and interest apply to any unpaid balance after April 15\n- There is no penalty for filing an extension if you owe no taxes\n\nTo file an extension, use Form 4868 or request it through the IRS Free File program.'
  }

  // Keyword: status (filing status)
  if (msg.includes('filing status')) {
    const filing = filingState.filings[0]
    if (filing) {
      const statusLabel = FILING_STATUS_LABELS[filing.filingStatus]
      return `Your current filing status is "${statusLabel}". Your filing status affects your standard deduction amount, tax brackets, and eligibility for certain credits. The five filing statuses are: Single, Married Filing Jointly, Married Filing Separately, Head of Household, and Qualifying Surviving Spouse. Choose the one that gives you the lowest tax — if married, filing jointly usually provides the best benefit.`
    }
    return 'Your filing status determines your tax bracket and standard deduction. The five options are:\n1. Single — unmarried, no dependents\n2. Married Filing Jointly — married, combining income (usually best)\n3. Married Filing Separately — married, filing individual returns\n4. Head of Household — unmarried with qualifying dependent (better rates than Single)\n5. Qualifying Surviving Spouse — recently widowed with dependent child\n\nSelect your filing status in the interview section.'
  }

  // Context-aware: if the user is in a specific interview section
  if (context) {
    const section = interviewState.sections.find((s) => s.id === context)
    if (section) {
      return `You're currently working on the "${section.title}" section. ${section.description}. Complete this section and move to the next one. Your overall interview progress is ${interviewState.getOverallProgress()}%. If you need to skip this section, you can come back to it later.`
    }
  }

  // Fallback: generic helpful response
  const docCount = docState.documents.length
  const completedSections = interviewState.sections.filter(
    (s) => s.status === InterviewSectionStatus.Completed
  ).length
  const totalSections = interviewState.sections.length

  return `I'm your Tax Copilot — here to help with your 2025 tax return. You currently have ${docCount} document(s) uploaded and ${completedSections}/${totalSections} interview sections completed. I can help with:\n- Understanding tax forms (W-2, 1099, etc.)\n- Deduction strategies\n- Filing deadlines and extensions\n- Refund estimates\n- Audit risk tips\n\nWhat would you like to know?`
}

// ─── Store Interface ────────────────────────────────────────────────

interface TaxCopilotState {
  // Panel visibility
  isOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void

  // Messages
  messages: CopilotMessage[]
  isTyping: boolean
  sendMessage: (content: string, context?: string) => void
  clearMessages: () => void

  // Suggestions
  suggestions: CopilotSuggestion[]
  addSuggestion: (suggestion: Omit<CopilotSuggestion, 'id' | 'dismissed'>) => void
  dismissSuggestion: (id: string) => void
  getSuggestionsForSection: (sectionId: string) => CopilotSuggestion[]
  clearSuggestions: () => void

  // Analysis
  isAnalyzing: boolean
  lastAnalysis: {
    type: 'document' | 'filing' | 'deductions'
    summary: string
    items: string[]
    timestamp: string
  } | null
  analyzeDocuments: () => void
  reviewFiling: () => void
  suggestDeductions: () => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useTaxCopilotStore = create<TaxCopilotState>()(
  (set, get) => ({
    isOpen: false,
    messages: [],
    isTyping: false,
    suggestions: [],
    isAnalyzing: false,
    lastAnalysis: null,

    // ─── Panel ───────────────────────────────────────────────────────

    openPanel: () => set({ isOpen: true }),

    closePanel: () => set({ isOpen: false }),

    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

    // ─── Messages ────────────────────────────────────────────────────

    sendMessage: (content, context) => {
      const userMessage: CopilotMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        context,
      }

      set((state) => ({
        messages: [...state.messages, userMessage],
        isTyping: true,
      }))

      const docCount = useTaxDocumentStore.getState().documents.length
      const interviewProgress = useTaxInterviewStore.getState().getOverallProgress()
      const contextSummary = `${docCount} tax documents, interview ${interviewProgress}% complete`

      copilotChat('Tax', content, contextSummary, () => generateResponse(content, context))
        .then((responseContent) => {
          const assistantMessage: CopilotMessage = {
            id: generateId(),
            role: 'assistant',
            content: responseContent,
            timestamp: new Date().toISOString(),
          }

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isTyping: false,
          }))
        })
    },

    clearMessages: () => set({ messages: [], isTyping: false }),

    // ─── Suggestions ─────────────────────────────────────────────────

    addSuggestion: (suggestion) =>
      set((state) => ({
        suggestions: [
          ...state.suggestions,
          { ...suggestion, id: generateId(), dismissed: false },
        ],
      })),

    dismissSuggestion: (id) =>
      set((state) => ({
        suggestions: state.suggestions.map((s) =>
          s.id === id ? { ...s, dismissed: true } : s
        ),
      })),

    getSuggestionsForSection: (sectionId) => {
      return get().suggestions.filter(
        (s) => s.sectionId === sectionId && !s.dismissed
      )
    },

    clearSuggestions: () => set({ suggestions: [] }),

    // ─── Analysis ────────────────────────────────────────────────────

    analyzeDocuments: () => {
      set({ isAnalyzing: true })

      const docState = useTaxDocumentStore.getState()
      const documents = docState.documents
      const extractionResults = docState.extractionResults
      const dataContext = `${documents.length} tax documents`

      const fallbackFn = () => {
        const items: string[] = []
        const formTypeCounts: Record<string, number> = {}
        for (const doc of documents) {
          const label = TAX_FORM_LABELS[doc.formType as TaxFormType] ?? doc.formType
          formTypeCounts[label] = (formTypeCounts[label] ?? 0) + 1
        }
        for (const [formType, count] of Object.entries(formTypeCounts)) {
          items.push(`${count} ${formType} form(s)`)
        }
        const docsWithoutExtraction = documents.filter((d) => !extractionResults[d.id])
        if (docsWithoutExtraction.length > 0) items.push(`${docsWithoutExtraction.length} document(s) have not been extracted yet`)
        const issueDocs = documents.filter((d) => d.status === 'issue_found')
        if (issueDocs.length > 0) items.push(`${issueDocs.length} document(s) have issues that need attention`)
        if (docsWithoutExtraction.length > 0) {
          get().addSuggestion({ type: 'missing_info', title: 'Documents Need Extraction', description: `${docsWithoutExtraction.length} document(s) haven't been processed. Run extraction to capture field values.`, action: { label: 'Go to Documents', route: '/tax/documents' }, sectionId: 'documents' })
        }
        if (issueDocs.length > 0) {
          get().addSuggestion({ type: 'warning', title: 'Document Issues Found', description: `${issueDocs.length} document(s) have issues: ${issueDocs.map((d) => d.fileName).join(', ')}`, action: { label: 'Review Documents', route: '/tax/documents' }, sectionId: 'documents' })
        }
        const summary = documents.length > 0
          ? `Analyzed ${documents.length} document(s) across ${Object.keys(formTypeCounts).length} form type(s).`
          : 'No documents uploaded yet. Upload your tax documents to get started.'
        return { summary, items }
      }

      copilotAnalysis('Tax', 'documents', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'document', ...result, timestamp: new Date().toISOString() } })
        })
    },

    reviewFiling: () => {
      set({ isAnalyzing: true })

      const filingState = useTaxFilingStore.getState()
      const interviewState = useTaxInterviewStore.getState()
      const filing = filingState.filings[0]
      const dataContext = filing ? `Filing status: ${filing.filingStatus}, wages: $${filing.wages}` : 'No filing'

      const fallbackFn = () => {
        const items: string[] = []
        if (!filing) {
          return { summary: 'No filing found. Start a new filing to begin.', items: ['No active filing for the current tax year'] }
        }
        if (!filing.firstName || !filing.lastName) {
          items.push('Personal information is incomplete (missing name)')
          get().addSuggestion({ type: 'missing_info', title: 'Missing Personal Information', description: 'First name and last name are required for filing.', action: { label: 'Complete Info', route: '/tax/interview' }, sectionId: 'personal_info' })
        }
        if (!filing.ssn || filing.ssn === '') {
          items.push('SSN is missing')
          get().addSuggestion({ type: 'warning', title: 'SSN Required', description: 'Social Security Number is required for federal tax filing.', action: { label: 'Enter SSN', route: '/tax/interview' }, sectionId: 'personal_info' })
        }
        if (filing.wages === 0 && filing.otherIncome === 0) {
          items.push('No income reported — verify W-2 and 1099 data')
          get().addSuggestion({ type: 'warning', title: 'No Income Reported', description: 'Your filing shows $0 income. Make sure your W-2 and 1099 data are entered.', action: { label: 'Enter Income', route: '/tax/interview' }, sectionId: 'income_w2' })
        }
        if (filing.wages > 0 && filing.withheld === 0) {
          items.push('No federal tax withheld despite having wage income')
          get().addSuggestion({ type: 'warning', title: 'No Withholding Reported', description: 'You have wage income but $0 federal tax withheld. Check your W-2 Box 2.', sectionId: 'income_w2' })
        }
        const incompleteSections = interviewState.sections.filter((s) => s.status === InterviewSectionStatus.NotStarted || s.status === InterviewSectionStatus.InProgress)
        if (incompleteSections.length > 0) items.push(`${incompleteSections.length} interview section(s) incomplete`)
        const checklistProgress = filingState.checklistProgress()
        if (checklistProgress < 100) items.push(`Pre-filing checklist is ${checklistProgress}% complete`)
        if (!filing.address.street || !filing.address.city || !filing.address.zip) items.push('Mailing address is incomplete')
        const summary = items.length > 0 ? `Found ${items.length} item(s) to review before filing.` : 'Your filing looks good! All required fields are complete.'
        return { summary, items }
      }

      copilotAnalysis('Tax', 'filing review', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'filing', ...result, timestamp: new Date().toISOString() } })
        })
    },

    suggestDeductions: () => {
      set({ isAnalyzing: true })

      const interviewState = useTaxInterviewStore.getState()
      const filingState = useTaxFilingStore.getState()
      const docState = useTaxDocumentStore.getState()
      const filing = filingState.filings[0]
      const dataContext = `${docState.documents.length} documents, ${filing ? `filing status: ${filing.filingStatus}` : 'no filing'}`

      const fallbackFn = () => {
        const items: string[] = []
        const has1098 = docState.documents.some((d) => d.formType === '1098')
        if (has1098) {
          items.push('Mortgage interest deduction available (Form 1098 uploaded)')
          get().addSuggestion({ type: 'deduction', title: 'Mortgage Interest Deduction', description: 'You uploaded a 1098 form. Mortgage interest may be deductible if you itemize. Consider comparing standard vs. itemized deductions.', sectionId: 'deductions_itemized' })
        }
        const has1099NEC = docState.documents.some((d) => d.formType === '1099_nec')
        if (has1099NEC) {
          items.push('Self-employment deductions may apply (1099-NEC income)')
          get().addSuggestion({ type: 'deduction', title: 'Self-Employment Deductions', description: 'With 1099-NEC income, you may deduct business expenses, home office, health insurance premiums, and half of self-employment tax.', sectionId: 'income_1099' })
        }
        const has1098E = docState.documents.some((d) => d.formType === '1098_e')
        if (has1098E) {
          items.push('Student loan interest deduction available (Form 1098-E uploaded)')
          get().addSuggestion({ type: 'deduction', title: 'Student Loan Interest Deduction', description: 'You may deduct up to $2,500 in student loan interest. This is an above-the-line deduction (no itemizing required).', sectionId: 'deductions_standard' })
        }
        const has1098T = docState.documents.some((d) => d.formType === '1098_t')
        if (has1098T) {
          items.push('Education credits may apply (Form 1098-T uploaded)')
          get().addSuggestion({ type: 'tip', title: 'Education Tax Credits', description: 'With a 1098-T form, you may qualify for the American Opportunity Credit (up to $2,500) or Lifetime Learning Credit (up to $2,000).', sectionId: 'credits' })
        }
        if (filing && filing.useStandardDeduction) {
          items.push('Currently using standard deduction — review if itemizing would save more')
          get().addSuggestion({ type: 'tip', title: 'Consider Itemizing', description: `You're using the standard deduction ($${filing.standardDeduction.toLocaleString()}). If your mortgage interest, state taxes, and charitable giving exceed this amount, itemizing could save you money.`, sectionId: 'deductions_standard' })
        }
        const hasInvestmentDocs = docState.documents.some((d) => d.formType === '1099_div' || d.formType === '1099_int' || d.formType === '1099_b')
        if (hasInvestmentDocs) items.push('Investment income detected — check for tax-loss harvesting opportunities')
        if (interviewState.selectedTopics.includes('charitable')) items.push('Charitable contribution deductions available')
        const summary = items.length > 0
          ? `Found ${items.length} potential deduction(s) and tax-saving opportunities.`
          : 'No specific deduction suggestions at this time. Upload more documents or complete the interview to get personalized recommendations.'
        return { summary, items }
      }

      copilotAnalysis('Tax', 'deductions', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'deductions', ...result, timestamp: new Date().toISOString() } })
        })
    },
  })
)
