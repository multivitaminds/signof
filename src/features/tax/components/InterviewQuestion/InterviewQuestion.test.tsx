import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InterviewQuestion from './InterviewQuestion'
import type { InterviewQuestion as InterviewQuestionType } from '../../types'

describe('InterviewQuestion', () => {
  const textQuestion: InterviewQuestionType = {
    id: 'q1',
    section: 'personal_info',
    text: 'What is your first name?',
    helpText: 'Enter your legal first name',
    inputType: 'text',
    fieldKey: 'firstName',
  }

  const currencyQuestion: InterviewQuestionType = {
    id: 'q2',
    section: 'income_w2',
    text: 'Total wages from W-2',
    helpText: 'Box 1 on your W-2',
    inputType: 'currency',
    fieldKey: 'wages',
  }

  const selectQuestion: InterviewQuestionType = {
    id: 'q3',
    section: 'filing_status',
    text: 'What is your filing status?',
    helpText: '',
    inputType: 'select',
    fieldKey: 'filingStatus',
    options: [
      { value: 'single', label: 'Single' },
      { value: 'married_joint', label: 'Married Filing Jointly' },
    ],
  }

  const yesnoQuestion: InterviewQuestionType = {
    id: 'q4',
    section: 'dependents',
    text: 'Do you have dependents?',
    helpText: 'Children or qualifying relatives',
    inputType: 'yesno',
    fieldKey: 'hasDependents',
  }

  const tileQuestion: InterviewQuestionType = {
    id: 'q5',
    section: 'deductions_standard',
    text: 'Choose your deduction type',
    helpText: '',
    inputType: 'tile',
    fieldKey: 'deductionType',
    options: [
      { value: 'standard', label: 'Standard Deduction' },
      { value: 'itemized', label: 'Itemized Deduction' },
    ],
  }

  const dateQuestion: InterviewQuestionType = {
    id: 'q6',
    section: 'personal_info',
    text: 'Date of birth',
    helpText: '',
    inputType: 'date',
    fieldKey: 'dob',
  }

  const uploadQuestion: InterviewQuestionType = {
    id: 'q7',
    section: 'income_w2',
    text: 'Upload your W-2',
    helpText: 'PDF or image format',
    inputType: 'upload',
    fieldKey: 'w2File',
  }

  const defaultProps = {
    question: textQuestion,
    answer: undefined as string | number | boolean | undefined,
    onAnswer: vi.fn(),
    onSkip: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onAnswer.mockClear()
    defaultProps.onSkip.mockClear()
  })

  it('renders the question text', () => {
    render(<InterviewQuestion {...defaultProps} />)
    expect(screen.getByText('What is your first name?')).toBeInTheDocument()
  })

  it('renders help text when provided', () => {
    render(<InterviewQuestion {...defaultProps} />)
    expect(screen.getByText('Enter your legal first name')).toBeInTheDocument()
  })

  it('does not render help text when empty', () => {
    render(
      <InterviewQuestion {...defaultProps} question={selectQuestion} />
    )
    expect(screen.queryByText('Enter your legal first name')).not.toBeInTheDocument()
  })

  it('renders a text input for text questions', () => {
    render(<InterviewQuestion {...defaultProps} />)
    expect(screen.getByLabelText('What is your first name?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your answer...')).toBeInTheDocument()
  })

  it('calls onAnswer when text input changes', async () => {
    const user = userEvent.setup()
    render(<InterviewQuestion {...defaultProps} />)
    await user.type(screen.getByLabelText('What is your first name?'), 'J')
    expect(defaultProps.onAnswer).toHaveBeenCalledWith('q1', 'J')
  })

  it('renders a currency input with dollar sign', () => {
    render(
      <InterviewQuestion
        {...defaultProps}
        question={currencyQuestion}
        answer={undefined}
      />
    )
    const input = screen.getByLabelText('Total wages from W-2')
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('step', '0.01')
  })

  it('calls onAnswer with parsed number for currency input', async () => {
    const user = userEvent.setup()
    render(
      <InterviewQuestion
        {...defaultProps}
        question={currencyQuestion}
        answer={undefined}
      />
    )
    const input = screen.getByLabelText('Total wages from W-2')
    await user.type(input, '5')
    expect(defaultProps.onAnswer).toHaveBeenCalledWith('q2', 5)
  })

  it('renders select with options', () => {
    render(
      <InterviewQuestion
        {...defaultProps}
        question={selectQuestion}
        answer=""
      />
    )
    expect(screen.getByLabelText('What is your filing status?')).toBeInTheDocument()
    expect(screen.getByText('Select an option...')).toBeInTheDocument()
    expect(screen.getByText('Single')).toBeInTheDocument()
    expect(screen.getByText('Married Filing Jointly')).toBeInTheDocument()
  })

  it('calls onAnswer when select changes', async () => {
    const user = userEvent.setup()
    render(
      <InterviewQuestion
        {...defaultProps}
        question={selectQuestion}
        answer=""
      />
    )
    await user.selectOptions(screen.getByLabelText('What is your filing status?'), 'single')
    expect(defaultProps.onAnswer).toHaveBeenCalledWith('q3', 'single')
  })

  it('renders yes/no buttons', () => {
    render(
      <InterviewQuestion
        {...defaultProps}
        question={yesnoQuestion}
        answer={undefined}
      />
    )
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument()
  })

  it('calls onAnswer with true when Yes is clicked', async () => {
    const user = userEvent.setup()
    render(
      <InterviewQuestion
        {...defaultProps}
        question={yesnoQuestion}
        answer={undefined}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    expect(defaultProps.onAnswer).toHaveBeenCalledWith('q4', true)
  })

  it('calls onAnswer with false when No is clicked', async () => {
    const user = userEvent.setup()
    render(
      <InterviewQuestion
        {...defaultProps}
        question={yesnoQuestion}
        answer={undefined}
      />
    )
    await user.click(screen.getByRole('button', { name: 'No' }))
    expect(defaultProps.onAnswer).toHaveBeenCalledWith('q4', false)
  })

  it('highlights active yes/no button', () => {
    render(
      <InterviewQuestion
        {...defaultProps}
        question={yesnoQuestion}
        answer={true}
      />
    )
    expect(screen.getByRole('button', { name: 'Yes' })).toHaveClass(
      'interview-question__yesno-btn--active'
    )
    expect(screen.getByRole('button', { name: 'No' })).not.toHaveClass(
      'interview-question__yesno-btn--active'
    )
  })

  it('renders tile options and selects on click', async () => {
    const user = userEvent.setup()
    render(
      <InterviewQuestion
        {...defaultProps}
        question={tileQuestion}
        answer={undefined}
      />
    )
    expect(screen.getByRole('button', { name: 'Standard Deduction' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Itemized Deduction' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Standard Deduction' }))
    expect(defaultProps.onAnswer).toHaveBeenCalledWith('q5', 'standard')
  })

  it('highlights selected tile', () => {
    render(
      <InterviewQuestion
        {...defaultProps}
        question={tileQuestion}
        answer="standard"
      />
    )
    expect(screen.getByRole('button', { name: 'Standard Deduction' })).toHaveClass(
      'interview-question__tile--selected'
    )
    expect(screen.getByRole('button', { name: 'Itemized Deduction' })).not.toHaveClass(
      'interview-question__tile--selected'
    )
  })

  it('renders date input', () => {
    render(
      <InterviewQuestion
        {...defaultProps}
        question={dateQuestion}
        answer=""
      />
    )
    const input = screen.getByLabelText('Date of birth')
    expect(input).toHaveAttribute('type', 'date')
  })

  it('renders upload area with default text', () => {
    render(
      <InterviewQuestion
        {...defaultProps}
        question={uploadQuestion}
        answer={undefined}
      />
    )
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument()
  })

  it('shows file name when a file answer is set', () => {
    render(
      <InterviewQuestion
        {...defaultProps}
        question={uploadQuestion}
        answer="my-w2.pdf"
      />
    )
    expect(screen.getByText('my-w2.pdf')).toBeInTheDocument()
  })

  it('calls onSkip with question id when Skip button is clicked', async () => {
    const user = userEvent.setup()
    render(<InterviewQuestion {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /skip/i }))
    expect(defaultProps.onSkip).toHaveBeenCalledWith('q1')
  })

  it('displays existing text answer value', () => {
    render(<InterviewQuestion {...defaultProps} answer="Jane" />)
    expect(screen.getByLabelText('What is your first name?')).toHaveValue('Jane')
  })
})
