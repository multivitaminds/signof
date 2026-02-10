import { render, screen } from '@testing-library/react'
import PageTransition from './PageTransition'

describe('PageTransition', () => {
  it('renders children', () => {
    render(
      <PageTransition>
        <p>Page content</p>
      </PageTransition>
    )
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('wraps children in page-transition div', () => {
    const { container } = render(
      <PageTransition>
        <span>Inner</span>
      </PageTransition>
    )
    expect(container.querySelector('.page-transition')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
    render(
      <PageTransition>
        <p>First</p>
        <p>Second</p>
      </PageTransition>
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
