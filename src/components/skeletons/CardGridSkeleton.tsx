import './Skeletons.css'

interface CardGridSkeletonProps {
  cards?: number
}

/**
 * CardGridSkeleton -- shimmer placeholder for gallery/kanban card layouts.
 */
export default function CardGridSkeleton({ cards = 6 }: CardGridSkeletonProps) {
  return (
    <div className="card-grid-skeleton" role="status" aria-label="Loading cards">
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="card-grid-skeleton__card">
          <div
            className="card-grid-skeleton__image skeleton-shimmer"
            style={{ animationDelay: `${i * 100}ms` }}
          />
          <div
            className="card-grid-skeleton__title skeleton-shimmer"
            style={{ animationDelay: `${i * 100 + 50}ms` }}
          />
          <div
            className="card-grid-skeleton__text skeleton-shimmer"
            style={{ animationDelay: `${i * 100 + 100}ms` }}
          />
          <div
            className="card-grid-skeleton__text card-grid-skeleton__text--short skeleton-shimmer"
            style={{ animationDelay: `${i * 100 + 150}ms` }}
          />
          <div className="card-grid-skeleton__footer">
            <div className="card-grid-skeleton__tag skeleton-shimmer" />
            <div className="card-grid-skeleton__tag skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  )
}
