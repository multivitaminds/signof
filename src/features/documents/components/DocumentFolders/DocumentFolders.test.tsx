import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentFolders from './DocumentFolders'
import type { Folder } from '../../../../types'

const mockFolders: Folder[] = [
  { id: 'f1', name: 'Contracts', parentId: null, color: '#4F46E5' },
  { id: 'f2', name: 'NDAs', parentId: null, color: '#059669' },
]

const nestedFolders: Folder[] = [
  { id: 'f1', name: 'Contracts', parentId: null, color: '#4F46E5' },
  { id: 'f2', name: 'NDAs', parentId: null, color: '#059669' },
  { id: 'f3', name: 'Sales Contracts', parentId: 'f1', color: '#D97706' },
  { id: 'f4', name: 'HR Contracts', parentId: 'f1', color: '#DC6262' },
  { id: 'f5', name: 'Q1 Sales', parentId: 'f3', color: '#7C3AED' },
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

  it('renders root folders', () => {
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

  it('calls onCreateFolder with parentId when form is submitted', async () => {
    const user = userEvent.setup()
    const onCreateFolder = vi.fn()

    render(
      <DocumentFolders
        folders={[]}
        selectedFolderId="f1"
        onSelectFolder={vi.fn()}
        onCreateFolder={onCreateFolder}
        onDeleteFolder={vi.fn()}
      />
    )

    await user.click(screen.getByText('+ New Folder'))
    await user.type(screen.getByLabelText('New folder name'), 'New Folder')
    await user.click(screen.getByText('Create'))
    expect(onCreateFolder).toHaveBeenCalledWith('New Folder', '#4F46E5', 'f1')
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

  // ─── Nested tree tests ──────────────────────────────────

  it('does not show child folders when parent is collapsed', () => {
    render(
      <DocumentFolders
        folders={nestedFolders}
        selectedFolderId={null}
        onSelectFolder={vi.fn()}
        onCreateFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
      />
    )

    // Root folders are visible
    expect(screen.getByText('Contracts')).toBeInTheDocument()
    expect(screen.getByText('NDAs')).toBeInTheDocument()
    // Child folders are not visible (collapsed)
    expect(screen.queryByText('Sales Contracts')).not.toBeInTheDocument()
    expect(screen.queryByText('HR Contracts')).not.toBeInTheDocument()
  })

  it('expands child folders when chevron is clicked', async () => {
    const user = userEvent.setup()

    render(
      <DocumentFolders
        folders={nestedFolders}
        selectedFolderId={null}
        onSelectFolder={vi.fn()}
        onCreateFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
      />
    )

    // Click expand on Contracts
    await user.click(screen.getByLabelText('Expand Contracts'))

    // Child folders are now visible
    expect(screen.getByText('Sales Contracts')).toBeInTheDocument()
    expect(screen.getByText('HR Contracts')).toBeInTheDocument()
    // Grandchild still hidden
    expect(screen.queryByText('Q1 Sales')).not.toBeInTheDocument()
  })

  it('collapses child folders when chevron is clicked again', async () => {
    const user = userEvent.setup()

    render(
      <DocumentFolders
        folders={nestedFolders}
        selectedFolderId={null}
        onSelectFolder={vi.fn()}
        onCreateFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
      />
    )

    // Expand
    await user.click(screen.getByLabelText('Expand Contracts'))
    expect(screen.getByText('Sales Contracts')).toBeInTheDocument()

    // Collapse
    await user.click(screen.getByLabelText('Collapse Contracts'))
    expect(screen.queryByText('Sales Contracts')).not.toBeInTheDocument()
  })

  it('shows document counts when provided', () => {
    render(
      <DocumentFolders
        folders={mockFolders}
        selectedFolderId={null}
        onSelectFolder={vi.fn()}
        onCreateFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
        documentCounts={{ f1: 5, f2: 3 }}
      />
    )

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows expand chevron only for folders with children', () => {
    render(
      <DocumentFolders
        folders={nestedFolders}
        selectedFolderId={null}
        onSelectFolder={vi.fn()}
        onCreateFolder={vi.fn()}
        onDeleteFolder={vi.fn()}
      />
    )

    // Contracts has children, so it should have an expand button
    expect(screen.getByLabelText('Expand Contracts')).toBeInTheDocument()
    // NDAs has no children, so no expand button
    expect(screen.queryByLabelText('Expand NDAs')).not.toBeInTheDocument()
  })

  it('creates folder as child of selected folder', async () => {
    const user = userEvent.setup()
    const onCreateFolder = vi.fn()

    render(
      <DocumentFolders
        folders={mockFolders}
        selectedFolderId="f2"
        onSelectFolder={vi.fn()}
        onCreateFolder={onCreateFolder}
        onDeleteFolder={vi.fn()}
      />
    )

    await user.click(screen.getByText('+ New Folder'))
    await user.type(screen.getByLabelText('New folder name'), 'Subfolder')
    await user.click(screen.getByText('Create'))
    expect(onCreateFolder).toHaveBeenCalledWith('Subfolder', '#4F46E5', 'f2')
  })

  it('creates folder at root when no folder is selected', async () => {
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
    await user.type(screen.getByLabelText('New folder name'), 'Root Folder')
    await user.click(screen.getByText('Create'))
    expect(onCreateFolder).toHaveBeenCalledWith('Root Folder', '#4F46E5', null)
  })
})
