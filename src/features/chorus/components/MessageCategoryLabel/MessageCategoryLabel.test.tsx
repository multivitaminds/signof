import { render, screen } from '@testing-library/react'
import MessageCategoryLabel from './MessageCategoryLabel'
import { MessageCategory } from '../../lib/messageCategorizer'

describe('MessageCategoryLabel', () => {
  it('renders Question label', () => {
    render(<MessageCategoryLabel category={MessageCategory.Question} />)
    expect(screen.getByText('Question')).toBeInTheDocument()
  })

  it('renders Decision label', () => {
    render(<MessageCategoryLabel category={MessageCategory.Decision} />)
    expect(screen.getByText('Decision')).toBeInTheDocument()
  })

  it('renders Action Item label', () => {
    render(<MessageCategoryLabel category={MessageCategory.ActionItem} />)
    expect(screen.getByText('Action Item')).toBeInTheDocument()
  })

  it('renders FYI label', () => {
    render(<MessageCategoryLabel category={MessageCategory.FYI} />)
    expect(screen.getByText('FYI')).toBeInTheDocument()
  })

  it('renders Blocker label', () => {
    render(<MessageCategoryLabel category={MessageCategory.Blocker} />)
    expect(screen.getByText('Blocker')).toBeInTheDocument()
  })

  it('has accessible aria-label', () => {
    render(<MessageCategoryLabel category={MessageCategory.Question} />)
    expect(screen.getByLabelText('Category: Question')).toBeInTheDocument()
  })

  it('applies category color via CSS variable', () => {
    const { container } = render(<MessageCategoryLabel category={MessageCategory.Blocker} />)
    const el = container.querySelector('.chorus-category-label')
    expect(el).toHaveStyle({ '--category-color': '#DC2626' })
  })
})
