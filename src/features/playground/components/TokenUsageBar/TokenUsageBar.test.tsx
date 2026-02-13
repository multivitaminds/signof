import { render, screen } from '@testing-library/react'
import TokenUsageBar from './TokenUsageBar'

describe('TokenUsageBar', () => {
  it('renders token values', () => {
    render(<TokenUsageBar used={1000} total={200000} />)
    expect(screen.getByText(/1\.0K.*200\.0K.*tokens/)).toBeInTheDocument()
  })

  it('shows low color class when usage is low', () => {
    render(<TokenUsageBar used={100} total={200000} />)
    expect(screen.getByTestId('token-bar-fill')).toHaveClass('token-usage-bar__fill--low')
  })

  it('shows high color class when usage exceeds 80%', () => {
    render(<TokenUsageBar used={170000} total={200000} />)
    expect(screen.getByTestId('token-bar-fill')).toHaveClass('token-usage-bar__fill--high')
  })
})
