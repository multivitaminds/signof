import { formatDateDivider } from '../../lib/chorusFormatters'
import './DateDivider.css'

interface DateDividerProps {
  timestamp: string
}

export default function DateDivider({ timestamp }: DateDividerProps) {
  const label = formatDateDivider(timestamp)

  return (
    <div className="chorus-date-divider" role="separator" aria-label={label}>
      <hr className="chorus-date-divider__line" />
      <span className="chorus-date-divider__label">{label}</span>
      <hr className="chorus-date-divider__line" />
    </div>
  )
}
