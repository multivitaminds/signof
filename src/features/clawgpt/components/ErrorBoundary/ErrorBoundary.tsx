import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import './ErrorBoundary.css'

interface ErrorBoundaryProps {
  fallback?: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary__icon" aria-hidden="true">!</div>
          <p className="error-boundary__message">Something went wrong</p>
          {this.state.error && (
            <p className="error-boundary__detail">{this.state.error.message}</p>
          )}
          <button
            className="error-boundary__retry btn--ghost"
            onClick={this.handleRetry}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
