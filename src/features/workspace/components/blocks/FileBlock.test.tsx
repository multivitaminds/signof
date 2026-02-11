import { render, screen } from '@testing-library/react'
import FileBlock from './FileBlock'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

describe('FileBlock', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      blocks: {
        'file-1': {
          id: 'file-1',
          type: 'file',
          content: '',
          marks: [],
          children: [],
          properties: {},
        },
      },
    })
  })

  it('renders upload placeholder when no fileName is set', () => {
    render(
      <FileBlock
        block={{ id: 'file-1', type: 'file', content: '', marks: [], children: [], properties: {} }}
      />
    )
    expect(screen.getByText('Click to upload a file')).toBeInTheDocument()
  })

  it('renders upload placeholder as a button', () => {
    render(
      <FileBlock
        block={{ id: 'file-1', type: 'file', content: '', marks: [], children: [], properties: {} }}
      />
    )
    expect(screen.getByRole('button', { name: 'Upload a file' })).toBeInTheDocument()
  })

  it('renders file card when fileName is set', () => {
    render(
      <FileBlock
        block={{ id: 'file-1', type: 'file', content: '', marks: [], children: [], properties: { fileName: 'report.pdf' } }}
      />
    )
    expect(screen.getByText('report.pdf')).toBeInTheDocument()
  })

  it('renders download link when fileDataUrl is set', () => {
    render(
      <FileBlock
        block={{
          id: 'file-1',
          type: 'file',
          content: '',
          marks: [],
          children: [],
          properties: { fileName: 'report.pdf', fileDataUrl: 'data:application/pdf;base64,abc' },
        }}
      />
    )
    const link = screen.getByText('Download')
    expect(link).toHaveAttribute('href', 'data:application/pdf;base64,abc')
    expect(link).toHaveAttribute('download', 'report.pdf')
  })

  it('has correct aria-label on download link', () => {
    render(
      <FileBlock
        block={{
          id: 'file-1',
          type: 'file',
          content: '',
          marks: [],
          children: [],
          properties: { fileName: 'report.pdf', fileDataUrl: 'data:abc' },
        }}
      />
    )
    expect(screen.getByLabelText('Download report.pdf')).toBeInTheDocument()
  })

  it('does not render download link when no fileDataUrl', () => {
    render(
      <FileBlock
        block={{ id: 'file-1', type: 'file', content: '', marks: [], children: [], properties: { fileName: 'report.pdf' } }}
      />
    )
    expect(screen.queryByText('Download')).not.toBeInTheDocument()
  })

  it('renders hidden file input in placeholder state', () => {
    const { container } = render(
      <FileBlock
        block={{ id: 'file-1', type: 'file', content: '', marks: [], children: [], properties: {} }}
      />
    )
    const input = container.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
  })

  it('renders file icon in card state', () => {
    const { container } = render(
      <FileBlock
        block={{ id: 'file-1', type: 'file', content: '', marks: [], children: [], properties: { fileName: 'doc.txt' } }}
      />
    )
    expect(container.querySelector('.block-file__card')).toBeInTheDocument()
  })
})
