import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SelectionCheckbox from './SelectionCheckbox'

describe('SelectionCheckbox', () => {
  it('renders an unchecked checkbox', () => {
    render(
      <SelectionCheckbox checked={false} onChange={vi.fn()} ariaLabel="Select item" />,
    )
    const checkbox = screen.getByRole('checkbox', { name: 'Select item' })
    expect(checkbox).not.toBeChecked()
  })

  it('renders a checked checkbox', () => {
    render(
      <SelectionCheckbox checked={true} onChange={vi.fn()} ariaLabel="Select item" />,
    )
    const checkbox = screen.getByRole('checkbox', { name: 'Select item' })
    expect(checkbox).toBeChecked()
  })

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SelectionCheckbox checked={false} onChange={onChange} ariaLabel="Select item" />,
    )

    await user.click(screen.getByRole('checkbox', { name: 'Select item' }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('sets indeterminate state on the input element', () => {
    render(
      <SelectionCheckbox
        checked={false}
        indeterminate={true}
        onChange={vi.fn()}
        ariaLabel="Select all"
      />,
    )
    const checkbox = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement
    expect(checkbox.indeterminate).toBe(true)
  })

  it('renders check icon when checked and not indeterminate', () => {
    const { container } = render(
      <SelectionCheckbox checked={true} onChange={vi.fn()} ariaLabel="Select item" />,
    )
    // Check icon has a path with the checkmark d attribute
    const svgPath = container.querySelector('.selection-checkbox__indicator svg path')
    expect(svgPath).toBeInTheDocument()
  })

  it('renders minus icon when indeterminate', () => {
    const { container } = render(
      <SelectionCheckbox
        checked={false}
        indeterminate={true}
        onChange={vi.fn()}
        ariaLabel="Select all"
      />,
    )
    // Indeterminate icon has a line element
    const svgLine = container.querySelector('.selection-checkbox__indicator svg line')
    expect(svgLine).toBeInTheDocument()
  })
})
