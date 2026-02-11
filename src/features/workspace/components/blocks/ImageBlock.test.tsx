import { render, screen } from '@testing-library/react'
import ImageBlock from './ImageBlock'
import type { BlockComponentProps } from './types'

vi.mock('../EditableContent/EditableContent', () => ({
  default: ({ content, placeholder }: { content: string; placeholder?: string }) => (
    <div data-testid="editable-content" data-placeholder={placeholder}>
      {content}
    </div>
  ),
}))

vi.mock('lucide-react', () => ({
  ImageIcon: ({ size }: { size: number }) => <svg data-testid="image-icon" data-size={size} />,
}))

function makeProps(overrides: Partial<BlockComponentProps> = {}): BlockComponentProps {
  return {
    block: {
      id: 'b1',
      type: 'image',
      content: '',
      marks: [],
      children: [],
      properties: {},
    },
    onContentChange: vi.fn(),
    onMarksChange: vi.fn(),
    onEnter: vi.fn(),
    onBackspace: vi.fn(),
    onArrowUp: vi.fn(),
    onArrowDown: vi.fn(),
    onSlash: vi.fn(),
    onSelectionChange: vi.fn(),
    onFormatShortcut: vi.fn(),
    ...overrides,
  }
}

describe('ImageBlock', () => {
  it('renders placeholder when no imageUrl is set', () => {
    render(<ImageBlock {...makeProps()} />)
    expect(screen.getByText('Click to add an image')).toBeInTheDocument()
  })

  it('renders placeholder as a button', () => {
    render(<ImageBlock {...makeProps()} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders image when imageUrl is set', () => {
    render(
      <ImageBlock
        {...makeProps({
          block: {
            id: 'b1',
            type: 'image',
            content: '',
            marks: [],
            children: [],
            properties: { imageUrl: 'https://example.com/img.png', caption: 'A photo' },
          },
        })}
      />
    )
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/img.png')
    expect(img).toHaveAttribute('alt', 'A photo')
  })

  it('renders caption editable when image exists', () => {
    render(
      <ImageBlock
        {...makeProps({
          block: {
            id: 'b1',
            type: 'image',
            content: '',
            marks: [],
            children: [],
            properties: { imageUrl: 'https://example.com/img.png' },
          },
        })}
      />
    )
    expect(screen.getByTestId('editable-content')).toBeInTheDocument()
  })

  it('has correct wrapper class for image view', () => {
    const { container } = render(
      <ImageBlock
        {...makeProps({
          block: {
            id: 'b1',
            type: 'image',
            content: '',
            marks: [],
            children: [],
            properties: { imageUrl: 'https://example.com/img.png' },
          },
        })}
      />
    )
    expect(container.querySelector('.block-image')).toBeInTheDocument()
    expect(container.querySelector('.block-image__img')).toBeInTheDocument()
  })

  it('renders hidden file input in placeholder state', () => {
    const { container } = render(<ImageBlock {...makeProps()} />)
    const input = container.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('accept', 'image/*')
  })
})
