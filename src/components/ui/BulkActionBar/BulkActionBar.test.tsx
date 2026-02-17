import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BulkActionBar from './BulkActionBar'
import type { BulkActionItem } from './BulkActionBar'

const makeActions = (overrides?: Partial<BulkActionItem>[]): BulkActionItem[] => [
  { label: 'Delete', onClick: vi.fn(), variant: 'danger', ...overrides?.[0] },
  { label: 'Export', onClick: vi.fn(), ...overrides?.[1] },
]

describe('BulkActionBar', () => {
  it('renders nothing when selectedCount is 0', () => {
    const { container } = render(
      <BulkActionBar selectedCount={0} onDeselectAll={vi.fn()} actions={makeActions()} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('shows correct count with plural form', () => {
    render(
      <BulkActionBar selectedCount={5} onDeselectAll={vi.fn()} actions={makeActions()} />,
    )
    expect(screen.getByText('5 items selected')).toBeInTheDocument()
  })

  it('shows singular form for 1 item', () => {
    render(
      <BulkActionBar selectedCount={1} onDeselectAll={vi.fn()} actions={makeActions()} />,
    )
    expect(screen.getByText('1 item selected')).toBeInTheDocument()
  })

  it('renders all action buttons', () => {
    const actions = makeActions()
    render(
      <BulkActionBar selectedCount={3} onDeselectAll={vi.fn()} actions={actions} />,
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })

  it('calls action onClick when clicked', async () => {
    const user = userEvent.setup()
    const actions = makeActions()
    render(
      <BulkActionBar selectedCount={2} onDeselectAll={vi.fn()} actions={actions} />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(actions[0]!.onClick).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Export' }))
    expect(actions[1]!.onClick).toHaveBeenCalledOnce()
  })

  it('calls onDeselectAll when deselect button is clicked', async () => {
    const user = userEvent.setup()
    const onDeselectAll = vi.fn()
    render(
      <BulkActionBar selectedCount={3} onDeselectAll={onDeselectAll} actions={makeActions()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Deselect all' }))
    expect(onDeselectAll).toHaveBeenCalledOnce()
  })

  it('applies danger variant class to danger actions', () => {
    render(
      <BulkActionBar selectedCount={1} onDeselectAll={vi.fn()} actions={makeActions()} />,
    )
    const deleteBtn = screen.getByRole('button', { name: 'Delete' })
    expect(deleteBtn.classList.contains('bulk-action-bar__btn--danger')).toBe(true)
  })

  it('has toolbar role with proper aria-label', () => {
    render(
      <BulkActionBar selectedCount={1} onDeselectAll={vi.fn()} actions={makeActions()} />,
    )
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toBeInTheDocument()
  })
})
