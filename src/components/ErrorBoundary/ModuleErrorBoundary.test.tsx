import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModuleErrorBoundary from './ModuleErrorBoundary'

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Module crashed')
  }
  return <div>Module content</div>
}

// Suppress console.error during expected error boundary tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : ''
    if (
      msg.includes('[ModuleErrorBoundary') ||
      msg.includes('The above error occurred') ||
      msg.includes('Error: Uncaught')
    ) {
      return
    }
    originalConsoleError(...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('ModuleErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ModuleErrorBoundary moduleName="Workspace">
        <ThrowingComponent shouldThrow={false} />
      </ModuleErrorBoundary>
    )
    expect(screen.getByText('Module content')).toBeInTheDocument()
  })

  it('shows module name when an error occurs', () => {
    render(
      <ModuleErrorBoundary moduleName="Workspace">
        <ThrowingComponent shouldThrow={true} />
      </ModuleErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(screen.getByText('Module crashed')).toBeInTheDocument()
  })

  it('shows "Return to Home" button', () => {
    render(
      <ModuleErrorBoundary moduleName="Projects">
        <ThrowingComponent shouldThrow={true} />
      </ModuleErrorBoundary>
    )
    expect(screen.getByText('Return to Home')).toBeInTheDocument()
  })

  it('shows "Refresh Page" button', () => {
    render(
      <ModuleErrorBoundary moduleName="Projects">
        <ThrowingComponent shouldThrow={true} />
      </ModuleErrorBoundary>
    )
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
  })

  it('has alert role for accessibility', () => {
    render(
      <ModuleErrorBoundary moduleName="Databases">
        <ThrowingComponent shouldThrow={true} />
      </ModuleErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('calls window.location.reload on Refresh click', async () => {
    const user = userEvent.setup()
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    })

    render(
      <ModuleErrorBoundary moduleName="Copilot">
        <ThrowingComponent shouldThrow={true} />
      </ModuleErrorBoundary>
    )

    await user.click(screen.getByText('Refresh Page'))
    expect(reloadMock).toHaveBeenCalled()
  })
})
