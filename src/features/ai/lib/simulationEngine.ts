import type { SimulationStep } from '../types'

export interface SimulationCallbacks {
  onStepStart: (stepIndex: number) => void
  onStepComplete: (stepIndex: number, output: string) => void
  onAllComplete: () => void
  onError: (stepIndex: number, error: string) => void
}

export interface SimulationController {
  pause: () => void
  resume: () => void
  cancel: () => void
}

const MOCK_OUTPUTS: string[] = [
  'Analysis complete. Found 3 key insights.',
  'Task completed successfully with no issues.',
  'Generated output based on input parameters.',
  'Processed all items. Results are ready.',
  'Finished step with optimal results.',
]

function getMockOutput(stepLabel: string): string {
  const index = Math.abs(hashCode(stepLabel)) % MOCK_OUTPUTS.length
  return MOCK_OUTPUTS[index]!
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}

export function runSimulation(
  steps: SimulationStep[],
  callbacks: SimulationCallbacks,
  startIndex = 0
): SimulationController {
  let currentIndex = startIndex
  let isPaused = false
  let isCancelled = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  function executeStep() {
    if (isCancelled || currentIndex >= steps.length) {
      if (!isCancelled) callbacks.onAllComplete()
      return
    }
    if (isPaused) return

    const step = steps[currentIndex]!
    callbacks.onStepStart(currentIndex)

    timeoutId = setTimeout(() => {
      if (isCancelled) return
      if (isPaused) return

      const output = getMockOutput(step.label)
      callbacks.onStepComplete(currentIndex, output)
      currentIndex++
      executeStep()
    }, step.durationMs)
  }

  executeStep()

  return {
    pause: () => {
      isPaused = true
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    },
    resume: () => {
      if (!isPaused) return
      isPaused = false
      executeStep()
    },
    cancel: () => {
      isCancelled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    },
  }
}
