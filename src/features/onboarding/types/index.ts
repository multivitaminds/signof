export interface TourStep {
  targetSelector: string
  title: string
  description: string
  placement: 'top' | 'bottom' | 'left' | 'right'
}

export interface TourDefinition {
  id: string
  name: string
  steps: TourStep[]
}
