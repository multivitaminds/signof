import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StatusSelect from './StatusSelect'
import { IssueStatus, STATUS_CONFIG } from '../../types'

describe('StatusSelect', () => {
  const defaultProps = {
    value: IssueStatus.Todo as IssueStatus,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger with current status label and dot', () => {
    render(<StatusSelect {...defaultProps} />)
    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    const user = userEvent.setup()
    render(<StatusSelect {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    // All 6 statuses should appear
    expect(screen.getAllByRole('option')).toHaveLength(6)
  })

  it('shows all status options with labels', async () => {
    const user = userEvent.setup()
    render(<StatusSelect {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(6)
    const optionTexts = options.map(o => o.textContent)
    for (const config of Object.values(STATUS_CONFIG)) {
      expect(optionTexts).toContain(config.label)
    }
  })

  it('calls onChange with selected status', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StatusSelect {...defaultProps} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('In Progress'))
    expect(onChange).toHaveBeenCalledWith(IssueStatus.InProgress)
  })

  it('closes dropdown after selection', async () => {
    const user = userEvent.setup()
    render(<StatusSelect {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByText('Done'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes dropdown on Escape', async () => {
    const user = userEvent.setup()
    render(<StatusSelect {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('navigates with arrow keys and selects with Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StatusSelect value={IssueStatus.Backlog} onChange={onChange} />)

    // Open dropdown
    await user.click(screen.getByRole('button'))
    // Arrow down from Backlog (index 0) to Todo (index 1)
    await user.keyboard('{ArrowDown}')
    // Select with Enter
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(IssueStatus.Todo)
  })

  it('hides label in compact mode', () => {
    render(<StatusSelect {...defaultProps} compact />)
    expect(screen.queryByText('Todo')).not.toBeInTheDocument()
  })

  it('marks current value as selected', async () => {
    const user = userEvent.setup()
    render(<StatusSelect {...defaultProps} value={IssueStatus.Done} />)

    await user.click(screen.getByRole('button'))
    const selectedOption = screen.getByRole('option', { selected: true })
    expect(selectedOption).toHaveTextContent('Done')
  })
})
