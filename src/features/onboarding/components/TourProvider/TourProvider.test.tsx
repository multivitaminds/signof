import { render, screen } from '@testing-library/react'
import { act } from '@testing-library/react'
import useOnboardingTourStore from '../../stores/useOnboardingTourStore'
import TourProvider from './TourProvider'

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as Record<string, unknown>).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock getBoundingClientRect for target elements
function createMockTarget(selector: string) {
  const el = document.createElement('div')
  el.setAttribute('data-tour', selector.replace('[data-tour="', '').replace('"]', ''))
  el.getBoundingClientRect = () => ({
    top: 100,
    left: 50,
    bottom: 140,
    right: 250,
    width: 200,
    height: 40,
    x: 50,
    y: 100,
    toJSON: () => ({}),
  })
  document.body.appendChild(el)
  return el
}

describe('TourProvider', () => {
  const elements: HTMLElement[] = []

  beforeEach(() => {
    act(() => {
      useOnboardingTourStore.setState({
        completedTours: [],
        currentTourId: null,
        currentStepIndex: 0,
        isActive: false,
      })
    })
    // Create mock target elements for the welcome tour
    elements.push(createMockTarget('[data-tour="sidebar"]'))
    elements.push(createMockTarget('[data-tour="search"]'))
    elements.push(createMockTarget('[data-tour="modules"]'))
    elements.push(createMockTarget('[data-tour="copilot"]'))
    elements.push(createMockTarget('[data-tour="settings"]'))
  })

  afterEach(() => {
    for (const el of elements) {
      el.remove()
    }
    elements.length = 0
  })

  it('renders nothing when tour is inactive', () => {
    const { container } = render(<TourProvider />)
    expect(container.innerHTML).toBe('')
  })

  it('renders overlay and tooltip when tour is active', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('welcome')
    })
    render(<TourProvider />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('Use the sidebar to switch between modules like Documents, Projects, Calendar, and more.')).toBeInTheDocument()
  })

  it('hides when tour is skipped', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('welcome')
    })
    const { container } = render(<TourProvider />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    act(() => {
      useOnboardingTourStore.getState().skipTour()
    })

    // Re-render check — dialog should be gone
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('advances steps and shows updated content', () => {
    act(() => {
      useOnboardingTourStore.getState().startTour('welcome')
    })
    render(<TourProvider />)
    expect(screen.getByText('Navigation')).toBeInTheDocument()

    act(() => {
      useOnboardingTourStore.getState().nextStep()
    })
    expect(screen.getByText('Quick Search')).toBeInTheDocument()
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
  })
})
