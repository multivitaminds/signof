import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmbedBlock from './EmbedBlock'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

describe('EmbedBlock', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      blocks: {
        'embed-1': {
          id: 'embed-1',
          type: 'embed',
          content: '',
          marks: [],
          children: [],
          properties: {},
        },
      },
    })
  })

  it('renders URL input form when no embedUrl is set', () => {
    render(
      <EmbedBlock
        block={{ id: 'embed-1', type: 'embed', content: '', marks: [], children: [], properties: {} }}
      />
    )
    expect(screen.getByLabelText('Embed URL')).toBeInTheDocument()
    expect(screen.getByText('Embed')).toBeInTheDocument()
  })

  it('renders iframe when embedUrl is set', () => {
    render(
      <EmbedBlock
        block={{ id: 'embed-1', type: 'embed', content: '', marks: [], children: [], properties: { embedUrl: 'https://example.com/video' } }}
      />
    )
    const iframe = screen.getByTitle('Embedded content')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', 'https://example.com/video')
  })

  it('iframe has proper sandbox and loading attributes', () => {
    render(
      <EmbedBlock
        block={{ id: 'embed-1', type: 'embed', content: '', marks: [], children: [], properties: { embedUrl: 'https://example.com' } }}
      />
    )
    const iframe = screen.getByTitle('Embedded content')
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups')
    expect(iframe).toHaveAttribute('loading', 'lazy')
  })

  it('disables Embed button when input is empty', () => {
    render(
      <EmbedBlock
        block={{ id: 'embed-1', type: 'embed', content: '', marks: [], children: [], properties: {} }}
      />
    )
    expect(screen.getByText('Embed')).toBeDisabled()
  })

  it('enables Embed button when input has value', async () => {
    const user = userEvent.setup()
    render(
      <EmbedBlock
        block={{ id: 'embed-1', type: 'embed', content: '', marks: [], children: [], properties: {} }}
      />
    )
    await user.type(screen.getByLabelText('Embed URL'), 'https://youtube.com/watch?v=123')
    expect(screen.getByText('Embed')).not.toBeDisabled()
  })

  it('updates store on form submit', async () => {
    const user = userEvent.setup()
    render(
      <EmbedBlock
        block={{ id: 'embed-1', type: 'embed', content: '', marks: [], children: [], properties: {} }}
      />
    )
    await user.type(screen.getByLabelText('Embed URL'), 'https://youtube.com/watch?v=abc')
    await user.click(screen.getByText('Embed'))

    const updatedBlock = useWorkspaceStore.getState().blocks['embed-1']
    expect(updatedBlock?.properties.embedUrl).toBe('https://youtube.com/watch?v=abc')
  })
})
