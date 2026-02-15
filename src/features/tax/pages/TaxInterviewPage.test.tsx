import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TaxInterviewPage from './TaxInterviewPage'

// ─── Mocks ───────────────────────────────────────────────────────────────

const mockStartInterview = vi.fn()
const mockGoToSection = vi.fn()
const mockNextQuestion = vi.fn()
const mockPrevQuestion = vi.fn()
const mockAnswerQuestion = vi.fn()
const mockSkipSection = vi.fn()
const mockToggleTopic = vi.fn()
const mockCompleteSection = vi.fn()
const mockExportToFilingData = vi.fn(() => ({}))

vi.mock('../stores/useTaxInterviewStore', () => ({
  useTaxInterviewStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      sections: [
        { id: 'personal_info', title: 'Personal Information', description: 'Name, SSN', icon: 'User', status: 'not_started' },
        { id: 'filing_status', title: 'Filing Status', description: 'Filing type', icon: 'Users', status: 'not_started' },
        { id: 'review', title: 'Review & File', description: 'Final review', icon: 'CheckCircle', status: 'not_started' },
      ],
      currentSectionId: 'personal_info',
      currentQuestionIndex: 0,
      answers: {},
      selectedTopics: [],
      isStarted: false,
      startInterview: mockStartInterview,
      goToSection: mockGoToSection,
      nextQuestion: mockNextQuestion,
      prevQuestion: mockPrevQuestion,
      answerQuestion: mockAnswerQuestion,
      skipSection: mockSkipSection,
      toggleTopic: mockToggleTopic,
      getOverallProgress: () => 0,
      completeSection: mockCompleteSection,
      exportToFilingData: mockExportToFilingData,
    }),
}))

vi.mock('../stores/useTaxStore', () => ({
  useTaxStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activeTaxYear: '2025',
    }),
}))

const mockSubmitFiling = vi.fn()
const mockCreateFiling = vi.fn()
const mockUpdateFiling = vi.fn()

vi.mock('../stores/useTaxFilingStore', () => ({
  useTaxFilingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      submitFiling: mockSubmitFiling,
      getFilingByYear: () => undefined,
      createFiling: mockCreateFiling,
      updateFiling: mockUpdateFiling,
      confirmation: null,
    }),
}))

vi.mock('../lib/interviewQuestions', () => ({
  getQuestionsForSection: () => [],
  TAX_TOPICS: [
    { id: 'w2_income', label: 'W-2 Income', description: 'Wages from an employer', icon: 'briefcase' },
    { id: '1099_income', label: '1099 Income', description: 'Freelance or contract work', icon: 'file-text' },
  ],
}))

vi.mock('../components/InterviewQuestion/InterviewQuestion', () => ({
  default: () => <div data-testid="interview-question">InterviewQuestion</div>,
}))

vi.mock('../components/TopicTileGrid/TopicTileGrid', () => ({
  default: ({ topics, onToggle }: { topics: Array<{ id: string; label: string }>; onToggle: (id: string) => void }) => (
    <div data-testid="topic-tile-grid">
      {topics.map((t: { id: string; label: string }) => (
        <button key={t.id} onClick={() => onToggle(t.id)}>{t.label}</button>
      ))}
    </div>
  ),
}))

vi.mock('../components/RefundTracker/RefundTracker', () => ({
  default: () => <div data-testid="refund-tracker">RefundTracker</div>,
}))

vi.mock('../components/SectionNavSidebar/SectionNavSidebar', () => ({
  default: () => <div data-testid="section-nav">SectionNavSidebar</div>,
}))

vi.mock('../components/MilestoneCelebration/MilestoneCelebration', () => ({
  default: () => <div data-testid="milestone-celebration">MilestoneCelebration</div>,
}))

vi.mock('../components/CompleteCheck/CompleteCheck', () => ({
  default: () => <div data-testid="complete-check">CompleteCheck</div>,
}))

// ─── Tests ───────────────────────────────────────────────────────────────

describe('TaxInterviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the welcome phase by default', () => {
    render(
      <MemoryRouter>
        <TaxInterviewPage />
      </MemoryRouter>
    )

    expect(screen.getByText('File Your 2025 Taxes')).toBeInTheDocument()
    expect(screen.getByText(/Answer simple questions/)).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  it('shows welcome features list', () => {
    render(
      <MemoryRouter>
        <TaxInterviewPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Auto-import W-2 and 1099 data')).toBeInTheDocument()
    expect(screen.getByText('Guided step-by-step filing')).toBeInTheDocument()
    expect(screen.getByText('Maximize your refund')).toBeInTheDocument()
  })

  it('navigates to topics phase when Get Started is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <TaxInterviewPage />
      </MemoryRouter>
    )

    await user.click(screen.getByText('Get Started'))

    expect(screen.getByText('What applies to you this year?')).toBeInTheDocument()
    expect(screen.getByTestId('topic-tile-grid')).toBeInTheDocument()
  })

  it('shows topic tiles and Continue button in topics phase', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <TaxInterviewPage />
      </MemoryRouter>
    )

    await user.click(screen.getByText('Get Started'))

    expect(screen.getByText('W-2 Income')).toBeInTheDocument()
    expect(screen.getByText('1099 Income')).toBeInTheDocument()
    expect(screen.getByText('Continue')).toBeInTheDocument()
  })

  it('can navigate back from topics to welcome', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <TaxInterviewPage />
      </MemoryRouter>
    )

    await user.click(screen.getByText('Get Started'))
    expect(screen.getByText('What applies to you this year?')).toBeInTheDocument()

    await user.click(screen.getByText('Back'))
    expect(screen.getByText('File Your 2025 Taxes')).toBeInTheDocument()
  })

  it('calls toggleTopic when a topic tile is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <TaxInterviewPage />
      </MemoryRouter>
    )

    await user.click(screen.getByText('Get Started'))
    await user.click(screen.getByText('W-2 Income'))

    expect(mockToggleTopic).toHaveBeenCalledWith('w2_income')
  })

  it('calls startInterview when Continue is clicked and interview has not started', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <TaxInterviewPage />
      </MemoryRouter>
    )

    await user.click(screen.getByText('Get Started'))
    await user.click(screen.getByText('Continue'))

    expect(mockStartInterview).toHaveBeenCalled()
  })
})
