import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DbTable, CellValue } from '../../types'
import { DbFieldType } from '../../types'
import {
  getCalendarGrid,
  getMonthName,
  isSameMonth,
  isToday,
  formatDate,
} from '../../../scheduling/lib/calendarUtils'
import './CalendarView.css'

interface CalendarViewProps {
  table: DbTable
  tables: Record<string, DbTable>
  dateFieldId: string
  onUpdateCell: (rowId: string, fieldId: string, value: CellValue) => void
  onAddRow: (cells?: Record<string, CellValue>) => void
}

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CalendarView({
  table,
  tables: _tables,
  dateFieldId,
  onUpdateCell: _onUpdateCell,
  onAddRow,
}: CalendarViewProps) {
  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(() => today.getFullYear())
  const [month, setMonth] = useState(() => today.getMonth() + 1) // 1-indexed for calendarUtils
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)

  // Suppress unused variables
  void _tables
  void _onUpdateCell

  const primaryField = useMemo(
    () => table.fields.find((f) => f.type === DbFieldType.Text),
    [table.fields]
  )

  const grid = useMemo(() => getCalendarGrid(year, month), [year, month])
  const currentMonth = useMemo(() => new Date(year, month - 1, 1), [year, month])

  const rowsByDate = useMemo(() => {
    const map: Record<string, typeof table.rows> = {}
    for (const row of table.rows) {
      const d = row.cells[dateFieldId]
      if (d && typeof d === 'string') {
        const key = d.slice(0, 10)
        if (!map[key]) map[key] = []
        map[key]!.push(row)
      }
    }
    return map
  }, [table.rows, dateFieldId])

  const prevMonth = useCallback(() => {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }, [month])

  const nextMonth = useCallback(() => {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }, [month])

  const goToToday = useCallback(() => {
    const now = new Date()
    setYear(now.getFullYear())
    setMonth(now.getMonth() + 1)
  }, [])

  const handleDayClick = useCallback(
    (date: Date) => {
      const iso = formatDate(date, 'iso')
      const cells: Record<string, CellValue> = { [dateFieldId]: iso }
      onAddRow(cells)
    },
    [dateFieldId, onAddRow]
  )

  const handleEventClick = useCallback(
    (e: React.MouseEvent, rowId: string) => {
      e.stopPropagation()
      setSelectedRowId((prev) => (prev === rowId ? null : rowId))
    },
    []
  )

  const monthLabel = `${getMonthName(month - 1)} ${year}`

  return (
    <div className="db-calendar-view" role="region" aria-label="Calendar view">
      <div className="db-calendar-view__nav">
        <button
          className="db-calendar-view__nav-btn"
          onClick={prevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="db-calendar-view__month">{monthLabel}</span>
        <button
          className="db-calendar-view__nav-btn"
          onClick={nextMonth}
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
        <button
          className="db-calendar-view__today-btn"
          onClick={goToToday}
        >
          Today
        </button>
      </div>

      <div className="db-calendar-view__grid">
        {WEEKDAY_HEADERS.map((day) => (
          <div key={day} className="db-calendar-view__day-header">{day}</div>
        ))}
        {grid.map((week) =>
          week.map((date) => {
            const dateStr = formatDate(date, 'iso')
            const dayRows = rowsByDate[dateStr] ?? []
            const isCurrentMonth = isSameMonth(date, currentMonth)
            const isTodayDate = isToday(date)

            return (
              <div
                key={dateStr}
                className={[
                  'db-calendar-view__cell',
                  !isCurrentMonth ? 'db-calendar-view__cell--outside' : '',
                  isTodayDate ? 'db-calendar-view__cell--today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleDayClick(date)}
                role="button"
                aria-label={`Add event on ${formatDate(date, 'medium')}`}
              >
                <span
                  className={[
                    'db-calendar-view__day-num',
                    isTodayDate ? 'db-calendar-view__day-num--today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {date.getDate()}
                </span>
                <div className="db-calendar-view__events">
                  {dayRows.slice(0, 3).map((row) => {
                    const title = primaryField
                      ? (row.cells[primaryField.id]
                          ? String(row.cells[primaryField.id])
                          : 'Untitled')
                      : 'Untitled'
                    const isSelected = selectedRowId === row.id

                    // Find a select field for coloring
                    const selectField = table.fields.find(
                      (f) =>
                        f.type === DbFieldType.Select &&
                        f.id !== dateFieldId &&
                        row.cells[f.id]
                    )
                    const selectVal = selectField
                      ? row.cells[selectField.id]
                      : null
                    const choice =
                      selectField?.options?.choices.find(
                        (c) => c.name === selectVal
                      )
                    const dotColor = choice?.color ?? '#4F46E5'

                    return (
                      <button
                        key={row.id}
                        className={[
                          'db-calendar-view__event',
                          isSelected ? 'db-calendar-view__event--selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={(e) => handleEventClick(e, row.id)}
                        title={title}
                      >
                        <span
                          className="db-calendar-view__event-dot"
                          style={{ backgroundColor: dotColor }}
                        />
                        <span className="db-calendar-view__event-title">
                          {title}
                        </span>
                      </button>
                    )
                  })}
                  {dayRows.length > 3 && (
                    <span className="db-calendar-view__more">
                      +{dayRows.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {selectedRowId && (() => {
        const row = table.rows.find((r) => r.id === selectedRowId)
        if (!row) return null
        const title = primaryField
          ? (row.cells[primaryField.id]
              ? String(row.cells[primaryField.id])
              : 'Untitled')
          : 'Untitled'
        const dateVal = row.cells[dateFieldId]
        const dateDisplay = dateVal && typeof dateVal === 'string'
          ? (() => {
              const parts = dateVal.slice(0, 10).split('-')
              const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
              return !isNaN(d.getTime()) ? formatDate(d, 'medium') : dateVal.slice(0, 10)
            })()
          : ''

        const detailFields = table.fields
          .filter(
            (f) =>
              f.id !== primaryField?.id &&
              f.id !== dateFieldId &&
              f.type !== DbFieldType.CreatedTime &&
              f.type !== DbFieldType.LastEditedTime
          )
          .slice(0, 4)

        return (
          <div className="db-calendar-view__detail" role="dialog" aria-label={`Details for ${title}`}>
            <div className="db-calendar-view__detail-header">
              <h3 className="db-calendar-view__detail-title">{title}</h3>
              <button
                className="db-calendar-view__detail-close"
                onClick={() => setSelectedRowId(null)}
                aria-label="Close detail"
              >
                &times;
              </button>
            </div>
            {dateDisplay && (
              <div className="db-calendar-view__detail-date">{dateDisplay}</div>
            )}
            {detailFields.map((field) => {
              const val = row.cells[field.id]
              if (val === null || val === undefined || val === '') return null
              return (
                <div key={field.id} className="db-calendar-view__detail-field">
                  <span className="db-calendar-view__detail-label">{field.name}</span>
                  <span className="db-calendar-view__detail-value">{String(val)}</span>
                </div>
              )
            })}
          </div>
        )
      })()}
    </div>
  )
}
