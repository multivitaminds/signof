import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { reportError } from '../../lib/performanceReporter'
import './ErrorBoundary.css'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary -- catches rendering errors in children and shows a
 * friendly fallback UI. Class component because React requires it for
 * error boundaries.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
    reportError(error, { componentStack: errorInfo.componentStack ?? '' })
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    return (
      <div className="error-boundary" role="alert">
        <div className="error-boundary__card">
          <div className="error-boundary__icon">
            <AlertTriangle size={32} />
          </div>
          <h2 className="error-boundary__title">Something went wrong</h2>
          <p className="error-boundary__message">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <div className="error-boundary__actions">
            <button
              className="btn-primary error-boundary__retry"
              onClick={this.handleReset}
            >
              Try Again
            </button>
            <a
              className="error-boundary__report"
              href="mailto:support@orchestree.com?subject=Bug%20Report"
              target="_blank"
              rel="noopener noreferrer"
            >
              Report Issue
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
