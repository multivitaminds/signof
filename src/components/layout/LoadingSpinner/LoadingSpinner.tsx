import './LoadingSpinner.css'

/**
 * LoadingSpinner — Stripe-inspired full-page loading state.
 *
 * Features:
 * - Animated gradient bar sliding across the top of the viewport
 * - Pulsing "S" logo mark with brand gradient
 * - Subtle "Loading..." text
 * - Dark mode support via [data-theme="dark"]
 * - Reduced motion support
 *
 * Used as the Suspense fallback for lazy-loaded route chunks.
 */
export default function LoadingSpinner() {
  return (
    <div className="loading-spinner" role="status" aria-label="Loading">
      {/* Gradient progress bar */}
      <div className="loading-spinner__bar" aria-hidden="true">
        <div className="loading-spinner__bar-fill" />
      </div>

      {/* Animated logo */}
      <div className="loading-spinner__logo" aria-hidden="true">
        <span className="loading-spinner__logo-s">S</span>
        <span className="loading-spinner__logo-check">{'\u2713'}</span>
      </div>

      {/* Loading text */}
      <p className="loading-spinner__text">Loading...</p>
    </div>
  )
}
