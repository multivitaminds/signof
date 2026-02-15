import { useCallback } from 'react'
import { SkipForward, Upload, Calendar, DollarSign } from 'lucide-react'
import type { InterviewQuestion as InterviewQuestionType } from '../../types'
import './InterviewQuestion.css'

interface InterviewQuestionProps {
  question: InterviewQuestionType
  answer: string | number | boolean | undefined
  onAnswer: (questionId: string, value: string | number | boolean) => void
  onSkip: (questionId: string) => void
}

function InterviewQuestion({ question, answer, onAnswer, onSkip }: InterviewQuestionProps) {
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAnswer(question.id, e.target.value)
    },
    [question.id, onAnswer]
  )

  const handleCurrencyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0
      onAnswer(question.id, value)
    },
    [question.id, onAnswer]
  )

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onAnswer(question.id, e.target.value)
    },
    [question.id, onAnswer]
  )

  const handleYesNo = useCallback(
    (value: boolean) => {
      onAnswer(question.id, value)
    },
    [question.id, onAnswer]
  )

  const handleTileSelect = useCallback(
    (value: string) => {
      onAnswer(question.id, value)
    },
    [question.id, onAnswer]
  )

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAnswer(question.id, e.target.value)
    },
    [question.id, onAnswer]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onAnswer(question.id, file.name)
      }
    },
    [question.id, onAnswer]
  )

  const handleSkip = useCallback(() => {
    onSkip(question.id)
  }, [question.id, onSkip])

  const renderInput = () => {
    switch (question.inputType) {
      case 'text':
        return (
          <input
            type="text"
            className="interview-question__input"
            value={typeof answer === 'string' ? answer : ''}
            onChange={handleTextChange}
            placeholder="Type your answer..."
            aria-label={question.text}
          />
        )

      case 'currency':
        return (
          <div className="interview-question__currency-wrap">
            <span className="interview-question__currency-symbol">
              <DollarSign size={16} />
            </span>
            <input
              type="number"
              className="interview-question__input interview-question__input--currency"
              value={typeof answer === 'number' ? answer : ''}
              onChange={handleCurrencyChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              aria-label={question.text}
            />
          </div>
        )

      case 'select':
        return (
          <select
            className="interview-question__select"
            value={typeof answer === 'string' ? answer : ''}
            onChange={handleSelectChange}
            aria-label={question.text}
          >
            <option value="">Select an option...</option>
            {question.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )

      case 'yesno':
        return (
          <div className="interview-question__yesno">
            <button
              type="button"
              className={`interview-question__yesno-btn${answer === true ? ' interview-question__yesno-btn--active' : ''}`}
              onClick={() => handleYesNo(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`interview-question__yesno-btn${answer === false ? ' interview-question__yesno-btn--active' : ''}`}
              onClick={() => handleYesNo(false)}
            >
              No
            </button>
          </div>
        )

      case 'tile':
        return (
          <div className="interview-question__tiles">
            {question.options?.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`interview-question__tile${answer === opt.value ? ' interview-question__tile--selected' : ''}`}
                onClick={() => handleTileSelect(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )

      case 'upload':
        return (
          <label className="interview-question__upload">
            <Upload size={24} />
            <span className="interview-question__upload-text">
              {typeof answer === 'string' && answer
                ? answer
                : 'Click to upload or drag and drop'}
            </span>
            <input
              type="file"
              className="interview-question__upload-input"
              onChange={handleFileChange}
              aria-label={question.text}
            />
          </label>
        )

      case 'date':
        return (
          <div className="interview-question__date-wrap">
            <Calendar size={16} className="interview-question__date-icon" />
            <input
              type="date"
              className="interview-question__input interview-question__input--date"
              value={typeof answer === 'string' ? answer : ''}
              onChange={handleDateChange}
              aria-label={question.text}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="interview-question">
      <div className="interview-question__content">
        <h3 className="interview-question__text">{question.text}</h3>
        {question.helpText && (
          <p className="interview-question__help">{question.helpText}</p>
        )}
        <div className="interview-question__field">
          {renderInput()}
        </div>
      </div>
      <div className="interview-question__actions">
        <button
          type="button"
          className="btn-ghost interview-question__skip"
          onClick={handleSkip}
        >
          <SkipForward size={14} />
          <span>Skip</span>
        </button>
      </div>
    </div>
  )
}

export default InterviewQuestion
