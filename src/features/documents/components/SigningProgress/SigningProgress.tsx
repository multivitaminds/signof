import type { FieldType } from '../../../../types'
import { getFieldTypeLabel } from '../../lib/fieldTypes'
import './SigningProgress.css'

interface SigningProgressProps {
  totalFields: number
  completedFields: number
  currentFieldIndex: number
  currentFieldType: FieldType
}

function SigningProgress({
  totalFields,
  completedFields,
  currentFieldIndex,
  currentFieldType,
}: SigningProgressProps) {
  const percentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0

  return (
    <div className="signing-progress" role="status" aria-label="Signing progress">
      <span className="signing-progress__text">
        Field {currentFieldIndex + 1} of {totalFields}
      </span>
      <div
        className="signing-progress__bar"
        role="progressbar"
        aria-valuenow={completedFields}
        aria-valuemin={0}
        aria-valuemax={totalFields}
      >
        <div
          className="signing-progress__bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="signing-progress__field-type">
        {getFieldTypeLabel(currentFieldType)}
      </span>
    </div>
  )
}

export default SigningProgress
