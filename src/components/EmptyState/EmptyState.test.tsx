import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders icon, title, and description', () => {
    render(
      <EmptyState
        icon={<span data-testid="test-icon">icon</span>}
        title="Nothing here"
        description="Create something to get started."
      />
    )

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByText('Create something to get started.')).toBeInTheDocument()
  })

  it('renders a primary action button when provided', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <EmptyState
        icon={<span>icon</span>}
        title="Empty"
        description="Nothing to see here."
        action={{ label: 'Create New', onClick: handleClick }}
      />
    )

    const button = screen.getByText('Create New')
    expect(button).toBeInTheDocument()
    await user.click(button)
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('renders a secondary action when provided', async () => {
    const handlePrimary = vi.fn()
    const handleSecondary = vi.fn()
    const user = userEvent.setup()

    render(
      <EmptyState
        icon={<span>icon</span>}
        title="Empty"
        description="Nothing to see here."
        action={{ label: 'Primary', onClick: handlePrimary }}
        secondaryAction={{ label: 'Learn more', onClick: handleSecondary }}
      />
    )

    const secondaryBtn = screen.getByText('Learn more')
    expect(secondaryBtn).toBeInTheDocument()
    await user.click(secondaryBtn)
    expect(handleSecondary).toHaveBeenCalledOnce()
  })

  it('does not render action buttons when none provided', () => {
    render(
      <EmptyState
        icon={<span>icon</span>}
        title="Empty"
        description="Nothing here."
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('applies BEM class names correctly', () => {
    const { container } = render(
      <EmptyState
        icon={<span>icon</span>}
        title="Test"
        description="Description"
        action={{ label: 'Action', onClick: vi.fn() }}
      />
    )

    expect(container.querySelector('.empty-state')).toBeInTheDocument()
    expect(container.querySelector('.empty-state__icon-wrapper')).toBeInTheDocument()
    expect(container.querySelector('.empty-state__title')).toBeInTheDocument()
    expect(container.querySelector('.empty-state__description')).toBeInTheDocument()
    expect(container.querySelector('.empty-state__actions')).toBeInTheDocument()
    expect(container.querySelector('.empty-state__action')).toBeInTheDocument()
  })
})
