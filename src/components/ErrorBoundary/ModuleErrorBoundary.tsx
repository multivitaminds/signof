import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import './ModuleErrorBoundary.css'

interface ModuleErrorBoundaryProps {
  children: ReactNode
  moduleName: string
}

interface ModuleErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ModuleErrorBoundary -- route-level error boundary that shows the failing
 * module name and offers "Return to Home" / "Refresh Page" recovery actions.
 */
class ModuleErrorBoundary extends Component<ModuleErrorBoundaryProps, ModuleErrorBoundaryState> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[ModuleErrorBoundary:${this.props.moduleName}] Caught error:`, error)
    console.error(`[ModuleErrorBoundary:${this.props.moduleName}] Component stack:`, errorInfo.componentStack)
  }

  handleGoHome = (): void => {
    window.location.href = '/'
  }

  handleRefresh = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="module-error-boundary" role="alert">
        <div className="module-error-boundary__card">
          <div className="module-error-boundary__icon">
            <AlertTriangle size={32} />
          </div>
          <h2 className="module-error-boundary__title">Something went wrong</h2>
          <p className="module-error-boundary__module">
            The <strong>{this.props.moduleName}</strong> module encountered an error.
          </p>
          <p className="module-error-boundary__message">
            {this.state.error?.message ?? 'An unexpected error occurred while loading this module.'}
          </p>
          <div className="module-error-boundary__actions">
            <button
              className="btn-primary module-error-boundary__btn"
              onClick={this.handleGoHome}
            >
              <Home size={16} />
              Return to Home
            </button>
            <button
              className="btn-secondary module-error-boundary__btn"
              onClick={this.handleRefresh}
            >
              <RefreshCw size={16} />
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ModuleErrorBoundary
