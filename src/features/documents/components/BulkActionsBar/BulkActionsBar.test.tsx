import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BulkActionsBar from './BulkActionsBar'

describe('BulkActionsBar', () => {
  const selectedIds = ['doc1', 'doc2', 'doc3']

  it('shows selected count with correct plural form', () => {
    render(
      <BulkActionsBar
        selectedIds={selectedIds}
        onAction={vi.fn()}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('3 documents selected')).toBeInTheDocument()
  })

  it('shows singular form for 1 document', () => {
    render(
      <BulkActionsBar
        selectedIds={['doc1']}
        onAction={vi.fn()}
        onDismiss={vi.fn()}
      />
    )

    expect(screen.getByText('1 document selected')).toBeInTheDocument()
  })

  it('renders nothing when selectedIds is empty', () => {
    const { container } = render(
      <BulkActionsBar
        selectedIds={[]}
        onAction={vi.fn()}
        onDismiss={vi.fn()}
      />
    )

    expect(container.innerHTML).toBe('')
  })

  it('calls onAction with correct action type when buttons are clicked', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    render(
      <BulkActionsBar
        selectedIds={selectedIds}
        onAction={onAction}
        onDismiss={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Send All' }))
    expect(onAction).toHaveBeenCalledWith('send', selectedIds)

    await user.click(screen.getByRole('button', { name: 'Download All' }))
    expect(onAction).toHaveBeenCalledWith('download', selectedIds)

    await user.click(screen.getByRole('button', { name: 'Delete All' }))
    expect(onAction).toHaveBeenCalledWith('delete', selectedIds)

    await user.click(screen.getByRole('button', { name: 'Move to Folder' }))
    expect(onAction).toHaveBeenCalledWith('move', selectedIds)

    await user.click(screen.getByRole('button', { name: 'Change Status' }))
    expect(onAction).toHaveBeenCalledWith('status', selectedIds)
  })

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()

    render(
      <BulkActionsBar
        selectedIds={selectedIds}
        onAction={vi.fn()}
        onDismiss={onDismiss}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Dismiss selection' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
