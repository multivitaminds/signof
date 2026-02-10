import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PrioritySelect from './PrioritySelect'
import { IssuePriority, PRIORITY_CONFIG } from '../../types'

describe('PrioritySelect', () => {
  const defaultProps = {
    value: IssuePriority.Medium as IssuePriority,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger with current priority label and icon', () => {
    render(<PrioritySelect {...defaultProps} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('↑')).toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    const user = userEvent.setup()
    render(<PrioritySelect {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  it('shows all priority options', async () => {
    const user = userEvent.setup()
    render(<PrioritySelect {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(5)
    const optionTexts = options.map(o => o.textContent)
    for (const config of Object.values(PRIORITY_CONFIG)) {
      expect(optionTexts.some(t => t?.includes(config.label))).toBe(true)
    }
  })

  it('shows correct icons for each priority', async () => {
    const user = userEvent.setup()
    render(<PrioritySelect {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('!!!')).toBeInTheDocument()   // urgent
    expect(screen.getByText('↑↑')).toBeInTheDocument()    // high
    expect(screen.getByText('↓')).toBeInTheDocument()     // low
    expect(screen.getByText('—')).toBeInTheDocument()     // none
  })

  it('calls onChange with selected priority', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PrioritySelect {...defaultProps} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Urgent'))
    expect(onChange).toHaveBeenCalledWith(IssuePriority.Urgent)
  })

  it('closes dropdown after selection', async () => {
    const user = userEvent.setup()
    render(<PrioritySelect {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('High'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes dropdown on Escape', async () => {
    const user = userEvent.setup()
    render(<PrioritySelect {...defaultProps} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('navigates with arrow keys and selects with Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PrioritySelect value={IssuePriority.Urgent} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    // Arrow down from Urgent (index 0) to High (index 1)
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(IssuePriority.High)
  })

  it('hides label in compact mode', () => {
    render(<PrioritySelect {...defaultProps} compact />)
    expect(screen.queryByText('Medium')).not.toBeInTheDocument()
  })

  it('marks current value as selected', async () => {
    const user = userEvent.setup()
    render(<PrioritySelect {...defaultProps} value={IssuePriority.High} />)

    await user.click(screen.getByRole('button'))
    const selectedOption = screen.getByRole('option', { selected: true })
    expect(selectedOption).toHaveTextContent('High')
  })
})
