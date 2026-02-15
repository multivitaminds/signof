import { useTaxStore } from '../stores/useTaxStore'
import { useTaxDocumentStore } from '../stores/useTaxDocumentStore'
import { useTaxFilingStore } from '../stores/useTaxFilingStore'
import { useTaxInterviewStore } from '../stores/useTaxInterviewStore'
import {
  TAX_FORM_LABELS,
  FILING_STATUS_LABELS,
  FILING_STATE_LABELS,
  InterviewSectionStatus,
} from '../types'
import type { TaxFormType, FilingStatus, FilingState } from '../types'
import type { DocReviewStatus } from '../stores/useTaxDocumentStore'
import { DOC_REVIEW_LABELS } from '../stores/useTaxDocumentStore'

// ─── Document Context ────────────────────────────────────────────────

export function buildDocumentContext(): string {
  const state = useTaxDocumentStore.getState()
  const { documents, extractionResults } = state

  if (documents.length === 0) {
    return 'Documents: No tax documents have been uploaded yet.'
  }

  const lines: string[] = [`Documents: ${documents.length} uploaded`]

  for (const doc of documents) {
    const formLabel = TAX_FORM_LABELS[doc.formType as TaxFormType] ?? doc.formType
    const statusLabel = DOC_REVIEW_LABELS[doc.status as DocReviewStatus] ?? doc.status
    const extraction = extractionResults[doc.id]

    let docLine = `  - ${doc.fileName} (${formLabel}, ${doc.taxYear}, ${statusLabel})`
    if (doc.employerName) {
      docLine += ` from ${doc.employerName}`
    }
    if (doc.issueNote) {
      docLine += ` [Issue: ${doc.issueNote}]`
    }
    lines.push(docLine)

    if (extraction && extraction.extractedAt) {
      const fieldSummary = extraction.fields
        .map((f) => `${f.key}: ${f.value}`)
        .join(', ')
      lines.push(`    Extracted: ${fieldSummary}`)
      if (extraction.warnings.length > 0) {
        lines.push(`    Warnings: ${extraction.warnings.join('; ')}`)
      }
    }
  }

  const verified = state.verifiedCount()
  const pending = state.pendingCount()
  const issues = state.issueCount()
  lines.push(`  Summary: ${verified} verified, ${pending} pending review, ${issues} with issues`)

  return lines.join('\n')
}

// ─── Filing Context ──────────────────────────────────────────────────

export function buildFilingContext(): string {
  const state = useTaxFilingStore.getState()
  const { filings, checklist, confirmation } = state

  if (filings.length === 0) {
    return 'Filing: No tax filings created yet.'
  }

  const lines: string[] = [`Filing: ${filings.length} filing(s)`]

  for (const filing of filings) {
    const stateLabel = FILING_STATE_LABELS[filing.state as FilingState] ?? filing.state
    const statusLabel = FILING_STATUS_LABELS[filing.filingStatus as FilingStatus] ?? filing.filingStatus

    lines.push(`  - Tax Year ${filing.taxYear} (${stateLabel})`)
    lines.push(`    Status: ${statusLabel}`)
    lines.push(`    Name: ${filing.firstName} ${filing.lastName}`)

    if (filing.address.city && filing.address.state) {
      lines.push(`    Location: ${filing.address.city}, ${filing.address.state} ${filing.address.zip}`)
    }

    lines.push(`    Wages: $${filing.wages.toLocaleString()}`)
    lines.push(`    Other Income: $${filing.otherIncome.toLocaleString()}`)
    lines.push(`    Total Income: $${filing.totalIncome.toLocaleString()}`)
    lines.push(
      `    Deduction: ${filing.useStandardDeduction ? 'Standard' : 'Itemized'} ($${filing.effectiveDeduction.toLocaleString()})`
    )
    lines.push(`    Taxable Income: $${filing.taxableIncome.toLocaleString()}`)
    lines.push(`    Federal Tax: $${filing.federalTax.toLocaleString()}`)
    lines.push(`    Withheld: $${filing.withheld.toLocaleString()}`)

    if (filing.refundOrOwed < 0) {
      lines.push(`    Estimated Refund: $${Math.abs(filing.refundOrOwed).toLocaleString()}`)
    } else if (filing.refundOrOwed > 0) {
      lines.push(`    Amount Owed: $${filing.refundOrOwed.toLocaleString()}`)
    } else {
      lines.push('    Balance: $0 (break even)')
    }

    if (filing.filedAt) {
      lines.push(`    Filed: ${filing.filedAt}`)
    }
  }

  // Checklist progress
  const completedChecklist = checklist.filter((c) => c.completed).length
  lines.push(`  Checklist: ${completedChecklist}/${checklist.length} items completed`)

  const incompleteItems = checklist.filter((c) => !c.completed)
  if (incompleteItems.length > 0) {
    lines.push(`  Remaining: ${incompleteItems.map((c) => c.label).join(', ')}`)
  }

  if (confirmation) {
    lines.push(`  Confirmation: Ref# ${confirmation.referenceNumber}, filed ${confirmation.filedAt}`)
    if (confirmation.isAmendment) {
      lines.push(`  Amendment: ${confirmation.amendmentReason}`)
    }
  }

  return lines.join('\n')
}

// ─── Interview Context ───────────────────────────────────────────────

export function buildInterviewContext(): string {
  const state = useTaxInterviewStore.getState()
  const { sections, answers, isStarted, isCompleted, filingType, selectedTopics } = state

  if (!isStarted) {
    return 'Interview: Not started yet.'
  }

  const lines: string[] = ['Interview:']

  if (isCompleted) {
    lines.push('  Status: Completed')
  } else {
    const currentSection = sections.find((s) => s.id === state.currentSectionId)
    lines.push(`  Status: In progress`)
    if (currentSection) {
      lines.push(`  Current Section: ${currentSection.title}`)
    }
    lines.push(`  Overall Progress: ${state.getOverallProgress()}%`)
  }

  if (filingType) {
    lines.push(`  Filing Type: ${filingType}`)
  }

  if (selectedTopics.length > 0) {
    lines.push(`  Selected Topics: ${selectedTopics.join(', ')}`)
  }

  // Section statuses
  lines.push('  Sections:')
  for (const section of sections) {
    const statusIcon =
      section.status === InterviewSectionStatus.Completed
        ? '[done]'
        : section.status === InterviewSectionStatus.InProgress
          ? '[in progress]'
          : section.status === InterviewSectionStatus.Skipped
            ? '[skipped]'
            : '[not started]'
    lines.push(`    ${statusIcon} ${section.title}`)
  }

  // Key answers
  const answerKeys = Object.keys(answers)
  if (answerKeys.length > 0) {
    lines.push(`  Answers provided: ${answerKeys.length}`)
    // Show a few key answers if available
    const keyFields = [
      'personal_info_first_name',
      'personal_info_last_name',
      'filing_status_status',
      'income_w2_wages',
      'income_1099_total',
    ]
    for (const field of keyFields) {
      const answer = answers[field]
      if (answer) {
        lines.push(`    ${field}: ${String(answer.value)}`)
      }
    }
  }

  return lines.join('\n')
}

// ─── Full Tax Context ────────────────────────────────────────────────

export function buildTaxContext(): string {
  const taxState = useTaxStore.getState()

  const lines: string[] = [
    '=== Tax Context ===',
    `Active Tax Year: ${taxState.activeTaxYear}`,
    `Environment: ${taxState.environment}`,
  ]

  // Deadlines
  const upcomingDeadlines = taxState.deadlines.filter((d) => !d.completed)
  if (upcomingDeadlines.length > 0) {
    lines.push(`Upcoming Deadlines: ${upcomingDeadlines.map((d) => `${d.title} (${d.date})`).join(', ')}`)
  }

  lines.push('')
  lines.push(buildDocumentContext())
  lines.push('')
  lines.push(buildFilingContext())
  lines.push('')
  lines.push(buildInterviewContext())
  lines.push('')
  lines.push('=== End Tax Context ===')

  return lines.join('\n')
}
