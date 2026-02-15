import { useState, useCallback, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  CheckCircle,
  ArrowRight,
  PartyPopper,
} from 'lucide-react'
import { useTaxInterviewStore } from '../stores/useTaxInterviewStore'
import { useTaxStore } from '../stores/useTaxStore'
import { useTaxFilingStore } from '../stores/useTaxFilingStore'
import { getQuestionsForSection, TAX_TOPICS } from '../lib/interviewQuestions'
import InterviewQuestion from '../components/InterviewQuestion/InterviewQuestion'
import TopicTileGrid from '../components/TopicTileGrid/TopicTileGrid'
import RefundTracker from '../components/RefundTracker/RefundTracker'
import SectionNavSidebar from '../components/SectionNavSidebar/SectionNavSidebar'
import MilestoneCelebration from '../components/MilestoneCelebration/MilestoneCelebration'
import CompleteCheck from '../components/CompleteCheck/CompleteCheck'
import type { InterviewSectionId } from '../types'
import './TaxInterviewPage.css'

type InterviewPhase = 'welcome' | 'topics' | 'questions' | 'review' | 'filed'

function TaxInterviewPage() {
  const [phase, setPhase] = useState<InterviewPhase>('welcome')
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationTitle, setCelebrationTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Interview store
  const sections = useTaxInterviewStore((s) => s.sections)
  const currentSectionId = useTaxInterviewStore((s) => s.currentSectionId)
  const currentQuestionIndex = useTaxInterviewStore((s) => s.currentQuestionIndex)
  const answers = useTaxInterviewStore((s) => s.answers)
  const selectedTopics = useTaxInterviewStore((s) => s.selectedTopics)
  const isStarted = useTaxInterviewStore((s) => s.isStarted)
  const startInterview = useTaxInterviewStore((s) => s.startInterview)
  const goToSection = useTaxInterviewStore((s) => s.goToSection)
  const nextQuestion = useTaxInterviewStore((s) => s.nextQuestion)
  const prevQuestion = useTaxInterviewStore((s) => s.prevQuestion)
  const answerQuestion = useTaxInterviewStore((s) => s.answerQuestion)
  const skipSection = useTaxInterviewStore((s) => s.skipSection)
  const toggleTopic = useTaxInterviewStore((s) => s.toggleTopic)
  const getOverallProgress = useTaxInterviewStore((s) => s.getOverallProgress)
  const completeSection = useTaxInterviewStore((s) => s.completeSection)
  const exportToFilingData = useTaxInterviewStore((s) => s.exportToFilingData)

  // Tax store
  const activeTaxYear = useTaxStore((s) => s.activeTaxYear)

  // Filing store
  const submitFiling = useTaxFilingStore((s) => s.submitFiling)
  const getFilingByYear = useTaxFilingStore((s) => s.getFilingByYear)
  const createFiling = useTaxFilingStore((s) => s.createFiling)
  const updateFiling = useTaxFilingStore((s) => s.updateFiling)
  const confirmation = useTaxFilingStore((s) => s.confirmation)

  // Current section questions
  const currentQuestions = useMemo(
    () => getQuestionsForSection(currentSectionId),
    [currentSectionId]
  )

  const currentQuestion = currentQuestions[currentQuestionIndex]
  const currentSection = sections.find((s) => s.id === currentSectionId)

  // Should show question based on conditional logic
  const shouldShowQuestion = useCallback(
    (_questionId: string, conditional?: { questionId: string; value: string }) => {
      if (!conditional) return true
      const condAnswer = answers[conditional.questionId]
      return condAnswer !== undefined && String(condAnswer.value) === conditional.value
    },
    [answers]
  )

  // Refund estimate (from filing data if available)
  const refundEstimate = useMemo(() => {
    const filing = getFilingByYear(activeTaxYear)
    if (filing) return filing.refundOrOwed
    return 0
  }, [getFilingByYear, activeTaxYear])

  const overallProgress = getOverallProgress()

  // ─── Phase Handlers ──────────────────────────────────────────────────

  const handleStartInterview = useCallback(() => {
    setPhase('topics')
  }, [])

  const handleTopicsContinue = useCallback(() => {
    if (!isStarted) {
      startInterview()
    }
    setPhase('questions')
  }, [isStarted, startInterview])

  const handleAnswer = useCallback(
    (questionId: string, value: string | number | boolean) => {
      answerQuestion(questionId, value)
    },
    [answerQuestion]
  )

  const handleSkipQuestion = useCallback(() => {
    nextQuestion()
  }, [nextQuestion])

  const handleNext = useCallback(() => {
    // Check if we are on the last question of this section
    const visibleQuestions = currentQuestions.filter((q) =>
      shouldShowQuestion(q.id, q.conditional)
    )
    const currentVisibleIndex = visibleQuestions.findIndex(
      (q) => q.id === currentQuestion?.id
    )
    const isLastInSection = currentVisibleIndex >= visibleQuestions.length - 1

    if (isLastInSection) {
      // Complete this section
      completeSection(currentSectionId)

      // Show celebration
      const sectionTitle = currentSection?.title ?? 'Section'
      setCelebrationTitle(sectionTitle)
      setShowCelebration(true)
    } else {
      nextQuestion()
    }
  }, [
    currentQuestions,
    currentQuestion,
    currentSectionId,
    currentSection,
    shouldShowQuestion,
    completeSection,
    nextQuestion,
  ])

  const handlePrev = useCallback(() => {
    prevQuestion()
  }, [prevQuestion])

  const handleCelebrationContinue = useCallback(() => {
    setShowCelebration(false)

    // Check if all sections are done
    const nextIncomplete = sections.find(
      (s) => s.status === 'not_started' || s.status === 'in_progress'
    )
    if (!nextIncomplete || nextIncomplete.id === 'review') {
      setPhase('review')
    } else {
      goToSection(nextIncomplete.id)
    }
  }, [sections, goToSection])

  const handleSectionClick = useCallback(
    (sectionId: InterviewSectionId) => {
      if (sectionId === 'review') {
        setPhase('review')
      } else {
        goToSection(sectionId)
        setPhase('questions')
      }
    },
    [goToSection]
  )

  const handleEditSection = useCallback(
    (sectionId: string) => {
      goToSection(sectionId as InterviewSectionId)
      setPhase('questions')
    },
    [goToSection]
  )

  const handleSkipSection = useCallback(() => {
    skipSection(currentSectionId)
    const currentIdx = sections.findIndex((s) => s.id === currentSectionId)
    const nextSection = currentIdx < sections.length - 1 ? sections[currentIdx + 1] : null
    if (!nextSection || nextSection.id === 'review') {
      setPhase('review')
    }
  }, [skipSection, currentSectionId, sections])

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true)

    // Export interview answers to filing data
    const filingData = exportToFilingData()

    // Get or create a filing for the active tax year
    let filing = getFilingByYear(activeTaxYear)
    if (!filing) {
      createFiling(activeTaxYear)
      filing = getFilingByYear(activeTaxYear)
    }

    if (filing) {
      updateFiling(filing.id, filingData)
      submitFiling(filing.id)
    }

    // Transition to filed phase after a short delay
    setTimeout(() => {
      setIsSubmitting(false)
      setPhase('filed')
    }, 2000)
  }, [
    exportToFilingData,
    getFilingByYear,
    activeTaxYear,
    createFiling,
    updateFiling,
    submitFiling,
  ])

  // ─── Render ──────────────────────────────────────────────────────────

  // Phase: Welcome
  if (phase === 'welcome') {
    return (
      <div className="tax-interview">
        <div className="tax-interview__welcome">
          <div className="tax-interview__welcome-icon">
            <Sparkles size={48} />
          </div>
          <h1 className="tax-interview__welcome-title">
            File Your {activeTaxYear} Taxes
          </h1>
          <p className="tax-interview__welcome-subtitle">
            Answer simple questions and we will handle the rest. Most people finish in under 30 minutes.
          </p>
          <div className="tax-interview__welcome-features">
            <div className="tax-interview__feature">
              <FileText size={20} />
              <span>Auto-import W-2 and 1099 data</span>
            </div>
            <div className="tax-interview__feature">
              <CheckCircle size={20} />
              <span>Guided step-by-step filing</span>
            </div>
            <div className="tax-interview__feature">
              <Sparkles size={20} />
              <span>Maximize your refund</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-primary tax-interview__start-btn"
            onClick={handleStartInterview}
          >
            <span>Get Started</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  // Phase: Topic Selection
  if (phase === 'topics') {
    return (
      <div className="tax-interview">
        <div className="tax-interview__topics">
          <h2 className="tax-interview__topics-title">
            What applies to you this year?
          </h2>
          <p className="tax-interview__topics-subtitle">
            Select all that apply. We will customize your interview based on your selections.
          </p>
          <TopicTileGrid
            topics={TAX_TOPICS.map((t) => ({
              id: t.id,
              label: t.label,
              description: t.description,
              icon: t.icon,
            }))}
            selectedTopics={selectedTopics}
            onToggle={toggleTopic}
          />
          <div className="tax-interview__topics-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setPhase('welcome')}
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleTopicsContinue}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Phase: Filed celebration
  if (phase === 'filed') {
    return (
      <div className="tax-interview">
        <div className="tax-interview__filed">
          <div className="tax-interview__filed-icon">
            <PartyPopper size={64} />
          </div>
          <h1 className="tax-interview__filed-title">Your Taxes Are Filed!</h1>
          <p className="tax-interview__filed-subtitle">
            Your {activeTaxYear} tax return has been submitted successfully.
          </p>
          {confirmation && (
            <div className="tax-interview__filed-details">
              <div className="tax-interview__filed-row">
                <span>Reference Number</span>
                <strong>{confirmation.referenceNumber}</strong>
              </div>
              {confirmation.estimatedRefund !== null && (
                <div className="tax-interview__filed-row tax-interview__filed-row--refund">
                  <span>Estimated Refund</span>
                  <strong>
                    ${confirmation.estimatedRefund.toLocaleString('en-US')}
                  </strong>
                </div>
              )}
              {confirmation.estimatedOwed !== null && confirmation.estimatedOwed > 0 && (
                <div className="tax-interview__filed-row tax-interview__filed-row--owed">
                  <span>Amount Owed</span>
                  <strong>
                    ${confirmation.estimatedOwed.toLocaleString('en-US')}
                  </strong>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            className="btn-primary tax-interview__filed-btn"
            onClick={() => setPhase('welcome')}
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  // Phase: Review
  if (phase === 'review') {
    return (
      <div className="tax-interview">
        <div className="tax-interview__layout">
          <SectionNavSidebar
            sections={sections}
            currentSectionId={'review' as InterviewSectionId}
            onSectionClick={handleSectionClick}
          />
          <div className="tax-interview__main">
            <RefundTracker
              amount={Math.abs(refundEstimate)}
              isRefund={refundEstimate <= 0}
            />
            <CompleteCheck
              sections={sections}
              answers={answers}
              onEditSection={handleEditSection}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    )
  }

  // Phase: Questions (milestone celebration overlay)
  if (showCelebration) {
    return (
      <div className="tax-interview">
        <MilestoneCelebration
          sectionTitle={celebrationTitle}
          onContinue={handleCelebrationContinue}
        />
      </div>
    )
  }

  // Phase: Questions (main interview)
  // Find the visible question to display
  const visibleQuestions = currentQuestions.filter((q) =>
    shouldShowQuestion(q.id, q.conditional)
  )
  const displayQuestion = visibleQuestions.length > 0
    ? visibleQuestions[Math.min(currentQuestionIndex, visibleQuestions.length - 1)]
    : null

  return (
    <div className="tax-interview">
      <div className="tax-interview__layout">
        <SectionNavSidebar
          sections={sections}
          currentSectionId={currentSectionId}
          onSectionClick={handleSectionClick}
        />
        <div className="tax-interview__main">
          <RefundTracker
            amount={Math.abs(refundEstimate)}
            isRefund={refundEstimate <= 0}
          />

          {/* Progress bar */}
          <div className="tax-interview__progress">
            <div className="tax-interview__progress-bar">
              <div
                className="tax-interview__progress-fill"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="tax-interview__progress-text">
              {overallProgress}% complete
            </span>
          </div>

          {/* Section header */}
          <div className="tax-interview__section-header">
            <h2 className="tax-interview__section-title">
              {currentSection?.title}
            </h2>
            <p className="tax-interview__section-desc">
              {currentSection?.description}
            </p>
          </div>

          {/* Question */}
          {displayQuestion ? (
            <div className="tax-interview__question-container">
              <InterviewQuestion
                question={displayQuestion}
                answer={answers[displayQuestion.id]?.value}
                onAnswer={handleAnswer}
                onSkip={handleSkipQuestion}
              />
            </div>
          ) : (
            <div className="tax-interview__empty-section">
              <p>No questions in this section.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="tax-interview__nav">
            <button
              type="button"
              className="btn-ghost tax-interview__nav-btn"
              onClick={handlePrev}
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            <button
              type="button"
              className="btn-ghost tax-interview__skip-section"
              onClick={handleSkipSection}
            >
              Skip this section
            </button>
            <button
              type="button"
              className="btn-primary tax-interview__nav-btn"
              onClick={handleNext}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxInterviewPage
