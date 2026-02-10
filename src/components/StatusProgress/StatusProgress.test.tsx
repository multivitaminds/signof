import { render, screen } from '@testing-library/react'
import StatusProgress from './StatusProgress'

describe('StatusProgress', () => {
  it('renders all 6 step labels', () => {
    render(<StatusProgress currentStatus="draft" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Sent')).toBeInTheDocument()
    expect(screen.getByText('Delivered')).toBeInTheDocument()
    expect(screen.getByText('Viewed')).toBeInTheDocument()
    expect(screen.getByText('Signed')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('marks draft/sent/delivered as completed and viewed as active for status viewed', () => {
    render(<StatusProgress currentStatus="viewed" />)

    // Draft, Sent, Delivered should be completed
    expect(screen.getByLabelText('Draft: completed')).toBeInTheDocument()
    expect(screen.getByLabelText('Sent: completed')).toBeInTheDocument()
    expect(screen.getByLabelText('Delivered: completed')).toBeInTheDocument()

    // Viewed should be active
    expect(screen.getByLabelText('Viewed: active')).toBeInTheDocument()

    // Signed, Completed should be future
    expect(screen.getByLabelText('Signed: future')).toBeInTheDocument()
    expect(screen.getByLabelText('Completed: future')).toBeInTheDocument()
  })

  it('marks draft as active and rest as future for status draft', () => {
    render(<StatusProgress currentStatus="draft" />)

    expect(screen.getByLabelText('Draft: active')).toBeInTheDocument()
    expect(screen.getByLabelText('Sent: future')).toBeInTheDocument()
    expect(screen.getByLabelText('Delivered: future')).toBeInTheDocument()
    expect(screen.getByLabelText('Viewed: future')).toBeInTheDocument()
    expect(screen.getByLabelText('Signed: future')).toBeInTheDocument()
    expect(screen.getByLabelText('Completed: future')).toBeInTheDocument()
  })

  it('marks all steps as completed for status completed', () => {
    render(<StatusProgress currentStatus="completed" />)

    expect(screen.getByLabelText('Draft: completed')).toBeInTheDocument()
    expect(screen.getByLabelText('Sent: completed')).toBeInTheDocument()
    expect(screen.getByLabelText('Delivered: completed')).toBeInTheDocument()
    expect(screen.getByLabelText('Viewed: completed')).toBeInTheDocument()
    expect(screen.getByLabelText('Signed: completed')).toBeInTheDocument()
    // The last step (completed) is the current/active step, but since it's
    // the currentStatus at the last position, it's actually active
    expect(screen.getByLabelText('Completed: active')).toBeInTheDocument()
  })

  it('handles declined status without crashing', () => {
    render(<StatusProgress currentStatus="declined" />)

    // All steps should show as declined
    expect(screen.getByLabelText('Draft: declined')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('handles voided status without crashing', () => {
    render(<StatusProgress currentStatus="voided" />)
    expect(screen.getByLabelText('Draft: declined')).toBeInTheDocument()
  })
})
