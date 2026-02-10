import { useCallback } from 'react'
import { useSchedulingStore } from '../stores/useSchedulingStore'
import MonthlyCalendar from '../components/MonthlyCalendar/MonthlyCalendar'
import { useCalendarNavigation } from '../hooks/useCalendarNavigation'
import { useSchedulingShortcuts } from '../hooks/useSchedulingShortcuts'
import './SchedulingCalendarPage.css'

export default function SchedulingCalendarPage() {
  const bookings = useSchedulingStore((s) => s.bookings)

  const { currentDate, title, goToPrev, goToNext, goToToday } = useCalendarNavigation()

  useSchedulingShortcuts({
    onToday: goToToday,
    onNext: goToNext,
    onPrev: goToPrev,
  })

  const handleDateClick = useCallback((_date: Date) => {
    // Could open a booking modal in future
  }, [])

  return (
    <div className="scheduling-calendar-page">
      <div className="scheduling-calendar-page__controls">
        <button className="btn-secondary" onClick={goToToday}>Today</button>
        <button className="btn-secondary" onClick={goToPrev}>Prev</button>
        <button className="btn-secondary" onClick={goToNext}>Next</button>
        <span className="scheduling-calendar-page__month">{title}</span>
      </div>
      <MonthlyCalendar
        year={currentDate.getFullYear()}
        month={currentDate.getMonth()}
        bookings={bookings}
        onDateClick={handleDateClick}
      />
    </div>
  )
}
