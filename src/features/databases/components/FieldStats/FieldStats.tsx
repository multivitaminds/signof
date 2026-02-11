import { useState, useMemo, useCallback } from 'react'
import { BarChart3 } from 'lucide-react'
import type { DbField, DbRow, CellValue } from '../../types'
import { DbFieldType, FieldStatType } from '../../types'
import './FieldStats.css'

interface FieldStatsProps {
  fields: DbField[]
  rows: DbRow[]
  hiddenFields: string[]
  fieldOrder: string[]
}

// Which stats are available per field type
const STATS_FOR_TYPE: Record<string, FieldStatType[]> = {
  [DbFieldType.Number]: [
    FieldStatType.Sum,
    FieldStatType.Avg,
    FieldStatType.Min,
    FieldStatType.Max,
    FieldStatType.Count,
  ],
  [DbFieldType.Text]: [
    FieldStatType.Count,
    FieldStatType.Filled,
    FieldStatType.Empty,
  ],
  [DbFieldType.Email]: [
    FieldStatType.Count,
    FieldStatType.Filled,
    FieldStatType.Empty,
  ],
  [DbFieldType.Url]: [
    FieldStatType.Count,
    FieldStatType.Filled,
    FieldStatType.Empty,
  ],
  [DbFieldType.Phone]: [
    FieldStatType.Count,
    FieldStatType.Filled,
    FieldStatType.Empty,
  ],
  [DbFieldType.Select]: [
    FieldStatType.Count,
    FieldStatType.Distribution,
    FieldStatType.Filled,
    FieldStatType.Empty,
  ],
  [DbFieldType.MultiSelect]: [
    FieldStatType.Count,
    FieldStatType.Distribution,
    FieldStatType.Filled,
    FieldStatType.Empty,
  ],
  [DbFieldType.Date]: [
    FieldStatType.Count,
    FieldStatType.Earliest,
    FieldStatType.Latest,
    FieldStatType.Range,
  ],
  [DbFieldType.Checkbox]: [
    FieldStatType.Count,
    FieldStatType.Filled,
    FieldStatType.Empty,
  ],
}

const STAT_LABELS: Record<FieldStatType, string> = {
  [FieldStatType.Count]: 'Count',
  [FieldStatType.Empty]: 'Empty',
  [FieldStatType.Filled]: 'Filled',
  [FieldStatType.Sum]: 'Sum',
  [FieldStatType.Avg]: 'Average',
  [FieldStatType.Min]: 'Min',
  [FieldStatType.Max]: 'Max',
  [FieldStatType.Earliest]: 'Earliest',
  [FieldStatType.Latest]: 'Latest',
  [FieldStatType.Range]: 'Range',
  [FieldStatType.Distribution]: 'Distribution',
}

function getAvailableStats(field: DbField): FieldStatType[] {
  return STATS_FOR_TYPE[field.type] ?? [FieldStatType.Count]
}

function isEmpty(val: CellValue): boolean {
  return val === null || val === undefined || val === ''
}

function computeStat(
  stat: FieldStatType,
  field: DbField,
  rows: DbRow[]
): string {
  const values: CellValue[] = rows.map((r) => r.cells[field.id] ?? null)

  switch (stat) {
    case FieldStatType.Count:
      return String(rows.length)

    case FieldStatType.Empty:
      return String(values.filter(isEmpty).length)

    case FieldStatType.Filled:
      return String(values.filter((v) => !isEmpty(v)).length)

    case FieldStatType.Sum: {
      const nums = values.filter((v): v is number => typeof v === 'number')
      return nums.length > 0 ? String(nums.reduce((a, b) => a + b, 0)) : '0'
    }

    case FieldStatType.Avg: {
      const nums = values.filter((v): v is number => typeof v === 'number')
      if (nums.length === 0) return '0'
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length
      return avg.toFixed(2)
    }

    case FieldStatType.Min: {
      const nums = values.filter((v): v is number => typeof v === 'number')
      return nums.length > 0 ? String(Math.min(...nums)) : '\u2014'
    }

    case FieldStatType.Max: {
      const nums = values.filter((v): v is number => typeof v === 'number')
      return nums.length > 0 ? String(Math.max(...nums)) : '\u2014'
    }

    case FieldStatType.Earliest: {
      const dates = values
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
        .map((v) => new Date(v))
        .filter((d) => !isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime())
      if (dates.length === 0) return '\u2014'
      return dates[0]!.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    case FieldStatType.Latest: {
      const dates = values
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
        .map((v) => new Date(v))
        .filter((d) => !isNaN(d.getTime()))
        .sort((a, b) => b.getTime() - a.getTime())
      if (dates.length === 0) return '\u2014'
      return dates[0]!.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    case FieldStatType.Range: {
      const dates = values
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
        .map((v) => new Date(v))
        .filter((d) => !isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime())
      if (dates.length < 2) return '\u2014'
      const diffMs = dates[dates.length - 1]!.getTime() - dates[0]!.getTime()
      const days = Math.round(diffMs / 86400000)
      return `${days}d`
    }

    case FieldStatType.Distribution: {
      const counts: Record<string, number> = {}
      for (const val of values) {
        if (val !== null && val !== undefined && val !== '') {
          const key = String(val)
          counts[key] = (counts[key] ?? 0) + 1
        }
      }
      const entries = Object.entries(counts)
      if (entries.length === 0) return '\u2014'
      return entries.map(([k, v]) => `${k}: ${v}`).join(', ')
    }

    default:
      return '\u2014'
  }
}

export default function FieldStats({
  fields,
  rows,
  hiddenFields,
  fieldOrder,
}: FieldStatsProps) {
  const [visible, setVisible] = useState(false)
  const [selectedStats, setSelectedStats] = useState<Record<string, number>>({})

  const visibleFields = useMemo(
    () =>
      fieldOrder
        .map((id) => fields.find((f) => f.id === id))
        .filter((f): f is DbField => f !== undefined && !hiddenFields.includes(f.id)),
    [fieldOrder, fields, hiddenFields]
  )

  const handleToggle = useCallback(() => {
    setVisible((v) => !v)
  }, [])

  const handleCycleStat = useCallback((fieldId: string) => {
    setSelectedStats((prev) => {
      const current = prev[fieldId] ?? 0
      const field = fields.find((f) => f.id === fieldId)
      if (!field) return prev
      const available = getAvailableStats(field)
      const next = (current + 1) % available.length
      return { ...prev, [fieldId]: next }
    })
  }, [fields])

  if (!visible) {
    return (
      <button
        className="field-stats__toggle"
        onClick={handleToggle}
        aria-label="Show field statistics"
      >
        <BarChart3 size={14} />
        Show stats
      </button>
    )
  }

  return (
    <div className="field-stats">
      <div className="field-stats__header">
        <button
          className="field-stats__toggle field-stats__toggle--active"
          onClick={handleToggle}
          aria-label="Hide field statistics"
        >
          <BarChart3 size={14} />
          Hide stats
        </button>
      </div>
      <div className="field-stats__row">
        {/* Spacer for row numbers column */}
        <div className="field-stats__cell field-stats__cell--num" />
        {visibleFields.map((field) => {
          const available = getAvailableStats(field)
          const statIndex = selectedStats[field.id] ?? 0
          const currentStat = available[statIndex] ?? FieldStatType.Count
          const value = computeStat(currentStat, field, rows)

          return (
            <div
              key={field.id}
              className="field-stats__cell"
              style={{ width: field.width ?? 160 }}
            >
              <button
                className="field-stats__stat-btn"
                onClick={() => handleCycleStat(field.id)}
                title={`Click to cycle stats. Current: ${STAT_LABELS[currentStat]}`}
                aria-label={`${field.name} stat: ${STAT_LABELS[currentStat]} = ${value}`}
              >
                <span className="field-stats__stat-label">
                  {STAT_LABELS[currentStat]}
                </span>
                <span className="field-stats__stat-value">
                  {value}
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
