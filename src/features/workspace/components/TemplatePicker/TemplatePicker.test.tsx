import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TemplatePicker from './TemplatePicker'

describe('TemplatePicker', () => {
  it('renders templates', () => {
    render(<TemplatePicker onSelect={vi.fn()} onBlank={vi.fn()} />)
    expect(screen.getByText('Blank')).toBeInTheDocument()
    expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
    expect(screen.getByText('Project Brief')).toBeInTheDocument()
    expect(screen.getByText('Weekly Review')).toBeInTheDocument()
  })

  it('calls onBlank when blank template clicked', async () => {
    const onBlank = vi.fn()
    const user = userEvent.setup()
    render(<TemplatePicker onSelect={vi.fn()} onBlank={onBlank} />)
    await user.click(screen.getByText('Blank'))
    expect(onBlank).toHaveBeenCalled()
  })

  it('calls onSelect when non-blank template clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<TemplatePicker onSelect={onSelect} onBlank={vi.fn()} />)
    await user.click(screen.getByText('Meeting Notes'))
    expect(onSelect).toHaveBeenCalled()
    expect(onSelect.mock.calls[0]![0].id).toBe('meeting-notes')
  })
})
