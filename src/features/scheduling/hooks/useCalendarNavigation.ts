import { useState, useCallback, useMemo } from 'react'
import type { CalendarView } from '../types'
import { CalendarView as CalendarViewEnum } from '../types'
import {
  addMonths,
  getMonthName,
  getWeekDates,
  addDays,
  formatDate,
} from '../lib/calendarUtils'

export interface CalendarNavigation {
  currentDate: Date
  view: CalendarView
  title: string
  goToNext: () => void
  goToPrev: () => void
  goToToday: () => void
  setView: (view: CalendarView) => void
  goToDate: (date: Date) => void
}

export function useCalendarNavigation(initialDate?: Date): CalendarNavigation {
  const [currentDate, setCurrentDate] = useState(() => initialDate ?? new Date())
  const [view, setView] = useState<CalendarView>(CalendarViewEnum.Month)

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

  const title = useMemo(() => {
    if (view === CalendarViewEnum.Month) {
      return `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`
    }
    const start = weekDates[0]!
    const end = weekDates[6]!
    return `${formatDate(start, 'short')} - ${formatDate(end, 'short')}, ${end.getFullYear()}`
  }, [view, currentDate, weekDates])

  const goToNext = useCallback(() => {
    if (view === CalendarViewEnum.Month) {
      setCurrentDate((d) => addMonths(d, 1))
    } else {
      setCurrentDate((d) => addDays(d, 7))
    }
  }, [view])

  const goToPrev = useCallback(() => {
    if (view === CalendarViewEnum.Month) {
      setCurrentDate((d) => addMonths(d, -1))
    } else {
      setCurrentDate((d) => addDays(d, -7))
    }
  }, [view])

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  return {
    currentDate,
    view,
    title,
    goToNext,
    goToPrev,
    goToToday,
    setView,
    goToDate,
  }
}
