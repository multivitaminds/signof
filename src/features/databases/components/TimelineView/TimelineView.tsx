import { useState, useMemo, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import type { DbTable, CellValue } from '../../types'
import { DbFieldType } from '../../types'
import './TimelineView.css'

// ─── Zoom Modes ─────────────────────────────────────────────────────

const ZoomLevel = {
  Week: 'week',
  Month: 'month',
} as const

type ZoomLevel = (typeof ZoomLevel)[keyof typeof ZoomLevel]

// ─── Helpers ────────────────────────────────────────────────────────

function parseDate(val: CellValue): Date | null {
  if (!val || typeof val !== 'string') return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000
  return Math.round((b.getTime() - a.getTime()) / msPerDay)
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d)
  result.setDate(result.getDate() + n)
  return result
}

function startOfWeek(d: Date): Date {
  const result = new Date(d)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday start
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function getMonthName(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

function getWeekLabel(d: Date): string {
  const end = addDays(d, 6)
  return `${formatDateShort(d)} - ${formatDateShort(end)}`
}

// ─── Props ──────────────────────────────────────────────────────────

interface TimelineViewProps {
  table: DbTable
  tables: Record<string, DbTable>
  startDateFieldId: string
  endDateFieldId: string
  onUpdateCell: (rowId: string, fieldId: string, value: CellValue) => void
  onRowClick?: (rowId: string) => void
}

// ─── Component ──────────────────────────────────────────────────────

export default function TimelineView({
  table,
  tables: _tables,
  startDateFieldId,
  endDateFieldId,
  onUpdateCell,
  onRowClick,
}: TimelineViewProps) {
  void _tables

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [zoom, setZoom] = useState<ZoomLevel>(ZoomLevel.Month)
  const [viewStart, setViewStart] = useState(() => {
    const d = startOfMonth(today)
    d.setMonth(d.getMonth() - 1)
    return d
  })
  const [resizing, setResizing] = useState<{
    rowId: string
    edge: 'start' | 'end'
    initialX: number
    initialDate: Date
  } | null>(null)

  const timelineRef = useRef<HTMLDivElement>(null)

  // Primary field for row labels
  const primaryField = useMemo(
    () => table.fields.find((f) => f.type === DbFieldType.Text),
    [table.fields]
  )

  // Select field for coloring
  const colorField = useMemo(
    () => table.fields.find(
      (f) => f.type === DbFieldType.Select && f.id !== startDateFieldId && f.id !== endDateFieldId
    ),
    [table.fields, startDateFieldId, endDateFieldId]
  )

  // Timeline range
  const dayWidth = zoom === ZoomLevel.Week ? 40 : 16
  const totalDays = zoom === ZoomLevel.Week ? 56 : 120 // 8 weeks or 4 months
  const viewEnd = useMemo(() => addDays(viewStart, totalDays), [viewStart, totalDays])

  // Generate headers
  const headers = useMemo(() => {
    const result: Array<{ label: string; left: number; width: number }> = []

    if (zoom === ZoomLevel.Month) {
      let current = new Date(viewStart)
      while (current < viewEnd) {
        const monthStart = startOfMonth(current)
        const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)

        const startDay = Math.max(0, daysBetween(viewStart, monthStart))
        const endDay = Math.min(totalDays, daysBetween(viewStart, monthEnd) + 1)
        const width = (endDay - startDay) * dayWidth

        if (width > 0) {
          result.push({
            label: getMonthName(current),
            left: startDay * dayWidth,
            width,
          })
        }

        current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
        // Safety break
        if (result.length > 12) break
      }
    } else {
      let current = startOfWeek(new Date(viewStart))
      while (current < viewEnd) {
        const startDay = Math.max(0, daysBetween(viewStart, current))
        const width = 7 * dayWidth

        if (startDay < totalDays) {
          result.push({
            label: getWeekLabel(current),
            left: startDay * dayWidth,
            width,
          })
        }

        current = addDays(current, 7)
        if (result.length > 20) break
      }
    }

    return result
  }, [viewStart, viewEnd, zoom, totalDays, dayWidth])

  // Today marker position
  const todayOffset = useMemo(() => {
    const d = daysBetween(viewStart, today)
    if (d < 0 || d > totalDays) return null
    return d * dayWidth
  }, [viewStart, today, totalDays, dayWidth])

  // Rows with dates
  const timelineRows = useMemo(() => {
    return table.rows
      .map((row) => {
        const start = parseDate(row.cells[startDateFieldId] ?? null)
        const end = parseDate(row.cells[endDateFieldId] ?? null)
        const title = primaryField
          ? (row.cells[primaryField.id] ? String(row.cells[primaryField.id]) : 'Untitled')
          : 'Untitled'

        let barColor = '#4F46E5'
        if (colorField) {
          const val = row.cells[colorField.id]
          if (val && typeof val === 'string') {
            const choice = colorField.options?.choices.find((c) => c.name === val)
            if (choice) barColor = choice.color
          }
        }

        return { row, start, end, title, barColor }
      })
  }, [table.rows, startDateFieldId, endDateFieldId, primaryField, colorField])

  // Navigation
  const handlePrev = useCallback(() => {
    setViewStart((prev) => {
      if (zoom === ZoomLevel.Week) return addDays(prev, -14)
      const d = new Date(prev)
      d.setMonth(d.getMonth() - 1)
      return d
    })
  }, [zoom])

  const handleNext = useCallback(() => {
    setViewStart((prev) => {
      if (zoom === ZoomLevel.Week) return addDays(prev, 14)
      const d = new Date(prev)
      d.setMonth(d.getMonth() + 1)
      return d
    })
  }, [zoom])

  const handleToday = useCallback(() => {
    const d = zoom === ZoomLevel.Week ? startOfWeek(today) : startOfMonth(today)
    d.setDate(d.getDate() - (zoom === ZoomLevel.Week ? 14 : 30))
    setViewStart(d)
  }, [today, zoom])

  const handleZoomToggle = useCallback(() => {
    setZoom((z) => z === ZoomLevel.Month ? ZoomLevel.Week : ZoomLevel.Month)
  }, [])

  // Drag-to-resize handler
  const handleResizeStart = useCallback((
    e: React.MouseEvent,
    rowId: string,
    edge: 'start' | 'end',
    currentDate: Date
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setResizing({ rowId, edge, initialX: e.clientX, initialDate: currentDate })

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - e.clientX
      const daysDelta = Math.round(dx / dayWidth)
      const newDate = addDays(currentDate, daysDelta)
      const fieldId = edge === 'start' ? startDateFieldId : endDateFieldId
      const iso = newDate.toISOString().slice(0, 10)
      onUpdateCell(rowId, fieldId, iso)
    }

    const handleMouseUp = () => {
      setResizing(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [dayWidth, startDateFieldId, endDateFieldId, onUpdateCell])

  const handleBarClick = useCallback((rowId: string) => {
    onRowClick?.(rowId)
  }, [onRowClick])

  const totalWidth = totalDays * dayWidth

  return (
    <div className="timeline-view" role="region" aria-label="Timeline view">
      {/* Toolbar */}
      <div className="timeline-view__toolbar">
        <div className="timeline-view__nav">
          <button
            className="timeline-view__nav-btn"
            onClick={handlePrev}
            aria-label="Previous period"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="timeline-view__today-btn"
            onClick={handleToday}
          >
            Today
          </button>
          <button
            className="timeline-view__nav-btn"
            onClick={handleNext}
            aria-label="Next period"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          className="timeline-view__zoom-btn"
          onClick={handleZoomToggle}
          aria-label={zoom === ZoomLevel.Month ? 'Switch to week view' : 'Switch to month view'}
          title={zoom === ZoomLevel.Month ? 'Week view' : 'Month view'}
        >
          {zoom === ZoomLevel.Month ? <ZoomIn size={16} /> : <ZoomOut size={16} />}
          <span>{zoom === ZoomLevel.Month ? 'Week' : 'Month'}</span>
        </button>
      </div>

      {/* Timeline Grid */}
      <div className="timeline-view__container" ref={timelineRef}>
        {/* Row labels */}
        <div className="timeline-view__labels">
          <div className="timeline-view__labels-header">Record</div>
          {timelineRows.map(({ row, title }) => (
            <div
              key={row.id}
              className="timeline-view__label"
              title={title}
            >
              {title}
            </div>
          ))}
        </div>

        {/* Scrollable timeline area */}
        <div className="timeline-view__scroll">
          <div className="timeline-view__canvas" style={{ width: totalWidth }}>
            {/* Headers */}
            <div className="timeline-view__headers">
              {headers.map((h, i) => (
                <div
                  key={i}
                  className="timeline-view__header"
                  style={{ left: h.left, width: h.width }}
                >
                  {h.label}
                </div>
              ))}
            </div>

            {/* Today line */}
            {todayOffset !== null && (
              <div
                className="timeline-view__today-line"
                style={{ left: todayOffset }}
                aria-hidden="true"
              />
            )}

            {/* Rows */}
            <div className="timeline-view__rows">
              {timelineRows.map(({ row, start, end, title, barColor }) => {
                if (!start || !end) {
                  return (
                    <div key={row.id} className="timeline-view__row">
                      <div className="timeline-view__no-dates">
                        No dates set
                      </div>
                    </div>
                  )
                }

                const startOffset = daysBetween(viewStart, start)
                const endOffset = daysBetween(viewStart, end)
                const barLeft = Math.max(0, startOffset) * dayWidth
                const barRight = Math.min(totalDays, endOffset + 1) * dayWidth
                const barWidth = Math.max(barRight - barLeft, dayWidth)
                const isActive = resizing?.rowId === row.id

                return (
                  <div key={row.id} className="timeline-view__row">
                    <div
                      className={`timeline-view__bar ${isActive ? 'timeline-view__bar--active' : ''}`}
                      style={{
                        left: barLeft,
                        width: barWidth,
                        backgroundColor: `${barColor}30`,
                        borderColor: barColor,
                      }}
                      onClick={() => handleBarClick(row.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${title}: ${formatDateShort(start)} to ${formatDateShort(end)}`}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleBarClick(row.id) }}
                    >
                      {/* Resize handles */}
                      <div
                        className="timeline-view__resize-handle timeline-view__resize-handle--start"
                        onMouseDown={(e) => handleResizeStart(e, row.id, 'start', start)}
                        aria-label="Resize start date"
                        role="slider"
                        aria-valuetext={formatDateShort(start)}
                      />
                      <span
                        className="timeline-view__bar-label"
                        style={{ color: barColor }}
                      >
                        {title}
                      </span>
                      <div
                        className="timeline-view__resize-handle timeline-view__resize-handle--end"
                        onMouseDown={(e) => handleResizeStart(e, row.id, 'end', end)}
                        aria-label="Resize end date"
                        role="slider"
                        aria-valuetext={formatDateShort(end)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
