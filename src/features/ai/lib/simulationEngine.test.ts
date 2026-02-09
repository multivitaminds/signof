import { StepStatus } from '../types'
import type { SimulationStep } from '../types'
import { runSimulation } from './simulationEngine'
import type { SimulationCallbacks } from './simulationEngine'

function makeSteps(count: number, durationMs = 1000): SimulationStep[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `step-${i}`,
    label: `Step ${i + 1}`,
    status: StepStatus.Pending as typeof StepStatus.Pending,
    durationMs,
  }))
}

function makeCallbacks(overrides: Partial<SimulationCallbacks> = {}): SimulationCallbacks {
  return {
    onStepStart: vi.fn(),
    onStepComplete: vi.fn(),
    onAllComplete: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  }
}

describe('simulationEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts executing the first step immediately', () => {
    const steps = makeSteps(3)
    const callbacks = makeCallbacks()

    runSimulation(steps, callbacks)

    expect(callbacks.onStepStart).toHaveBeenCalledWith(0)
    expect(callbacks.onStepStart).toHaveBeenCalledTimes(1)
  })

  it('completes a step after its durationMs', () => {
    const steps = makeSteps(3, 2000)
    const callbacks = makeCallbacks()

    runSimulation(steps, callbacks)

    vi.advanceTimersByTime(2000)

    expect(callbacks.onStepComplete).toHaveBeenCalledWith(0, expect.any(String))
    expect(callbacks.onStepStart).toHaveBeenCalledWith(1)
  })

  it('calls onAllComplete after all steps finish', () => {
    const steps = makeSteps(2, 1000)
    const callbacks = makeCallbacks()

    runSimulation(steps, callbacks)

    vi.advanceTimersByTime(1000)
    expect(callbacks.onStepComplete).toHaveBeenCalledWith(0, expect.any(String))

    vi.advanceTimersByTime(1000)
    expect(callbacks.onStepComplete).toHaveBeenCalledWith(1, expect.any(String))
    expect(callbacks.onAllComplete).toHaveBeenCalledTimes(1)
  })

  it('pause stops execution, resume continues', () => {
    const steps = makeSteps(3, 1000)
    const callbacks = makeCallbacks()

    const controller = runSimulation(steps, callbacks)

    // Complete first step
    vi.advanceTimersByTime(1000)
    expect(callbacks.onStepComplete).toHaveBeenCalledTimes(1)

    // Pause during second step
    controller.pause()
    vi.advanceTimersByTime(5000)
    expect(callbacks.onStepComplete).toHaveBeenCalledTimes(1)

    // Resume
    controller.resume()
    expect(callbacks.onStepStart).toHaveBeenCalledWith(1)

    vi.advanceTimersByTime(1000)
    expect(callbacks.onStepComplete).toHaveBeenCalledTimes(2)
  })

  it('cancel stops execution permanently', () => {
    const steps = makeSteps(3, 1000)
    const callbacks = makeCallbacks()

    const controller = runSimulation(steps, callbacks)

    controller.cancel()
    vi.advanceTimersByTime(10000)

    expect(callbacks.onStepComplete).not.toHaveBeenCalled()
    expect(callbacks.onAllComplete).not.toHaveBeenCalled()
  })

  it('supports starting from a given index', () => {
    const steps = makeSteps(3, 1000)
    const callbacks = makeCallbacks()

    runSimulation(steps, callbacks, 1)

    expect(callbacks.onStepStart).toHaveBeenCalledWith(1)
    expect(callbacks.onStepStart).not.toHaveBeenCalledWith(0)
  })
})
