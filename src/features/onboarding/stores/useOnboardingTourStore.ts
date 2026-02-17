import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tourDefinitions } from '../lib/tourDefinitions'

interface OnboardingTourState {
  completedTours: string[]
  currentTourId: string | null
  currentStepIndex: number
  isActive: boolean

  startTour: (tourId: string) => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  completeTour: () => void
  shouldShowTour: (tourId: string) => boolean
  resetTours: () => void
}

const useOnboardingTourStore = create<OnboardingTourState>()(
  persist(
    (set, get) => ({
      completedTours: [],
      currentTourId: null,
      currentStepIndex: 0,
      isActive: false,

      startTour: (tourId: string) => {
        const definition = tourDefinitions.find((t) => t.id === tourId)
        if (!definition) return
        set({
          currentTourId: tourId,
          currentStepIndex: 0,
          isActive: true,
        })
      },

      nextStep: () => {
        const { currentTourId, currentStepIndex } = get()
        if (!currentTourId) return
        const definition = tourDefinitions.find((t) => t.id === currentTourId)
        if (!definition) return

        if (currentStepIndex < definition.steps.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 })
        } else {
          get().completeTour()
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get()
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 })
        }
      },

      skipTour: () => {
        const { currentTourId, completedTours } = get()
        if (currentTourId && !completedTours.includes(currentTourId)) {
          set({
            completedTours: [...completedTours, currentTourId],
            currentTourId: null,
            currentStepIndex: 0,
            isActive: false,
          })
        } else {
          set({
            currentTourId: null,
            currentStepIndex: 0,
            isActive: false,
          })
        }
      },

      completeTour: () => {
        const { currentTourId, completedTours } = get()
        if (currentTourId && !completedTours.includes(currentTourId)) {
          set({
            completedTours: [...completedTours, currentTourId],
            currentTourId: null,
            currentStepIndex: 0,
            isActive: false,
          })
        } else {
          set({
            currentTourId: null,
            currentStepIndex: 0,
            isActive: false,
          })
        }
      },

      shouldShowTour: (tourId: string) => {
        return !get().completedTours.includes(tourId)
      },

      resetTours: () => {
        set({
          completedTours: [],
          currentTourId: null,
          currentStepIndex: 0,
          isActive: false,
        })
      },
    }),
    {
      name: 'orchestree-tour-storage',
      partialize: (state) => ({ completedTours: state.completedTours }),
      merge: (persisted, current) => ({
        ...current,
        completedTours: (persisted as { completedTours?: string[] })?.completedTours ?? current.completedTours,
      }),
    }
  )
)

export default useOnboardingTourStore
