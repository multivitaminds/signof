import './Skeletons.css'

interface EditorSkeletonProps {
  blocks?: number
}

/**
 * EditorSkeleton -- shimmer placeholder for workspace block editor views.
 */
export default function EditorSkeleton({ blocks = 4 }: EditorSkeletonProps) {
  const linePatterns = [
    ['full', 'long', 'medium'],
    ['full', 'full', 'short'],
    ['long', 'full', 'medium', 'short'],
    ['full', 'long'],
    ['medium', 'full', 'long', 'short'],
  ]

  return (
    <div className="editor-skeleton" role="status" aria-label="Loading editor">
      {/* Title */}
      <div className="editor-skeleton__title skeleton-shimmer" />

      {/* Blocks */}
      {Array.from({ length: blocks }, (_, blockIdx) => {
        const pattern = linePatterns[blockIdx % linePatterns.length]!
        return (
          <div key={blockIdx} className="editor-skeleton__block">
            {pattern.map((variant, lineIdx) => (
              <div
                key={lineIdx}
                className={`editor-skeleton__line editor-skeleton__line--${variant} skeleton-shimmer`}
                style={{ animationDelay: `${(blockIdx * 3 + lineIdx) * 80}ms` }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
