import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IssueQuickCreate from './IssueQuickCreate'
import { IssueStatus } from '../../types'

describe('IssueQuickCreate', () => {
  const defaultProps = {
    projectId: 'proj-1',
    onCreateIssue: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger button initially', () => {
    render(<IssueQuickCreate {...defaultProps} />)
    expect(screen.getByText('New issue')).toBeInTheDocument()
  })

  it('shows input when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<IssueQuickCreate {...defaultProps} />)

    await user.click(screen.getByText('New issue'))
    expect(screen.getByPlaceholderText('Issue title... (Enter to create)')).toBeInTheDocument()
  })

  it('creates an issue on Enter and stays open', async () => {
    const user = userEvent.setup()
    const onCreateIssue = vi.fn()
    render(<IssueQuickCreate {...defaultProps} onCreateIssue={onCreateIssue} />)

    await user.click(screen.getByText('New issue'))
    const input = screen.getByPlaceholderText('Issue title... (Enter to create)')
    await user.type(input, 'New task{Enter}')

    expect(onCreateIssue).toHaveBeenCalledWith({
      projectId: 'proj-1',
      title: 'New task',
      status: undefined,
    })
    // Input should still be visible (rapid creation mode)
    expect(screen.getByPlaceholderText('Issue title... (Enter to create)')).toBeInTheDocument()
  })

  it('passes defaultStatus when creating', async () => {
    const user = userEvent.setup()
    const onCreateIssue = vi.fn()
    render(
      <IssueQuickCreate
        {...defaultProps}
        onCreateIssue={onCreateIssue}
        defaultStatus={IssueStatus.InProgress}
      />
    )

    await user.click(screen.getByText('New issue'))
    await user.type(
      screen.getByPlaceholderText('Issue title... (Enter to create)'),
      'Progress task{Enter}'
    )

    expect(onCreateIssue).toHaveBeenCalledWith({
      projectId: 'proj-1',
      title: 'Progress task',
      status: IssueStatus.InProgress,
    })
  })

  it('does not create an issue with empty title', async () => {
    const user = userEvent.setup()
    const onCreateIssue = vi.fn()
    render(<IssueQuickCreate {...defaultProps} onCreateIssue={onCreateIssue} />)

    await user.click(screen.getByText('New issue'))
    await user.type(
      screen.getByPlaceholderText('Issue title... (Enter to create)'),
      '   {Enter}'
    )

    expect(onCreateIssue).not.toHaveBeenCalled()
  })

  it('closes input on Escape', async () => {
    const user = userEvent.setup()
    render(<IssueQuickCreate {...defaultProps} />)

    await user.click(screen.getByText('New issue'))
    expect(screen.getByPlaceholderText('Issue title... (Enter to create)')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.getByText('New issue')).toBeInTheDocument()
  })

  it('applies board variant class', () => {
    render(<IssueQuickCreate {...defaultProps} variant="board" />)
    const trigger = screen.getByText('New issue').closest('button')
    expect(trigger?.className).toContain('quick-create--board')
  })

  it('applies list variant class', () => {
    render(<IssueQuickCreate {...defaultProps} variant="list" />)
    const trigger = screen.getByText('New issue').closest('button')
    expect(trigger?.className).toContain('quick-create--list')
  })

  it('has accessible label on trigger', () => {
    render(<IssueQuickCreate {...defaultProps} />)
    expect(screen.getByLabelText('Quick create issue')).toBeInTheDocument()
  })
})
