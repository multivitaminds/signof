import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DbRow } from '../../types'
import './CalendarView.css'

interface CalendarViewProps {
  rows: DbRow[]
  dateFieldId: string
  titleFieldId: string
  onRowClick: (rowId: string) => void
  onAddRow: (date: string) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView({ rows, dateFieldId, titleFieldId, onRowClick, onAddRow }: CalendarViewProps) {
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: Array<{ day: number | null; date: string }> = []
    for (let i = 0; i < firstDay; i++) cells.push({ day: null, date: '' })
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      cells.push({ day: d, date: `${year}-${mm}-${dd}` })
    }
    return cells
  }, [year, month])

  const rowsByDate = useMemo(() => {
    const map: Record<string, DbRow[]> = {}
    for (const row of rows) {
      const d = row.cells[dateFieldId]
      if (d && typeof d === 'string') {
        const key = d.slice(0, 10)
        if (!map[key]) map[key] = []
        map[key]!.push(row)
      }
    }
    return map
  }, [rows, dateFieldId])

  const prevMonth = useCallback(() => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }, [month])

  const nextMonth = useCallback(() => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }, [month])

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="db-calendar-view">
      <div className="db-calendar-view__nav">
        <button className="db-calendar-view__nav-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
        <span className="db-calendar-view__month">{monthName}</span>
        <button className="db-calendar-view__nav-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
      </div>
      <div className="db-calendar-view__grid">
        {DAYS.map((d) => (
          <div key={d} className="db-calendar-view__day-header">{d}</div>
        ))}
        {days.map((cell, i) => (
          <div
            key={i}
            className={`db-calendar-view__cell ${cell.day ? '' : 'db-calendar-view__cell--empty'}`}
            onClick={() => cell.date && onAddRow(cell.date)}
          >
            {cell.day && <span className="db-calendar-view__day-num">{cell.day}</span>}
            {cell.date && rowsByDate[cell.date]?.slice(0, 3).map((row) => (
              <button
                key={row.id}
                className="db-calendar-view__event"
                onClick={(e) => { e.stopPropagation(); onRowClick(row.id) }}
              >
                {row.cells[titleFieldId] ? String(row.cells[titleFieldId]).slice(0, 20) : 'Untitled'}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
