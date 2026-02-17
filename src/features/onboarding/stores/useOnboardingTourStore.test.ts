import { act } from '@testing-library/react'
import useOnboardingTourStore from './useOnboardingTourStore'

describe('useOnboardingTourStore', () => {
  beforeEach(() => {
    act(() => {
      useOnboardingTourStore.setState({
        completedTours: [],
        currentTourId: null,
        currentStepIndex: 0,
        isActive: false,
      })
    })
  })

  it('starts a tour', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('welcome')
    })
    const state = useOnboardingTourStore.getState()
    expect(state.isActive).toBe(true)
    expect(state.currentTourId).toBe('welcome')
    expect(state.currentStepIndex).toBe(0)
  })

  it('does not start an unknown tour', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('nonexistent')
    })
    const state = useOnboardingTourStore.getState()
    expect(state.isActive).toBe(false)
    expect(state.currentTourId).toBeNull()
  })

  it('advances to the next step', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('welcome')
    })
    act(() => {
      useOnboardingTourStore.getState().nextStep()
    })
    expect(useOnboardingTourStore.getState().currentStepIndex).toBe(1)
  })

  it('goes back to the previous step', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('welcome')
    })
    act(() => {
      useOnboardingTourStore.getState().nextStep()
    })
    act(() => {
      useOnboardingTourStore.getState().prevStep()
    })
    expect(useOnboardingTourStore.getState().currentStepIndex).toBe(0)
  })

  it('does not go below step 0', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('welcome')
    })
    act(() => {
      useOnboardingTourStore.getState().prevStep()
    })
    expect(useOnboardingTourStore.getState().currentStepIndex).toBe(0)
  })

  it('completes the tour when nextStep is called on the last step', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('welcome')
    })
    // Welcome tour has 5 steps (indices 0-4)
    for (let i = 0; i < 5; i++) {
      act(() => {
        useOnboardingTourStore.getState().nextStep()
      })
    }
    const state = useOnboardingTourStore.getState()
    expect(state.isActive).toBe(false)
    expect(state.currentTourId).toBeNull()
    expect(state.completedTours).toContain('welcome')
  })

  it('skips the tour and marks as completed', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('welcome')
    })
    act(() => {
      useOnboardingTourStore.getState().skipTour()
    })
    const state = useOnboardingTourStore.getState()
    expect(state.isActive).toBe(false)
    expect(state.completedTours).toContain('welcome')
  })

  it('completes the tour explicitly', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('first-document')
    })
    act(() => {
      useOnboardingTourStore.getState().completeTour()
    })
    const state = useOnboardingTourStore.getState()
    expect(state.isActive).toBe(false)
    expect(state.completedTours).toContain('first-document')
  })

  it('shouldShowTour returns true for uncompleted tours', () => {
    expect(useOnboardingTourStore.getState().shouldShowTour('welcome')).toBe(true)
  })

  it('shouldShowTour returns false for completed tours', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('welcome')
    })
    act(() => {
      useOnboardingTourStore.getState().completeTour()
    })
    expect(useOnboardingTourStore.getState().shouldShowTour('welcome')).toBe(false)
  })

  it('resets all tours', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('welcome')
    })
    act(() => {
      useOnboardingTourStore.getState().completeTour()
    })
    act(() => {
      useOnboardingTourStore.getState().resetTours()
    })
    const state = useOnboardingTourStore.getState()
    expect(state.completedTours).toEqual([])
    expect(state.isActive).toBe(false)
    expect(state.currentTourId).toBeNull()
  })
})
