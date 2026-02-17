import { useEffect, useState, useCallback } from 'react'
import useOnboardingTourStore from '../../stores/useOnboardingTourStore'
import { tourDefinitions } from '../../lib/tourDefinitions'
import TourOverlay from '../TourOverlay/TourOverlay'
import TourTooltip from '../TourTooltip/TourTooltip'

const TOOLTIP_GAP = 12

interface TooltipPosition {
  top: number
  left: number
}

function computePosition(
  targetSelector: string,
  placement: 'top' | 'bottom' | 'left' | 'right',
  tooltipWidth: number,
  tooltipHeight: number
): TooltipPosition {
  const el = document.querySelector(targetSelector)
  if (!el) return { top: 0, left: 0 }

  const r = el.getBoundingClientRect()

  switch (placement) {
    case 'top':
      return {
        top: r.top - tooltipHeight - TOOLTIP_GAP,
        left: r.left + r.width / 2 - tooltipWidth / 2,
      }
    case 'bottom':
      return {
        top: r.bottom + TOOLTIP_GAP,
        left: r.left + r.width / 2 - tooltipWidth / 2,
      }
    case 'left':
      return {
        top: r.top + r.height / 2 - tooltipHeight / 2,
        left: r.left - tooltipWidth - TOOLTIP_GAP,
      }
    case 'right':
      return {
        top: r.top + r.height / 2 - tooltipHeight / 2,
        left: r.right + TOOLTIP_GAP,
      }
  }
}

function clampPosition(pos: TooltipPosition, tooltipWidth: number, tooltipHeight: number): TooltipPosition {
  const margin = 8
  return {
    top: Math.max(margin, Math.min(pos.top, window.innerHeight - tooltipHeight - margin)),
    left: Math.max(margin, Math.min(pos.left, window.innerWidth - tooltipWidth - margin)),
  }
}

// Estimated tooltip dimensions (matches CSS)
const TOOLTIP_WIDTH = 320
const TOOLTIP_HEIGHT = 180

export default function TourProvider() {
  const { isActive, currentTourId, currentStepIndex, nextStep, prevStep, skipTour } =
    useOnboardingTourStore()

  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0 })

  const currentTour = currentTourId
    ? tourDefinitions.find((t) => t.id === currentTourId)
    : null
  const currentStep = currentTour?.steps[currentStepIndex]

  const updatePosition = useCallback(() => {
    if (!currentStep) return
    const raw = computePosition(
      currentStep.targetSelector,
      currentStep.placement,
      TOOLTIP_WIDTH,
      TOOLTIP_HEIGHT
    )
    setPosition(clampPosition(raw, TOOLTIP_WIDTH, TOOLTIP_HEIGHT))
  }, [currentStep])

  useEffect(() => {
    if (!isActive || !currentStep) return

    const observer = new ResizeObserver(updatePosition)
    observer.observe(document.body)

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    // ResizeObserver fires immediately on observe, triggering updatePosition
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isActive, currentStep, updatePosition])

  // Escape key to skip tour
  useEffect(() => {
    if (!isActive) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, skipTour])

  if (!isActive || !currentTour || !currentStep) return null

  return (
    <>
      <TourOverlay
        targetSelector={currentStep.targetSelector}
        onClickOutside={nextStep}
      />
      <TourTooltip
        title={currentStep.title}
        description={currentStep.description}
        stepIndex={currentStepIndex}
        totalSteps={currentTour.steps.length}
        placement={currentStep.placement}
        position={position}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
      />
    </>
  )
}
