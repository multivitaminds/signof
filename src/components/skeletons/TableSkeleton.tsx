import './Skeletons.css'

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

/**
 * TableSkeleton -- shimmer placeholder for table/grid views.
 */
export default function TableSkeleton({ rows = 8, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="table-skeleton" role="status" aria-label="Loading table">
      {/* Header */}
      <div className="table-skeleton__header">
        {Array.from({ length: columns }, (_, i) => (
          <div
            key={`h-${i}`}
            className={`table-skeleton__header-cell skeleton-shimmer ${i === 0 ? 'table-skeleton__cell--narrow' : ''}`}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIdx) => (
        <div key={`r-${rowIdx}`} className="table-skeleton__row">
          {Array.from({ length: columns }, (_, colIdx) => (
            <div
              key={`c-${colIdx}`}
              className={`table-skeleton__cell skeleton-shimmer ${
                colIdx === 0
                  ? 'table-skeleton__cell--narrow'
                  : colIdx === 1
                    ? 'table-skeleton__cell--wide'
                    : ''
              }`}
              style={{ animationDelay: `${(rowIdx * columns + colIdx) * 50}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
