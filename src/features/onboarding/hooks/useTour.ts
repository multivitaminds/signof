import useOnboardingTourStore from '../stores/useOnboardingTourStore'

export function useTour() {
  const store = useOnboardingTourStore()
  return {
    startTour: store.startTour,
    isActive: store.isActive,
    currentStep: store.currentStepIndex,
    skipTour: store.skipTour,
    shouldShowTour: store.shouldShowTour,
  }
}
