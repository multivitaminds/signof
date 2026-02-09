import { render, screen } from '@testing-library/react'
import { StepStatus } from '../../types'
import type { SimulationStep } from '../../types'
import ProgressPanel from './ProgressPanel'

function makeStep(overrides: Partial<SimulationStep> = {}): SimulationStep {
  return {
    id: 'step-1',
    label: 'Test step',
    status: StepStatus.Pending as typeof StepStatus.Pending,
    durationMs: 1000,
    ...overrides,
  }
}

describe('ProgressPanel', () => {
  it('renders all steps', () => {
    const steps = [
      makeStep({ id: 's1', label: 'Step one' }),
      makeStep({ id: 's2', label: 'Step two' }),
      makeStep({ id: 's3', label: 'Step three' }),
    ]

    render(<ProgressPanel steps={steps} />)

    expect(screen.getByText('Step one')).toBeInTheDocument()
    expect(screen.getByText('Step two')).toBeInTheDocument()
    expect(screen.getByText('Step three')).toBeInTheDocument()
  })

  it('shows output for completed steps', () => {
    const steps = [
      makeStep({
        id: 's1',
        label: 'Done step',
        status: StepStatus.Completed as typeof StepStatus.Completed,
        output: 'Result of computation',
      }),
    ]

    render(<ProgressPanel steps={steps} />)

    expect(screen.getByText('Result of computation')).toBeInTheDocument()
  })

  it('does not show output for pending steps', () => {
    const steps = [
      makeStep({
        id: 's1',
        label: 'Pending step',
        status: StepStatus.Pending as typeof StepStatus.Pending,
        output: 'Should not appear',
      }),
    ]

    render(<ProgressPanel steps={steps} />)

    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument()
  })

  it('renders correct status classes', () => {
    const steps = [
      makeStep({ id: 's1', label: 'Completed', status: StepStatus.Completed as typeof StepStatus.Completed }),
      makeStep({ id: 's2', label: 'Running', status: StepStatus.Running as typeof StepStatus.Running }),
      makeStep({ id: 's3', label: 'Pending', status: StepStatus.Pending as typeof StepStatus.Pending }),
      makeStep({ id: 's4', label: 'Error', status: StepStatus.Error as typeof StepStatus.Error }),
    ]

    const { container } = render(<ProgressPanel steps={steps} />)

    expect(container.querySelector('.progress-panel__step--completed')).toBeInTheDocument()
    expect(container.querySelector('.progress-panel__step--running')).toBeInTheDocument()
    expect(container.querySelector('.progress-panel__step--pending')).toBeInTheDocument()
    expect(container.querySelector('.progress-panel__step--error')).toBeInTheDocument()
  })

  it('has accessible role attributes', () => {
    const steps = [makeStep({ id: 's1', label: 'Step 1' })]

    render(<ProgressPanel steps={steps} />)

    expect(screen.getByRole('list', { name: 'Simulation progress' })).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toBeInTheDocument()
  })
})
