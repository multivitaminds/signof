import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecurrenceEditor from './RecurrenceEditor'
import { RecurrenceFrequency, DayOfWeek } from '../../types'

describe('RecurrenceEditor', () => {
  const defaultProps = {
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with None selected by default', () => {
    render(<RecurrenceEditor {...defaultProps} />)
    const select = screen.getByLabelText(/Repeat/i) as HTMLSelectElement
    expect(select.value).toBe('none')
    expect(screen.getByText('Does not repeat')).toBeInTheDocument()
  })

  it('calls onChange with undefined when None is selected', async () => {
    const user = userEvent.setup()
    render(
      <RecurrenceEditor
        value={{ frequency: RecurrenceFrequency.Daily, interval: 1 }}
        onChange={defaultProps.onChange}
      />
    )
    const select = screen.getByLabelText(/Repeat/i)
    await user.selectOptions(select, 'none')
    expect(defaultProps.onChange).toHaveBeenCalledWith(undefined)
  })

  it('shows day-of-week selector for Weekly frequency', async () => {
    const user = userEvent.setup()
    render(<RecurrenceEditor {...defaultProps} />)
    const select = screen.getByLabelText(/Repeat/i)
    await user.selectOptions(select, RecurrenceFrequency.Weekly)
    expect(screen.getByRole('group', { name: /days of the week/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Monday')).toBeInTheDocument()
    expect(screen.getByLabelText('Friday')).toBeInTheDocument()
  })

  it('toggles day selection and calls onChange with daysOfWeek', async () => {
    const user = userEvent.setup()
    render(
      <RecurrenceEditor
        value={{
          frequency: RecurrenceFrequency.Weekly,
          interval: 1,
        }}
        onChange={defaultProps.onChange}
      />
    )
    const mondayBtn = screen.getByLabelText('Monday')
    await user.click(mondayBtn)
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: RecurrenceFrequency.Weekly,
        daysOfWeek: [DayOfWeek.Monday],
      })
    )
  })

  it('shows preview text for selected recurrence', () => {
    render(
      <RecurrenceEditor
        value={{
          frequency: RecurrenceFrequency.Weekly,
          interval: 1,
          daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Wednesday],
        }}
        onChange={defaultProps.onChange}
      />
    )
    expect(screen.getByText('Every Monday and Wednesday')).toBeInTheDocument()
  })

  it('shows end condition controls when frequency is set', async () => {
    const user = userEvent.setup()
    render(<RecurrenceEditor {...defaultProps} />)
    const select = screen.getByLabelText(/Repeat/i)
    await user.selectOptions(select, RecurrenceFrequency.Daily)
    expect(screen.getByLabelText(/Ends/i)).toBeInTheDocument()
    expect(screen.getByText('Every day')).toBeInTheDocument()
  })
})
