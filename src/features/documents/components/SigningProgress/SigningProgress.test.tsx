import { render, screen } from '@testing-library/react'
import SigningProgress from './SigningProgress'
import { FieldType } from '../../../../types'

describe('SigningProgress', () => {
  it('displays field count text', () => {
    render(
      <SigningProgress
        totalFields={5}
        completedFields={2}
        currentFieldIndex={2}
        currentFieldType={FieldType.Signature}
      />
    )
    expect(screen.getByText('Field 3 of 5')).toBeInTheDocument()
  })

  it('renders a progress bar with correct aria attributes', () => {
    render(
      <SigningProgress
        totalFields={4}
        completedFields={1}
        currentFieldIndex={0}
        currentFieldType={FieldType.Text}
      />
    )
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '1')
    expect(bar).toHaveAttribute('aria-valuemax', '4')
  })

  it('shows current field type label', () => {
    render(
      <SigningProgress
        totalFields={3}
        completedFields={0}
        currentFieldIndex={0}
        currentFieldType={FieldType.Signature}
      />
    )
    expect(screen.getByText('Signature')).toBeInTheDocument()
  })

  it('shows correct fill width based on progress', () => {
    const { container } = render(
      <SigningProgress
        totalFields={4}
        completedFields={2}
        currentFieldIndex={1}
        currentFieldType={FieldType.Checkbox}
      />
    )
    const fill = container.querySelector('.signing-progress__bar-fill')
    expect(fill).toHaveStyle({ width: '50%' })
  })

  it('handles zero total fields without error', () => {
    const { container } = render(
      <SigningProgress
        totalFields={0}
        completedFields={0}
        currentFieldIndex={0}
        currentFieldType={FieldType.Text}
      />
    )
    const fill = container.querySelector('.signing-progress__bar-fill')
    expect(fill).toHaveStyle({ width: '0%' })
  })
})
