import type { ReactNode } from 'react'
import './PageTransition.css'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * PageTransition — wraps content with a fade-in + slide-up animation.
 *
 * Use with `key={location.pathname}` to trigger the animation on
 * every route change. Pure CSS, no hooks or external dependencies.
 */
export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="page-transition">
      {children}
    </div>
  )
}
