import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentFolders from './DocumentFolders'
import type { Folder } from '../../../../types'

const mockFolders: Folder[] = [
  { id: 'f1', name: 'Contracts', parentId: null, color: '#4F46E5' },
  { id: 'f2', name: 'NDAs', parentId: null, color: '#059669' },
]

describe('DocumentFolders', () => {
  it('renders "All Documents" option', () => {
    render(
      <DocumentFolders
        folders={[]}
        selectedFolderId={null}
        onSelectFolder={vi.fn()}
        onCreateFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
      />
    )

    expect(screen.getByText('All Documents')).toBeInTheDocument()
  })

  it('renders all folders', () => {
    render(
      <DocumentFolders
        folders={mockFolders}
        selectedFolderId={null}
        onSelectFolder={vi.fn()}
        onCreateFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
      />
    )

    expect(screen.getByText('Contracts')).toBeInTheDocument()
    expect(screen.getByText('NDAs')).toBeInTheDocument()
  })

  it('highlights selected folder', () => {
    render(
      <DocumentFolders
        folders={mockFolders}
        selectedFolderId="f1"
        onSelectFolder={vi.fn()}
        onCreateFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
      />
    )

    const contractsItem = screen.getByText('Contracts').closest('.document-folders__item')
    expect(contractsItem?.className).toContain('document-folders__item--selected')
  })

  it('calls onSelectFolder when folder is clicked', async () => {
    const user = userEvent.setup()
    const onSelectFolder = vi.fn()

    render(
      <DocumentFolders
        folders={mockFolders}
        selectedFolderId={null}
        onSelectFolder={onSelectFolder}
        onCreateFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
      />
    )

    await user.click(screen.getByText('Contracts'))
    expect(onSelectFolder).toHaveBeenCalledWith('f1')
  })

  it('calls onSelectFolder with null when All Documents is clicked', async () => {
    const user = userEvent.setup()
    const onSelectFolder = vi.fn()

    render(
      <DocumentFolders
        folders={mockFolders}
        selectedFolderId="f1"
        onSelectFolder={onSelectFolder}
        onCreateFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
      />
    )

    await user.click(screen.getByText('All Documents'))
    expect(onSelectFolder).toHaveBeenCalledWith(null)
  })

  it('shows new folder form when New Folder is clicked', async () => {
    const user = userEvent.setup()

    render(
      <DocumentFolders
        folders={[]}
        selectedFolderId={null}
        onSelectFolder={vi.fn()}
        onCreateFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
      />
    )

    await user.click(screen.getByText('+ New Folder'))
    expect(screen.getByLabelText('New folder name')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  it('calls onCreateFolder when form is submitted', async () => {
    const user = userEvent.setup()
    const onCreateFolder = vi.fn()

    render(
      <DocumentFolders
        folders={[]}
        selectedFolderId={null}
        onSelectFolder={vi.fn()}
        onCreateFolder={onCreateFolder}
        onDeleteFolder={vi.fn()}
      />
    )

    await user.click(screen.getByText('+ New Folder'))
    await user.type(screen.getByLabelText('New folder name'), 'New Folder')
    await user.click(screen.getByText('Create'))
    expect(onCreateFolder).toHaveBeenCalledWith('New Folder', '#4F46E5')
  })

  it('calls onDeleteFolder when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDeleteFolder = vi.fn()

    render(
      <DocumentFolders
        folders={mockFolders}
        selectedFolderId={null}
        onSelectFolder={vi.fn()}
        onCreateFolder={vi.fn()}
        onDeleteFolder={onDeleteFolder}
      />
    )

    await user.click(screen.getByLabelText('Delete folder Contracts'))
    expect(onDeleteFolder).toHaveBeenCalledWith('f1')
  })
})
