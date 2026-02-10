import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EnvelopeActions from './EnvelopeActions'
import { DocumentStatus, type Document } from '../../../../types'

function makeDoc(status: DocumentStatus): Document {
  return {
    id: 'd1',
    name: 'Test Doc',
    status,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [],
    signatures: [],
    audit: [],
    fields: [],
    folderId: null,
    templateId: null,
    expiresAt: null,
    reminderSentAt: null,
  }
}

describe('EnvelopeActions', () => {
  it('enables Void for sent documents', () => {
    render(
      <EnvelopeActions
        document={makeDoc(DocumentStatus.Sent)}
        onVoid={vi.fn()}
        onResend={vi.fn()}
        onRemind={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('Void')).not.toBeDisabled()
  })

  it('disables Void for draft documents', () => {
    render(
      <EnvelopeActions
        document={makeDoc(DocumentStatus.Draft)}
        onVoid={vi.fn()}
        onResend={vi.fn()}
        onRemind={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('Void')).toBeDisabled()
  })

  it('disables Resend and Remind for draft documents', () => {
    render(
      <EnvelopeActions
        document={makeDoc(DocumentStatus.Draft)}
        onVoid={vi.fn()}
        onResend={vi.fn()}
        onRemind={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('Resend')).toBeDisabled()
    expect(screen.getByText('Remind')).toBeDisabled()
  })

  it('enables Resend and Remind for sent documents', () => {
    render(
      <EnvelopeActions
        document={makeDoc(DocumentStatus.Sent)}
        onVoid={vi.fn()}
        onResend={vi.fn()}
        onRemind={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('Resend')).not.toBeDisabled()
    expect(screen.getByText('Remind')).not.toBeDisabled()
  })

  it('Delete is always enabled', () => {
    render(
      <EnvelopeActions
        document={makeDoc(DocumentStatus.Completed)}
        onVoid={vi.fn()}
        onResend={vi.fn()}
        onRemind={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('Delete')).not.toBeDisabled()
  })

  it('shows confirmation when Void is clicked', async () => {
    const user = userEvent.setup()
    render(
      <EnvelopeActions
        document={makeDoc(DocumentStatus.Sent)}
        onVoid={vi.fn()}
        onResend={vi.fn()}
        onRemind={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    await user.click(screen.getByText('Void'))
    expect(screen.getByText(/Are you sure you want to void/)).toBeInTheDocument()
  })

  it('calls onVoid when confirmed', async () => {
    const user = userEvent.setup()
    const onVoid = vi.fn()

    render(
      <EnvelopeActions
        document={makeDoc(DocumentStatus.Sent)}
        onVoid={onVoid}
        onResend={vi.fn()}
        onRemind={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    await user.click(screen.getByText('Void'))
    await user.click(screen.getByText('Confirm'))
    expect(onVoid).toHaveBeenCalledTimes(1)
  })

  it('cancels confirmation and returns to actions', async () => {
    const user = userEvent.setup()

    render(
      <EnvelopeActions
        document={makeDoc(DocumentStatus.Sent)}
        onVoid={vi.fn()}
        onResend={vi.fn()}
        onRemind={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    await user.click(screen.getByText('Void'))
    expect(screen.getByText(/Are you sure/)).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))
    expect(screen.queryByText(/Are you sure/)).not.toBeInTheDocument()
    expect(screen.getByText('Void')).toBeInTheDocument()
  })

  it('shows delete confirmation', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <EnvelopeActions
        document={makeDoc(DocumentStatus.Draft)}
        onVoid={vi.fn()}
        onResend={vi.fn()}
        onRemind={vi.fn()}
        onDelete={onDelete}
      />
    )

    await user.click(screen.getByText('Delete'))
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()

    await user.click(screen.getByText('Confirm'))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('calls onResend directly without confirmation', async () => {
    const user = userEvent.setup()
    const onResend = vi.fn()

    render(
      <EnvelopeActions
        document={makeDoc(DocumentStatus.Sent)}
        onVoid={vi.fn()}
        onResend={onResend}
        onRemind={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    await user.click(screen.getByText('Resend'))
    expect(onResend).toHaveBeenCalledTimes(1)
  })
})
