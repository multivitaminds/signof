import { useState, useCallback, useMemo } from 'react'
import type { EventType, Attendee } from '../types'

export type BookingStep = 'select-time' | 'enter-details' | 'confirm' | 'success'

const STEP_ORDER: BookingStep[] = ['select-time', 'enter-details', 'confirm', 'success']

export interface BookingFlowState {
  step: BookingStep
  selectedDate: Date | null
  selectedTime: string | null
  attendeeInfo: Attendee
  notes: string
  canProceed: boolean
  setDate: (date: Date) => void
  setTime: (time: string) => void
  setAttendeeInfo: (info: Attendee) => void
  setNotes: (notes: string) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

const EMPTY_ATTENDEE: Attendee = {
  name: '',
  email: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}

export function useBookingFlow(eventType: EventType | null): BookingFlowState {
  const [step, setStep] = useState<BookingStep>('select-time')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [attendeeInfo, setAttendeeInfo] = useState<Attendee>({ ...EMPTY_ATTENDEE })
  const [notes, setNotes] = useState('')

  const canProceed = useMemo(() => {
    if (!eventType) return false

    switch (step) {
      case 'select-time':
        return selectedDate !== null && selectedTime !== null
      case 'enter-details':
        return (
          attendeeInfo.name.trim().length > 0 &&
          attendeeInfo.email.trim().length > 0 &&
          attendeeInfo.email.includes('@')
        )
      case 'confirm':
        return true
      case 'success':
        return false
      default:
        return false
    }
  }, [step, selectedDate, selectedTime, attendeeInfo, eventType])

  const nextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(step)
    if (currentIndex < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[currentIndex + 1]!)
    }
  }, [step])

  const prevStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(step)
    if (currentIndex > 0) {
      setStep(STEP_ORDER[currentIndex - 1]!)
    }
  }, [step])

  const reset = useCallback(() => {
    setStep('select-time')
    setSelectedDate(null)
    setSelectedTime(null)
    setAttendeeInfo({ ...EMPTY_ATTENDEE })
    setNotes('')
  }, [])

  const setDate = useCallback((date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null) // Reset time when date changes
  }, [])

  const setTime = useCallback((time: string) => {
    setSelectedTime(time)
  }, [])

  return {
    step,
    selectedDate,
    selectedTime,
    attendeeInfo,
    notes,
    canProceed,
    setDate,
    setTime,
    setAttendeeInfo,
    setNotes,
    nextStep,
    prevStep,
    reset,
  }
}
