import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SectionNavSidebar from './SectionNavSidebar'
import { InterviewSectionStatus } from '../../types'
import type { InterviewSection, InterviewSectionId } from '../../types'

const makeSections = (overrides?: Partial<InterviewSection>[]): InterviewSection[] => {
  const defaults: InterviewSection[] = [
    {
      id: 'personal_info' as InterviewSectionId,
      title: 'Personal Info',
      description: 'Name, SSN, address',
      icon: 'user',
      status: InterviewSectionStatus.Completed,
    },
    {
      id: 'filing_status' as InterviewSectionId,
      title: 'Filing Status',
      description: 'Choose your filing status',
      icon: 'file',
      status: InterviewSectionStatus.InProgress,
    },
    {
      id: 'dependents' as InterviewSectionId,
      title: 'Dependents',
      description: 'Add dependents',
      icon: 'users',
      status: InterviewSectionStatus.NotStarted,
    },
    {
      id: 'income_w2' as InterviewSectionId,
      title: 'W-2 Income',
      description: 'Enter W-2 wages',
      icon: 'dollar',
      status: InterviewSectionStatus.Skipped,
    },
  ]
  if (overrides) {
    return defaults.map((s, i) => ({ ...s, ...overrides[i] }))
  }
  return defaults
}

describe('SectionNavSidebar', () => {
  const defaultProps = {
    sections: makeSections(),
    currentSectionId: 'filing_status' as InterviewSectionId,
    onSectionClick: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onSectionClick.mockClear()
  })

  it('renders a nav with correct aria-label', () => {
    render(<SectionNavSidebar {...defaultProps} />)
    expect(screen.getByRole('navigation', { name: 'Interview sections' })).toBeInTheDocument()
  })

  it('renders all section titles', () => {
    render(<SectionNavSidebar {...defaultProps} />)
    expect(screen.getByText('Personal Info')).toBeInTheDocument()
    expect(screen.getByText('Filing Status')).toBeInTheDocument()
    expect(screen.getByText('Dependents')).toBeInTheDocument()
    expect(screen.getByText('W-2 Income')).toBeInTheDocument()
  })

  it('renders all section descriptions', () => {
    render(<SectionNavSidebar {...defaultProps} />)
    expect(screen.getByText('Name, SSN, address')).toBeInTheDocument()
    expect(screen.getByText('Choose your filing status')).toBeInTheDocument()
    expect(screen.getByText('Add dependents')).toBeInTheDocument()
    expect(screen.getByText('Enter W-2 wages')).toBeInTheDocument()
  })

  it('applies --current class to the current section', () => {
    render(<SectionNavSidebar {...defaultProps} />)
    const currentButton = screen.getByText('Filing Status').closest('button')!
    expect(currentButton.className).toContain('section-nav-sidebar__item--current')
  })

  it('does not apply --current class to non-current sections', () => {
    render(<SectionNavSidebar {...defaultProps} />)
    const otherButton = screen.getByText('Personal Info').closest('button')!
    expect(otherButton.className).not.toContain('section-nav-sidebar__item--current')
  })

  it('sets aria-current="step" on the current section button', () => {
    render(<SectionNavSidebar {...defaultProps} />)
    const currentButton = screen.getByText('Filing Status').closest('button')!
    expect(currentButton).toHaveAttribute('aria-current', 'step')
  })

  it('does not set aria-current on non-current section buttons', () => {
    render(<SectionNavSidebar {...defaultProps} />)
    const otherButton = screen.getByText('Dependents').closest('button')!
    expect(otherButton).not.toHaveAttribute('aria-current')
  })

  it('applies status-based CSS classes to each item', () => {
    render(<SectionNavSidebar {...defaultProps} />)
    const completedBtn = screen.getByText('Personal Info').closest('button')!
    expect(completedBtn.className).toContain('section-nav-sidebar__item--completed')

    const inProgressBtn = screen.getByText('Filing Status').closest('button')!
    expect(inProgressBtn.className).toContain('section-nav-sidebar__item--in_progress')

    const notStartedBtn = screen.getByText('Dependents').closest('button')!
    expect(notStartedBtn.className).toContain('section-nav-sidebar__item--not_started')

    const skippedBtn = screen.getByText('W-2 Income').closest('button')!
    expect(skippedBtn.className).toContain('section-nav-sidebar__item--skipped')
  })

  it('calls onSectionClick with the correct section id on click', async () => {
    const user = userEvent.setup()
    render(<SectionNavSidebar {...defaultProps} />)
    await user.click(screen.getByText('Dependents').closest('button')!)
    expect(defaultProps.onSectionClick).toHaveBeenCalledWith('dependents')
  })

  it('calls onSectionClick for different sections', async () => {
    const user = userEvent.setup()
    render(<SectionNavSidebar {...defaultProps} />)
    await user.click(screen.getByText('Personal Info').closest('button')!)
    expect(defaultProps.onSectionClick).toHaveBeenCalledWith('personal_info')
  })

  it('renders an empty list when no sections are provided', () => {
    render(
      <SectionNavSidebar
        sections={[]}
        currentSectionId={'personal_info' as InterviewSectionId}
        onSectionClick={defaultProps.onSectionClick}
      />
    )
    const list = screen.getByRole('list')
    expect(list.children).toHaveLength(0)
  })
})
