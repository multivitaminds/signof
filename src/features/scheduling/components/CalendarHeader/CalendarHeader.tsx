import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarView } from '../../types'
import './CalendarHeader.css'

interface CalendarHeaderProps {
  title: string
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export default function CalendarHeader({
  title,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="calendar-header">
      <div className="calendar-header__nav">
        <button
          className="calendar-header__btn"
          onClick={onPrev}
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="calendar-header__title">{title}</h2>
        <button
          className="calendar-header__btn"
          onClick={onNext}
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
        <button
          className="calendar-header__btn calendar-header__btn--today"
          onClick={onToday}
        >
          Today
        </button>
      </div>

      <div className="calendar-header__view-toggle" role="group" aria-label="Calendar view">
        <button
          className={`calendar-header__view-btn${view === CalendarView.Month ? ' calendar-header__view-btn--active' : ''}`}
          onClick={() => onViewChange(CalendarView.Month)}
          aria-pressed={view === CalendarView.Month}
        >
          Month
        </button>
        <button
          className={`calendar-header__view-btn${view === CalendarView.Week ? ' calendar-header__view-btn--active' : ''}`}
          onClick={() => onViewChange(CalendarView.Week)}
          aria-pressed={view === CalendarView.Week}
        >
          Week
        </button>
      </div>
    </div>
  )
}
